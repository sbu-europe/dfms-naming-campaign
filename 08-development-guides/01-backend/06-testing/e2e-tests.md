# End-to-End Tests Implementation

> Low-level Django E2E testing implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Testing Approach](../../../04-architecture/07-implementation/strategies/testing-approach.md)** - High-level testing strategy
- **[Testing Strategy](./testing-strategy.md)** - Django testing strategy

This document provides **E2E test implementation** (full workflow tests, API workflows, user journeys).

---

## Overview

E2E tests verify complete workflows from start to finish. This document covers full workflow tests, API workflow tests, and user journey tests.

---

## Full Workflow Tests

### Transport Order Workflow

```python
# tests/e2e/test_transport_order_workflow.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.transport.models import TransportOrder, TransportRequest
from apps.fleet.models import Vehicle, Driver

@pytest.mark.django_db
@pytest.mark.e2e
class TestTransportOrderWorkflow:
    """E2E tests for complete transport order workflow"""
    
    @pytest.fixture
    def api_client(self):
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, user):
        api_client.force_authenticate(user=user)
        return api_client
    
    def test_complete_transport_order_lifecycle(self, authenticated_client, tenant):
        """Test complete transport order lifecycle"""
        # 1. Create transport request
        tr_response = authenticated_client.post(
            '/api/v1/transport-requests/',
            data={
                'tr_number': 'TR-E2E-001',
                'status': 'pending',
                'total_weight_kg': 1000,
            },
            format='json'
        )
        assert tr_response.status_code == status.HTTP_201_CREATED
        transport_request_id = tr_response.data['id']
        
        # 2. Create transport order
        to_response = authenticated_client.post(
            '/api/v1/transport-orders/',
            data={
                'transport_request': transport_request_id,
                'status': 'pending'
            },
            format='json'
        )
        assert to_response.status_code == status.HTTP_201_CREATED
        transport_order_id = to_response.data['id']
        
        # 3. Create vehicle and driver
        vehicle_response = authenticated_client.post(
            '/api/v1/vehicles/',
            data={
                'registration_number': 'E2E-001',
                'status': 'available',
                'capacity_kg': 2000
            },
            format='json'
        )
        assert vehicle_response.status_code == status.HTTP_201_CREATED
        vehicle_id = vehicle_response.data['id']
        
        driver_response = authenticated_client.post(
            '/api/v1/drivers/',
            data={
                'full_name': 'E2E Driver',
                'phone': '+1234567890',
                'status': 'available'
            },
            format='json'
        )
        assert driver_response.status_code == status.HTTP_201_CREATED
        driver_id = driver_response.data['id']
        
        # 4. Assign vehicle
        assign_response = authenticated_client.post(
            f'/api/v1/transport-orders/{transport_order_id}/assign_vehicle/',
            data={
                'vehicle_id': vehicle_id,
                'driver_id': driver_id
            },
            format='json'
        )
        assert assign_response.status_code == status.HTTP_200_OK
        assert assign_response.data['status'] == 'assigned'
        
        # 5. Start trip
        start_response = authenticated_client.post(
            f'/api/v1/transport-orders/{transport_order_id}/start_trip/',
            format='json'
        )
        assert start_response.status_code == status.HTTP_200_OK
        assert start_response.data['status'] == 'in_transit'
        
        # 6. Complete trip
        complete_response = authenticated_client.post(
            f'/api/v1/transport-orders/{transport_order_id}/complete_trip/',
            format='json'
        )
        assert complete_response.status_code == status.HTTP_200_OK
        assert complete_response.data['status'] == 'completed'
```

---

## API Workflow Tests

### Multi-Step API Workflow

```python
# tests/e2e/test_api_workflows.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
@pytest.mark.e2e
class TestAPIWorkflows:
    """E2E tests for API workflows"""
    
    def test_batch_transport_order_creation(self, authenticated_client, tenant):
        """Test creating multiple transport orders"""
        # Create transport request
        tr_response = authenticated_client.post(
            '/api/v1/transport-requests/',
            data={'tr_number': 'TR-BATCH-001', 'status': 'pending'},
            format='json'
        )
        transport_request_id = tr_response.data['id']
        
        # Create multiple orders
        order_ids = []
        for i in range(10):
            response = authenticated_client.post(
                '/api/v1/transport-orders/',
                data={
                    'transport_request': transport_request_id,
                    'status': 'pending'
                },
                format='json'
            )
            assert response.status_code == status.HTTP_201_CREATED
            order_ids.append(response.data['id'])
        
        # Verify all created
        list_response = authenticated_client.get('/api/v1/transport-orders/')
        assert len(list_response.data['data']) >= 10
```

