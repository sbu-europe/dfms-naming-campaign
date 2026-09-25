---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: TUM-07
title: Dynamic Role Builder — Custom Departments and Roles
epic: Tenant User Management — Dynamic Role Builder
status: Pending
story_points: 13
assignee: ~
prd_refs:
  - "05-modules/01-foundation/rbac.md § 5 Dynamic Role Builder"
  - "05-modules/01-foundation/rbac.md § 3.1.1 Departments and role mapping"
  - "06-contracts/01-apis/rest/roles.yaml — Role CRUD (Phase 2)"
phase: Phase 2
related_stories:
  - US-004 (Role Hierarchy & RBAC) — predefined system roles and the permission catalog
  - TUM-06 (Multi-role assignment) — newly created custom roles must be assignable on invite, edit, and CSV
---

# TUM-07 — Dynamic Role Builder (Custom Departments and Roles)

## User Story

**As a** Tenant Super Admin or Tenant Admin  
**I want to** create new departments and roles with specific permissions  
**So that** I can accommodate unique organizational needs beyond pre-defined roles.

---

## Business Context

DFMS ships a fixed catalog of departments and system roles. Some tenants need a department or a role that catalog does not have — for example a yard role that can read trips and update gate, but cannot touch fleet master data.

This story adds a **Dynamic Role Builder** inside the tenant. **Tenant Super Admin** and **Tenant Admin** create departments, then create **custom roles** by ticking **Create, Read, Update, and Delete** on each module in the permission matrix. A saved custom role shows up immediately on user assignment. System roles stay read-only. Custom roles can be cloned, deactivated, or deleted only when nobody is assigned to them.

Platform Super Admin is not an actor here. Custom roles and departments belong to one tenant.

---

## Functional Requirements

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-TUM07-001 | Critical | Tenant Super Admin and Tenant Admin shall create custom roles with granular permissions at runtime using the Dynamic Role Builder. |
| FR-TUM07-002 | Critical | Those admins shall configure Create, Read, Update, and Delete permission per role per module. |

---

## Acceptance Criteria

### AC-1 — Who may use the builder

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they open Role Management  
  **Then** they can create departments and custom roles, and can clone, edit, deactivate, and delete custom roles subject to the rules below.

- [ ] **Given** a user who is neither Tenant Super Admin nor Tenant Admin  
  **When** they attempt to create a department or a custom role, or to clone, edit, deactivate, or delete a role  
  **Then** the action is denied.

### AC-2 — Create a department

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they create a department with a name  
  **Then** the department is saved for that tenant and appears in the department list used when creating a role and when assigning a user.

- [ ] **Given** a department name that already exists in the tenant (including predefined departments), ignoring case and surrounding spaces  
  **When** an admin submits that name  
  **Then** the system rejects it and does not create a second department.

### AC-3 — Permission matrix

- [ ] **Given** a Tenant Super Admin or Tenant Admin is creating or editing a custom role  
  **When** the permission matrix is shown  
  **Then** rows are modules, including User Management, Fleet Management, Trip Management, QC, Gate, Scaling, Loading/Unloading, and Product Requisition, plus the other modules already in the permission catalog  
  **And** each row has Create, Read, Update, and Delete.

- [ ] **Given** the permission matrix  
  **When** the admin sets permissions  
  **Then** they select only from that matrix. They cannot type a new module or a new permission code.

- [ ] **Given** a custom role with no Create, Read, Update, or Delete cell selected  
  **When** the admin saves it  
  **Then** the system rejects the save.

### AC-4 — Create a custom role

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they create a custom role  
  **Then** they enter a role name, choose a department (predefined or one created in this tenant), and select permissions from the matrix  
  **And** the system saves the role as a custom role for that tenant only.

- [ ] **Given** a role name that already exists in the tenant (system or custom), ignoring case and surrounding spaces  
  **When** an admin submits that name for a new custom role  
  **Then** the system rejects it and does not save the role.

- [ ] **Given** a custom role that was just saved  
  **When** an admin opens invite, user edit, or CSV role assignment for that department  
  **Then** the new role is listed and can be assigned without a restart or a later publish step.

