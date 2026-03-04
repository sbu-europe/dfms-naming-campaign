# Correct Story-to-Epic Mapping Analysis

**Generated**: 2026-03-04  
**Purpose**: Identify misassigned stories and provide correct epic mappings based on story content analysis  
**Scope**: 72 Phase 1 Stories (US-001 to US-070, plus US-053b and US-095)

---

## Executive Summary

### Overall Statistics

- **Total Stories Analyzed**: 72 (US-001 to US-070, US-053b, US-095)
- **Correctly Assigned**: 24 stories (33.3%)
- **MISASSIGNED**: 48 stories (66.7%)
- **Critical Path Impact**: 15 misassigned stories on critical path
- **Most Affected Epic**: EPIC-004 (POI Management) has 9 misassigned stories

### Key Findings

1. **EPIC-004 (POI Management & Geofencing)** is severely misconfigured:
   - Contains stories about Transport Orders, Gate operations, QC workflows
   - Should only contain POI and geofencing-related stories
   
2. **EPIC-003 (Master Data & Configuration)** contains Product Requisition stories:
   - US-010, US-011, US-012, US-013 should be in EPIC-007 (Product Transfer Requisition)
   
3. **EPIC-006 (Fleet & Vehicle Management)** contains many QC stories:
   - US-054, US-055, US-056 are QC stories misplaced in Fleet epic
   
4. **EPIC-007 (Product Transfer Requisition)** contains unrelated Vendor/Command Center stories:
   - US-026, US-027, US-028, US-029 are not requisition-related
   
5. **EPIC-010 (Vendor Management)** contains QC and Driver Mobile stories:
   - US-048, US-049, US-050, US-051, US-052 don't belong in Vendor Management

---

## Detailed Mapping Table

