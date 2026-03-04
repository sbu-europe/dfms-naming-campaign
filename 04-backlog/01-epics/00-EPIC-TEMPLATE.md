# Epic Definition Template

**Purpose**: This template defines the standard structure and acceptance criteria for all DFMS epics.

---

## Epic File Structure (Minimal)

Each epic file should contain ONLY:

### 1. YAML Frontmatter
```yaml
---
title: Epic Name
epic_id: EPIC-XXX
epic_name: Epic Name
phase: phase-X
module_category: Foundation|Core Data|Operations|Vendor|Quality|Monitoring|Mobile
priority: P0|P1|P2
status: Planned|In Progress|Completed
target_sprint: Sprint X
duration: X Weeks
story_points: XXX
progress: 0%
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_documents:
  - WBS references
dependencies: ["EPIC-XXX"]
blocks: ["EPIC-XXX"]
tags: [tag1, tag2]
---
```

### 2. Epic Overview (Quick Facts)
- Priority, Sprint, Duration, Story Points, Status, Progress
- Module Category, Epic Type

### 3. Business Context (Why This Epic Matters)
- Business Value (1 sentence)
- Key Benefits (3-5 bullet points)
- Impact on Operations (1 sentence with dependencies)

### 4. Epic Dependencies
- **Depends On**: List of epics this depends on
- **Blocks**: List of epics blocked by this
- **Critical Path**: If applicable

### 5. User Stories (The Core Content)
- Table with: Story ID, Title, Story Points
- Total story points
- Notes on any story reassignments (if applicable)

---

## REMOVE These Redundant Sections

The following sections are **generic boilerplate** and should be removed from individual epic files:

### ❌ Remove: Epic Acceptance Criteria
```markdown
## Epic Acceptance Criteria

### AC-1: Core Functionality
- [ ] All X user stories completed and tested
- [ ] Epic objectives met
- [ ] Integration with dependent epics working
- [ ] All acceptance criteria from individual stories met

### AC-2: Quality Standards
- [ ] Code reviewed and approved
- [ ] Unit tests pass (80%+ coverage)
- [ ] Integration tests pass
- [ ] UAT approved
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed
```

**Why Remove**: These are identical across ALL epics. No epic-specific value.

---

### ❌ Remove: Functional Requirements
```markdown
## Functional Requirements

### FR-1: Epic-Specific Requirements
- System SHALL implement all features defined in the X user stories
- System SHALL enforce data validation and business rules
- System SHALL maintain audit trail for all operations
- System SHALL integrate with dependent epics as specified

### FR-2: Integration Requirements
- System SHALL integrate with dependent epics seamlessly
- System SHALL maintain data consistency across integrated systems
- System SHALL handle errors gracefully with proper error messages
```

**Why Remove**: Generic statements that apply to ALL epics. Move to project-level standards.

---

### ❌ Remove: Business Rules
```markdown
## Business Rules

- All operations require proper authorization based on user roles
- Data changes must be audit-logged with user ID, timestamp, and change details
- Inactive records cannot be used in new transactions (historical references preserved)
- Referential integrity must be maintained (foreign key constraints)
- Unique constraints enforced per tenant
- Business rules defined in individual user stories must be enforced
```

**Why Remove**: Global business rules that apply to ALL epics. Document once in project standards.

---

### ❌ Remove: Success Criteria
```markdown
## Success Criteria

### Must Have
- ✅ All X user stories completed
- ✅ Epic objectives met
- ✅ Integration with dependencies working
- ✅ All acceptance criteria met

### Performance Targets
- Response time < 2 seconds for standard operations (95th percentile)
- System availability > 99.5%
- Database query performance optimized

### Quality Metrics
- Code coverage ≥ 80%
- Zero critical bugs
- UAT approval from stakeholders
```

**Why Remove**: Identical across all epics. Move to project-level quality standards.

---

### ❌ Remove: Technical Notes
```markdown
## Technical Notes

- Follow established architecture patterns and coding standards
- Use standard libraries and frameworks approved for the project
- Implement proper error handling and logging
- Consider scalability and performance in design
- Ensure security best practices are followed
- Maintain code documentation and API documentation
```

**Why Remove**: Generic development guidelines that apply to ALL epics.

---

