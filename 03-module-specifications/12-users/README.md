# 12-users - User Management

## Module Overview

User profiles and user-related domain specifications

**Purpose**: User profiles, driver user profiles, and user-related domain logic  
**PRD Sections**: 6.3.2, 6.6  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/`

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [driver-user-profiles.md](driver-user-profiles.md) | **`Driver`** + **`User`** on create (first/last name, Driver role, Operations, phone, employee_id); invitation separate plan; `/api/v1/drivers`; driver compliance, license validity, state tracking | 6.3.2 / 6.6 | US-004, US-005, US-052, US-057 | ~330 |

**Total Documentation**: ~330 lines of comprehensive technical specifications

---

## Related User Stories

**Primary Stories**: US-057  
**Location**: `../../04-backlog/stories/`

For detailed story information, see individual specification files above.

---

## Dependencies

### Upstream Dependencies
`01-foundation/` (User & Tenant Management, RBAC)

### Downstream Dependencies
- `06-fleet-management/` (vehicle assignments, trip management)
- `03-operations/` (trip execution, driver assignments)

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../04-backlog/stories/)** - Implementation stories

---

**Last Updated**: 2026-04-09  
**Status**: Complete