| Story ID | Title | Current Epic | Current Epic Name | SHOULD BE Epic | Correct Epic Name | Status | Issue Category |
|----------|-------|--------------|-------------------|----------------|-------------------|--------|----------------|
| US-001 | User Login & Account Lockout | EPIC-001 | System Foundation | EPIC-001 | System Foundation | ✅ CORRECT | - |
| US-002 | Multi-Factor Auth (2FA) | EPIC-001 | System Foundation | EPIC-001 | System Foundation | ✅ CORRECT | - |
| US-003 | Session Control | EPIC-001 | System Foundation | EPIC-001 | System Foundation | ✅ CORRECT | - |
| US-004 | Role Hierarchy | EPIC-001 | System Foundation | EPIC-001 | System Foundation | ✅ CORRECT | - |
| US-005 | User Invitation & Activation | EPIC-002 | User & Tenant Foundation | EPIC-002 | User & Tenant Foundation | ✅ CORRECT | - |
| US-006 | OTP Verification System | EPIC-002 | User & Tenant Foundation | EPIC-002 | User & Tenant Foundation | ✅ CORRECT | - |
| US-007 | Account Deactivation | EPIC-002 | User & Tenant Foundation | EPIC-002 | User & Tenant Foundation | ✅ CORRECT | - |
| US-008 | Password & Account Reset | EPIC-002 | User & Tenant Foundation | EPIC-002 | User & Tenant Foundation | ✅ CORRECT | - |
| US-009 | User Activity & Audit Logs | EPIC-002 | User & Tenant Foundation | EPIC-002 | User & Tenant Foundation | ✅ CORRECT | - |
| US-010 | Create Port Consignment TR | EPIC-003 | Master Data & Configuration | **EPIC-007** | **Product Transfer Requisition Management** | ⚠️ MISASSIGNED | Content mismatch - TR creation, not master data |
| US-011 | Distribution Approval (FG TR) | EPIC-003 | Master Data & Configuration | **EPIC-008** | **Distribution & Procurement Management** | ⚠️ MISASSIGNED | Content mismatch - Distribution approval workflow |
| US-012 | Procurement Approval (Port TR) | EPIC-003 | Master Data & Configuration | **EPIC-008** | **Distribution & Procurement Management** | ⚠️ MISASSIGNED | Content mismatch - Procurement approval workflow |
| US-013 | Stock Validation | EPIC-003 | Master Data & Configuration | **EPIC-007** | **Product Transfer Requisition Management** | ⚠️ MISASSIGNED | Content mismatch - TR validation feature |
| US-014 | Capacity Checking and Warnings | EPIC-004 | POI Management & Geofencing | **EPIC-007** | **Product Transfer Requisition Management** | ⚠️ MISASSIGNED | Content mismatch - TR capacity validation |
| US-015 | TR Assessment by Transport Planner | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - TO planning, not POI |
| US-016 | Fleet Availability Validation | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - TO execution planning |
| US-017 | TO Creation - Multiple TOs per TR | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - TO creation, not POI |
| US-018 | TO Creation by Transport Planner | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - TO creation, not POI |
| US-019 | TO Execution - Vendor Fleet | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - TO execution, not POI |
| US-020 | TO Execution - Own Fleet | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - TO execution, not POI |
| US-021 | Trip Lifecycle Management | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - Trip states, not POI |
| US-022 | Partial Delivery Handling | EPIC-004 | POI Management & Geofencing | **EPIC-009** | **Transport Order (TO) Management** | ⚠️ MISASSIGNED | Content mismatch - Trip execution, not POI |
| US-023 | Incident Management | EPIC-009 | Transport Order (TO) Management | EPIC-009 | Transport Order (TO) Management | ✅ CORRECT | - |
| US-024 | Vendor Bidding Portal | EPIC-010 | Vendor Management | EPIC-010 | Vendor Management | ✅ CORRECT | - |
| US-025 | Trip Closure with POD | EPIC-009 | Transport Order (TO) Management | EPIC-009 | Transport Order (TO) Management | ✅ CORRECT | - |
| US-026 | Real-time Map Dashboard | EPIC-007 | Product Transfer Requisition Management | **EPIC-015** | **Command Center Operations** | ⚠️ MISASSIGNED | Content mismatch - Command center monitoring |
| US-027 | Vendor Registration & Verification | EPIC-007 | Product Transfer Requisition Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor onboarding |
| US-028 | Vendor Performance Tracking | EPIC-007 | Product Transfer Requisition Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor metrics |
| US-029 | Vendor Payment Management | EPIC-007 | Product Transfer Requisition Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor financials |
| US-030 | Vendor Fleet Management | EPIC-008 | Distribution & Procurement Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor fleet operations |
| US-031 | Vendor Portal (Self-Service) | EPIC-008 | Distribution & Procurement Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor self-service |
| US-032 | Vendor Rating & Reviews | EPIC-008 | Distribution & Procurement Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor performance |
| US-033 | Vendor Contract Management | EPIC-008 | Distribution & Procurement Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor contracts |
| US-034 | Vendor Blacklist Management | EPIC-008 | Distribution & Procurement Management | **EPIC-010** | **Vendor Management** | ⚠️ MISASSIGNED | Content mismatch - Vendor compliance |
| US-035 | Gate-In Entry at Source POI | EPIC-009 | Transport Order (TO) Management | **EPIC-011** | **Gate Management** | ⚠️ MISASSIGNED | Content mismatch - Gate operations |
| US-036 | Gate-Out Entry at Source POI | EPIC-009 | Transport Order (TO) Management | **EPIC-011** | **Gate Management** | ⚠️ MISASSIGNED | Content mismatch - Gate operations |
| US-037 | Gate-In Entry at Destination | EPIC-009 | Transport Order (TO) Management | **EPIC-011** | **Gate Management** | ⚠️ MISASSIGNED | Content mismatch - Gate operations |
| US-038 | Gate-Out Entry at Destination | EPIC-009 | Transport Order (TO) Management | **EPIC-011** | **Gate Management** | ⚠️ MISASSIGNED | Content mismatch - Gate operations |
| US-039 | Scaling/Weighing at Source | EPIC-009 | Transport Order (TO) Management | **EPIC-012** | **Scaling / Weight Management** | ⚠️ MISASSIGNED | Content mismatch - Weighing operations |
| US-040 | Scaling/Weighing at Destination | EPIC-009 | Transport Order (TO) Management | **EPIC-012** | **Scaling / Weight Management** | ⚠️ MISASSIGNED | Content mismatch - Weighing operations |
| US-041 | Loading Operations Management | EPIC-009 | Transport Order (TO) Management | **EPIC-013** | **Loading / Unloading Operations** | ⚠️ MISASSIGNED | Content mismatch - Loading workflow |
| US-042 | Unloading Operations Management | EPIC-009 | Transport Order (TO) Management | **EPIC-013** | **Loading / Unloading Operations** | ⚠️ MISASSIGNED | Content mismatch - Unloading workflow |
| US-043 | Command Center Monitoring | EPIC-009 | Transport Order (TO) Management | **EPIC-015** | **Command Center Operations** | ⚠️ MISASSIGNED | Content mismatch - Operations monitoring |
| US-044 | QC Lab Testing Workflow | EPIC-009 | Transport Order (TO) Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC workflow |
| US-045 | QC Sample Collection | EPIC-009 | Transport Order (TO) Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC workflow |
| US-046 | QC Test Configuration | EPIC-009 | Transport Order (TO) Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC configuration |
| US-047 | Manage Vendor Master Data | EPIC-010 | Vendor Management | EPIC-010 | Vendor Management | ✅ CORRECT | - |
| US-048 | QC Report Generation | EPIC-010 | Vendor Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC documentation |
| US-049 | QC Rejection Workflow | EPIC-010 | Vendor Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC workflow |
| US-050 | QC Dashboard & Analytics | EPIC-010 | Vendor Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC monitoring |
| US-051 | QC Checklist Management | EPIC-010 | Vendor Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC configuration |
| US-052 | Driver Mobile Interface | EPIC-010 | Vendor Management | **EPIC-016** | **Mobile Interface (Driver / QC)** | ⚠️ MISASSIGNED | Content mismatch - Driver mobile app |
| US-053 | Vehicle Master Data Management | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-053b | QC Certificate Management | EPIC-006 | Fleet & Vehicle Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC documentation |
| US-054 | QC Audit Trail & History | EPIC-006 | Fleet & Vehicle Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC compliance |
| US-055 | QC Vendor Quality Tracking | EPIC-006 | Fleet & Vehicle Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC analytics |
| US-056 | QC Compliance & Regulatory Reporting | EPIC-006 | Fleet & Vehicle Management | **EPIC-014** | **Quality Control & Quality Assurance** | ⚠️ MISASSIGNED | Content mismatch - QC compliance |
| US-057 | Manage Driver Master Data | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-058 | Fuel Management & Tracking | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-059 | Trip Cost Calculation | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-060 | Trip Profitability Analysis | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-061 | Manage Helper Master Data | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-062 | Helper Assignment | EPIC-006 | Fleet & Vehicle Management | EPIC-006 | Fleet & Vehicle Management | ✅ CORRECT | - |
| US-063 | Gate-in TO/Challan Lookup | EPIC-011 | Gate Management | EPIC-011 | Gate Management | ✅ CORRECT | - |
| US-064 | On Demand TO - Dealer Entry | EPIC-011 | Gate Management | EPIC-011 | Gate Management | ✅ CORRECT | - |
| US-065 | On Demand TO - Supplier Entry | EPIC-011 | Gate Management | EPIC-011 | Gate Management | ✅ CORRECT | - |
| US-066 | Gate-Out Entry | EPIC-011 | Gate Management | EPIC-011 | Gate Management | ✅ CORRECT | - |
| US-067 | Remarks Logging | EPIC-011 | Gate Management | EPIC-011 | Gate Management | ✅ CORRECT | - |
| US-068 | Weight Entry (Scale-in) | EPIC-012 | Scaling / Weight Management | EPIC-012 | Scaling / Weight Management | ✅ CORRECT | - |
| US-069 | Queue Token Generation | EPIC-012 | Scaling / Weight Management | EPIC-012 | Scaling / Weight Management | ✅ CORRECT | - |
| US-070 | Weight Exit (Scale-out) | EPIC-012 | Scaling / Weight Management | EPIC-012 | Scaling / Weight Management | ✅ CORRECT | - |
| US-071 | View All Waiting Vehicles | EPIC-015 | Command Center Operations | EPIC-015 | Command Center Operations | ✅ CORRECT | - |
| US-072 | Assign Loading/Unloading Point | EPIC-015 | Command Center Operations | EPIC-015 | Command Center Operations | ✅ CORRECT | - |
| US-073 | Assignment Alert | EPIC-015 | Command Center Operations | EPIC-015 | Command Center Operations | ✅ CORRECT | - |
| US-074 | Assign Waiting Serial | EPIC-015 | Command Center Operations | EPIC-015 | Command Center Operations | ✅ CORRECT | - |
| US-075 | Load Start/End Time Entry | EPIC-013 | Loading / Unloading Operations | EPIC-013 | Loading / Unloading Operations | ✅ CORRECT | - |
| US-076 | Unload Start/End Time Entry | EPIC-013 | Loading / Unloading Operations | EPIC-013 | Loading / Unloading Operations | ✅ CORRECT | - |
| US-077 | Pre-QC Context Display | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-078 | Sample Creation | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-079 | Sample Labeling | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-080 | Exception Recording | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-081 | QC Context Display | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-082 | Sample Collection Event | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-083 | Configurable Form (Checklist) | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-084 | QR/Barcode Label | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-085 | Sampling Timestamp | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-086 | Create Lab Request | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-087 | Lab Estimated Completion | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-088 | Lab Report Upload | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-089 | Lab Status Monitoring | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-090 | QC Pass/Fail/Auto-pass Tracking | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-091 | Escalation Workflow | EPIC-014 | Quality Control & Quality Assurance | EPIC-014 | Quality Control & Quality Assurance | ✅ CORRECT | - |
| US-092 | Trip Management - Driver Interface | EPIC-016 | Mobile Interface (Driver / QC) | EPIC-016 | Mobile Interface (Driver / QC) | ✅ CORRECT | - |
| US-093 | QC Interface (Mobile) | EPIC-016 | Mobile Interface (Driver / QC) | EPIC-016 | Mobile Interface (Driver / QC) | ✅ CORRECT | - |
| US-094 | Vendor Application Access | EPIC-017 | Mobile Applications (Vendor) | EPIC-017 | Mobile Applications (Vendor) | ✅ CORRECT | - |
| US-095 | Product Master Data Management | EPIC-005 | Product Inventory Management (PIM) | EPIC-005 | Product Inventory Management (PIM) | ✅ CORRECT | - |