### AC-5 — Clone permissions

- [ ] **Given** an existing system or custom role  
  **When** a Tenant Super Admin or Tenant Admin clones it  
  **Then** a new custom role is created with a copy of that role’s permissions (and the source department)  
  **And** the admin can set a new unique name before save  
  **And** the source role is unchanged.

- [ ] **Given** a cloned role that has been saved  
  **When** an admin edits that clone  
  **Then** they can change its custom-role permissions without changing the source role.

### AC-6 — Deactivate a custom role

- [ ] **Given** a custom role with no users currently assigned  
  **When** a Tenant Super Admin or Tenant Admin deactivates it  
  **Then** the role remains in the tenant with status Inactive  
  **And** it is not offered for new user assignment  
  **And** it is not deleted.

- [ ] **Given** a custom role that still has at least one user assigned  
  **When** an admin tries to deactivate it  
  **Then** the system rejects the deactivation and leaves the role Active.

- [ ] **Given** a predefined system role  
  **When** an admin tries to deactivate it  
  **Then** the action is denied.

### AC-7 — Delete a custom role

- [ ] **Given** a custom role with no users currently assigned  
  **When** a Tenant Super Admin or Tenant Admin deletes it  
  **Then** the role is removed and no longer appears for assignment.

- [ ] **Given** a custom role that still has at least one user assigned  
  **When** an admin tries to delete it  
  **Then** the system rejects the delete and the role remains.

- [ ] **Given** a predefined system role  
  **When** an admin tries to delete it  
  **Then** the action is denied.

### AC-8 — System roles stay locked

- [ ] **Given** a predefined system role  
  **When** a Tenant Super Admin or Tenant Admin opens it  
  **Then** its name, department, and permissions are read-only  
  **And** only custom roles can be edited.

- [ ] **Given** a custom role  
  **When** an admin edits its name, department, or matrix  
  **Then** the change is saved for that role only  
  **And** users already assigned to it receive the updated permissions on their next permission check.

---

## Functional Flows

### Flow A — New department and custom role

```
Tenant Super Admin or Tenant Admin → Role Management
  → Create department "Cold Chain"
  → Create custom role "Cold Chain Clerk" under Cold Chain
  → Matrix: Product Requisition Read; Gate Read + Update; all other cells off
  → Save
  → Invite User → department Cold Chain → role list includes Cold Chain Clerk
```

### Flow B — Clone, then adjust

```
Admin opens system role "Gateman" → Clone
  → New custom role, permissions copied, system role unchanged
  → Admin names it "Gate Supervisor" and adds Scaling Read
  → Save → Gate Supervisor is assignable; Gateman permissions are unchanged
```

### Flow C — Deactivate or delete blocked while assigned

