# Code Organization

> Low-level Django app structure and code organization

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../)

- **[Module Boundaries](../01-system-design/modules/module-boundaries.md)** - High-level module organization
- **[Module Interactions](../01-system-design/modules/module-interactions.md)** - How modules interact
- **[Architecture Summary](../00-overview/architecture-summary.md#2-modularity)** - Modularity approach

This document provides **Django-specific code organization** (app structure, service layer, utilities).

---

## Overview

DFMS backend is organized as a modular monolith using Django apps. Each app represents a business domain module with clear boundaries, enabling future extraction to microservices.

---

## Django Apps Structure

### App Organization

```
dfms_backend/
├── config/                    # Django project settings
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
│
├── apps/
│   ├── core/                  # Core functionality
│   │   ├── models.py          # Core models (Role, Permission)
│   │   ├── serializers.py     # Core serializers
│   │   ├── views.py           # Core views
│   │   ├── permissions.py     # Permission classes
│   │   ├── exceptions.py      # Custom exceptions
│   │   ├── middleware.py      # Custom middleware
│   │   └── utils.py           # Core utilities
│   │
│   ├── tenants/               # Multi-tenancy
│   │   ├── models.py          # Tenant model
│   │   ├── middleware.py      # Tenant middleware
│   │   └── utils.py           # Tenant utilities
│   │
│   ├── users/                 # User management
│   │   ├── models.py          # User model
│   │   ├── serializers.py     # User serializers
│   │   ├── views.py           # User views
│   │   └── services.py        # User services
│   │
│   ├── master_data/           # Master data management
│   │   ├── models.py          # POI, Product models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── services.py
│   │
│   ├── products/              # Product requisition
│   │   ├── models.py          # ProductRequisition model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── services.py
│   │
│   ├── transport/            # Transport management
│   │   ├── models.py          # TR, TO, Trip models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   └── permissions.py
│   │
│   ├── fleet/                # Fleet management
│   │   ├── models.py          # Vehicle, Driver models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py
│   │   └── permissions.py
│   │
│   ├── vendors/              # Vendor management
│   │   ├── models.py          # Vendor model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── services.py
│   │
│   ├── operations/           # Operations management
│   │   ├── gate/             # Gate operations
│   │   ├── scaling/           # Scaling/weighing
│   │   ├── command_center/   # Command center
│   │   └── loading/          # Loading/unloading
│   │
│   ├── quality/              # Quality control
│   │   ├── models.py          # QC Inspection model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── services.py
│   │
│   ├── tracking/             # GPS tracking
│   │   ├── models.py          # Tracking data
│   │   ├── services.py        # GPS integration
│   │   └── tasks.py           # Background tasks
│   │
│   ├── costing/              # Trip costing
│   │   ├── models.py          # TripCost model
│   │   ├── serializers.py
│   │   └── services.py
│   │
│   └── notifications/        # Notifications
│       ├── services.py        # Email/SMS services
│       └── tasks.py           # Notification tasks
│
├── tests/                    # Test suite
│   ├── conftest.py           # Shared fixtures
│   ├── test_models.py
│   ├── test_views.py
│   └── test_services.py
│
└── manage.py
```

---

## App Structure Pattern

### Standard App Structure

Each Django app follows this structure:

```
apps/<app_name>/
├── __init__.py
├── admin.py                  # Django admin configuration
├── apps.py                   # App configuration
├── models.py                  # Database models
├── serializers.py             # DRF serializers
├── views.py                   # ViewSets and views
├── urls.py                    # URL routing
├── services.py                # Business logic services
├── permissions.py             # Permission classes (if app-specific)
├── exceptions.py              # App-specific exceptions (if any)
├── managers.py                # Custom model managers (if any)
├── signals.py                 # Signal handlers (if any)
├── tasks.py                   # Celery tasks (if any)
├── utils.py                   # App-specific utilities
└── migrations/                # Database migrations
    └── __init__.py
```

---

## Service Layer Pattern

### Service Classes

Business logic is separated into service classes:

```python
# apps/transport/services.py
from django.db import transaction
from apps.transport.models import TransportOrder, Trip
from apps.transport.exceptions import VehicleNotAvailableError

class TransportOrderService:
    """Service for transport order operations"""
    
    @staticmethod
    @transaction.atomic
    def assign_vehicle(transport_order_id, vehicle_id, driver_id=None):
        """Assign vehicle to transport order"""
        transport_order = TransportOrder.objects.get(id=transport_order_id)
        vehicle = Vehicle.objects.get(id=vehicle_id)
        
        # Business logic validation
        if vehicle.status != 'available':
            raise VehicleNotAvailableError(
                f"Vehicle {vehicle.registration_number} is not available"
            )
        
        # Update transport order
        transport_order.vehicle = vehicle
        if driver_id:
            transport_order.driver_id = driver_id
        transport_order.status = 'assigned'
        transport_order.assigned_at = timezone.now()
        transport_order.save()
        
        # Create trip
        trip = Trip.objects.create(
            tenant=transport_order.tenant,
            transport_order=transport_order,
            vehicle=vehicle,
            driver=transport_order.driver,
            origin_poi=transport_order.transport_request.origin_poi,
            destination_poi=transport_order.transport_request.destination_poi,
            status='scheduled',
            scheduled_start=transport_order.assigned_at,
            scheduled_end=transport_order.transport_request.required_date,
        )
        
        # Emit event
        from apps.core.events import publish_event
        publish_event('transport_order.assigned', {
            'transport_order_id': str(transport_order.id),
            'vehicle_id': str(vehicle.id),
            'trip_id': str(trip.id),
        })
        
        return transport_order
    
    @staticmethod
    def get_pending_orders(tenant_id):
        """Get pending transport orders"""
        return TransportOrder.objects.filter(
            tenant_id=tenant_id,
            status='pending',
            vehicle__isnull=True
        )
```

---

## Module Boundaries

### Clear Module Boundaries

Each app maintains clear boundaries:

```python
# apps/transport/services.py
# ✅ GOOD: Transport module uses Fleet module via models
from apps.fleet.models import Vehicle, Driver

class TransportOrderService:
    def assign_vehicle(self, order_id, vehicle_id):
        vehicle = Vehicle.objects.get(id=vehicle_id)  # Direct model access
        # ...

# ❌ BAD: Don't import services from other modules
# from apps.fleet.services import VehicleService  # Avoid service-to-service calls
```

### Inter-Module Communication

Modules communicate via:
1. **Direct Model Access** (for simple reads)
2. **Events** (for async operations)
3. **API Calls** (for complex operations, Phase 2)

---

## Utility Functions

### Core Utilities

```python
# apps/core/utils.py
from django.utils import timezone
from datetime import timedelta

def generate_unique_code(prefix, model_class):
    """Generate unique code for model"""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = uuid.uuid4().hex[:8].upper()
    code = f"{prefix}-{date_str}-{random_str}"
    
    # Ensure uniqueness
    while model_class.objects.filter(code=code).exists():
        random_str = uuid.uuid4().hex[:8].upper()
        code = f"{prefix}-{date_str}-{random_str}"
    
    return code


def get_tenant_from_request(request):
    """Get tenant from request"""
    if hasattr(request, 'tenant'):
        return request.tenant
    if request.user.is_authenticated:
        return request.user.tenant
    return None
```

### App-Specific Utilities

```python
# apps/transport/utils.py
def calculate_estimated_duration(origin_poi, destination_poi):
    """Calculate estimated trip duration"""
    # Implementation using maps API
    pass


def validate_route(origin_poi, destination_poi):
    """Validate route feasibility"""
    # Implementation
    pass
```

---

## Constants and Configuration

### App Constants

```python
# apps/transport/constants.py
class TransportOrderStatus:
    PENDING = 'pending'
    ASSIGNED = 'assigned'
    IN_TRANSIT = 'in_transit'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    
    CHOICES = [
        (PENDING, 'Pending'),
        (ASSIGNED, 'Assigned'),
        (IN_TRANSIT, 'In Transit'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]


class VehicleType:
    COVERED_VAN = 'covered_van'
    OPEN_TRUCK = 'open_truck'
    CONTAINER = 'container'
    
    CHOICES = [
        (COVERED_VAN, 'Covered Van'),
        (OPEN_TRUCK, 'Open Truck'),
        (CONTAINER, 'Container'),
    ]
```

---

## URL Organization

### URL Structure

```python
# config/urls.py
urlpatterns = [
    path('api/v1/', include('apps.core.urls')),
    path('api/v1/transport/', include('apps.transport.urls')),
    path('api/v1/fleet/', include('apps.fleet.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    # ...
]

# apps/transport/urls.py
from rest_framework.routers import DefaultRouter
from apps.transport.views import TransportOrderViewSet, TransportRequestViewSet

router = DefaultRouter()
router.register(r'transport-orders', TransportOrderViewSet, basename='transport-order')
router.register(r'transport-requests', TransportRequestViewSet, basename='transport-request')

urlpatterns = router.urls
```

---

## Settings Organization

### Settings Structure

```python
# config/settings/base.py
# Base settings

# config/settings/development.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# config/settings/production.py
from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')
```

---

## Testing Organization

### Test Structure

```
tests/
├── conftest.py                # Shared fixtures
├── test_models.py            # Model tests
├── test_serializers.py      # Serializer tests
├── test_views.py             # View tests
├── test_services.py          # Service tests
└── integration/              # Integration tests
    ├── test_api_flows.py
    └── test_workflows.py
```

### Test Fixtures

```python
# tests/conftest.py
import pytest
from apps.users.models import User
from apps.tenants.models import Tenant

@pytest.fixture
def tenant(db):
    """Create test tenant"""
    return Tenant.objects.create(
        schema_name='test_tenant',
        name='Test Tenant'
    )

@pytest.fixture
def user(tenant):
    """Create test user"""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        tenant=tenant
    )
```

---

## Code Organization Best Practices

### 1. Keep Apps Focused
- Each app represents one business domain
- Avoid circular dependencies
- Clear module boundaries

### 2. Use Service Layer
- Business logic in services, not views
- Services are testable
- Services can be reused

### 3. Separate Concerns
- Models: Data structure
- Serializers: Data validation/serialization
- Views: Request/response handling
- Services: Business logic
- Tasks: Background jobs

### 4. Follow Django Conventions
- Use Django's app structure
- Follow naming conventions
- Use Django's built-in features

### 5. Document Module Boundaries
- Document what each app does
- Document dependencies
- Document interfaces

---

## Related Documentation

- **[System Architecture](./django-system-architecture.md)** - Overall Django architecture
- **[Module Boundaries](../01-system-design/modules/module-boundaries.md)** - High-level module organization

---

**Last Updated**: 2026-02-13