---

## Misassignment Analysis by Epic

### EPIC-003: Master Data & Configuration
**Current Story Count**: 4  
**Should Have**: 0  
**All 4 stories MISASSIGNED**

| Story | Issue | Correct Epic |
|-------|-------|--------------|
| US-010 | Port TR creation - belongs in Requisition epic | EPIC-007 |
| US-011 | Distribution approval - belongs in Distribution epic | EPIC-008 |
| US-012 | Procurement approval - belongs in Distribution epic | EPIC-008 |
| US-013 | Stock validation for TRs - belongs in Requisition epic | EPIC-007 |

**Impact**: EPIC-003 has no actual "master data" stories assigned. It contains requisition and approval workflow stories.

---

### EPIC-004: POI Management & Geofencing
**Current Story Count**: 9  
**Should Have**: 0  
**All 9 stories MISASSIGNED**

| Story | Issue | Correct Epic |
|-------|-------|--------------|
| US-014 | Capacity checking for TRs - belongs in Requisition | EPIC-007 |
| US-015 | TR assessment - belongs in TO Management | EPIC-009 |
| US-016 | Fleet availability - belongs in TO Management | EPIC-009 |
| US-017 | TO creation - belongs in TO Management | EPIC-009 |
| US-018 | TO creation by planner - belongs in TO Management | EPIC-009 |
| US-019 | TO execution vendor - belongs in TO Management | EPIC-009 |
| US-020 | TO execution own fleet - belongs in TO Management | EPIC-009 |
| US-021 | Trip lifecycle - belongs in TO Management | EPIC-009 |
| US-022 | Partial delivery - belongs in TO Management | EPIC-009 |

