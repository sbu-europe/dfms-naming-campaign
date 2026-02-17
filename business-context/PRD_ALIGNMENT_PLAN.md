# PRD Reference Alignment Plan

**Source of Truth**: `business-context/03-prd-reference/`  
**Target**: `business-context/04-implementation-stories/`

## Overview

- **PRD User Stories Found**: 66 (embedded in module files)
- **Implementation Stories**: 64 (individual files)
- **Action Required**: Align implementation stories with PRD reference

## Strategy

1. **Map PRD stories to implementation stories** by module and functionality
2. **Update existing stories** to match PRD acceptance criteria and functional requirements
3. **Add missing stories** from PRD that don't exist in implementation
4. **Review and potentially remove** stories not in PRD (after verification)

## Module-by-Module Analysis

### 01-foundation (20 PRD stories)

**PRD Stories**:
- Organization Signup & Tenant Creation
- Subscription Plan Selection  
- User Invitation & Activation
- OTP Verification System
- Account Deactivation
- Password & Account Reset
- User Activity & Audit Logs
- Tenant Data Isolation
- Authentication & Security (Login)
- Multi-Factor Authentication (2FA)
- Session Control
- Role-Based Access Control
- Dynamic Role Builder
- Multi-Tenant RBAC

**Implementation Stories**:
- US-007: User and Role Management
- US-008: Tenant Configuration
- US-064: Subscription Plan Selection
- US-065: User Invitation & Activation
- US-066: OTP Verification
- US-067: Password & Account Reset
- US-068: Account Deactivation
- US-069: User Activity Audit Logs

**Action**: 
- Update US-007 to include all RBAC features from PRD
- Update US-008 to include organization signup and tenant isolation
- Verify US-064 to US-069 align with PRD
- Add missing: Organization Signup, 2FA, Session Control (if not covered)

### 02-master-data (11 PRD stories)

**PRD Stories**:
- Entity Registration (Master Setup)
- Bulk Upload & Inline Master Data Management
- CRUD Capability for Master Data
- Referential Integrity Rules
- POI Management (Define, Add/Edit/Remove, Classification, GPS Integration)
- Product Master Data (Define, Flexible Catalogue, Transport/QC Attributes)

**Implementation Stories**:
- US-001: Vehicle Master Data
- US-002: Driver Master Data
- US-003: Helper Master Data
- US-004: Vendor Master Data
- US-005: POI Master Data
- US-006: Product Master Data

**Action**:
- Update all master data stories to include bulk upload (already done in some)
- Update US-005 to include POI classification and GPS integration
- Update US-006 to include flexible catalogue and transport/QC attributes
- Add missing: Referential Integrity Rules (if not covered)

### 03-core-operations (8 PRD stories)

**PRD Stories**:
- TR Creation by Distribution Officer
- TR Approval by Distribution Manager
- TR Assessment & Review by Transport Planner
- Trip Closure (Automatic)
- Trip Costing
- Vendor Trip Finalization
- Driver Mobile (view trips)
- Vendor Mobile (view TO list)

**Implementation Stories**:
- US-009: FG Transfer Requisition
- US-010: Port Transfer Requisition
- US-011: Distribution Approval
- US-012: Procurement Approval
- US-013: Stock Validation
- US-014: Capacity Checking
- US-015: TR Assessment
- US-016: Fleet Availability
- US-017: TO Creation Multiple
- US-018: TO Creation Transport Planner
- US-019: TO Execution Vendor Direct
- US-020: TO Execution Own Fleet
- US-021: Trip Lifecycle
- US-025: Trip Closure POD
- US-059: Trip Cost Calculation
- US-060: Profitability Analysis

**Action**:
- Verify US-009, US-010, US-011, US-012 align with PRD TR workflows
- Update US-015 to match PRD TR Assessment details
- Update US-021 to include automatic trip closure
- Update US-059 to match PRD trip costing details
- Add missing: Vendor Trip Finalization (if not covered)

