# Database Design

> PostgreSQL schemas and Django ORM implementation

## 📖 High-Level Data Model

> **Source of Truth**: [`04-architecture/`](../)

The high-level data model and entities are defined in the DFMS Product Context submodule:

- **[Data Model Overview](../01-system-design/data-architecture/data-model-overview.md)** - High-level entities and relationships
- **[Data Models (JSON Schema)](../../../../06-contracts/02-data-models/)** - Contract definitions
  - [Common Entities](../../../../06-contracts/02-data-models/common-entities.yaml)
  - [Enums & Constants](../../../../06-contracts/02-data-models/enums-constants.yaml)
  - [Value Objects](../../../../06-contracts/02-data-models/value-objects.yaml)
- **[Business Context Data Dictionary](../../DFMS-product-context/02-domain/05-data-reference/data-dictionary.md)** - Complete business data dictionary

This document provides **PostgreSQL-specific schemas and Django ORM models** for these entities.

## Overview
DFMS uses PostgreSQL with a multi-schema architecture for tenant isolation, optimized for a SaaS platform serving 200-300 internal users with potential for future scaling.

## PostgreSQL Architecture

### Multi-Tenancy Strategy

**Decision**: Schema-per-tenant for all subscription tiers via `django-tenants`.

Every tenant gets a dedicated PostgreSQL schema. The `django-tenants` library automatically sets `search_path` on each request based on the request's subdomain/domain, so application queries require no `tenant_id` filtering.

```sql
-- Public schema: shared platform entities only
public
├── tenants               -- tenant registry
├── subscription_plans    -- feature/limit tiers
└── audit_logs            -- cross-tenant audit trail (partitioned)

-- Per-tenant schemas: fully isolated domain data
tenant_001               -- e.g., Nourish Poultry
├── users, roles, permissions
├── vehicles, drivers, helpers, vendors
├── product_requisitions, transport_orders, trips
├── gate_entries, qc_events, trip_costs
└── ...

tenant_002               -- e.g., ABC Logistics
└── (same table set, fully isolated)
```

**How django-tenants routes requests**:
```python
# settings.py
TENANT_MODEL = "tenants.Tenant"
TENANT_DOMAIN_MODEL = "tenants.Domain"

# django-tenants middleware sets search_path per request:
# SET search_path TO tenant_001, public;
# All ORM queries then operate against that schema automatically.
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
-- Roles are managed via user_roles junction table (see RBAC section below)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    profile_photo_url TEXT,
    tier VARCHAR(20) NOT NULL DEFAULT 'operational',  -- super_admin | tenant_admin | dept_admin | operational
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    force_password_change BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_tier CHECK (tier IN ('super_admin', 'tenant_admin', 'dept_admin', 'operational')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'locked', 'invited'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';
```

---

### Foundation — RBAC Tables

#### roles
```sql
-- tenant_id NULL = system predefined role (shared across all tenants)
-- tenant_id SET = custom role created by a Tenant Admin
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    tier VARCHAR(20) NOT NULL,  -- super_admin | tenant_admin | dept_admin | operational
    department VARCHAR(100),    -- scope (null = org-wide)
    tenant_id UUID,             -- null = system role
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_tier CHECK (tier IN ('super_admin', 'tenant_admin', 'dept_admin', 'operational')),
    UNIQUE (code, tenant_id)
);

CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_tier ON roles(tier);
CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_roles_active ON roles(is_active) WHERE is_active = true;
```

#### permissions
```sql
-- Atomic permission strings in Module.Feature.Action format
-- e.g., Fleet.Vehicle.Create, Transport.Trip.Approve
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(150) UNIQUE NOT NULL,  -- e.g., Fleet.Vehicle.Create
    module VARCHAR(50) NOT NULL,
    feature VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,        -- Create|Read|Update|Delete|Approve|Export|Assign|Configure
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_action CHECK (action IN ('Create', 'Read', 'Update', 'Delete', 'Approve', 'Export', 'Assign', 'Configure'))
);

CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(code);
```

#### role_permissions
```sql
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
```