**Impact**: EPIC-004 has no POI or geofencing stories. Contains transport execution stories.

---

### EPIC-006: Fleet & Vehicle Management
**Current Story Count**: 10  
**Should Have**: 6  
**4 stories MISASSIGNED**

| Story | Status | Notes |
|-------|--------|-------|
| US-053 | ✅ CORRECT | Vehicle master data - belongs here |
| US-054 | ⚠️ MISASSIGNED to EPIC-014 | QC audit trail - not fleet related |
| US-055 | ⚠️ MISASSIGNED to EPIC-014 | QC vendor quality - not fleet related |
| US-056 | ⚠️ MISASSIGNED to EPIC-014 | QC compliance - not fleet related |
| US-057 | ✅ CORRECT | Driver master data - belongs here |
| US-058 | ✅ CORRECT | Fuel management - belongs here |
| US-059 | ✅ CORRECT | Trip costing - belongs here |
| US-060 | ✅ CORRECT | Profitability - belongs here |
| US-061 | ✅ CORRECT | Helper master data - belongs here |
| US-062 | ✅ CORRECT | Helper assignment - belongs here |

**Impact**: Contains 4 QC stories that should be in EPIC-014.

---

### EPIC-007: Product Transfer Requisition Management
**Current Story Count**: 4  
**Should Have**: 7  
**All 4 current stories MISASSIGNED, Missing 3 stories**

| Story | Issue | Notes |
|-------|-------|-------|
| US-026 | ⚠️ Misplaced - belongs in EPIC-015 | Real-time map is Command Center feature |
| US-027 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor registration is Vendor Management |
| US-028 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor performance is Vendor Management |
| US-029 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor payment is Vendor Management |

**Should Include** (currently misassigned elsewhere):
| Story | Currently In | Why It Belongs Here |
|-------|--------------|---------------------|
| US-010 | EPIC-003 | Port TR creation - core requisition workflow |
| US-013 | EPIC-003 | Stock validation for TRs - requisition validation |
| US-014 | EPIC-004 | Capacity checking for TRs - requisition validation |

**Impact**: This epic has NO requisition-related stories despite being named "Product Transfer Requisition Management".

---

### EPIC-008: Distribution & Procurement Management
**Current Story Count**: 5  
**Should Have**: 7  
**All 5 current stories MISASSIGNED, Missing 2 stories**

| Story | Issue | Notes |
|-------|-------|-------|
| US-030 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor fleet management is vendor-related |
| US-031 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor portal is vendor-related |
| US-032 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor rating is vendor-related |
| US-033 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor contract is vendor-related |
| US-034 | ⚠️ Misplaced - belongs in EPIC-010 | Vendor blacklist is vendor-related |

**Should Include** (currently misassigned elsewhere):
| Story | Currently In | Why It Belongs Here |
|-------|--------------|---------------------|
| US-011 | EPIC-003 | Distribution approval workflow - core to this epic |
| US-012 | EPIC-003 | Procurement approval workflow - core to this epic |

**Impact**: This epic contains NO distribution/procurement approval stories, only vendor management stories.

---

### EPIC-009: Transport Order (TO) Management
**Current Story Count**: 12  
**Should Have**: 21  
**10 stories MISASSIGNED, Missing 9 stories**

