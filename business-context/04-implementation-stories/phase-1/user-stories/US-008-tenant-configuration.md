---
title: Tenant Configuration
story_id: US-008
phase: phase-1
module: Master Data Management
priority: High
status: Pending
epic: Master Data Foundation
sprint: Sprint 2
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-prd-reference/01-foundation/user-tenant-management.md
related_stories:
  - US-007-user-role-management.md
tags: [master-data, tenant, configuration, multi-tenant, high-priority]
---

# US-008: Tenant Configuration

## User Story

**As a** new organization  
**I want to** register for a DFMS account and configure tenant settings  
**So that** I can start managing my transport and logistics operations digitally with customized settings

## Business Context

DFMS is designed as a **multi-tenant SaaS platform**. Organizations need to:
1. **Register**: Sign up for a DFMS account (Organization Signup & Tenant Creation)
2. **Configure**: Set up tenant-specific settings and branding
3. **Isolate**: Ensure complete data isolation between organizations

Each tenant (organization) requires:
- **Registration**: Organization details, admin contact, OTP verification
- **Branding**: Company logo, colors, name
- **Business Settings**: Operational hours, currency, timezone
- **Feature Toggles**: Enable/disable specific features
- **Integration Settings**: API keys for external services (GPS, SMS, maps)
- **Notification Preferences**: Email, SMS, push notification settings
- **Data Isolation**: Complete logical and physical separation from other tenants

---

## Acceptance Criteria

### AC-1: Organization Signup & Tenant Creation
- [ ] System SHALL provide public registration form for new organization signup
- [ ] Registration form SHALL collect:
  - Organization/Company name
  - Admin email
  - Contact number
  - Business category
  - Industry Type
  - Address
- [ ] System SHALL send email and SMS OTP to verify admin contact details before account activation
- [ ] System SHALL auto-generate unique tenant ID upon successful registration
- [ ] System SHALL create dedicated database schema ensuring multi-tenant separation
- [ ] System SHALL send registration confirmation email with activation link and getting started guide
- [ ] OTP SHALL be valid for 10 minutes with resend option after 2 minutes cooldown
- [ ] Failed OTP attempts (>3) SHALL temporarily block registration for 15 minutes
- [ ] All registration attempts SHALL be logged with timestamp, IP address, device information
- [ ] System SHALL validate email domain uniqueness to prevent duplicate registrations
- [ ] System SHALL create default admin user account upon OTP verification

### AC-2: Tenant Configuration
- [ ] System SHALL allow Tenant Admin to configure:
  - Tenant Name
  - Tenant Code (unique, subdomain)
  - Company Logo
  - Primary Color, Secondary Color
  - Contact Email, Phone
  - Address
  - Subscription Plan (Basic, Starter, Growth, Enterprise)
  - Subscription Start/End Date
  - Status (Active, Suspended, Expired)

### AC-3: Business Configuration
- [ ] System SHALL allow Admin to configure:
  - Business Hours (from-to time)
  - Working Days (Mon-Sun selection)
  - Currency (BDT, USD, etc.)
  - Timezone
  - Date Format (DD/MM/YYYY, MM/DD/YYYY)
  - Distance Unit (KM, Miles)
  - Weight Unit (KG, LBS)
- [ ] System SHALL apply settings across all tenant users

### AC-4: Feature Toggles
- [ ] System SHALL provide feature enable/disable toggles:
  - Vendor Bidding
  - QC Module
  - Fuel Management
  - Multi-language
  - Mobile Apps
  - Advanced Reporting
- [ ] System SHALL hide disabled features from UI
- [ ] System SHALL block disabled feature API calls

### AC-5: Integration Settings
- [ ] System SHALL allow Admin to configure:
  - GPS/VTS Provider (API URL, API Key)
  - SMS Gateway (Provider, API Key)
  - Email Service (SMTP settings)
  - Map Provider (Google Maps API Key / OSM)
  - Payment Gateway (if applicable)
- [ ] System SHALL validate integration credentials
- [ ] System SHALL test integration connectivity

### AC-6: Notification Preferences
- [ ] System SHALL allow configuring notification channels:
  - Email notifications (enabled/disabled)
  - SMS notifications (enabled/disabled)
  - Push notifications (enabled/disabled)
- [ ] System SHALL configure notification templates per event
- [ ] System SHALL set notification recipients per event type

### AC-7: Tenant Data Isolation
- [ ] Each organization's data (user, fleet, trips, vendors) SHALL be logically and physically segregated
- [ ] Each tenant SHALL have unique tenant ID and isolated database schema
- [ ] Tenant ID SHALL be auto-appended to all queries
- [ ] No cross-tenant data SHALL be visible in UI or API
- [ ] Database foreign keys SHALL enforce boundaries
- [ ] API endpoints SHALL validate tenant context
- [ ] Tenant-specific file storage folders SHALL be used
- [ ] Encrypted separate tenant backups SHALL be maintained

