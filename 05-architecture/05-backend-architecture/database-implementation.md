# Database Design

> PostgreSQL schemas and Django ORM implementation

## 📖 High-Level Data Model

> **Source of Truth**: [`DFMS-product-context/technical-context/`](../../DFMS-product-context/technical-context/)

The high-level data model and entities are defined in the DFMS Product Context submodule:

- **[Data Model Overview](../../DFMS-product-context/technical-context/01-architecture/data-architecture/data-model-overview.md)** - High-level entities and relationships
- **[Data Models (JSON Schema)](../../DFMS-product-context/technical-context/05-contracts/data-models/)** - Contract definitions
  - [Common Entities](../../DFMS-product-context/technical-context/05-contracts/data-models/common-entities.yaml)
  - [Enums & Constants](../../DFMS-product-context/technical-context/05-contracts/data-models/enums-constants.yaml)
  - [Value Objects](../../DFMS-product-context/technical-context/05-contracts/data-models/value-objects.yaml)
- **[Business Context Data Dictionary](../../DFMS-product-context/business-context/05-data-reference/data-dictionary.md)** - Complete business data dictionary

This document provides **PostgreSQL-specific schemas and Django ORM models** for these entities.

## Overview
DFMS uses PostgreSQL with a multi-schema architecture for tenant isolation, optimized for a SaaS platform serving 200-300 internal users with potential for future scaling.

## PostgreSQL Architecture

### Multi-Tenancy Strategy
```sql
-- Public schema for shared data
public
├── tenants
├── subscription_plans
├── system_configurations
└── audit_logs

-- Tenant-specific schemas
tenant_001
├── users
├── vehicles
├── trips
├── products
└── ...

tenant_002
├── users
├── vehicles
├── trips
├── products
└── ...
```

## Core Database Schema

### Shared Tables (Public Schema)

#### tenants
```sql
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schema_name VARCHAR(63) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(63) UNIQUE,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_schema_name CHECK (schema_name ~ '^[a-z][a-z0-9_]{0,62}$')
);

CREATE INDEX idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX idx_tenants_is_active ON public.tenants(is_active);
```

#### subscription_plans
```sql
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    max_users INTEGER,
    max_vehicles INTEGER,
    features JSONB DEFAULT '{}',
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tenant-Specific Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_staff BOOLEAN DEFAULT false,
    is_superuser BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$'),
    CONSTRAINT valid_role CHECK (role IN ('superadmin', 'admin', 'manager', 'supervisor', 'operator', 'viewer'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_department ON users(department);
```

#### vehicles
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_no VARCHAR(50) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE,
    type VARCHAR(50) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    color VARCHAR(50),
    fuel_type VARCHAR(20),
    capacity_weight DECIMAL(10,2),
    capacity_volume DECIMAL(10,2),
    capacity_unit VARCHAR(20) DEFAULT 'kg/m3',
    status VARCHAR(50) DEFAULT 'available',
    ownership_type VARCHAR(50) DEFAULT 'owned',
    vendor_id UUID REFERENCES vendors(id),
    current_driver_id UUID REFERENCES drivers(id),
    current_location POINT,
    last_location_update TIMESTAMP WITH TIME ZONE,
    odometer_reading DECIMAL(10,2),
    fuel_level INTEGER,
    insurance_expiry DATE,
    registration_expiry DATE,
    pollution_cert_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    gps_device_id VARCHAR(100),
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('available', 'in_use', 'maintenance', 'breakdown', 'retired')),
    CONSTRAINT valid_fuel_type CHECK (fuel_type IN ('petrol', 'diesel', 'cng', 'electric', 'hybrid'))
);

CREATE INDEX idx_vehicles_registration ON vehicles(registration_no);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_vendor ON vehicles(vendor_id);
CREATE INDEX idx_vehicles_driver ON vehicles(current_driver_id);
CREATE INDEX idx_vehicles_location ON vehicles USING GIST(current_location);
```

#### drivers
```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'BD',
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(20),
    license_expiry DATE NOT NULL,
    license_verified BOOLEAN DEFAULT false,
    joining_date DATE,
    status VARCHAR(50) DEFAULT 'available',
    vendor_id UUID REFERENCES vendors(id),
    emergency_contact JSONB,
    documents JSONB DEFAULT '[]',
    rating DECIMAL(3,2),
    total_trips INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('available', 'on_trip', 'on_leave', 'terminated'))
);

