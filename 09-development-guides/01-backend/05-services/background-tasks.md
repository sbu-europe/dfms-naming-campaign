# Background Tasks Implementation

> Low-level Celery background tasks implementation

## 📖 High-Level Context

> **Source of Truth**: [`05-architecture/`](../../../05-architecture/)

- **[Workflows](../../../05-architecture/02-workflows/)** - High-level workflows
- **[Event-Driven Architecture](../../../05-architecture/03-decisions/adr-002-event-driven-communication.md)** - Event-driven approach
- **[Testing Approach](../../../05-architecture/04-implementation/strategies/testing-approach.md)** - Testing strategy

This document provides **Celery-specific background task implementation** (task definitions, scheduling, monitoring).

---

## Overview

DFMS uses Celery with Redis as the message broker for asynchronous task processing. Background tasks handle heavy operations, scheduled jobs, and event-driven processing.

---

## Celery Configuration

### Settings Configuration

```python
# settings.py
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('nourish_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Celery Configuration
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

CELERY_TASK_ROUTES = {
    'apps.transport.tasks.*': {'queue': 'transport'},
    'apps.notifications.tasks.*': {'queue': 'notifications'},
    'apps.costing.tasks.*': {'queue': 'costing'},
}

CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_DEFAULT_EXCHANGE = 'tasks'
CELERY_TASK_DEFAULT_ROUTING_KEY = 'default'
```

### Celery App Initialization

