# Operational Flows

> End-to-end business process flows

---

## 📋 Overview

This section contains detailed operational flows for all major DFMS business processes. Each flow is visualized using Mermaid diagrams and includes:
- Process steps
- Decision points
- System interactions
- External integrations
- Error handling

---

## 📁 Workflow Documents

### Core Workflows (Phase 1)

1. **[Product Requisition Flow](./01-product-requisition-flow.md)**
   - PR creation and approval workflow
   - Distribution and procurement approval
   - TR generation

2. **[Transport Order Creation Flow](./02-transport-order-creation-flow.md)**
   - TR to TO conversion
   - Vehicle and driver assignment
   - Vendor vs own fleet routing

3. **[Trip Execution Flow](./03-trip-execution-flow.md)**
   - Trip start to completion
   - Real-time tracking
   - Operations integration

4. **[Vendor Bidding Flow](./04-vendor-bidding-flow.md)**
   - Vendor notification
   - Bid submission and review
   - Vendor assignment

5. **[Gate & Operations Flow](./05-gate-operations-flow.md)**
   - Gate-in/Gate-out
   - Weighing operations
   - Loading/Unloading

6. **[QC Inspection Flow](./06-qc-inspection-flow.md)**
   - Inspection creation
   - Physical inspection
   - Pass/Fail handling

7. **[Trip Costing & Invoicing Flow](./07-trip-costing-invoicing-flow.md)**
   - Cost calculation
   - Invoice generation
   - ERP synchronization

### Advanced Workflows (Phase 2)

8. **[Fleet Management Flow](./08-fleet-management-flow.md)**
   - Fleet health monitoring
   - Maintenance scheduling
   - Downtime management

---

## 🔄 Workflow Relationships

```
Product Requisition
        ↓
Transport Request
        ↓
Transport Order ← Vendor Bidding (if vendor fleet)
        ↓
      Trip
        ↓
    ┌───┴───┐
    ↓       ↓
Operations  QC Inspection
    ↓       ↓
    └───┬───┘
        ↓
  Trip Costing
        ↓
    Invoicing
        ↓
   ERP Sync
```

---

## 📊 Workflow Complexity

| Workflow | Steps | Decision Points | External Systems | Complexity |
|----------|-------|-----------------|------------------|------------|
| Product Requisition | 8 | 3 | 0 | Low |
| Transport Order | 12 | 5 | 1 (GPS) | Medium |
| Trip Execution | 15 | 6 | 2 (GPS, Maps) | High |
| Vendor Bidding | 10 | 4 | 1 (SMS) | Medium |
| Gate & Operations | 12 | 4 | 0 | Medium |
| QC Inspection | 10 | 5 | 0 | Medium |
| Trip Costing | 8 | 3 | 1 (ERP) | Medium |
| Fleet Management | 14 | 6 | 1 (IoT) | High |

---

## 🔗 Related Documents

- [Module Interactions](../../01-architecture/modules/module-interactions.md)
- [Business Processes](../../../02-domain/business-processes/business-processes-overview.md)
- [User Workflows](../user-workflows/)

---

**Last Updated**: February 13, 2026  
**Status**: 🚧 In Progress

