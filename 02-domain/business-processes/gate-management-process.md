---
title: DFMS Gate Management Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-processes, gate, management, process]
---

# DFMS Gate Management Process

## Gate Management Process

### Overview
Controls vehicle entry and exit at POIs, including on-demand TO creation for dealers and suppliers.

### Process Flow

```
Vehicle Arrival → Gate-in Entry → Document Verification → 
[On-Demand TO Creation (if needed)] → Proceed to Operations → 
Operations Complete → Gate-out Entry → Vehicle Departure
```

### Key Activities

#### 4.1 Gate-in Entry
- **Actor**: Gate Man
- **Input**: Vehicle arrival
- **Output**: Gate-in record
- **Activities**:
  1. Record vehicle registration number
  2. Select document category:
     - Supplier (PO) - for inbound raw materials
     - Internal Transfer (TO, Challan) - for internal transfers
     - Distributor (PO/DO) - for outbound finished goods
     - Dealer (DO) - for dealer pickups
  3. Capture document details:
     - Challan number / TO number / PO number / DO number
     - Product details (item code, name, quantity)
     - Driver information (name, contact)
     - Party name (Supplier/Dealer/Distributor)
     - Project From information
     - Remarks (if any)
  4. Record gate-in date and time
  5. Route to appropriate workflow:
     - Supplier/Port → Inbound QC Workflow
     - Dealer → Outbound FG Workflow
     - Internal Transfer → TO-Linked Workflow

#### 4.2 On-Demand TO Creation (Dealer)
- **Actor**: Gate Man
- **Input**: Dealer vehicle with DO copy (no pre-created TO)
- **Output**: Gate-Created FG Transport Order
- **Activities**:
  1. Select document category: Dealer (DO)
  2. Enter DO Number
  3. Enter Dealer Name
  4. Select Finished Goods product
  5. Enter Planned Quantity
  6. Enter Driver information
  7. Add Remarks (if any)
  8. System creates Gate-Created FG TO
  9. TO classified as: Dealer Outbound – Finished Goods
  10. TO immediately available for: Scaling, Loading, Gate-out

#### 4.3 On-Demand TO Creation (Supplier)
- **Actor**: Gate Man
- **Input**: Supplier vehicle with PO copy (no pre-created TO)
- **Output**: Gate-Created RM Transport Order
- **Activities**:
  1. Select document category: Supplier (PO)
  2. Enter PO Number
  3. Enter Supplier Name
  4. Select Raw Material product
  5. Enter Expected Quantity
  6. Enter Driver information
  7. Add Remarks (if any)
  8. System creates Gate-Created RM TO
  9. TO classified as: Supplier Inbound – Raw Material
  10. TO linked to: QC and Scaling workflows automatically

#### 4.4 Gate-out Entry
- **Actor**: Gate Man
- **Input**: Operations complete (gate pass from Scaling)
- **Output**: Gate-out record
- **Activities**:
  1. Receive gate pass from Scaling (after scale-out)
  2. Verify gate pass details
  3. Record gate-out date and time
  4. Vehicle exits

### Business Rules
- Gate-in cannot be saved without vehicle number
- For empty vehicles, quantity kept null
- Gate-out cannot occur before scale-out
- Gate-out blocked if QC status pending (for unloading flows)
- On-demand TO immediately available for operations
- Inventory deduction occurs after loading & scale-out (for FG)
- Inventory updated only after QC Pass (for RM)

### Success Criteria
- Gate-in time < 5 minutes per vehicle
- Data accuracy > 98%
- On-demand TO creation < 10 minutes
- Zero unauthorized entries



## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
