# Caching Implementation

> Low-level Redis caching implementation

## 📖 High-Level Context

> **Source of Truth**: [`DFMS-product-context/technical-context/`](../../DFMS-product-context/technical-context/)

- **[Architecture Summary](../../DFMS-product-context/technical-context/00-overview/architecture-summary.md#3-scalability)** - Caching strategy
- **[Container View](../../DFMS-product-context/technical-context/01-architecture/container-view.md#7-cache)** - Cache container

This document provides **Redis-specific caching implementation** (cache patterns, invalidation, configuration).

---

## Overview

DFMS uses Redis for caching session data, frequently accessed data, and real-time information. Redis also serves as the Celery message broker in Phase 1.

---

## Redis Configuration

### Settings Configuration

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
        },
        'KEY_PREFIX': 'dfms',
        'TIMEOUT': 300,  # Default timeout (5 minutes)
    },
    'session': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://localhost:6379/2'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'dfms:session',
        'TIMEOUT': 1800,  # 30 minutes
    },
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'session'
```

---

## Cache Patterns

### 1. Cache-Aside Pattern

```python
# apps/fleet/services.py
from django.core.cache import cache
from apps.fleet.models import Vehicle

class VehicleService:
    @staticmethod
    def get_vehicle(vehicle_id, tenant_id):
        """Get vehicle with caching"""
        cache_key = f'vehicle:{tenant_id}:{vehicle_id}'
        
        # Try cache first
        vehicle_data = cache.get(cache_key)
        if vehicle_data:
            return vehicle_data
        
        # Cache miss - fetch from database
        vehicle = Vehicle.objects.select_related('driver', 'vendor').get(
            id=vehicle_id,
            tenant_id=tenant_id
        )
        
        # Serialize and cache
        vehicle_data = {
            'id': str(vehicle.id),
            'registration_number': vehicle.registration_number,
            'vehicle_type': vehicle.vehicle_type,
            'status': vehicle.status,
            'driver': {
                'id': str(vehicle.driver.id),
                'name': vehicle.driver.full_name,
            } if vehicle.driver else None,
        }
        
        # Cache for 1 hour
        cache.set(cache_key, vehicle_data, timeout=3600)
        
        return vehicle_data
    
    @staticmethod
    def invalidate_vehicle_cache(vehicle_id, tenant_id):
        """Invalidate vehicle cache"""
        cache_key = f'vehicle:{tenant_id}:{vehicle_id}'
        cache.delete(cache_key)
```

### 2. Write-Through Pattern

```python
# apps/master_data/services.py
from django.core.cache import cache

class POIService:
    @staticmethod
    def create_poi(poi_data, tenant_id):
        """Create POI with write-through cache"""
        # Create in database
        poi = POI.objects.create(**poi_data, tenant_id=tenant_id)
        
        # Write to cache immediately
        cache_key = f'poi:{tenant_id}:{poi.id}'
        cache.set(cache_key, {
            'id': str(poi.id),
            'name': poi.name,
            'address': poi.address,
            'latitude': float(poi.latitude),
            'longitude': float(poi.longitude),
        }, timeout=3600)
        
        # Invalidate list cache
        cache.delete(f'pois:list:{tenant_id}')
        
        return poi
```

### 3. Cache-Aside with Versioning

```python
# apps/core/cache.py
from django.core.cache import cache

class CacheManager:
    @staticmethod
    def get_cache_version(tenant_id, cache_type):
        """Get cache version for tenant"""
        version_key = f'cache_version:{tenant_id}:{cache_type}'
        version = cache.get(version_key)
        if version is None:
            version = 1
            cache.set(version_key, version, timeout=None)  # Never expire
        return version
    
    @staticmethod
    def invalidate_cache_type(tenant_id, cache_type):
        """Invalidate all cache of specific type"""
        version_key = f'cache_version:{tenant_id}:{cache_type}'
        current_version = cache.get(version_key, 1)
        cache.set(version_key, current_version + 1, timeout=None)
    
    @staticmethod
    def get_with_version(key, tenant_id, cache_type):
        """Get cache with version"""
        version = CacheManager.get_cache_version(tenant_id, cache_type)
        versioned_key = f'{key}:v{version}'
        return cache.get(versioned_key)
