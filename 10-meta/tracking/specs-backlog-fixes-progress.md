# Specs-Backlog Alignment Fixes - Progress Report

**Date Started**: February 27, 2026  
**Status**: In Progress  
**Related Analysis**: specs-backlog-alignment-analysis.md

---

## Progress Summary

| Priority | Issue | Status | Effort | Completed |
|----------|-------|--------|--------|-----------|
| **CRITICAL** | Module folder naming mismatch | ✅ **COMPLETE** | 1 hour | 2026-02-27 |
| **CRITICAL** | Missing 04-poi-operations in INDEX | ✅ **COMPLETE** | 30 min | 2026-02-27 |
| **HIGH** | Identify 2 unmapped stories | ✅ **COMPLETE** | 1.5 hours | 2026-02-27 |
| **HIGH** | Resolve US-052 vs US-092 duplication | 🔄 **PENDING** | 2 hours | - |
| **HIGH** | Verify US-073 exists | 🔄 **PENDING** | 4-6 hours | - |
| **HIGH** | Trusted device management gap | 🔄 **PENDING** | 3-4 hours | - |
| **HIGH** | On-demand TO spec gap | 🔄 **PENDING** | 3-4 hours | - |
| **HIGH** | US-053b unclear mapping | 🔄 **PENDING** | 1 hour | - |
| **MEDIUM** | Fix US-071 duplicate reference | 🔄 **PENDING** | 1 hour | - |
| **MEDIUM** | Vehicle capacity units | 🔄 **PENDING** | 2 hours | - |

**Completed**: 3/10 (30%)  
**Time Spent**: ~3 hours  
**Time Remaining**: ~20-25 hours

---

## Completed Work

### 1. ✅ Module Folder Naming Mismatch (CRITICAL)

**Issue**: INDEX.md referenced wrong folder names causing path resolution failures

**Changes Made**:
- Updated INDEX.md to use actual folder names:
  - `03-core-operations/` → `03-operations/`
  - `04-operations-support/` → `04-poi-operations/`
  - `07-mobile-interfaces/` → `07-mobile-apps/`
  - `08-reporting-analytics/` → `08-reporting/`
  - `09-non-functional/` → `09-cross-cutting/`
- Updated all specification file paths (41 paths)
- Fixed cross-reference dependencies
- Updated dependency matrix table
- Fixed critical path module list

**Files Changed**: `03-module-specifications/INDEX.md`

**Commit**: `059a194` - "fix: Update INDEX.md module folder names to match actual structure"

**Impact**: ✅ All path references now resolve correctly

---

### 2. ✅ Missing 04-poi-operations in INDEX (CRITICAL)

**Issue**: 04-poi-operations/ folder existed but wasn't documented as separate module

**Resolution**: The issue was actually part of #1 - it was documented but using the wrong name (04-operations-support). Fixed by renaming references in INDEX.md.

**Impact**: ✅ POI operations module now properly documented with correct path

---

### 3. ✅ Identify 2 Unmapped Stories

**Issue**: Backlog has 97 stories, INDEX.md claims 95

**Investigation Results**:
- Found 3 duplicate/variant story IDs:
  1. **US-053b** - QC Certificate Management (valid variant, not mapped to INDEX)
  2. **US-071** - Two different files with same ID (collision)
  3. **US-072** - Two different files with same ID (collision)

**Created**: `duplicate-story-ids-investigation.md` - Comprehensive report

**Files**: 
- `US-053-vehicle-registration-master-data.md` ✅ Mapped
- `US-053b-qc-certificate-management.md` ❌ Not mapped
- `US-071-to-dispatch-planning-calendar-view.md` ⚠️ Partially mapped
- `US-071-view-all-waiting-vehicles.md` ❌ Not mapped (collision)
- `US-072-assign-loading-unloading-point.md` ⚠️ Partially mapped
- `US-072-tr-conjoinment.md` ❌ Not mapped (collision)

**Recommendations Provided**:
- Add US-053b to INDEX.md (04-poi-operations/qc-workflow)
- Resolve US-071 collision (merge or renumber to US-095)
- Rename US-072-tr-conjoinment to US-096
- Update all cross-references

**Commit**: `b198f91` - "docs: Document duplicate story ID investigation findings"

