# Specification File Transformation Guide

**Purpose**: Transform specification files from user story format to domain knowledge/technical specification format

**Date**: 2026-02-26

---

## Transformation Principles

### From User Story Format → To Domain Knowledge Format

**User Story Format (OLD - extracted from PRD)**:
- Organized around "As a [user], I want [feature] so that [benefit]"
- Lists acceptance criteria as bullet points
- Includes functional requirements as SHALL statements
- Focuses on user perspective

**Domain Knowledge Format (NEW - technical specification)**:
- Explains HOW the system works conceptually
- Describes architecture, flows, and mechanisms
- Provides technical details (data models, algorithms, integrations)
- Includes implementation guidance
- Maintains links to user stories for traceability

---

## File Structure Template

```markdown
---
module: [module-id]
specification: [Specification Title]
version: 1.0
phase: Phase X
source_document: PRD_DFMS_v1.0.md
source_sections: [PRD section references]
last_updated: 2026-02-26
related_stories: [US-XXX, US-YYY]
---

# [Specification Title]

## Overview

[2-3 paragraphs explaining what this specification covers, its purpose in the system, and why it's important. Focus on conceptual understanding.]

---

## 1. [Main Topic] Architecture/Overview

### 1.1 [Subtopic]

[Explain the conceptual architecture, workflow, or mechanism]

**[Component/Feature Name]:**
- [Detail 1]
- [Detail 2]
- [Detail 3]

**[Implementation Details]:**
```typescript
// Data structures, algorithms, or pseudo-code
```

### 1.2 [Another Subtopic]

[Continue with detailed explanations]

---

## 2. [Second Main Topic]

[Follow similar structure - explain HOW things work, not just WHAT features exist]

---

## X. Integration Points

[Explain how this specification integrates with other modules]

**Integrates with:**
- **[Module Name]**: [How/why]
- **[Module Name]**: [How/why]

---

## X+1. Related Documentation

- **[Related Spec](../../README.md)** - Description
- **[Related Spec](../../README.md)** - Description

**Related User Stories:**
- US-XXX: [Title]
- US-YYY: [Title]

**Source**: PRD_DFMS_v1.0.md - Sections [X.X.X]
```

---

## Content Guidelines

### DO:
✅ **Explain mechanisms and workflows**
  - "The system implements X by doing Y..."
  - "When event A occurs, the system performs steps 1, 2, 3..."

✅ **Provide technical details**
  - Data structures
  - Algorithms
  - State machines
  - Integration patterns

✅ **Use diagrams and pseudo-code**
  - Flow diagrams (text-based)
  - Entity structures
  - Sequence descriptions

✅ **Reference user stories for traceability**
  - Link to stories at the end
  - Maintain bidirectional traceability

✅ **Explain business rules**
  - "When quantity exceeds capacity, the system calculates overflow and triggers warning"
  - "Lockout occurs when: failed_attempts >= 3 AND within 15-minute window"

### DON'T:
❌ **Write as user stories**
  - Avoid "As a [user], I want..."
  - Avoid "Acceptance Criteria" sections

❌ **List functional requirements as SHALL statements**
  - Transform "[Critical] System SHALL..." into "The system implements..."

❌ **Focus on user actions without explaining system behavior**
  - Don't just say "User can create POI"
  - Explain: "POI creation validates GPS coordinates, enforces naming rules, and triggers geofence setup..."

---

## Transformation Examples

### ❌ BAD (User Story Format):

```markdown
### User Login

**User Story:** As a user, I want to log in with credentials.

**Acceptance Criteria:**
- Login with username/password
- Password masked
- Failed attempts trigger lockout

**Functional Requirements:**
- [Critical] System SHALL require unique username
- [Critical] System SHALL mask password field
```

### ✅ GOOD (Domain Knowledge Format):

```markdown
## 1. Authentication Mechanism

### 1.1 Login Flow

The authentication system validates user credentials through a multi-step process:

1. **Credential Validation**: Username and password hash compared against stored values
2. **Failed Attempt Tracking**: Each failed login increments counter with timestamp
3. **Lockout Enforcement**: When threshold reached (3 attempts in 15 min), account locked for 30 minutes

**Password Masking:**
- UI displays bullets (•••••) by default
- Toggle button reveals/hides plain text
- State does not persist across sessions

**Lockout Logic:**
```typescript
IF failed_login_count >= 3 AND
   (NOW() - last_failed_login_at) <= 15 minutes:
    locked_until = NOW() + 30 minutes
    notify_admin_dashboard()
```
```

---

## Section Organization

### For Each Specification File:

1. **Overview** (required)
   - What this specification covers
   - Its role in the system
   - Key concepts

2. **Architecture/Conceptual Model** (required)
   - How the system is structured
   - Main components
   - Relationships

3. **Workflows/Mechanisms** (required)
   - Step-by-step processes
   - State transitions
   - Decision points

4. **Data Models** (if applicable)
   - Entity structures
   - Relationships
   - Constraints

5. **Business Rules** (if applicable)
   - Validation rules
   - Calculation logic
   - Constraints

6. **Integration Points** (if applicable)
   - How this integrates with other modules
   - Dependencies
   - API contracts

7. **Security/Compliance** (if applicable)
   - Security considerations
   - Audit requirements
   - Data privacy

8. **Related Documentation** (required)
   - Links to related specs
   - User story references
   - PRD sections

---

## Module-Specific Patterns

### 01-foundation (Authentication, RBAC, User Management)
Focus on:
- Security mechanisms
- Session management
- Permission enforcement
- Audit trails

### 02-master-data (POI, Products, Configuration)
Focus on:
- Entity structures
- Validation rules
- CRUD workflows
- Referential integrity

### 03-core-operations (PR, TR, TO, Trip)
Focus on:
- Workflow stages
- State machines
- Approval chains
- Business rule enforcement

### 04-operations-support (Gate, QC, Scaling, Command Center)
Focus on:
- Operational workflows
- Data capture
- Event sequencing
- Integration with trips

### 05-vendor-management (Onboarding, Bidding, Portal)
Focus on:
- Vendor lifecycle
- Bidding mechanics
- Portal capabilities
- Performance tracking

### 06-fleet-management (Vehicle, Driver, Helper, Fuel)
Focus on:
- Asset management
- Assignment logic
- Availability tracking
- Cost calculation

### 07-mobile-interfaces (Driver, QC, Vendor apps)
Focus on:
- Mobile workflows
- Offline capabilities
- Sync mechanisms
- UI patterns

### 08-reporting-analytics (Reports, Dashboards)
Focus on:
- Data aggregation
- KPI calculations
- Report generation
- Dashboard design

### 09-non-functional (Performance, Security, Integration)
Focus on:
- System requirements
- Performance targets
- Security standards
- Integration patterns

---

## Checklist for Each File

Before marking a file complete, verify:

- [ ] Frontmatter updated with proper metadata
- [ ] Overview section explains purpose clearly
- [ ] Content organized by concepts, not user stories
- [ ] Technical details included (data models, algorithms, flows)
- [ ] Business rules explained with examples
- [ ] Integration points documented
- [ ] Related user stories referenced at end
- [ ] PRD sections cited
- [ ] No "User Story:" or "Acceptance Criteria:" sections remain
- [ ] File reads like technical documentation, not requirements

---

## Related Files

- **[authentication-security.md](../../05-modules/01-foundation/authentication-security.md)** - Example of completed transformation
- **[Module READMEs](../../README.md)** - Module overviews with story mappings

**Last Updated**: 2026-02-26  
**Status**: Active transformation guide
