# Technical Diagrams

> Standalone technical diagrams and diagram index

**Status**: ✅ Complete  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This folder contains standalone technical diagrams and a comprehensive index of all diagrams in the technical context. Most workflow diagrams are embedded in their respective documents, while this folder contains:

- **Sequence Diagrams**: Key service interaction sequences
- **Diagram Index**: Complete catalog of all diagrams

---

## 📁 Contents

### **[Diagrams Index](./diagrams-index.md)**
Complete index of all diagrams:
- Architecture diagrams (C4 Level 1-2)
- Workflow diagrams (operational + user workflows)
- Exception handling diagrams
- Sequence diagrams
- Data flow diagrams

### **[Sequence Diagrams](./sequences/)**
Standalone sequence diagrams for key flows:

- **[PR Approval Sequence](./sequences/pr-approval-sequence.mmd)**
  - Product Requisition approval flow across services
  - Service interactions and event publishing

- **[Trip Execution Sequence](./sequences/trip-execution-sequence.mmd)**
  - Complete trip lifecycle with all service interactions
  - GPS updates, operations, QC, costing

- **[Vendor Bidding Sequence](./sequences/vendor-bidding-sequence.mmd)**
  - Vendor bidding flow with service interactions
  - Bid submission, acceptance, assignment

---

## 📊 Diagram Locations

### Architecture Diagrams
- **C4 Level 1-2**: `01-architecture/diagrams/`
- **System Context**: `01-architecture/diagrams/system-context-diagram.mmd`
- **Container View**: `01-architecture/diagrams/container-diagram.mmd`

### Workflow Diagrams
- **Operational Flows**: `02-workflows/operational-flows/` (embedded in documents)
- **User Workflows**: `02-workflows/user-workflows/` (embedded in documents)
- **Exception Scenarios**: `02-workflows/exception-handling/` (embedded in documents)

### Sequence Diagrams
- **Standalone Sequences**: `04-diagrams/sequences/`
- **Key Flows**: PR Approval, Trip Execution, Vendor Bidding

---

## 🎯 Diagram Standards

### Format
- All diagrams use **Mermaid** syntax
- Standalone diagrams: `.mmd` files
- Embedded diagrams: Mermaid code blocks in markdown

### Rendering
- **GitHub**: Native Mermaid support
- **VS Code**: Mermaid extension
- **Mermaid Live**: https://mermaid.live
- **CI/CD**: Mermaid CLI for validation

---

## 📈 Statistics

- **Total Diagrams**: 32
- **Architecture Diagrams**: 2
- **Workflow Diagrams**: 12
- **Exception Diagrams**: 14
- **Sequence Diagrams**: 3
- **Data Flow Diagrams**: 1

---

## 🔗 Related Documents

- [Architecture Overview](../01-architecture/system-overview.md)
- [Workflows](../02-workflows/README.md)
- [C4 Model](https://c4model.com/)
- [Mermaid Documentation](https://mermaid.js.org/)

---

**Last Updated**: February 13, 2026  
**Status**: ✅ Complete  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