**Impact**: ✅ Issue identified and documented, ready for resolution

---

## Pending Work

### 4. 🔄 Resolve US-052 vs US-092 Duplication (HIGH)

**Issue**: Two driver interface stories with ~60% overlap

**Stories**:
- US-052: Driver Mobile Interface (679 lines, 8 points, Sprint 9)
- US-092: Trip Management - Driver Interface (150 lines, 8 points, Sprint 11)

**Overlap**:
- Both describe viewing assigned trips
- Both describe updating trip status
- Both mention mobile-responsive interface
- Both mention route navigation

**US-052 Unique**: POD capture, offline mode, incident reporting, GPS tracking

**Action Required**:
1. Read both stories in detail
2. Determine if they should be:
   - **Merged**: Combine US-092 into US-052
   - **Split**: Define clear scope boundaries
   - **Deprecated**: Mark one as obsolete
3. Update module specifications
4. Update INDEX.md mapping

**Estimated Effort**: 2 hours + stakeholder decision

**Blocker**: Requires stakeholder decision on merge vs split

---

### 5. 🔄 Verify US-073 Exists and Complete Definition (HIGH)

**Issue**: US-010 depends on US-073 (Requisition Transfer Type Configuration) but it's incompletely defined

**US-010 Dependencies**:
```
AC-1: System SHALL dynamically load Port Consignment-specific form fields 
      based on selected transfer type (per US-073)
AC-2: System SHALL route to Procurement approval workflow (per US-073 
      transfer type logic)
```

**Action Required**:
1. Check if `US-073-*.md` file exists in backlog
2. If exists: Verify completeness and add to INDEX.md
3. If missing: Create complete US-073 story with:
   - Transfer type enumeration
   - Dynamic form field mapping
   - Approval workflow routing rules
   - LC requirement flags
   - Shipping document requirements
   - Configuration UI for admin
4. Add section to `product-requisition-management.md` specification

**Estimated Effort**: 4-6 hours

**Blocker**: US-010 cannot be implemented without US-073

---

### 6. 🔄 Trusted Device Management Feature Gap (HIGH)

**Issue**: Feature described in `authentication-security.md` but no user story

**Specification Features**:
- "Remember this device for 30 days" checkbox
- Device fingerprinting (browser + OS + screen resolution)
- IP subnet tracking
- User can view/revoke trusted devices in profile

**Action Required**:
1. Stakeholder decision: MVP or Phase 2+?
2. If MVP:
   - Option A: Create US-095 (Trusted Device Management)
   - Option B: Add to US-002 (MFA) as acceptance criteria
3. If Phase 2+:
   - Mark in specification as "Phase 2 enhancement"
   - Remove from US-001/US-002/US-003 scope

**Estimated Effort**: 3-4 hours (new story) OR 1 hour (add to US-002) OR 30 min (mark as Phase 2)

**Blocker**: Requires stakeholder decision

---

### 7. 🔄 Document On-Demand TO Creation Flow (HIGH)

**Issue**: Stories US-064 and US-065 exist but flow not in specifications

**Stories**:
- US-064: On-Demand TO Dealer Entry
- US-065: On-Demand TO Supplier Entry

**Specification Gap**: `transport-order-management.md` covers standard TO creation from TRs, missing on-demand flow

**Action Required**:
1. Read US-064 and US-065 in detail
2. Add section to `03-operations/transport-order-management.md`:
   ```markdown
   ## On-Demand TO Creation
   
   ### Scenario
   Vehicles arrive at gate without pre-existing TR/TO
   
   ### Workflow
   1. Gate officer searches by challan/vehicle
   2. No TO found → "Create On-Demand TO" option
   3. Officer enters: Dealer/Supplier, Source POI, Product, Quantity
   4. System creates TO with status "On-Demand - Pending Approval"
   5. Admin reviews and approves
   
   ### Validation Rules
   - BR-TO-OD-001: Requires admin approval
   - BR-TO-OD-002: Cannot create if matching TO exists
   - BR-TO-OD-003: Source POI must match gate POI
   
   ### Related Stories
   - US-063: Gate-in lookup (triggers flow)
   - US-064: On-demand TO for dealers
   - US-065: On-demand TO for suppliers
   ```

