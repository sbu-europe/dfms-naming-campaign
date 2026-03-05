# Error Handling Implementation

> Low-level Django error handling and exception management

## 📖 High-Level Context

> **Source of Truth**: [`05-architecture/`](../)

- **[Exception Handling](../02-workflows/exception-handling/)** - High-level exception scenarios
- **[Design Principles](../00-overview/design-principles.md)** - Error handling principles

This document provides **Django-specific error handling implementation** (exception classes, error responses, logging).

---

## Overview

DFMS implements consistent error handling across all APIs using custom exception classes and standardized error response formats. All errors are logged for monitoring and debugging.

---

## Custom Exception Classes

### Base Exception

```python
# apps/core/exceptions.py
from rest_framework.exceptions import APIException
from rest_framework import status

class DFMSException(APIException):
    """Base exception for DFMS"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'An error occurred'
    default_code = 'error'
    
    def __init__(self, detail=None, code=None, status_code=None):
        if status_code:
            self.status_code = status_code
        super().__init__(detail, code)
```

### Domain-Specific Exceptions

```python
# apps/core/exceptions.py
class ValidationError(DFMSException):
    """Validation error"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Validation failed'
    default_code = 'validation_error'


class NotFoundError(DFMSException):
    """Resource not found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found'
    default_code = 'not_found'


class PermissionDeniedError(DFMSException):
    """Permission denied"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Permission denied'
    default_code = 'permission_denied'


class ConflictError(DFMSException):
    """Resource conflict"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict'
    default_code = 'conflict'


class BusinessRuleError(DFMSException):
    """Business rule violation"""
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = 'Business rule violation'
    default_code = 'business_rule_error'
```

### Module-Specific Exceptions

```python
# apps/transport/exceptions.py
from apps.core.exceptions import DFMSException, BusinessRuleError

class TransportOrderError(BusinessRuleError):
    """Transport order specific errors"""
    pass


class VehicleNotAvailableError(TransportOrderError):
    """Vehicle not available for assignment"""
    default_detail = 'Vehicle is not available'
    default_code = 'vehicle_not_available'


class InvalidStatusTransitionError(TransportOrderError):
    """Invalid status transition"""
    default_detail = 'Invalid status transition'
    default_code = 'invalid_status_transition'
```

---

## Error Response Format

### Standard Error Response