#### user_roles
```sql
-- Carries functional role flags for workflow routing
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    is_requester BOOLEAN DEFAULT false,   -- can initiate workflows (PRs, TRs)
    is_approver BOOLEAN DEFAULT false,    -- can approve workflows
    is_executor BOOLEAN DEFAULT false,    -- executes tasks (loading, QC, driving)
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

---

### Foundation — Auth Tables

#### otp_records
```sql
CREATE TABLE otp_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    identifier VARCHAR(255) NOT NULL,  -- email or phone used for OTP delivery
    otp_hash VARCHAR(255) NOT NULL,    -- bcrypt hash of the 6-digit OTP
    purpose VARCHAR(30) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- 10 minutes from creation
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_purpose CHECK (purpose IN ('LOGIN', 'REGISTRATION', 'PASSWORD_RESET', 'INVITATION'))
);

CREATE INDEX idx_otp_user ON otp_records(user_id);
CREATE INDEX idx_otp_expires ON otp_records(expires_at);
CREATE INDEX idx_otp_purpose ON otp_records(user_id, purpose);
```

#### user_sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    jti VARCHAR(255) UNIQUE NOT NULL,  -- JWT ID claim for token revocation
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'active',
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'revoked'))
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_jti ON user_sessions(jti);
CREATE INDEX idx_sessions_active ON user_sessions(user_id, status) WHERE status = 'active';
```

#### invitation_tokens
```sql
CREATE TABLE invitation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_email VARCHAR(255) NOT NULL,
    invited_by UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES users(id),  -- set when accepted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

CREATE INDEX idx_invitations_token ON invitation_tokens(token);
CREATE INDEX idx_invitations_email ON invitation_tokens(invited_email);
CREATE INDEX idx_invitations_status ON invitation_tokens(status);
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

#### helpers
```sql
CREATE TABLE helpers (
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
    joining_date DATE,
    availability_status VARCHAR(20) DEFAULT 'available',
    vendor_id UUID REFERENCES vendors(id),
    emergency_contact JSONB,
    documents JSONB DEFAULT '[]',
    total_trips INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_availability CHECK (availability_status IN ('available', 'on_trip', 'absent', 'terminated'))
);

CREATE INDEX idx_helpers_employee_id ON helpers(employee_id);
CREATE INDEX idx_helpers_availability ON helpers(availability_status);
CREATE INDEX idx_helpers_vendor ON helpers(vendor_id);
```

#### vendors
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'BD',
    vendor_type VARCHAR(30) NOT NULL DEFAULT 'non_contractual',
    registration_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    trade_license_number VARCHAR(100),
    tax_id VARCHAR(50),
    bank_account_info JSONB DEFAULT '{}',
    rating DECIMAL(3,2),
    total_trips INTEGER DEFAULT 0,
    contract_start_date DATE,
    contract_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_type CHECK (vendor_type IN ('contractual', 'non_contractual')),
    CONSTRAINT valid_status CHECK (registration_status IN (
        'draft', 'pending_verification', 'under_review', 'approved',
        'rejected', 'resubmitted', 'blacklisted'
    ))
);

CREATE INDEX idx_vendors_code ON vendors(vendor_code);
CREATE INDEX idx_vendors_status ON vendors(registration_status);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = true;
```

#### vendor_documents
```sql
CREATE TABLE vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,  -- trade_license | tax_certificate | bank_statement | insurance | other
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_doc_type CHECK (document_type IN (
        'trade_license', 'tax_certificate', 'bank_statement',
        'insurance', 'vehicle_registration', 'other'
    ))
);

CREATE INDEX idx_vendor_docs_vendor ON vendor_documents(vendor_id);
CREATE INDEX idx_vendor_docs_type ON vendor_documents(vendor_id, document_type);
```

#### product_categories
```sql
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES product_categories(id),  -- self-referential for hierarchy
    description TEXT,
    handling_requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_product_categories_code ON product_categories(code);
CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
```

#### suppliers
```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    trade_license_number VARCHAR(100),
    tax_id VARCHAR(50),
    tin_number VARCHAR(50),
    poi_id UUID REFERENCES pois(id),  -- supplier's location as a POI
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'temporary'))
);

CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX idx_suppliers_status ON suppliers(status);
```

#### dealers
```sql
CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_code VARCHAR(50) UNIQUE NOT NULL,
    dealer_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    trade_license_number VARCHAR(100),
    tax_id VARCHAR(50),
    tin_number VARCHAR(50),
    poi_id UUID REFERENCES pois(id),  -- dealer's location as a POI
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'temporary'))
);

CREATE INDEX idx_dealers_code ON dealers(dealer_code);
CREATE INDEX idx_dealers_name ON dealers(dealer_name);
CREATE INDEX idx_dealers_status ON dealers(status);
```

