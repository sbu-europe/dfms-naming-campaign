---
jira_key: DFS-041
jira_type: Story
jira_epic: DFS-044
jira_sprint: "Sprint 3"
story_id: ~
title: Automated Test Suite — Sprint 1 & 2 Features
epic: QA & Testing
status: Pending
story_points: 13
assignee: ~
---

# QA-01 — Automated Test Suite for Sprint 1 & Sprint 2 Features

## User Story

**As a** Development Team  
**I want to** have a comprehensive automated test suite covering all Sprint 1 and Sprint 2 features — unit tests, API integration tests, and UI end-to-end tests — with code coverage reporting and SonarQube static analysis  
**So that** the codebase is regression-safe as Sprint 3 features are built on top, and quality gates are enforced from CI

## Business Context

Sprint 3 builds heavily on Sprint 1 (infrastructure, auth, tenant onboarding) and Sprint 2 (master data, user management, geofencing). Before Sprint 3 features go into development, this story establishes the full automated test foundation to ensure:

- Existing features don't regress as new code is added
- Code coverage thresholds are enforced per module
- Static analysis and code smells are caught early via SonarQube
- UI flows are covered by Playwright end-to-end tests running in CI

---

## Scope — Features Under Test

### Sprint 1 Features
| Module | Key Flows to Cover |
|--------|-------------------|
| Infrastructure (INFRA-01–05) | Multi-tenant schema isolation, Celery job processing, Redis caching, session management |
| Platform Admin Portal (PAP-01–06) | Admin login, email OTP 2FA, tenant onboarding (6-step provisioning), tenant management (view/update/suspend) |
| Client Portal (CP-01–05) | Branded login page, 3-step OTP login, account activation via invitation link, tenant dashboard data |

### Sprint 2 Features
| Module | Key Flows to Cover |
|--------|-------------------|
| MDM-01 Product Master | Product CRUD, FG/RM category gating, item code uniqueness, bulk upload validation |
| MDM-02 Route / Supplier / Dealer | Route CRUD, source/dest POI FK validation, supplier + dealer CRUD |
| MDM-03 Vendor Master | Vendor CRUD, contractual vs non-contractual type, bulk upload |
| MDM-04 POI Management | POI CRUD, geofence radius, POI type filtering, capacity tracking |
| MDM-05 Vehicle Master | Vehicle CRUD, capacity derivation, status transitions, document expiry tracking |
| MDM-06 Driver Master | Driver CRUD, license expiry, status management |
| MDM-07 Helper Master | Helper CRUD, status management |
| TUM-01–05 User Management | Invitation, activation, OTP verification, deactivation/reactivation, password reset, audit logs |
| VTG-01 Geofencing Engine | GPS event ingestion, arrival/departure detection, dwell time calculation |

---

## Acceptance Criteria

### AC-1: Unit Test Suite (pytest + Django test framework)
- [ ] Unit tests written for all service layer functions and model methods introduced in Sprint 1 & 2
- [ ] Tests cover:
  - `TenantProvisioningService` — all 6 provisioning steps + rollback on failure
  - OTP generation, validation, expiry, and rate limiting
  - JWT token creation, tenant context embedding, and validation
  - Session cache operations (Redis-backed)
  - Multi-tenant schema isolation — queries scoped to correct tenant schema
  - Celery task functions (mock broker): email delivery (OTP, invite, reset), retry logic
  - All MDM model validators (product item code uniqueness, vehicle capacity derivation, license expiry flag logic)
  - POI capacity calculation (free capacity, utilisation %)
  - Geofence boundary evaluation (haversine / PostGIS point-in-polygon)
  - Dwell time calculation logic
  - User lifecycle state machine (invitation → active → deactivated → reactivated)
- [ ] Each test file co-located with the module it tests (`tests/` subfolder per app)
- [ ] All tests runnable with: `pytest` from project root
- [ ] Tests use fixtures and factories (`factory_boy`) — no hardcoded test data

### AC-2: API Integration Tests (pytest + Django test client / DRF APIClient)
- [ ] Integration tests cover all API endpoints introduced in Sprint 1 & 2:
  - **Auth**: Login, OTP challenge, OTP verify, token refresh, logout
  - **Tenant Onboarding**: POST /tenants, tenant schema creation, welcome email dispatch
  - **Tenant Management**: GET/PATCH/DELETE /tenants/{id}, suspension flow
  - **User Management**: Invitation, activation, deactivation, password reset, audit log retrieval
  - **MDM — Product**: CRUD endpoints, bulk upload, category filter, item code lookup
  - **MDM — POI**: CRUD endpoints, capacity snapshot endpoint, POI type filter
  - **MDM — Vehicle**: CRUD endpoints, status transition endpoints, document expiry filter
  - **MDM — Driver**: CRUD endpoints, availability filter (license expiry, status)
  - **MDM — Helper**: CRUD endpoints, availability filter
  - **MDM — Vendor**: CRUD endpoints, contractual/non-contractual filter
  - **MDM — Route / Supplier / Dealer**: CRUD endpoints
  - **Geofencing**: GPS event ingest endpoint, arrival/departure event assertion
