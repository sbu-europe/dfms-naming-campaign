# Testing Strategy

> Low-level Django testing implementation strategy

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../04-architecture/README.md)

- **[Testing Approach](../../04-architecture/07-implementation/strategies/testing-approach.md)** - High-level testing strategy
- **[User Stories](../../03-backlog/stories/README.md)** - Acceptance criteria

This document provides **Django-specific testing implementation** (pytest-django, test patterns, fixtures).

---

## Overview

DFMS uses pytest-django for unit and integration testing, with Playwright for E2E testing. The testing strategy follows the testing pyramid with emphasis on unit tests and critical path integration tests.

---

## Testing Tools

### Primary Tools

- **pytest**: Test framework
- **pytest-django**: Django integration for pytest
- **pytest-cov**: Coverage reporting
- **factory_boy**: Test data factories
- **Playwright**: E2E testing
- **faker**: Fake data generation

### Installation

```bash
pip install pytest pytest-django pytest-cov factory-boy faker
pip install playwright pytest-playwright
```

---

## Test Organization

### Directory Structure

```
tests/
├── conftest.py                # Shared fixtures and configuration
├── test_models.py            # Model tests
├── test_serializers.py       # Serializer tests
├── test_views.py             # View/ViewSet tests
├── test_services.py          # Service layer tests
├── test_permissions.py       # Permission tests
├── test_tasks.py             # Celery task tests
├── integration/              # Integration tests
│   ├── test_api_flows.py
│   └── test_workflows.py
└── e2e/                      # E2E tests (Playwright)
    ├── test_login.py
    └── test_transport_flow.py
```

### pytest Configuration

```python
# pytest.ini or pyproject.toml
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --cov=apps
    --cov-report=html
    --cov-report=term-missing
    --reuse-db
    --nomigrations
```

---

## Test Fixtures

### Base Fixtures

```python
# tests/conftest.py
import pytest
from django.contrib.auth import get_user_model
from apps.tenants.models import Tenant
from apps.core.models import Role, Permission
from apps.fleet.models import Vehicle, Driver

User = get_user_model()

@pytest.fixture
def tenant(db):
    """Create test tenant"""
    return Tenant.objects.create(
        schema_name='test_tenant',
        name='Test Tenant',
        subdomain='test'
    )

@pytest.fixture
def user(tenant):
    """Create test user"""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        full_name='Test User',
        tenant=tenant
    )

@pytest.fixture
def admin_user(tenant):
    """Create admin user"""
    user = User.objects.create_user(
        email='admin@example.com',
        password='adminpass123',
        full_name='Admin User',
        tenant=tenant
    )
    role = Role.objects.create(
        tenant=tenant,
        role_code='admin',
        role_name='Administrator'
    )
    user.roles.add(role)
    return user

@pytest.fixture
def vehicle(tenant):
    """Create test vehicle"""
    return Vehicle.objects.create(
        tenant=tenant,
        registration_number='ABC-1234',
        vehicle_type='covered_van',
        capacity_kg=5000,
        status='available'
    )

@pytest.fixture
def driver(tenant):
    """Create test driver"""
    return Driver.objects.create(
        tenant=tenant,
        full_name='Test Driver',
        phone='+1234567890',
        license_number='DL123456',
        license_expiry='2025-12-31',
        status='available'
    )
```

### Factory Boy Factories

```python
# tests/factories.py
import factory
from factory.django import DjangoModelFactory
from apps.users.models import User
from apps.fleet.models import Vehicle, Driver
from apps.transport.models import TransportOrder, TransportRequest

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    full_name = factory.Faker('name')
    tenant = factory.SubFactory('tests.factories.TenantFactory')

class VehicleFactory(DjangoModelFactory):
    class Meta:
        model = Vehicle
    
    registration_number = factory.Sequence(lambda n: f'VEH-{n:04d}')
    vehicle_type = 'covered_van'
    capacity_kg = 5000
    status = 'available'
    tenant = factory.SubFactory('tests.factories.TenantFactory')

class TransportOrderFactory(DjangoModelFactory):
    class Meta:
        model = TransportOrder
    
    tenant = factory.SubFactory('tests.factories.TenantFactory')
    transport_request = factory.SubFactory('tests.factories.TransportRequestFactory')
    status = 'pending'
```

---

## Unit Tests

### Model Tests

```python
# tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from apps.transport.models import TransportOrder
from apps.transport.exceptions import InvalidStatusTransitionError

@pytest.mark.django_db
class TestTransportOrder:
    def test_to_number_generation(self, tenant, transport_request):
        """Test TO number is auto-generated"""
        to = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
        )
        assert to.to_number.startswith('TO-')
        assert len(to.to_number) > 10
    
    def test_assign_vehicle(self, tenant, transport_order, vehicle):
        """Test vehicle assignment"""
        transport_order.assign_vehicle(vehicle)
        
        assert transport_order.vehicle == vehicle
        assert transport_order.status == 'assigned'
        assert transport_order.assigned_at is not None
    
    def test_invalid_status_transition(self, transport_order):
        """Test invalid status transition"""
        transport_order.status = 'completed'
        transport_order.save()
        
        # Try to go back to pending
        with pytest.raises(ValidationError):
            transport_order.status = 'pending'
            transport_order.full_clean()
```

### Serializer Tests

