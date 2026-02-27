# External Integrations Implementation

> Low-level external service integration implementation

## 📖 High-Level Context

> **Source of Truth**: [`DFMS-product-context/technical-context/`](../../DFMS-product-context/technical-context/)

- **[Integration Contracts](../../DFMS-product-context/technical-context/05-contracts/integration/)** - External integration contracts
- **[External Systems](../../DFMS-product-context/technical-context/01-architecture/integration/external-systems.md)** - High-level integration overview

This document provides **Django-specific integration implementation** (GPS, ERP, SMS, Maps, Payment).

---

## Overview

DFMS integrates with external systems for GPS tracking, ERP synchronization, SMS gateway, maps service, and payment processing. Integrations are implemented as services with retry logic and error handling.

---

## GPS/VTS Integration

### GPS Service

```python
# apps/tracking/services.py
import requests
from django.conf import settings
from django.utils import timezone

class GPSService:
    """GPS/VTS integration service"""
    
    def __init__(self):
        self.api_key = settings.GPS_API_KEY
        self.api_url = settings.GPS_API_URL
        self.timeout = 10
    
    def get_vehicle_location(self, vehicle_id):
        """Get current vehicle location"""
        try:
            response = requests.get(
                f'{self.api_url}/vehicles/{vehicle_id}/location',
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            return {
                'latitude': data['latitude'],
                'longitude': data['longitude'],
                'timestamp': data['timestamp'],
                'speed': data.get('speed'),
                'heading': data.get('heading'),
            }
        except requests.RequestException as e:
            raise Exception(f"GPS API error: {str(e)}")
    
    def get_vehicle_history(self, vehicle_id, start_time, end_time):
        """Get vehicle location history"""
        params = {
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
        }
        
        response = requests.get(
            f'{self.api_url}/vehicles/{vehicle_id}/history',
            params=params,
            headers={'Authorization': f'Bearer {self.api_key}'},
            timeout=self.timeout
        )
        response.raise_for_status()
        
        return response.json()
```

### GPS Webhook Handler

```python
# apps/tracking/views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from apps.tracking.services import TrackingService

@csrf_exempt
def gps_webhook(request):
    """Handle GPS webhook updates"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    data = json.loads(request.body)
    vehicle_id = data.get('vehicle_id')
    location_data = data.get('location')
    
    # Update vehicle location
    TrackingService.update_vehicle_location(
        vehicle_id,
        location_data['latitude'],
        location_data['longitude']
    )
    
    return JsonResponse({'status': 'ok'})
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

- **[Integration Contracts](../../DFMS-product-context/technical-context/05-contracts/integration/)** - Integration specifications
- **[Background Tasks](./background-tasks.md)** - Async integration tasks

---

**Last Updated**: 2026-02-13

