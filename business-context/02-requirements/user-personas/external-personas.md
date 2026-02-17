---
title: DFMS External User Personas
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  # PRD Source
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.md
  # Discovery Phase Sources
  - ../../../source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx
  - ../../../source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Accounts_Finance_2025-10-08.docx
  # ... (additional discovery sources in original files)
content_source:
  prd_based: "PRD Section 4: User Personas & Stakeholders (role names only)"
  discovery_based: "Detailed persona profiles (Age, Education, Experience, Pain Points, etc.) sourced from discovery phase materials"

tags: [user-personas, external, personas]
---

# DFMS External User Personas


### 16. Vendor (Contractual)

**Profile**:
- **Age**: 30-55
- **Education**: High School to Bachelor's
- **Experience**: 5-15 years in transport business
- **Tech Proficiency**: Low to Medium
- **Work Location**: Office + Field
- **Work Hours**: Variable (business hours + operations)

**Role & Responsibilities**:
- Receive direct TO assignments
- Assign vehicles and drivers to TOs
- Monitor trip execution
- Submit POD, GRN, and invoices
- Track payment status
- Maintain vehicle and driver compliance

**Primary Goals**:
- Receive consistent business
- Ensure timely payments
- Maintain good relationship with client
- Maximize vehicle utilization
- Minimize disputes

**Pain Points (Current State)**:
- Manual TO communication
- Delayed payment processing
- Difficult to track trip status
- Manual invoice submission
- No visibility into payment status

**System Usage Patterns**:
- Primary interface: Vendor Portal (Web + Mobile App)
- Usage frequency: Daily (multiple times)
- Key features used:
  - Assigned TO view
  - Vehicle and driver assignment
  - Trip tracking
  - Invoice submission
  - Payment tracking
  - Performance dashboard

**Success Metrics**:
- Trip completion rate > 98%
- Invoice processing time < 48 hours
- Payment delays < 7 days
- Client satisfaction > 4/5

**Quotes**:
> "I want to see all my assigned trips and their status in one place."

> "Knowing when my payment will be processed would help me manage my cash flow."

---

### 17. Vendor (Non-Contractual)

**Profile**:
- **Age**: 28-50
- **Education**: High School to Bachelor's
- **Experience**: 3-12 years in transport business
- **Tech Proficiency**: Low to Medium
- **Work Location**: Office + Field
- **Work Hours**: Variable

**Role & Responsibilities**:
- View bidding opportunities
- Submit competitive bids
- Assign vehicles and drivers after winning
- Monitor trip execution
- Submit POD, GRN, and invoices
- Track payment status

**Primary Goals**:
- Win competitive bids
- Maximize profit margins
- Build reputation for reliability
- Secure repeat business
- Minimize operational risks

**Pain Points (Current State)**:
- No visibility into bidding opportunities
- Manual bid submission
- No feedback on bid competitiveness
- Uncertain about bid outcomes
- Delayed payment processing

**System Usage Patterns**:
- Primary interface: Vendor Portal (Web + Mobile App)
- Usage frequency: Daily (checking bids)
- Key features used:
  - Active bidding opportunities
  - Bid submission
  - Bid probability indicator (Phase 3)
  - Assigned TO view
  - Vehicle and driver assignment
  - Trip tracking
  - Invoice submission

**Success Metrics**:
- Bid win rate > 30%
- Bid submission time < 2 hours
- Trip completion rate > 98%
- Client satisfaction > 4/5

**Quotes**:
> "I want to know how competitive my bid is without seeing competitor prices."

> "Getting instant notifications for new bidding opportunities would give me an edge."

---

### 18. Driver (Own Fleet)

**Profile**:
- **Age**: 25-50
- **Education**: High School
- **Experience**: 3-15 years driving experience
- **Tech Proficiency**: Low
- **Work Location**: Field (vehicle)
- **Work Hours**: Variable (long hours, early starts)

**Role & Responsibilities**:
- View assigned trips
- Navigate to pickup and delivery locations
- Update trip status (start, in-transit, arrived, completed)
- Record fuel entries with receipts
- Capture POD (signature + photo)
- Report incidents and issues
- Coordinate with helpers

