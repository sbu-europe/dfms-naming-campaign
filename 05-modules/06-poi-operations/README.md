# 04-operations-support - Operations Support

## Module Overview

Supporting operational workflows for gate, scaling, command center, and quality control

**Purpose**: Supporting operational workflows for gate, scaling, command center, and quality control  
**PRD Sections**: 6.9, 6.10, 6.13  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `03-operations/`

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [gate-management.md](gate-management.md) | Entry/exit control layer for vehicle access to POIs, gate-in/gate-out registration, document validation (PO/TO/DO/Challan), workflow routing (inbound QC/outbound loading/internal transfer), clearance enforcement (QC pass, scale-out), dwell time tracking, on-demand third party registration | 6.9 | US-040, US-041, US-042, US-043, US-044 | 1058 |
| [scaling-management.md](scaling-management.md) | Weight verification layer, scale-in (gross weight) and scale-out (tare weight) capture, net weight auto-calculation, weight variance detection, discrepancy management, gate pass generation with QR codes, immutable weight entries, command center integration | 6.10 | US-045, US-046, US-047, US-048, US-049, US-050 | 732 |
| [qc-workflow.md](qc-workflow.md) | Product quality assurance layer, auto-event creation for inbound vehicles, QR-labeled sample collection, checklist-based physical inspection (visual/dimensional/packaging), lab test request and result tracking, pass/fail/recheck decisions, evidence capture (photo/video with timestamps), gate-out enforcement for failed QC | 6.13 | US-051, US-052, US-053, US-054, US-055, US-056 | 826 |
| [command-center.md](command-center.md) | Orchestration and monitoring hub for all POI operations, centralized dashboard, real-time queue management (scale-in, QC, loading, unloading, scale-out, gate-out), task assignment to personnel, queue token generation, on-demand TO creation, gate pass issuance, exception handling, incident management, performance dashboards and KPIs | 6.10 (partial) | US-057, US-058, US-059, US-060, US-061, US-062, US-063 | 845 |

**Total Documentation**: ~3,460 lines of comprehensive technical specifications

---

## Related User Stories

**Primary Stories**: 35-090 (Gate, Scaling, Loading, QC workflows)  
**Location**: `../../03-backlog/phase-1/user-stories/`

For detailed story information, see individual specification files above.

---

## Dependencies

### Upstream Dependencies
`03-operations/`

### Downstream Dependencies
Check individual specification files for detailed cross-module references.

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../03-backlog/phase-1/user-stories/)** - Implementation stories

---

**Last Updated**: 2026-02-26  
**Status**: Complete
