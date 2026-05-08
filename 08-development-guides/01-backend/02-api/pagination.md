# Pagination Implementation

> Low-level Django REST Framework pagination implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[API Contracts](../../../06-contracts/api/)** - OpenAPI specifications with pagination

This document provides **DRF pagination implementation** (code, configuration, patterns).

---

## Overview

DRF pagination is used for all list endpoints to limit response size and improve performance. Multiple pagination styles are supported based on use case.

---

## Pagination Classes

### Page Number Pagination

```python
# apps/core/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for most endpoints"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        """Custom paginated response format"""
        return Response({
            'success': True,
            'data': data,
            'pagination': {
                'page': self.page.number,
                'page_size': self.page.paginator.per_page,
                'total_pages': self.page.paginator.num_pages,
                'total_count': self.page.paginator.count,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })


class LargeResultsSetPagination(PageNumberPagination):
    """Pagination for large result sets"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
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
    
    def get_paginated_response(self, data):
        """Custom paginated response"""
        return Response({
            'success': True,
            'data': data,
            'pagination': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'page_size': self.page_size,
            }
        })
```

### Limit Offset Pagination

```python
# apps/core/pagination.py
from rest_framework.pagination import LimitOffsetPagination

class LimitOffsetResultsPagination(LimitOffsetPagination):
    """Limit-offset pagination"""
    default_limit = 20
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 100
```

---

## Global Pagination Configuration

### Settings

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
}
```

---

## ViewSet Pagination

### Per-ViewSet Pagination

```python
# apps/transport/views.py
from apps.core.pagination import StandardResultsSetPagination, CursorResultsPagination

class TransportOrderViewSet(viewsets.ModelViewSet):
    """ViewSet with custom pagination"""
    pagination_class = StandardResultsSetPagination


class TripViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet with cursor pagination for large datasets"""
    pagination_class = CursorResultsPagination
```

### Disable Pagination

```python
# apps/reports/views.py
from rest_framework.pagination import None as NoPagination

class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet without pagination"""
    pagination_class = None
```

---

## Pagination Response Format

### Standard Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "to_number": "TO-20260213-ABC123",
      "status": "pending"
    },
    {
      "id": "uuid-2",
      "to_number": "TO-20260213-DEF456",
      "status": "assigned"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_pages": 5,
    "total_count": 100,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## Related Documentation

- **[Viewsets](./viewsets.md)** - ViewSet implementation
- **[API Reference](./api-reference.md)** - API endpoints

---

**Last Updated**: 2026-02-13