**Currently Assigned** (2 correct, 10 misassigned):
| Story | Status | Notes |
|-------|--------|-------|
| US-023 | ✅ CORRECT | Incident management |
| US-025 | ✅ CORRECT | Trip closure with POD |
| US-035 | ⚠️ Should be EPIC-011 | Gate-in at source |
| US-036 | ⚠️ Should be EPIC-011 | Gate-out at source |
| US-037 | ⚠️ Should be EPIC-011 | Gate-in at destination |
| US-038 | ⚠️ Should be EPIC-011 | Gate-out at destination |
| US-039 | ⚠️ Should be EPIC-012 | Scaling at source |
| US-040 | ⚠️ Should be EPIC-012 | Scaling at destination |
| US-041 | ⚠️ Should be EPIC-013 | Loading operations |
| US-042 | ⚠️ Should be EPIC-013 | Unloading operations |
| US-043 | ⚠️ Should be EPIC-015 | Command Center monitoring |
| US-044 | ⚠️ Should be EPIC-014 | QC lab testing |
| US-045 | ⚠️ Should be EPIC-014 | QC sample collection |
| US-046 | ⚠️ Should be EPIC-014 | QC test configuration |

**Should Include** (currently misassigned in EPIC-004):
| Story | Currently In | Why It Belongs Here |
|-------|--------------|---------------------|
| US-015 | EPIC-004 | TR assessment - TO planning activity |
| US-016 | EPIC-004 | Fleet availability - TO execution prerequisite |
| US-017 | EPIC-004 | TO creation (multiple) - core TO creation |
| US-018 | EPIC-004 | TO creation by planner - core TO creation |
| US-019 | EPIC-004 | TO execution vendor - core TO execution |
| US-020 | EPIC-004 | TO execution own fleet - core TO execution |
| US-021 | EPIC-004 | Trip lifecycle - core TO/trip management |
| US-022 | EPIC-004 | Partial delivery - TO/trip management |

**Impact**: Contains many operational stories (gate, scaling, loading, QC) that belong in specialized epics.

---

### EPIC-010: Vendor Management
**Current Story Count**: 6  
**Should Have**: 16  
**5 stories MISASSIGNED, Missing 10 stories**

**Currently Assigned**:
| Story | Status | Notes |
|-------|--------|-------|
| US-047 | ✅ CORRECT | Vendor registration |
| US-048 | ⚠️ Should be EPIC-014 | QC report - not vendor related |
| US-049 | ⚠️ Should be EPIC-014 | QC rejection - not vendor related |
| US-050 | ⚠️ Should be EPIC-014 | QC dashboard - not vendor related |
| US-051 | ⚠️ Should be EPIC-014 | QC checklist - not vendor related |
| US-052 | ⚠️ Should be EPIC-016 | Driver mobile - not vendor related |

**Should Include** (currently misassigned elsewhere):
| Story | Currently In | Why It Belongs Here |
|-------|--------------|---------------------|
| US-027 | EPIC-007 | Vendor registration & verification |
| US-028 | EPIC-007 | Vendor performance tracking |
| US-029 | EPIC-007 | Vendor payment management |
| US-030 | EPIC-008 | Vendor fleet management |
| US-031 | EPIC-008 | Vendor portal |
| US-032 | EPIC-008 | Vendor rating & reviews |
| US-033 | EPIC-008 | Vendor contract management |
| US-034 | EPIC-008 | Vendor blacklist management |

**Impact**: Contains many QC and mobile stories instead of actual vendor management stories.

---

### EPIC-014: Quality Control & Quality Assurance Workflow
**Current Story Count**: 15  
**Should Have**: 23  
**All 15 CORRECT, Missing 8 stories**

**Currently Assigned** (all correct):
- US-077 through US-091 (15 stories) - All correctly assigned

**Should Include** (currently misassigned elsewhere):
| Story | Currently In | Why It Belongs Here |
|-------|--------------|---------------------|
| US-044 | EPIC-009 | QC lab testing workflow - core QC |
| US-045 | EPIC-009 | QC sample collection - core QC |
| US-046 | EPIC-009 | QC test configuration - core QC |
| US-048 | EPIC-010 | QC report generation - QC documentation |
| US-049 | EPIC-010 | QC rejection workflow - QC process |
| US-050 | EPIC-010 | QC dashboard & analytics - QC monitoring |
| US-051 | EPIC-010 | QC checklist management - QC process |
| US-053b | EPIC-006 | QC certificate management - QC documentation |
| US-054 | EPIC-006 | QC audit trail - QC compliance |
| US-055 | EPIC-006 | QC vendor quality tracking - QC analytics |
| US-056 | EPIC-006 | QC compliance reporting - QC compliance |

**Impact**: Missing 11 QC-related stories that are scattered across other epics.

---

### EPIC-016: Mobile Interface (Driver / QC)
**Current Story Count**: 2  
**Should Have**: 3  
**All 2 CORRECT, Missing 1 story**

**Currently Assigned**:
- US-092: Trip Management - Driver Interface ✅
- US-093: QC Interface (Mobile) ✅

**Should Include**:
| Story | Currently In | Why It Belongs Here |
|-------|--------------|---------------------|
| US-052 | EPIC-010 | Driver Mobile Interface - mobile app story |

**Impact**: Missing driver mobile interface story that's in Vendor Management epic.

---

## Critical Path Impact Analysis

### Stories on Critical Path That Are MISASSIGNED

The critical path is: **EPIC-001 → EPIC-002 → EPIC-003 → EPIC-007 → EPIC-008 → EPIC-009 → EPIC-014**

