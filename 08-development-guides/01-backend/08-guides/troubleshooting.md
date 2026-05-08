# Troubleshooting Guide

> Low-level Django troubleshooting guide

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

This document provides **troubleshooting guide** (common issues, debugging, solutions).

---

## Overview

This document covers common issues, debugging techniques, and solutions for Django backend development.

---

## Common Issues

### Database Issues

#### Migration Errors

**Problem**: Migration fails with dependency errors

```bash
# Error: django.db.migrations.exceptions.InconsistentMigrationHistory
```

**Solution**:
```bash
# Check migration status
python manage.py showmigrations

# Fake migration if needed
python manage.py migrate --fake app_name migration_number

# Reset migrations (development only)
python manage.py migrate app_name zero
python manage.py migrate
```

#### Connection Errors

**Problem**: Cannot connect to database

```bash
# Error: django.db.utils.OperationalError: could not connect to server
```

**Solution**:
```bash
# Check database settings
python manage.py dbshell

# Verify connection
python manage.py check --database default

# Check environment variables
echo $DATABASE_URL
```

---

### Authentication Issues

#### JWT Token Errors

**Problem**: Token validation fails

```python
# Error: InvalidTokenError: Token has expired
```

**Solution**:
```python
# Check token expiration
from apps.core.jwt import validate_token
try:
    payload = validate_token(token)
except InvalidTokenError as e:
    print(f"Token error: {e}")

# Refresh token
POST /api/v1/auth/refresh/
{
    "refresh_token": "your_refresh_token"
}
```

#### Permission Denied

**Problem**: 403 Forbidden errors

```python
# Error: Permission denied
```

**Solution**:
```python
# Check user permissions
from apps.core.permissions import user_has_permission
user_has_permission(user, 'transport.create_transport_order')

# Check role assignments
user.user_roles.all()

# Verify tenant access
user.tenant_id == resource.tenant_id
```

---

### API Issues

#### Serializer Validation Errors

**Problem**: 400 Bad Request with validation errors

```python
# Error: {"field": ["This field is required."]}
```

**Solution**:
```python
# Check serializer validation
serializer = TransportOrderSerializer(data=request.data)
if not serializer.is_valid():
    print(serializer.errors)

# Verify required fields
# Check field types and constraints
```

#### Pagination Issues

**Problem**: Pagination not working

```python
# Error: No pagination in response
```

**Solution**:
```python
# Check pagination class
class TransportOrderViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination

# Verify page size
GET /api/v1/transport-orders/?page=1&page_size=20
```

---

### Celery Issues

#### Task Not Executing

**Problem**: Celery tasks not running

```bash
# Error: Task not found or not executing
```

**Solution**:
```bash
# Check Celery worker
celery -A config worker --loglevel=info

# Check broker connection
python manage.py shell
from celery import current_app
current_app.control.inspect().active()

# Verify task registration
from apps.transport.tasks import send_notification
send_notification.delay(...)
```

#### Redis Connection Errors

**Problem**: Cannot connect to Redis

```bash
# Error: Error 111 connecting to localhost:6379
```

**Solution**:
```bash
# Check Redis connection
redis-cli ping

# Verify Redis URL
echo $REDIS_URL

# Test connection from Django
python manage.py shell
from django.core.cache import cache
cache.set('test', 'value')
cache.get('test')
```

---

## Debugging Techniques

### Django Debug Toolbar

```python
# settings/development.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

### Logging

```python
# Enable detailed logging
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Query Debugging

```python
# Enable query logging
from django.db import connection
from django.test.utils import override_settings

# In development
if settings.DEBUG:
    connection.queries_log.clear()
    # Execute queries
    orders = TransportOrder.objects.all()
    # Check queries
    print(f"Queries: {len(connection.queries)}")
    for query in connection.queries:
        print(query['sql'])
```

---

## Performance Issues

### Slow Queries

**Problem**: API endpoints are slow

**Solution**:
```python
# Use select_related for foreign keys
orders = TransportOrder.objects.select_related('vehicle', 'driver').all()

# Use prefetch_related for many-to-many
users = User.objects.prefetch_related('roles').all()

# Add database indexes
class TransportOrder(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['tenant', 'status']),
        ]
```

### N+1 Query Problem

**Problem**: Multiple queries for related objects

**Solution**:
```python
# ❌ BAD: N+1 queries
orders = TransportOrder.objects.all()
for order in orders:
    print(order.vehicle.registration_number)  # N queries

# ✅ GOOD: Single query
orders = TransportOrder.objects.select_related('vehicle').all()
for order in orders:
    print(order.vehicle.registration_number)  # 1 query
```

---

## Related Documentation

- **[Development Setup](../01-setup/development-setup.md)** - Development environment
- **[Monitoring](../07-deployment/monitoring.md)** - Monitoring and logging

---

**Last Updated**: 2026-02-13

