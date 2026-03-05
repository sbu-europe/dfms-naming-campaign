# CR-001 Update Checklist: Documents Needing Phase Annotations

> Documents in `05-architecture/` that still need updates after CR-001 implementation

**Status**: 🔍 Review Needed  
**Created**: 2026-02-13  
**Related**: [CR-001: Phase-Based Architecture Documentation](./CR-001-phase-based-architecture.md)

---

## ✅ Already Updated (CR-001 Implementation)

These documents were updated as part of CR-001:

- ✅ `00-overview/architecture-summary.md` - Added Implementation Phases section
- ✅ `00-overview/technology-stack-overview.md` - Added phase comparison table
- ✅ `01-architecture/container-view.md` - Added phase annotations to containers
- ✅ `03-decisions/adr-004-phase-1-modular-monolith.md` - Created (NEW)
- ✅ `03-decisions/adr-005-phase-1-frontend-approach.md` - Created (NEW)
- ✅ `03-decisions/README.md` - Updated ADR index
- ✅ `03-implementation/deployment-strategy/phase-1-deployment.md` - Added Phase 1 infrastructure section

---

## 📝 Documents Needing Updates

### 🔴 High Priority (Core Architecture Documents)

#### 1. `01-architecture/system-overview.md`
**Issues**:
- Line 335: Mentions "Vue.js" without phase context
- Line 346: Mentions "Kubernetes" without phase context  
- Line 355: Mentions "RabbitMQ / AWS SQS" without phase context
- Line 356: Mentions "Kong / AWS API Gateway" without phase context

**Required Changes**:
- Add phase annotations to Frontend section (Phase 1: Django Templates, Phase 2+: Vue.js)
- Add phase annotations to Infrastructure section (Phase 1: Docker Compose, Phase 2+: Kubernetes)
- Add phase annotations to Integration section (Phase 1: Redis, Phase 2+: RabbitMQ/SQS)
- Add phase annotations to API Gateway (Phase 1: Nginx, Phase 2+: Kong/AWS API Gateway)

**Priority**: 🔴 High

---

#### 2. `01-architecture/diagrams/container-diagram.mmd`
**Issues**:
- Line 11: Shows "API Gateway (Kong/AWS)" without phase annotation
- Line 13: Shows "Web Application (Vue.js SPA)" without phase annotation
- Line 25: Shows "Message Queue (RabbitMQ/SQS)" without phase annotation

**Required Changes**:
- Add phase annotations to diagram labels
- Option: Create separate diagrams for Phase 1 and Phase 2+, OR
- Add phase notes in comments

**Priority**: 🔴 High

---

#### 3. `03-decisions/adr-100-technology-stack.md`
**Issues**:
- Line 44: Mentions "Vue.js 3" without phase context
- Line 60: Mentions "RabbitMQ" without phase context
- Line 65: Mentions "Kubernetes" without phase context
- Overall: Presents technology stack as single-phase

**Required Changes**:
- Add phase-based sections similar to `technology-stack-overview.md`
- Clarify Phase 1 vs Phase 2+ technology choices
- Reference ADR-004 and ADR-005

**Priority**: 🔴 High

---

### 🟡 Medium Priority (Supporting Documents)

#### 4. `03-decisions/adr-001-microservices-architecture.md`
**Issues**:
- Title and content suggest microservices from Phase 1
- Should clarify this is Phase 2+ vision

**Required Changes**:
- Add note at top: "This ADR describes the Phase 2+ microservices vision"
- Reference ADR-004 for Phase 1 approach
- Clarify migration path from Phase 1 to Phase 2+

**Priority**: 🟡 Medium

---

#### 5. `03-decisions/adr-002-event-driven-communication.md`
**Issues**:
- Line 36: Mentions "RabbitMQ/Kafka" without phase context
- Should clarify Phase 1 uses Redis, Phase 2+ uses RabbitMQ

**Required Changes**:
- Add phase annotations to message broker section
- Reference Phase 1 (Redis) vs Phase 2+ (RabbitMQ)

**Priority**: 🟡 Medium

---