**Estimated Effort**: 3-4 hours

---

### 8. 🔄 US-053b Unclear Mapping (HIGH)

**Issue**: US-053b (QC Certificate Management) exists but not mapped to INDEX.md

**Action Required**:
1. Add to INDEX.md under `04-poi-operations/` section:
   ```markdown
   #### Related User Stories
   - US-044-056, US-077-090: QC workflows
   - US-053b: QC Certificate Management  ← ADD THIS
   ```
2. Update `04-poi-operations/qc-workflow.md` specification to include certificate management
3. Verify story completeness

**Estimated Effort**: 1 hour

---

### 9. 🔄 Fix US-071 Duplicate Reference (MEDIUM)

**Issue**: US-071 appears twice in INDEX.md with different descriptions

**INDEX References**:
- Line 70: "US-071: TO Dispatch & Planning (Calendar View)"
- Line 133: "US-071-076: Command Center, Loading/Unloading"

**Action Required**:
1. Clarify if US-071-076 is a range (US-071, US-072, US-073, US-074, US-075, US-076)
2. If range: List stories individually with titles in INDEX
3. If not range: Remove duplicate reference
4. Resolve US-071 file collision (see Pending Work #4)

**Estimated Effort**: 1 hour

---

### 10. 🔄 Standardize Vehicle Capacity Units (MEDIUM)

**Issue**: US-053 uses tons, US-014 uses kilograms

**Conflicts**:
- US-053: `capacity_tonnage: Decimal` (tons)
- US-014: `standard_capacity_kg: Decimal` (kg)

**Action Required**:
1. Choose standard unit: **kilograms** (recommendation)
2. Update US-053 data model:
   ```typescript
   Vehicle {
     capacity_kg: Decimal  // Max Load Capacity in KG
     // Display as tons in UI: capacity_kg / 1000
   }
   ```
3. Update US-014 to reference `vehicle.capacity_kg`
4. Add conversion note in specifications
5. Document standard in data dictionary

**Estimated Effort**: 2 hours

---

## Next Steps

### Immediate (Can Complete Without Stakeholder)

1. **Add US-053b to INDEX.md** (1 hour)
   - Low risk, clear action
   
2. **Fix US-071 duplicate reference** (1 hour)
   - Technical cleanup
   
3. **Standardize vehicle capacity units** (2 hours)
   - Clear decision, update stories

4. **Document on-demand TO flow** (3-4 hours)
   - Based on existing stories US-064/US-065

**Estimated Time**: 7-8 hours

---

### Requires Stakeholder Decision

1. **Resolve US-052 vs US-092** (2 hours + decision)
   - Need: Merge or split decision
   
2. **US-073 completeness** (4-6 hours)
   - Need: Verify if story exists or create

3. **Trusted device management** (1-4 hours)
   - Need: MVP or Phase 2 decision

**Estimated Time**: 7-12 hours (after decisions)

---

## Recommended Timeline

### Week 1 Completion (This Week)

**Days 1-2** (Already Done):
- ✅ Fix INDEX.md path issues
- ✅ Identify unmapped stories
- ✅ Document findings

**Days 3-4** (Can Complete Now):
- Add US-053b to INDEX
- Fix US-071 reference
- Standardize capacity units
- Document on-demand TO flow

**Day 5**:
- Prepare stakeholder decisions
- Create decision document

**Expected Completion**: 4-5 technical issues resolved

---

### Week 2 (After Stakeholder Input)

- Resolve US-052/US-092 based on decision
- Complete or create US-073
- Address trusted device management
- Final verification

**Expected Completion**: All HIGH priority issues resolved

---

## Success Metrics

**Target**: Resolve all CRITICAL and HIGH priority issues before Sprint 1

**Current Status**:
- CRITICAL: 2/2 complete (100%) ✅
- HIGH: 1/6 complete (17%) 🔄
- MEDIUM: 0/2 complete (0%) 🔄

**Overall**: 3/10 complete (30%)

**On Track**: Yes, if stakeholder decisions received by Week 2

---

**Last Updated**: 2026-02-27  
**Next Review**: After completing immediate actions (US-053b, US-071, capacity units, on-demand TO)
