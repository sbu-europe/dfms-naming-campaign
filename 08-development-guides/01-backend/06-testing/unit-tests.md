# Unit Tests Implementation

> Low-level Django unit testing implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Testing Approach](../../../04-architecture/07-implementation/strategies/testing-approach.md)** - High-level testing strategy
- **[Testing Strategy](../..../../../../09-testing/strategy/testing-strategy.md)** - Django testing strategy

This document provides **pytest unit test implementation** (models, services, utilities).

---

## Overview

Unit tests verify individual components in isolation. This document covers pytest-django setup, model tests, service tests, and utility tests.

---

## Test Configuration

### pytest.ini

```ini
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
python_files = tests.py test_*.py *_tests.py
python_classes = Test*
python_functions = test_*
addopts = 
    --verbose
    --strict-markers
    --tb=short
    --reuse-db
    --nomigrations
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
```

### conftest.py

```python
# tests/conftest.py
import pytest
from django.contrib.auth import get_user_model
from apps.tenants.models import Tenant
from apps.transport.models import TransportOrder, TransportRequest

User = get_user_model()

@pytest.fixture
def tenant(db):
    """Create test tenant"""
    return Tenant.objects.create(
        name='Test Tenant',
        schema_name='test',
        is_active=True
    )

@pytest.fixture
def user(db, tenant):
    """Create test user"""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        tenant=tenant,
        status='active'
    )

@pytest.fixture
def transport_request(db, tenant):
    """Create test transport request"""
    return TransportRequest.objects.create(
        tenant=tenant,
        tr_number='TR-TEST-001',
        status='pending'
    )
```

---

## Model Tests

### Model Validation Tests

```python
# tests/unit/test_models.py
import pytest
from django.core.exceptions import ValidationError
from apps.transport.models import TransportOrder

@pytest.mark.django_db
@pytest.mark.unit
class TestTransportOrderModel:
    """Unit tests for TransportOrder model"""
    
    def test_create_transport_order(self, tenant, transport_request):
        """Test creating transport order"""
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        assert order.to_number == 'TO-TEST-001'
        assert order.status == 'pending'
        assert order.tenant == tenant
    
    def test_to_number_uniqueness(self, tenant, transport_request):
        """Test TO number uniqueness"""
        TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        with pytest.raises(Exception):  # IntegrityError
            TransportOrder.objects.create(
                tenant=tenant,
                transport_request=transport_request,
                to_number='TO-TEST-001',
                status='pending'
            )
    
    def test_status_transition(self, tenant, transport_request):
        """Test status transition"""
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        # Valid transition
        order.status = 'assigned'
        order.save()
        assert order.status == 'assigned'
        
        # Invalid transition
        order.status = 'completed'
        with pytest.raises(ValidationError):
            order.full_clean()
```

### Model Method Tests

```python
# tests/unit/test_models.py
@pytest.mark.django_db
@pytest.mark.unit
class TestTransportOrderMethods:
    """Test TransportOrder model methods"""
    
    def test_start_trip(self, tenant, transport_request):
        """Test start_trip method"""
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='assigned'
        )
        
        order.start_trip()
        
        assert order.status == 'in_transit'
        assert order.started_at is not None
    
    def test_start_trip_invalid_status(self, tenant, transport_request):
        """Test start_trip with invalid status"""
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        with pytest.raises(ValueError, match='Cannot start trip'):
            order.start_trip()
```

---

## Service Tests

### Service Method Tests

