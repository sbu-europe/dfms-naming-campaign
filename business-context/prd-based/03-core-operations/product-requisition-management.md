---
source_document: PRD_DFMS_v1.0.md
source_sections: Product Requisition Management (PRM), Product Requisition Management
extracted_date: 2026-02-13
---

## Product Requisition Management (PRM)

Product Requisition Management module handles two distinct transfer workflows:

1.  Finished Goods Transfer: Initiated by Depot/Feed mill – Approved by Distribution Department → Forwarded to Transport Department upon approval
2.  Port Transfer: Initiated by Commercial Team (L.C Shipment) - Approved by Procurement Department → Distribution breakdown by Procurement Department → Forwarded to Transport Department

Both workflows integrates with real-time stock validation at source, capacity validation at destination, and transport requisition request (TR) generation upon approval.


## Product Requisition Management

*   Internal requisition creation by:
    *   Depot / Feed Mill (Finished Goods)
    *   Commercial Team (Port / Import)
*   Pre-filled requester and POI context
*   Stock and capacity visibility (informational)
*   Threshold-based warnings
*   Approval workflows:
    *   Distribution approval (FG)
    *   Procurement + CNF confirmation (Port)
*   Automatic Transport Requisition (TR) generation
