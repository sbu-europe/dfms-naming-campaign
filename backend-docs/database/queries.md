# Database Query Optimization

> Low-level Django ORM query optimization

## 📖 High-Level Context

> **Source of Truth**: [`DFMS-product-context/technical-context/`](../../DFMS-product-context/technical-context/)

- **[Data Architecture](../../DFMS-product-context/technical-context/01-architecture/data-architecture/)** - High-level data architecture
- **[Database Design](../architecture/database-design.md)** - PostgreSQL schema

This document provides **Django ORM query optimization** (patterns, techniques, performance).

---

## Overview

Query optimization is critical for performance. This document covers Django ORM optimization techniques including select_related, prefetch_related, and query patterns.

---

## Query Optimization Techniques

### select_related (Foreign Key)

```python
# ❌ BAD: N+1 queries
orders = TransportOrder.objects.all()
for order in orders:
    print(order.vehicle.registration_number)  # N queries

# ✅ GOOD: Single query with join
orders = TransportOrder.objects.select_related('vehicle').all()
for order in orders:
    print(order.vehicle.registration_number)  # 1 query
```

### prefetch_related (Many-to-Many, Reverse Foreign Key)

```python
# ❌ BAD: N+1 queries
users = User.objects.all()
for user in users:
    print(user.roles.all())  # N queries

# ✅ GOOD: Prefetch related objects
users = User.objects.prefetch_related('roles').all()
for user in users:
    print(user.roles.all())  # 2 queries total
```

### Combined Optimization

```python
# Optimize multiple relationships
orders = TransportOrder.objects.select_related(
    'vehicle',
    'driver',
    'transport_request',
    'transport_request__origin_poi',
    'transport_request__destination_poi'
).prefetch_related(
    'transport_request__product_requisition__items'
).filter(tenant=tenant)
```

---

## Query Patterns

### Filtering Patterns

```python
# Efficient filtering
orders = TransportOrder.objects.filter(
    tenant=tenant,
    status='pending',
    created_at__gte=timezone.now() - timedelta(days=7)
).select_related('vehicle', 'driver')

# Using Q objects for complex queries
from django.db.models import Q

orders = TransportOrder.objects.filter(
    Q(status='pending') | Q(status='assigned'),
    tenant=tenant,
    vehicle__isnull=False
)
```

### Aggregation Patterns

```python
# Efficient aggregation
from django.db.models import Count, Sum, Avg

# Count by status
status_counts = TransportOrder.objects.filter(
    tenant=tenant
).values('status').annotate(
    count=Count('id')
)

# Sum weights
total_weight = TransportOrder.objects.filter(
    tenant=tenant,
    status='completed'
).aggregate(
    total=Sum('transport_request__total_weight_kg')
)
```

### Exists vs Count

```python
# ✅ GOOD: Use exists() for boolean check
if TransportOrder.objects.filter(status='pending').exists():
    # Process

# ❌ BAD: Don't use count() for boolean
if TransportOrder.objects.filter(status='pending').count() > 0:
    # Process
```

---

## Database Indexes

### Index Strategy

```python
# apps/transport/models.py
class TransportOrder(models.Model):
    # ... fields ...
    
    class Meta:
        indexes = [
            # Composite index for common query pattern
            models.Index(
                fields=['tenant', 'status'],
                name='transport_order_tenant_status_idx'
            ),
            # Index for date range queries
            models.Index(
                fields=['created_at'],
                name='transport_order_created_at_idx'
            ),
            # Index for foreign key lookups
            models.Index(
                fields=['vehicle', 'status'],
                name='transport_order_vehicle_status_idx'
            ),
        ]
```

### Partial Indexes

```python
# Partial index for pending orders
class Migration(migrations.Migration):
    operations = [
        migrations.RunSQL(
            sql="""
            CREATE INDEX transport_orders_pending_idx 
            ON transport_orders(tenant_id, created_at) 
            WHERE status = 'pending';
            """,
            reverse_sql="DROP INDEX IF EXISTS transport_orders_pending_idx;"
        ),
    ]
```

---

## Query Performance

### Query Profiling

```python
# Enable query logging
from django.db import connection
from django.test.utils import override_settings

# In development
if settings.DEBUG:
    from django.db import connection
    connection.queries_log.clear()
    
    # Execute queries
    orders = TransportOrder.objects.all()
    
    # Check queries
    print(f"Queries executed: {len(connection.queries)}")
    for query in connection.queries:
        print(query['sql'])
```

### Django Debug Toolbar

```python
# settings/development.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    
    INTERNAL_IPS = ['127.0.0.1']
```

---

## Common Query Patterns

### Pagination with Optimization

```python
# Optimized pagination
def get_paginated_orders(tenant, page=1, page_size=20):
    queryset = TransportOrder.objects.filter(
        tenant=tenant
    ).select_related(
        'vehicle', 'driver'
    ).order_by('-created_at')
    
    paginator = Paginator(queryset, page_size)
    return paginator.page(page)
```

### Bulk Operations

```python
# ✅ GOOD: Bulk update
TransportOrder.objects.filter(
    status='pending',
    created_at__lt=timezone.now() - timedelta(days=30)
).update(status='cancelled')

# ✅ GOOD: Bulk create
orders = [
    TransportOrder(tenant=tenant, ...),
    TransportOrder(tenant=tenant, ...),
]
TransportOrder.objects.bulk_create(orders)

# ❌ BAD: Individual updates in loop
for order in orders:
    order.status = 'cancelled'
    order.save()  # N queries
```

---

## Related Documentation

- **[Models](./models.md)** - Django ORM models
- **[Database Design](../architecture/database-design.md)** - Schema design

---

**Last Updated**: 2026-02-13

