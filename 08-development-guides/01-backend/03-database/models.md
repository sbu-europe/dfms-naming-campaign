# Django ORM Models

> Low-level Django ORM models implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Data Model Overview](../../../04-architecture/01-system-design/data-architecture/data-model-overview.md)** - High-level entity definitions
- **[Data Models (JSON Schema)](../../../06-contracts/02-data-models/README.md)** - Contract definitions
- **[Data Dictionary](../../../10-reference/data-reference/data-dictionary.md)** - Complete business data dictionary

This document provides **Django ORM model implementation** (code, relationships, methods, managers).

---

## Overview

This document describes the Django ORM models implementation for DFMS. Models are organized by Django app and implement the entities defined in the submodule data models.

---

## Core Models

### User Model

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(AbstractBaseUser, PermissionsMixin):
    """User model with multi-tenant support"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='users')
    
    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    employee_id = models.CharField(max_length=50, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    profile_photo_url = models.URLField(null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('locked', 'Locked'),
        ],
        default='active'
    )
    
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(auto_now_add=True)
    
    roles = models.ManyToManyField('core.Role', related_name='users')
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='created_users')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, related_name='updated_users')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'tenant']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['tenant', 'status']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.email})"
    
    @property
    def is_locked(self):
        """Check if account is locked"""
        if self.locked_until:
            return timezone.now() < self.locked_until
        return False
```

### Tenant Model

```python
# apps/tenants/models.py
from django.db import models

class Tenant(models.Model):
    """Tenant model for multi-tenancy"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    schema_name = models.CharField(max_length=63, unique=True)
    name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=63, unique=True, null=True, blank=True)
    domain = models.CharField(max_length=255, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    subscription_plan = models.ForeignKey('core.SubscriptionPlan', on_delete=models.SET_NULL, null=True)
    settings = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenants'
    
    def __str__(self):
        return self.name
```

---

## Fleet Models

### Vehicle Model

```python
# apps/fleet/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Vehicle(models.Model):
    """Vehicle model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='vehicles')
    
    registration_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(
        max_length=50,
        choices=[
            ('covered_van', 'Covered Van'),
            ('open_truck', 'Open Truck'),
            ('container', 'Container'),
        ]
    )
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    capacity_cbm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    owner_type = models.CharField(
        max_length=20,
        choices=[
            ('own', 'Own'),
            ('vendor', 'Vendor'),
        ],
        default='own'
    )
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('assigned', 'Assigned'),
            ('in_transit', 'In Transit'),
            ('maintenance', 'Maintenance'),
            ('retired', 'Retired'),
        ],
        default='available'
    )
    
    driver = models.ForeignKey('fleet.Driver', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_vehicles')
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vehicles'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['registration_number']),
        ]
    
    def __str__(self):
        return f"{self.registration_number} ({self.vehicle_type})"
```

### Driver Model

```python
# apps/fleet/models.py
class Driver(models.Model):
    """Driver model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='drivers')
    
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    license_number = models.CharField(max_length=50)
    license_expiry = models.DateField()
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('assigned', 'Assigned'),
            ('on_leave', 'On Leave'),
            ('suspended', 'Suspended'),
        ],
        default='available'
    )
    
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)]
    )
    
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'drivers'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['license_number']),
        ]
    
    def __str__(self):
        return f"{self.full_name} ({self.license_number})"
```

---

## Transport Models

### Transport Request Model

```python
# apps/transport/models.py
from django.db import models
from decimal import Decimal

class TransportRequest(models.Model):
    """Transport Request (TR) model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='transport_requests')
    
    tr_number = models.CharField(max_length=50, unique=True)
    product_requisition = models.ForeignKey('products.ProductRequisition', on_delete=models.CASCADE, related_name='transport_requests')
    
    origin_poi = models.ForeignKey('master_data.POI', on_delete=models.CASCADE, related_name='origin_transport_requests')
    destination_poi = models.ForeignKey('master_data.POI', on_delete=models.CASCADE, related_name='destination_transport_requests')
    
    requested_date = models.DateTimeField()
    required_date = models.DateTimeField()
    
    total_weight_kg = models.DecimalField(max_digits=10, decimal_places=2)
    total_volume_cbm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('pending_approval', 'Pending Approval'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('cancelled', 'Cancelled'),
        ],
        default='draft'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='created_transport_requests')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transport_requests'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['tr_number']),
            models.Index(fields=['requested_date']),
        ]
    
    def __str__(self):
        return f"TR-{self.tr_number}"
```

### Transport Order Model

```python
# apps/transport/models.py
class TransportOrder(models.Model):
    """Transport Order (TO) model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='transport_orders')
    
    to_number = models.CharField(max_length=50, unique=True)
    transport_request = models.ForeignKey('transport.TransportRequest', on_delete=models.CASCADE, related_name='transport_orders')
    
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey('fleet.Driver', on_delete=models.SET_NULL, null=True, blank=True)
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('assigned', 'Assigned'),
            ('in_transit', 'In Transit'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )
    
    assigned_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transport_orders'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['to_number']),
            models.Index(fields=['vehicle', 'status']),
        ]
    
    def __str__(self):
        return f"TO-{self.to_number}"
