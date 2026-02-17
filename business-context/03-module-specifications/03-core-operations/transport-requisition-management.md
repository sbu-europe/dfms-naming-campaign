---
source_document: PRD_DFMS_v1.0.md
source_sections: Transport Requisition (TR) Creation Process by Distribution Officer (DO), Transport Requisition (TR) Approval Process by Distribution Manager (DM), Transport Request (TR) Assessment, Transport Requisition (TR) Assessment & Review, Transport Requisition (TR) Management
extracted_date: 2026-02-13
---

## Transport Requisition (TR) Creation Process by Distribution Officer (DO)

**Version 1.0, Phase 1**

**User Story:** _As a Distribution Officer, I want to create Transport Request from approved Finished Goods PR so that products are being transferred at their desired POIs._

**Acceptance Criteria:**

*   **Transport Request** **Creation** Workflow conducted by:
    *   Distribution Officer (DO)
*   **Distribution Officer (DO):**
    *   **DO** can view a list of approved Finished Goods Product Requisitions
    *   **DO** can create one or more TRs from a single PR (partial or full quantity
    *   **TR captures**) –
        *   **Source** POI and **Destination** POI
        *   **Transfer Quantity of Finished Goods**
        *   Delivery Date
        *   **Remarks (if any)**
    *   System forwards the TR to **Distribution Manager (DM)** for review
    *   PR Review queue supports filters:
        *   POI
        *   Product Category
    *   Actions supported:
        *   TR Creation with Source and destination POI, Quantity, Delivery date, Vehicle number and type of vehicle
*   System displays capacity snapshot for requester POIs to Distribution Officer (DO) and Distribution Manager (DM)
*   Transport Request Approval routed to Distribution Manager
*   Mandatory remarks are required for overrides or deviations.
*   Approval authority is determined by transfer type

**Functional Requirements:**

*   \[Critical\] System SHALL allow **Distribution Officer (DO)** to view approved **Product Requisitions (PRs)**.
*   \[Critical\] System SHALL allow DO to create one or more Transport Request (TR) directly from a Product Requisition (PR).
*   \[Critical\] System SHALL enforce mandatory fields including Source POI, Destination POI, Transfer quantity, Delivery Date, Expected Vehicle count, and vehicle type
*   \[Critical\] System SHALL validate TR quantity does not exceed the approved PR quantity and allow partial quantity allocation
*   \[Critical\] System SHALL display real-time capacity snapshots for source and destination POIs during TR creation
*   \[Critical\] System SHALL route submitted TRs to the **Distribution Manager (DM)** for approval
*   \[Critical\] System SHALL require mandatory remarks for TR override actions
*   \[High\] System SHALL provide PR review filters for DO by POI, Product Category, and transfer Type
*   \[High\] System SHALL allow DO to view PR line-item details while creating a TR
*   \[High\] System SHALL support creation of multiple TRs from a single PR until the full quantity is allocated
*   \[High\] System SHALL display warnings when destination capacity is limited or met threshold limit


## Transport Requisition (TR) Approval Process by Distribution Manager (DM)

**Version 1.0, Phase 1**

**User Story:** As a Distribution Manager (DM), I want to review, approve and update Transport Request (TR) created by DO so that products are being transferred at their desired POIs based on coordinated approval workflow_._

**Acceptance Criteria:**

*   **Distribution Approval** Workflow:
    *   Approval workflow conducted by
        *   Distribution Manager (DM)
    *   **Distribution Manager (DM):**
        *   DM receives TR forwarded from DO and reviews it and if needed can modify
            *   Transfer Quantity for each Source (Loading POI) and Destination (Unloading POI)
            *   Delivery Date
            *   and approve the TR. After approval, System sends the TR to Transport Department.
            *   Remarks
        *   PR Review queue supports filters:
            *   POI
            *   Product Category
        *   Actions supported:
            *   TR modification of Quantity, Delivery date, Vehicle number and type of vehicle
            *   Approve/Reject TR with mandatory remarks
*   System displays capacity snapshot for requester POIs to Distribution Manager (DO)
*   Approved Transport Request (TR) routed to Transport Department

**Functional Requirements:**

*   \[Critical\] System SHALL route Transport Requests (TRs) created by Distribution Officers (DO) to the Distribution Manager (DM) for approval
*   \[Critical\] System SHALL allow distribution Manager (DM) to view detailed TR information including source POI, destination POI, Transfer quantities, delivery date, expected vehicle count and vehicle type
*   \[Critical\] System SHALL allow DM to modify TR quantities for each source and destination POI before approval
*   \[Critical\] System SHALL allow DM to modify expected number of vehicles and vehicle type during TR review
*   \[Critical\] System SHALL allow DM to approve or reject a TR
*   \[Critical\] System SHALL require mandatory remarks when a TR is modified before approval
*   \[Critical\] System SHALL forward approved TRs to the Transport Management Section
*   \[Critical\] System SHALL display real-time capacity snapshots for source and destination POIs to the Distribution Manager during TR review
*   \[Critical\] System SHALL lock approved TRs from further modification by DO users after approval


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


## Transport Requisition (TR) Management

*   TR review queue for Transport Department
*   Filtering by route, urgency, product type
*   Assignment of TR to Transport Planner
*   Support for multiple TOs from a single TR