### AC-8: Branding Application
- [ ] System SHALL display tenant logo in header
- [ ] System SHALL apply tenant colors to UI theme
- [ ] System SHALL show tenant name in page titles
- [ ] System SHALL use tenant branding in emails and reports

---

## Functional Requirements

### FR-001: Organization Signup & Tenant Creation
- [Critical] System SHALL provide public registration form for new organization signup
- [Critical] Registration form SHALL collect: Organization name, Admin email, Contact number, Business category, Industry Type, Address
- [Critical] Upon successful registration, system SHALL generate unique tenant ID and dedicated database schema
- [Critical] System SHALL send email and SMS OTP to verify admin contact details before account activation
- [High] System SHALL create default admin user account upon OTP verification
- [High] Verification logs SHALL be stored with timestamp and IP address for audit purposes
- [High] System SHALL validate email domain uniqueness to prevent duplicate registrations
- [High] OTP SHALL be valid for 10 minutes with resend option after 2 minutes cooldown
- [High] Failed OTP attempts (>3) SHALL temporarily block registration for 15 minutes

### FR-002: Tenant Management
- [Critical] Tenant registration and configuration
- [Critical] Tenant isolation (data security)
- [Critical] System SHALL implement logical and physical tenant data isolation
- [Critical] Each tenant SHALL have unique tenant ID and dedicated database schema
- [Critical] All user data (users, fleet, trips, vendors) SHALL be scoped to tenant ID
- [High] Tenant subdomain routing (e.g., nourish.dfms.com)
- [High] System SHALL prevent tenant ID tampering through request validation

### FR-003: Configuration UI
- [Critical] Settings page with tabs (General, Business, Features, Integrations, Notifications)
- [High] Real-time preview of branding changes
- [High] Configuration validation
- [Medium] Configuration export/import (JSON)

### FR-004: Feature Toggle System
- [Critical] Feature flag management
- [Critical] Runtime feature check (no deployment needed)
- [High] Feature-based UI rendering
- [High] Feature-based API authorization

### FR-005: Integration Management
- [High] Integration credential encryption
- [High] Integration health check
- [Medium] Integration usage monitoring

---

## Business Rules

### BR-TC-001: Unique Tenant Code
- Tenant code must be unique (used for subdomain)
- **Enforcement**: Database constraint

### BR-TC-002: Active Subscription Requirement
- Tenant must have active subscription to access system
- **Enforcement**: Login validation

### BR-TC-003: Feature Access by Plan
- Basic: Core features only
- Professional: Core + optimization features
- Enterprise: All features
- **Enforcement**: Feature toggle based on subscription plan

### BR-TC-004: Integration Credential Security
- Integration credentials must be encrypted at rest
- **Enforcement**: Encryption before storage

---

## Data Model

```typescript
Tenant {
  id: UUID (PK)
  
  tenant_name: String
  tenant_code: String (unique, lowercase, alphanumeric)
  subdomain: String (computed from tenant_code)
  
  company_logo_url: String (nullable)
  primary_color: String (hex color, default: #1976d2)
  secondary_color: String (hex color, default: #dc004e)
  
  contact_email: String
  contact_phone: String
  address: Text
  
  subscription_plan: Enum (Basic, Professional, Enterprise)
  subscription_start_date: Date
  subscription_end_date: Date
  status: Enum (Active, Suspended, Expired, Trial)
  
  created_at: Timestamp
  updated_at: Timestamp
}

TenantConfiguration {
  id: UUID (PK)
  tenant_id: UUID (FK to Tenant, unique)
  
  // Business Settings
  business_hours_from: Time (default: 08:00)
  business_hours_to: Time (default: 18:00)
  working_days: JSON (array of days, default: [1,2,3,4,5,6])
  currency: String (default: 'BDT')
  timezone: String (default: 'Asia/Dhaka')
  date_format: String (default: 'DD/MM/YYYY')
  distance_unit: Enum (KM, Miles, default: KM)
  weight_unit: Enum (KG, LBS, MT, default: KG)
  
  // Feature Toggles
  feature_vendor_bidding: Boolean (default: true)
  feature_qc_module: Boolean (default: true)
  feature_fuel_management: Boolean (default: false)
  feature_multi_language: Boolean (default: false)
  feature_mobile_apps: Boolean (default: true)
  feature_advanced_reporting: Boolean (default: false)
  
  // Integration Settings (encrypted)
  gps_provider: String (nullable)
  gps_api_url: String (nullable)
  gps_api_key_encrypted: String (nullable)
  
  sms_provider: String (nullable)
  sms_api_key_encrypted: String (nullable)
  
  email_smtp_host: String (nullable)
  email_smtp_port: Integer (nullable)
  email_smtp_username: String (nullable)
  email_smtp_password_encrypted: String (nullable)
  
  map_provider: Enum (Google_Maps, OpenStreetMap, default: Google_Maps)
  map_api_key_encrypted: String (nullable)
  
  // Notification Preferences
  notifications_email_enabled: Boolean (default: true)
  notifications_sms_enabled: Boolean (default: false)
  notifications_push_enabled: Boolean (default: true)
  
  updated_at: Timestamp
  updated_by: UUID (FK to User)
}
```