#### routes
```sql
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(255) NOT NULL,
    source_poi_id UUID REFERENCES pois(id) NOT NULL,
    destination_poi_id UUID REFERENCES pois(id) NOT NULL,
    distance_km DECIMAL(10,2) NOT NULL,
    estimated_duration_minutes INTEGER,
    vehicle_type VARCHAR(50),              -- rate applies to this vehicle type (null = all)
    rate_per_km DECIMAL(10,2),             -- contractual rate for this route
    rate_per_trip DECIMAL(10,2),           -- fixed rate per trip (alternative to per-km)
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive')),
    UNIQUE (source_poi_id, destination_poi_id, vehicle_type)
);

CREATE INDEX idx_routes_source ON routes(source_poi_id);
CREATE INDEX idx_routes_destination ON routes(destination_poi_id);
CREATE INDEX idx_routes_active ON routes(status) WHERE status = 'active';
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

#### product_requisitions
```sql
CREATE TABLE product_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number VARCHAR(50) UNIQUE NOT NULL,  -- PR-YYYYMMDD-NNNN
    requester_id UUID REFERENCES users(id) NOT NULL,
    origin_poi_id UUID REFERENCES pois(id) NOT NULL,
    destination_poi_id UUID REFERENCES pois(id) NOT NULL,
    requested_date DATE NOT NULL,
    required_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    pr_type VARCHAR(30) DEFAULT 'internal_transfer',
    reference_document VARCHAR(100),        -- PO/DO number if applicable
    status VARCHAR(50) DEFAULT 'draft',
    distribution_approved_by UUID REFERENCES users(id),
    distribution_approved_at TIMESTAMP WITH TIME ZONE,
    procurement_approved_by UUID REFERENCES users(id),
    procurement_approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN (
        'draft', 'submitted', 'pending_distribution_approval',
        'pending_procurement_approval', 'approved', 'rejected',
        'partially_allocated', 'fully_allocated', 'cancelled'
    ))
);

CREATE INDEX idx_pr_number ON product_requisitions(pr_number);
CREATE INDEX idx_pr_status ON product_requisitions(status);
CREATE INDEX idx_pr_requester ON product_requisitions(requester_id);
CREATE INDEX idx_pr_requested_date ON product_requisitions(requested_date);
```

#### pr_line_items
```sql
CREATE TABLE pr_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID REFERENCES product_requisitions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    allocated_quantity DECIMAL(12,3) DEFAULT 0,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pr_line_items_pr ON pr_line_items(pr_id);
CREATE INDEX idx_pr_line_items_product ON pr_line_items(product_id);
```

#### transport_requisitions
```sql
CREATE TABLE transport_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tr_number VARCHAR(50) UNIQUE NOT NULL,  -- TR-YYYYMMDD-NNNN
    pr_id UUID REFERENCES product_requisitions(id),
    origin_poi_id UUID REFERENCES pois(id) NOT NULL,
    destination_poi_id UUID REFERENCES pois(id) NOT NULL,
    products JSONB NOT NULL DEFAULT '[]',   -- [{product_id, quantity, uom}]
    total_weight_kg DECIMAL(12,3),
    total_volume_cbm DECIMAL(10,3),
    vehicle_type_required VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal',
    required_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'available_for_planning',
        'partially_assigned', 'fully_assigned', 'closed', 'rejected', 'cancelled'
    ))
);

CREATE INDEX idx_tr_number ON transport_requisitions(tr_number);
CREATE INDEX idx_tr_status ON transport_requisitions(status);
CREATE INDEX idx_tr_pr ON transport_requisitions(pr_id);
CREATE INDEX idx_tr_required_date ON transport_requisitions(required_date);
```

#### bidding_parameters
```sql
-- Bidding configuration per Transport Order (vendor fleet TOs only)
CREATE TABLE bidding_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_order_id UUID UNIQUE REFERENCES transport_orders(id) ON DELETE CASCADE,
    bid_open_at TIMESTAMP WITH TIME ZONE NOT NULL,
    bid_close_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_bid_amount DECIMAL(12,2),
    min_bid_amount DECIMAL(12,2),
    auto_award_threshold DECIMAL(12,2),    -- auto-award if bid <= this amount
    eligible_vendor_ids UUID[] DEFAULT '{}',
    notify_all_eligible BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'scheduled',
    awarded_bid_id UUID REFERENCES vendor_bids(id),
    awarded_at TIMESTAMP WITH TIME ZONE,
    awarded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('scheduled', 'open', 'closed', 'awarded', 'cancelled'))
);

