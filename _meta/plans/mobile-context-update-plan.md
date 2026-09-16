# Mobile Context Update Plan

> Bring DFMS-product-context mobile documentation in line with the real Vendor Flutter app (`nourish-vendor-app`), mirroring how backend architecture is documented for `nourish-backend`.

**Date**: 2026-09-16  
**Status**: Implemented (2026-09-16)  
**Scope**: Vendor Mobile first; Driver/QC clarification only  
**Code sources**: `nourish-vendor-app`, `nourish-backend` (vendor APIs)  
**Context target**: `DFMS-product-context`

---

## 1. Problem

Most architectural folders in this repo are mature for the backend. Mobile-related context is incomplete and partly outdated:


| Layer                 | Backend                             | Mobile today                                                                    |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| C4 / system design    | `04-architecture/01-system-design/` | Shared; mobile listed as a container only                                       |
| Stack architecture    | `04-architecture/04-backend/`       | **Missing** — no `09-mobile` (next free index after `08-reference`)             |
| Development guides    | `08-development-guides/01-backend/` | Marked **Future** — use next free slot `02-mobile` (no frontend guides for now) |
| Domain / module specs | Rich `05-modules/*`                 | Vendor screens in `15-mobile-apps/vendor-mobile/` only                          |
| API contracts         | Real REST YAML                      | `06-contracts/.../mobile.yaml` is a sketch                                      |
| Testing docs          | `09-testing/backend/`               | Vendor Maestro exists; indexes still say “upcoming”                             |


**Result:** Agents and humans get strong backend guidance, weak/wrong mobile guidance (especially Driver/QC vs Vendor, and Flutter system architecture).

---

## 2. Goals

1. Add a **mobile system context** layer parallel to `04-backend/`.
2. Add **mobile development guides** under `08-development-guides/02-mobile/` (drop `02-frontend` reservation; no frontend guides needed now).
3. Sync **Vendor product specs** (`vendor-mobile/`) with the real app.
4. Clarify **Driver/QC** status so PRD-era Flutter claims are not treated as current truth.
5. Refresh indexes, contracts, and cross-links without rewriting unrelated domain modules.

---

## 3. Non-goals (this initiative)

- Building or fully specifying Driver/QC Flutter apps.
- Rewriting non-mobile `05-modules` domains.
- Moving product SSOT into `nourish-vendor-app` (keep product truth in this submodule).
- Duplicating every Dart file into context docs.

---

## 4. Single source of truth (roles)


| Concern                             | Lives in                                                      |
| ----------------------------------- | ------------------------------------------------------------- |
| Product UX / flows / business rules | `05-modules/15-mobile-apps/vendor-mobile/`                    |
| Flutter system architecture         | **New** `04-architecture/09-mobile/`                          |
| Setup / flavors / how-to            | **New** `08-development-guides/02-mobile/`                    |
| API contract                        | `06-contracts` (+ endpoint map from real `/api/v1/vendor/*`)  |
| E2E proof                           | `09-testing/mobile/` ↔ `nourish-vendor-app/.maestro/`         |
| Implementation detail               | `nourish-vendor-app` (code); context **links**, does not copy |


Backend domain modules remain SSOT for transport/vendor/fleet rules. Mobile docs **link** to them instead of re-owning backend rules.

```text
Product truth (what/why)      →  05-modules/15-mobile-apps/vendor-mobile/
System truth (how built)      →  04-architecture/09-mobile/     ← main gap
How-to (run / dev / test)     →  08-development-guides/02-mobile/
API truth                     →  06-contracts (+ endpoint-map)
Proof                         →  09-testing/mobile + .maestro/
Code                          →  nourish-vendor-app
```

### Path numbering decisions


| Location     | Chosen path                        | Why                                                                                                                       |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Architecture | `04-architecture/09-mobile/`       | Do **not** reuse `04` (that is backend). Next free index after `08-reference`.                                            |
| Dev guides   | `08-development-guides/02-mobile/` | Next free after `01-backend`. Drop old README reservation for `02-frontend` / `03-mobile`; no frontend guides needed now. |


---

## 5. Main gaps

