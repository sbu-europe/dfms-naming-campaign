---
title: DFMS Product Requisition Management Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-processes, product, requisition, process]
---

# DFMS Product Requisition Management Process

## Product Requisition Management Process

### Overview
Initiates the transport workflow by creating requisitions for product transfers (Finished Goods or Port Consignments).

### Process Flow

**Finished Goods Transfer**:
```
Depot/Feed Mill → Create PR → Distribution Officer → Create TR → 
Distribution Manager → Approve TR → Transport Department
```

**Port Consignment Transfer**:
```
Commercial Team → Create PR (with LC details) → Procurement Officer → 
Create Destination Breakdown → Create TR → Transport Department
```

### Key Activities

#### 1.1 PR Creation (Requester)
- **Actor**: Depot Officer / Feed Mill Officer / Commercial Officer
- **Input**: Product requirements, destination, urgency
- **Output**: Product Requisition (PR)
- **Activities**:
  1. Select transfer type (FG or Port)
  2. Add product line items (item code, quantity, UOM, weight)
  3. Specify source and destination POI
  4. Set delivery date and urgency
  5. Submit for approval

#### 1.2 PR Approval (Distribution/Procurement)
- **Actor**: Distribution Manager (FG) / Procurement Officer (Port)
- **Input**: Submitted PR
- **Output**: Approved PR
- **Activities**:
  1. Review PR details
  2. Validate stock availability (source)
  3. Validate capacity (destination)
  4. Approve or reject with remarks

#### 1.3 TR Creation (Distribution/Procurement)
- **Actor**: Distribution Officer (FG) / Procurement Officer (Port)
- **Input**: Approved PR
- **Output**: Transport Requisition (TR)
- **Activities**:
  1. Create TR from approved PR
  2. Define source and destination POIs
  3. Specify transfer quantity (can be partial)
  4. Set delivery date
  5. Define vehicle requirements (count, type)
  6. For Port: Add C&F clearance note
  7. Submit TR for approval

#### 1.4 TR Approval (Distribution Manager)
- **Actor**: Distribution Manager
- **Input**: Submitted TR
- **Output**: Approved TR
- **Activities**:
  1. Review TR details
  2. Modify if needed (quantity, date, vehicles)
  3. Approve or reject with remarks
  4. Forward to Transport Department

### Business Rules
- PR cannot be submitted without transfer type and at least one product line item
- Multiple TRs can be created from single PR (partial allocation)
- TR quantity cannot exceed approved PR quantity
- Destination capacity warnings displayed if threshold exceeded
- Source stock validation before execution

### Success Criteria
- PR approval time < 30 minutes
- TR creation time < 20 minutes
- Stock accuracy > 98%
- Capacity violations < 2%



## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
