# DFMS Phase 1 - Development Tasks

> Development tasks for DFMS Phase 1 implementation, organized by Epic and Story

**Source**: Based on `source-documents/04-wbs/epics-table.md`, `source-documents/04-wbs/stories-table.md`, `source-documents/03-sow/SOW Phase-1.md`, and `source-documents/01-prd/PRD_DFMS_v1.0.md`  
**Status**: Planned  
**Duration**: 26 weeks (12 sprints)

---

## 📋 Development Task Categories

1. **Backend Development** - API, Services, Business Logic
2. **Frontend Development** - UI Components, Pages, User Interfaces
3. **Database Development** - Schema Design, Migrations, Queries
4. **Integration Development** - Third-party APIs, External Services
5. **Mobile Development** - Mobile Apps, Mobile Interfaces
6. **Infrastructure & DevOps** - CI/CD, Deployment, Configuration
7. **Testing** - Unit Tests, Integration Tests, E2E Tests

---

## 🎯 EPIC-001: System Foundation

**Sprint**: Sprint 1 | **Duration**: 2 weeks | **Story Points**: 40 SP

### US-001: User Login & Account Lockout

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-001-001 | Design authentication database schema (users, sessions, login_attempts) | Database | 3 | None |
| DEV-001-002 | Implement login API endpoint with credential validation | Backend | 5 | DEV-001-001 |
| DEV-001-003 | Implement account lockout logic (3 attempts, 30-min lockout) | Backend | 3 | DEV-001-002 |
| DEV-001-004 | Create login UI component with password show/hide toggle | Frontend | 3 | DEV-001-002 |
| DEV-001-005 | Implement admin locked accounts view API | Backend | 2 | DEV-001-003 |
| DEV-001-006 | Create admin unlock user functionality (UI + API) | Full Stack | 2 | DEV-001-005 |
| DEV-001-007 | Implement audit logging for login attempts and unlocks | Backend | 2 | DEV-001-003 |

### US-002: Multi-Factor Auth (2FA)

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-002-001 | Design 2FA database schema (user_2fa_settings, otp_codes) | Database | 2 | DEV-001-001 |
| DEV-002-002 | Implement OTP generation service (Email + SMS) | Backend | 5 | DEV-002-001 |
| DEV-002-003 | Integrate SMS provider API (Twilio/AWS SNS) | Integration | 3 | DEV-002-002 |
| DEV-002-004 | Implement authenticator app support (TOTP) | Backend | 5 | DEV-002-001 |
| DEV-002-005 | Create 2FA verification UI component | Frontend | 3 | DEV-002-002 |
| DEV-002-006 | Implement 2FA enforcement middleware | Backend | 3 | DEV-002-002 |
| DEV-002-007 | Add 2FA audit logging | Backend | 1 | DEV-002-006 |

### US-003: Session Control

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-003-001 | Design session management schema (sessions table) | Database | 2 | DEV-001-001 |
| DEV-003-002 | Implement session creation and tracking (IP, Device) | Backend | 3 | DEV-003-001 |
| DEV-003-003 | Implement 30-minute inactivity timeout logic | Backend | 3 | DEV-003-002 |
| DEV-003-004 | Create session activity monitoring middleware | Backend | 2 | DEV-003-002 |
| DEV-003-005 | Implement auto-logout on timeout (frontend + backend) | Full Stack | 2 | DEV-003-003 |
| DEV-003-006 | Create active sessions management UI | Frontend | 2 | DEV-003-002 |

### US-004: Role Hierarchy (RBAC)

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-004-001 | Design RBAC database schema (roles, permissions, role_permissions, user_roles) | Database | 5 | DEV-001-001 |
| DEV-004-002 | Implement role and permission CRUD APIs | Backend | 5 | DEV-004-001 |
| DEV-004-003 | Create role hierarchy management UI | Frontend | 5 | DEV-004-002 |
| DEV-004-004 | Implement permission checking middleware | Backend | 5 | DEV-004-001 |
| DEV-004-005 | Implement UI-level permission enforcement (menu/button visibility) | Frontend | 3 | DEV-004-004 |
| DEV-004-006 | Implement API-level permission validation | Backend | 3 | DEV-004-004 |
| DEV-004-007 | Implement row-level security for department-level access | Backend | 5 | DEV-004-004 |

---

## 🎯 EPIC-002: User & Tenant Foundation

**Sprint**: Sprint 1 | **Duration**: 2 weeks | **Story Points**: 40 SP