CREATE INDEX idx_drivers_employee_id ON drivers(employee_id);
CREATE INDEX idx_drivers_license ON drivers(license_number);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_vendor ON drivers(vendor_id);
```

#### trips
```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    helper_id UUID REFERENCES helpers(id),
    transport_order_ids UUID[] NOT NULL,
    status VARCHAR(50) DEFAULT 'planned',
    trip_type VARCHAR(50) DEFAULT 'delivery',
    priority VARCHAR(20) DEFAULT 'normal',
    planned_start TIMESTAMP WITH TIME ZONE,
    planned_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    start_location POINT,
    end_location POINT,
    start_odometer DECIMAL(10,2),
    end_odometer DECIMAL(10,2),
    total_distance DECIMAL(10,2),
    fuel_start INTEGER,
    fuel_end INTEGER,
    fuel_consumed DECIMAL(10,2),
    route JSONB DEFAULT '[]',
    stops JSONB DEFAULT '[]',
    current_stop_index INTEGER DEFAULT 0,
    eta TIMESTAMP WITH TIME ZONE,
    delay_minutes INTEGER DEFAULT 0,
    delay_reason TEXT,
    expenses JSONB DEFAULT '[]',
    total_expense DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    rating INTEGER,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    started_by UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_trips_number ON trips(trip_number);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_planned_start ON trips(planned_start);
CREATE INDEX idx_trips_transport_orders ON trips USING GIN(transport_order_ids);
```

#### transport_orders
```sql
CREATE TABLE transport_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    requisition_id UUID REFERENCES transport_requisitions(id),
    type VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(50) DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'normal',
    origin_poi_id UUID REFERENCES pois(id) NOT NULL,
    destination_poi_id UUID REFERENCES pois(id) NOT NULL,
    products JSONB NOT NULL DEFAULT '[]',
    total_weight DECIMAL(10,2),
    total_volume DECIMAL(10,2),
    requested_date DATE NOT NULL,
    requested_time TIME,
    loading_time_minutes INTEGER DEFAULT 30,
    unloading_time_minutes INTEGER DEFAULT 30,
    special_instructions TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    assigned_driver_id UUID REFERENCES drivers(id),
    assigned_trip_id UUID REFERENCES trips(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'assigned', 'in_transit', 'delivered', 'cancelled', 'rejected'))
);

CREATE INDEX idx_transport_orders_number ON transport_orders(order_number);
CREATE INDEX idx_transport_orders_status ON transport_orders(status);
CREATE INDEX idx_transport_orders_requested_date ON transport_orders(requested_date);
CREATE INDEX idx_transport_orders_origin ON transport_orders(origin_poi_id);
CREATE INDEX idx_transport_orders_destination ON transport_orders(destination_poi_id);
```

#### pois (Points of Interest)
```sql
CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'BD',
    location POINT NOT NULL,
    geofence_radius INTEGER DEFAULT 100,
    geofence_shape POLYGON,
    operating_hours JSONB DEFAULT '{}',
    loading_bays INTEGER,
    parking_capacity INTEGER,
    contacts JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_type CHECK (type IN ('warehouse', 'distribution_center', 'customer', 'vendor', 'hub', 'checkpoint'))
);

CREATE INDEX idx_pois_code ON pois(code);
CREATE INDEX idx_pois_name ON pois(name);
CREATE INDEX idx_pois_type ON pois(type);
CREATE INDEX idx_pois_location ON pois USING GIST(location);
CREATE INDEX idx_pois_geofence ON pois USING GIST(geofence_shape);
```

#### products
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES product_categories(id),
    brand VARCHAR(100),
    unit_of_measure VARCHAR(20) NOT NULL,
    weight_per_unit DECIMAL(10,3),
    volume_per_unit DECIMAL(10,3),
    price DECIMAL(10,2),
    cost DECIMAL(10,2),
    min_stock_level INTEGER,
    max_stock_level INTEGER,
    reorder_point INTEGER,
    lead_time_days INTEGER,
    is_fragile BOOLEAN DEFAULT false,
    is_hazardous BOOLEAN DEFAULT false,
    temperature_controlled BOOLEAN DEFAULT false,
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    shelf_life_days INTEGER,
    batch_tracked BOOLEAN DEFAULT false,
    serial_tracked BOOLEAN DEFAULT false,
    images JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
```

#### gps_tracking
```sql
CREATE TABLE gps_tracking (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    trip_id UUID REFERENCES trips(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location POINT NOT NULL,
    speed DECIMAL(5,2),
    heading INTEGER,
    altitude DECIMAL(7,2),
    accuracy DECIMAL(5,2),
    satellites INTEGER,
    engine_status BOOLEAN,
    fuel_level INTEGER,
    temperature DECIMAL(5,2),
    events JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE gps_tracking_2024_01 PARTITION OF gps_tracking
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_gps_vehicle_time ON gps_tracking(vehicle_id, timestamp DESC);
CREATE INDEX idx_gps_trip ON gps_tracking(trip_id);
CREATE INDEX idx_gps_location ON gps_tracking USING GIST(location);
```

## Audit and Logging