CREATE INDEX idx_bidding_to ON bidding_parameters(transport_order_id);
CREATE INDEX idx_bidding_status ON bidding_parameters(status);
CREATE INDEX idx_bidding_close_at ON bidding_parameters(bid_close_at);
```

#### vendor_bids
```sql
CREATE TABLE vendor_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_order_id UUID REFERENCES transport_orders(id) NOT NULL,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    bid_amount DECIMAL(12,2) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    vehicle_registration VARCHAR(50),    -- if vehicle not yet in system
    driver_name VARCHAR(150),            -- if driver not yet in system
    notes TEXT,
    status VARCHAR(20) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN (
        'submitted', 'under_review', 'shortlisted', 'awarded',
        'rejected', 'withdrawn', 'expired'
    )),
    UNIQUE (transport_order_id, vendor_id)
);

CREATE INDEX idx_vendor_bids_to ON vendor_bids(transport_order_id);
CREATE INDEX idx_vendor_bids_vendor ON vendor_bids(vendor_id);
CREATE INDEX idx_vendor_bids_status ON vendor_bids(status);
```

#### trip_incidents
```sql
CREATE TABLE trip_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    incident_type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    location JSONB,                         -- {lat, lng}
    photos JSONB DEFAULT '[]',              -- array of S3 URLs
    estimated_delay_minutes INTEGER,
    reported_by UUID REFERENCES users(id) NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open',
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_type CHECK (incident_type IN (
        'accident', 'breakdown', 'delay', 'partial_delivery',
        'route_deviation', 'theft', 'other'
    )),
    CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated'))
);

CREATE INDEX idx_incidents_trip ON trip_incidents(trip_id);
CREATE INDEX idx_incidents_status ON trip_incidents(status);
CREATE INDEX idx_incidents_type ON trip_incidents(incident_type);
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

---

## Gate & Weighing Operations Tables

### temporary_parties
```sql
-- Unregistered suppliers/dealers presenting at gate; converted to permanent records after approval
CREATE TABLE temporary_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_type VARCHAR(20) NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'temporary',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    converted_to_supplier_id UUID REFERENCES suppliers(id),
    converted_to_dealer_id UUID REFERENCES dealers(id),
    CONSTRAINT valid_type CHECK (party_type IN ('supplier', 'dealer')),
    CONSTRAINT valid_status CHECK (status IN ('temporary', 'approved', 'rejected'))
);

CREATE INDEX idx_temp_parties_status ON temporary_parties(status);
CREATE INDEX idx_temp_parties_type ON temporary_parties(party_type);
```

### gate_entries
```sql
-- 13-state lifecycle: vehicle arrival through gate clearance
CREATE TABLE gate_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_in_number VARCHAR(50) UNIQUE NOT NULL,
    poi_id UUID REFERENCES pois(id) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50),
    document_category VARCHAR(30) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    product_code VARCHAR(100),
    product_name VARCHAR(255),
    product_category VARCHAR(100),
    declared_quantity DECIMAL(12,3),
    uom VARCHAR(20),
    driver_name VARCHAR(150) NOT NULL,
    driver_contact VARCHAR(20),
    driver_license VARCHAR(50),
    party_name VARCHAR(255) NOT NULL,
    party_type VARCHAR(20) NOT NULL,
    party_id UUID,                              -- FK to suppliers or dealers
    origin_poi_id UUID REFERENCES pois(id),
    gate_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(40) DEFAULT 'registered',
    routed_workflow VARCHAR(30),
    next_station VARCHAR(30),
    transport_order_id UUID REFERENCES transport_orders(id),
    trip_id UUID REFERENCES trips(id),
    temp_party_id UUID REFERENCES temporary_parties(id),
    remarks TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_doc_category CHECK (document_category IN (
        'supplier_po', 'internal_to', 'internal_challan', 'dealer_do', 'port_consignment'
    )),
    CONSTRAINT valid_party_type CHECK (party_type IN ('supplier', 'dealer', 'distributor', 'internal')),
    CONSTRAINT valid_status CHECK (status IN (
        'registered', 'awaiting_scale_in', 'scale_in_complete',
        'awaiting_qc', 'qc_in_progress',
        'awaiting_loading', 'loading_in_progress',
        'awaiting_unloading', 'unloading_in_progress',
        'awaiting_scale_out', 'scale_out_complete',
        'cleared_for_exit', 'gate_out_complete'
    )),
    CONSTRAINT valid_workflow CHECK (routed_workflow IN (
        'inbound_qc', 'outbound_loading', 'internal_transfer', NULL
    )),
    CONSTRAINT valid_next_station CHECK (next_station IN (
        'weighbridge', 'loading_bay', 'qc_station', 'parking', NULL
    ))
);

CREATE INDEX idx_gate_entries_number ON gate_entries(gate_in_number);
CREATE INDEX idx_gate_entries_poi ON gate_entries(poi_id);
CREATE INDEX idx_gate_entries_status ON gate_entries(status);
CREATE INDEX idx_gate_entries_vehicle ON gate_entries(vehicle_number);
CREATE INDEX idx_gate_entries_to ON gate_entries(transport_order_id);
CREATE INDEX idx_gate_entries_trip ON gate_entries(trip_id);
CREATE INDEX idx_gate_entries_time ON gate_entries(gate_in_time DESC);
```