```

---

## Cache Keys Strategy

### Key Naming Convention

```python
# Cache key patterns
'vehicle:{tenant_id}:{vehicle_id}'           # Single vehicle
'vehicles:list:{tenant_id}:{status}'         # Vehicle list by status
'transport_order:{tenant_id}:{order_id}'     # Single transport order
'transport_orders:pending:{tenant_id}'      # Pending orders
'user:{tenant_id}:{user_id}'                 # User data
'session:{session_key}'                      # Session data
'dashboard:{tenant_id}:{user_id}'            # Dashboard data
```

### Cache Key Utilities

```python
# apps/core/cache.py
class CacheKeys:
    """Cache key generators"""
    
    @staticmethod
    def vehicle(tenant_id, vehicle_id):
        return f'vehicle:{tenant_id}:{vehicle_id}'
    
    @staticmethod
    def vehicle_list(tenant_id, status=None):
        if status:
            return f'vehicles:list:{tenant_id}:{status}'
        return f'vehicles:list:{tenant_id}'
    
    @staticmethod
    def transport_order(tenant_id, order_id):
        return f'transport_order:{tenant_id}:{order_id}'
    
    @staticmethod
    def user(tenant_id, user_id):
        return f'user:{tenant_id}:{user_id}'
    
    @staticmethod
    def dashboard(tenant_id, user_id):
        return f'dashboard:{tenant_id}:{user_id}'
```

---

## Caching Examples

### Model-Level Caching

```python
# apps/fleet/models.py
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete

class Vehicle(models.Model):
    # ... fields ...
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Invalidate cache on save
        cache.delete(f'vehicle:{self.tenant_id}:{self.id}')
        cache.delete(f'vehicles:list:{self.tenant_id}')
    
    def delete(self, *args, **kwargs):
        tenant_id = self.tenant_id
        vehicle_id = self.id
        super().delete(*args, **kwargs)
        # Invalidate cache on delete
        cache.delete(f'vehicle:{tenant_id}:{vehicle_id}')
        cache.delete(f'vehicles:list:{tenant_id}')


# Signal handlers for cache invalidation
@receiver(post_save, sender=Vehicle)
def invalidate_vehicle_cache(sender, instance, **kwargs):
    """Invalidate vehicle cache on save"""
    cache.delete(f'vehicle:{instance.tenant_id}:{instance.id}')
    cache.delete(f'vehicles:list:{instance.tenant_id}')
```

### Query Result Caching

```python
# apps/transport/services.py
from django.core.cache import cache
from django.db.models import Q

class TransportOrderService:
    @staticmethod
    def get_pending_orders(tenant_id):
        """Get pending orders with caching"""
        cache_key = f'transport_orders:pending:{tenant_id}'
        
        orders = cache.get(cache_key)
        if orders is not None:
            return orders
        
        # Query database
        orders = list(
            TransportOrder.objects
            .filter(tenant_id=tenant_id, status='pending')
            .select_related('vehicle', 'driver', 'transport_request')
            .values(
                'id', 'to_number', 'status',
                'vehicle__registration_number',
                'driver__full_name',
            )
        )
        
        # Cache for 5 minutes
        cache.set(cache_key, orders, timeout=300)
        
        return orders
```

### Dashboard Data Caching

```python
# apps/reports/services.py
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta

class DashboardService:
    @staticmethod
    def get_dashboard_data(tenant_id, user_id):
        """Get dashboard data with caching"""
        cache_key = f'dashboard:{tenant_id}:{user_id}'
        
        dashboard_data = cache.get(cache_key)
        if dashboard_data:
            return dashboard_data
        
        # Calculate dashboard metrics
        today = timezone.now().date()
        
        dashboard_data = {
            'pending_orders': TransportOrder.objects.filter(
                tenant_id=tenant_id,
                status='pending'
            ).count(),
            'active_trips': Trip.objects.filter(
                tenant_id=tenant_id,
                status__in=['in_transit', 'at_origin', 'at_destination']
            ).count(),
            'completed_today': Trip.objects.filter(
                tenant_id=tenant_id,
                status='completed',
                completed_at__date=today
            ).count(),
            'vehicles_available': Vehicle.objects.filter(
                tenant_id=tenant_id,
                status='available'
            ).count(),
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, dashboard_data, timeout=300)
        
        return dashboard_data
```

---

## Cache Invalidation

### Invalidation Strategies

```python
# apps/core/cache.py
from django.core.cache import cache

