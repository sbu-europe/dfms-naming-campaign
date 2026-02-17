---
source_document: PRD_DFMS_v1.0.md
source_sections: System Foundation, System Foundation & Security
extracted_date: 2026-02-13
---

## System Foundation

### Authentication & Security

**Version 1.0, Phase - 1**

**User Story:** _As a system user, I want to log in securely with my credentials so that I can access system features appropriate to my role while protecting against unauthorized access_.

**Acceptance Criteria:**

*   Login with unique credentials
*   Password field masked with show/hide toggle
*   Failed login attempts trigger lockout after 3 tries within 15 minutes
*   Account temporarily locked for 30 minutes after 3 failed attempts
*   Admin can access ‘Locked Users’ view listing all locked accounts
*   Admin can manually unlock user account after offline/phone verification
*   Upon unlock, failed-attempt counter resets to zero
*   User can immediately attempt login after admin unlock
*   All unlock actions logged in audit trail with admin ID and justification

**Functional Requirements:**

*   \[Critical\] System SHALL require unique username and password for all user logins
*   \[Critical\] System SHALL implement automatic account lockout after 3 consecutive failed login attempts
*   \[Critical\] Admin users SHALL have access to a "Locked Users" view listing all locked accounts with lock timestamp and reason.
*   \[High\] Admin users SHALL be able to unlock user accounts after offline identity verification, with mandatory remarks documenting verification method.
*   \[High\] Upon manual unlock, the system SHALL reset failed login attempt counters and allow immediate login.
*   \[Critical\] System SHALL log all login attempts (successful and failed) with timestamp, user ID, IP address, and device ID.

### Multi-Factor Authentication (2FA)

**Version 1.0, Phase - 1**

**User Story:** _As an Tenant Admin user, I want to use 2FA so that my account has an extra layer of security beyond just password_.

**Acceptance Criteria:**

*   Admin users are required to verify identity using one-time password (OTP)
*   2FA verification required after password validation

**Functional Requirements:**

*   \[Critical\] System SHALL require Multi-Factor Authentication (MFA) for Admin user roles.
*   \[Critical\] System SHALL support OTP (One-Time Password) delivery via email or SMS for MFA.
*   \[High\] MFA verification SHALL be required after successful password validation.
*   \[Low\] The system SHALL remember trusted devices for 30 days to reduce MFA frequency.

### Session Control

**Version 1.0, Phase - 1**

**User Story:** _As an System Admin user, I want to control user sessions so that inactive sessions do not pose security risks_.

**Acceptance Criteria:**

*   System tracks active sessions (IP, Device) per user
*   System auto-logout idle users after 30 minutes of inactivity
*   Any user action (click, scroll, keyboard input) resets inactivity timer

**Functional Requirements:**

*   \[Critical\] System SHALL track all active user sessions with IP address and device identifier.
*   \[Critical\] System SHALL support OTP (One-Time Password) delivery via email or SMS for MFA.

### Role-based Access Control (Role Hierarchy)

**Version 1.0, Phase - 1**

**User Story:** _As a system, I want to enforce role-based permissions so that users can only access features relevant to their department._

**System Roles:**

**Administrative Roles:**

| Role | Key Permissions |
| --- | --- |
| Super Admin | Manages global configurations, plans, billing, subscription plans, billing, and tenant-level controls across all organizations |
| Tenant Admin (Organization Admin) | Manage users, roles, master data, depots, Product Catalogue, Vehicle, Driver and Helper, vendors within their organization. |
| Department Admin | Department-level admin for Transport, Distribution, QA / QC, Fleet, Accounts, Commercial, Procurement, Depot, and Feed Mill departments |

**Operational Roles:**

Operational roles perform **day-to-day execution** and **cannot manage users or system configurations.**

| Role | Key Responsibilities |
| --- | --- |
| Product Transfer Requester (Depot / Feed Mill) | Create FG Transfer Request (Depot/Factory/Feed mill) |
| Product Transfer Requester (Commercial Officer) | Create RM Transfer Request (Commercial Officer) |
| Distribution Officer (DO) | Creates Transport Request (TR) and forwards to Distribution Manager for Approval |
| Approver – Distribution Manager (DM) | Approves TRs and validates capacity per POI |
| Approver – Procurement | Create Transport Request (TR) and approves Port Transfer requisition and makes distribution breakdown plan |
| Transport Planner (TP) | Create TOs with Vehicle Quantity, C&F Clearance Note, and type of vehicle required, assigns fleet (Own vs Vendor), manages trips |
| Transport Distribution Officer (TDO) | Manages Vehicle, Driver, and Helper Assignment process and Estimated time of arrival (ETA) |
| Gate Operation (Gate man) | Manages gate-in/gate-out entries |
| Scaling Operator (Weighbridge Operator) | Enters Scale-in/Scale-out weights and prints queue token |
| Command Center Officer | Assign loading/unloading lines based on product type and urgency |
| Loading Operator | Logs loading start/end times, Quantity Loaded, and Seal Number |
| Unloading Operator | Logs unloading start/end times |
| QC Inspector - Physical | Performs physical QC checks, sampling and approval |
| QC Lab Technician | Performs lab testing and updates reports |
| Driver Supervisor | Responsible for managing driver-vehicle handover checklist, Driver and helper attendance and availability status input |
| Driver | Uses mobile interface for trip updates |
| Helper | Optional – associated with the drivers |
| Vendors | Manages bidding, vehicle information submission, invoice submissions |
| Accounts/Finance Officer | Utilizes platform reports like trip costing. Vendor invoices & Billings |

