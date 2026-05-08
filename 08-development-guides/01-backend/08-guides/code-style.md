# Code Style Guide

> Low-level Django code style and conventions

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Design Principles](../../../04-architecture/00-overview/design-principles.md)** - High-level design principles
- **[Contributing Guidelines](./contributing.md)** - Contribution guidelines

This document provides **Django code style guide** (PEP 8, Django conventions, formatting).

---

## Overview

This document defines code style standards for Django/Python development including PEP 8 compliance, Django conventions, and formatting rules.

---

## Python Style Guide

### PEP 8 Compliance

- Follow PEP 8 style guide
- Maximum line length: 88 characters (Black formatter)
- Use 4 spaces for indentation (no tabs)
- Use single quotes for strings (unless double quotes needed)

### Code Formatting

```python
# ✅ GOOD
def create_transport_order(tenant, transport_request):
    """Create transport order"""
    order = TransportOrder.objects.create(
        tenant=tenant,
        transport_request=transport_request,
        status='pending'
    )
    return order

# ❌ BAD
def create_transport_order(tenant,transport_request):
    order=TransportOrder.objects.create(tenant=tenant,transport_request=transport_request,status='pending')
    return order
```

---

## Django Conventions

### Model Naming

```python
# ✅ GOOD: Singular, PascalCase
class TransportOrder(models.Model):
    pass

# ❌ BAD: Plural or lowercase
class transport_orders(models.Model):
    pass
```

### Field Naming

```python
# ✅ GOOD: snake_case
class TransportOrder(models.Model):
    to_number = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    transport_request = models.ForeignKey('transport.TransportRequest')

# ❌ BAD: camelCase or inconsistent
class TransportOrder(models.Model):
    toNumber = models.CharField(max_length=50)
    createdAt = models.DateTimeField(auto_now_add=True)
```

### View Naming

```python
# ✅ GOOD: Descriptive names
class TransportOrderListView(ListView):
    pass

class TransportOrderCreateView(CreateView):
    pass

# ❌ BAD: Generic names
class View1(ListView):
    pass
```

---

## Import Organization

### Import Order

```python
# 1. Standard library imports
import os
from datetime import datetime

# 2. Third-party imports
from django.db import models
from rest_framework import serializers

# 3. Local application imports
from apps.transport.models import TransportOrder
from apps.core.services import NotificationService
```

### Import Style

```python
# ✅ GOOD: Specific imports
from django.db.models import Q, F
from rest_framework.response import Response

# ❌ BAD: Wildcard imports
from django.db.models import *
```

---

## Docstrings

### Function Docstrings

```python
# ✅ GOOD: Google style
def assign_vehicle(transport_order_id, vehicle_id, driver_id):
    """Assign vehicle to transport order.
    
    Args:
        transport_order_id: UUID of transport order
        vehicle_id: UUID of vehicle
        driver_id: UUID of driver
    
    Returns:
        TransportOrder: Updated transport order
    
    Raises:
        ValueError: If vehicle is not available
    """
    pass
```

### Class Docstrings

```python
# ✅ GOOD
class TransportOrderService:
    """Service for transport order operations.
    
    This service handles business logic for transport orders
    including assignment, status transitions, and notifications.
    """
    pass
```

---

## Code Organization

### File Structure

```python
# apps/transport/models.py
# 1. Imports
from django.db import models

# 2. Constants
STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('assigned', 'Assigned'),
]

# 3. Models
class TransportOrder(models.Model):
    pass

# 4. Managers
class TransportOrderManager(models.Manager):
    pass
```

### Class Organization

```python
class TransportOrder(models.Model):
    # 1. Fields
    to_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20)
    
    # 2. Meta class
    class Meta:
        db_table = 'transport_orders'
    
    # 3. Managers
    objects = TransportOrderManager()
    
    # 4. Methods (__str__, save, etc.)
    def __str__(self):
        return self.to_number
    
    # 5. Business logic methods
    def start_trip(self):
        pass
```

---

## Testing Style

### Test Naming

```python
# ✅ GOOD: Descriptive test names
def test_create_transport_order_with_valid_data():
    pass

def test_assign_vehicle_raises_error_when_unavailable():
    pass

# ❌ BAD: Generic names
def test1():
    pass
```

### Test Organization

```python
# ✅ GOOD: Organized test class
@pytest.mark.django_db
class TestTransportOrder:
    """Test TransportOrder model"""
    
    def test_create(self):
        """Test creating transport order"""
        pass
    
    def test_status_transition(self):
        """Test status transition"""
        pass
```

---

## Related Documentation

- **[Contributing Guidelines](./contributing.md)** - Contribution guidelines
- **[Code Organization](../architecture/code-organization.md)** - Code structure

---

**Last Updated**: 2026-02-13

