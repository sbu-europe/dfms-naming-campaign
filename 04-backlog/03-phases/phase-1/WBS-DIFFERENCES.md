# WBS vs Workflow-Based Organization - Differences & Decisions

**Date**: 2026-02-26  
**Decision**: Use workflow-based organization instead of WBS functional grouping

---

## Executive Summary

We chose to organize user stories by **workflow sequence** (Requisition → Approval → TO → Gate → QC) rather than by **functional modules** as defined in the WBS. This document records the differences and rationale.

---

## Key Decision

**Organizational Principle**: Stories are organized by operational workflow sequence, not functional grouping.

**Rationale**:
- Better reflects actual operational flow
- Easier for teams to understand dependencies
- Aligns with how work actually moves through the system
- Master data should not all be grouped together - it should be distributed where needed in workflows

---

## Story Organization Comparison

### WBS Organization (Rejected)
Stories grouped by functional area:
- **EPIC-003** (Master Data): All master data stories together (US-010 through US-013)
- **EPIC-004** (POI): All POI stories together (US-014 through US-022)
- **EPIC-007** (Requisition): All requisition stories together (US-026 through US-029)
- **EPIC-009** (TO Management): All TO stories together (US-035 through US-046)

### Our Workflow-Based Organization (Adopted)
Stories follow operational sequence:
- **US-010-015**: Requisition creation and approval workflows
- **US-016-022**: Fleet and TO management
- **US-023-025**: Incident, bidding, closure
- **US-026-034**: Real-time monitoring and vendor management
- **US-035-046**: Gate operations, scaling, loading, QC

---

## Detailed Story Mapping

### EPIC-003: Master Data & Configuration

| Story ID | WBS Title | Our Workflow Title | Our Organization |
|----------|-----------|-------------------|------------------|
| US-010 | Master Entity Registration | Create Port Consignment Transfer Requisition (TR) | Port/LC requisition workflow |
| US-011 | Bulk Upload & Inline Master Data Management | Distribution Approval Workflow (FG TR) | Approval workflow |
| US-012 | Master CRUD Operations | Procurement Approval Workflow (Port TR) | Procurement approval |
| US-013 | Data Consistency Referential Control | Stock Validation (Source & Destination) | Validation workflow |

**Our Decision**: Keep requisition and approval workflows here as they initiate the transport process.

---

### EPIC-004: POI Management & Geofencing

| Story ID | WBS Title | Our Workflow Title | Our Organization |
|----------|-----------|-------------------|------------------|
| US-014 | POI Definition | Capacity Checking and Warnings | Pre-requisition validation |
| US-015 | POI CRUD Operation | Transport Requisition (TR) Assessment by Transport Planner | TR workflow |
| US-016 | POI Classification (Type Tagging) | Fleet Availability Validation | Fleet management |
| US-017 | Map Layer Integration | Transport Order (TO) Creation - Multiple TOs per TR | TO creation |
| US-018 | Real-time Location Tracking | Transport Order (TO) Creation by Transport Planner | TO creation |
| US-019 | Geofencing & POI Tracking | TO Execution - Vendor Fleet (Direct Assignment) | TO execution |
| US-020 | Geofencing Boundary | TO Execution - Own Fleet (Vehicle/Driver Assignment) | TO execution |
| US-021 | Vehicle Arrival Tracking | Trip Lifecycle Management (12 States, Sub-states) | Trip management |
| US-022 | Dwell Time Tracking | Partial Delivery Handling | Delivery workflow |

**Our Decision**: Keep TR assessment, fleet validation, TO creation, and trip management as workflow sequence.

---

### EPIC-005: Product Inventory Management (PIM)

| Story ID | WBS Title | Our Workflow Title | Our Organization |
|----------|-----------|-------------------|------------------|
| US-023 | Product Master Data | Incident Management | Operational workflow |
| US-024 | Catalogue Design | Vendor Bidding Portal for Non-Contractual TOs | Vendor workflow |
| US-025 | Product Configuration – Transport & QC Attribute Mapping | Trip Closure with Proof of Delivery (POD) | Trip closure workflow |

**Our Decision**: Keep incident management, bidding, and trip closure in operational sequence.

---

### EPIC-007: Product Transfer Requisition Management

| Story ID | WBS Title | Our Workflow Title | Our Organization |
|----------|-----------|-------------------|------------------|
| US-026 | Requisition Transfer Type Configuration | Real-time Map Dashboard (Command Center) | Monitoring/visibility |
| US-027 | Unified Product Requisition (PR) Creation by Requester Team | Vendor Registration & Verification Workflow | Vendor onboarding |
| US-028 | Finished Goods Transfer Requisition Creation (Depot / Feed Mill → Distribution) | Vendor Performance Tracking & Metrics | Vendor management |
| US-029 | Port (LC-Based) Transfer Requisition Creation (Commercial → Procurement) | Vendor Payment Management | Vendor operations |

**Our Decision**: Group Command Center monitoring and vendor management workflows together.