1. **No mobile system context** — No `09-mobile/` Flutter package/MVVM/flavors/JWT+Host tenancy docs.
2. **No mobile development guides** — create `02-mobile/` (next free after `01-backend`).
3. **Product vs code drift** — Thin onboarding/profile specs; Sprint 9 auth/phone gate only partly reflected.
4. **Stale duplicates** — Monolithic `vendor-mobile.md` vs folder SSOT; `15-mobile-apps/README` still titled “07-mobile-interfaces”.
5. **Driver/QC overstated** — Specs claim Flutter; Phase 1 driver is responsive Django Admin (`driver-interface-sprint4.md`).
6. `**mobile.yaml` unusable** — Generic paths; real surface is `/api/v1/vendor/`*.
7. **Index debt** — Start-here / testing READMEs still call mobile testing “upcoming”.
8. **Renumbered to `15-mobile-apps` (was colliding with `09-tracking`).

---

## 6. Phased work plan

### Phase 0 — Scope lock

- Confirm Vendor Mobile as the only deep update target.
- Label Driver/QC as Phase-1 web / future Flutter (not current Flutter SSOT).
- Agree SSOT roles in §4.

**Exit criteria:** Written agreement in this plan (status → Active).

---

### Phase 1 — Mobile system context (highest leverage)

Create `04-architecture/09-mobile/` (next index after `08-reference`; not `04-mobile`):

```text
04-architecture/09-mobile/
├── README.md
├── 00-overview/
│   ├── purpose-and-scope.md
│   ├── architecture-summary.md
│   └── technology-stack.md
├── 01-application-structure/
│   ├── package-boundaries.md          # lib / domain / data
│   ├── presentation-conventions.md    # feature/{binding,route,screen,view_model}
│   ├── navigation-and-session-gating.md
│   └── state-and-di.md
├── 02-environments-and-build/
│   ├── flavors.md
│   └── secrets-and-env.md             # API_BASE_URL, DFMS_TENANT_HOST, USE_LIVE_API
├── 03-backend-integration/
│   ├── api-client.md                  # JWT refresh, Host header, multipart
│   ├── endpoint-map.md                # ApiEndpoints ↔ /api/v1/vendor/*
│   └── tenancy-and-vendor-types.md
├── 04-feature-map.md                  # Code folders ↔ vendor-mobile/*.md
└── 05-decisions/                      # Short ADRs (Navigator, no use-case layer, http, Host tenancy)
```

Also update shared C4 / stack docs so:

- **Vendor** = implemented Flutter (`nourish-vendor-app`).
- **Driver/QC** = current reality (admin/responsive or planned), not three live Flutter apps.

**Ground truth for content:** `nourish-vendor-app` (`lib/`, `domain/`, `data/`, `env/`, `.maestro/`).

**Exit criteria:** Index README + overview + backend integration + feature map exist; C4 wording corrected.

---

### Phase 2 — Development guides

Create `08-development-guides/02-mobile/`:

- Local setup (FVM, flavors, env encrypt)
- Pointing at local `nourish-backend`
- Live API vs seed repositories
- Maestro runbook (link `09-testing/mobile/`; do not duplicate)
- Contribution conventions (feature folder pattern)

Wire from `08-development-guides/README.md` and `00-START-HERE.md`.

**Exit criteria:** A new developer can run vendor app + Maestro from context links alone.

---

### Phase 3 — Sync product module specs

Under `05-modules/15-mobile-apps/`:

1. Fix index README (name, links, SSOT = `vendor-mobile/`).
2. Deprecate or redirect monolithic `vendor-mobile.md` → `vendor-mobile/`.
3. Diff each `vendor-mobile/00–12-*.md` against `lib/presentation/feature/*` and Maestro flows.
4. Thicken thin files (`01-onboarding`, `09-profile`) and Sprint 9 auth / phone-verification gate.
5. Add a short **code map** per file: feature path + key APIs (not full implementation dump).
6. Clearly label Driver/QC docs; point driver current UI to `03-users/driver-interface-sprint4.md`.

**Exit criteria:** Folder SSOT is unambiguous; screen docs match app behavior for Vendor.