### US-005: User Invitation & Activation

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-005-001 | Design user invitation schema (invitations table) | Database | 2 | DEV-001-001 |
| DEV-005-002 | Implement user invitation API with email sending | Backend | 5 | DEV-005-001 |
| DEV-005-003 | Create user invitation UI form | Frontend | 3 | DEV-005-002 |
| DEV-005-004 | Implement 72-hour activation link generation | Backend | 2 | DEV-005-002 |
| DEV-005-005 | Create user activation page (password setup, OTP verification) | Frontend | 5 | DEV-005-004 |
| DEV-005-006 | Implement activation workflow API | Backend | 3 | DEV-005-004 |
| DEV-005-007 | Add invitation status tracking (Sent → Pending → Activated/Expired) | Backend | 2 | DEV-005-002 |

### US-006: OTP Verification

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-006-001 | Design OTP verification schema (otp_verifications table) | Database | 2 | DEV-001-001 |
| DEV-006-002 | Implement dual OTP generation (Email + SMS) | Backend | 3 | DEV-002-002 |
| DEV-006-003 | Implement OTP validation API (10-min expiry, 3 attempts max) | Backend | 3 | DEV-006-001 |
| DEV-006-004 | Implement 2-minute cooldown for OTP resend | Backend | 2 | DEV-006-002 |
| DEV-006-005 | Create OTP verification UI component | Frontend | 3 | DEV-006-003 |
| DEV-006-006 | Implement OTP audit logging with IP/Device tracking | Backend | 2 | DEV-006-003 |
| DEV-006-007 | Add rate limiting (5 OTP requests/hour per user) | Backend | 2 | DEV-006-002 |

### US-007: Account Deactivation

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-007-001 | Design account deactivation schema (deactivations table) | Database | 2 | DEV-001-001 |
| DEV-007-002 | Implement account deactivation API (Temporary/Permanent) | Backend | 3 | DEV-007-001 |
| DEV-007-003 | Implement session termination on deactivation | Backend | 2 | DEV-003-002 |
| DEV-007-004 | Create account deactivation UI form | Frontend | 3 | DEV-007-002 |
| DEV-007-005 | Implement deactivation audit trail preservation | Backend | 2 | DEV-007-002 |
| DEV-007-006 | Implement account reactivation workflow | Backend | 2 | DEV-007-002 |
| DEV-007-007 | Add email notification for deactivation | Backend | 1 | DEV-007-002 |

### US-008: Password & Account Reset

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-008-001 | Design password reset schema (password_resets table) | Database | 2 | DEV-001-001 |
| DEV-008-002 | Implement self-service password reset API (15-min link) | Backend | 3 | DEV-008-001 |
| DEV-008-003 | Implement admin-assisted password reset (OTP-based) | Backend | 4 | DEV-008-001 |
| DEV-008-004 | Create forgot password UI page | Frontend | 2 | DEV-008-002 |
| DEV-008-005 | Create password reset UI page | Frontend | 2 | DEV-008-002 |
| DEV-008-006 | Implement password complexity validation | Backend | 2 | DEV-008-002 |
| DEV-008-007 | Implement password reset audit logging | Backend | 2 | DEV-008-002 |

### US-009: User Activity & Audit Logs

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-009-001 | Design audit log schema (audit_logs table) | Database | 3 | DEV-001-001 |
| DEV-009-002 | Implement audit logging service (login, logout, password reset) | Backend | 5 | DEV-009-001 |
| DEV-009-003 | Implement audit log API with filtering and export | Backend | 3 | DEV-009-002 |
| DEV-009-004 | Create audit log viewer UI with filters | Frontend | 5 | DEV-009-003 |
| DEV-009-005 | Implement audit log export functionality (CSV/Excel) | Backend | 2 | DEV-009-003 |

---

## 🎯 EPIC-003: Master Data & Configuration

**Sprint**: Sprint 2 | **Duration**: 2 weeks | **Story Points**: 50 SP

### US-010: Master Entity Registration

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-010-001 | Design master data schema (vehicles, drivers, helpers, vendors, products, pois, routes) | Database | 8 | DEV-001-001 |
| DEV-010-002 | Implement vehicle master data API (CRUD) | Backend | 5 | DEV-010-001 |
| DEV-010-003 | Implement driver master data API (CRUD) | Backend | 5 | DEV-010-001 |
| DEV-010-004 | Implement helper master data API (CRUD) | Backend | 3 | DEV-010-001 |
| DEV-010-005 | Implement vendor master data API (CRUD) | Backend | 5 | DEV-010-001 |
| DEV-010-006 | Implement product master data API (CRUD) | Backend | 5 | DEV-010-001 |
| DEV-010-007 | Implement POI master data API (CRUD) | Backend | 5 | DEV-010-001 |
| DEV-010-008 | Implement route master data API (CRUD) | Backend | 3 | DEV-010-001 |
| DEV-010-009 | Create master data registration UI components | Frontend | 8 | DEV-010-002 |

