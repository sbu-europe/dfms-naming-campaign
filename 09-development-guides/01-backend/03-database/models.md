# Django ORM Models

> Low-level Django ORM models implementation

## 📖 High-Level Context

> **Source of Truth**: [`05-architecture/`](../../../05-architecture/)

- **[Data Model Overview](../../../05-architecture/01-architecture/data-architecture/data-model-overview.md)** - High-level entity definitions
- **[Data Models (JSON Schema)](../../../06-contracts/data-models/)** - Contract definitions
- **[Data Dictionary](../../DFMS-product-context/business-context/05-data-reference/data-dictionary.md)** - Complete business data dictionary

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

## Related Documentation

- **[Database Design](../architecture/database-design.md)** - PostgreSQL schema design
- **[Data Model Overview](../../../05-architecture/01-architecture/data-architecture/data-model-overview.md)** - High-level entities

---

**Last Updated**: 2026-02-13

