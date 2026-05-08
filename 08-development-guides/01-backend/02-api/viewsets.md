# Viewsets Implementation

> Low-level Django REST Framework ViewSet implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[API Contracts](../../../06-contracts/01-apis/README.md)** - OpenAPI 3.0 specifications
- **[API Reference](./api-reference.md)** - API endpoints

This document provides **Django REST Framework ViewSet implementation** (code, actions, filtering).

---

## Overview

DRF ViewSets implement the API endpoints defined in the submodule OpenAPI contracts. ViewSets handle HTTP methods, request/response processing, and business logic coordination.

---

## ViewSet Patterns

### ModelViewSet

```python
# apps/transport/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from apps.transport.models import TransportOrder
from apps.transport.serializers import TransportOrderSerializer, TransportOrderListSerializer
from apps.core.permissions import IsTenantUser
from apps.transport.permissions import CanManageTransportOrders

class TransportOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Transport Order management"""
    
    queryset = TransportOrder.objects.all()
    serializer_class = TransportOrderSerializer
    permission_classes = [IsTenantUser, CanManageTransportOrders]
    
    def get_queryset(self):
        """Filter by tenant"""
        return TransportOrder.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('vehicle', 'driver', 'transport_request')
    
    def get_serializer_class(self):
        """Use list serializer for list action"""
        if self.action == 'list':
            return TransportOrderListSerializer
        return TransportOrderSerializer
    
    def perform_create(self, serializer):
        """Set tenant and creator on create"""
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )
```

### ReadOnlyModelViewSet

```python
# apps/reports/views.py
from rest_framework import viewsets
from apps.reports.models import Report
from apps.reports.serializers import ReportSerializer

class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only ViewSet for reports"""
    
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsTenantUser, CanViewReports]
    
    def get_queryset(self):
        return Report.objects.filter(
            tenant=self.request.user.tenant
        ).order_by('-created_at')
```

---

## Custom Actions

### Detail Actions

```python
# apps/transport/views.py
class TransportOrderViewSet(viewsets.ModelViewSet):
    # ... base implementation ...
    
    @action(detail=True, methods=['post'], permission_classes=[CanAssignVehicle])
    def assign_vehicle(self, request, pk=None):
        """Assign vehicle to transport order"""
        transport_order = self.get_object()
        vehicle_id = request.data.get('vehicle_id')
        driver_id = request.data.get('driver_id')
        
        if not vehicle_id:
            return Response(
                {'error': 'vehicle_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from apps.transport.services import TransportOrderService
            transport_order = TransportOrderService.assign_vehicle(
                str(transport_order.id),
                vehicle_id,
                driver_id
            )
            
            serializer = self.get_serializer(transport_order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def start_trip(self, request, pk=None):
        """Start trip for transport order"""
        transport_order = self.get_object()
        
        try:
            transport_order.start_trip()
            serializer = self.get_serializer(transport_order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def status_history(self, request, pk=None):
        """Get status change history"""
        transport_order = self.get_object()
        
        # Get status history from audit log
        history = transport_order.get_status_history()
        
        return Response({
            'transport_order_id': str(transport_order.id),
            'status_history': history
        })
```

### List Actions

```python
# apps/transport/views.py
class TransportOrderViewSet(viewsets.ModelViewSet):
    # ... base implementation ...
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending transport orders"""
        queryset = self.get_queryset().filter(status='pending')
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def assigned(self, request):
        """Get assigned transport orders"""
        queryset = self.get_queryset().filter(status='assigned')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

---

## Filtering and Searching

### Django Filter Backend

```python
# apps/transport/views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

class TransportOrderViewSet(viewsets.ModelViewSet):
    # ... base implementation ...
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'vehicle', 'driver']
    search_fields = ['to_number', 'transport_request__tr_number']
    ordering_fields = ['created_at', 'assigned_at', 'to_number']
    ordering = ['-created_at']
```

### Custom Filtering

```python
# apps/transport/filters.py
import django_filters
from apps.transport.models import TransportOrder

class TransportOrderFilter(django_filters.FilterSet):
    """Custom filter for Transport Order"""
    
    status = django_filters.ChoiceFilter(choices=TransportOrder.Status.choices)
    vehicle_registration = django_filters.CharFilter(
        field_name='vehicle__registration_number',
        lookup_expr='icontains'
    )
    created_after = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='gte'
    )
    created_before = django_filters.DateTimeFilter(
        field_name='created_at',
        lookup_expr='lte'
    )
    
    class Meta:
        model = TransportOrder
        fields = ['status', 'vehicle_registration', 'created_after', 'created_before']


# Usage in ViewSet
class TransportOrderViewSet(viewsets.ModelViewSet):
    filterset_class = TransportOrderFilter
```

---

## Pagination

### Custom Pagination

```python
# apps/core/pagination.py
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class LargeResultsSetPagination(PageNumberPagination):
    """Large result set pagination"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


# Usage in ViewSet
class TransportOrderViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination
```

### Cursor Pagination

```python
# apps/core/pagination.py
from rest_framework.pagination import CursorPagination

class CursorResultsPagination(CursorPagination):
    """Cursor-based pagination for large datasets"""
    page_size = 50
    ordering = '-created_at'
    cursor_query_param = 'cursor'
    page_size_query_param = 'page_size'
    max_page_size = 200


# Usage
class TripViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = CursorResultsPagination
```

---

## ViewSet Optimization

### Query Optimization

```python
# apps/transport/views.py
class TransportOrderViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        """Optimize queries with select_related and prefetch_related"""
        queryset = TransportOrder.objects.filter(
            tenant=self.request.user.tenant
        ).select_related(
            'vehicle',
            'driver',
            'transport_request',
            'transport_request__origin_poi',
            'transport_request__destination_poi',
            'created_by'
        ).prefetch_related(
            'transport_request__product_requisition__items'
        )
        
        return queryset
```

### Caching in ViewSets

```python
# apps/transport/views.py
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class TransportOrderViewSet(viewsets.ModelViewSet):
    @method_decorator(cache_page(60 * 5))  # Cache for 5 minutes
    def list(self, request, *args, **kwargs):
        """Cached list view"""
        return super().list(request, *args, **kwargs)
```

---

## Error Handling in ViewSets

### Custom Error Responses

```python
# apps/transport/views.py
class TransportOrderViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        """Create with custom error handling"""
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'error': {
                        'code': 'validation_error',
                        'message': 'Validation failed',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            self.perform_create(serializer)
            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'error': {
                        'code': 'creation_failed',
                        'message': str(e)
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

---

## Related Documentation

- **[API Contracts](../../../06-contracts/01-apis/README.md)** - OpenAPI specifications
- **[Serializers](./serializers.md)** - Serializer implementation
- **[Permissions](./permissions.md)** - Permission classes

---

**Last Updated**: 2026-02-13

