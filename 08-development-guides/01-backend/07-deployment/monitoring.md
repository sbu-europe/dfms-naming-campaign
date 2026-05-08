# Monitoring and Logging

> Low-level monitoring and logging implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Deployment Strategy](../../../04-architecture/06-deployment/)** - High-level deployment approach

This document provides **monitoring and logging implementation** (CloudWatch, Sentry, application metrics).

---

## Overview

DFMS uses AWS CloudWatch for logging, Sentry for error tracking, and custom metrics for application monitoring. All logs and metrics are centralized for analysis and alerting.

---

## CloudWatch Logging

### Django Logging Configuration

```python
# config/settings/production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            'format': '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "message": "%(message)s"}',
        },
    },
    'handlers': {
        'cloudwatch': {
            'class': 'watchtower.CloudWatchLogHandler',
            'log_group': env('AWS_CLOUDWATCH_LOG_GROUP', default='dfms/application'),
            'stream_name': 'django-{strftime:%Y-%m-%d}',
            'formatter': 'json',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['cloudwatch', 'console'],
            'level': 'INFO',
        },
        'apps': {
            'handlers': ['cloudwatch', 'console'],
            'level': 'INFO',
        },
    },
}
```

### Application Logging

```python
# apps/core/logging.py
import logging

logger = logging.getLogger('apps')

# Usage
logger.info('Transport order created', extra={
    'transport_order_id': str(order.id),
    'tenant_id': str(order.tenant.id),
})

logger.error('Failed to assign vehicle', extra={
    'transport_order_id': str(order.id),
    'error': str(e),
}, exc_info=True)
```

---

## Sentry Error Tracking

### Sentry Configuration

```python
# config/settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

if env('SENTRY_DSN'):
    sentry_sdk.init(
        dsn=env('SENTRY_DSN'),
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment=env('ENVIRONMENT', default='production'),
    )
```

### Custom Sentry Context

```python
# apps/core/middleware.py
import sentry_sdk

class SentryContextMiddleware:
    """Add context to Sentry errors"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Add user context
        if request.user.is_authenticated:
            sentry_sdk.set_user({
                'id': str(request.user.id),
                'email': request.user.email,
                'tenant_id': str(request.user.tenant.id),
            })
        
        # Add request context
        sentry_sdk.set_context('request', {
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
        })
        
        return self.get_response(request)
```

---

## Application Metrics

### Custom Metrics

```python
# apps/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Counters
transport_orders_created = Counter(
    'transport_orders_created_total',
    'Total transport orders created',
    ['tenant_id', 'status']
)

trips_completed = Counter(
    'trips_completed_total',
    'Total trips completed',
    ['tenant_id']
)

# Histograms
api_request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint']
)

# Gauges
active_transport_orders = Gauge(
    'active_transport_orders',
    'Number of active transport orders',
    ['tenant_id']
)
```

### Metrics Collection

```python
# apps/core/middleware.py
from apps.core.metrics import api_request_duration
import time

class MetricsMiddleware:
    """Collect API metrics"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        api_request_duration.labels(
            method=request.method,
            endpoint=request.path
        ).observe(duration)
        
        return response
```

---

## Health Checks

### Health Check Endpoint

```python
# apps/core/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis

def health_check(request):
    """Health check endpoint"""
    checks = {
        'status': 'healthy',
        'checks': {}
    }
    
    # Database check
    try:
        connection.ensure_connection()
        checks['checks']['database'] = 'ok'
    except Exception as e:
        checks['checks']['database'] = f'error: {str(e)}'
        checks['status'] = 'unhealthy'
    
    # Redis check
    try:
        cache.get('health_check')
        checks['checks']['redis'] = 'ok'
    except Exception as e:
        checks['checks']['redis'] = f'error: {str(e)}'
        checks['status'] = 'unhealthy'
    
    status_code = 200 if checks['status'] == 'healthy' else 503
    return JsonResponse(checks, status=status_code)
```

---

## Related Documentation

- **[AWS Setup](./aws-setup.md)** - AWS CloudWatch configuration
- **[Environment Variables](./environment-variables.md)** - Monitoring configuration

---

**Last Updated**: 2026-02-13