**EPIC-003 (Master Data) - ALL 4 MISASSIGNED** 🔴 CRITICAL
- US-010 should be in EPIC-007 (Requisition)
- US-011 should be in EPIC-008 (Distribution)
- US-012 should be in EPIC-008 (Procurement)
- US-013 should be in EPIC-007 (Requisition)

**EPIC-007 (Product Requisition) - ALL 4 MISASSIGNED** 🔴 CRITICAL
- US-026 should be in EPIC-015 (Command Center)
- US-027 should be in EPIC-010 (Vendor)
- US-028 should be in EPIC-010 (Vendor)
- US-029 should be in EPIC-010 (Vendor)

**EPIC-008 (Distribution) - ALL 5 MISASSIGNED** 🔴 CRITICAL
- US-030, US-031, US-032, US-033, US-034 should all be in EPIC-010 (Vendor)

**EPIC-009 (Transport Order) - 10 of 12 MISASSIGNED** 🔴 CRITICAL
- Multiple gate, scaling, loading, QC stories misplaced

**Result**: **Critical path epics contain almost entirely WRONG stories**, blocking proper dependency and sprint planning.

---

## Issue Categories

### Category 1: Content Mismatch (48 stories)
Stories whose content doesn't match the assigned epic's purpose.

**Examples**:
- US-010 (Port TR Creation) in Master Data epic - should be in Requisition epic
- US-026 (Real-time Map) in Requisition epic - should be in Command Center epic
- US-035 to US-038 (Gate operations) in TO Management - should be in Gate Management epic
- US-048 to US-051 (QC stories) in Vendor Management - should be in QC epic

---

### Category 2: Logical Grouping Issues (48 stories)
Stories scattered across wrong epics instead of being grouped logically.

**Examples**:
- QC stories split across EPIC-006 (Fleet), EPIC-009 (TO), EPIC-010 (Vendor), EPIC-014 (QC)
- Vendor stories split across EPIC-007 (Requisition), EPIC-008 (Distribution)
- Gate stories in EPIC-009 instead of EPIC-011
- Approval workflows in EPIC-003 instead of EPIC-008

---

### Category 3: Dependency Confusion (15+ stories)
Misassignments that confuse the dependency chain.

**Examples**:
- EPIC-003 claims to block EPIC-007, but contains no master data stories
- EPIC-007 contains vendor stories instead of requisition stories
- EPIC-008 contains vendor stories instead of approval workflows

---

## Recommendations

### 1. Immediate Actions Required

**Priority 1 - Fix Critical Path Epics**:
1. **EPIC-003**: Remove all 4 stories (US-010 to US-013), add actual master data stories
2. **EPIC-007**: Remove all 4 vendor/command center stories, add requisition stories (US-010, US-013, US-014)
3. **EPIC-008**: Remove all 5 vendor stories, add approval stories (US-011, US-012)
4. **EPIC-009**: Keep only core TO/trip stories (US-023, US-025, US-015 to US-022), move operational stories out

**Priority 2 - Fix Specialized Epics**:
5. **EPIC-004**: Currently contains all TO execution stories - should be POI/geofencing only
6. **EPIC-010**: Add all vendor stories (currently scattered in EPIC-007, EPIC-008)
7. **EPIC-011**: Contains correct gate stories - keep as is
8. **EPIC-014**: Add all QC stories (currently scattered in EPIC-006, EPIC-009, EPIC-010)

### 2. Epic Restructuring Needed

**EPIC-003: Master Data & Configuration** - EMPTY after corrections
- This epic has no actual master data stories
- Either add master data stories or merge with another epic
- Currently blocks EPIC-007 but contains requisition stories

**EPIC-004: POI Management & Geofencing** - EMPTY after corrections
- This epic has no POI or geofencing stories
- All stories are transport order execution stories
- Consider renaming or repurposing

### 3. Story Redistribution Summary

**Stories to Move TO EPIC-007 (Product Transfer Requisition)**:
- US-010 (from EPIC-003)
- US-013 (from EPIC-003)
- US-014 (from EPIC-004)

**Stories to Move TO EPIC-008 (Distribution & Procurement)**:
- US-011 (from EPIC-003)
- US-012 (from EPIC-003)

**Stories to Move TO EPIC-009 (Transport Order Management)**:
- US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-022 (all from EPIC-004)

**Stories to Move TO EPIC-010 (Vendor Management)**:
- US-027, US-028, US-029 (from EPIC-007)
- US-030, US-031, US-032, US-033, US-034 (from EPIC-008)

**Stories to Move TO EPIC-011 (Gate Management)**:
- US-035, US-036, US-037, US-038 (from EPIC-009)

**Stories to Move TO EPIC-012 (Scaling / Weight Management)**:
- US-039, US-040 (from EPIC-009)

**Stories to Move TO EPIC-013 (Loading / Unloading Operations)**:
- US-041, US-042 (from EPIC-009)

**Stories to Move TO EPIC-014 (Quality Control)**:
- US-044, US-045, US-046 (from EPIC-009)
- US-048, US-049, US-050, US-051 (from EPIC-010)
- US-053b, US-054, US-055, US-056 (from EPIC-006)