```python
# apps/core/responses.py
from rest_framework.response import Response
from rest_framework import status
import traceback

def error_response(
    message: str,
    code: str,
    details: dict = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> Response:
    """Create standardized error response"""
    response_data = {
        'success': False,
        'error': {
            'code': code,
            'message': message,
            'timestamp': timezone.now().isoformat(),
        }
    }
    
    if details:
        response_data['error']['details'] = details
    
    return Response(response_data, status=status_code)
```

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "vehicle_id": ["This field is required"],
      "driver_id": ["Invalid driver ID"]
    },
    "timestamp": "2026-02-13T10:30:00Z"
  }
}
```

---

## Exception Handler

### Global Exception Handler

```python
# apps/core/handlers.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom exception handler"""
    # Call REST framework's default exception handler
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize response format
        custom_response_data = {
            'success': False,
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
                'timestamp': timezone.now().isoformat(),
            }
        }
        
        # Add details if available
        if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
            custom_response_data['error']['details'] = exc.detail
        
        response.data = custom_response_data
        return response
    
    # Handle unexpected exceptions
    logger.exception(f"Unhandled exception: {exc}")
    
    return Response(
        {
            'success': False,
            'error': {
                'code': 'internal_server_error',
                'message': 'An unexpected error occurred',
                'timestamp': timezone.now().isoformat(),
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
```

### Settings Configuration

```python
# settings.py
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'apps.core.handlers.custom_exception_handler',
}
```

---

## Validation Error Handling

### Serializer Validation

```python
# apps/transport/serializers.py
from rest_framework import serializers
from apps.core.exceptions import ValidationError

class TransportOrderSerializer(serializers.ModelSerializer):
    vehicle_id = serializers.UUIDField(required=False)
    
    def validate_vehicle_id(self, value):
        """Validate vehicle availability"""
        try:
            vehicle = Vehicle.objects.get(id=value, tenant=self.context['request'].user.tenant)
            
            if vehicle.status != 'available':
                raise serializers.ValidationError(
                    f"Vehicle {vehicle.registration_number} is not available"
                )
            
            return value
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError("Vehicle not found")
    
    def validate(self, attrs):
        """Cross-field validation"""
        vehicle_id = attrs.get('vehicle_id')
        driver_id = attrs.get('driver_id')
        
        if vehicle_id and driver_id:
            vehicle = Vehicle.objects.get(id=vehicle_id)
            if vehicle.driver_id != driver_id:
                raise serializers.ValidationError({
                    'driver_id': 'Driver is not assigned to this vehicle'
                })
        
        return attrs
```

---

## Business Rule Validation

### Model-Level Validation

```python
# apps/transport/models.py
from django.core.exceptions import ValidationError
from apps.transport.exceptions import InvalidStatusTransitionError

class TransportOrder(models.Model):
    # ... fields ...
    
    def clean(self):
        """Model-level validation"""
        super().clean()
        
        # Validate status transitions
        if self.pk:  # Existing instance
            old_instance = TransportOrder.objects.get(pk=self.pk)
            if not self.is_valid_status_transition(old_instance.status, self.status):
                raise ValidationError(
                    f"Cannot transition from {old_instance.status} to {self.status}"
                )
    
    def is_valid_status_transition(self, from_status, to_status):
        """Check if status transition is valid"""
        valid_transitions = {
            'pending': ['assigned', 'cancelled'],
            'assigned': ['in_transit', 'cancelled'],
            'in_transit': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': [],
        }
        return to_status in valid_transitions.get(from_status, [])
```

### Service-Level Validation

```python
# apps/transport/services.py
from apps.transport.exceptions import VehicleNotAvailableError, BusinessRuleError

class TransportOrderService:
    def assign_vehicle(self, transport_order_id, vehicle_id):
        """Assign vehicle to transport order"""
        transport_order = TransportOrder.objects.get(id=transport_order_id)
        vehicle = Vehicle.objects.get(id=vehicle_id)
        
        # Business rule validation
        if vehicle.status != 'available':
            raise VehicleNotAvailableError(
                f"Vehicle {vehicle.registration_number} is not available"
            )
        
        if transport_order.status != 'pending':
            raise BusinessRuleError(
                f"Cannot assign vehicle to order with status {transport_order.status}"
            )
        
        # Assign vehicle
        transport_order.vehicle = vehicle
        transport_order.status = 'assigned'
        transport_order.save()
        
        return transport_order
```

---

## Error Logging

### Logging Configuration

```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/dfms/errors.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
        'sentry': {
            'class': 'raven.handlers.logging.SentryHandler',
        },
    },
    'loggers': {
        'apps.core.exceptions': {
            'handlers': ['file', 'sentry'],
            'level': 'ERROR',
        },
    },
}
```

### Error Logging Middleware

```python
# apps/core/middleware.py
import logging
import traceback

logger = logging.getLogger(__name__)

class ErrorLoggingMiddleware:
    """Middleware to log all errors"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        if response.status_code >= 400:
            logger.error(
                f"Error {response.status_code}: {request.path}",
                extra={
                    'user': str(request.user.id) if request.user.is_authenticated else None,
                    'tenant': str(request.tenant.id) if hasattr(request, 'tenant') else None,
                    'method': request.method,
                    'path': request.path,
                }
            )
        
        return response
```

---

## Testing Error Handling

### Error Handling Tests

```python
# tests/test_error_handling.py
import pytest
from rest_framework.test import APIClient
from apps.transport.exceptions import VehicleNotAvailableError

@pytest.mark.django_db
class TestErrorHandling:
    def test_validation_error_response(self):
        """Test validation error response format"""
        client = APIClient()
        client.force_authenticate(user=user)
        
        response = client.post('/api/v1/transport-orders/', {})
        
        assert response.status_code == 400
        assert response.data['success'] == False
        assert 'error' in response.data
        assert 'code' in response.data['error']
        assert 'message' in response.data['error']
    
    def test_business_rule_error(self):
        """Test business rule error"""
        with pytest.raises(VehicleNotAvailableError):
            service.assign_vehicle(order_id, unavailable_vehicle_id)
```

---

## Related Documentation

- **[Exception Scenarios](../02-workflows/exception-handling/exception-scenarios.md)** - High-level exception scenarios
- **[API Reference](../api/api-reference.md)** - API error responses

---

**Last Updated**: 2026-02-13