```python
# tests/test_serializers.py
import pytest
from apps.transport.serializers import TransportOrderSerializer
from apps.transport.models import TransportOrder

@pytest.mark.django_db
class TestTransportOrderSerializer:
    def test_serializer_validation(self, tenant, transport_request):
        """Test serializer validation"""
        data = {
            'transport_request': str(transport_request.id),
            'vehicle_id': None,
        }
        
        serializer = TransportOrderSerializer(data=data)
        assert serializer.is_valid()
    
    def test_serializer_invalid_vehicle(self, tenant, transport_request):
        """Test invalid vehicle validation"""
        data = {
            'transport_request': str(transport_request.id),
            'vehicle_id': 'invalid-uuid',
        }
        
        serializer = TransportOrderSerializer(data=data)
        assert not serializer.is_valid()
        assert 'vehicle_id' in serializer.errors
```

### Service Tests

```python
# tests/test_services.py
import pytest
from apps.transport.services import TransportOrderService
from apps.transport.exceptions import VehicleNotAvailableError

@pytest.mark.django_db
class TestTransportOrderService:
    def test_assign_vehicle_success(self, transport_order, vehicle):
        """Test successful vehicle assignment"""
        result = TransportOrderService.assign_vehicle(
            str(transport_order.id),
            str(vehicle.id)
        )
        
        assert result.vehicle == vehicle
        assert result.status == 'assigned'
    
    def test_assign_unavailable_vehicle(self, transport_order, vehicle):
        """Test assigning unavailable vehicle"""
        vehicle.status = 'assigned'
        vehicle.save()
        
        with pytest.raises(VehicleNotAvailableError):
            TransportOrderService.assign_vehicle(
                str(transport_order.id),
                str(vehicle.id)
            )
```

---

## Integration Tests

### API Integration Tests

```python
# tests/integration/test_api_flows.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status

@pytest.mark.django_db
class TestTransportOrderAPI:
    def test_create_transport_order(self, admin_user, transport_request):
        """Test creating transport order via API"""
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        response = client.post('/api/v1/transport-orders/', {
            'transport_request': str(transport_request.id),
        })
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'to_number' in response.data
    
    def test_assign_vehicle(self, admin_user, transport_order, vehicle):
        """Test vehicle assignment via API"""
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        response = client.post(
            f'/api/v1/transport-orders/{transport_order.id}/assign_vehicle/',
            {'vehicle_id': str(vehicle.id)}
        )
        
        assert response.status_code == status.HTTP_200_OK
        transport_order.refresh_from_db()
        assert transport_order.vehicle == vehicle
```

### Workflow Integration Tests

```python
# tests/integration/test_workflows.py
import pytest
from apps.transport.models import TransportRequest, TransportOrder, Trip

@pytest.mark.django_db
class TestTransportWorkflow:
    def test_complete_transport_workflow(self, tenant, user):
        """Test complete transport workflow"""
        # 1. Create Transport Request
        tr = TransportRequest.objects.create(
            tenant=tenant,
            # ... fields
        )
        
        # 2. Create Transport Order
        to = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=tr,
        )
        
        # 3. Assign Vehicle
        vehicle = Vehicle.objects.create(...)
        to.assign_vehicle(vehicle)
        
        # 4. Start Trip
        to.start_trip()
        
        # 5. Verify Trip Created
        assert Trip.objects.filter(transport_order=to).exists()
        trip = Trip.objects.get(transport_order=to)
        assert trip.status == 'in_transit'
```

---

## E2E Tests (Playwright)

### Playwright Configuration

```python
# pytest.ini
[pytest]
playwright_browser = chromium
playwright_browser_channel = 
playwright_headed = false
```

### E2E Test Example

```python
# tests/e2e/test_transport_flow.py
import pytest
from playwright.sync_api import Page, expect

@pytest.mark.e2e
def test_create_transport_order(page: Page, live_server):
    """Test creating transport order via UI"""
    # Login
    page.goto(f"{live_server.url}/login")
    page.fill('input[name="email"]', 'admin@example.com')
    page.fill('input[name="password"]', 'adminpass123')
    page.click('button[type="submit"]')
    
    # Navigate to Transport Orders
    page.click('text=Transport Orders')
    
    # Create new order
    page.click('text=Create Transport Order')
    page.select_option('select[name="transport_request"]', 'TR-001')
    page.click('button:has-text("Create")')
    
    # Verify order created
    expect(page.locator('text=TO-')).to_be_visible()
```

---

## Test Coverage

### Coverage Configuration

```python
# .coveragerc
[run]
source = apps
omit = 
    */migrations/*
    */tests/*
    */venv/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
```

### Coverage Targets

- **Overall**: 80% minimum
- **Critical paths**: 100% coverage
- **Models**: 90% coverage
- **Services**: 85% coverage
- **Views**: 80% coverage

---

## Test Data Management

### Test Database

```python
# settings/test.py
from .base import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dfms_test',
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

# Use in-memory cache for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

### Test Fixtures Management

```python
# tests/conftest.py
@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Enable database access for all tests"""
    pass

@pytest.fixture(scope='function')
def clean_cache():
    """Clear cache before each test"""
    from django.core.cache import cache
    cache.clear()
    yield
    cache.clear()
```

---

## Running Tests

### Commands

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps --cov-report=html

# Run specific test file
pytest tests/test_models.py

# Run specific test
pytest tests/test_models.py::TestTransportOrder::test_assign_vehicle

# Run with verbose output
pytest -v

# Run only failed tests
pytest --lf

# Run E2E tests
pytest tests/e2e/ -m e2e
```

---

## Related Documentation

- **[Testing Approach](../../04-architecture/07-implementation/strategies/testing-approach.md)** - High-level testing strategy
- **[Unit Tests](../../08-development-guides/01-backend/06-testing/unit-tests.md)** - Detailed unit testing (to be created)
- **[Integration Tests](../../08-development-guides/01-backend/06-testing/integration-tests.md)** - Detailed integration testing (to be created)

---

**Last Updated**: 2026-02-13

