---
source_document: PRD_DFMS_v1.0.md
source_sections: Gate Management, Gate-In Entry, On Demand Third Party Supplier and Dealer Management At Gate-In, Gate-Out Entry
extracted_date: 2026-02-13
---

## Gate Management


## Gate-In Entry

**Version 1.0, Phase 1**

**User Story:** _As a Gate man, I want to register vehicle gate-in details so that all incoming vehicles are formally logged and validated before operational processing._

**Acceptance Criteria:**

*   Gate man can input gate-in date and time of the respective vehicle against the vehicle number with information like
    *   Vehicle Registration Number
    *   Document Category
        *   Supplier (PO),
        *   Internal Transfer (TO, Challan),
        *   Dealer (DO))
    *   Challan number / TO / PO / DO number
    *   Product Details (Gate-in Item)
    *   Product Quantity (Unloading vehicles) \[For empty vehicles, gate-man will keep it null\]
    *   Gate-in Date and Time
    *   Driver information
        *   Driver name
        *   Driver contact details
    *   Party Name (Supplier/Dealer/Distributor)
    *   Project From Information
    *   Remarks (If any)
*   Gate-in cannot be saved without vehicle number
*   All entries are timestamp and auditable

**Functional Requirements:**

*   \[Critical\] System SHALL allow gate man to input gate-in date and time against a vehicle number.
*   \[Critical\] System SHALL capture document category:
    *   Supplier (PO)
    *   Internal Transfer (TO, Challan)
    *   Distributor (PO/DO)
    *   Dealer (DO)
*   \[High\] System SHALL record challan number, product details, and quantity for unloading vehicles
*   \[High\] System SHALL allow quantity to be null for empty vehicles
*   \[High\] System SHALL route the gate-in record to the correct operational flow:
    *   Supplier / Port → Inbound QC Workflow
    *   Dealer → Outbound FG Workflow
    *   Internal Transfer → TO-Linked Workflow
*   \[High\] System SHALL capture driver details, party name, project reference and remarks


## On Demand Third Party Supplier and Dealer Management At Gate-In


## Gate-Out Entry

**Version 1.0, Phase 1**

**User Story:** _As a Gate man, I want to record gate-out after clearance so that vehicle exit is formally completed._

**Acceptance Criteria:**

*   Gate-out entry allowed only after gate pass
*   Gate-out time stored against vehicle
*   Linked to QC and scaling completion
*   Gate-out cannot occur before scale-out
*   Gate-out is blocked if QC status is pending (for unloading flows)

**Functional Requirements:**

*   \[Critical\] System SHALL allow gate-out date and time entry after receiving gate clearance copy from Scaling.