---

## UI/UX Requirements

### Tenant Configuration Page
```
┌──────────────────────────────────────────────────────────────┐
│ Tenant Configuration                                         │
├──────────────────────────────────────────────────────────────┤
│ [General] [Business] [Features] [Integrations] [Notifications]│
│                                                              │
│ ┌─ General Settings ──────────────────────────────────────┐ │
│ │                                                          │ │
│ │ Tenant Name: Nourish Poultry                            │ │
│ │ Tenant Code: nourish (nourish.dfms.com)                 │ │
│ │                                                          │ │
│ │ Company Logo:                                            │ │
│ │ [📷 Current Logo]  [Upload New]                         │ │
│ │                                                          │ │
│ │ Brand Colors:                                            │ │
│ │ Primary: [#1976d2 🎨]  Secondary: [#dc004e 🎨]         │ │
│ │                                                          │ │
│ │ Preview:                                                 │ │
│ │ ┌────────────────────────────────┐                      │ │
│ │ │ [Logo] Nourish Poultry         │                      │ │
│ │ │ [Button with Primary Color]    │                      │ │
│ │ └────────────────────────────────┘                      │ │
│ │                                                          │ │
│ │ Subscription: Professional (Valid until: Dec 31, 2026)   │ │
│ │ Status: ✅ Active                                        │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Cancel]                                [Save Changes]       │
└──────────────────────────────────────────────────────────────┘
```

### Feature Toggles Tab
```
┌──────────────────────────────────────────────────────────────┐
│ Feature Management                                           │
├──────────────────────────────────────────────────────────────┤
│ Enable or disable features for your organization             │
│                                                              │
│ Core Features:                                               │
│ ☑ Vendor Bidding Portal                                     │
│ ☑ Quality Control Module                                    │
│ ☑ Mobile Applications (Driver, QC, Vendor)                  │
│                                                              │
│ Advanced Features: (Professional Plan)                       │
│ ☐ Fuel Management                                           │
│ ☐ Advanced Reporting                                        │
│ ☐ Multi-language Support                                    │
│                                                              │
│ Enterprise Features: (Enterprise Plan) 🔒 Upgrade Required  │
│ ☐ AI-powered Route Optimization                             │
│ ☐ Predictive Maintenance                                    │
│ ☐ Custom Integrations                                       │
│                                                              │
│ [Save Changes]                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get tenant configuration
GET /api/v1/tenants/me/configuration
Response: {tenant, configuration}

// Update tenant configuration
PATCH /api/v1/tenants/me/configuration
Body: {field: value}

// Upload tenant logo
POST /api/v1/tenants/me/logo
Body: FormData (file upload)

// Test integration
POST /api/v1/tenants/me/test-integration
Body: {integration_type: 'gps' | 'sms' | 'email'}
Response: {success: boolean, message: string}

// Get feature flags
GET /api/v1/tenants/me/features
Response: {features: {feature_name: boolean}}

// Check feature enabled
GET /api/v1/tenants/me/features/{feature_name}
Response: {enabled: boolean}
```

---

## Testing Scenarios

### Happy Path
1. Super Admin creates tenant → Tenant created
2. Admin configures branding → Logo and colors applied
3. Admin enables feature → Feature visible in UI
4. Admin disables feature → Feature hidden

### Edge Cases
1. **Duplicate tenant code**: Error
2. **Expired subscription**: Login blocked
3. **Invalid integration credentials**: Test fails
4. **Feature disabled**: API call blocked

---

## Dependencies

### Prerequisites
- ✅ US-007: User & Role Management

### Enables
- → Multi-tenant support for all features
- → Subscription-based feature access

---

## Definition of Done
- [ ] Tenant CRUD operations
- [ ] Configuration management
- [ ] Feature toggle system
- [ ] Integration settings (encrypted)
- [ ] Branding application
- [ ] Subscription validation
- [ ] Unit tests > 85%
- [ ] Multi-tenant isolation tested
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 2  
**Priority**: High (Enables multi-tenancy)

