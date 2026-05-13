# Diagrams Index

> Comprehensive index of all technical diagrams

**Status**: ✅ Complete  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document provides a complete index of all diagrams in the technical context, organized by type and location.

---

## 🏗️ Architecture Diagrams (C4 Model)

### ⭐ System Architecture Overview (Start Here)
- **Location**: `05-diagrams/architecture/system-architecture-overview.mmd`
- **Description**: **Single-page overview** of the full Phase 1 stack — clients → Nginx → Django (12 modules, RBAC, Audit) → Celery Workers → PostgreSQL + Redis + S3 → External integrations. Best starting point for new team members.

### C4 Level 1: System Context
- **Location**: `05-diagrams/architecture/system-context-diagram.mmd`
- **Document**: [system-overview.md](../01-system-design/system-overview.md)
- **Description**: High-level system context showing DFMS and its external actors

### C4 Level 2: Container View
- **Location**: `05-diagrams/architecture/container-diagram.mmd`
- **Document**: [container-view.md](../01-system-design/container-view.md)
- **Description**: Container-level architecture showing building blocks and their interactions

---

## 🔄 Workflow Diagrams (Mermaid)

### Operational Flows
All operational flow diagrams are embedded in their respective documents:

1. **Product Requisition Flow**
   - **Location**: `02-workflows/operational-flows/01-product-requisition-flow.md`
   - **Type**: Process flow diagram
   - **Description**: Complete PR creation and approval flow

2. **Transport Order Creation Flow**
   - **Location**: `02-workflows/operational-flows/02-transport-order-creation-flow.md`
   - **Type**: Process flow diagram
   - **Description**: TR to TO creation flow

3. **Trip Execution Flow**
   - **Location**: `02-workflows/operational-flows/03-trip-execution-flow.md`
   - **Type**: Process flow diagram
   - **Description**: Complete trip lifecycle from start to completion

4. **Vendor Bidding Flow**
   - **Location**: `02-workflows/operational-flows/04-vendor-bidding-flow.md`
   - **Type**: Process flow diagram
   - **Description**: Vendor bid submission and acceptance flow

5. **Gate Operations Flow**
   - **Location**: `02-workflows/operational-flows/05-gate-operations-flow.md`
   - **Type**: Process flow diagram
   - **Description**: Gate entry, weighing, loading, exit flow

6. **QC Inspection Flow**
   - **Location**: `02-workflows/operational-flows/06-qc-inspection-flow.md`
   - **Type**: Process flow diagram
   - **Description**: QC inspection and lab testing flow

7. **Trip Costing & Invoicing Flow**
   - **Location**: `02-workflows/operational-flows/07-trip-costing-invoicing-flow.md`
   - **Type**: Process flow diagram
   - **Description**: Cost calculation, invoicing, and ERP sync flow

### User Workflows
All user workflow diagrams are embedded in their respective documents:

1. **Logistics Coordinator Workflows**
   - **Location**: `02-workflows/user-workflows/01-logistics-coordinator-workflows.md`
   - **Type**: User journey diagram
   - **Description**: Daily workflows for logistics coordinators

2. **Driver Workflows**
   - **Location**: `02-workflows/user-workflows/02-driver-workflows.md`
   - **Type**: User journey diagram
   - **Description**: Driver mobile app workflows

3. **QC Supervisor Workflows**
   - **Location**: `02-workflows/user-workflows/03-qc-supervisor-workflows.md`
   - **Type**: User journey diagram
   - **Description**: QC inspection workflows

4. **Vendor Workflows**
   - **Location**: `02-workflows/user-workflows/04-vendor-workflows.md`
   - **Type**: User journey diagram
   - **Description**: Vendor bidding and trip management workflows

5. **Finance Team Workflows**
   - **Location**: `02-workflows/user-workflows/05-finance-team-workflows.md`
   - **Type**: User journey diagram
   - **Description**: Invoice approval and payment workflows

### Exception Handling
- **Location**: `02-workflows/exception-handling/exception-scenarios.md`
- **Type**: Exception flow diagrams (14 scenarios)
- **Description**: Exception handling flows for various error scenarios

---

## 📊 Sequence Diagrams

### Key Integration Sequences
Located in `04-diagrams/sequences/`:

1. **Product Requisition Approval Sequence**
   - **File**: `pr-approval-sequence.mmd`
   - **Description**: Sequence diagram showing PR approval flow across services

2. **Trip Execution Sequence**
   - **File**: `trip-execution-sequence.mmd`
   - **Description**: Sequence diagram showing trip execution with all service interactions

3. **Vendor Bidding Sequence**
   - **File**: `vendor-bidding-sequence.mmd`
   - **Description**: Sequence diagram showing vendor bidding flow

---

## 🔗 Data Flow Diagrams

- **Location**: `01-system-design/data-architecture/data-flow.md`
- **Type**: Data flow diagram
- **Description**: Data flow patterns within DFMS

---

## 🏗️ Deployment Diagrams

- **Location**: `04-diagrams/deployment/deployment-diagram.mmd`
- **Type**: Infrastructure deployment diagram
- **Description**: AWS infrastructure, VPC, subnets, services, networking

---

## 🔌 Integration Architecture Diagrams

- **Location**: `04-diagrams/integration/integration-architecture-diagram.mmd`
- **Type**: Integration architecture diagram
- **Description**: How external systems integrate with DFMS (real-time, batch, on-demand)

---

## 🔄 State Diagrams

Located in `04-diagrams/states/`:

1. **Trip State Diagram**
   - **File**: `trip-state-diagram.mmd`
   - **Description**: Trip state transitions (Pending → InTransit → Completed/Cancelled)

2. **Product Requisition State Diagram**
   - **File**: `product-requisition-state-diagram.mmd`
   - **Description**: PR state transitions (Draft → Pending → Approved/Rejected)

---

## 📊 Entity Relationship Diagrams

- **Location**: `04-diagrams/data/entity-relationship-diagram.mmd`
- **Type**: ER diagram
- **Description**: High-level entity relationships and data model

---

## 📈 Statistics

### Total Diagrams
- **Architecture Diagrams**: 3 (Overview + C4 Level 1-2)
- **Workflow Diagrams**: 12 (operational + user workflows)
- **Exception Diagrams**: 14
- **Sequence Diagrams**: 3
- **Deployment Diagrams**: 1
- **Integration Diagrams**: 1
- **State Diagrams**: 2
- **ER Diagrams**: 1
- **Data Flow Diagrams**: 1
- **Total**: **38 diagrams**

### By Format
- **Mermaid**: 33 diagrams
- **Embedded in Documents**: 29 diagrams
- **Standalone Files**: 4 diagrams

---

## 🎯 Diagram Standards

### Format
- All diagrams use **Mermaid** syntax
- Diagrams are version-controlled as `.mmd` files or embedded in markdown

### Naming Convention
- **Architecture**: `{level}-{name}-diagram.mmd` (e.g., `system-context-diagram.mmd`)
- **Workflows**: Embedded in workflow documents
- **Sequences**: `{flow-name}-sequence.mmd` (e.g., `pr-approval-sequence.mmd`)

### Rendering
- Diagrams can be rendered using:
  - GitHub (native Mermaid support)
  - VS Code (Mermaid extension)
  - Mermaid Live Editor (https://mermaid.live)
  - CI/CD pipeline (Mermaid CLI)

---

## 🔗 Related Documents

- [Architecture Overview](../01-system-design/system-overview.md)
- [Workflows](../02-workflows/README.md)
- [C4 Model Documentation](https://c4model.com/)

---

**Last Updated**: May 13, 2026  
**Status**: ✅ Complete  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

