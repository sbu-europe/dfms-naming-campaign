---
title: Subscription Plan Selection
story_id: US-064
phase: phase-1
module: User & Tenant Management
priority: Critical
status: Pending
epic: Tenant Onboarding
sprint: Sprint 2
story_points: 5
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-008-tenant-configuration.md
  - US-065-user-invitation-activation.md
dependencies: []
tags: [tenant-management, subscription, onboarding, critical]
---

# US-064: Subscription Plan Selection

## User Story

**As an** Organization Admin  
**I want to** select a subscription plan that matches my business size  
**So that** I only pay for features I need and can scale as my business grows

## Business Context

DFMS operates as a multi-tenant SaaS platform. Organizations need to select subscription plans based on their:
- Number of users
- Monthly trip volume
- Required features
- Budget constraints

Subscription plans enable:
- Revenue generation for the platform
- Feature access control
- Resource allocation per tenant
- Scalable pricing model

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL display all four subscription tiers with feature comparison
- [ ] System SHALL allow organization to select subscription plan during signup
- [ ] System SHALL enforce plan limits (users, trips/month) based on selected tier
- [ ] System SHALL display plan features clearly with comparison table
- [ ] System SHALL allow plan upgrade/downgrade (with prorated billing)
- [ ] System SHALL validate plan limits before allowing operations (e.g., trip creation, user addition)
- [ ] System SHALL display current plan usage (users/trips consumed vs. limit)

### Should Have (High)
- [ ] System SHOULD send notifications when approaching plan limits (80%, 90%, 100%)
- [ ] System SHOULD provide plan upgrade prompts when limits are reached
- [ ] System SHOULD show plan comparison with feature highlights
- [ ] System SHOULD support plan trial periods (if applicable)

### Nice to Have (Medium)
- [ ] System MAY support custom enterprise plans
- [ ] System MAY provide plan recommendation based on organization size
- [ ] System MAY show ROI calculator for plan selection

## Functional Requirements

### FR-064-001: Subscription Plan Display
- [Critical] System SHALL display subscription tiers:
  - **Basic**: 5 users, 100 trips/month - TR/TO, Fleet basics, GPS tracking
  - **Starter**: 15 users, 500 trips/month - All Basic + Vendor portal, QC module
  - **Growth**: 50 users, 2000 trips/month - All Starter + Analytics, Cost management, PR/PO
  - **Enterprise**: Unlimited users, Unlimited trips - All features + White-label, ERP integration
- [Critical] System SHALL show feature comparison matrix
- [High] System SHALL highlight recommended plan based on organization profile

### FR-064-002: Plan Selection & Assignment
- [Critical] System SHALL allow plan selection during tenant creation
- [Critical] System SHALL assign selected plan to tenant
- [Critical] System SHALL store plan details with tenant record
- [Critical] System SHALL enforce plan limits in all operations
- [High] System SHALL support plan change requests (upgrade/downgrade)

### FR-064-003: Plan Limit Enforcement
- [Critical] System SHALL prevent user creation beyond plan user limit
- [Critical] System SHALL prevent trip creation beyond plan trip limit (monthly)
- [Critical] System SHALL display current usage vs. limits in dashboard
- [High] System SHALL send alerts when approaching limits
- [High] System SHALL block operations when limits exceeded

### FR-064-004: Plan Management
- [Critical] System SHALL allow Super Admin to manage subscription plans
- [Critical] System SHALL allow Tenant Admin to view current plan and usage
- [High] System SHALL support plan upgrade/downgrade workflow
- [High] System SHALL calculate prorated billing for plan changes
- [Medium] System SHALL support plan trial periods

## Business Rules

### BR-064-001: Plan Limits
- Plan limits are enforced at tenant level
- User count includes all active users (excluding deactivated)
- Trip count resets monthly (calendar month)
- Exceeding limits blocks new operations until upgrade or limit reset

### BR-064-002: Plan Changes
- Plan upgrades take effect immediately
- Plan downgrades take effect at next billing cycle
- Users/trips exceeding new plan limits must be reduced before downgrade
- Plan changes require admin approval

### BR-064-003: Feature Access
- Features are enabled/disabled based on selected plan
- Enterprise plan includes all features
- Feature access is checked before allowing operations

## Data Model

### Subscription Plan Entity
```yaml
SubscriptionPlan:
  plan_id: string (unique)
  plan_name: string (Basic, Starter, Growth, Enterprise)
  max_users: integer
  max_trips_per_month: integer
  features: array[string]
  price: decimal
  billing_period: string (monthly, annual)
  is_active: boolean
```

### Tenant Subscription Entity
```yaml
TenantSubscription:
  tenant_id: string (FK)
  plan_id: string (FK)
  start_date: date
  end_date: date
  current_users: integer
  current_trips_month: integer
  status: string (active, expired, cancelled)
  auto_renew: boolean
```

## UI/UX Requirements

### Subscription Selection Page
- Display all plans in comparison table
- Show feature checkmarks per plan
- Highlight recommended plan
- Display pricing clearly
- Show current usage if plan already selected
- Provide "Select Plan" button per tier

### Plan Management Dashboard
- Display current plan and usage
- Show usage charts (users, trips)
- Display limit warnings
- Provide upgrade/downgrade options
- Show billing information

## API Endpoints

### GET /api/v1/subscription-plans
- List all available subscription plans
- Response includes plan details, features, pricing

### POST /api/v1/tenants/{tenant_id}/subscription
- Assign subscription plan to tenant
- Requires: plan_id, start_date

### GET /api/v1/tenants/{tenant_id}/subscription/usage
- Get current subscription usage
- Response includes: current_users, current_trips_month, limits

### PUT /api/v1/tenants/{tenant_id}/subscription
- Upgrade/downgrade subscription plan
- Requires: plan_id, effective_date

## Non-Functional Requirements

- **Performance**: Plan limit checks must not impact operation performance (< 50ms)
- **Security**: Only Super Admin and Tenant Admin can manage subscriptions
- **Scalability**: Plan enforcement must scale to 1000+ tenants
- **Availability**: Subscription service must be 99.9% available

## Testing Scenarios

### TC-064-001: Plan Selection
1. New tenant selects Basic plan
2. Verify plan assigned correctly
3. Verify limits enforced (5 users, 100 trips/month)

### TC-064-002: Limit Enforcement
1. Tenant at user limit (5/5)
2. Attempt to create 6th user
3. Verify operation blocked with appropriate message

### TC-064-003: Plan Upgrade
1. Tenant on Basic plan upgrades to Starter
2. Verify limits updated immediately
3. Verify prorated billing calculated

### TC-064-004: Usage Tracking
1. Tenant creates trips throughout month
2. Verify trip count increments correctly
3. Verify limit warnings at 80%, 90%, 100%

## Dependencies

- **US-008**: Tenant Configuration (tenant must exist before plan assignment)
- **US-065**: User Invitation & Activation (user limits enforced)

## Definition of Done

- [ ] Subscription plans defined and stored in database
- [ ] Plan selection UI implemented
- [ ] Plan limits enforced in all operations
- [ ] Usage tracking implemented
- [ ] Plan upgrade/downgrade workflow implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.2: Subscription Plan Selection

**Last Updated**: February 13, 2026  
**Status**: Pending Review

