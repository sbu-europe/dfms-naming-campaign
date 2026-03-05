# Authorization Implementation

> Low-level Django authorization and permissions implementation

## 📖 High-Level Context

> **Source of Truth**: [`05-architecture/`](../)

- **[Security Architecture](../00-overview/architecture-summary.md#6-security-first)** - High-level security approach
- **[Non-Functional Requirements](../../DFMS-product-context/02-domain/02-requirements/non-functional-requirements/non-functional-requirements.md#42-authorization)** - Authorization requirements
- **[User Story US-007](../../DFMS-product-context/02-domain/03-features/phase-1/user-stories/US-007-user-role-management.md)** - RBAC requirements

This document provides **Django-specific authorization implementation** (permission classes, RBAC code, middleware).

---

## Overview

DFMS implements Role-Based Access Control (RBAC) using Django's permission system with custom permission classes. The authorization system supports tenant-aware permissions, resource-level access control, and fine-grained permissions per module.

---

## Permission Classes

### Base Permission Classes

```python
# apps/core/permissions.py
from rest_framework import permissions

class IsTenantUser(permissions.BasePermission):
    """Ensure user belongs to the tenant"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check tenant match
        tenant_id = request.user.tenant_id
        request_tenant_id = getattr(request, 'tenant_id', None)
        
        return tenant_id == request_tenant_id


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission to only allow owners"""
    
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
        
        # Check if object has tenant field
        if hasattr(obj, 'tenant_id'):
            return obj.tenant_id == request.user.tenant_id
        
        return True
```

### Role-Based Permission Classes

```python
# apps/core/permissions.py
class IsTransportManager(permissions.BasePermission):
    """Permission for Transport Manager role"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_role('transport_manager') or request.user.is_admin


class IsDriver(permissions.BasePermission):
    """Permission for Driver role"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_role('driver')


class IsQCSupervisor(permissions.BasePermission):
    """Permission for QC Supervisor role"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_role('qc_supervisor') or request.user.is_admin


class IsFinanceTeam(permissions.BasePermission):
    """Permission for Finance Team role"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_role('finance_officer') or request.user.has_role('finance_manager')
```

### Module-Specific Permission Classes

```python
# apps/fleet/permissions.py
from rest_framework import permissions

class CanManageVehicles(permissions.BasePermission):
    """Permission to manage vehicles"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check specific permission
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return request.user.has_perm('fleet.add_vehicle') or request.user.is_admin
        
        return request.user.has_perm('fleet.view_vehicle') or request.user.is_admin


class CanAssignDriver(permissions.BasePermission):
    """Permission to assign drivers to vehicles"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_perm('fleet.assign_driver') or request.user.is_admin


# apps/transport/permissions.py
class CanCreateTransportOrder(permissions.BasePermission):
    """Permission to create transport orders"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_perm('transport.create_transport_order') or request.user.is_admin


class CanAssignVehicle(permissions.BasePermission):
    """Permission to assign vehicles to transport orders"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return request.user.has_perm('transport.assign_vehicle') or request.user.is_admin
```

---

## User Model Permission Methods

### User Model Extensions

```python
# apps/users/models.py
from django.contrib.auth.models import PermissionsMixin
from django.db import models

class User(AbstractBaseUser, PermissionsMixin):
    """User model with RBAC methods"""
    
    email = models.EmailField(unique=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    roles = models.ManyToManyField('core.Role', related_name='users')
    
    def has_role(self, role_code):
        """Check if user has specific role"""
        return self.roles.filter(role_code=role_code).exists()
    
    def has_any_role(self, role_codes):
        """Check if user has any of the specified roles"""
        return self.roles.filter(role_code__in=role_codes).exists()
    
    def get_all_permissions(self):
        """Get all permissions for user (from roles)"""
        permissions = set()
        
        # Get permissions from roles
        for role in self.roles.all():
            permissions.update(role.permissions.values_list('permission_code', flat=True))
        
        # Add user-specific permissions
        permissions.update(self.user_permissions.values_list('codename', flat=True))
        
        return permissions
    
    def has_module_permission(self, module_code):
        """Check if user has any permission in module"""
        return self.get_all_permissions().filter(
            startswith=f'{module_code}.'
        ).exists()
    
    @property
    def is_admin(self):
        """Check if user is admin"""
        return self.has_role('admin') or self.is_superuser
```

---

## Role and Permission Models

### Role Model

```python
# apps/core/models.py
from django.db import models

class Role(models.Model):
    """Role model"""
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    role_code = models.CharField(max_length=50)
    role_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_system_role = models.BooleanField(default=False)
    
    permissions = models.ManyToManyField('core.Permission', related_name='roles')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['tenant', 'role_code']
        db_table = 'roles'
    
    def __str__(self):
        return f"{self.role_name} ({self.tenant.name})"


class Permission(models.Model):
    """Permission model"""
    
    permission_code = models.CharField(max_length=100, unique=True)
    permission_name = models.CharField(max_length=255)
    module = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'permissions'
        ordering = ['module', 'permission_code']
    
    def __str__(self):
        return self.permission_code
```

---

## ViewSet Permission Usage

### Example: Vehicle ViewSet

```python
# apps/fleet/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from apps.fleet.models import Vehicle
from apps.fleet.serializers import VehicleSerializer
from apps.fleet.permissions import CanManageVehicles, CanAssignDriver
from apps.core.permissions import IsTenantUser

class VehicleViewSet(viewsets.ModelViewSet):
    """Vehicle management viewset"""
    
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    
    permission_classes = [
        IsTenantUser,
        CanManageVehicles,
    ]
    
    def get_queryset(self):
        """Filter by tenant"""
        return Vehicle.objects.filter(tenant=self.request.user.tenant)
    
    @action(detail=True, methods=['post'], permission_classes=[CanAssignDriver])
    def assign_driver(self, request, pk=None):
        """Assign driver to vehicle"""
        vehicle = self.get_object()
        driver_id = request.data.get('driver_id')
        
        # Implementation
        vehicle.driver_id = driver_id
        vehicle.save()
        
        return Response({'message': 'Driver assigned'})
```

### Example: Transport Order ViewSet

```python
# apps/transport/views.py
from rest_framework import viewsets
from apps.transport.models import TransportOrder
from apps.transport.serializers import TransportOrderSerializer
from apps.transport.permissions import CanCreateTransportOrder, CanAssignVehicle
from apps.core.permissions import IsTenantUser

class TransportOrderViewSet(viewsets.ModelViewSet):
    """Transport Order management viewset"""
    
    queryset = TransportOrder.objects.all()
    serializer_class = TransportOrderSerializer
    
    permission_classes = [
        IsTenantUser,
        CanCreateTransportOrder,
    ]
    
    def get_permissions(self):
        """Dynamic permissions based on action"""
        if self.action == 'assign_vehicle':
            return [IsTenantUser(), CanAssignVehicle()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def assign_vehicle(self, request, pk=None):
        """Assign vehicle to transport order"""
        transport_order = self.get_object()
        vehicle_id = request.data.get('vehicle_id')
        
        # Implementation
        transport_order.vehicle_id = vehicle_id
        transport_order.save()
        
        return Response({'message': 'Vehicle assigned'})
```

---

## Permission Decorators

### Custom Permission Decorators

```python
# apps/core/decorators.py
from functools import wraps
from rest_framework.exceptions import PermissionDenied

def require_permission(permission_code):
    """Decorator to require specific permission"""
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_perm(permission_code):
                raise PermissionDenied(
                    f'Permission required: {permission_code}'
                )
            return func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_role(role_code):
    """Decorator to require specific role"""
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_role(role_code):
                raise PermissionDenied(
                    f'Role required: {role_code}'
                )
            return func(request, *args, **kwargs)
        return wrapper
    return decorator


# Usage
@require_permission('transport.create_transport_order')
def create_transport_order(request):
    # Implementation
    pass
```

---

## Permission Checking Utilities

### Permission Checker Utility

```python
# apps/core/utils.py
class PermissionChecker:
    """Utility class for permission checking"""
    
    @staticmethod
    def check_permission(user, permission_code):
        """Check if user has permission"""
        return user.has_perm(permission_code) or user.is_admin
    
    @staticmethod
    def check_role(user, role_code):
        """Check if user has role"""
        return user.has_role(role_code) or user.is_admin
    
    @staticmethod
    def check_module_access(user, module_code):
        """Check if user has access to module"""
        return user.has_module_permission(module_code) or user.is_admin
    
    @staticmethod
    def filter_by_permission(queryset, user, permission_code):
        """Filter queryset based on permission"""
        if user.has_perm(permission_code) or user.is_admin:
            return queryset
        return queryset.none()
```

---

## API Permission Endpoints

### Permission Check Endpoint

```python
# apps/core/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_permission(request):
    """Check if user has specific permission"""
    permission_code = request.query_params.get('permission')
    
    if not permission_code:
        return Response(
            {'error': 'permission parameter required'},
            status=400
        )
    
    has_permission = request.user.has_perm(permission_code)
    
    return Response({
        'permission': permission_code,
        'has_permission': has_permission
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions(request):
    """Get all permissions for current user"""
    permissions = request.user.get_all_permissions()
    
    return Response({
        'permissions': list(permissions),
        'roles': [role.role_code for role in request.user.roles.all()]
    })
```

---

## Testing

### Permission Tests

```python
# tests/test_permissions.py
import pytest
from rest_framework.test import APIClient
from apps.core.models import Role, Permission
from apps.users.models import User

@pytest.mark.django_db
class TestPermissions:
    def test_role_based_permission(self):
        """Test role-based permission"""
        user = User.objects.create_user(email='test@example.com')
        role = Role.objects.create(role_code='transport_manager')
        permission = Permission.objects.create(
            permission_code='transport.create_transport_order'
        )
        role.permissions.add(permission)
        user.roles.add(role)
        
        assert user.has_perm('transport.create_transport_order') == True
    
    def test_permission_class(self):
        """Test permission class"""
        client = APIClient()
        user = User.objects.create_user(email='test@example.com')
        client.force_authenticate(user=user)
        
        # User without permission
        response = client.post('/api/v1/transport-orders/', {})
        assert response.status_code == 403
        
        # Grant permission
        role = Role.objects.create(role_code='transport_manager')
        permission = Permission.objects.create(
            permission_code='transport.create_transport_order'
        )
        role.permissions.add(permission)
        user.roles.add(role)
        
        response = client.post('/api/v1/transport-orders/', {})
        assert response.status_code != 403
```

---

## Security Considerations

### Authorization Best Practices
- ✅ Always check permissions at view level
- ✅ Validate tenant ownership for all resources
- ✅ Use object-level permissions for sensitive operations
- ✅ Log all authorization decisions
- ✅ Fail securely (deny by default)

### Multi-Tenant Security
- ✅ Tenant isolation enforced at permission level
- ✅ Tenant context validated in all queries
- ✅ Cross-tenant access prevented

---

## Related Documentation

- **[Authentication Implementation](./authentication.md)** - Authentication implementation
- **[API Reference](../api/api-reference.md)** - API authorization endpoints
- **[Security Testing](../guides/security-testing.md)** - Security testing guide

---

**Last Updated**: 2026-02-13

