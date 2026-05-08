---
last_updated: 2026-05-07
---

# Vendor Mobile — Navigation & Information Architecture (IA)

## Goals

- Define a **single, consistent** navigation model across all Vendor Mobile feature specs.
- Make **access gating** explicit (verification + tenant membership approval).
- Support **multi-tenant** vendors (join multiple tenants; view data per-tenant).

---

## Access gating (what becomes visible when)

### 1) Authentication (login)

- Vendor authenticates via:
  - Email/Password, or
  - Phone + OTP

### 2) Verification gate (vendor status)

- Until verification completes, vendor is **inactive** and cannot view:
  - Tenant bids
  - Tenant assigned TOs / trips

### 3) Tenant membership gate (per-tenant approval)

- After verification, vendor can request to join **one or more tenants**.
- Vendor can view bids/TOs/trips **only for tenants where membership is approved**.

---

## Global navigation model (Phase 1)

### App shell

- **Pre-access:** stack navigation only (no bottom tabs).
- **Post-access (verified + at least one tenant approved):** bottom tab navigation.

### Bottom tabs (post-access)

- **Bids**
- **Assigned TOs**
- **Trips**
- **Profile**

---

## Multi-tenant behavior (how vendor switches tenants)

Vendors may be approved for multiple tenants. The UI must clearly answer: “Which tenant’s data am I looking at?”

### Recommended pattern: Tenant switcher

- A **Tenant selector** is visible on data-bearing tabs:
  - Bids
  - Assigned TOs
  - Trips
- Selector options:
  - **All Approved Tenants** (optional)
  - Each **Approved Tenant** (Tenant A, Tenant B, …)

### Rules

- If current selection is a specific tenant, lists and details are **scoped to that tenant**.
- If “All Approved Tenants” is enabled:
  - Lists merge results across tenants.
  - Every card shows a **Tenant badge/name**.
  - Filters include **Tenant = [A, B, C]**.

### Membership states in Tenant Directory

Tenant cards should display one of:

- **Join** (not requested)
- **Requested** (pending approval)
- **Approved**
- **Rejected** (with guidance to re-apply or contact admin, if allowed)

---

## Information Architecture (screen list)

### Pre-access stack

- **Login**
- **Onboarding / Registration** (self or invite completion)
- **Verification Pending** (blocked state, shows what is missing)
- **Tenant Directory**
- **Join Request Status** (pending / approved / rejected)

### Post-access (bottom tabs)

#### Bids tab

- **Bid Opportunities List**
  - Filters: All / Submitted / Urgent
  - Search: TO number, POIs, product name
- **Bid Details (TO details)**
- **Bid Submission Form**
- **Bid Submission Confirmation**

#### Assigned TOs tab

- **Assigned TOs List**
  - Filters: All / Pending Assignment / In Progress / Completed
- **TO Details**
- **Post-award Submission** (Driver/Vehicle/Helpers per-TO)

#### Trips tab

- **Active Trips**
  - Active Trip Tracking (map + status timeline + call driver)
- **Completed Trip History**
  - Filters: date range, payment status
- **Completed Trip Details**
  - Download POD (PDF)

#### Profile tab

- **Vendor Profile**
  - Vendor information + contact details
  - Documents/status (as applicable)
  - Note: no driver/vehicle master lists in Phase 1

---

## Navigation flow (end-to-end)

```mermaid
flowchart TD
  A[Launch] --> B{Authenticated?}
  B -- No --> L[Login: Email/Password or Phone+OTP]
  L --> B

  B -- Yes --> V{Vendor verified?}
  V -- No --> VP[Verification Pending<br/>(no tenant data)]
  VP --> V

  V -- Yes --> T{Any tenant membership approved?}
  T -- No --> TDY[Tenant Directory<br/>Join one or more tenants]
  TDY --> TRQ[Join Request Status<br/>Requested / Approved / Rejected]
  TRQ --> T

  T -- Yes --> H[Main App Shell<br/>Bottom Tabs + Tenant Switcher]

  H --> BIDS[Bids Tab]
  BIDS --> BL[Bid Opportunities List]
  BL --> BD[Bid Details]
  BD --> BS[Submit Bid Form]
  BS --> BL

  H --> ATO[Assigned TOs Tab]
  ATO --> AL[Assigned TOs List]
  AL --> AD[TO Details]
  AD --> PAA[Submit Driver & Vehicle Details]
  PAA --> AL
  AD --> AT[View Trip (if in progress)]

  H --> TR[Trips Tab]
  TR --> AT
  TR --> CH[Completed Trip History]
  CH --> CTD[Completed Trip Details + POD]

  H --> PR[Profile Tab]
```

---

