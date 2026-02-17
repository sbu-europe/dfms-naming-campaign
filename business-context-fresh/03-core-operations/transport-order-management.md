---
source_document: PRD_DFMS_v1.0.md
source_sections: Transport Order (TO) Management, Transport Order (TO) Management
extracted_date: 2026-02-13
---
## Transport Order (TO) Management

## Transport Request (TR) Assessment

## Transport Requisition (TR) Assessment & Review

**Version 1.0, Phase 1**

**User Story:** _As a transport Planner, I want to view and access all approved Transport Requisitions (TRs) so that I can plan transport execution and create appropriate Transport Orders (TOs)._

**Acceptance Criteria:**

*   System displays a list of approved TRs in transport dashboard.
*   List is filterable by:
    *   Date
    *   POI
    *   Urgency
    *   Transfer Type (Finished Goods Transfer / Port Consignment Transfer)
*   Each TR displays:
    *   Transfer Type
    *   For **Finished Goods:**
        *   TR ID
        *   Product Request (PR)
            *   Product Item Code
            *   Product Category
            *   Type of Packing
            *   Product Quantity (Number of Bags/Pieces/Tons/Cartons)
            *   Weight per unit
            *   Total Calculated Weight
            *   Unit of Measurement (UOM) - No. of Bags, Pieces, Carton, Tons
            *   Urgency (Normal / High / Critical)
            *   Required Date & Time of Delivery
            *   Weight/Tonnage
            *   Pickup & Drop locations
        *   Input for Finished Goods:
            *   **Quantity of vehicles required** for the transfer
            *   **Vehicle Type**
    *   For Port Consignment Transfer, each TR displays:
        *   TR ID
        *   Product Request (PR)
            *   Product Item Code
            *   Product Category
            *   BL Number
            *   LC Number
            *   Voyage Name
            *   Vessel Number
            *   Container Number
            *   C&F Agent Name
            *   Point of Loading (POL)
            *   Estimated Time of Arrival
            *   Arrival Notice Attachment
            *   Commodity
            *   Tentative Quantity against RM Item Code
            *   Weight/Tonnage
            *   Pickup & Drop locations
            *   Requested delivery Date & Time
            *   Destination Breakdown Plan
        *   Input for Port Consignment TR
            *   C&F Clearance Note / Approval (Yes / No)
            *   **Quantity of vehicles required** for the transfer
            *   **Vehicle Type**
*   TRs are visible only after approval from distribution/Procurement
*   TR status (Draft, Pending Approval, Approved, Available for Planning, Assigned, Converted to TO, Closed)
*   TRs cannot be planned unless mandatory transport inputs are completed
*   TRs originate only from approved product requisitions
*   TR visibility follows role-based access control

**Functional Requirements:**

*   \[Critical\] System SHALL display all approved TRs to Transport Planner (TP) in the Transport dashboard.
*   \[Critical\] System SHALL restrict visibility to approved TRs only.
*   \[Critical\] System SHALL enforce role-based access control for TR visibility
*   \[Critical\] System SHALL display TR status
*   \[Critical\] System SHALL allow Transport Planner to view TR details separately for **Finished Goods Transfer** and **Port Consignment Transfer**
*   \[Critical\] System SHALL display **Finished Goods TR details** and **Port Consignment TR Details** with TR ID and linked Product Requisition (PR) details for Finished Goods Transfers and Port Consignment Transfer respectively
*   \[High\] System SHALL allow Transport Planner to input for FG Transfer **required number of vehicles,** **vehicle type for TR.**
*   \[High\] System SHALL allow Transport Planner to input for Port Transfer **required number of vehicles,** **vehicle type for TR and C&F Clearance note / approval (Yes / No).**
*   \[High\] System SHALL display Product details, commodity, tentative quantity, Pickup and drop locations, delivery date & time
*   \[Medium\] System SHALL allow filtering TRs by date, route, transfer type
*   \[Medium\] System SHALL prevent TO creation for TRs without mandatory Transport input