```

### Trip Model

```python
# apps/transport/models.py
class Trip(models.Model):
    """Trip model"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='trips')
    
    trip_number = models.CharField(max_length=50, unique=True)
    transport_order = models.ForeignKey('transport.TransportOrder', on_delete=models.CASCADE, related_name='trips')
    
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.SET_NULL, null=True)
    driver = models.ForeignKey('fleet.Driver', on_delete=models.SET_NULL, null=True)
    
    origin_poi = models.ForeignKey('master_data.POI', on_delete=models.CASCADE, related_name='origin_trips')
    destination_poi = models.ForeignKey('master_data.POI', on_delete=models.CASCADE, related_name='destination_trips')
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('scheduled', 'Scheduled'),
            ('in_transit', 'In Transit'),
            ('at_origin', 'At Origin'),
            ('loading', 'Loading'),
            ('loaded', 'Loaded'),
            ('at_destination', 'At Destination'),
            ('unloading', 'Unloading'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='scheduled'
    )
    
    scheduled_start = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField()
    actual_end = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trips'
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['trip_number']),
            models.Index(fields=['vehicle', 'status']),
            models.Index(fields=['scheduled_start']),
        ]
    
    def __str__(self):
        return f"Trip-{self.trip_number}"
```

---

## Model Managers

### Custom Managers

```python
# apps/transport/managers.py
from django.db import models

class TransportOrderManager(models.Manager):
    """Custom manager for TransportOrder"""
    
    def active(self):
        """Get active transport orders"""
        return self.filter(status__in=['pending', 'assigned', 'in_transit'])
    
    def by_status(self, status):
        """Filter by status"""
        return self.filter(status=status)
    
    def by_vehicle(self, vehicle_id):
        """Filter by vehicle"""
        return self.filter(vehicle_id=vehicle_id)
    
    def pending_assignment(self):
        """Get orders pending vehicle assignment"""
        return self.filter(status='pending', vehicle__isnull=True)


# Usage in model
class TransportOrder(models.Model):
    # ... fields ...
    objects = TransportOrderManager()
```

---

## Model Methods

### Business Logic Methods

```python
# apps/transport/models.py
class TransportOrder(models.Model):
    # ... fields ...
    
    def can_assign_vehicle(self):
        """Check if vehicle can be assigned"""
        return self.status == 'pending' and self.vehicle is None
    
    def assign_vehicle(self, vehicle, driver=None):
        """Assign vehicle to transport order"""
        if not self.can_assign_vehicle():
            raise ValueError("Cannot assign vehicle to this order")
        
        self.vehicle = vehicle
        if driver:
            self.driver = driver
        self.status = 'assigned'
        self.assigned_at = timezone.now()
        self.save()
    
    def start_trip(self):
        """Start the trip"""
        if self.status != 'assigned':
            raise ValueError("Trip can only be started from assigned status")
        
        self.status = 'in_transit'
        self.started_at = timezone.now()
        self.save()
        
        # Create trip record
        Trip.objects.create(
            tenant=self.tenant,
            transport_order=self,
            vehicle=self.vehicle,
            driver=self.driver,
            origin_poi=self.transport_request.origin_poi,
            destination_poi=self.transport_request.destination_poi,
            status='in_transit',
            scheduled_start=self.started_at,
            scheduled_end=self.transport_request.required_date,
        )
```

---

## Model Relationships

### Foreign Key Relationships

```python
# Example relationships
TransportOrder.vehicle -> Vehicle (Many-to-One)
TransportOrder.driver -> Driver (Many-to-One)
TransportOrder.transport_request -> TransportRequest (Many-to-One)

Vehicle.driver -> Driver (Many-to-One, nullable)
Vehicle.vendor -> Vendor (Many-to-One, nullable)

User.roles -> Role (Many-to-Many)
Role.permissions -> Permission (Many-to-Many)
```

### Reverse Relationships

```python
# Access reverse relationships
vehicle.transport_orders.all()  # All transport orders for vehicle
driver.assigned_vehicles.all()  # All vehicles assigned to driver
user.created_transport_requests.all()  # All TRs created by user
```

---

## Database Indexes

### Index Strategy

```python
# Common indexes
class Meta:
    indexes = [
        # Tenant + status (common query pattern)
        models.Index(fields=['tenant', 'status']),
        
        # Unique identifier
        models.Index(fields=['tr_number']),
        
        # Date range queries
        models.Index(fields=['created_at']),
        
        # Foreign key lookups
        models.Index(fields=['vehicle', 'status']),
    ]
```

---

## Model Validation

### Custom Validators

```python
# apps/transport/validators.py
from django.core.exceptions import ValidationError

def validate_required_date(value):
    """Validate required date is in future"""
    if value < timezone.now():
        raise ValidationError('Required date must be in the future')


# Usage in model
class TransportRequest(models.Model):
    required_date = models.DateTimeField(validators=[validate_required_date])
```

---

## Model Signals

### Signal Handlers

```python
# apps/transport/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

@receiver(pre_save, sender=TransportOrder)
def generate_to_number(sender, instance, **kwargs):
    """Generate TO number before save"""
    if not instance.to_number:
        instance.to_number = f"TO-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


@receiver(post_save, sender=TransportOrder)
def create_trip_on_assignment(sender, instance, created, **kwargs):
    """Create trip when vehicle is assigned"""
    if instance.status == 'assigned' and instance.vehicle:
        # Create trip logic
        pass
```

---

## Testing

### Model Tests

```python
# tests/test_models.py
import pytest
from apps.transport.models import TransportOrder, TransportRequest

@pytest.mark.django_db
class TestTransportOrder:
    def test_to_number_generation(self):
        """Test TO number is auto-generated"""
        to = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=tr,
        )
        assert to.to_number.startswith('TO-')
    
    def test_assign_vehicle(self):
        """Test vehicle assignment"""
        to = TransportOrder.objects.create(...)
        vehicle = Vehicle.objects.create(...)
        
        to.assign_vehicle(vehicle)
        assert to.vehicle == vehicle
        assert to.status == 'assigned'
```

---

## RBAC Models

```python
# apps/core/models.py
import uuid
from django.db import models


class Role(models.Model):
    """Role definition — system predefined or tenant custom."""

    TIER_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('operational', 'Operational'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    department = models.CharField(max_length=100, null=True, blank=True)
    # tenant_id=None means system role shared across tenants
    tenant_id = models.UUIDField(null=True, blank=True)
    is_system_role = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    permissions = models.ManyToManyField(
        'Permission', through='RolePermission', related_name='roles'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, related_name='created_roles'
    )

    class Meta:
        db_table = 'roles'
        unique_together = [('code', 'tenant_id')]
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['tier']),
            models.Index(fields=['tenant_id']),
        ]

    def __str__(self):
        return f"{self.name} ({self.tier})"


class Permission(models.Model):
    """Atomic permission in Module.Feature.Action format."""

    ACTION_CHOICES = [
        ('Create', 'Create'), ('Read', 'Read'), ('Update', 'Update'),
        ('Delete', 'Delete'), ('Approve', 'Approve'), ('Export', 'Export'),
        ('Assign', 'Assign'), ('Configure', 'Configure'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    code = models.CharField(max_length=150, unique=True)  # Fleet.Vehicle.Create
    module = models.CharField(max_length=50)
    feature = models.CharField(max_length=50)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'permissions'
        indexes = [models.Index(fields=['module']), models.Index(fields=['code'])]

    def __str__(self):
        return self.code


class RolePermission(models.Model):
    """M2M junction: roles ↔ permissions."""

    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True
    )

    class Meta:
        db_table = 'role_permissions'
        unique_together = [('role', 'permission')]


class UserRole(models.Model):
    """M2M junction: users ↔ roles with functional flags."""

    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_roles')
    is_requester = models.BooleanField(default=False)
    is_approver = models.BooleanField(default=False)
    is_executor = models.BooleanField(default=False)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, related_name='role_assignments'
    )

    class Meta:
        db_table = 'user_roles'
        unique_together = [('user', 'role')]
```

---

## Auth Models

```python
# apps/users/models.py (continued)

class OTPRecord(models.Model):
    """Stores hashed OTPs for the 3-step login and invitation flows."""

    PURPOSE_CHOICES = [
        ('LOGIN', 'Login'),
        ('REGISTRATION', 'Registration'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('INVITATION', 'Invitation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_records')
    identifier = models.CharField(max_length=255)   # email or phone
    otp_hash = models.CharField(max_length=255)     # bcrypt of 6-digit OTP
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField()             # now() + 10 minutes
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=3)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_records'
        indexes = [
            models.Index(fields=['user', 'purpose']),
            models.Index(fields=['expires_at']),
        ]

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at

    @property
    def is_exhausted(self):
        return self.attempts >= self.max_attempts


class UserSession(models.Model):
    """Active JWT session tracking for revocation support."""

    STATUS_CHOICES = [
        ('active', 'Active'), ('expired', 'Expired'), ('revoked', 'Revoked')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    jti = models.CharField(max_length=255, unique=True)   # JWT ID for revocation
    device_info = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_active_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_sessions'
        indexes = [
            models.Index(fields=['jti']),
            models.Index(fields=['user', 'status']),
        ]


class InvitationToken(models.Model):
    """Email invitation tokens for onboarding new users."""

    STATUS_CHOICES = [
        ('pending', 'Pending'), ('accepted', 'Accepted'),
        ('expired', 'Expired'), ('revoked', 'Revoked'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    token = models.CharField(max_length=255, unique=True)
    invited_email = models.EmailField()
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')
    role = models.ForeignKey('core.Role', on_delete=models.SET_NULL, null=True)
    department = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_invitation')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invitation_tokens'
        indexes = [models.Index(fields=['token']), models.Index(fields=['status'])]
```

---

## Master Data Models

```python
# apps/master_data/models.py

class ProductCategory(models.Model):
    """Hierarchical product taxonomy."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    handling_requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_categories'

    def __str__(self):
        return f"{self.code} — {self.name}"