### audit_logs
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_schema VARCHAR(63),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    user_id UUID,
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'API_CALL'))
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_schema);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_record ON audit_logs(record_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
```

## Database Functions and Triggers

### Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Audit trigger
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_row audit_logs;
    changed_fields TEXT[];
BEGIN
    audit_row.tenant_schema = TG_TABLE_SCHEMA;
    audit_row.table_name = TG_TABLE_NAME;
    audit_row.user_id = current_setting('app.current_user_id', true)::UUID;
    audit_row.user_email = current_setting('app.current_user_email', true);
    audit_row.ip_address = current_setting('app.current_ip', true)::INET;

    IF (TG_OP = 'DELETE') THEN
        audit_row.record_id = OLD.id;
        audit_row.action = 'DELETE';
        audit_row.old_values = row_to_json(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        audit_row.record_id = NEW.id;
        audit_row.action = 'UPDATE';
        audit_row.old_values = row_to_json(OLD);
        audit_row.new_values = row_to_json(NEW);

        -- Calculate changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(row_to_json(NEW)::jsonb) AS n
        FULL OUTER JOIN jsonb_each(row_to_json(OLD)::jsonb) AS o USING (key)
        WHERE n.value IS DISTINCT FROM o.value;

        audit_row.changed_fields = changed_fields;
    ELSIF (TG_OP = 'INSERT') THEN
        audit_row.record_id = NEW.id;
        audit_row.action = 'INSERT';
        audit_row.new_values = row_to_json(NEW);
    END IF;

    INSERT INTO public.audit_logs VALUES (audit_row.*);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Tenant isolation function
```sql
CREATE OR REPLACE FUNCTION set_tenant_schema(tenant_schema VARCHAR)
RETURNS void AS $$
BEGIN
    EXECUTE format('SET search_path TO %I, public', tenant_schema);
END;
$$ LANGUAGE plpgsql;
```

## Indexes Strategy

### Primary Keys
- All tables use UUID primary keys for better distribution
- Generated using `gen_random_uuid()`

### Foreign Keys
- All foreign keys are indexed for join performance
- Cascade rules carefully defined

### Composite Indexes
```sql
-- Frequent query patterns
CREATE INDEX idx_trips_vehicle_status ON trips(vehicle_id, status);
CREATE INDEX idx_trips_driver_date ON trips(driver_id, planned_start);
CREATE INDEX idx_orders_status_date ON transport_orders(status, requested_date);
CREATE INDEX idx_vehicles_type_status ON vehicles(type, status);
```

### Partial Indexes
```sql
-- Index only active records
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;
CREATE INDEX idx_available_vehicles ON vehicles(id) WHERE status = 'available';
CREATE INDEX idx_pending_orders ON transport_orders(created_at) WHERE status = 'pending_approval';
```

## Performance Optimization

### Connection Pooling
```python
# Django settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'  # 30 seconds
        },
        'CONN_MAX_AGE': 600,  # Persistent connections
        'ATOMIC_REQUESTS': True,  # Wrap requests in transactions
    }
}

# PgBouncer configuration
# pool_mode = transaction
# max_client_conn = 1000
# default_pool_size = 25
```

### Query Optimization
- Use `select_related()` for forward ForeignKey relationships
- Use `prefetch_related()` for reverse ForeignKey and ManyToMany
- Use `only()` and `defer()` for field selection
- Use database views for complex reports

### Partitioning Strategy
- GPS tracking data: Monthly partitions
- Audit logs: Monthly partitions
- Old partitions archived to S3

## Backup Strategy

### Automated Backups
```sql
-- Daily logical backup
pg_dump -Fc -d dfms > dfms_$(date +%Y%m%d).dump

-- Weekly full backup
pg_basebackup -D /backup/weekly -Ft -z -P

-- Point-in-time recovery setup
archive_mode = on
archive_command = 'aws s3 cp %p s3://dfms-backups/wal/%f'
```

### Retention Policy
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months
- WAL archives: 30 days

## Migration Strategy

### Django Migrations
```python
# apps/fleet/migrations/0001_initial.py
class Migration(migrations.Migration):
    dependencies = []

    operations = [
        migrations.RunSQL(
            "CREATE SCHEMA IF NOT EXISTS %(schema)s",
            reverse_sql="DROP SCHEMA IF EXISTS %(schema)s CASCADE",
            hints={'schema': 'tenant_001'}
        ),
    ]
```

### Schema Management
```python
# utils/tenant_schema.py
from django.db import connection

def create_tenant_schema(tenant):
    with connection.cursor() as cursor:
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {tenant.schema_name}")
        cursor.execute(f"SET search_path TO {tenant.schema_name}")
        # Run migrations for tenant schema
        call_command('migrate', schema_name=tenant.schema_name)
```

## Security Considerations

### Row-Level Security
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY tenant_isolation ON users
    USING (current_setting('app.current_tenant')::uuid = tenant_id);
```

### Data Encryption
```sql
-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted data
INSERT INTO users (email, phone)
VALUES (
    pgp_sym_encrypt('user@example.com', 'encryption_key'),
    pgp_sym_encrypt('+1234567890', 'encryption_key')
);
```

### Access Control
- Application-level user with limited permissions
- Read-only user for reporting
- Separate admin user for migrations
- No direct database access in production