### gate_exits
```sql
CREATE TABLE gate_exits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_in_id UUID UNIQUE REFERENCES gate_entries(id) NOT NULL,
    poi_id UUID REFERENCES pois(id) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    gate_out_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gate_pass_token VARCHAR(100),                   -- from scale_out_entries
    scale_out_complete BOOLEAN DEFAULT false,
    qc_status VARCHAR(20),                          -- passed | failed | skipped
    qc_clearance_time TIMESTAMP WITH TIME ZONE,
    loading_complete BOOLEAN,
    unloading_complete BOOLEAN,
    dwell_time_minutes INTEGER,                     -- computed: gate_out - gate_in
    trip_id UUID REFERENCES trips(id),
    transport_order_id UUID REFERENCES transport_orders(id),
    cleared_by UUID REFERENCES users(id),
    gate_out_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_qc_status CHECK (qc_status IN ('passed', 'failed', 'skipped', NULL))
);

CREATE INDEX idx_gate_exits_gate_in ON gate_exits(gate_in_id);
CREATE INDEX idx_gate_exits_poi ON gate_exits(poi_id);
CREATE INDEX idx_gate_exits_time ON gate_exits(gate_out_time DESC);
```

### scale_in_entries
```sql
CREATE TABLE scale_in_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_in_id UUID REFERENCES gate_entries(id) NOT NULL,
    poi_id UUID REFERENCES pois(id) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    gross_weight_kg DECIMAL(12,3) NOT NULL,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    material_code VARCHAR(100),
    material_name VARCHAR(255),
    challan_number VARCHAR(100),
    scale_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    operator_id UUID REFERENCES users(id) NOT NULL,
    discrepancy_flag BOOLEAN DEFAULT false,
    discrepancy_type VARCHAR(30),
    discrepancy_remarks TEXT,
    status VARCHAR(30) DEFAULT 'recorded',
    transport_order_id UUID REFERENCES transport_orders(id),
    trip_id UUID REFERENCES trips(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_weight_unit CHECK (weight_unit IN ('kg', 'ton')),
    CONSTRAINT valid_discrepancy CHECK (discrepancy_type IN (
        'wrong_quantity', 'driver_mismatch', 'damaged_product', 'other', NULL
    )),
    CONSTRAINT valid_status CHECK (status IN ('recorded', 'discrepancy_logged', 'voided'))
);

CREATE INDEX idx_scale_in_gate ON scale_in_entries(gate_in_id);
CREATE INDEX idx_scale_in_poi ON scale_in_entries(poi_id);
CREATE INDEX idx_scale_in_time ON scale_in_entries(scale_in_time DESC);
```