**Stories to Move TO EPIC-015 (Command Center Operations)**:
- US-026, US-043 (from EPIC-007 and EPIC-009)

**Stories to Move TO EPIC-016 (Mobile Interface - Driver/QC)**:
- US-052 (from EPIC-010)

---

## Impact Assessment

### Sprint Planning Impact

**Current State**:
- Sprint assignments are based on incorrect epic dependencies
- Stories grouped in wrong epics lead to inefficient sprint execution
- Teams working on an "epic" are actually working on unrelated stories

**After Correction**:
- Clear epic boundaries enable proper team allocation
- Sprint planning aligns with actual feature dependencies
- Parallel work possible when epics are properly structured

### Dependency Chain Impact

**Current Problems**:
- EPIC-003 blocks EPIC-007 but contains requisition stories that belong in EPIC-007
- EPIC-007 blocks EPIC-008 but contains vendor stories that belong in EPIC-010
- EPIC-008 blocks EPIC-009 but contains vendor stories instead of approval workflows

**After Correction**:
- Clear dependency flow: Requisition → Approval → TO Creation → Execution
- Proper epic sequence enables waterfall-style completion
- Reduced cross-epic dependencies

### Team Allocation Impact

**Current Problems**:
- "QC Team" work is scattered across 5 different epics
- "Vendor Team" work is scattered across 3 different epics
- "Gate Operations Team" stories mixed into Transport Order epic

**After Correction**:
- Each team can focus on their epic
- Clear ownership and accountability
- Easier progress tracking per team

---

## Validation Checklist

Use this checklist when reassigning stories:

### Per Story:
- [ ] Story title matches epic name/scope
- [ ] Story content aligns with epic business context
- [ ] Story dependencies align with epic dependencies
- [ ] Story sprint assignment aligns with epic sprint
- [ ] Story tags reflect correct epic category

### Per Epic:
- [ ] All assigned stories share common theme
- [ ] Epic blocks correctly reflect story dependencies
- [ ] Epic story points sum matches actual story assignments
- [ ] Epic user story count matches actual assignments
- [ ] No orphaned stories (every story has correct epic)

---

## Next Steps

### Step 1: Update Story Frontmatter (48 stories)
For each misassigned story, update YAML frontmatter:
```yaml
epic_id: EPIC-XXX  # Update to correct epic ID
epic_name: Correct Epic Name  # Update to correct epic name
```

### Step 2: Update Epic Story Lists (17 epics)
For each epic file, update the "User Stories" section to reflect correct story assignments.

### Step 3: Recalculate Epic Story Points
After reassignment, recalculate story points per epic:
- Current story points in epic files are incorrect
- Sum story points from correctly assigned stories
- Update epic frontmatter `story_points` field

### Step 4: Validate Dependencies
After reassignment, verify:
- Epic dependencies still make sense
- Story dependencies align with epic dependencies
- No circular dependencies introduced

### Step 5: Update Sprint Assignments
Review sprint assignments after epic corrections:
- Stories in same epic should be in nearby sprints
- Critical path stories should be in sequential sprints
- Parallel epics can have overlapping sprints

---

## Appendix A: Story-Epic Mapping by Functional Area

### Authentication & Security (EPIC-001, EPIC-002)
- ✅ US-001, US-002, US-003, US-004 (EPIC-001)
- ✅ US-005, US-006, US-007, US-008, US-009 (EPIC-002)
- **All correctly assigned**

### Product Master Data (EPIC-005)
- ✅ US-095 (EPIC-005)
- **Correctly assigned**

### Fleet & Vehicle Management (EPIC-006)
- ✅ US-053, US-057, US-058, US-059, US-060, US-061, US-062 (EPIC-006)
- ⚠️ REMOVE: US-054, US-055, US-056, US-053b (move to EPIC-014)

### Product Transfer Requisition (EPIC-007)
- ⚠️ REMOVE ALL: US-026, US-027, US-028, US-029
- ✅ ADD: US-010, US-013, US-014

### Distribution & Procurement (EPIC-008)
- ⚠️ REMOVE ALL: US-030, US-031, US-032, US-033, US-034
- ✅ ADD: US-011, US-012

### Transport Order Management (EPIC-009)
- ✅ KEEP: US-023, US-025
- ✅ ADD: US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-022
- ⚠️ REMOVE: US-035, US-036, US-037, US-038, US-039, US-040, US-041, US-042, US-043, US-044, US-045, US-046

### Vendor Management (EPIC-010)
- ✅ KEEP: US-047
- ✅ ADD: US-024, US-027, US-028, US-029, US-030, US-031, US-032, US-033, US-034
- ⚠️ REMOVE: US-048, US-049, US-050, US-051, US-052

### Gate Management (EPIC-011)
- ✅ US-063, US-064, US-065, US-066, US-067 (EPIC-011)
- ✅ ADD: US-035, US-036, US-037, US-038
- **Correct epic but missing gate stories from EPIC-009**

