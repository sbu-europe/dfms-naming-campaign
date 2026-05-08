# Test Fixtures and Factories

> Low-level Django test fixtures and factory implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Testing Approach](../../../04-architecture/07-implementation/strategies/testing-approach.md)** - High-level testing strategy
- **[Testing Strategy](./testing-strategy.md)** - Django testing strategy

This document provides **test fixtures and factory patterns** (pytest fixtures, factory_boy factories, test data generation).

---

## Overview

Test fixtures and factories provide reusable test data. This document covers pytest fixtures, factory_boy factories, and test data generation patterns.

---

## Pytest Fixtures

### Base Fixtures

```python
# tests/conftest.py
import pytest
from django.contrib.auth import get_user_model
from apps.tenants.models import Tenant
from apps.transport.models import TransportOrder, TransportRequest
from apps.fleet.models import Vehicle, Driver

User = get_user_model()

@pytest.fixture(scope='function')
def tenant(db):
    """Create test tenant"""
    return Tenant.objects.create(
        name='Test Tenant',
        schema_name='test',
        is_active=True
    )

@pytest.fixture(scope='function')
def user(db, tenant):
    """Create test user"""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        tenant=tenant,
        status='active'
    )

@pytest.fixture(scope='function')
def admin_user(db, tenant):
    """Create admin user"""
    return User.objects.create_user(
        email='admin@example.com',
        password='adminpass123',
        tenant=tenant,
        is_admin=True,
        status='active'
    )
```

### Model Fixtures

```python
# tests/conftest.py
@pytest.fixture
def transport_request(db, tenant):
    """Create test transport request"""
    return TransportRequest.objects.create(
        tenant=tenant,
        tr_number='TR-TEST-001',
        status='pending',
        total_weight_kg=1000,
        total_volume_cbm=5.0
    )

@pytest.fixture
def transport_order(db, tenant, transport_request):
    """Create test transport order"""
    return TransportOrder.objects.create(
        tenant=tenant,
        transport_request=transport_request,
        to_number='TO-TEST-001',
        status='pending'
    )

@pytest.fixture
def vehicle(db, tenant):
    """Create test vehicle"""
    return Vehicle.objects.create(
        tenant=tenant,
        registration_number='TEST-001',
        status='available',
        capacity_kg=2000,
        capacity_cbm=10.0
    )

@pytest.fixture
def driver(db, tenant):
    """Create test driver"""
    return Driver.objects.create(
        tenant=tenant,
        full_name='Test Driver',
        phone='+1234567890',
        status='available'
    )
```

### API Client Fixtures

```python
# tests/conftest.py
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    """API client fixture"""
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, user):
    """Authenticated API client"""
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def admin_client(api_client, admin_user):
    """Admin API client"""
    api_client.force_authenticate(user=admin_user)
    return api_client
```

---

## Factory Boy Factories

### Factory Setup

```python
# tests/factories.py
import factory
from factory.django import DjangoModelFactory
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.transport.models import TransportOrder, TransportRequest
from apps.fleet.models import Vehicle, Driver

class TenantFactory(DjangoModelFactory):
    """Factory for Tenant"""
    class Meta:
        model = Tenant
    
    name = factory.Sequence(lambda n: f'Tenant {n}')
    schema_name = factory.Sequence(lambda n: f'tenant_{n}')
    is_active = True

class UserFactory(DjangoModelFactory):
    """Factory for User"""
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    tenant = factory.SubFactory(TenantFactory)
    status = 'active'

class TransportRequestFactory(DjangoModelFactory):
    """Factory for TransportRequest"""
    class Meta:
        model = TransportRequest
    
    tenant = factory.SubFactory(TenantFactory)
    tr_number = factory.Sequence(lambda n: f'TR-TEST-{n:03d}')
    status = 'pending'
    total_weight_kg = 1000
    total_volume_cbm = 5.0

class TransportOrderFactory(DjangoModelFactory):
    """Factory for TransportOrder"""
    class Meta:
        model = TransportOrder
    
    tenant = factory.SubFactory(TenantFactory)
    transport_request = factory.SubFactory(TransportRequestFactory)
    to_number = factory.Sequence(lambda n: f'TO-TEST-{n:03d}')
    status = 'pending'

class VehicleFactory(DjangoModelFactory):
    """Factory for Vehicle"""
    class Meta:
        model = Vehicle
    
    tenant = factory.SubFactory(TenantFactory)
    registration_number = factory.Sequence(lambda n: f'VEH-{n:03d}')
    status = 'available'
    capacity_kg = 2000
    capacity_cbm = 10.0

class DriverFactory(DjangoModelFactory):
    """Factory for Driver"""
    class Meta:
        model = Driver
    
    tenant = factory.SubFactory(TenantFactory)
    full_name = factory.Sequence(lambda n: f'Driver {n}')
    phone = factory.Sequence(lambda n: f'+123456789{n}')
    status = 'available'
```

