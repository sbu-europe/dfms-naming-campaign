# Database Migrations

> Low-level Django migration strategy and implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Data Model Overview](../../../04-architecture/01-system-design/data-architecture/data-model-overview.md)** - High-level data model
- **[Database Design](../../../04-architecture/04-backend/database-implementation.md)** - PostgreSQL schema design

This document provides **Django migration implementation** (migration files, data migrations, multi-tenant migrations).

---

## Overview

Django migrations manage database schema changes. This document covers migration workflow, best practices, and multi-tenant migration strategies.

---

## Migration Workflow

### Creating Migrations

```bash
# Create migrations for specific app
python manage.py makemigrations transport

# Create migrations for all apps
python manage.py makemigrations

# Create empty migration (for data migrations)
python manage.py makemigrations --empty transport
```

### Applying Migrations

```bash
# Apply all migrations
python manage.py migrate

# Apply migrations for specific app
python manage.py migrate transport

# Show migration plan
python manage.py migrate --plan

# Rollback last migration
python manage.py migrate transport <previous_migration_number>
```

---

## Migration Files

### Schema Migration Example

```python
# apps/transport/migrations/0001_initial.py
from django.db import migrations, models
import uuid

class Migration(migrations.Migration):
    initial = True
    
    dependencies = [
        ('tenants', '0001_initial'),
        ('fleet', '0001_initial'),
    ]
    
    operations = [
        migrations.CreateModel(
            name='TransportOrder',
            fields=[
                ('id', models.UUIDField(
                    default=uuid.uuid4,
                    editable=False,
                    primary_key=True
                )),
                ('to_number', models.CharField(
                    max_length=50,
                    unique=True
                )),
                ('status', models.CharField(
                    max_length=20,
                    choices=[
                        ('pending', 'Pending'),
                        ('assigned', 'Assigned'),
                        ('in_transit', 'In Transit'),
                        ('completed', 'Completed'),
                        ('cancelled', 'Cancelled'),
                    ],
                    default='pending'
                )),
                ('assigned_at', models.DateTimeField(null=True, blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('tenant', models.ForeignKey(
                    'tenants.Tenant',
                    on_delete=models.CASCADE,
                    related_name='transport_orders'
                )),
                ('transport_request', models.ForeignKey(
                    'transport.TransportRequest',
                    on_delete=models.CASCADE,
                    related_name='transport_orders'
                )),
                ('vehicle', models.ForeignKey(
                    'fleet.Vehicle',
                    on_delete=models.SET_NULL,
                    null=True,
                    blank=True
                )),
            ],
            options={
                'db_table': 'transport_orders',
            },
        ),
        migrations.AddIndex(
            model_name='transportorder',
            index=models.Index(
                fields=['tenant', 'status'],
                name='transport_o_tenant__idx'
            ),
        ),
    ]
```

---

## Data Migrations

### Data Migration Example

```python
# apps/transport/migrations/0002_populate_to_numbers.py
from django.db import migrations
from django.utils import timezone
import uuid

def populate_to_numbers(apps, schema_editor):
    """Populate TO numbers for existing transport orders"""
    TransportOrder = apps.get_model('transport', 'TransportOrder')
    
    for order in TransportOrder.objects.filter(to_number__isnull=True):
        date_str = timezone.now().strftime('%Y%m%d')
        random_str = uuid.uuid4().hex[:8].upper()
        order.to_number = f"TO-{date_str}-{random_str}"
        order.save()


def reverse_populate_to_numbers(apps, schema_editor):
    """Reverse migration"""
    TransportOrder = apps.get_model('transport', 'TransportOrder')
    TransportOrder.objects.filter(to_number__isnull=False).update(to_number=None)


class Migration(migrations.Migration):
    dependencies = [
        ('transport', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(
            populate_to_numbers,
            reverse_populate_to_numbers
        ),
    ]
```

---

## Multi-Tenant Migrations

