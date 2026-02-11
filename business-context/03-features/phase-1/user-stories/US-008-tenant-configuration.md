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
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
related_stories:
  - US-007-user-role-management.md
tags: [master-data, tenant, configuration, multi-tenant, high-priority]
---

# US-008: Tenant Configuration

## User Story

**As a** System Administrator  
**I want to** configure tenant-specific settings and branding  
**So that** the system can be customized per organization while supporting multi-tenancy

## Business Context

DFMS is designed as a **multi-tenant SaaS platform**. Each tenant (organization) requires:
- **Branding**: Company logo, colors, name
- **Business Settings**: Operational hours, currency, timezone
- **Feature Toggles**: Enable/disable specific features
- **Integration Settings**: API keys for external services (GPS, SMS, maps)
- **Notification Preferences**: Email, SMS, push notification settings

---

## Acceptance Criteria

### AC-1: Tenant Registration
- [ ] System SHALL allow Super Admin to create tenant with:
  - Tenant Name
  - Tenant Code (unique, subdomain)
  - Company Logo
  - Primary Color, Secondary Color
  - Contact Email, Phone
  - Address
  - Subscription Plan (Basic, Professional, Enterprise)
  - Subscription Start/End Date
  - Status (Active, Suspended, Expired)
- [ ] System SHALL generate unique tenant ID
- [ ] System SHALL create tenant database schema (if multi-schema approach)

### AC-2: Business Configuration
- [ ] System SHALL allow Admin to configure:
  - Business Hours (from-to time)
  - Working Days (Mon-Sun selection)
  - Currency (BDT, USD, etc.)
  - Timezone
  - Date Format (DD/MM/YYYY, MM/DD/YYYY)
  - Distance Unit (KM, Miles)
  - Weight Unit (KG, LBS)
- [ ] System SHALL apply settings across all tenant users

### AC-3: Feature Toggles
- [ ] System SHALL provide feature enable/disable toggles:
  - Vendor Bidding
  - QC Module
  - Fuel Management
  - Multi-language
  - Mobile Apps
  - Advanced Reporting
- [ ] System SHALL hide disabled features from UI
- [ ] System SHALL block disabled feature API calls

### AC-4: Integration Settings
- [ ] System SHALL allow Admin to configure:
  - GPS/VTS Provider (API URL, API Key)
  - SMS Gateway (Provider, API Key)
  - Email Service (SMTP settings)
  - Map Provider (Google Maps API Key / OSM)
  - Payment Gateway (if applicable)
- [ ] System SHALL validate integration credentials
- [ ] System SHALL test integration connectivity

### AC-5: Notification Preferences
- [ ] System SHALL allow configuring notification channels:
  - Email notifications (enabled/disabled)
  - SMS notifications (enabled/disabled)
  - Push notifications (enabled/disabled)
- [ ] System SHALL configure notification templates per event
- [ ] System SHALL set notification recipients per event type

### AC-6: Branding Application
- [ ] System SHALL display tenant logo in header
- [ ] System SHALL apply tenant colors to UI theme
- [ ] System SHALL show tenant name in page titles
- [ ] System SHALL use tenant branding in emails and reports

---

## Functional Requirements

### FR-001: Tenant Management
- [Critical] Tenant registration and configuration
- [Critical] Tenant isolation (data security)
- [High] Tenant subdomain routing (e.g., nourish.dfms.com)
- [Medium] Tenant-specific database schema

### FR-002: Configuration UI
- [Critical] Settings page with tabs (General, Business, Features, Integrations, Notifications)
- [High] Real-time preview of branding changes
- [High] Configuration validation
- [Medium] Configuration export/import (JSON)

### FR-003: Feature Toggle System
- [Critical] Feature flag management
- [Critical] Runtime feature check (no deployment needed)
- [High] Feature-based UI rendering
- [High] Feature-based API authorization

### FR-004: Integration Management
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