---

### EPIC-008: Distribution & Procurement Management

| Story ID | WBS Title | Our Workflow Title | Our Organization |
|----------|-----------|-------------------|------------------|
| US-030 | TR Creation by Distribution Officer | Vendor Fleet Management | Vendor operations |
| US-031 | TR Approval by Distribution Manager | Vendor Portal (Self-Service) | Vendor portal |
| US-032 | TR Creation by Procurement | Vendor Rating & Reviews | Vendor feedback |
| US-033 | Source Stock Validation | Vendor Contract Management | Vendor contracts |
| US-034 | Destination Capacity Validation | Vendor Blacklist Management | Vendor compliance |

**Our Decision**: Keep vendor management workflows grouped together.

---

### EPIC-009: Transport Order (TO) Management

| Story ID | WBS Title | Our Workflow Title | Our Organization |
|----------|-----------|-------------------|------------------|
| US-035 | TR (Transport Request) Assessment | Gate-In Entry at Source POI | Gate operations |
| US-036 | Create Transport Order (TO) for FG Transfer | Gate-Out Entry at Source POI | Gate operations |
| US-037 | Create Transport Order (TO) for Port Consignment Transfer | Gate-In Entry at Destination POI | Gate operations |
| US-038 | TO Execution - Own Fleet (TDO - Own Fleet) | Gate-Out Entry at Destination POI | Gate operations |
| US-039 | TO Execution - Vendor Fleet (Contractual) | Scaling/Weighing at Source POI | Weighing operations |
| US-040 | TO Execution - Vendor Fleet (Non-Contractual) | Scaling/Weighing at Destination POI | Weighing operations |
| US-041 | Vendor Execution & Confirmation | Loading Operations | Loading workflow |
| US-042 | Fleet Availability Validation (Own Fleet) | Unloading Operations | Unloading workflow |
| US-043 | TO Lifecycle Management | Command Center Monitoring | Operations monitoring |
| US-044 | Transport Dashboard - Map-Based Dashboard | QC Lab Testing | Quality control |
| US-045 | Trip Closure & Proof of Delivery | QC Sample Collection | Quality control |
| US-046 | Trip Costing | QC Test Configuration | Quality control |

**Our Decision**: Keep gate, scaling, loading/unloading, and QC workflows in operational sequence.

---

### EPIC-010: Vendor Management

| Story ID | WBS Title | Our Workflow Title | Match |
|----------|-----------|-------------------|-------|
| US-047 | Vendor Registration | Vendor Registration | ✅ Match |
| US-048 | Vendor Verification Workflow | QC Report Generation | ❌ Our: QC workflow |
| US-049 | Vendor Bidding Portal | QC Rejection Workflow | ❌ Our: QC workflow |
| US-050 | Vendor Bid Evaluation | QC Dashboard | ❌ Our: QC workflow |

**Note**: US-047 matches. US-048-050 in our system contain QC workflows, not vendor features.

---

### EPIC-006: Fleet & Vehicle Management

| Story ID | WBS Title | Our Workflow Title | Match |
|----------|-----------|-------------------|-------|
| US-053 | Vehicle Registration & Master Data | Vehicle Registration & Master Data Management | ✅ Match |
| US-054 | Vehicle License & Health Management | QC Audit Trail | ❌ Our: QC workflow |
| US-055 | Vehicle Status Matrix & Availability | QC Vendor Quality Tracking | ❌ Our: QC workflow |
| US-056 | Vehicle and Resource Assignment | QC Compliance Reporting | ❌ Our: QC workflow |
| US-057 | Driver Master Data | Driver Master Data | ✅ Match |
| US-058 | Driver-Vehicle Assignment | Fuel Management | ❌ Our: Fleet operations |
| US-059 | Driver State Tracking | Trip Cost Calculation | ❌ Our: Financial workflow |
| US-060 | Driver Availability Status Tracking | Profitability Analysis | ❌ Our: Financial workflow |
| US-061 | Helper Profile | Helper Profile | ✅ Match |
| US-062 | Helper Assignment | Helper Assignment | ✅ Match |

**Note**: US-053, US-057, US-061, US-062 match. Others differ - our system has QC, fuel, and financial workflows here.

---

### EPIC-011: Gate Management

| Story ID | WBS Title | Our Workflow Title | Match |
|----------|-----------|-------------------|-------|
| US-063 | Gate-in TO/Challan Lookup | Gate-in TO/Challan Lookup | ✅ Match |
| US-064 | On Demand Third Party TO Creation against DO copy for Dealer Entry | On Demand Third Party TO Creation against DO copy for Dealer Entry | ✅ Match |
| US-065 | On Demand Third Party TO Creation against PO copy for Supplier Entry | On Demand Third Party TO Creation against PO copy for Supplier Entry | ✅ Match |
| US-066 | Gate-Out Entry | Gate-Out Entry | ✅ Match |
| US-067 | Remarks Logging | Remarks Logging | ✅ Match |