### ❌ Remove: Testing Strategy
```markdown
## Testing Strategy

### Unit Tests
- Core functionality covered with unit tests (target: 80%+ coverage)
- Business logic validation
- Data validation rules
- Error handling scenarios

### Integration Tests
- End-to-end workflows tested
- Integration with dependent epics verified
- API integration tested
- Database operations tested

### UAT
- User acceptance testing with stakeholders
- Business process validation
- Performance testing under load
- Security testing
```

**Why Remove**: Standard testing approach for ALL epics. Document once in test strategy doc.

---

### ❌ Remove: Definition of Done
```markdown
## Definition of Done

- [ ] All X user stories completed
- [ ] Epic objectives met
- [ ] All acceptance criteria met
- [ ] Unit tests pass (80%+ coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] UAT approved
```

**Why Remove**: Same checklist for ALL epics. Move to project-level DoD.

---

## Where to Document Removed Content

### Create Single Project-Level Documents

**1. `00-epic-standards.md`** (This file)
- Epic structure template
- Standard acceptance criteria
- Global business rules
- Quality metrics
- Performance targets

**2. `00-development-standards.md`**
- Code standards
- Architecture patterns
- Security best practices
- Error handling guidelines

**3. `00-testing-strategy.md`**
- Unit test requirements
- Integration test approach
- UAT process
- Performance testing
- Definition of Done

**4. `00-epic-index.md`**
- Quick reference table of all epics
- Story counts and story points
- Dependencies visualization
- Status dashboard

---

## Streamlined Epic File Example

```markdown
---
title: System Foundation
epic_id: EPIC-001
epic_name: System Foundation
phase: phase-1
module_category: Foundation
priority: P0
status: Planned
target_sprint: Sprint 1
duration: 2 Weeks
story_points: 40
progress: 0%
created: 2026-02-17
updated: 2026-02-27
dependencies: []
blocks: ["EPIC-002", "EPIC-003"]
tags: [foundation, p0, critical-path]
---

# EPIC-001: System Foundation

## Epic Overview

**Priority**: P0  
**Sprint**: Sprint 1  
**Duration**: 2 Weeks  
**Story Points**: 40 SP  
**Status**: Planned

**Module Category**: Foundation  
**Epic Type**: Critical Path

---

## Business Context

**Business Value**: Provides authentication, authorization, and security foundation for entire platform.

**Key Benefits**:
- Secure user authentication with MFA
- Role-based access control (RBAC)
- Session management
- Account security (lockout, password reset)

**Impact**: Blocks all other epics - must complete first.

---

## Dependencies

**Depends On**: None (foundational)  
**Blocks**: EPIC-002, EPIC-003, all operational epics

**Critical Path**: First epic on critical path

---

## User Stories

| Story ID | Title | Story Points |
|----------|-------|--------------|
| [US-001](../02-stories/US-001-user-login-account-lockout.md) | User Login & Account Lockout | 10 SP |
| [US-002](../02-stories/US-002-multi-factor-auth.md) | Multi-Factor Auth (2FA) | 10 SP |
| [US-003](../02-stories/US-003-session-control.md) | Session Control | 10 SP |
| [US-004](../02-stories/US-004-role-hierarchy.md) | Role Hierarchy | 10 SP |

**Total**: 40 Story Points

---

**Last Updated**: 2026-02-27  
**Source**: WBS epics-table.md
```

**Result**: Clean, focused, ~100 lines instead of ~200 lines per epic.

---

## Benefits of This Approach

### Token Efficiency
- **Before**: ~200 lines × 17 epics = **3,400 lines**
- **After**: ~100 lines × 17 epics + 4 standard docs = **2,200 lines**
- **Savings**: **~35% reduction** in epic documentation size

### Maintainability
- ✅ Update standards once, applies to all epics
- ✅ No need to sync 17 copies of same content
- ✅ Easier to update global policies

### Clarity
- ✅ Epic files focus on what's unique to that epic
- ✅ Readers don't wade through boilerplate
- ✅ Faster to find relevant info

---

## Implementation Plan

1. Create 4 standard documents in `04-backlog/00-standards/`:
   - `epic-standards.md` (this template)
   - `development-standards.md`
   - `testing-strategy.md`
   - `epic-index.md`

2. Update all 17 epic files:
   - Remove redundant sections
   - Keep only: Overview, Business Context, Dependencies, User Stories
   - Reduce from ~200 to ~100 lines each

3. Update epic README to reference standards

**Estimated Effort**: 2-3 hours

---

**Recommendation**: Proceed with this cleanup to improve LLM token efficiency and maintainability.