- [ ] Each endpoint tested for: happy path, validation errors (400), auth failure (401/403), not found (404)
- [ ] Tests run against an isolated test database (pytest-django `@pytest.mark.django_db`)
- [ ] Tenant-scoped tests use a test tenant context (middleware simulation)

### AC-3: UI End-to-End Tests (Playwright + pytest-playwright)
- [ ] Playwright test suite set up under `tests/e2e/`
- [ ] Browser: Chromium (headless in CI, headed locally)
- [ ] Page Object Model (POM) pattern used — one class per page/component
- [ ] E2E tests cover the following critical user journeys:

  **Platform Admin Portal**
  - [ ] Admin login → OTP challenge → dashboard lands correctly
  - [ ] Tenant onboarding: fill form → submit → tenant appears in list
  - [ ] Tenant suspension: suspend action → status badge updates

  **Client Portal — Auth**
  - [ ] Branded login page loads on tenant subdomain
  - [ ] Full 3-step OTP login flow: identifier → OTP → password → dashboard
  - [ ] Account activation via invitation link: token → set password → login succeeds
  - [ ] Invalid OTP → error shown; expired OTP → re-send prompt shown

  **Master Data Management**
  - [ ] Product: create product with item code → list shows new record → edit → delete
  - [ ] POI: create POI → capacity snapshot visible → edit geofence radius
  - [ ] Vehicle: create vehicle → status = Available → trigger maintenance → status = Under Maintenance
  - [ ] Driver: create driver → license expiry warning shown when date < 30 days
  - [ ] User Management: invite user → user receives email → activate account → user appears in active list

- [ ] Each E2E test is idempotent — cleans up created data after each run
- [ ] Tests run against a locally running dev server (`pytest --base-url=http://localhost:8000`)

### AC-4: Code Coverage
- [ ] Coverage tool: `pytest-cov` with `coverage.py`
- [ ] Coverage report generated in HTML and XML formats on every CI run
- [ ] **Minimum coverage thresholds enforced** (CI fails if not met):
  - Overall: **≥ 80%**
  - `auth` app: **≥ 90%**
  - `tenants` app: **≥ 85%**
  - `master_data` app: **≥ 80%**
  - `user_management` app: **≥ 85%**
  - `geofencing` app: **≥ 80%**
- [ ] Coverage exclusions defined in `.coveragerc`: migrations, admin.py boilerplate, `__init__.py`
- [ ] Coverage badge added to repository README

### AC-5: SonarQube Setup & Static Analysis
- [ ] SonarQube project created for DFMS backend
- [ ] `sonar-project.properties` file added to repo root with:
  - Project key, name, version
  - Source directories (`src/`)
  - Test directories (`tests/`)
  - Coverage report path (XML from `pytest-cov`)
  - Exclusions (migrations, static files, `__init__.py`)
- [ ] SonarQube Quality Gate configured with:
  - Code coverage ≥ 80% (new code)
  - Duplicated lines < 3%
  - Maintainability rating: A
  - Reliability rating: A
  - Security rating: A
  - No critical or blocker issues on new code
- [ ] CI pipeline step added: SonarQube scanner runs after test suite and reports to SonarQube server
- [ ] All existing critical/blocker issues from Sprint 1 & 2 code resolved before merge

### AC-6: CI Integration
- [ ] All test suites (unit + integration + E2E) run automatically on every PR to `main`/`develop`
- [ ] CI pipeline order: `lint → unit + integration tests → coverage check → E2E tests → SonarQube scan`
- [ ] Failed coverage threshold or SonarQube Quality Gate blocks PR merge
- [ ] Test results published as CI artifacts (JUnit XML for unit/integration, Playwright HTML report for E2E)
- [ ] Playwright test videos and screenshots captured on failure and uploaded as CI artifacts