### 04-operations-support (4 PRD stories)

**PRD Stories**:
- Gate-In Registration
- Gate-Out Recording
- Scale-In Weight Recording
- Scale-Out Weight Recording
- Command Center Operations (mentioned but no detailed story)

**Implementation Stories**:
- US-035: Gate-In Source
- US-036: Gate-Out Source
- US-037: Gate-In Destination
- US-038: Gate-Out Destination
- US-039: Scaling Source
- US-040: Scaling Destination
- US-041: Loading Operations
- US-042: Unloading Operations
- US-043: Command Center Monitoring

**Action**:
- Verify gate and scaling stories align with PRD
- Update US-043 to match PRD command center details

### 05-vendor-management (6 PRD stories)

**PRD Stories**:
- Vendor Onboarding & Registration
- Vendor Bidding Portal
- Bid Evaluation
- Real-time TO Updates (Vendor Portal)
- Vendor Portal Access

**Implementation Stories**:
- US-024: Vendor Bidding Portal
- US-027: Vendor Registration & Verification
- US-028: Vendor Performance Tracking
- US-029: Vendor Payment Management
- US-030: Vendor Fleet Management
- US-031: Vendor Portal
- US-032: Vendor Rating & Reviews
- US-033: Vendor Contract Management
- US-034: Vendor Blacklist

**Action**:
- Update US-027 to match PRD vendor onboarding details
- Update US-024 to match PRD bidding portal details
- Add missing: Bid Evaluation (if not covered in US-024)
- Update US-031 to include real-time TO updates

### 06-fleet-management (10 PRD stories)

**PRD Stories**:
- Helper Registration & Management
- Helper Assignment to Driver
- Driver Master Data
- Driver-Vehicle Assignment
- Driver State Tracking
- Driver Availability Status Tracking
- Driver Performance Tracking (Phase 3)
- Fuel Consumption Tracking
- Fuel Entry Recording
- Vehicle Registration & Master Data

**Implementation Stories**:
- US-001: Vehicle Master Data
- US-002: Driver Master Data
- US-003: Helper Master Data
- US-057: Vehicle Maintenance
- US-058: Fuel Management

**Action**:
- Update US-002 to include driver-vehicle assignment, state tracking, availability tracking
- Update US-003 to include helper assignment to driver
- Update US-058 to match PRD fuel tracking details
- Add missing: Driver Performance Tracking (Phase 3 - if not covered)

### 07-mobile-interfaces (3 PRD stories)

**PRD Stories**:
- Driver Mobile Interface
- QC Supervisor Mobile Interface
- Vendor Mobile Application

**Implementation Stories**:
- US-052: Driver Mobile Interface
- US-061: QC Supervisor Mobile
- US-063: Vendor Mobile App

**Action**:
- Verify all mobile stories align with PRD (already updated recently)

### 08-reporting-analytics (3 PRD stories)

**PRD Stories**:
- Daily Transport Operations Visibility
- Vendor Performance & Billing Reports
- Fleet Utilization & Vehicle Health

**Implementation Stories**:
- None in Phase 1 (Phase 3 features)

**Action**:
- Note: These are Phase 3 features, no action needed for Phase 1

### 09-non-functional (1 PRD story)

**PRD Stories**:
- Role-Based Permissions Enforcement

**Implementation Stories**:
- Covered in US-007

**Action**:
- Verify US-007 covers this

## Next Steps

1. **Systematically update each story** module by module
2. **Add missing stories** identified above
3. **Review and remove** stories not in PRD (after careful verification)
4. **Update phase summaries** to reflect changes
5. **Update feature overview** and dependencies

## Notes

- Some PRD stories are embedded in module files and may need to be extracted into individual story files
- Some implementation stories may combine multiple PRD stories (need to verify if this is appropriate)
- Phase 2 and Phase 3 stories are not in scope for this alignment (focus on Phase 1)