### scale_out_entries
```sql
CREATE TABLE scale_out_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scale_in_id UUID REFERENCES scale_in_entries(id) NOT NULL,
    gate_in_id UUID REFERENCES gate_entries(id) NOT NULL,
    poi_id UUID REFERENCES pois(id) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    tare_weight_kg DECIMAL(12,3) NOT NULL,
    net_weight_kg DECIMAL(12,3) NOT NULL,        -- computed: gross - tare
    weight_unit VARCHAR(10) DEFAULT 'kg',
    material_code VARCHAR(100),
    material_name VARCHAR(255),
    pc_code VARCHAR(50),                         -- product category code
    scale_out_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    operator_id UUID REFERENCES users(id) NOT NULL,
    discrepancy_flag BOOLEAN DEFAULT false,
    discrepancy_type VARCHAR(30),
    discrepancy_remarks TEXT,
    gate_pass_token VARCHAR(100) UNIQUE NOT NULL,
    gate_pass_issued_at TIMESTAMP WITH TIME ZONE,
    gate_pass_qr_code TEXT,
    status VARCHAR(30) DEFAULT 'recorded',
    transport_order_id UUID REFERENCES transport_orders(id),
    trip_id UUID REFERENCES trips(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_weight_unit CHECK (weight_unit IN ('kg', 'ton')),
    CONSTRAINT valid_status CHECK (status IN (
        'recorded', 'gate_pass_issued', 'discrepancy_logged', 'voided'
    ))
);

CREATE INDEX idx_scale_out_scale_in ON scale_out_entries(scale_in_id);
CREATE INDEX idx_scale_out_gate ON scale_out_entries(gate_in_id);
CREATE INDEX idx_scale_out_token ON scale_out_entries(gate_pass_token);
CREATE INDEX idx_scale_out_time ON scale_out_entries(scale_out_time DESC);
```

### gate_passes
```sql
CREATE TABLE gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_pass_token VARCHAR(100) UNIQUE NOT NULL,
    gate_in_id UUID REFERENCES gate_entries(id) NOT NULL,
    scale_out_id UUID REFERENCES scale_out_entries(id) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    item_name VARCHAR(255),
    pc_code VARCHAR(50),
    net_weight_kg DECIMAL(12,3) NOT NULL,
    gross_weight_kg DECIMAL(12,3) NOT NULL,
    tare_weight_kg DECIMAL(12,3) NOT NULL,
    clearance_date TIMESTAMP WITH TIME ZONE NOT NULL,
    issued_by UUID REFERENCES users(id) NOT NULL,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gate_passes_token ON gate_passes(gate_pass_token);
CREATE INDEX idx_gate_passes_gate_in ON gate_passes(gate_in_id);
```

---

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

---

## QC Inspection Tables

### qc_checklists
```sql
-- Configurable inspection templates per product category or specific product
CREATE TABLE qc_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_name VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES products(id),        -- specific product (null = applies by category)
    product_category_id UUID REFERENCES product_categories(id),
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_qc_checklists_product ON qc_checklists(product_id);
CREATE INDEX idx_qc_checklists_category ON qc_checklists(product_category_id);
CREATE INDEX idx_qc_checklists_active ON qc_checklists(is_active) WHERE is_active = true;
```

### qc_checklist_items
```sql
CREATE TABLE qc_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES qc_checklists(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(30) NOT NULL,
    item_description TEXT,
    is_critical BOOLEAN DEFAULT false,  -- failure blocks QC pass
    sort_order INTEGER DEFAULT 0,
    CONSTRAINT valid_category CHECK (item_category IN ('visual', 'dimensional', 'packaging'))
);

CREATE INDEX idx_qc_checklist_items_checklist ON qc_checklist_items(checklist_id);
```

### qc_events
```sql
-- Master QC record per shipment — 11-state lifecycle
CREATE TABLE qc_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_event_number VARCHAR(50) UNIQUE NOT NULL,
    gate_in_id UUID REFERENCES gate_entries(id) NOT NULL,
    scale_in_id UUID REFERENCES scale_in_entries(id),
    vehicle_number VARCHAR(50) NOT NULL,
    product_code VARCHAR(100),
    product_category VARCHAR(100),
    net_weight_kg DECIMAL(12,3),
    supplier_name VARCHAR(255),
    supplier_id UUID REFERENCES vendors(id),
    priority VARCHAR(20) DEFAULT 'normal',
    checklist_id UUID REFERENCES qc_checklists(id),
    assigned_inspector_id UUID REFERENCES users(id),
    status VARCHAR(40) DEFAULT 'event_created',
    final_decision VARCHAR(20),
    decision_remarks TEXT,
    decision_at TIMESTAMP WITH TIME ZONE,
    decided_by UUID REFERENCES users(id),
    poi_id UUID REFERENCES pois(id),
    trip_id UUID REFERENCES trips(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_priority CHECK (priority IN ('normal', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN (
        'event_created', 'sample_collected', 'inspection_in_progress',
        'lab_test_requested', 'lab_test_in_progress', 'lab_results_received',
        'qc_pass', 'qc_fail', 'qc_recheck', 'qc_complete', 'qc_auto_pass'
    )),
    CONSTRAINT valid_decision CHECK (final_decision IN ('pass', 'fail', 'recheck', 'auto_pass', NULL))
);

CREATE INDEX idx_qc_events_number ON qc_events(qc_event_number);
CREATE INDEX idx_qc_events_gate_in ON qc_events(gate_in_id);
CREATE INDEX idx_qc_events_status ON qc_events(status);
CREATE INDEX idx_qc_events_inspector ON qc_events(assigned_inspector_id);
CREATE INDEX idx_qc_events_poi ON qc_events(poi_id);
```