### Scaling / Weight Management (EPIC-012)
- ✅ US-068, US-069, US-070 (EPIC-012)
- ✅ ADD: US-039, US-040
- **Correct epic but missing scaling stories from EPIC-009**

### Loading / Unloading Operations (EPIC-013)
- ✅ US-075, US-076 (EPIC-013)
- ✅ ADD: US-041, US-042
- **Correct epic but missing stories from EPIC-009**

### Quality Control (EPIC-014)
- ✅ US-077 through US-091 (15 stories)
- ✅ ADD: US-044, US-045, US-046, US-048, US-049, US-050, US-051, US-053b, US-054, US-055, US-056
- **Should be largest epic with 26 stories**

### Command Center Operations (EPIC-015)
- ✅ US-071, US-072, US-073, US-074 (EPIC-015)
- ✅ ADD: US-026, US-043
- **Correct epic but missing command center stories**

### Mobile Interface (EPIC-016)
- ✅ US-092, US-093 (EPIC-016)
- ✅ ADD: US-052
- **Correct epic but missing driver mobile story**

### Mobile Applications - Vendor (EPIC-017)
- ✅ US-094 (EPIC-017)
- **Correctly assigned**

---

## Appendix B: Proposed Epic Story Counts (After Correction)

| Epic ID | Epic Name | Current Stories | Correct Stories | Change |
|---------|-----------|----------------|-----------------|--------|
| EPIC-001 | System Foundation | 4 | 4 | No change ✅ |
| EPIC-002 | User & Tenant Foundation | 5 | 5 | No change ✅ |
| EPIC-003 | Master Data & Configuration | 4 | 0 | -4 (EMPTY) 🔴 |
| EPIC-004 | POI Management & Geofencing | 9 | 0 | -9 (EMPTY) 🔴 |
| EPIC-005 | Product Inventory Management | 1 | 1 | No change ✅ |
| EPIC-006 | Fleet & Vehicle Management | 10 | 6 | -4 (remove QC stories) |
| EPIC-007 | Product Transfer Requisition | 4 | 3 | -1 (net: remove 4, add 3) |
| EPIC-008 | Distribution & Procurement | 5 | 2 | -3 (net: remove 5, add 2) |
| EPIC-009 | Transport Order Management | 12 | 10 | -2 (net: remove 12, add 10) |
| EPIC-010 | Vendor Management | 6 | 10 | +4 (net: remove 5, add 9) |
| EPIC-011 | Gate Management | 5 | 9 | +4 (add gate stories from EPIC-009) |
| EPIC-012 | Scaling / Weight Management | 3 | 5 | +2 (add scaling from EPIC-009) |
| EPIC-013 | Loading / Unloading | 2 | 4 | +2 (add from EPIC-009) |
| EPIC-014 | Quality Control | 15 | 26 | +11 (consolidate all QC stories) |
| EPIC-015 | Command Center Operations | 4 | 6 | +2 (add command center stories) |
| EPIC-016 | Mobile Interface (Driver/QC) | 2 | 3 | +1 (add driver mobile) |
| EPIC-017 | Mobile Applications (Vendor) | 1 | 1 | No change ✅ |
| **TOTAL** | **All Epics** | **72** | **72** | **Redistributed** |

---

## Appendix C: Misassignment Root Causes

### Root Cause 1: Overstuffed "Umbrella" Epics
- **EPIC-004** and **EPIC-009** became catch-all epics for transport-related stories
- Stories were assigned based on high-level category (transport) rather than specific function
- Result: Epics lost focus and became unmanageable

### Root Cause 2: Misunderstanding of Epic Scope
- **EPIC-003** (Master Data) contains requisition workflows instead of master data CRUD
- **EPIC-007** (Product Requisition) contains vendor management instead of requisition creation
- Epic names didn't match assigned story content

### Root Cause 3: Dependency-Based Assignment
- Stories assigned to epics they depend on rather than their functional area
- Example: QC stories in TO Management epic because QC depends on TOs
- Should be: QC stories in EPIC-014, with dependency on EPIC-009

### Root Cause 4: Lack of Clear Epic Boundaries
- No clear definition of what belongs in each epic
- Overlapping epic scopes (e.g., EPIC-007, EPIC-008, EPIC-009 all contain transport-related stories)
- Need clearer epic charters

---

## Glossary

- **✅ CORRECT**: Story is correctly assigned to appropriate epic
- **⚠️ MISASSIGNED**: Story content doesn't match assigned epic purpose
- **🔴 CRITICAL**: Misassignment impacts critical path or blocks multiple stories
- **TR**: Transport Requisition
- **TO**: Transport Order
- **POI**: Point of Interest
- **QC**: Quality Control
- **FG**: Finished Goods
- **RM**: Raw Materials

---

**End of Report**

**Recommendations**: 
1. Review and approve proposed reassignments
2. Execute bulk story frontmatter updates
3. Update epic files with correct story lists and story points
4. Validate dependencies after reassignment
5. Re-sequence sprint assignments if needed

**Contact**: Product Management Team  
**Next Review**: After reassignment completion