### US-011: Bulk Upload & Inline Master Data Management

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-011-001 | Design bulk upload schema (bulk_uploads, bulk_upload_rows) | Database | 2 | DEV-010-001 |
| DEV-011-002 | Implement CSV template generation API | Backend | 2 | DEV-010-001 |
| DEV-011-003 | Implement CSV upload and parsing service | Backend | 5 | DEV-011-001 |
| DEV-011-004 | Implement row-level validation and error reporting | Backend | 5 | DEV-011-003 |
| DEV-011-005 | Create bulk upload UI with file upload and progress tracking | Frontend | 5 | DEV-011-003 |
| DEV-011-006 | Implement inline editing functionality for master data | Frontend | 5 | DEV-010-009 |
| DEV-011-007 | Implement bulk append without overwriting existing records | Backend | 3 | DEV-011-003 |

### US-012: Master CRUD Operations

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-012-001 | Implement master data list view API with pagination, search, sort | Backend | 5 | DEV-010-001 |
| DEV-012-002 | Create master data list UI with filters and search | Frontend | 5 | DEV-012-001 |
| DEV-012-003 | Implement master data detail view API | Backend | 3 | DEV-010-001 |
| DEV-012-004 | Create master data detail/edit UI | Frontend | 5 | DEV-012-003 |
| DEV-012-005 | Implement master data delete API with soft delete | Backend | 3 | DEV-010-001 |
| DEV-012-006 | Implement master data export functionality | Backend | 2 | DEV-012-001 |

### US-013: Data Consistency Referential Control

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-013-001 | Implement database foreign key constraints | Database | 3 | DEV-010-001 |
| DEV-013-002 | Implement referential integrity validation service | Backend | 5 | DEV-013-001 |
| DEV-013-003 | Implement dependency checking before delete operations | Backend | 3 | DEV-012-005 |
| DEV-013-004 | Create validation error messages for referential violations | Backend | 2 | DEV-013-002 |

---

## 🎯 EPIC-004: POI Management & Geofencing

**Sprint**: Sprint 3 | **Duration**: 2 weeks | **Story Points**: 65 SP

### US-014: POI Definition

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-014-001 | Enhance POI schema with coordinates, radius, capacity, contact info | Database | 3 | DEV-010-007 |
| DEV-014-002 | Implement POI creation API with validation | Backend | 3 | DEV-014-001 |
| DEV-014-003 | Create POI creation UI form | Frontend | 3 | DEV-014-002 |

### US-015: POI CRUD Operations

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-015-001 | Implement POI list view API with filters | Backend | 2 | DEV-014-001 |
| DEV-015-002 | Create POI list UI with search and filters | Frontend | 3 | DEV-015-001 |
| DEV-015-003 | Implement POI edit API | Backend | 2 | DEV-014-002 |
| DEV-015-004 | Implement POI delete API | Backend | 2 | DEV-014-002 |

### US-016: POI Classification

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-016-001 | Add POI classification field (Inbound/Outbound/Neutral) | Database | 1 | DEV-014-001 |
| DEV-016-002 | Implement default classification logic based on POI type | Backend | 2 | DEV-016-001 |
| DEV-016-003 | Add classification field to POI UI | Frontend | 1 | DEV-016-001 |

### US-017: Map Layer Integration

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-017-001 | Integrate Google Maps API / Mapbox | Integration | 5 | DEV-014-001 |
| DEV-017-002 | Implement POI display on map API | Backend | 3 | DEV-017-001 |
| DEV-017-003 | Create map UI component with POI markers | Frontend | 5 | DEV-017-002 |
| DEV-017-004 | Implement geofence boundary visualization on map | Frontend | 3 | DEV-017-003 |

### US-018: Real-time Location Tracking

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-018-001 | Design GPS tracking schema (vehicle_locations, gps_tracks) | Database | 3 | DEV-010-001 |
| DEV-018-002 | Integrate GPS/VTS provider API (IoT device integration) | Integration | 8 | DEV-018-001 |
| DEV-018-003 | Implement GPS data ingestion service | Backend | 5 | DEV-018-002 |
| DEV-018-004 | Implement real-time location API | Backend | 3 | DEV-018-003 |
| DEV-018-005 | Create real-time vehicle tracking UI with map | Frontend | 8 | DEV-018-004 |
| DEV-018-006 | Implement configurable GPS refresh interval | Backend | 2 | DEV-018-003 |

