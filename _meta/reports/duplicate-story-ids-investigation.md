# Duplicate Story IDs Investigation Report

**Date**: February 27, 2026  
**Issue**: Backlog contains 97 story files but some IDs are duplicated  
**Related**: specs-backlog-alignment-analysis.md (Finding #2.1)

---

## Summary

Investigation reveals **3 duplicate/variant story IDs** causing the 97 vs 95 discrepancy:

| Story ID | Count | Files Found |
|----------|-------|-------------|
| US-053 | 2 | US-053 (Vehicle Registration), US-053b (QC Certificate) |
| US-071 | 2 | US-071 (TO Dispatch Calendar), US-071 (View Waiting Vehicles) |
| US-072 | 2 | US-072 (Loading/Unloading Point), US-072 (TR Conjoinment) |

**Total**: 94 unique story numbers + 3 variants = 97 files

---

## Detailed Findings

### 1. US-053 Variants

**US-053-vehicle-registration-master-data.md**:
- Standard vehicle registration story
- Epic: Fleet Management
- Mapped in INDEX.md: ✅ Yes (02-master-data, 06-fleet-management)

**US-053b-qc-certificate-management.md**:
- QC certificate generation and tracking
- Epic: QC Workflow (presumably)
- Mapped in INDEX.md: ❌ No
- **Action Required**: Add to INDEX.md under 04-poi-operations/qc-workflow

---

### 2. US-071 Duplicates

**US-071-to-dispatch-planning-calendar-view.md**:
- Calendar-based TO dispatch and planning interface
- Epic: Command Center Operations
- Mapped in INDEX.md: Partially (listed as "US-071-076: Command Center")

**US-071-view-all-waiting-vehicles.md**:
- View vehicles waiting at POI for loading/unloading
- Epic: Command Center Operations
- Mapped in INDEX.md: ❌ No (same ID collision)

**Issue**: **Story ID collision** - Two different features using same ID

**Severity**: **HIGH**

**Recommendation**:
```
Option 1: Renumber one story
  - Keep US-071: TO Dispatch Calendar
  - Rename US-071b → US-071-view-waiting to US-095

Option 2: Merge if features overlap
  - Review both stories to check if "view waiting vehicles" is 
    part of the calendar view feature
  - If yes: Merge into single US-071
  - If no: Renumber second story to US-095

Option 3: Mark one as deprecated
  - If one story supersedes the other
```

---

### 3. US-072 Duplicates

**US-072-assign-loading-unloading-point.md**:
- Assign specific loading/unloading point to vehicle at POI
- Epic: Command Center Operations
- Mapped in INDEX.md: Partially (listed in "US-071-076: Command Center")

**US-072-tr-conjoinment.md**:
- Combine multiple TRs into single TO (conjoinment/consolidation)
- Epic: Transport Operations
- Mapped in INDEX.md: ❌ No (same ID collision)

**Issue**: **Story ID collision** - Two completely different features

**Severity**: **HIGH**

**Recommendation**:
```
Option 1: Renumber TR Conjoinment
  - Keep US-072: Assign Loading Point (fits US-071-076 range)
  - Rename US-072-tr-conjoinment to US-096
  - Add to 03-operations/transport-requisition-management

Option 2: Renumber Loading Point Assignment
  - If TR Conjoinment is higher priority
  - Keep US-072: TR Conjoinment
  - Rename US-072-assign-loading to US-095 or US-096
```

---

## Impact Analysis

### On Story Count
- **Expected**: US-001 to US-094 = 94 stories
- **Actual**: 94 baseline + 3 variants (053b, 071 duplicate, 072 duplicate) = 97 files
- **INDEX.md claim**: "95 stories in Phase-1 backlog"
  - This was likely counting US-053b but not the US-071/US-072 duplicates

### On Traceability
**Problems**:
1. **Ambiguous references**: When specifications or dependencies reference "US-071" or "US-072", which story do they mean?
2. **Incomplete mapping**: INDEX.md doesn't account for all 3 variants
3. **Sprint planning confusion**: Which US-071/US-072 gets implemented when?

### On Implementation
**Risks**:
1. Developers may implement wrong feature based on ID reference
2. Testing may miss one of the duplicate stories
3. Story point estimates may be incorrect (double-counting or missing)

---

## Recommended Actions

### Immediate (Before Sprint 1)

**1. Resolve US-071 Collision**

**Investigate**: Are these two separate features or one feature?

```bash
# Read both stories
- US-071-to-dispatch-planning-calendar-view.md
- US-071-view-all-waiting-vehicles.md

# Check if "view waiting vehicles" is part of calendar view
# or a separate standalone feature
```

**Decision Required**:
- If merged: Combine into single US-071 with both acceptance criteria
- If separate: Renumber second story to US-095

---

**2. Resolve US-072 Collision**

**These are clearly separate features**:
- US-072-assign-loading: Command Center / POI Operations
- US-072-tr-conjoinment: Transport Requisition / Core Operations

**Recommendation**: Renumber TR Conjoinment
```
Rename: US-072-tr-conjoinment.md → US-096-tr-conjoinment.md

Rationale:
- US-072-assign-loading fits naturally in US-071-076 (Command Center) range
- TR Conjoinment is a core operations feature, can be US-096
- Maintains logical grouping in backlog
```

---

**3. Add US-053b to INDEX.md**

**Action**: Add mapping to INDEX.md

```markdown
### [04-poi-operations/](../../05-modules/06-poi-operations/README.md) - Operations Support

#### Related User Stories
- US-026, US-035-046: Gate, Scaling, Loading operations
- US-044-056, US-077-090: QC workflows
- US-053b: QC Certificate Management  ← ADD THIS
- US-063-070: Gate & Scaling management
- US-071-076: Command Center, Loading/Unloading
```

Also add to 04-poi-operations/qc-workflow.md specification.

---

## Proposed Resolution Plan

### Week 1, Day 1 (2 hours)

**Step 1**: Read both US-071 stories
- Determine if they should be merged or renumbered
- Stakeholder decision if needed

**Step 2**: Renumber US-072-tr-conjoinment to US-096
```bash
cd 03-backlog/02-stories
git mv US-072-tr-conjoinment.md US-096-tr-conjoinment.md

# Update story frontmatter
# story_id: US-096
# dependencies: Update any US-072 references to US-096
```

**Step 3**: Handle US-071 based on Step 1 decision
- Option A: Merge files if same feature
- Option B: Renumber second US-071 to US-095

**Step 4**: Add US-053b to INDEX.md
- Map to 04-poi-operations/qc-workflow
- Update specification cross-references

**Step 5**: Update all story references
- Search for "US-071" and "US-072" in all files
- Clarify which story is referenced
- Update to use correct story ID

---

## Files Requiring Updates

### After Renumbering

**If US-072-tr-conjoinment → US-096**:
- [ ] Story file: `US-072-tr-conjoinment.md` → `US-096-tr-conjoinment.md`
- [ ] Story frontmatter: `story_id: US-096`
- [ ] INDEX.md: Add US-096 to 03-operations section
- [ ] Any specifications referencing TR conjoinment
- [ ] Any dependency chains (stories that depend on TR conjoinment)
- [ ] Phase planning documents

**If US-071 renumbered to US-095**:
- [ ] Story file: Rename to `US-095-*.md`
- [ ] Story frontmatter: `story_id: US-095`
- [ ] INDEX.md: Clarify US-071 vs US-095 in Command Center section
- [ ] Update US-071-076 range description
- [ ] Specification cross-references
- [ ] Dependency chains

---

## Verification Checklist

After resolution:
- [ ] All story IDs are unique (no duplicates)
- [ ] Story count: 94 unique baseline + US-053b + 2 renumbered = 97 files
- [ ] INDEX.md accounts for all 97 stories
- [ ] No ambiguous story ID references in specifications
- [ ] All dependencies use correct story IDs
- [ ] Phase planning documents updated
- [ ] Traceability matrix reflects new IDs

---

## Conclusion

The "2 unmapped stories" issue is actually **3 duplicate story IDs**:
- US-053b (valid variant, just not mapped)
- US-071 (2 files with same ID - collision)
- US-072 (2 files with same ID - collision)

**Priority**: **HIGH** - Must resolve before Sprint 1 to avoid implementation confusion

**Estimated Effort**: 2-3 hours (investigation + renumbering + updates)

**Next Steps**:
1. Stakeholder review of US-071 duplicates
2. Rename US-072-tr-conjoinment to US-096
3. Add US-053b to INDEX.md
4. Update all cross-references

---

**Report Generated**: 2026-02-27  
**Status**: Investigation Complete, Resolution Pending  
**Related Issues**: specs-backlog-alignment-analysis.md (#2.1, #3.3)