class Helper(models.Model):
    """Loading/unloading helper profiles."""

    STATUS_CHOICES = [
        ('available', 'Available'), ('on_trip', 'On Trip'),
        ('absent', 'Absent'), ('terminated', 'Terminated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    employee_id = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    vendor = models.ForeignKey('Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    availability_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'helpers'
        indexes = [models.Index(fields=['availability_status'])]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"


class Vendor(models.Model):
    """Third-party transport companies."""

    TYPE_CHOICES = [('contractual', 'Contractual'), ('non_contractual', 'Non-Contractual')]
    STATUS_CHOICES = [
        ('draft', 'Draft'), ('pending_verification', 'Pending Verification'),
        ('under_review', 'Under Review'), ('approved', 'Approved'),
        ('rejected', 'Rejected'), ('resubmitted', 'Resubmitted'),
        ('blacklisted', 'Blacklisted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    vendor_code = models.CharField(max_length=50, unique=True)
    company_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    vendor_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='non_contractual')
    registration_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    trade_license_number = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    bank_account_info = models.JSONField(default=dict)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True)
    contract_start_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='approved_vendors')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendors'
        indexes = [
            models.Index(fields=['registration_status']),
            models.Index(fields=['vendor_type']),
        ]

    def __str__(self):
        return f"{self.company_name} ({self.vendor_code})"


class VendorDocument(models.Model):
    """KYC/compliance documents for vendor registration."""

    TYPE_CHOICES = [
        ('trade_license', 'Trade License'), ('tax_certificate', 'Tax Certificate'),
        ('bank_statement', 'Bank Statement'), ('insurance', 'Insurance'),
        ('vehicle_registration', 'Vehicle Registration'), ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    document_number = models.CharField(max_length=100, blank=True)
    file_url = models.URLField()
    file_name = models.CharField(max_length=255)
    expiry_date = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vendor_documents'


class Supplier(models.Model):
    """Raw material / product supplier master data."""

    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('temporary', 'Temporary')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    supplier_code = models.CharField(max_length=50, unique=True)
    supplier_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    poi = models.ForeignKey('POI', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'suppliers'

    def __str__(self):
        return f"{self.supplier_name} ({self.supplier_code})"


class Dealer(models.Model):
    """Delivery recipient / distributor master data."""

    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('temporary', 'Temporary')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    dealer_code = models.CharField(max_length=50, unique=True)
    dealer_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    poi = models.ForeignKey('POI', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dealers'

    def __str__(self):
        return f"{self.dealer_name} ({self.dealer_code})"


class Route(models.Model):
    """Source→destination route with distance and rate card."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    route_name = models.CharField(max_length=255)
    source_poi = models.ForeignKey('POI', on_delete=models.PROTECT, related_name='outbound_routes')
    destination_poi = models.ForeignKey('POI', on_delete=models.PROTECT, related_name='inbound_routes')
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_duration_minutes = models.IntegerField(null=True, blank=True)
    vehicle_type = models.CharField(max_length=50, blank=True)  # blank = applies to all types
    rate_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rate_per_trip = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'routes'
        unique_together = [('source_poi', 'destination_poi', 'vehicle_type')]

    def __str__(self):
        return f"{self.route_name} ({self.distance_km} km)"
```

---

## Vendor Bid Models

```python
# apps/vendors/models.py

class BiddingParameters(models.Model):
    """Bidding window configuration per Transport Order."""

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'), ('open', 'Open'), ('closed', 'Closed'),
        ('awarded', 'Awarded'), ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    transport_order = models.OneToOneField(
        'transport.TransportOrder', on_delete=models.CASCADE, related_name='bidding_parameters'
    )
    bid_open_at = models.DateTimeField()
    bid_close_at = models.DateTimeField()
    max_bid_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    min_bid_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    auto_award_threshold = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    eligible_vendor_ids = models.JSONField(default=list)
    notify_all_eligible = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    awarded_bid = models.ForeignKey(
        'VendorBid', on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    awarded_at = models.DateTimeField(null=True, blank=True)
    awarded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bidding_parameters'


class VendorBid(models.Model):
    """Vendor bid on a Transport Order."""

    STATUS_CHOICES = [
        ('submitted', 'Submitted'), ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'), ('awarded', 'Awarded'),
        ('rejected', 'Rejected'), ('withdrawn', 'Withdrawn'), ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    transport_order = models.ForeignKey(
        'transport.TransportOrder', on_delete=models.CASCADE, related_name='vendor_bids'
    )
    vendor = models.ForeignKey('master_data.Vendor', on_delete=models.CASCADE, related_name='bids')
    bid_amount = models.DecimalField(max_digits=12, decimal_places=2)
    vehicle = models.ForeignKey('master_data.Vehicle', on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey('master_data.Driver', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_bids'
        unique_together = [('transport_order', 'vendor')]
        indexes = [models.Index(fields=['status'])]
```

---

## Gate Operations Models

```python
# apps/operations/models.py

class TemporaryParty(models.Model):
    """Unregistered supplier/dealer at gate."""

    STATUS_CHOICES = [('temporary', 'Temporary'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    TYPE_CHOICES = [('supplier', 'Supplier'), ('dealer', 'Dealer')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    party_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    party_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='temporary')
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='approved_temp_parties')
    approved_at = models.DateTimeField(null=True, blank=True)
    converted_to_supplier = models.ForeignKey('master_data.Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    converted_to_dealer = models.ForeignKey('master_data.Dealer', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'temporary_parties'


class GateEntry(models.Model):
    """Vehicle arrival with 13-state lifecycle."""

    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('awaiting_scale_in', 'Awaiting Scale In'),
        ('scale_in_complete', 'Scale In Complete'),
        ('awaiting_qc', 'Awaiting QC'),
        ('qc_in_progress', 'QC In Progress'),
        ('awaiting_loading', 'Awaiting Loading'),
        ('loading_in_progress', 'Loading In Progress'),
        ('awaiting_unloading', 'Awaiting Unloading'),
        ('unloading_in_progress', 'Unloading In Progress'),
        ('awaiting_scale_out', 'Awaiting Scale Out'),
        ('scale_out_complete', 'Scale Out Complete'),
        ('cleared_for_exit', 'Cleared for Exit'),
        ('gate_out_complete', 'Gate Out Complete'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    gate_in_number = models.CharField(max_length=50, unique=True)
    poi = models.ForeignKey('master_data.POI', on_delete=models.PROTECT)
    vehicle_number = models.CharField(max_length=50)
    vehicle_type = models.CharField(max_length=50, blank=True)
    document_category = models.CharField(max_length=30)
    document_number = models.CharField(max_length=100)
    product_code = models.CharField(max_length=100, blank=True)
    product_name = models.CharField(max_length=255, blank=True)
    declared_quantity = models.DecimalField(max_digits=12, decimal_places=3, null=True)
    uom = models.CharField(max_length=20, blank=True)
    driver_name = models.CharField(max_length=150)
    driver_contact = models.CharField(max_length=20, blank=True)
    party_name = models.CharField(max_length=255)
    party_type = models.CharField(max_length=20)
    gate_in_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='registered')
    routed_workflow = models.CharField(max_length=30, blank=True)
    transport_order = models.ForeignKey(
        'transport.TransportOrder', on_delete=models.SET_NULL, null=True, blank=True
    )
    trip = models.ForeignKey('transport.Trip', on_delete=models.SET_NULL, null=True, blank=True)
    temp_party = models.ForeignKey(TemporaryParty, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gate_entries'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['vehicle_number']),
            models.Index(fields=['gate_in_time']),
        ]

    def __str__(self):
        return f"{self.gate_in_number} — {self.vehicle_number}"


class ScaleInEntry(models.Model):
    """Gross weight measurement at inbound scale."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    gate_entry = models.ForeignKey(GateEntry, on_delete=models.PROTECT, related_name='scale_in_entries')
    poi = models.ForeignKey('master_data.POI', on_delete=models.PROTECT)
    vehicle_number = models.CharField(max_length=50)
    gross_weight_kg = models.DecimalField(max_digits=12, decimal_places=3)
    material_code = models.CharField(max_length=100, blank=True)
    material_name = models.CharField(max_length=255, blank=True)
    challan_number = models.CharField(max_length=100, blank=True)
    scale_in_time = models.DateTimeField(auto_now_add=True)
    operator = models.ForeignKey('users.User', on_delete=models.PROTECT)
    discrepancy_flag = models.BooleanField(default=False)
    discrepancy_type = models.CharField(max_length=30, blank=True)
    discrepancy_remarks = models.TextField(blank=True)
    status = models.CharField(max_length=30, default='recorded')
    transport_order = models.ForeignKey('transport.TransportOrder', on_delete=models.SET_NULL, null=True, blank=True)
    trip = models.ForeignKey('transport.Trip', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scale_in_entries'


class ScaleOutEntry(models.Model):
    """Tare weight, net weight computation and gate pass issuance."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    scale_in = models.ForeignKey(ScaleInEntry, on_delete=models.PROTECT)
    gate_entry = models.ForeignKey(GateEntry, on_delete=models.PROTECT, related_name='scale_out_entries')
    tare_weight_kg = models.DecimalField(max_digits=12, decimal_places=3)
    net_weight_kg = models.DecimalField(max_digits=12, decimal_places=3)  # gross - tare
    material_code = models.CharField(max_length=100, blank=True)
    pc_code = models.CharField(max_length=50, blank=True)
    scale_out_time = models.DateTimeField(auto_now_add=True)
    operator = models.ForeignKey('users.User', on_delete=models.PROTECT)
    gate_pass_token = models.CharField(max_length=100, unique=True)
    gate_pass_issued_at = models.DateTimeField(null=True)
    gate_pass_qr_code = models.TextField(blank=True)
    status = models.CharField(max_length=30, default='recorded')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scale_out_entries'
        indexes = [models.Index(fields=['gate_pass_token'])]
```

---

## QC Inspection Models

```python
# apps/qc/models.py

class QCChecklist(models.Model):
    """Inspection template per product/category."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    checklist_name = models.CharField(max_length=255)
    product = models.ForeignKey('master_data.Product', on_delete=models.SET_NULL, null=True, blank=True)
    product_category = models.ForeignKey('master_data.ProductCategory', on_delete=models.SET_NULL, null=True, blank=True)
    version = models.CharField(max_length=20, default='1.0')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qc_checklists'


class QCChecklistItem(models.Model):
    """Individual inspection criterion within a checklist."""

    CATEGORY_CHOICES = [('visual', 'Visual'), ('dimensional', 'Dimensional'), ('packaging', 'Packaging')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    checklist = models.ForeignKey(QCChecklist, on_delete=models.CASCADE, related_name='items')
    item_name = models.CharField(max_length=255)
    item_category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    item_description = models.TextField(blank=True)
    is_critical = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'qc_checklist_items'
        ordering = ['sort_order']


class QCEvent(models.Model):
    """Master QC record per shipment — 11-state lifecycle."""

    STATUS_CHOICES = [
        ('event_created', 'Event Created'),
        ('sample_collected', 'Sample Collected'),
        ('inspection_in_progress', 'Inspection In Progress'),
        ('lab_test_requested', 'Lab Test Requested'),
        ('lab_test_in_progress', 'Lab Test In Progress'),
        ('lab_results_received', 'Lab Results Received'),
        ('qc_pass', 'QC Pass'),
        ('qc_fail', 'QC Fail'),
        ('qc_recheck', 'QC Recheck'),
        ('qc_complete', 'QC Complete'),
        ('qc_auto_pass', 'QC Auto Pass'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qc_event_number = models.CharField(max_length=50, unique=True)
    gate_entry = models.ForeignKey('operations.GateEntry', on_delete=models.PROTECT)
    scale_in = models.ForeignKey('operations.ScaleInEntry', on_delete=models.SET_NULL, null=True, blank=True)
    vehicle_number = models.CharField(max_length=50)
    product_code = models.CharField(max_length=100, blank=True)
    net_weight_kg = models.DecimalField(max_digits=12, decimal_places=3, null=True)
    supplier_name = models.CharField(max_length=255, blank=True)
    priority = models.CharField(max_length=20, default='normal')
    checklist = models.ForeignKey(QCChecklist, on_delete=models.SET_NULL, null=True)
    assigned_inspector = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='event_created')
    final_decision = models.CharField(max_length=20, blank=True)
    decision_remarks = models.TextField(blank=True)
    decision_at = models.DateTimeField(null=True, blank=True)
    decided_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='qc_decisions')
    poi = models.ForeignKey('master_data.POI', on_delete=models.PROTECT)
    trip = models.ForeignKey('transport.Trip', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qc_events'
        indexes = [models.Index(fields=['status']), models.Index(fields=['poi', 'status'])]

    def __str__(self):
        return f"{self.qc_event_number} [{self.status}]"


class QCSample(models.Model):
    """Physical sample collected for a QC event."""

    STATUS_CHOICES = [
        ('collected', 'Collected'), ('in_inspection', 'In Inspection'),
        ('sent_to_lab', 'Sent to Lab'), ('disposed', 'Disposed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qc_event = models.ForeignKey(QCEvent, on_delete=models.CASCADE, related_name='samples')
    sample_type = models.CharField(max_length=100)
    sample_quantity = models.DecimalField(max_digits=10, decimal_places=3, null=True)
    sample_uom = models.CharField(max_length=20, blank=True)
    qr_code = models.CharField(max_length=100, unique=True, blank=True)
    collected_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    collected_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='collected')

    class Meta:
        db_table = 'qc_samples'


class QCInspection(models.Model):
    """Physical inspection execution per QC event."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qc_event = models.ForeignKey(QCEvent, on_delete=models.CASCADE, related_name='inspections')
    sample = models.ForeignKey(QCSample, on_delete=models.SET_NULL, null=True)
    checklist = models.ForeignKey(QCChecklist, on_delete=models.PROTECT)
    total_items = models.IntegerField(default=0)
    passed_items = models.IntegerField(default=0)
    failed_items = models.IntegerField(default=0)
    score_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    inspected_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    inspected_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='in_progress')

    class Meta:
        db_table = 'qc_inspections'

    @property
    def pass_rate(self):
        if self.total_items == 0:
            return 0
        return round((self.passed_items / self.total_items) * 100, 2)


class QCInspectionResult(models.Model):
    """Per-item pass/fail result within an inspection."""

    RESULT_CHOICES = [
        ('pass', 'Pass'), ('fail', 'Fail'), ('warning', 'Warning'), ('not_checked', 'Not Checked')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    inspection = models.ForeignKey(QCInspection, on_delete=models.CASCADE, related_name='results')
    item = models.ForeignKey(QCChecklistItem, on_delete=models.PROTECT)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES)
    remarks = models.TextField(blank=True)
    photo_evidence = models.URLField(blank=True)

    class Meta:
        db_table = 'qc_inspection_results'


class LabTestRequest(models.Model):
    """Lab analysis request for a QC sample."""

    STATUS_CHOICES = [
        ('requested', 'Requested'), ('in_progress', 'In Progress'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    qc_event = models.ForeignKey(QCEvent, on_delete=models.CASCADE, related_name='lab_requests')
    sample = models.ForeignKey(QCSample, on_delete=models.SET_NULL, null=True)
    priority = models.CharField(max_length=20, default='normal')
    requested_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    requested_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    assigned_lab_technician = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='lab_assignments')

    class Meta:
        db_table = 'lab_test_requests'
        indexes = [models.Index(fields=['status'])]


class LabTestResult(models.Model):
    """Individual lab test measurement outcome."""

    TEST_TYPE_CHOICES = [
        ('moisture', 'Moisture'), ('protein', 'Protein'), ('aflatoxin', 'Aflatoxin'),
        ('foreign_matter', 'Foreign Matter'), ('bulk_density', 'Bulk Density'),
        ('broken_grain_percentage', 'Broken Grain %'), ('pesticide_residue', 'Pesticide Residue'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    test_request = models.ForeignKey(LabTestRequest, on_delete=models.CASCADE, related_name='results')
    test_type = models.CharField(max_length=50, choices=TEST_TYPE_CHOICES)
    test_name = models.CharField(max_length=255)
    result_value = models.DecimalField(max_digits=12, decimal_places=4, null=True)
    result_unit = models.CharField(max_length=30, blank=True)
    pass_fail_status = models.CharField(max_length=10)
    threshold_min = models.DecimalField(max_digits=12, decimal_places=4, null=True)
    threshold_max = models.DecimalField(max_digits=12, decimal_places=4, null=True)
    tested_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    tested_at = models.DateTimeField(auto_now_add=True)
    report_pdf_url = models.URLField(blank=True)

    class Meta:
        db_table = 'lab_test_results'
```

---

## Trip Costing & Notification Models

```python
# apps/costing/models.py

class TripCost(models.Model):
    """Cost breakdown per trip."""

    FLEET_TYPE_CHOICES = [('own_fleet', 'Own Fleet'), ('vendor', 'Vendor')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    trip = models.OneToOneField('transport.Trip', on_delete=models.CASCADE, related_name='cost')
    fleet_type = models.CharField(max_length=20, choices=FLEET_TYPE_CHOICES)
    total_distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    # Own fleet fields
    cost_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    distance_based_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    fuel_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    fuel_liters = models.DecimalField(max_digits=10, decimal_places=3, null=True)
    maintenance_allocation = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    toll_ferry_parking = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    other_operational_charges = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    # Vendor fields
    vendor_trip_charge = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    vendor_additional_charges = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    # Summary
    total_trip_cost = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=3, default='BDT')
    entered_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    entered_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='approved_costs')
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trip_costs'

    def __str__(self):
        return f"Cost for {self.trip.trip_number}: {self.total_trip_cost} {self.currency}"


class VendorInvoice(models.Model):
    """Vendor billing record per trip."""

    STATUS_CHOICES = [
        ('draft', 'Draft'), ('submitted', 'Submitted'), ('approved', 'Approved'),
        ('rejected', 'Rejected'), ('paid', 'Paid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    invoice_number = models.CharField(max_length=50, unique=True)
    vendor = models.ForeignKey('master_data.Vendor', on_delete=models.PROTECT, related_name='invoices')
    trip = models.ForeignKey('transport.Trip', on_delete=models.SET_NULL, null=True, blank=True)
    transport_order = models.ForeignKey('transport.TransportOrder', on_delete=models.SET_NULL, null=True, blank=True)
    trip_cost = models.ForeignKey(TripCost, on_delete=models.SET_NULL, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=3, default='BDT')
    invoice_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    erp_sync_status = models.CharField(max_length=20, default='pending')
    erp_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_invoices'
        indexes = [models.Index(fields=['status']), models.Index(fields=['vendor', 'status'])]


# apps/notifications/models.py

class Notification(models.Model):
    """Multi-channel delivery log."""

    CHANNEL_CHOICES = [
        ('email', 'Email'), ('sms', 'SMS'), ('push', 'Push'), ('in_app', 'In-App'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('sent', 'Sent'), ('delivered', 'Delivered'), ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    recipient_user = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    recipient_vendor = models.ForeignKey('master_data.Vendor', on_delete=models.SET_NULL, null=True, blank=True)
    recipient_email = models.EmailField(blank=True)
    recipient_phone = models.CharField(max_length=20, blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    notification_type = models.CharField(max_length=60)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    reference_entity_type = models.CharField(max_length=50, blank=True)
    reference_entity_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    failed_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['recipient_user', 'status']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
```

---

## Related Documentation

- **[Database Implementation](../../../04-architecture/04-backend/database-implementation.md)** - PostgreSQL DDL
- **[Data Model Overview](../../../04-architecture/01-system-design/data-architecture/data-model-overview.md)** - High-level entities
- **[RBAC Specification](../../../05-modules/01-foundation/rbac.md)** - Role model detail
- **[Permission Catalog](../../../05-modules/01-foundation/permission-catalog-phase1.md)** - All 135 Phase 1 permissions

---

**Last Updated**: March 2026