**Acceptance Criteria:**

*   System defines **hierarchical role structure** with pre-defined roles
*   Roles categorized into:
    *   Administrative and
    *   Operational roles
*   Each role has specific permission scope and access rights defined at system level
*   Department Admin can assign the following operational roles under their department:
    *   Depot / Feed Mill / Commercial
        *   Depot Manager (Requester)
        *   Feed Mill Manager (Requester)
        *   Commercial Officer (Requester)
    *   Procurement
        *   Procurement Officer (Approver)
    *   Distribution
        *   Distribution Officer (DO)
        *   Distribution Manager (DM) (Approver)
    *   Transport
        *   Transport Planner (TP)
        *   Transport Distribution Officer (TDO)
    *   Quality Assurance / Quality Control (QA / QC)
        *   QC Inspector – Physical
        *   QC Lab Technician
    *   Operations
        *   Command Center Officer
        *   Unloading Personnel
        *   Loading Personnel
        *   Driver Supervisor
        *   Driver Helper
        *   Nominated Vendors
*   Admin can assign Functional Role Type
    *   Requester
    *   Approver
    *   Executor
*   Super Admin controls global configurations across all tenants
*   Operational toles have task-specific access (e.g., Gate Operator only access gate operations)
*   Role permissions organized by module (Fleet Management, Trip Management, QC, Gate, Etc.)
*   System enforces permissions at UI level (menu visibility, button access)
*   System enforces permissions at API level endpoint access validation)
*   System enforces permissions at database level (row-level security where applicable)
*   Operational roles HSALL have task-specific access only.
    *   Example: Gate Operator can only access gate operations
*   A department-level manager without Approver role cannot approve requisitions
*   Same user cannot approve their own requisition.

**Functional Requirements:**

*   \[Critical\] System SHALL implement hierarchical role structure with pre-defined roles:
    *   Super Admin,
    *   Tenant Admin (Organization Admin)
    *   Department Admin
    *   Operational Roles including
        *   Distribution Officer
        *   Distribution Manager
        *   Procurement Officer
        *   Commercial Officer
        *   Depot Manager
        *   Feed Mill Manager
        *   Transport Planner
        *   Transport Distribution Officer
        *   QC Inspector - Physical
        *   QC Lab Technician
        *   Finance/Accounts Manager
        *   Gate Man
        *   Scaling Officer
        *   Command Center Officer
        *   Loading Operator
        *   Unloading Operator
        *   Driver Supervisor
        *   Driver
        *   Helper
        *   Vendor Admin
*   \[Critical\] Each role SHALL have defined permission scope covering specific modules and operations.
*   \[High\] System SHALL allow department assignment during user creation
*   \[High\] System SHALL support role flags: Requester/Approver.

### Dynamic Role Builder

**Version 2.0**

**User Story:** _As a Super Admin, I want to create new roles with specific permissions so that I can accommodate unique organizational needs beyond pre-defined roles_.

**Acceptance Criteria:**

*   Admin can configure CRUD (Create/Read/Update/Delete) permission per role per module
*   Permission matrix organized by modules: User Management, Fleet Management, Trip Management, QC, Gate, Scaling, Loading/Unloading, Product Requisition, etc.
*   Admin selects permissions from available permission matrix during role creation
*   System validates role name uniqueness within tenant
*   Newly created role immediately available for user assignment
*   Admin can clone existing role permissions after creation
*   Admin can deactivate (not delete) custom roles only if no users are assigned to them
*   Admin can delete custom roles only if no users are currently assigned
*   System prevents modification of pre-defined system roles (only custom roles can be edited)

**Functional Requirements:**

*   \[Critical\] Super Admin SHALL be able to create custom roles with granular permissions at runtime using Dynamic Role Builder.
*   \[Critical\] Admins SHALL configure CRUD (Create, Read, Update, Delete) permission per role per module.

### Multi-Tenant Separation in RBAC

**Version 2.0**

**User Story:** _As a system, I want to enforce tenant-level isolation in role-based access control so that roles and permissions are scoped to individual organizations_.

**Acceptance Criteria:**

*   All roles (pre-defined and custom) scoped to tenant level.
*   Tenant Admin can only view and manage roles within their tenant
*   User assigned to a role can only access data within their tenant
*   Tenant ID automatically validated in all permission checks
*   Custom roles created by one tenant not visible to other tenants
*   Super Admin can view roles across all tenants for platform management
*   Role-based queries automatically filter data by tenant context
*   No cross-tenant role assignments possible (User from Tenant A cannot be assigned role from Tenant B)

**Functional Requirements:**

*   \[Critical\] System SHALL implement logical and physical tenant data isolation
*   \[Critical\] Each tenant SHALL have a unique tenant ID and dedicated database schema.
*   \[Critical\] All user data (users, fleet, trips, vendors) SHALL be scoped to tenant ID.
*   \[High\] The system SHALL prevent tenant ID tampering through request validation.


## System Foundation & Security

*   Multi-tenant organization signup and tenant isolation
*   Organization Onboarding and tenant isolation
*   User Authentication (login, session control, lockout policy)
*   Role-Based Access Control (RBAC) with predefined roles
*   User-role assignment by department (Transport, Distribution, Procurement, QC, Gate, Command Center)
*   Audit Logging for user actions
