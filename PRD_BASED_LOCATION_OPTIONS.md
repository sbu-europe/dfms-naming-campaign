# PRD-Based Folder Location - Options Analysis

## 🎯 Current Situation

**Current Location**: `business-context/prd-based/`

**Content**: PRD v1.0 extracted content with Epic → Story → Task structure

## 📊 Options Analysis

### Option 1: Keep Current Location ✅ **RECOMMENDED**
**Location**: `business-context/prd-based/`

**Pros**:
- ✅ Both are business context (just different sources)
- ✅ Clear separation: Original analysis vs PRD-based
- ✅ Logical grouping: All business documentation together
- ✅ Easy navigation: `business-context/` contains all business docs
- ✅ No breaking changes needed

**Cons**:
- ⚠️ Slightly nested structure
- ⚠️ Might seem like "sub-content"

**Use Case**: When you want all business context together, regardless of source

---

### Option 2: Move to Root Level
**Location**: `prd-based/` (same level as `business-context/`)

**Pros**:
- ✅ Equal status with `business-context/` and `technical-context/`
- ✅ Clear separation by source type
- ✅ Flatter structure

**Cons**:
- ⚠️ Breaks logical grouping (business content split)
- ⚠️ Requires updating all references
- ⚠️ Less clear that it's business context

**Use Case**: When PRD-based content should have equal status to original analysis

---

### Option 3: Rename and Reorganize
**Location**: `business-context/prd/` or `business-context/approved-prd/`

**Pros**:
- ✅ Shorter name
- ✅ Clearer that it's PRD content
- ✅ Still grouped with business context

**Cons**:
- ⚠️ Requires renaming and reference updates
- ⚠️ "prd-based" is already descriptive

**Use Case**: When you want a shorter, clearer name

---

### Option 4: Merge Structure
**Location**: Integrate PRD content into main `business-context/` folders

**Pros**:
- ✅ Single unified structure
- ✅ No separate folder needed

**Cons**:
- ⚠️ Mixes different sources (original analysis + PRD)
- ⚠️ Loses Epic/Story/Task structure visibility
- ⚠️ Harder to distinguish source

**Use Case**: When you want one unified business context (not recommended)

---

## 🎯 Recommendation

### **Option 1: Keep Current Location** ✅

**Reasoning**:
1. **Logical Grouping**: Both original analysis and PRD-based are business context
2. **Clear Separation**: Easy to distinguish between sources
3. **No Breaking Changes**: Current references remain valid
4. **Consistent Structure**: Follows pattern of `technical-context/` at root, business content grouped

### Alternative: If Equal Status Needed

**Option 2: Move to Root** - Only if PRD-based content should have equal status to `business-context/` and `technical-context/`

---

## 📋 Decision Factors

Consider moving to root if:
- PRD-based content is the **primary** source of truth
- You want to **deprecate** original analysis
- Epic/Story/Task structure is **more important** than business context grouping

Keep current location if:
- Both sources are **equally valuable**
- You want **all business content together**
- **Source traceability** is important
- **No breaking changes** preferred

---

## 🔄 Migration Impact

### If Moving to Root:
- Update all references in documentation
- Update README files
- Update navigation links
- Consider deprecating original analysis

### If Keeping Current:
- No changes needed
- Consider updating README to clarify relationship