### US-019: Geofencing & POI Tracking

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-019-001 | Implement geofence detection algorithm (point-in-circle) | Backend | 5 | DEV-014-001, DEV-018-003 |
| DEV-019-002 | Implement POI entry/exit event detection | Backend | 5 | DEV-019-001 |
| DEV-019-003 | Design geofence events schema (geofence_events table) | Database | 2 | DEV-018-001 |
| DEV-019-004 | Implement geofence event logging | Backend | 3 | DEV-019-002 |
| DEV-019-005 | Create geofence event monitoring UI | Frontend | 3 | DEV-019-004 |

### US-020: Geofencing Boundaries

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-020-001 | Implement geofence boundary validation (50-1000m radius) | Backend | 2 | DEV-014-001 |
| DEV-020-002 | Add geofence boundary editing on map UI | Frontend | 3 | DEV-017-003 |

### US-021: Vehicle Arrival Tracking

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-021-001 | Implement vehicle arrival detection service | Backend | 3 | DEV-019-002 |
| DEV-021-002 | Create vehicle arrival notification system | Backend | 2 | DEV-021-001 |
| DEV-021-003 | Create vehicle arrival dashboard UI | Frontend | 3 | DEV-021-001 |

### US-022: Dwell Time Tracking

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-022-001 | Design dwell time schema (dwell_times table) | Database | 2 | DEV-019-003 |
| DEV-022-002 | Implement dwell time calculation (entry - exit) | Backend | 3 | DEV-021-001 |
| DEV-022-003 | Implement dwell time reporting API | Backend | 2 | DEV-022-002 |
| DEV-022-004 | Create dwell time analytics UI | Frontend | 3 | DEV-022-003 |

---

## 🎯 EPIC-005: Product Inventory Management (PIM)

**Sprint**: Sprint 4 | **Duration**: 3 weeks | **Story Points**: 30 SP

### US-023: Product Master Data

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-023-001 | Enhance product schema (FG/RM, categories, attributes, packing types) | Database | 3 | DEV-010-006 |
| DEV-023-002 | Implement product CRUD API with category support | Backend | 5 | DEV-023-001 |
| DEV-023-003 | Create product management UI | Frontend | 5 | DEV-023-002 |

### US-024: Catalogue Design

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-024-001 | Design product catalogue schema (categories, subcategories, attributes) | Database | 2 | DEV-023-001 |
| DEV-024-002 | Implement catalogue management API | Backend | 3 | DEV-024-001 |
| DEV-024-003 | Create catalogue management UI | Frontend | 3 | DEV-024-002 |

### US-025: Product Configuration

| Task ID | Task Description | Type | Story Points | Dependencies |
|---------|------------------|------|--------------|--------------|
| DEV-025-001 | Add transport attributes to product schema (load type, special handling) | Database | 2 | DEV-023-001 |
| DEV-025-002 | Add QC attributes to product schema (sampling required, checklist type) | Database | 2 | DEV-023-001 |
| DEV-025-003 | Implement product configuration API | Backend | 3 | DEV-025-001 |
| DEV-025-004 | Create product configuration UI | Frontend | 3 | DEV-025-003 |

---

## 📊 Development Task Summary

| Epic | Story Count | Development Tasks | Estimated SP |
|------|-------------|-------------------|--------------|
| EPIC-001 | 4 | 27 | 80 |
| EPIC-002 | 5 | 30 | 75 |
| EPIC-003 | 4 | 25 | 100 |
| EPIC-004 | 9 | 35 | 130 |
| EPIC-005 | 3 | 12 | 40 |
| **Total (Partial)** | **25** | **129** | **465** |

*Note: This is a partial breakdown. Remaining epics (EPIC-006 to EPIC-017) follow similar patterns.*

---

## 🔗 Related Documents

- **[Epic Breakdown](./EPICS.md)** - Epic-level breakdown
- **[Story Breakdown](./STORIES.md)** - Story-level breakdown
- **[Implementation Timeline](./TIMELINE.md)** - Sprint timeline
- **[SOW Phase 1](../../../source-documents/03-sow/SOW%20Phase-1.md)** - Statement of Work

---

**Last Updated**: February 17, 2026  
**Status**: Planned  
**Maintained By**: DFMS Implementation Team