---

### Phase 4 — Contracts and cross-links

1. Replace or split `mobile.yaml` into vendor-aligned OpenAPI, **or** document “see backend OpenAPI + `endpoint-map.md`”.
2. Update `02-REPOSITORY_PURPOSE` / submodule notes: real repo name = `nourish-vendor-app`.
3. Cross-link: architecture ↔ modules ↔ backlog (`VENDOR-MOBILE-CONTEXT`, VAPP-*) ↔ `09-testing/mobile`.

**Exit criteria:** No generic example.com mobile API sketch as the implied contract.

---

### Phase 5 — Hygiene (can run anytime)

- Fix “mobile testing upcoming” in `00-START-HERE` and testing READMEs.
- ~~Document (or later fix) `09-mobile-apps` vs `09-tracking` numbering collision.~~ **Done:** mobile module is `15-mobile-apps/`.
- Optional: align stale boilerplate in `nourish-vendor-app/docs/` so it does not contradict context SSOT.

---

## 7. Suggested execution order


| Step | Deliverable                                                            | Why first                    |
| ---- | ---------------------------------------------------------------------- | ---------------------------- |
| 1    | `04-architecture/09-mobile/` skeleton + overview + backend integration | Largest gap; unblocks agents |
| 2    | C4 / stack clarifications (Vendor vs Driver/QC)                        | Stops wrong assumptions      |
| 3    | `08-development-guides/02-mobile/`                                     | Makes context actionable     |
| 4    | `vendor-mobile/` sync + deprecate monolith                             | Align product specs with app |
| 5    | Contracts + index hygiene                                              | Completeness                 |


---

## 8. Reference: Vendor app (ground truth snapshot)

Use this as the baseline for Phase 1–3 content (verify against code when writing):


| Area         | Reality                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| Stack        | Flutter **3.35.4** / Dart **3.9.2** (FVM); `http` client; MVVM + `ValueNotifier` |
| Packages     | `lib/` (presentation) · `domain/` · `data/`                                      |
| Navigation   | `Navigator` + typed routes (`go_router` unused)                                  |
| Session gate | Splash → auth → phone verify → onboarding → tenant join → MainShell              |
| Shell tabs   | TOs · Bids · Trips · Tenants · Profile                                           |
| API          | Bearer vendor JWT + `Host` tenancy → `/api/v1/vendor/*`                          |
| Toggle       | `USE_LIVE_API` (live vs seed repos)                                              |
| E2E          | Maestro under `.maestro/flows/`                                                  |


Product IA already started in:

`05-modules/15-mobile-apps/vendor-mobile/`

---

## 9. Definition of done

- [x] `04-architecture/09-mobile/` exists with overview, structure, env, backend integration, feature map
- [x] `08-development-guides/02-mobile/` exists and is linked from guides README + start-here (remove stale `02-frontend` / `03-mobile` Future slots)
- [x] Shared architecture docs no longer imply three implemented Flutter apps
- [x] `vendor-mobile/` is the only Vendor product SSOT; monolith redirected/deprecated
- [x] Vendor screen docs include code/API maps and match current app flows
- [x] Driver/QC status clarified (current vs future)
- [x] Mobile testing indexes no longer say “upcoming”
- [x] Contract story for vendor APIs is accurate (YAML refresh or explicit pointer)

---

## 10. Risks / watchouts

- **Doc duplication:** Keep product flows in `vendor-mobile/`; keep build/architecture in `09-mobile/`; link both ways.
- **Stale in-app docs:** `nourish-vendor-app/docs/` still has boilerplate (Dio/go_router/use-case layer) — prefer context as high-level SSOT or fix both.
- **Scope creep:** Do not expand into full Driver/QC Flutter specs in this pass.
- **API drift:** Endpoint map must be regenerated from `api_end_points.dart` + backend URLs when either changes.

---

## 11. Next action

**Done (2026-09-16):** Phases 1–5 landed. Follow-ups: keep endpoint-map in sync with `api_end_points.dart`; optionally clean boilerplate in `nourish-vendor-app/docs/`.
