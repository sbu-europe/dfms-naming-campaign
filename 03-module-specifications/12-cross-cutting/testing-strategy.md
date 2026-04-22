---
module: 12-cross-cutting
specification: Automated Testing Strategy
version: 1.0
phase: Phase 1
sprint: Sprint 3 (setup + Sprint 1 & 2 coverage), ongoing
last_updated: 2026-04-22
related_stories: DFS-041 (QA-01)
jira_epic: DFS-044
---

# Automated Testing Strategy

## Overview

This specification defines the automated testing architecture for DFMS — covering unit tests, API integration tests, UI end-to-end tests (Playwright), code coverage enforcement, and SonarQube static analysis. The suite is established in Sprint 3 to cover Sprint 1 & 2 features, then extended each sprint to cover new features.

**Primary goal**: Regression safety as each sprint builds on prior work, with quality gates enforced in CI that block PR merges on coverage or analysis failures.

---

## 0. Tech Stack

| Tool | Purpose |
|------|---------|
| `pytest` | Test runner — unit + integration tests |
| `pytest-django` | Django DB fixtures, test client, schema context |
| `factory_boy` + `faker` | Model instance factories; realistic test data |
| `pytest-cov` + `coverage.py` | Coverage measurement; HTML + XML report generation |
| `pytest-playwright` + `playwright` | Browser automation for E2E UI tests |
| `SonarQube` (self-hosted or SonarCloud) | Static analysis, code smell detection, Quality Gate |
| `sonar-scanner` | CLI scanner — runs in CI, pushes results to SonarQube |

---

## 1. Repository Structure

```
project-root/
├── sonar-project.properties        # SonarQube project config
├── .coveragerc                     # Coverage exclusions + thresholds
├── pytest.ini                      # pytest markers, default options
├── tests/
│   ├── conftest.py                 # Shared fixtures: tenant context, test DB, auth tokens
│   ├── factories/                  # factory_boy factories — one file per app
│   │   ├── tenant_factories.py
│   │   ├── user_factories.py
│   │   ├── mdm_factories.py        # Product, POI, Vehicle, Driver, Helper, Vendor, Route
│   │   ├── requisition_factories.py
│   │   └── transport_factories.py
│   ├── unit/                       # Unit tests — service layer + model methods
│   │   ├── test_tenant_provisioning.py
│   │   ├── test_otp.py
│   │   ├── test_jwt.py
│   │   ├── test_session.py
│   │   ├── test_mdm_validators.py
│   │   ├── test_geofence_engine.py
│   │   ├── test_user_lifecycle.py
│   │   └── test_dwell_time.py
│   ├── integration/                # API integration tests — DRF APIClient
│   │   ├── test_auth_api.py
│   │   ├── test_tenant_api.py
│   │   ├── test_mdm_api.py
│   │   ├── test_user_management_api.py
│   │   └── test_geofencing_api.py
│   └── e2e/                        # Playwright E2E tests — Page Object Model
│       ├── pages/
│       │   ├── login_page.py
│       │   ├── admin_portal_page.py
│       │   └── mdm_pages.py
│       ├── test_admin_portal.py
│       ├── test_client_auth.py
│       └── test_mdm_ui.py
```

---

## 2. Unit Tests

**Runner**: `pytest` from project root  
**Framework**: pytest-django + factory_boy  
**Convention**: Test files co-located with each app under `tests/unit/`; no hardcoded test data — factories and fixtures only.

### 2.1 Sprint 1 scope

| Module | What to test |
|--------|-------------|
| `TenantProvisioningService` | All 6 provisioning steps; rollback on step failure (each step fails atomically) |
| OTP | Generation, validation, expiry enforcement, rate limiting (max attempts) |
| JWT | Token creation, tenant context embedding, signature validation, expiry |
| Session (Redis) | Cache write/read, expiry, schema-scoped isolation |
| Multi-tenant schema | Query scoped to correct tenant schema; no cross-tenant data leak |
| Celery tasks (mocked broker) | OTP email, invite email, password reset email — task queued + retry logic |

### 2.2 Sprint 2 scope

| Module | What to test |
|--------|-------------|
| MDM model validators | Product item code uniqueness; vehicle capacity derivation; license expiry flag logic |
| POI capacity | Free capacity calculation; utilisation % |
| Geofence boundary | Haversine / PostGIS point-in-polygon evaluation |
| Dwell time | Dwell time calculation from arrival/departure timestamps |
| User lifecycle state machine | `invited → active → deactivated → reactivated` transitions; invalid transitions blocked |

### 2.3 Sprint 3+ scope (extended each sprint)

Add unit tests for:
- PR status state machine (Draft → Submitted → In Progress → Fulfilled)
- TR quantity overflow validation (per line, per PR)
- TO quantity overflow validation (per TR)
- Planning input submission gate (TO blocked without `planning_submitted_at`)
- Driver/vehicle/helper conflict checks (TDO assignment)
- Vendor rate auto-application service