### Schema-Per-Tenant Migration

```python
# apps/core/management/commands/migrate_tenant.py
from django.core.management.base import BaseCommand
from django.db import connection
from apps.tenants.models import Tenant

class Command(BaseCommand):
    help = 'Run migrations for specific tenant'
    
    def add_arguments(self, parser):
        parser.add_argument('tenant_id', type=str)
    
    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        tenant = Tenant.objects.get(id=tenant_id)
        
        # Set schema
        connection.set_schema_to(tenant.schema_name)
        
        # Run migrations
        from django.core.management import call_command
        call_command('migrate', verbosity=1)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully migrated tenant {tenant.name}')
        )
```

### Migrate All Tenants

```python
# apps/core/management/commands/migrate_all_tenants.py
from django.core.management.base import BaseCommand
from django.db import connection
from apps.tenants.models import Tenant

class Command(BaseCommand):
    help = 'Run migrations for all tenants'
    
    def handle(self, *args, **options):
        tenants = Tenant.objects.filter(is_active=True)
        
        for tenant in tenants:
            self.stdout.write(f'Migrating tenant: {tenant.name}')
            
            # Set schema
            connection.set_schema_to(tenant.schema_name)
            
            # Run migrations
            from django.core.management import call_command
            call_command('migrate', verbosity=0)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully migrated {tenants.count()} tenants')
        )
```

---

## Migration Best Practices

### 1. Keep Migrations Small

```python
# ✅ GOOD: Small, focused migration
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='transportorder',
            name='notes',
            field=models.TextField(blank=True),
        ),
    ]

# ❌ BAD: Too many changes in one migration
class Migration(migrations.Migration):
    operations = [
        # Multiple model changes, data migrations, etc.
    ]
```

### 2. Make Migrations Reversible

```python
# ✅ GOOD: Reversible migration
def add_default_status(apps, schema_editor):
    TransportOrder = apps.get_model('transport', 'TransportOrder')
    TransportOrder.objects.filter(status__isnull=True).update(status='pending')

def reverse_add_default_status(apps, schema_editor):
    TransportOrder = apps.get_model('transport', 'TransportOrder')
    TransportOrder.objects.filter(status='pending').update(status=None)

class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(
            add_default_status,
            reverse_add_default_status
        ),
    ]
```

### 3. Use Raw SQL When Needed

```python
# apps/transport/migrations/0003_add_index.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('transport', '0002_populate_to_numbers'),
    ]
    
    operations = [
        migrations.RunSQL(
            sql="CREATE INDEX CONCURRENTLY transport_orders_status_idx ON transport_orders(status) WHERE status = 'pending';",
            reverse_sql="DROP INDEX IF EXISTS transport_orders_status_idx;"
        ),
    ]
```

---

## Migration Testing

### Test Migrations

```python
# tests/test_migrations.py
import pytest
from django.core.management import call_command
from django.db import connection

@pytest.mark.django_db
def test_migration_applies():
    """Test that migration applies successfully"""
    # Rollback to previous migration
    call_command('migrate', 'transport', '0001', verbosity=0)
    
    # Apply migration
    call_command('migrate', 'transport', '0002', verbosity=0)
    
    # Verify migration applied
    from django.db.migrations.recorder import MigrationRecorder
    recorder = MigrationRecorder(connection)
    applied = recorder.applied_migrations()
    assert ('transport', '0002_populate_to_numbers') in applied
```

---

## Migration Rollback

### Rolling Back Migrations

```bash
# Rollback to specific migration
python manage.py migrate transport 0001

# Rollback all migrations for app
python manage.py migrate transport zero

# Rollback and show SQL
python manage.py migrate transport 0001 --sql
```

---

## Related Documentation

- **[Database Design](../../../04-architecture/04-backend/database-implementation.md)** - Schema design
- **[Models](./models.md)** - Django ORM models

---

**Last Updated**: 2026-02-13