class CacheInvalidation:
    """Cache invalidation utilities"""
    
    @staticmethod
    def invalidate_vehicle_related(tenant_id, vehicle_id=None):
        """Invalidate all vehicle-related cache"""
        if vehicle_id:
            cache.delete(f'vehicle:{tenant_id}:{vehicle_id}')
        cache.delete(f'vehicles:list:{tenant_id}')
        cache.delete(f'vehicles:list:{tenant_id}:available')
        cache.delete(f'vehicles:list:{tenant_id}:assigned')
    
    @staticmethod
    def invalidate_transport_order_related(tenant_id, order_id=None):
        """Invalidate transport order cache"""
        if order_id:
            cache.delete(f'transport_order:{tenant_id}:{order_id}')
        cache.delete(f'transport_orders:pending:{tenant_id}')
        cache.delete(f'transport_orders:assigned:{tenant_id}')
        # Invalidate dashboard cache
        CacheInvalidation.invalidate_dashboard(tenant_id)
    
    @staticmethod
    def invalidate_dashboard(tenant_id, user_id=None):
        """Invalidate dashboard cache"""
        if user_id:
            cache.delete(f'dashboard:{tenant_id}:{user_id}')
        else:
            # Invalidate all user dashboards (use pattern matching)
            # Note: Redis pattern matching requires redis-py
            from django_redis import get_redis_connection
            redis_client = get_redis_connection('default')
            pattern = f'dashboard:{tenant_id}:*'
            for key in redis_client.keys(pattern):
                cache.delete(key)
```

---

## Real-Time Data Caching

### GPS Tracking Data

```python
# apps/tracking/services.py
from django.core.cache import cache
from django_redis import get_redis_connection

class TrackingService:
    @staticmethod
    def update_vehicle_location(vehicle_id, latitude, longitude):
        """Update vehicle location in cache"""
        redis_client = get_redis_connection('default')
        
        location_data = {
            'latitude': latitude,
            'longitude': longitude,
            'timestamp': timezone.now().isoformat(),
        }
        
        # Store in Redis with TTL
        cache_key = f'vehicle_location:{vehicle_id}'
        cache.set(cache_key, location_data, timeout=300)  # 5 minutes
        
        # Also store in sorted set for location history
        redis_client.zadd(
            f'vehicle_location_history:{vehicle_id}',
            {json.dumps(location_data): time.time()}
        )
        # Keep only last 100 locations
        redis_client.zremrangebyrank(
            f'vehicle_location_history:{vehicle_id}',
            0, -101
        )
    
    @staticmethod
    def get_vehicle_location(vehicle_id):
        """Get current vehicle location"""
        cache_key = f'vehicle_location:{vehicle_id}'
        return cache.get(cache_key)
```

---

## Session Caching

### Session Configuration

```python
# settings.py
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'session'
SESSION_COOKIE_AGE = 1800  # 30 minutes
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # HTTPS only
SESSION_COOKIE_SAMESITE = 'Strict'
```

### Custom Session Backend

```python
# apps/core/sessions.py
from django.contrib.sessions.backends.cache import CacheSessionStore

class TenantSessionStore(CacheSessionStore):
    """Session store with tenant context"""
    
    def __init__(self, session_key=None):
        super().__init__(session_key)
        self.cache_key_prefix = 'dfms:session'
```

---

## Cache Monitoring

### Cache Statistics

```python
# apps/core/utils.py
from django_redis import get_redis_connection

def get_cache_stats():
    """Get Redis cache statistics"""
    redis_client = get_redis_connection('default')
    info = redis_client.info()
    
    return {
        'used_memory': info.get('used_memory_human'),
        'connected_clients': info.get('connected_clients'),
        'total_commands_processed': info.get('total_commands_processed'),
        'keyspace_hits': info.get('keyspace_hits'),
        'keyspace_misses': info.get('keyspace_misses'),
    }
```

---

## Testing Caching

### Cache Testing

```python
# tests/test_caching.py
import pytest
from django.core.cache import cache
from apps.fleet.services import VehicleService

@pytest.mark.django_db
class TestCaching:
    def test_vehicle_cache(self):
        """Test vehicle caching"""
        vehicle = Vehicle.objects.create(...)
        
        # First call - cache miss
        result1 = VehicleService.get_vehicle(vehicle.id, vehicle.tenant_id)
        
        # Second call - cache hit
        result2 = VehicleService.get_vehicle(vehicle.id, vehicle.tenant_id)
        
        assert result1 == result2
    
    def test_cache_invalidation(self):
        """Test cache invalidation"""
        vehicle = Vehicle.objects.create(...)
        
        # Cache vehicle
        VehicleService.get_vehicle(vehicle.id, vehicle.tenant_id)
        
        # Update vehicle
        vehicle.status = 'assigned'
        vehicle.save()
        
        # Cache should be invalidated
        cached_data = cache.get(f'vehicle:{vehicle.tenant_id}:{vehicle.id}')
        assert cached_data is None
```

---

## Related Documentation

- **[Background Tasks](./background-tasks.md)** - Celery tasks (uses Redis)
- **[System Architecture](../architecture/system-architecture.md)** - Overall architecture

---

**Last Updated**: 2026-02-13

