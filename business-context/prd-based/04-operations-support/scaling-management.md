---
source_document: PRD_DFMS_v1.0.md
source_sections: Scaling/Weighing Management, Scale-In (Weight Entry), Scale-Out (Weight Exit)
extracted_date: 2026-02-13
---

## Scaling/Weighing Management


## Scale-In (Weight Entry)

**Version 1.0, Phase 1**

**User Story:** _As a Scaling Operator, I want to record vehicle weight so that accurate load calculations can be made._

**Acceptance Criteria:**

*   Vehicle number required
*   Weight recorded manually
*   Scale-in timestamp stored
*   Command Center notified
*   Scale-in must occur after gate-in
*   Weight entries are immutable after scale-out

**Functional Requirements:**

*   \[Critical\] System SHALL allow manual weight entry of scale-in readings.
*   \[Critical\] System SHALL store:
    *   Vehicle number
    *   Weight ID
    *   Material name and Code
    *   Challan Number
    *   Scale-in Date & Time
    *   Gross Weight
*   \[High\] System SHALL store operator ID and Timestamp.
*   \[High\] System notify Command Center upon scale-in completion
*   \[High\] System SHALL allow logging discrepancies such as wrong quantity or driver mismatch.


## Scale-Out (Weight Exit)

**Version 1.0, Phase 1**

**User Story:** _As a Scaling Operator, I want to record scale-out weight to calculate net load._

**Functional Requirements:**

*   \[Critical\] System SHALL record scale-out weight.
*   \[Critical\] System SHALL generate a gate pass token with Delivery Note which will be printable format with information
    *   Vehicle Number
    *   Item Name
    *   P.C Code
*   \[Critical\] System SHALL auto-calculate net weight
*   \[High\] System SHALL allow logging discrepancies such as wrong quantity or driver mismatch.