**Primary Goals**:
- Complete trips safely and on time
- Minimize delays
- Maintain vehicle condition
- Earn performance incentives
- Avoid accidents and incidents

**Pain Points (Current State)**:
- Manual paper-based trip sheets
- Difficult to find delivery locations
- Manual fuel record keeping
- No way to report issues immediately
- Delayed trip closure and payment

**System Usage Patterns**:
- Primary interface: Mobile App (Android/iOS)
- Usage frequency: Per trip (multiple per day)
- Key features used:
  - Trip assignment view
  - Trip start/end
  - Navigation (integrated maps)
  - Fuel entry with photo
  - POD capture
  - Incident reporting
  - Emergency contact

**Success Metrics**:
- On-time delivery > 95%
- POD capture rate 100%
- Incident rate < 2%
- Fuel entry compliance > 95%

**Quotes**:
> "I need a simple app that shows me where to go and lets me mark when I'm done."

> "Being able to take a photo of the delivery would protect me from false claims."

---

### 19. Driver (Vendor Fleet)

**Profile**:
- **Age**: 25-55
- **Education**: High School
- **Experience**: 2-15 years driving experience
- **Tech Proficiency**: Low
- **Work Location**: Field (vehicle)
- **Work Hours**: Variable

**Role & Responsibilities**:
- Receive trip assignment from vendor
- Navigate to pickup and delivery locations
- Update trip status
- Capture POD
- Report issues to vendor
- Coordinate with helpers

**Primary Goals**:
- Complete trips safely
- Maintain good relationship with vendor
- Earn consistent income
- Avoid penalties
- Minimize delays

**Pain Points (Current State)**:
- Manual communication with vendor
- No direct access to trip details
- Difficult to prove delivery completion
- Delayed payment from vendor

**System Usage Patterns**:
- Primary interface: Mobile App (limited features)
- Usage frequency: Per trip
- Key features used:
  - Trip details view
  - Trip status updates
  - POD capture
  - Emergency contact

**Success Metrics**:
- On-time delivery > 90%
- POD capture rate 100%
- Incident rate < 3%

**Quotes**:
> "I want to see trip details directly instead of relying on my vendor to tell me."

> "Having proof of delivery on my phone would help me get paid faster."

---

### 20. Helper

**Profile**:
- **Age**: 20-45
- **Education**: Primary to High School
- **Experience**: 1-10 years
- **Tech Proficiency**: Very Low
- **Work Location**: Field (vehicle)
- **Work Hours**: Variable (long hours)

**Role & Responsibilities**:
- Assist driver with navigation
- Help with loading/unloading
- Verify product counts
- Assist with POD collection
- Report issues to driver

**Primary Goals**:
- Complete trips safely
- Assist driver effectively
- Earn daily wages
- Maintain employment

**Pain Points (Current State)**:
- No formal system recognition
- Manual attendance tracking
- Delayed wage payment
- No safety tracking

**System Usage Patterns**:
- Primary interface: None (registered in system by TDO/Vendor)
- Usage frequency: N/A
- Key features used:
  - Profile in system
  - Assignment tracking (by TDO)

**Success Metrics**:
- Assignment compliance 100%
- Incident rate < 2%

**Quotes**:
> "I want my work to be properly recorded so I get paid on time."

---



## Related Documents

- [User Personas Overview](./user-personas.md) - Complete personas index
- [Stakeholders](../../../00-overview/stakeholders.md) - Stakeholder mapping

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team

---

## 📝 Content Source

**PRD-Based Content:**
- PRD Section 4: User Personas & Stakeholders (role names only)

**Discovery-Based Content:**
- Detailed persona profiles (Age, Education, Experience, Pain Points, etc.) sourced from discovery phase materials

> **Note**: This document combines PRD content with detailed information gathered during the discovery phase (meeting minutes, questionnaires, business proposals). PRD provides high-level role names and objectives, while discovery phase materials provide detailed profiles, pain points, and operational context.