```python
# tests/unit/test_services.py
import pytest
from unittest.mock import Mock, patch
from apps.transport.services import TransportOrderService

@pytest.mark.django_db
@pytest.mark.unit
class TestTransportOrderService:
    """Unit tests for TransportOrderService"""
    
    def test_assign_vehicle(self, tenant, transport_request):
        """Test vehicle assignment"""
        from apps.fleet.models import Vehicle, Driver
        
        vehicle = Vehicle.objects.create(
            tenant=tenant,
            registration_number='ABC-123',
            status='available'
        )
        
        driver = Driver.objects.create(
            tenant=tenant,
            full_name='Test Driver',
            phone='+1234567890'
        )
        
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        result = TransportOrderService.assign_vehicle(
            str(order.id),
            str(vehicle.id),
            str(driver.id)
        )
        
        assert result.status == 'assigned'
        assert result.vehicle == vehicle
        assert result.driver == driver
    
    @patch('apps.transport.services.EmailService')
    def test_assign_vehicle_sends_notification(self, mock_email, tenant, transport_request):
        """Test notification sent on vehicle assignment"""
        from apps.fleet.models import Vehicle, Driver
        
        vehicle = Vehicle.objects.create(
            tenant=tenant,
            registration_number='ABC-123',
            status='available'
        )
        
        driver = Driver.objects.create(
            tenant=tenant,
            full_name='Test Driver',
            phone='+1234567890'
        )
        
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        TransportOrderService.assign_vehicle(
            str(order.id),
            str(vehicle.id),
            str(driver.id)
        )
        
        mock_email.send_transport_order_assigned.assert_called_once()
```

---

## Utility Tests

### Helper Function Tests

```python
# tests/unit/test_utils.py
import pytest
from apps.core.utils import generate_to_number, validate_phone_number

@pytest.mark.unit
class TestUtils:
    """Unit tests for utility functions"""
    
    def test_generate_to_number(self):
        """Test TO number generation"""
        to_number = generate_to_number()
        
        assert to_number.startswith('TO-')
        assert len(to_number) == 20
    
    def test_validate_phone_number_valid(self):
        """Test valid phone number"""
        assert validate_phone_number('+1234567890') == True
        assert validate_phone_number('+441234567890') == True
    
    def test_validate_phone_number_invalid(self):
        """Test invalid phone number"""
        assert validate_phone_number('123') == False
        assert validate_phone_number('abc') == False
```

---

## Serializer Tests

### Serializer Validation Tests

```python
# tests/unit/test_serializers.py
import pytest
from apps.transport.serializers import TransportOrderSerializer

@pytest.mark.django_db
@pytest.mark.unit
class TestTransportOrderSerializer:
    """Unit tests for TransportOrderSerializer"""
    
    def test_serializer_valid_data(self, tenant, transport_request):
        """Test serializer with valid data"""
        data = {
            'transport_request': str(transport_request.id),
            'status': 'pending'
        }
        
        serializer = TransportOrderSerializer(data=data)
        assert serializer.is_valid()
    
    def test_serializer_invalid_status(self, tenant, transport_request):
        """Test serializer with invalid status"""
        data = {
            'transport_request': str(transport_request.id),
            'status': 'invalid_status'
        }
        
        serializer = TransportOrderSerializer(data=data)
        assert not serializer.is_valid()
        assert 'status' in serializer.errors
    
    def test_serializer_validate_vehicle_capacity(self, tenant, transport_request):
        """Test vehicle capacity validation"""
        from apps.fleet.models import Vehicle
        
        vehicle = Vehicle.objects.create(
            tenant=tenant,
            registration_number='ABC-123',
            capacity_kg=1000,
            status='available'
        )
        
        transport_request.total_weight_kg = 1500
        
        data = {
            'transport_request': str(transport_request.id),
            'vehicle_id': str(vehicle.id),
            'status': 'pending'
        }
        
        serializer = TransportOrderSerializer(data=data)
        assert not serializer.is_valid()
        assert 'vehicle_id' in serializer.errors
```

---

## Test Coverage

### Coverage Configuration

```ini
# .coveragerc
[run]
source = apps
omit = 
    */migrations/*
    */tests/*
    */venv/*
    */env/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:
```

### Running Tests with Coverage

```bash
# Run tests with coverage
pytest --cov=apps --cov-report=html --cov-report=term

# Coverage report
coverage report
coverage html  # Generate HTML report
```

---

## Related Documentation

- **[Testing Strategy](../..../../../../09-testing/strategy/testing-strategy.md)** - Overall testing approach
- **[Integration Tests](./integration-tests.md)** - Integration testing
- **[Test Fixtures](./test-fixtures.md)** - Test fixtures and factories

---

**Last Updated**: 2026-02-13