#### 6. `03-decisions/adr-003-api-first-design.md`
**Issues**:
- Line 13: Mentions "Vue.js" without phase context

**Required Changes**:
- Add phase annotation: "Phase 1: Django Templates, Phase 2+: Vue.js SPA"

**Priority**: 🟡 Medium

---

#### 7. `03-implementation/technology-considerations.md`
**Issues**:
- Line 147: Section "Vue.js 3" without phase context
- Line 247: Has some phase context but could be clearer
- Line 394: Mentions Kubernetes without clear phase context

**Required Changes**:
- Add phase-based sections for frontend
- Clarify Phase 1 vs Phase 2+ choices throughout
- Reference ADR-004 and ADR-005

**Priority**: 🟡 Medium

---

#### 8. `03-implementation/testing-approach.md`
**Issues**:
- Line 71: Mentions "Vitest (Vue.js)" without phase context
- Line 100: Mentions "Vue Test Utils" without phase context

**Required Changes**:
- Add note: "Phase 1: Django Templates testing, Phase 2+: Vue.js testing"
- Or create separate sections for Phase 1 and Phase 2+ testing

**Priority**: 🟡 Medium

---

### 🟢 Low Priority (Diagrams & References)

#### 9. `04-diagrams/deployment/deployment-diagram.mmd`
**Issues**:
- Shows API Gateway (Kong/AWS) without phase annotation
- Shows SQS/RabbitMQ without phase annotation
- Shows Kubernetes/ECS without phase annotation

**Required Changes**:
- Add phase annotations to diagram
- Option: Create separate Phase 1 and Phase 2+ diagrams

**Priority**: 🟢 Low

---

#### 10. `04-diagrams/integration/integration-architecture-diagram.mmd`
**Issues**:
- Shows "API Gateway" without phase annotation
- Shows "Event Bus (RabbitMQ/SQS)" without phase annotation

**Required Changes**:
- Add phase annotations or create separate diagrams

**Priority**: 🟢 Low

---

#### 11. `05-contracts/events/event-specifications.yaml`
**Issues**:
- Lines 16-22: Shows RabbitMQ URLs without phase context
- Should note Phase 1 uses Redis, Phase 2+ uses RabbitMQ

**Required Changes**:
- Add comment or note about Phase 1 vs Phase 2+ message broker

**Priority**: 🟢 Low

---

## 📊 Summary

| Priority | Count | Documents |
|----------|-------|-----------|
| 🔴 High | 3 | system-overview.md, container-diagram.mmd, adr-100-technology-stack.md |
| 🟡 Medium | 5 | adr-001, adr-002, adr-003, technology-considerations.md, testing-approach.md |
| 🟢 Low | 3 | deployment-diagram.mmd, integration-diagram.mmd, event-specifications.yaml |
| **Total** | **11** | **11 documents need updates** |

---

## 🎯 Recommended Update Order

1. **First**: Update core architecture documents (High Priority)
   - `system-overview.md`
   - `container-diagram.mmd`
   - `adr-100-technology-stack.md`

2. **Second**: Update ADRs (Medium Priority)
   - `adr-001-microservices-architecture.md`
   - `adr-002-event-driven-communication.md`
   - `adr-003-api-first-design.md`

3. **Third**: Update implementation docs (Medium Priority)
   - `technology-considerations.md`
   - `testing-approach.md`

4. **Fourth**: Update diagrams (Low Priority)
   - `deployment-diagram.mmd`
   - `integration-diagram.mmd`
   - `event-specifications.yaml`

---

## 📝 Update Pattern

For each document, follow this pattern:

1. **Add Phase Context**:
   - Phase 1: [Current implementation]
   - Phase 2+: [Future implementation]

2. **Reference Related ADRs**:
   - Link to ADR-004 (Phase 1 Modular Monolith)
   - Link to ADR-005 (Phase 1 Frontend)
   - Link to ADR-001 (Microservices vision)

3. **Maintain Consistency**:
   - Use same terminology across all documents
   - Follow same phase comparison format

---

**Last Updated**: 2026-02-13  
**Next Review**: After updates completed