### qc_samples
```sql
CREATE TABLE qc_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_event_id UUID REFERENCES qc_events(id) ON DELETE CASCADE,
    sample_type VARCHAR(100) NOT NULL,      -- e.g., Grain, Feed Pellet, Packaging
    sample_quantity DECIMAL(10,3),
    sample_uom VARCHAR(20),
    qr_code VARCHAR(100) UNIQUE,
    qr_label_printed BOOLEAN DEFAULT false,
    collected_by UUID REFERENCES users(id) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    collection_location VARCHAR(100),
    status VARCHAR(30) DEFAULT 'collected',
    storage_location VARCHAR(100),
    CONSTRAINT valid_status CHECK (status IN ('collected', 'in_inspection', 'sent_to_lab', 'disposed'))
);

CREATE INDEX idx_qc_samples_event ON qc_samples(qc_event_id);
CREATE INDEX idx_qc_samples_qr ON qc_samples(qr_code);
```

### qc_inspections
```sql
-- Physical inspection execution per QC event
CREATE TABLE qc_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_event_id UUID REFERENCES qc_events(id) ON DELETE CASCADE,
    sample_id UUID REFERENCES qc_samples(id),
    checklist_id UUID REFERENCES qc_checklists(id) NOT NULL,
    total_items INTEGER NOT NULL DEFAULT 0,
    passed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    warning_items INTEGER DEFAULT 0,
    score_percentage DECIMAL(5,2),
    inspected_by UUID REFERENCES users(id) NOT NULL,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress',
    CONSTRAINT valid_status CHECK (status IN ('in_progress', 'complete', 'failed'))
);

CREATE INDEX idx_qc_inspections_event ON qc_inspections(qc_event_id);
CREATE INDEX idx_qc_inspections_sample ON qc_inspections(sample_id);
```

### qc_inspection_results
```sql
CREATE TABLE qc_inspection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES qc_inspections(id) ON DELETE CASCADE,
    item_id UUID REFERENCES qc_checklist_items(id) NOT NULL,
    result VARCHAR(20) NOT NULL,
    remarks TEXT,
    photo_evidence TEXT,    -- S3 URL
    CONSTRAINT valid_result CHECK (result IN ('pass', 'fail', 'warning', 'not_checked'))
);

CREATE INDEX idx_qc_results_inspection ON qc_inspection_results(inspection_id);
CREATE INDEX idx_qc_results_item ON qc_inspection_results(item_id);
```

### lab_test_requests
```sql
CREATE TABLE lab_test_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_event_id UUID REFERENCES qc_events(id) ON DELETE CASCADE,
    sample_id UUID REFERENCES qc_samples(id),
    priority VARCHAR(20) DEFAULT 'normal',
    requested_by UUID REFERENCES users(id) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'requested',
    assigned_lab_technician UUID REFERENCES users(id),
    lab_location VARCHAR(100),
    CONSTRAINT valid_priority CHECK (priority IN ('normal', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('requested', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_lab_requests_event ON lab_test_requests(qc_event_id);
CREATE INDEX idx_lab_requests_status ON lab_test_requests(status);
```

### lab_test_results
```sql
CREATE TABLE lab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_request_id UUID REFERENCES lab_test_requests(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    result_value DECIMAL(12,4),
    result_unit VARCHAR(30),        -- %, ppb, mg/kg, etc.
    pass_fail_status VARCHAR(10) NOT NULL,
    threshold_min DECIMAL(12,4),
    threshold_max DECIMAL(12,4),
    tested_by UUID REFERENCES users(id) NOT NULL,
    tested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    report_pdf_url TEXT,
    CONSTRAINT valid_test_type CHECK (test_type IN (
        'moisture', 'protein', 'aflatoxin', 'foreign_matter',
        'bulk_density', 'broken_grain_percentage', 'pesticide_residue', 'other'
    )),
    CONSTRAINT valid_pass_fail CHECK (pass_fail_status IN ('pass', 'fail'))
);

CREATE INDEX idx_lab_results_request ON lab_test_results(test_request_id);
```

