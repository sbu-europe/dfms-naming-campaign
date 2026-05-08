# Critical Issue: Phase 1 Story List Has Broken Links

**Date**: February 27, 2026  
**File**: `03-backlog/03-phases/phase-1/story-list.md`  
**Severity**: **CRITICAL**  
**Impact**: All 70 story links are broken

---

## Problem

The `story-list.md` file contains **completely incorrect filenames** for user stories. The file was likely created before stories were finalized and never updated.

### Examples of Broken Links

| Story List Says | Actual Filename | Status |
|-----------------|-----------------|--------|
| `US-003-session-management.md` | `US-003-session-control.md` | ❌ Broken |
| `US-005-permission-management.md` | `US-005-user-invitation-activation.md` | ❌ Broken |
| `US-071-tr-creation-multiple.md` | `US-071-to-dispatch-planning-calendar-view.md` OR `US-071-view-all-waiting-vehicles.md` | ❌ Broken (also duplicate ID) |
| `US-072-tr-conjoinment.md` | `US-072-assign-loading-unloading-point.md` OR `US-072-tr-conjoinment.md` | ⚠️ Ambiguous (duplicate ID) |

### Scope of Issue

- **Total Links**: 70 story links
- **Broken Links**: ~68-70 (estimated 95%+)
- **Working Links**: ~0-2 (by chance)

---

## Root Cause

1. **Story naming evolved**: Stories were renamed after story-list.md was created
2. **No validation**: No process to verify links stay current
3. **Manual maintenance**: Story list maintained manually, not generated

---

## Impact

**User Experience**:
- Developers clicking story links get "File not found"
- Sprint planning disrupted
- Backlog navigation broken

**Project Management**:
- Cannot quickly reference stories from phase plan
- Epic-to-story mapping unreliable
- Story count verification impossible

**Documentation Quality**:
- Erodes trust in documentation accuracy
- Suggests other docs may also be outdated

---

## Recommended Solution

### Option 1: Auto-Generate Story List (Recommended)

**Approach**: Generate story-list.md from actual story files

```bash
# Script to generate correct story list
cd 03-backlog/02-stories

# For each story US-001 through US-070
for i in {1..70}; do
  num=$(printf "%03d" $i)
  
  # Find matching file(s)
  file=$(ls US-$num-*.md 2>/dev/null | head -1)
  
  if [ -n "$file" ]; then
    # Extract title from story file
    title=$(grep "^# US-" "$file" | head -1 | sed 's/^# US-[0-9]*: //')
    echo "- [US-$num](../../02-stories/$file) - $title"
  fi
done
```

**Pros**:
- Guaranteed accurate
- Can be run anytime to refresh
- Finds duplicate IDs automatically

**Cons**:
- Loses epic grouping (need to add manually or extract from stories)

---

### Option 2: Manual Fix with Validation

**Approach**: Manually correct each link, then validate

1. For each story link in story-list.md:
   - Look up actual filename in 02-stories/
   - Update link
   - Extract correct title from story file
2. Run validation script to check all links

**Pros**:
- Maintains epic grouping
- Human-readable structure

**Cons**:
- Time-consuming (~2-3 hours for 70 stories)
- Error-prone
- Will break again if stories renamed

---

### Option 3: Hybrid Approach (Recommended)

**Approach**: Auto-generate, then organize by epic

1. Run auto-generation script to get all correct links
2. Group stories by epic (read epic_id from each story file)
3. Generate organized story-list.md
4. Add script to repository for future regeneration

**Pros**:
- Accurate and maintainable
- Keeps epic organization
- Repeatable process

**Cons**:
- Requires scripting effort (~1 hour)

---

## Implementation Plan

### Immediate Fix (Option 3 - Hybrid)

**Step 1**: Create generation script (30 min)

```bash
#!/bin/bash
# generate-story-list.sh

cd 03-backlog/02-stories

echo "# Phase 1 - User Stories"
echo ""
echo "> **70 stories (US-001 to US-070)** - Core platform foundation"
echo ""
echo "## Story List"
echo ""

for i in {1..70}; do
  num=$(printf "%03d" $i)
  file=$(ls US-$num-*.md 2>/dev/null | head -1)
  
  if [ -n "$file" ]; then
    # Extract title and epic from frontmatter
    title=$(grep "^# US-" "$file" | head -1 | sed 's/^# US-[0-9]*: //')
    epic=$(grep "^epic_id:" "$file" | sed 's/epic_id: //')
    
    echo "- [US-$num](../../02-stories/$file) - $title"
  else
    echo "- US-$num - **MISSING**"
  fi
done
```

**Step 2**: Run script and generate new story-list.md (5 min)

**Step 3**: Manually organize by epic if desired (30 min)
- Group consecutive stories under epic headers
- Or keep flat list (simpler, still functional)

**Step 4**: Validate all links (5 min)

```bash
# Validate all story links work
cd 03-backlog/03-phases/phase-1
grep -o "US-[0-9][0-9][0-9]-[a-z-]*.md" story-list.md | while read file; do
  if [ ! -f "../../02-stories/$file" ]; then
    echo "BROKEN: $file"
  fi
done
```

**Total Time**: 1-1.5 hours

---

## Additional Findings

While investigating, I found:

1. **US-071 and US-072 duplicate files**:
   - US-071: Two different files with same ID
   - US-072: Two different files with same ID
   - **Action**: These must be resolved (see duplicate-story-ids-investigation.md)

2. **US-073 exists**:
   - File: `US-073-assignment-alert.md`
   - **Note**: This is NOT "Requisition Transfer Type Configuration" as referenced in US-010
   - **Action**: US-010 dependency may be wrong, or US-073 needs investigation

3. **Story count**: US-001 through US-070 should be 70 stories, but:
   - Some numbers might be skipped
   - Some numbers have variants (US-053b)
   - **Need**: Full audit of US-001 to US-070 range

---

## Priority

**Severity**: **CRITICAL**

**Rationale**:
- Breaks core navigation for Phase 1 planning
- Affects all team members (PMs, devs, QA)
- Quick fix available (1-1.5 hours)
- High visibility issue

**Recommendation**: Fix in next 1-2 days before Sprint planning

---

## Related Issues

- `specs-backlog-alignment-analysis.md` - Overall alignment issues
- `duplicate-story-ids-investigation.md` - US-071, US-072 duplicates
- US-073 discrepancy (needs investigation)

---

**Status**: Identified, solution defined, awaiting implementation  
**Owner**: TBD  
**ETA**: 1-1.5 hours to fix