```
Custom role "Cold Chain Clerk" is assigned to one user
  → Deactivate → rejected; role stays Active
  → Delete → rejected; role remains
Admin removes the assignment
  → Deactivate → role Inactive and hidden from new assignment
  → Or Delete → role removed
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-TUM07-001 | Only Tenant Super Admin and Tenant Admin may create departments and manage custom roles. |
| BR-TUM07-002 | Department name is unique within the tenant (case-insensitive, trimmed). |
| BR-TUM07-003 | Role name is unique within the tenant across system and custom roles (case-insensitive, trimmed). |
| BR-TUM07-004 | Permissions on a custom role are Create, Read, Update, and Delete per module, chosen only from the permission matrix. At least one cell is required. |
| BR-TUM07-005 | A saved custom role is available for user assignment immediately, filtered by its department. Inactive roles are not offered. |
| BR-TUM07-006 | Clone copies permissions onto a new custom role. The source role is not modified. Cloning a system role does not make that system role editable. |
| BR-TUM07-007 | Deactivate and delete apply to custom roles only, and only when no user is currently assigned. Deactivate keeps the record as Inactive. Delete removes it. |
| BR-TUM07-008 | Predefined system roles cannot be edited, deactivated, or deleted. |
| BR-TUM07-009 | Custom departments and custom roles are tenant-scoped. One tenant cannot see or assign another tenant’s custom roles. |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| TUM-07-1 | Specs | Reconcile this story with `rbac.md` §5 and §3.1.1 (department create; deactivate only when unassigned) before Django work | High | Not done |
| TUM-07-2 | Departments | Tenant-scoped department create; unique name; show in role-create and user-assignment dropdowns | High | Not done |
| TUM-07-3 | Role builder | Create custom role: name, department, CRUD matrix; tenant uniqueness; reject empty matrix | High | Not done |
| TUM-07-4 | Assignment | Saved custom role appears on invite, user edit, and CSV for its department | High | Not done |
| TUM-07-5 | Clone | Clone system or custom role into a new custom role; source unchanged | High | Not done |
| TUM-07-6 | Lock system roles | Edit, deactivate, and delete denied for predefined system roles | High | Not done |
| TUM-07-7 | Deactivate and delete | Custom roles only; both blocked while any user is assigned; Inactive hidden from new assignment | High | Not done |
| TUM-07-8 | Tests | Uniqueness, matrix, immediate assignment, clone, assigned-user blocks, system-role lock, other-role denial | High | Not done |

---

## Dependencies

| Dependency | Notes |
|---|---|
| US-004 / permission catalog | Matrix rows and CRUD cells come from existing modules. This story does not add modules. |
| Predefined departments and system roles | Remain. This story adds tenant departments and custom roles beside them. |
| TUM-01 invite / user edit / CSV | New role must show up on those assignment screens. |
| TUM-06 | If multi-role assignment is on, a custom operational role is selectable there under the same department filter. |
| `rbac.md` §5 | Creation, clone, and system-role lock already sketched. Deactivate-while-assigned in that spec differs from AC-6; this story wins until the module doc is updated. |

---

## Test Plan

- [ ] Tenant Admin and Tenant Super Admin can create a department and a custom role; a Distribution Officer cannot
- [ ] Duplicate department name and duplicate role name in the tenant are rejected
- [ ] Matrix is modules × Create / Read / Update / Delete; save with every cell off is rejected
- [ ] Saved custom role appears on invite for its department without a separate publish
- [ ] Clone of a system role copies permissions, leaves the system role unchanged, and the clone is editable
- [ ] Edit, deactivate, and delete of a system role are denied
- [ ] Deactivate and delete of a custom role are denied while a user is assigned, and succeed after the assignment is removed
- [ ] Inactive role is not offered on invite
- [ ] A custom role from tenant A is not listed in tenant B

---

## Definition of Done

- [ ] Acceptance criteria AC-1–AC-8 met
- [ ] Sub-tasks TUM-07-1 … TUM-07-8 completed
- [ ] FR-TUM07-001 and FR-TUM07-002 met
- [ ] System roles unchanged by clone, edit, deactivate, and delete
- [ ] Tests cover uniqueness, empty matrix, immediate assignment, clone, assigned-user blocks, and system-role lock
- [ ] Story status updated for Phase 2 tracking

---

## Out of scope

- Platform Super Admin creating roles for a tenant
- Editing, deactivating, or deleting predefined system roles
- Adding modules or permission codes that are not already in the catalog
- Non-CRUD catalog actions (Approve, Assign, Execute, Export) as separate matrix columns
- Deleting or deactivating departments
- Permission union across multiple roles (see TUM-06: the user works as one selected role)

---

## Notes

- **Story points:** 13 is a planning estimate, same band as TUM-06. Adjust when the sprint is sized.
- **`rbac.md` §5.2** says a role may be deactivated while users are still assigned, and those users keep the permissions until they are reassigned. **AC-6** in this story blocks deactivation until nobody is assigned. Do not implement the module sentence until TUM-07-1 updates it.
- **`rbac.md` §3.1.1** says departments are predefined only. **AC-2** adds tenant-created departments. Predefined departments stay.
- **`rbac.md` §5.1** also collects Access Scope (Global / Local) and Functional Type on create. This story does not change those fields. Keep them as the module spec already describes so assignment and local POI rules still apply.
- In the source request, “Super Admin” means **Tenant Super Admin**, together with **Tenant Admin**. It does not mean platform Super Admin.
