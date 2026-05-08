# API Permissions Implementation

> Low-level Django REST Framework permission classes

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Security Architecture](../../../04-architecture/00-overview/architecture-summary.md#6-security-first)** - High-level security
- **[Authorization Requirements](../../DFMS-product-context/business-context/02-requirements/non-functional-requirements/non-functional-requirements.md#42-authorization)** - Authorization requirements

This document provides **DRF permission class implementation** (code, patterns, usage).

---

## Overview

DRF permission classes enforce authorization at the API level. Permissions work alongside Django's authentication system to control access to API endpoints and resources.

---

## Permission Class Patterns

### Base Permission Classes

```python
# apps/core/permissions.py
from rest_framework import permissions

class IsTenantUser(permissions.BasePermission):
    """Ensure user belongs to tenant"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request, 'tenant') and
            request.tenant == request.user.tenant
        )


class IsAuthenticatedAndActive(permissions.BasePermission):
    """Ensure user is authenticated and active"""
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.status == 'active'
        )
```

### Object-Level Permissions

```python
# apps/core/permissions.py
class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission: owner can edit, others can read"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for owner
        return obj.created_by == request.user


class IsTenantOwner(permissions.BasePermission):
    """Ensure object belongs to user's tenant"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Check tenant ownership
        if hasattr(obj, 'tenant_id'):
            return obj.tenant_id == request.user.tenant_id
        
        return True
```

---

## Module-Specific Permissions

### Transport Module Permissions

```python
# apps/transport/permissions.py
from rest_framework import permissions

class CanCreateTransportOrder(permissions.BasePermission):
    """Permission to create transport orders"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method == 'POST':
            return (
                request.user.has_perm('transport.create_transport_order') or
                request.user.is_admin
            )
        return True


class CanAssignVehicle(permissions.BasePermission):
    """Permission to assign vehicles"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return (
            request.user.has_perm('transport.assign_vehicle') or
            request.user.is_admin
        )


class CanManageTransportOrders(permissions.BasePermission):
    """Permission to manage transport orders"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.has_perm('transport.view_transport_order') or
                request.user.is_admin
            )
        
        return (
            request.user.has_perm('transport.change_transport_order') or
            request.user.is_admin
        )
```

### Fleet Module Permissions

```python
# apps/fleet/permissions.py
from rest_framework import permissions

class CanManageVehicles(permissions.BasePermission):
    """Permission to manage vehicles"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.has_perm('fleet.view_vehicle') or
                request.user.is_admin
            )
        
        return (
            request.user.has_perm('fleet.add_vehicle') or
            request.user.has_perm('fleet.change_vehicle') or
            request.user.is_admin
        )


class CanAssignDriver(permissions.BasePermission):
    """Permission to assign drivers"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return (
            request.user.has_perm('fleet.assign_driver') or
            request.user.is_admin
        )
```

---

## Permission Composition

### Combining Permissions

```python
# apps/transport/views.py
from rest_framework import viewsets
from apps.core.permissions import IsTenantUser
from apps.transport.permissions import CanManageTransportOrders, CanAssignVehicle

class TransportOrderViewSet(viewsets.ModelViewSet):
    """ViewSet with composed permissions"""
    
    permission_classes = [IsTenantUser, CanManageTransportOrders]
    
    def get_permissions(self):
        """Dynamic permissions based on action"""
        if self.action == 'assign_vehicle':
            return [IsTenantUser(), CanAssignVehicle()]
        return super().get_permissions()
```

### Permission Mixins

```python
# apps/core/mixins.py
from rest_framework import permissions

class TenantPermissionMixin:
    """Mixin to add tenant permission check"""
    
    def get_permissions(self):
        permissions = super().get_permissions()
        permissions.append(IsTenantUser())
        return permissions


# Usage
class TransportOrderViewSet(TenantPermissionMixin, viewsets.ModelViewSet):
    permission_classes = [CanManageTransportOrders]
```

---

## Permission Testing

### Permission Tests

```python
# tests/test_permissions.py
import pytest
from rest_framework.test import APIClient
from apps.users.models import User
from apps.core.models import Role, Permission

@pytest.mark.django_db
class TestPermissions:
    def test_permission_denied(self, user):
        """Test permission denied for unauthorized user"""
        client = APIClient()
        client.force_authenticate(user=user)
        
        response = client.post('/api/v1/transport-orders/', {})
        assert response.status_code == 403
    
    def test_permission_granted(self, admin_user):
        """Test permission granted for authorized user"""
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        response = client.post('/api/v1/transport-orders/', {})
        assert response.status_code != 403
    
    def test_object_level_permission(self, user, transport_order):
        """Test object-level permission"""
        client = APIClient()
        client.force_authenticate(user=user)
        
        # User can read
        response = client.get(f'/api/v1/transport-orders/{transport_order.id}/')
        assert response.status_code == 200
        
        # User cannot edit (not owner)
        response = client.patch(
            f'/api/v1/transport-orders/{transport_order.id}/',
            {'status': 'cancelled'}
        )
        assert response.status_code == 403
```

---

## Related Documentation

- **[Authorization Implementation](../architecture/authorization.md)** - Authorization implementation
- **[Viewsets](./viewsets.md)** - ViewSet implementation

---

**Last Updated**: 2026-02-13

