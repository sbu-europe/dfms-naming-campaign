# Integration Tests Implementation

> Low-level Django integration testing implementation

## 📖 High-Level Context

> **Source of Truth**: [`DFMS-product-context/technical-context/`](../../DFMS-product-context/technical-context/)

- **[Testing Approach](../../DFMS-product-context/technical-context/03-implementation/strategies/testing-approach.md)** - High-level testing strategy
- **[Testing Strategy](./testing-strategy.md)** - Django testing strategy

This document provides **pytest integration test implementation** (API endpoints, database, external services).

---

## Overview

Integration tests verify component interactions. This document covers API endpoint tests, database integration tests, and external service integration tests.

---

## API Integration Tests

### ViewSet Integration Tests

```python
# tests/integration/test_api.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.transport.models import TransportOrder

@pytest.mark.django_db
@pytest.mark.integration
class TestTransportOrderAPI:
    """Integration tests for Transport Order API"""
    
    @pytest.fixture
    def api_client(self):
        """API client fixture"""
        return APIClient()
    
    @pytest.fixture
    def authenticated_client(self, api_client, user):
        """Authenticated API client"""
        api_client.force_authenticate(user=user)
        return api_client
    
    def test_create_transport_order(self, authenticated_client, tenant, transport_request):
        """Test creating transport order via API"""
        data = {
            'transport_request': str(transport_request.id),
            'status': 'pending'
        }
        
        response = authenticated_client.post(
            '/api/v1/transport-orders/',
            data=data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        assert TransportOrder.objects.filter(
            transport_request=transport_request
        ).exists()
    
    def test_list_transport_orders(self, authenticated_client, tenant):
        """Test listing transport orders"""
        # Create test orders
        for i in range(5):
            TransportOrder.objects.create(
                tenant=tenant,
                to_number=f'TO-TEST-{i:03d}',
                status='pending'
            )
        
        response = authenticated_client.get('/api/v1/transport-orders/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['data']) == 5
    
    def test_assign_vehicle_action(self, authenticated_client, tenant, transport_request):
        """Test assign_vehicle custom action"""
        from apps.fleet.models import Vehicle, Driver
        
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
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
        
        response = authenticated_client.post(
            f'/api/v1/transport-orders/{order.id}/assign_vehicle/',
            data={
                'vehicle_id': str(vehicle.id),
                'driver_id': str(driver.id)
            },
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        order.refresh_from_db()
        assert order.status == 'assigned'
        assert order.vehicle == vehicle
```

---

## Database Integration Tests

### Transaction Tests

```python
# tests/integration/test_database.py
import pytest
from django.db import transaction
from apps.transport.models import TransportOrder, TransportRequest

@pytest.mark.django_db
@pytest.mark.integration
class TestDatabaseIntegration:
    """Database integration tests"""
    
    def test_transport_order_cascade_delete(self, tenant):
        """Test cascade delete of transport request"""
        request = TransportRequest.objects.create(
            tenant=tenant,
            tr_number='TR-TEST-001',
            status='pending'
        )
        
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        order_id = order.id
        
        # Delete transport request
        request.delete()
        
        # Transport order should be deleted
        assert not TransportOrder.objects.filter(id=order_id).exists()
    
    def test_multi_tenant_isolation(self, tenant):
        """Test multi-tenant data isolation"""
        tenant2 = Tenant.objects.create(
            name='Tenant 2',
            schema_name='tenant2',
            is_active=True
        )
        
        order1 = TransportOrder.objects.create(
            tenant=tenant,
            to_number='TO-TENANT1-001',
            status='pending'
        )
        
        order2 = TransportOrder.objects.create(
            tenant=tenant2,
            to_number='TO-TENANT2-001',
            status='pending'
        )
        
        # Query from tenant1 context
        orders = TransportOrder.objects.filter(tenant=tenant)
        assert orders.count() == 1
        assert orders.first().to_number == 'TO-TENANT1-001'
```

---

## External Service Integration Tests

### Celery Task Integration Tests

```python
# tests/integration/test_tasks.py
import pytest
from unittest.mock import patch
from apps.transport.tasks import send_transport_order_assigned_notification

@pytest.mark.django_db
@pytest.mark.integration
class TestCeleryTasks:
    """Integration tests for Celery tasks"""
    
    @patch('apps.notifications.services.EmailService.send_transport_order_assigned')
    def test_send_notification_task(self, mock_email, tenant, transport_request):
        """Test notification task execution"""
        order = TransportOrder.objects.create(
            tenant=tenant,
            transport_request=transport_request,
            to_number='TO-TEST-001',
            status='pending'
        )
        
        # Execute task synchronously
        send_transport_order_assigned_notification(
            str(order.id),
            'test@example.com'
        )
        
        mock_email.assert_called_once()
```

### Redis Integration Tests

```python
# tests/integration/test_cache.py
import pytest
from django.core.cache import cache

@pytest.mark.django_db
@pytest.mark.integration
class TestRedisIntegration:
    """Redis cache integration tests"""
    
    def test_cache_set_get(self):
        """Test cache set and get"""
        cache.set('test_key', 'test_value', 60)
        value = cache.get('test_key')
        
        assert value == 'test_value'
    
    def test_cache_delete(self):
        """Test cache delete"""
        cache.set('test_key', 'test_value', 60)
        cache.delete('test_key')
        
        value = cache.get('test_key')
        assert value is None
```

---

## Authentication Integration Tests

### JWT Authentication Tests

```python
# tests/integration/test_auth.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status

@pytest.mark.django_db
@pytest.mark.integration
class TestAuthentication:
    """Authentication integration tests"""
    
    def test_jwt_login(self, api_client, user):
        """Test JWT token generation"""
        response = api_client.post(
            '/api/v1/auth/login/',
            data={
                'email': user.email,
                'password': 'testpass123'
            },
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_jwt_protected_endpoint(self, api_client, user):
        """Test accessing protected endpoint with JWT"""
        # Login
        login_response = api_client.post(
            '/api/v1/auth/login/',
            data={
                'email': user.email,
                'password': 'testpass123'
            },
            format='json'
        )
        
        access_token = login_response.data['access']
        
        # Access protected endpoint
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = api_client.get('/api/v1/transport-orders/')
        
        assert response.status_code == status.HTTP_200_OK
```

---

## Related Documentation

- **[Testing Strategy](./testing-strategy.md)** - Overall testing approach
- **[Unit Tests](./unit-tests.md)** - Unit testing
- **[E2E Tests](./e2e-tests.md)** - End-to-end testing

---

**Last Updated**: 2026-02-13

