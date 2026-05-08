# External Integrations Implementation

> Low-level external service integration implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Integration Contracts](../../../../../06-contracts/04-integration/)** - External integration contracts
- **[External Systems](../../../04-architecture/01-architecture/integration/external-systems.md)** - High-level integration overview

This document provides **Django-specific integration implementation** (GPS, ERP, SMS, Maps, Payment).

---

## Overview

DFMS integrates with external systems for GPS tracking, ERP synchronization, SMS gateway, maps service, and payment processing. Integrations are implemented as services with retry logic and error handling.

---

## GPS/VTS Integration — GPSWOX + Concox GT06-ND

> **Provider**: GPSWOX (https://www.gpswox.com/), hardware: Concox GT06-ND
> Confirmed in meeting: 16 March 2026.
> See: [`06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md`](../../../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md)
> API contract: [`06-contracts/04-integration/gps-vts-integration.yaml`](../../../../06-contracts/04-integration/gps-vts-integration.yaml)

### Required Django Settings

```python
# settings/base.py — values loaded from environment variables
GPSWOX_API_KEY      = env('GPSWOX_API_KEY')    # Pending — Antu (Nourish) to obtain from GPSWOX
GPSWOX_BASE_URL     = env('GPSWOX_BASE_URL', default='http://206.189.141.206/api/v1')
GPSWOX_TIMEOUT      = int(env('GPSWOX_TIMEOUT', default='5'))        # seconds
GPSWOX_POLL_INTERVAL = int(env('GPSWOX_POLL_INTERVAL', default='30')) # seconds
```

> **Note**: `GPS_API_KEY` and `GPS_API_URL` (old generic keys) are replaced by the
> GPSWOX-specific settings above. Update `.env.example` and deployment configs accordingly.

### GPS Service

```python
# apps/tracking/services.py
import logging
import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

LOCATION_CACHE_PREFIX = 'vehicle_location:'
LOCATION_CACHE_TTL    = 30  # seconds — matches poll interval


class GPSService:
    """
    GPSWOX GPS/VTS integration service.

    Provider:  GPSWOX (https://www.gpswox.com/)
    Hardware:  Concox GT06-ND
    Dashboard: http://206.189.141.206

    Integration pattern: Celery periodic poll (every 30s) → Redis cache.
    Components never call this service directly — they read from Redis cache.

    Fallback: if GPSWOX API is unavailable, the Concox GT06-ND supports direct
    TCP/UDP data push to a custom receiver. Mahfuz (BS23) to confirm feasibility
    before implementing the fallback path.
    """

    def __init__(self):
        self.api_key  = settings.GPSWOX_API_KEY
        self.base_url = settings.GPSWOX_BASE_URL.rstrip('/')
        self.timeout  = settings.GPSWOX_TIMEOUT

    def _headers(self):
        return {'X-Api-Key': self.api_key}

    def get_vehicle_location(self, vehicle_id: str) -> dict | None:
        """
        Fetch current location for a single vehicle from GPSWOX.

        Returns a dict with confirmed map display fields:
          latitude, longitude, speed, overspeed, heading, timestamp, ignition_status

        Returns cached data on API failure (5s timeout).
        Returns None if no data is available (new vehicle, never seen).
        """
        cache_key = f'{LOCATION_CACHE_PREFIX}{vehicle_id}'

        try:
            response = requests.get(
                f'{self.base_url}/vehicles/{vehicle_id}/location',
                headers=self._headers(),
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()

            location = {
                'vehicle_id':      data.get('vehicle_id', vehicle_id),
                'latitude':        data['latitude'],
                'longitude':       data['longitude'],
                'speed':           data.get('speed'),           # km/h
                'overspeed':       data.get('overspeed'),       # bool — display only in Phase 1
                'heading':         data.get('heading'),         # degrees 0–359
                'timestamp':       data['timestamp'],
                'ignition_status': data.get('ignition_status'),
            }

            cache.set(cache_key, location, timeout=LOCATION_CACHE_TTL)
            return location

        except requests.Timeout:
            logger.warning('GPSWOX timeout for vehicle %s — returning cached location', vehicle_id)
            return cache.get(cache_key)

        except requests.HTTPError as e:
            logger.error('GPSWOX HTTP error for vehicle %s: %s', vehicle_id, e)
            return cache.get(cache_key)

        except requests.RequestException as e:
            logger.error('GPSWOX request error for vehicle %s: %s', vehicle_id, e)
            return cache.get(cache_key)

    def get_vehicle_location_history(
        self, vehicle_id: str, start_time, end_time
    ) -> list[dict]:
        """
        Fetch GPS breadcrumb trail for a vehicle over a time window.

        Used for:
        - Breadcrumb trail rendering on the Command Centre map
        - Actual distance calculation for trip costing

        Returns a list of GPSPoint dicts (lat, lng, speed, overspeed, heading, timestamp).
        """
        try:
            response = requests.get(
                f'{self.base_url}/vehicles/{vehicle_id}/location/history',
                headers=self._headers(),
                params={
                    'start_time': start_time.isoformat(),
                    'end_time':   end_time.isoformat(),
                },
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
            return data.get('route_points', [])

        except requests.RequestException as e:
            logger.error(
                'GPSWOX history error for vehicle %s (%s – %s): %s',
                vehicle_id, start_time, end_time, e,
            )
            return []

    def get_all_vehicle_locations(self) -> list[dict]:
        """
        Fetch latest location for all vehicles registered in GPSWOX.

        Used by the vehicle assignment optimisation feature (sort by distance
        from pickup POI). Availability and rate limits TBC once API credentials
        are confirmed.
        """
        try:
            response = requests.get(
                f'{self.base_url}/vehicles',
                headers=self._headers(),
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
            return data.get('vehicles', [])

        except requests.RequestException as e:
            logger.error('GPSWOX bulk vehicle list error: %s', e)
            return []
```

### Celery Polling Task

```python
# apps/tracking/tasks.py
from celery import shared_task
from django.core.cache import cache
from apps.tracking.services import GPSService
from apps.transport.models import Trip
import logging

logger = logging.getLogger(__name__)


@shared_task
def poll_active_vehicle_locations():
    """
    Periodic Celery task: poll GPSWOX every 30 seconds for all active trips.

    Fetches current location for each vehicle on an active trip and writes
    the result to Redis (TTL: 30s). The Command Centre dashboard reads from
    Redis — it never calls GPSWOX directly.

    Scheduled via Celery Beat (see CELERY_BEAT_SCHEDULE in settings).
    """
    gps = GPSService()

    active_trips = Trip.objects.filter(
        status__in=['assigned', 'gate_in', 'loading', 'loading_complete',
                    'scale_in', 'in_transit', 'gate_out', 'unloading', 'scale_out']
    ).select_related('vehicle')

    updated = 0
    for trip in active_trips:
        vehicle_id = trip.vehicle.gpswox_device_id  # GPSWOX device identifier
        if not vehicle_id:
            continue
        location = gps.get_vehicle_location(vehicle_id)
        if location:
            updated += 1

    logger.info('GPS poll complete: %d/%d vehicles updated', updated, active_trips.count())
    return {'updated': updated, 'total': active_trips.count()}
```

> **Vehicle model note**: Add `gpswox_device_id` field to the `Vehicle` model
> to store the identifier used in GPSWOX. This is the mapping between DFMS vehicle
> records and GPSWOX device registrations.

### Celery Beat Schedule

```python
# settings/base.py
CELERY_BEAT_SCHEDULE = {
    # ... other tasks ...
    'poll-gps-locations': {
        'task': 'apps.tracking.tasks.poll_active_vehicle_locations',
        'schedule': 30.0,  # seconds — matches GPSWOX_POLL_INTERVAL
    },
}
```

---

## ERP Integration

### ERP Service

```python
# apps/integrations/services.py
import requests
from django.conf import settings

class ERPService:
    """ERP integration service"""
    
    def __init__(self):
        self.api_url = settings.ERP_API_URL
        self.api_key = settings.ERP_API_KEY
        self.timeout = 30
    
    def sync_trip_cost(self, trip_cost):
        """Sync trip cost to ERP"""
        payload = {
            'trip_id': str(trip_cost.trip.id),
            'trip_number': trip_cost.trip.trip_number,
            'total_cost': float(trip_cost.total_cost),
            'fuel_cost': float(trip_cost.fuel_cost),
            'driver_cost': float(trip_cost.driver_cost),
            'toll_cost': float(trip_cost.toll_cost),
            'date': trip_cost.trip.completed_at.isoformat(),
        }
        
        response = requests.post(
            f'{self.api_url}/costs',
            json=payload,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
            timeout=self.timeout
        )
        response.raise_for_status()
        
        return response.json()
    
    def get_financial_data(self, start_date, end_date):
        """Get financial data from ERP"""
        params = {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
        }
        
        response = requests.get(
            f'{self.api_url}/financial',
            params=params,
            headers={'Authorization': f'Bearer {self.api_key}'},
            timeout=self.timeout
        )
        response.raise_for_status()
        
        return response.json()
```

### ERP Sync Task

```python
# apps/integrations/tasks.py
from celery import shared_task
from apps.integrations.services import ERPService

@shared_task(bind=True, max_retries=3)
def sync_trip_cost_to_erp(self, trip_cost_id):
    """Sync trip cost to ERP with retry"""
    from apps.costing.models import TripCost
    
    try:
        trip_cost = TripCost.objects.get(id=trip_cost_id)
        erp_service = ERPService()
        erp_service.sync_trip_cost(trip_cost)
        
        return {'status': 'synced', 'trip_cost_id': str(trip_cost_id)}
    except Exception as e:
        # Retry on failure
        raise self.retry(exc=e, countdown=300)  # Retry after 5 minutes
```

---

## Maps Service Integration

### Maps Service

```python
# apps/core/services.py
import requests
from django.conf import settings

class MapsService:
    """Maps service integration"""
    
    def __init__(self):
        self.api_key = settings.MAPS_API_KEY
        self.api_url = settings.MAPS_API_URL
    
    def calculate_route(self, origin_lat, origin_lng, dest_lat, dest_lng):
        """Calculate route between two points"""
        params = {
            'origin': f'{origin_lat},{origin_lng}',
            'destination': f'{dest_lat},{dest_lng}',
            'key': self.api_key,
        }
        
        response = requests.get(
            f'{self.api_url}/directions/json',
            params=params,
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        route = data['routes'][0]
        
        return {
            'distance_km': route['legs'][0]['distance']['value'] / 1000,
            'duration_minutes': route['legs'][0]['duration']['value'] / 60,
            'polyline': route['overview_polyline']['points'],
        }
    
    def geocode_address(self, address):
        """Geocode address to coordinates"""
        params = {
            'address': address,
            'key': self.api_key,
        }
        
        response = requests.get(
            f'{self.api_url}/geocode/json',
            params=params,
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        location = data['results'][0]['geometry']['location']
        
        return {
            'latitude': location['lat'],
            'longitude': location['lng'],
        }
```

---

## SMS Gateway Integration

### SMS Gateway Service

```python
# apps/notifications/services.py
import requests
from django.conf import settings

class SMSGatewayService:
    """SMS gateway integration"""
    
    def __init__(self):
        self.api_url = settings.SMS_GATEWAY_URL
        self.api_key = settings.SMS_GATEWAY_API_KEY
        self.sender_id = settings.SMS_SENDER_ID
    
    def send_sms(self, phone_number, message):
        """Send SMS via gateway"""
        payload = {
            'to': phone_number,
            'message': message,
            'sender_id': self.sender_id,
        }
        
        response = requests.post(
            f'{self.api_url}/send',
            json=payload,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
            timeout=10
        )
        response.raise_for_status()
        
        return response.json()
```

---

## Payment Gateway Integration

### Payment Service

```python
# apps/integrations/services.py
import requests
from django.conf import settings

class PaymentGatewayService:
    """Payment gateway integration"""
    
    def __init__(self):
        self.api_url = settings.PAYMENT_GATEWAY_URL
        self.api_key = settings.PAYMENT_GATEWAY_API_KEY
        self.secret_key = settings.PAYMENT_GATEWAY_SECRET_KEY
    
    def create_payment(self, amount, currency, description, metadata):
        """Create payment request"""
        payload = {
            'amount': amount,
            'currency': currency,
            'description': description,
            'metadata': metadata,
            'return_url': settings.PAYMENT_RETURN_URL,
        }
        
        response = requests.post(
            f'{self.api_url}/payments',
            json=payload,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
            timeout=10
        )
        response.raise_for_status()
        
        return response.json()
    
    def verify_payment(self, payment_id):
        """Verify payment status"""
        response = requests.get(
            f'{self.api_url}/payments/{payment_id}',
            headers={'Authorization': f'Bearer {self.api_key}'},
            timeout=10
        )
        response.raise_for_status()
        
        return response.json()
```

### Payment Webhook Handler

```python
# apps/integrations/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import hmac
import hashlib

@csrf_exempt
def payment_webhook(request):
    """Handle payment gateway webhook"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Verify webhook signature
    signature = request.headers.get('X-Signature')
    payload = request.body
    
    expected_signature = hmac.new(
        settings.PAYMENT_GATEWAY_SECRET_KEY.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        return JsonResponse({'error': 'Invalid signature'}, status=401)
    
    # Process webhook
    data = json.loads(payload)
    payment_id = data.get('payment_id')
    status = data.get('status')
    
    # Update payment status
    # Implementation
    
    return JsonResponse({'status': 'ok'})
```

---

## Integration Error Handling

### Retry Logic

```python
# apps/integrations/utils.py
from functools import wraps
import time
import logging

logger = logging.getLogger(__name__)

def retry_integration(max_retries=3, delay=1):
    """Decorator for integration retry logic"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"Integration failed after {max_retries} attempts: {str(e)}")
                        raise
                    logger.warning(f"Integration attempt {attempt + 1} failed: {str(e)}")
                    time.sleep(delay * (attempt + 1))
        return wrapper
    return decorator


# Usage
@retry_integration(max_retries=3, delay=2)
def sync_to_erp(data):
    erp_service = ERPService()
    return erp_service.sync_trip_cost(data)
```

---

## Related Documentation

- **[Integration Contracts](../../../../../06-contracts/04-integration/)** - Integration specifications
- **[Background Tasks](./background-tasks.md)** - Async integration tasks

---

**Last Updated**: 2026-02-13