### qc_evidence
```sql
CREATE TABLE qc_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qc_event_id UUID REFERENCES qc_events(id) ON DELETE CASCADE,
    inspection_id UUID REFERENCES qc_inspections(id),
    sample_id UUID REFERENCES qc_samples(id),
    evidence_type VARCHAR(20) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size_kb INTEGER,
    caption TEXT,
    tags JSONB,
    captured_by UUID REFERENCES users(id) NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    gps_location JSONB,                 -- {lat, lng}
    checklist_item_id UUID REFERENCES qc_checklist_items(id),
    CONSTRAINT valid_type CHECK (evidence_type IN ('photo', 'video', 'document'))
);

CREATE INDEX idx_qc_evidence_event ON qc_evidence(qc_event_id);
CREATE INDEX idx_qc_evidence_inspection ON qc_evidence(inspection_id);
CREATE INDEX idx_qc_evidence_type ON qc_evidence(evidence_type);
```

---

## Trip Costing & Notifications Tables

### trip_costs
```sql
CREATE TABLE trip_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    fleet_type VARCHAR(20) NOT NULL,
    total_distance_km DECIMAL(10,2),
    -- Own fleet cost fields
    cost_per_km DECIMAL(10,2),
    distance_based_cost DECIMAL(12,2),
    fuel_cost DECIMAL(12,2),
    fuel_liters DECIMAL(10,3),
    fuel_rate_per_liter DECIMAL(8,2),
    maintenance_allocation DECIMAL(12,2),
    toll_ferry_parking DECIMAL(12,2),
    other_operational_charges DECIMAL(12,2),
    -- Vendor fleet cost fields
    vendor_trip_charge DECIMAL(12,2),       -- from awarded bid
    vendor_additional_charges DECIMAL(12,2), -- detention, claims
    -- Summary
    total_trip_cost DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    entered_by UUID REFERENCES users(id) NOT NULL,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_fleet_type CHECK (fleet_type IN ('own_fleet', 'vendor'))
);

CREATE INDEX idx_trip_costs_trip ON trip_costs(trip_id);
CREATE INDEX idx_trip_costs_fleet_type ON trip_costs(fleet_type);
```

### vendor_invoices
```sql
CREATE TABLE vendor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,   -- INV-YYYYMMDD-NNNN
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    trip_id UUID REFERENCES trips(id),
    transport_order_id UUID REFERENCES transport_orders(id),
    trip_cost_id UUID REFERENCES trip_costs(id),
    subtotal DECIMAL(14,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    invoice_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    erp_sync_status VARCHAR(20) DEFAULT 'pending',
    erp_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')),
    CONSTRAINT valid_erp_status CHECK (erp_sync_status IN ('pending', 'synced', 'failed'))
);

CREATE INDEX idx_vendor_invoices_number ON vendor_invoices(invoice_number);
CREATE INDEX idx_vendor_invoices_vendor ON vendor_invoices(vendor_id);
CREATE INDEX idx_vendor_invoices_status ON vendor_invoices(status);
CREATE INDEX idx_vendor_invoices_trip ON vendor_invoices(trip_id);
```

### notifications
```sql
-- Multi-channel delivery log: email, SMS, push, in-app
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES users(id),
    recipient_vendor_id UUID REFERENCES vendors(id),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    channel VARCHAR(20) NOT NULL,
    notification_type VARCHAR(60) NOT NULL,    -- BID_AWARDED, TRIP_ASSIGNED, OTP_DELIVERY, etc.
    subject VARCHAR(255),
    body TEXT NOT NULL,
    reference_entity_type VARCHAR(50),         -- trip | vendor_bid | gate_entry | etc.
    reference_entity_id UUID,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_channel CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'delivered', 'failed'))
);

CREATE INDEX idx_notifications_user ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_vendor ON notifications(recipient_vendor_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
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

### Tenant Isolation
Tenant isolation is enforced at the PostgreSQL schema level via `django-tenants`. Each tenant has a dedicated schema; there is no `tenant_id` column in application tables and no RLS policy needed for tenant separation.

The `search_path` is set per request by the `django-tenants` middleware:
```sql
SET search_path TO tenant_001, public;
```

All subsequent queries within that request automatically operate against `tenant_001`'s tables.

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