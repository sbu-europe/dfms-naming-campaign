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
| [driver-management.md](driver-management.md) | Driver resource registry with complete credentials, license validity tracking, driver-vehicle assignment management with availability checks, operational status monitoring (Available/Assigned/On Trip/On Leave), work hour tracking and attendance for compliance, leave management workflows, performance metrics (trips/efficiency/safety), state transition automation, double-booking prevention | 6.6 | US-087, US-088, US-089, US-090, US-091, US-092 | 437 |
| [helper-management.md](helper-management.md) | Helper registry with national ID and reference contacts, helper-driver-trip assignment management, availability tracking to prevent double-booking, many-to-one mapping (multiple helpers per driver), assignment history for accountability, status management (Available/On Trip/On Leave) | 6.6 | US-093, US-094 | 204 |
| [fuel-management.md](fuel-management.md) | Fuel tracking for own fleet (Phase 2), refueling event logging by drivers/supervisors, photo documentation (receipt/odometer), mileage-based fuel consumption calculation (km/liter), fuel efficiency monitoring with anomaly detection, cost per km analysis, baseline comparison and variance alerts | 6.10 | US-095, US-096, US-097 | 205 |

**Total Documentation**: ~1,500 lines of comprehensive technical specifications

---

## Related User Stories

**Primary Stories**: 53, 057-062  
**Location**: `../../04-phase-backlog/phase-1/user-stories/`

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
- **[Source PRD](../../../source-documents/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../04-phase-backlog/phase-1/user-stories/)** - Implementation stories

---

**Last Updated**: 2026-02-26  
**Status**: Complete