---

## User Journey Tests

### Complete User Journey

```python
# tests/e2e/test_user_journeys.py
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
@pytest.mark.e2e
class TestUserJourneys:
    """E2E tests for user journeys"""
    
    def test_dispatcher_creates_and_assigns_order(self, api_client, dispatcher_user, tenant):
        """Test dispatcher user journey"""
        api_client.force_authenticate(user=dispatcher_user)
        
        # 1. View pending transport requests
        requests_response = api_client.get(
            '/api/v1/transport-requests/?status=pending'
        )
        assert requests_response.status_code == status.HTTP_200_OK
        
        # 2. Create transport order
        order_response = api_client.post(
            '/api/v1/transport-orders/',
            data={
                'transport_request': requests_response.data['data'][0]['id'],
                'status': 'pending'
            },
            format='json'
        )
        assert order_response.status_code == status.HTTP_201_CREATED
        
        # 3. View available vehicles
        vehicles_response = api_client.get('/api/v1/vehicles/?status=available')
        assert vehicles_response.status_code == status.HTTP_200_OK
        
        # 4. Assign vehicle
        assign_response = api_client.post(
            f'/api/v1/transport-orders/{order_response.data["id"]}/assign_vehicle/',
            data={
                'vehicle_id': vehicles_response.data['data'][0]['id'],
                'driver_id': vehicles_response.data['data'][0]['driver_id']
            },
            format='json'
        )
        assert assign_response.status_code == status.HTTP_200_OK
    
    def test_driver_receives_assignment_notification(self, api_client, driver_user, tenant):
        """Test driver receives assignment notification"""
        # This would test the complete flow including notifications
        # Implementation depends on notification system
        pass
```

---

## Test Data Setup

### E2E Test Fixtures

```python
# tests/e2e/conftest.py
import pytest
from apps.tenants.models import Tenant
from apps.users.models import User
from apps.transport.models import TransportRequest
from apps.fleet.models import Vehicle, Driver

@pytest.fixture
def complete_test_data(db):
    """Create complete test data for E2E tests"""
    tenant = Tenant.objects.create(
        name='E2E Test Tenant',
        schema_name='e2e_test',
        is_active=True
    )
    
    dispatcher = User.objects.create_user(
        email='dispatcher@e2e.test',
        password='testpass123',
        tenant=tenant,
        role='dispatcher'
    )
    
    driver = Driver.objects.create(
        tenant=tenant,
        full_name='E2E Driver',
        phone='+1234567890',
        status='available'
    )
    
    vehicle = Vehicle.objects.create(
        tenant=tenant,
        registration_number='E2E-001',
        driver=driver,
        status='available',
        capacity_kg=2000
    )
    
    transport_request = TransportRequest.objects.create(
        tenant=tenant,
        tr_number='TR-E2E-001',
        status='pending',
        total_weight_kg=1000
    )
    
    return {
        'tenant': tenant,
        'dispatcher': dispatcher,
        'driver': driver,
        'vehicle': vehicle,
        'transport_request': transport_request
    }
```

---

## Running E2E Tests

### Test Execution

```bash
# Run all E2E tests
pytest tests/e2e/ -m e2e

# Run specific E2E test
pytest tests/e2e/test_transport_order_workflow.py::TestTransportOrderWorkflow::test_complete_transport_order_lifecycle

# Run with verbose output
pytest tests/e2e/ -m e2e -v

# Run with coverage
pytest tests/e2e/ -m e2e --cov=apps
```

---

## Related Documentation

- **[Testing Strategy](./testing-strategy.md)** - Overall testing approach
- **[Integration Tests](./integration-tests.md)** - Integration testing
- **[Test Fixtures](./test-fixtures.md)** - Test fixtures

---

**Last Updated**: 2026-02-13