---

## 3. API Integration Tests

**Framework**: pytest-django `@pytest.mark.django_db` + DRF `APIClient`  
**Database**: Isolated test DB; each test function uses `transaction=True` rollback or explicit teardown  
**Tenant context**: `conftest.py` provides `tenant_client` fixture — wraps requests with correct `Host` header and schema context

### 3.1 Coverage per endpoint (Sprint 1 & 2)

Each endpoint tested for:
- **Happy path** — correct status code, correct response body
- **Validation errors** — 400 with meaningful `detail`
- **Auth failure** — 401 (unauthenticated), 403 (wrong role)
- **Not found** — 404

| Endpoint group | Key scenarios |
|---------------|---------------|
| Auth — Login, OTP, refresh, logout | Full flow; invalid OTP → error; expired OTP → re-send prompt; token refresh |
| Tenant Onboarding — `POST /tenants` | Success → schema created; duplicate subdomain → 400; welcome email dispatched |
| Tenant Management — GET/PATCH/DELETE | View, update, suspend flow |
| User Management — Invite, activate, deactivate | All status transitions; role validation |
| MDM Product — CRUD + bulk upload | FG/RM category gate; item code uniqueness; bulk upload validation |
| MDM POI — CRUD + capacity snapshot | POI type filter; capacity endpoint |
| MDM Vehicle — CRUD + status transitions | Status validation; document expiry filter |
| MDM Driver — CRUD + availability filter | License expiry exclusion; status filter |
| MDM Helper — CRUD + availability | Status filter |
| MDM Vendor — CRUD + type filter | Contractual vs non-contractual |
| MDM Route / Supplier / Dealer — CRUD | Standard CRUD |
| Geofencing — GPS ingest + arrival/departure | Event ingested → arrival detected; departure detected |

### 3.2 Sprint 3 additions

| Endpoint group | Key scenarios |
|---------------|---------------|
| PR creation (FG + Port) | Type gate (role vs PR type); LC fields mandatory for Port |
| TR creation (Distribution) | Quantity overflow blocked; destination from PR (read-only) |
| TR approval (DM) | Approve / approve-with-modify / reject |
| TR creation (Procurement) | Port-only source gate; immediate `available_for_planning` |
| Planning inputs submission | FG without type → 400; Port without C&F → 400; duplicate → 409 |
| TO creation | Planning inputs gate; overflow blocked; fleet type routing |
| TDO assignment | Vehicle/driver/helper conflict checks; vendor contractual-only check |

---

## 4. UI End-to-End Tests (Playwright)

**Framework**: pytest-playwright  
**Browser**: Chromium — headless in CI; headed locally  
**Pattern**: Page Object Model (POM) — one class per page/component  
**Target**: `http://localhost:8000` (dev) or `https://dev.dfms.com` (CI against AWS dev env)

### 4.1 Test idempotency

Each test is self-contained:
- Creates its own data (via API calls or factory fixtures in `conftest.py`)
- Cleans up created data in `teardown` / `finally` block
- No test depends on the side effects of another test

### 4.2 E2E test coverage (Sprint 1 & 2)

**Platform Admin Portal**:
- Admin login → OTP challenge → dashboard
- Tenant onboarding: fill 6-step form → submit → tenant appears in list
- Tenant suspension: suspend action → status badge updates

**Client Portal — Auth**:
- Branded login page loads on tenant subdomain
- Full 3-step OTP login: identifier → OTP → password → dashboard
- Account activation via invitation link: token → set password → login succeeds
- Invalid OTP → error shown; expired OTP → re-send prompt shown

**Master Data Management**:
- Product: create → list shows record → edit → delete
- POI: create → capacity snapshot visible → edit geofence radius
- Vehicle: create (status: Available) → trigger maintenance → status: Under Maintenance
- Driver: create → license expiry warning shown when date < 30 days
- User Management: invite → user activates → appears in active list

### 4.3 E2E test coverage (Sprint 3 additions)

- FG PR creation by Depot Officer → PR appears in Distribution queue
- Distribution Officer creates TR → overflow blocked on excess quantity
- Distribution Manager approves TR → TR appears in Transport Planner queue
- Port Consignment PR by Commercial Officer → appears in Procurement queue
- Procurement Officer creates TR (destination breakdown) → immediately in Transport queue
- Transport Planner submits planning inputs → Create TO button enabled
- Transport Planner creates TO (own fleet) → appears in TDO queue
- TDO assigns vehicle + driver + ETA → TO status: Ready for Dispatch

---

## 5. Code Coverage

**Tool**: `pytest-cov` with `coverage.py`  
**Config file**: `.coveragerc`  
**Reports generated**: HTML (human-readable), XML (for SonarQube ingest)

### 5.1 Coverage thresholds (CI-enforced)