**Note**: EPIC-011 stories all match! ✅

---

### EPIC-012: Scaling / Weight Management

| Story ID | WBS Title | Our Workflow Title | Match |
|----------|-----------|-------------------|-------|
| US-068 | Weight Entry | Weight Entry | ✅ Match |
| US-069 | Queue Token Generation | Queue Token Generation | ✅ Match |
| US-070 | Weight Exit | Weight Exit | ✅ Match |

**Note**: EPIC-012 stories all match! ✅

---

## Summary Statistics

### Stories that Match WBS
- **US-001 through US-009**: Auth/User Management ✅
- **US-047**: Vendor Registration ✅
- **US-053, US-057, US-061, US-062**: Fleet/Driver/Helper ✅
- **US-063 through US-070**: Gate & Scaling ✅

**Total Matching**: ~25 stories

### Stories with Different Content
- **US-010 through US-046**: Different workflow-based content
- **US-048 through US-060**: Mixed content (QC, fuel, financial vs vendor/fleet)

**Total Different**: ~60 stories

---

## Rationale for Workflow-Based Organization

### 1. **Operational Flow**
Stories follow how work actually moves through the system:
- Requisition created → Approved → TO Created → Vehicle Dispatched → Gate In → Weigh → Load/Unload → QC → Weigh Out → Gate Out

### 2. **Team Understanding**
- Easier for operational teams to understand dependencies
- Clear sequence of what happens when
- Logical grouping for planning and execution

### 3. **Master Data Distribution**
- Master data setup happens where it's needed in workflows
- Not artificially grouped together when it serves different purposes
- Example: Vehicle registration (US-053) is with Fleet epic, not in Master Data epic

### 4. **Real-World Alignment**
- Matches how teams actually work
- Reflects business process flows
- Easier to map to operational procedures

---

## Epic Content Differences

### Epics with Different Story Content

| Epic ID | Epic Name | WBS Focus | Our Focus |
|---------|-----------|-----------|-----------|
| EPIC-003 | Master Data & Configuration | Master data CRUD operations | Requisition & Approval workflows |
| EPIC-004 | POI Management & Geofencing | POI setup and geofencing | TR assessment, TO creation, Trip mgmt |
| EPIC-005 | Product Inventory Management | Product catalog management | Incident, Bidding, Trip closure |
| EPIC-007 | Product Transfer Requisition | PR creation workflows | Command Center & Vendor mgmt |
| EPIC-008 | Distribution & Procurement | Distribution/Procurement approvals | Vendor operations & portal |
| EPIC-009 | Transport Order Management | TO creation & execution | Gate, Scaling, Loading, QC operations |

### Epics with Matching Content

| Epic ID | Epic Name | Alignment |
|---------|-----------|-----------|
| EPIC-001 | System Foundation | ✅ Matches WBS |
| EPIC-002 | User & Tenant Foundation | ✅ Matches WBS |
| EPIC-011 | Gate Management | ✅ Matches WBS |
| EPIC-012 | Scaling / Weight Management | ✅ Matches WBS |

---

## Implementation Notes

### What We Did
1. **Reverted WBS Alignment**: Removed WBS functional grouping placeholders
2. **Restored Workflow Organization**: Brought back workflow-based story content
3. **Standardized Epic Filenames**: All epics use `EPIC-XXX-` uppercase pattern
4. **Updated Epic Story Tables**: Tables show actual workflow-based titles
5. **Enhanced Stories**: Added full structure (Data Model, UI/UX, API, Testing) to US-001-009, US-047, US-053, US-057, US-061-070

### What We Kept
- WBS epic structure (17 epics)
- WBS story IDs (US-001 through US-094+)
- Stories that naturally aligned (auth, gate, scaling)

### What We Changed
- Story organization principle (workflow vs functional)
- Story content for US-010-046 (workflow-based instead of WBS definitions)
- Epic story tables (show actual titles, not WBS titles)

---

## Maintenance Guidelines

### When Adding New Stories
1. **Follow workflow sequence** - Where does this fit in the operational flow?
2. **Don't force functional grouping** - If a story spans multiple areas, place it where it makes most sense operationally
3. **Update epic tables** - Ensure epic story tables show actual file titles

### When Referencing WBS
- WBS remains the source of truth for epic structure and IDs
- Story IDs follow WBS numbering
- Story content follows our workflow organization
- Document any new divergences in this file

### Cross-Reference Rule
- Always maintain this file when making organizational changes
- Document why we diverged from WBS
- Keep examples of major differences

---

## Contact & History

**Last Updated**: 2026-02-26  
**Decision Made By**: Development Team  
**Commits**:
- `cbe4d3e`: Initial story structure enhancements
- `3cfc5d9`: WBS alignment attempt (later reverted)
- `700cb61`: Revert to workflow-based organization
- `4d8879b`: Update epic story tables to match workflow titles

**Key Principle**: *"Organize by how work flows, not by functional boundaries"*
