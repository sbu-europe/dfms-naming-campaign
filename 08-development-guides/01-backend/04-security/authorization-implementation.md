# Authorization Implementation Details

> Low-level Django RBAC authorization implementation details

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Security Architecture](../../../04-architecture/00-overview/architecture-summary.md#6-security-first)** - High-level security
- **[Authorization Requirements](../../../02-domain/02-requirements/04-non-functional-requirements/non-functional-requirements.md#42-authorization)** - Authorization requirements
- **[Authorization Overview](../../../04-architecture/04-backend/authorization-implementation.md)** - Authorization implementation

This document provides **detailed RBAC authorization implementation** (permissions, roles, object-level permissions).

---

## Overview

This document covers the detailed implementation of RBAC authorization including permission checks, role management, and object-level authorization.

---

## Permission System

### Permission Model

```python
# apps/core/models.py
from django.db import models

class Permission(models.Model):
    """Permission model"""
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'permissions'
    
    def __str__(self):
        return self.name

class Role(models.Model):
    """Role model"""
    name = models.CharField(max_length=100)
    codename = models.CharField(max_length=100, unique=True)
    permissions = models.ManyToManyField(Permission, blank=True)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'roles'
        unique_together = [['codename', 'tenant']]
    
    def __str__(self):
        return self.name

class UserRole(models.Model):
    """User-Role relationship"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_roles'
        unique_together = [['user', 'role']]
```

---

## Permission Checks

### Permission Helper Functions

```python
# apps/core/permissions.py
from django.contrib.auth.models import Permission as DjangoPermission

def user_has_permission(user, permission_codename):
    """Check if user has permission"""
    # Check direct permissions
    if user.user_permissions.filter(codename=permission_codename).exists():
        return True
    
    # Check role permissions
    user_roles = user.user_roles.all()
    for user_role in user_roles:
        if user_role.role.permissions.filter(codename=permission_codename).exists():
            return True
    
    # Check admin status
    if user.is_admin:
        return True
    
    return False

def user_has_role(user, role_codename):
    """Check if user has role"""
    return user.user_roles.filter(role__codename=role_codename).exists()
```

---

## Object-Level Permissions

### Object Permission Check

```python
# apps/core/permissions.py
def user_can_access_object(user, obj, action='view'):
    """Check if user can access object"""
    # Check tenant ownership
    if hasattr(obj, 'tenant_id'):
        if obj.tenant_id != user.tenant_id:
            return False
    
    # Check ownership
    if hasattr(obj, 'created_by_id'):
        if obj.created_by_id == user.id:
            return True
    
    # Check role permissions
    permission_codename = f'{action}_{obj._meta.model_name}'
    return user_has_permission(user, permission_codename)
```

### Custom Permission Classes

```python
# apps/core/permissions.py
from rest_framework import permissions

class IsOwnerOrHasPermission(permissions.BasePermission):
    """Object-level permission: owner or has permission"""
    
    def has_object_permission(self, request, view, obj):
        # Owner can always access
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        
        # Check permission
        permission_codename = f'{view.action}_{obj._meta.model_name}'
        return user_has_permission(request.user, permission_codename)
```

---

## Role Management

### Role Assignment

```python
# apps/core/services.py
from apps.core.models import Role, UserRole

class RoleService:
    """Role management service"""
    
    @staticmethod
    def assign_role(user, role_codename):
        """Assign role to user"""
        role = Role.objects.get(
            codename=role_codename,
            tenant=user.tenant
        )
        
        UserRole.objects.get_or_create(
            user=user,
            role=role
        )
    
    @staticmethod
    def revoke_role(user, role_codename):
        """Revoke role from user"""
        UserRole.objects.filter(
            user=user,
            role__codename=role_codename
        ).delete()
    
    @staticmethod
    def get_user_permissions(user):
        """Get all permissions for user"""
        permissions = set()
        
        # Direct permissions
        for perm in user.user_permissions.all():
            permissions.add(perm.codename)
        
        # Role permissions
        for user_role in user.user_roles.all():
            for perm in user_role.role.permissions.all():
                permissions.add(perm.codename)
        
        return permissions
```

---

## Multi-Tenant Authorization

### Tenant-Aware Permission Check

```python
# apps/core/permissions.py
def user_can_access_tenant_resource(user, resource):
    """Check if user can access tenant resource"""
    # Ensure resource belongs to user's tenant
    if hasattr(resource, 'tenant_id'):
        if resource.tenant_id != user.tenant_id:
            return False
    
    return True

class TenantPermissionMixin:
    """Mixin for tenant-aware permissions"""
    
    def get_queryset(self):
        """Filter queryset by tenant"""
        queryset = super().get_queryset()
        return queryset.filter(tenant=self.request.user.tenant)
```

---

## Related Documentation

- **[Authorization Overview](../../../04-architecture/04-backend/authorization-implementation.md)** - Authorization implementation
- **[Security Checklist](./security-checklist.md)** - Security checklist

---

**Last Updated**: 2026-02-13