| Scope | Minimum |
|-------|---------|
| Overall | **≥ 80%** |
| `apps/core` (auth, RBAC) | **≥ 90%** |
| `apps/tenants` | **≥ 85%** |
| `apps/master_data` | **≥ 80%** |
| `apps/users` | **≥ 85%** |
| `apps/tracking` (geofencing) | **≥ 80%** |
| `apps/requisitions` | **≥ 80%** |
| `apps/transport` | **≥ 80%** |

CI fails if any threshold is not met — PR merge blocked.

### 5.2 Coverage exclusions (`.coveragerc`)

```ini
[coverage:run]
omit =
    */migrations/*
    */admin.py
    */__init__.py
    */apps.py
    manage.py
    config/settings/*.py

[coverage:report]
fail_under = 80
```

### 5.3 Coverage badge

`pytest-cov` XML output piped to `coverage-badge` → badge embedded in repository `README.md`.

---

## 6. SonarQube Static Analysis

**Config file**: `sonar-project.properties` at repo root

```properties
sonar.projectKey=dfms-backend
sonar.projectName=DFMS Backend
sonar.sources=apps/
sonar.tests=tests/
sonar.python.coverage.reportPaths=coverage.xml
sonar.exclusions=**/migrations/**,**/__init__.py,**/admin.py,**/apps.py
sonar.test.exclusions=tests/**
```

### 6.1 Quality Gate (configured in SonarQube server)

| Metric | Gate condition |
|--------|----------------|
| Coverage (new code) | ≥ 80% |
| Duplicated lines | < 3% |
| Maintainability rating | A |
| Reliability rating | A |
| Security rating | A |
| Critical / Blocker issues (new code) | 0 |

### 6.2 Issue resolution

All critical/blocker issues found in Sprint 1 & 2 code must be resolved before the QA-01 story is done. Issues tracked in SonarQube and closed with fix PRs.

---

## 7. CI Pipeline Integration

### 7.1 Pipeline order (GitHub Actions — every PR to `main`/`develop`)

```
lint (ruff / flake8)
    ↓
unit + integration tests (pytest)
    ↓
coverage check (pytest-cov — fail_under thresholds)
    ↓
E2E tests (pytest-playwright, headless Chromium)
    ↓
SonarQube scan (sonar-scanner)
    ↓
[merge allowed only if all gates pass]
```

### 7.2 CI artefacts published

| Artefact | Format | Trigger |
|----------|--------|---------|
| Unit + integration test results | JUnit XML | Every run |
| Coverage report | HTML + XML | Every run |
| Playwright HTML report | HTML | Every run |
| Playwright screenshots + videos | PNG + WebM | On failure only |

### 7.3 GitHub Actions workflow snippet

```yaml
# .github/workflows/ci.yml (relevant steps)
- name: Run tests with coverage
  run: pytest --cov=apps --cov-report=xml --cov-report=html --junitxml=test-results.xml

- name: Run Playwright E2E
  run: pytest tests/e2e/ --base-url=${{ env.DEV_URL }} --browser=chromium

- name: SonarQube scan
  run: sonar-scanner
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## 8. Running Tests Locally

```bash
# All unit + integration tests
pytest

# With coverage report
pytest --cov=apps --cov-report=html
open htmlcov/index.html

# Specific app
pytest tests/unit/test_mdm_validators.py -v

# E2E tests (requires running dev server)
pytest tests/e2e/ --base-url=http://localhost:8000 --headed

# E2E — single test
pytest tests/e2e/test_client_auth.py::test_otp_login_full_flow --headed
```

---

## 9. Sprint Coverage Mapping

| Sprint | Unit tests added | API integration tests added | E2E tests added |
|--------|-----------------|----------------------------|-----------------|
| Sprint 1 | Tenant provisioning, OTP, JWT, session, Celery | Auth, tenant onboarding/management | Admin portal login, tenant onboarding |
| Sprint 2 | MDM validators, geofence, dwell time, user lifecycle | All MDM endpoints, geofencing ingest | MDM CRUD screens, user invite + activate |
| Sprint 3 | PR/TR state machines, overflow rules, TDO conflicts | PR, TR, TO endpoints (distribution, procurement, transport) | Full end-to-end PR → TR → TO → driver view |
| Sprint 4+ | Trip state machine, POI operations, QC | Trip lifecycle, gate/QC/scaling APIs | Trip dispatch through completion |

---

## 10. Dependencies & Cross-References

| Dependency | Notes |
|------------|-------|
| `12-cross-cutting/aws-dev-environment.md` | Playwright E2E tests run against the AWS dev environment in CI |
| All module specs (`01-foundation` through `05-transport`) | Tests cover all Sprint 1 & 2 features; Sprint 3 tests added alongside feature work |
| `01-foundation/authentication-security.md` | OTP + JWT + session unit test scope |
| `.github/workflows/ci.yml` | Existing CI pipeline extended with coverage + SonarQube steps |
