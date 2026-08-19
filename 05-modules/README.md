# 05-modules - Module Specifications

> **Comprehensive domain knowledge and technical design specifications organized by functional modules**

## Overview

This folder contains **35 specification files** (~20,000 lines) that document how DFMS features work, combining:
- **Business domain knowledge**: Conceptual workflows, business rules, feature behavior
- **Technical design details**: Data models, APIs, state machines, integration points
- **Implementation guidance**: Validation rules, edge cases, performance considerations

## Content Type

These are **module specifications** (not just business requirements or just technical specs):
- **Product managers** use this to understand feature details and business logic
- **Developers** use this to implement features with complete context
- **Architects** use this to understand system design and module dependencies
- **QA engineers** use this to create comprehensive test scenarios

## Module Structure

| # | Module | Files | Description | Django App | Sprint |
|---|--------|-------|-------------|-----------|--------|
| [01-foundation/](01-foundation/) | Auth, RBAC, tenant management, system foundation | ~7 | Authentication, RBAC, user/tenant management | `apps/tenants`, `apps/users`, `apps/core` | Sprint 1 |
| [02-master-data/](02-master-data/) | POI, Product, Vehicle, Supplier/Dealer master data | ~8 | Master data management — bulk import/export | `apps/master_data` | Sprint 2 |
| [03-users/](03-users/) | Driver and Helper user profiles | 2 | Driver compliance, Helper profiles with optional User link | `apps/users` | Sprint 2 |
| [04-requisitions/](04-requisitions/) | FG PR, Port Shipment (import), Distribution & Procurement TRs | 3+ | Requisition → Port Shipments (top) → TR flows (FG + Port) | `apps/requisitions` | Sprint 3 |
| [05-transport/](05-transport/) | Transport **requests** (unified TR queue) + **Transport orders** (TO) + TDO, Trip (Sprint 4) | 3 | TRQ-01, TO-01, TO-02; planning + execution | `apps/transport` | Sprint 3–4 |
| [06-poi-operations/](06-poi-operations/) | Gate, Scaling, QC, Command Center | 4 | POI-level physical operations | `apps/operations` | Sprint 4 |
| [07-vendor-management/](07-vendor-management/) | Vendor onboarding, bidding, portal | 3 | Vendor ecosystem management | `apps/vendors` | Sprint 4 |
| [08-fleet-management/](08-fleet-management/) | Vehicles, drivers, helpers, fuel | 4 | Fleet lifecycle management | `apps/users`, `apps/master_data` | Sprint 4 |
| [09-tracking/](09-tracking/) | **GPS / Live GPS / geofence / dwell (product SSOT)** | 7 | Providers, Live GPS, geofence, dwell, maps | `apps/tracking`, `services/gt06-ingest` | Sprint 5–6 |
| [09-mobile-apps/](09-mobile-apps/) | Driver, QC, Vendor mobile apps | 3 | Mobile interfaces for field users | — | Sprint 5 |
| [10-audit/](10-audit/) | Audit log implementation | 1 | Entity audit trail | `apps/audit` | Sprint 2+ |
| [11-reporting/](11-reporting/) | Reports and analytics | 2 | Dashboards, KPIs, reports | `apps/reporting` | Phase 2 |
| [12-cross-cutting/](12-cross-cutting/) | Security, NFRs, integrations | 3 | Cross-cutting concerns | — | All phases |
| [13-phases/](13-phases/) | Phase-wise rollout plan | 3 | Feature roadmap by phase | — | Reference |
| [14-reference/](14-reference/) | Glossary, terminology | 1 | Domain terms and acronyms | — | Reference |

**Total**: 35 files, ~20,000 lines of comprehensive technical documentation

**Note**: Business context (objectives, vision, scope, personas) is in [02-domain/01-overview/](../02-domain/01-overview/README.md)

## Documentation Format

All specification files follow **domain knowledge format**:

### Structure
```markdown
---
frontmatter: (metadata, source references)
---

# Module Name

## Overview
- Purpose, scope, and key concepts

## Core Functionality
- How features work conceptually
- Business workflows and rules

## Data Models
- TypeScript interfaces
- Database schemas
- State machines

## Integration Points
- Dependencies on other modules
- External system integration

## Business Rules
- Validation logic
- Edge cases
- Error handling

## Related User Stories
- US-XXX references
```

### Example Content
- **Business Logic**: "How does trip lifecycle work? (States: Assigned → Dispatched → In-Transit → Completed)"
- **Technical Details**: "Trip data model (TypeScript), state transition rules, GPS integration"
- **Workflows**: "Trip creation workflow, assignment rules, completion criteria"
- **Integration**: "Depends on vehicle-management, integrates with GPS/VTS provider"

## Quick Links

### By Use Case
| I want to... | Go to |
|--------------|-------|
| Understand authentication | [01-foundation/authentication-security.md](01-foundation/authentication-security.md) |
| See how PRs work | [04-requisitions/product-requisition-management.md](04-requisitions/product-requisition-management.md) |
| Understand Distribution TR workflow | [04-requisitions/distribution-management.md](04-requisitions/distribution-management.md) |
| See trip management workflow | [05-transport/trip-management.md](05-transport/trip-management.md) |
| Learn about vendor bidding | [07-vendor-management/vendor-bidding.md](07-vendor-management/vendor-bidding.md) |
| Review QC workflow | [06-poi-operations/qc-workflow.md](06-poi-operations/qc-workflow.md) |
| Check mobile app specs | [09-mobile-apps/](09-mobile-apps/) |
| See non-functional requirements | [12-cross-cutting/non-functional-requirements.md](12-cross-cutting/non-functional-requirements.md) |

### By Module
- **01-foundation**: Auth, RBAC, users, system
- **02-master-data**: POI, products, vehicles, suppliers/dealers
- **03-users**: Driver, Helper profiles
- **04-requisitions**: FG PR, Port Shipment (import), Distribution, Procurement (aligned with [Sprint 3 backlog](../03-backlog/sprints/sprint-3/README.md) — `01-requisition` … `04-procurement`)
- **05-transport**: Transport **requests** + **Transport orders** (TRQ-01, TO-01, TO-02) — see same Sprint 3 doc (`05-transport` folder in backlog)
- **06-poi-operations**: Gate, Scaling, QC, Command Center
- **07-vendor-management**: Vendor onboarding, bidding, portal
- **08-fleet-management**: Vehicles, drivers, helpers, fuel
- **09-mobile-apps**: Driver, QC, Vendor mobile apps
- **10-audit**: Entity audit trail
- **11-reporting**: Reports, dashboards
- **12-cross-cutting**: Security, NFRs, integrations

## Related Documentation

- **Source PRD**: [../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md](../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md) — original product requirements
- **Sprint 3 backlog (Requisition–first)**: [../03-backlog/sprints/sprint-3/README.md](../03-backlog/sprints/sprint-3/README.md) — menu, roles, story paths `01-requisition` … `08-feedback`
- **User stories (current)**: [../03-backlog/sprints/README.md](../03-backlog/sprints/README.md) — sprint-wise stories, improvements & feedback (the old flat `_meta/archive/backlog-stories-pre-sprint2/` is archived)
- **Domain Context**: `../02-domain/` — high-level business context
- **Technical Architecture**: `../04-architecture/` — system architecture diagrams

## Supporting Files

- **[INDEX.md](INDEX.md)** - Comprehensive searchable content index

For transformation guide and progress reports, see [`../_meta/`](../_meta/)

---

**Last Updated**: 2026-04-09  
**Total Files**: 38 specifications  
**Total Lines**: ~20,539 lines  
**Format**: Domain knowledge + technical design  
**Status**: ✅ Complete (100% transformed)
