# DFMS Integration Patterns

> Common patterns for external system integration

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026

---

## 📋 Overview

DFMS uses four primary integration patterns to communicate with external systems. Each pattern is chosen based on:
- Data freshness requirements
- System availability
- Volume of data
- Criticality of integration

---

## 🔄 Pattern 1: Real-Time API Integration

### When to Use
- Need immediate/near-real-time data
- Low latency requirements
- Synchronous operations

### Use Cases in DFMS
- **GPS/VTS**: Vehicle location tracking
- **Maps API**: Route planning, geocoding
- **SMS Gateway**: Send notifications

### Implementation

```python
import requests
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def get_vehicle_location(vehicle_id):
    """Get real-time vehicle location from GPS provider"""
    response = requests.get(
        f"{GPS_API_URL}/vehicles/{vehicle_id}/location",
        headers={"Authorization": f"Bearer {GPS_API_KEY}"},
        timeout=5
    )
    response.raise_for_status()
    return response.json()
```

### Resilience Patterns

**Circuit Breaker**:
```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
def call_gps_api(vehicle_id):
    # If 5 failures, circuit opens for 60 seconds
    return get_vehicle_location(vehicle_id)
```

**Fallback**:
```python
def get_vehicle_location_with_fallback(vehicle_id):
    try:
        return call_gps_api(vehicle_id)
    except CircuitBreakerError:
        # Circuit open - return cached location
        return get_cached_location(vehicle_id)
```

---

## 📦 Pattern 2: Batch Synchronization

### When to Use
- Large volume of data
- Not time-critical
- Scheduled updates

### Use Cases in DFMS
- **ERP Sync**: Daily invoice synchronization
- **Data Export**: Bulk data exports for reporting
- **Backup**: Scheduled backups

### Implementation

```python
from celery import shared_task

@shared_task
def sync_invoices_to_erp():
    """Batch sync invoices to ERP - runs daily"""
    # Get invoices pending sync
    invoices = Invoice.objects.filter(
        erp_sync_status='pending',
        created_at__gte=yesterday
    )
    
    # Batch process
    batch_size = 100
    for i in range(0, len(invoices), batch_size):
        batch = invoices[i:i+batch_size]
        sync_batch_to_erp(batch)
```

### Batch Processing Strategy

```python
def sync_batch_to_erp(invoices):
    """Sync batch of invoices with error handling"""
    payload = {
        "invoices": [
            invoice.to_erp_format() 
            for invoice in invoices
        ]
    }
    
    try:
        response = requests.post(
            f"{ERP_API_URL}/invoices/batch",
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        
        # Mark as synced
        Invoice.objects.filter(
            id__in=[inv.id for inv in invoices]
        ).update(erp_sync_status='synced')
        
    except Exception as e:
        # Log error, retry later
        logger.error(f"ERP sync failed: {e}")
        # Don't update status - will retry next run
```

---

## 📡 Pattern 3: Event-Driven Integration

### When to Use
- Asynchronous notifications
- Loosely coupled systems
- Event-based triggers

### Use Cases in DFMS
- **Notifications**: SMS/Email on events
- **Webhooks**: Notify external systems of DFMS events
- **Real-time Updates**: Push updates to mobile apps

### Implementation

**Publishing Events**:
```python
from events import event_bus, TripCompleted

def complete_trip(trip_id):
    trip = Trip.objects.get(id=trip_id)
    trip.status = 'completed'
    trip.end_time = timezone.now()
    trip.save()
    
    # Publish event
    event = TripCompleted(
        trip_id=trip.id,
        trip_number=trip.trip_number,
        vehicle_id=trip.vehicle_id,
        completed_at=trip.end_time
    )
    event_bus.publish(event)
```

**Consuming Events for External Integration**:
```python
@event_bus.subscribe(TripCompleted)
def notify_erp_of_trip_completion(event):
    """Send trip completion to ERP"""
    try:
        requests.post(
            f"{ERP_API_URL}/trips/completed",
            json={
                "trip_id": event.trip_id,
                "completed_at": event.completed_at.isoformat()
            },
            timeout=10
        )
    except Exception as e:
        logger.error(f"Failed to notify ERP: {e}")
        # Will retry via message queue
        raise
```

