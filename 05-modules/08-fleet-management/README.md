# 06-fleet-management - Fleet Management

## Module Overview

Fleet, vehicle, driver, and helper lifecycle management

**Purpose**: Fleet, vehicle, driver, and helper lifecycle management  
**PRD Sections**: 6.6 (partial), 6.10 (partial)  
**Phase**: Phase 1 (High)  
**Dependencies**: `02-master-data/`

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [vehicle-management.md](vehicle-management.md) | Fleet asset registry with comprehensive vehicle master data, vehicle type diversity (10+ types), identification tracking (registration/chassis/VIN), specifications (capacity/body/fuel types), ownership differentiation (Own/Vendor), compliance document tracking with expiry alerts, operational status management, mileage tracking, assignment rules (POI/driver/garage), trip assignment validation, utilization tracking | 6.6 | US-082, US-083, US-084, US-085, US-086 | 655 |
| [helper-management.md](helper-management.md) | Helper registry with national ID and reference contacts, helper-driver-trip assignment management, availability tracking to prevent double-booking, many-to-one mapping (multiple helpers per driver), assignment history for accountability, status management (Available/On Trip/On Leave) | 6.6 | US-093, US-094 | 204 |
| [fuel-management.md](fuel-management.md) | Fuel tracking (Phase 2, Sprint 10) — gauge before/after intake, Driver + Driver Supervisor entry, consumption calc, anomaly detection | Prototype | FM-01 – FM-05 | ~200 |
| [vehicle-report.md](../11-reporting/vehicle-report.md) | Vehicle Report under Reports menu — compliance, fuel, parts aggregation | Sprint 10 | VR-01 – VR-03 | ~150 |

**Total Documentation**: ~1,600 lines of comprehensive technical specifications

---

## Related User Stories

**Primary Stories**: 53, 057-062  
**Location**: `../../03-backlog/sprints/README.md`

For detailed story information, see individual specification files above.

---

## Dependencies

### Upstream Dependencies
`02-master-data/`

### Downstream Dependencies
Check individual specification files for detailed cross-module references.

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md)** - Original PRD document
- **[User Stories](../../03-backlog/sprints/README.md)** - Implementation stories

---

**Last Updated**: 2026-09-01  
**Status**: Complete (fuel spec Sprint 10; vehicle-report spec under 11-reporting)