---

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| QA-01-1 | pytest project setup: `conftest.py`, fixtures, `factory_boy` factories for all Sprint 1+2 models | DFS-041-1 | Pending |
| QA-01-2 | Unit tests — Sprint 1: TenantProvisioningService, OTP, JWT, session, Celery tasks | DFS-041-2 | Pending |
| QA-01-3 | Unit tests — Sprint 2 MDM: Product, POI, Vehicle, Driver, Helper, Vendor, Route validators and service methods | DFS-041-3 | Pending |
| QA-01-4 | Unit tests — Sprint 2: User lifecycle state machine, geofence boundary logic, dwell time calculation | DFS-041-4 | Pending |
| QA-01-5 | API integration tests — Auth + Tenant Onboarding + User Management endpoints | DFS-041-5 | Pending |
| QA-01-6 | API integration tests — All MDM endpoints (Product, POI, Vehicle, Driver, Helper, Vendor, Route) | DFS-041-6 | Pending |
| QA-01-7 | API integration tests — Geofencing GPS event ingest + arrival/departure assertion | DFS-041-7 | Pending |
| QA-01-8 | Playwright setup: install, `playwright.config.py`, Page Object Model base classes, CI config | DFS-041-8 | Pending |
| QA-01-9 | Playwright E2E tests — Platform Admin Portal (login + OTP, tenant onboarding, tenant management) | DFS-041-9 | Pending |
| QA-01-10 | Playwright E2E tests — Client Portal auth (3-step OTP login, account activation, invalid OTP scenarios) | DFS-041-10 | Pending |
| QA-01-11 | Playwright E2E tests — MDM screens (Product CRUD, POI + capacity snapshot, Vehicle status, Driver expiry warning, User invite + activate) | DFS-041-11 | Pending |
| QA-01-12 | `pytest-cov` setup: `.coveragerc`, HTML + XML report generation, per-app thresholds enforcement in CI | DFS-041-12 | Pending |
| QA-01-13 | Coverage badge integration in repo README | DFS-041-13 | Pending |
| QA-01-14 | SonarQube project setup: `sonar-project.properties`, Quality Gate configuration | DFS-041-14 | Pending |
| QA-01-15 | CI pipeline update: add coverage check + SonarQube scan step; gate PR merge on Quality Gate pass | DFS-041-15 | Pending |
| QA-01-16 | Resolve all SonarQube critical/blocker issues found in Sprint 1 & 2 code | DFS-041-16 | Pending |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| `pytest` | Test runner for unit + integration tests |
| `pytest-django` | Django database and request fixtures |
| `pytest-cov` + `coverage.py` | Code coverage measurement and reporting |
| `factory_boy` | Model instance factories for test data |
| `faker` | Realistic fake data generation in factories |
| `pytest-playwright` + `playwright` | Browser automation for E2E UI tests |
| `SonarQube` (self-hosted or SonarCloud) | Static analysis, code smell detection, Quality Gate |
| `sonar-scanner` | CLI scanner — runs in CI and pushes results to SonarQube |

---

## File Structure

```
project-root/
├── sonar-project.properties
├── .coveragerc
├── pytest.ini
├── tests/
│   ├── conftest.py                  # Shared fixtures, tenant context setup
│   ├── factories/                   # factory_boy factories per model
│   │   ├── tenant_factories.py
│   │   ├── user_factories.py
│   │   ├── mdm_factories.py
│   │   └── ...
│   ├── unit/
│   │   ├── test_tenant_provisioning.py
│   │   ├── test_otp.py
│   │   ├── test_jwt.py
│   │   ├── test_mdm_validators.py
│   │   ├── test_geofence_engine.py
│   │   └── ...
│   ├── integration/
│   │   ├── test_auth_api.py
│   │   ├── test_tenant_api.py
│   │   ├── test_mdm_api.py
│   │   ├── test_user_management_api.py
│   │   ├── test_geofencing_api.py
│   │   └── ...
│   └── e2e/
│       ├── pages/                   # Page Object Model classes
│       │   ├── login_page.py
│       │   ├── admin_portal_page.py
│       │   ├── mdm_pages.py
│       │   └── ...
│       ├── test_admin_portal.py
│       ├── test_client_auth.py
│       └── test_mdm_ui.py
```

---

## Dependencies

- **Requires**: Sprint 1 & 2 features to be code-complete (or near-complete) before E2E tests can be authored
- **Enables**: Regression safety for all Sprint 3+ development; CI quality gate enforced from this sprint onward

## Definition of Done

- [ ] pytest unit test suite passing with 0 failures — Sprint 1 & 2 scope covered
- [ ] API integration tests passing for all listed endpoints — happy path + error cases
- [ ] Playwright E2E suite passing for all listed user journeys (headless in CI)
- [ ] Code coverage ≥ 80% overall; per-app thresholds met; HTML report generated
- [ ] SonarQube project configured; Quality Gate passing; no critical/blocker issues
- [ ] CI pipeline updated — all test stages run on PR; merge blocked on gate failure
- [ ] Playwright failure artifacts (screenshots + videos) uploaded in CI
- [ ] Coverage badge visible in README