### Factory Usage

```python
# tests/test_factories.py
import pytest
from tests.factories import (
    TenantFactory, UserFactory, TransportOrderFactory,
    VehicleFactory, DriverFactory
)

@pytest.mark.django_db
def test_factory_usage():
    """Test factory usage"""
    # Create single instance
    tenant = TenantFactory()
    assert tenant.name.startswith('Tenant')
    
    # Create with custom attributes
    user = UserFactory(email='custom@example.com')
    assert user.email == 'custom@example.com'
    
    # Create multiple instances
    orders = TransportOrderFactory.create_batch(5)
    assert len(orders) == 5
    
    # Create with related objects
    order = TransportOrderFactory(
        vehicle=VehicleFactory(),
        driver=DriverFactory()
    )
    assert order.vehicle is not None
    assert order.driver is not None
```

---

## Trait Factories

### Factory Traits

```python
# tests/factories.py
class TransportOrderFactory(DjangoModelFactory):
    """Factory for TransportOrder with traits"""
    class Meta:
        model = TransportOrder
    
    tenant = factory.SubFactory(TenantFactory)
    transport_request = factory.SubFactory(TransportRequestFactory)
    to_number = factory.Sequence(lambda n: f'TO-TEST-{n:03d}')
    status = 'pending'
    
    class Params:
        assigned = factory.Trait(
            status='assigned',
            vehicle=factory.SubFactory(VehicleFactory),
            driver=factory.SubFactory(DriverFactory)
        )
        
        in_transit = factory.Trait(
            status='in_transit',
            vehicle=factory.SubFactory(VehicleFactory),
            driver=factory.SubFactory(DriverFactory),
            started_at=factory.LazyFunction(timezone.now)
        )
        
        completed = factory.Trait(
            status='completed',
            vehicle=factory.SubFactory(VehicleFactory),
            driver=factory.SubFactory(DriverFactory),
            started_at=factory.LazyFunction(lambda: timezone.now() - timedelta(hours=2)),
            completed_at=factory.LazyFunction(timezone.now)
        )

# Usage
assigned_order = TransportOrderFactory(assigned=True)
in_transit_order = TransportOrderFactory(in_transit=True)
completed_order = TransportOrderFactory(completed=True)
```

---

## Faker Integration

### Using Faker

```python
# tests/factories.py
import factory
from faker import Faker

fake = Faker()

class UserFactory(DjangoModelFactory):
    """Factory with Faker"""
    class Meta:
        model = User
    
    email = factory.LazyAttribute(lambda obj: fake.email())
    first_name = factory.LazyAttribute(lambda obj: fake.first_name())
    last_name = factory.LazyAttribute(lambda obj: fake.last_name())
    phone = factory.LazyAttribute(lambda obj: fake.phone_number())
    tenant = factory.SubFactory(TenantFactory)

class DriverFactory(DjangoModelFactory):
    """Factory with Faker"""
    class Meta:
        model = Driver
    
    tenant = factory.SubFactory(TenantFactory)
    full_name = factory.LazyAttribute(lambda obj: fake.name())
    phone = factory.LazyAttribute(lambda obj: fake.phone_number())
    email = factory.LazyAttribute(lambda obj: fake.email())
    status = 'available'
```

---

## Related Documentation

- **[Testing Strategy](./testing-strategy.md)** - Overall testing approach
- **[Unit Tests](./unit-tests.md)** - Unit testing
- **[Integration Tests](./integration-tests.md)** - Integration testing

---

**Last Updated**: 2026-02-13