---

## 🔔 Pattern 4: Webhook Integration

### When to Use
- External system needs to notify DFMS
- Callback-based communication
- Asynchronous responses

### Use Cases in DFMS
- **Payment Gateway**: Payment confirmation callbacks
- **ERP**: Invoice approval notifications
- **GPS Provider**: Geofence alerts

### Implementation

**Webhook Endpoint**:
```python
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
def payment_webhook(request):
    """Receive payment confirmation from gateway"""
    # Verify webhook signature
    if not verify_webhook_signature(request):
        return JsonResponse({"error": "Invalid signature"}, status=401)
    
    # Process payment confirmation
    payload = json.loads(request.body)
    payment_id = payload['payment_id']
    status = payload['status']
    
    # Update payment status
    Payment.objects.filter(id=payment_id).update(status=status)
    
    # Publish event
    event_bus.publish(PaymentConfirmed(payment_id=payment_id))
    
    return JsonResponse({"status": "received"})
```

**Webhook Security**:
```python
import hmac
import hashlib

def verify_webhook_signature(request):
    """Verify webhook is from trusted source"""
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.body
    
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

---

## 🛡️ Integration Resilience

### 1. Timeout Configuration

```python
# Different timeouts for different operations
TIMEOUTS = {
    'gps_location': 5,      # Real-time, must be fast
    'maps_routing': 10,     # Can wait a bit
    'erp_sync': 30,         # Batch, can be slower
    'sms_send': 15          # Medium priority
}
```

### 2. Retry Strategy

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((ConnectionError, Timeout))
)
def call_external_api():
    # Retries: 0s, 2s, 4s, 8s (max 10s)
    pass
```

### 3. Circuit Breaker

```python
from circuitbreaker import circuit

@circuit(
    failure_threshold=5,    # Open after 5 failures
    recovery_timeout=60,    # Try again after 60s
    expected_exception=RequestException
)
def call_gps_api():
    # Circuit opens after 5 consecutive failures
    # Stays open for 60 seconds
    # Then half-open to test recovery
    pass
```

### 4. Fallback Strategies

```python
def get_vehicle_location(vehicle_id):
    try:
        # Try GPS provider
        return gps_provider.get_location(vehicle_id)
    except CircuitBreakerError:
        # Circuit open - use cached data
        return cache.get(f"vehicle_location:{vehicle_id}")
    except Exception:
        # Other error - return last known location
        return get_last_known_location(vehicle_id)
```

---

## 📊 Integration Monitoring

### Health Checks

```python
def check_integration_health():
    """Check health of all integrations"""
    health = {
        "gps": check_gps_health(),
        "erp": check_erp_health(),
        "maps": check_maps_health(),
        "sms": check_sms_health()
    }
    return health

def check_gps_health():
    try:
        response = requests.get(
            f"{GPS_API_URL}/health",
            timeout=5
        )
        return {
            "status": "healthy" if response.ok else "unhealthy",
            "response_time": response.elapsed.total_seconds()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
```

### Metrics to Track

```python
from prometheus_client import Counter, Histogram

# Request counters
integration_requests = Counter(
    'integration_requests_total',
    'Total integration requests',
    ['system', 'endpoint', 'status']
)

# Response time histogram
integration_duration = Histogram(
    'integration_duration_seconds',
    'Integration request duration',
    ['system', 'endpoint']
)

# Usage
with integration_duration.labels('gps', 'get_location').time():
    response = get_vehicle_location(vehicle_id)
    integration_requests.labels('gps', 'get_location', response.status_code).inc()
```

---

## 🔗 Related Documents

- [External Systems](./external-systems.md) - System-specific details
- [Container View](../container-view.md) - Integration containers
- [Design Principles](../../00-overview/design-principles.md) - Resilience principles

---

**Document Status**: 🚧 Draft  
**Next Steps**: Implement patterns in code, monitor effectiveness  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