```python
# config/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('nourish_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

---

## Task Definitions

### Simple Task

```python
# apps/notifications/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_email_notification(recipient_email, subject, message):
    """Send email notification"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        return {'status': 'success', 'recipient': recipient_email}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}
```

### Task with Retry

```python
# apps/transport/tasks.py
from celery import shared_task
from celery.exceptions import Retry
from apps.transport.models import TransportOrder
from apps.core.events import publish_event

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_transport_order_assignment(self, transport_order_id, vehicle_id):
    """Process transport order vehicle assignment"""
    try:
        transport_order = TransportOrder.objects.get(id=transport_order_id)
        vehicle = Vehicle.objects.get(id=vehicle_id)
        
        # Business logic
        transport_order.vehicle = vehicle
        transport_order.status = 'assigned'
        transport_order.save()
        
        # Publish event
        publish_event('transport_order.assigned', {
            'transport_order_id': str(transport_order.id),
            'vehicle_id': str(vehicle.id),
        })
        
        return {'status': 'success', 'transport_order_id': str(transport_order.id)}
        
    except TransportOrder.DoesNotExist:
        return {'status': 'error', 'error': 'Transport order not found'}
    except Exception as e:
        # Retry on failure
        raise self.retry(exc=e, countdown=60)
```

### Task with Priority

```python
# apps/notifications/tasks.py
from celery import shared_task

@shared_task(priority=9)  # High priority (0-9, 9 is highest)
def send_urgent_notification(user_id, message):
    """Send urgent notification"""
    # Implementation
    pass

@shared_task(priority=5)  # Medium priority
def send_regular_notification(user_id, message):
    """Send regular notification"""
    # Implementation
    pass

@shared_task(priority=1)  # Low priority
def send_bulk_notification(user_ids, message):
    """Send bulk notification"""
    # Implementation
    pass
```

---

## Periodic Tasks (Celery Beat)

### Scheduled Tasks

```python
# config/celery.py
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Daily report generation
    'generate-daily-reports': {
        'task': 'apps.reports.tasks.generate_daily_reports',
        'schedule': crontab(hour=0, minute=0),  # Midnight
    },
    
    # Sync GPS data
    'sync-gps-data': {
        'task': 'apps.tracking.tasks.sync_gps_data',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    
    # Cleanup old data
    'cleanup-old-data': {
        'task': 'apps.core.tasks.cleanup_old_data',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
    
    # Send daily summary emails
    'send-daily-summary': {
        'task': 'apps.notifications.tasks.send_daily_summary',
        'schedule': crontab(hour=8, minute=0),  # 8 AM daily
    },
}
```

### Periodic Task Implementation

```python
# apps/reports/tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

@shared_task
def generate_daily_reports():
    """Generate daily reports for all tenants"""
    from apps.tenants.models import Tenant
    
    tenants = Tenant.objects.filter(is_active=True)
    
    for tenant in tenants:
        # Set tenant context
        from django.db import connection
        connection.set_schema_to(tenant.schema_name)
        
        # Generate report
        generate_tenant_daily_report(tenant)
    
    return {'status': 'success', 'tenants_processed': tenants.count()}
```

---

## Task Examples by Module

### Transport Module Tasks

```python
# apps/transport/tasks.py
from celery import shared_task

@shared_task
def create_trip_from_transport_order(transport_order_id):
    """Create trip when transport order is assigned"""
    from apps.transport.models import TransportOrder, Trip
    
    transport_order = TransportOrder.objects.get(id=transport_order_id)
    
    trip = Trip.objects.create(
        tenant=transport_order.tenant,
        transport_order=transport_order,
        vehicle=transport_order.vehicle,
        driver=transport_order.driver,
        origin_poi=transport_order.transport_request.origin_poi,
        destination_poi=transport_order.transport_request.destination_poi,
        status='scheduled',
        scheduled_start=transport_order.assigned_at,
        scheduled_end=transport_order.transport_request.required_date,
    )
    
    return {'trip_id': str(trip.id)}


@shared_task
def update_trip_status_from_gps(trip_id, location_data):
    """Update trip status based on GPS data"""
    from apps.transport.models import Trip
    
    trip = Trip.objects.get(id=trip_id)
    
    # Update location
    trip.current_latitude = location_data['latitude']
    trip.current_longitude = location_data['longitude']
    
    # Check geofence and update status
    if trip.is_at_origin_geofence():
        trip.status = 'at_origin'
    elif trip.is_at_destination_geofence():
        trip.status = 'at_destination'
    
    trip.save()
    
    return {'status': 'updated'}
```

### Notification Module Tasks

```python
# apps/notifications/tasks.py
from celery import shared_task

@shared_task
def send_transport_order_notification(transport_order_id, notification_type):
    """Send notification for transport order events"""
    from apps.transport.models import TransportOrder
    from apps.users.models import User
    
    transport_order = TransportOrder.objects.get(id=transport_order_id)
    
    # Get recipients based on notification type
    if notification_type == 'assigned':
        recipients = [transport_order.driver.user.email]
    elif notification_type == 'completed':
        recipients = transport_order.get_notification_recipients()
    
    # Send notifications
    for recipient_email in recipients:
        send_email_notification.delay(
            recipient_email=recipient_email,
            subject=f"Transport Order {transport_order.to_number} - {notification_type}",
            message=f"Transport order {transport_order.to_number} has been {notification_type}",
        )
    
    return {'notifications_sent': len(recipients)}
```

### Costing Module Tasks

```python
# apps/costing/tasks.py
from celery import shared_task

@shared_task
def calculate_trip_cost(trip_id):
    """Calculate cost for completed trip"""
    from apps.transport.models import Trip
    from apps.costing.models import TripCost
    
    trip = Trip.objects.get(id=trip_id)
    
    # Calculate costs
    distance_km = trip.calculate_distance()
    fuel_cost = calculate_fuel_cost(distance_km, trip.vehicle)
    driver_cost = calculate_driver_cost(trip.driver, trip.duration)
    toll_cost = calculate_toll_cost(trip.route)
    
    total_cost = fuel_cost + driver_cost + toll_cost
    
    # Create cost record
    trip_cost = TripCost.objects.create(
        trip=trip,
        distance_km=distance_km,
        fuel_cost=fuel_cost,
        driver_cost=driver_cost,
        toll_cost=toll_cost,
        total_cost=total_cost,
    )
    
    return {'trip_cost_id': str(trip_cost.id), 'total_cost': float(total_cost)}
```

---

## Task Monitoring

### Task Status Tracking

```python
# apps/core/utils.py
from celery.result import AsyncResult

def get_task_status(task_id):
    """Get status of Celery task"""
    result = AsyncResult(task_id)
    
    return {
        'task_id': task_id,
        'status': result.status,
        'result': result.result if result.ready() else None,
        'error': str(result.info) if result.failed() else None,
    }
```

### Task Logging

```python
# apps/transport/tasks.py
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_transport_order(transport_order_id):
    """Process transport order with logging"""
    logger.info(f"Processing transport order {transport_order_id}")
    
    try:
        # Process order
        result = process_order(transport_order_id)
        logger.info(f"Successfully processed transport order {transport_order_id}")
        return result
    except Exception as e:
        logger.error(f"Error processing transport order {transport_order_id}: {str(e)}")
        raise
```

---

## Task Testing

### Testing Tasks

```python
# tests/test_tasks.py
import pytest
from apps.transport.tasks import create_trip_from_transport_order
from apps.transport.models import TransportOrder

@pytest.mark.django_db
class TestTasks:
    def test_create_trip_task(self):
        """Test trip creation task"""
        transport_order = TransportOrder.objects.create(...)
        
        result = create_trip_from_transport_order.delay(str(transport_order.id))
        
        assert result.successful()
        assert result.result['trip_id'] is not None
```

---

## Related Documentation

- **[Event-Driven Communication](../../../05-architecture/03-decisions/adr-002-event-driven-communication.md)** - High-level event approach
- **[Workflows](../../../05-architecture/02-workflows/)** - Technical workflows

---

**Last Updated**: 2026-02-13

