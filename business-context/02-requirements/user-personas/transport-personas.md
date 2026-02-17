---
title: DFMS Transport Management Personas
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
tags: [user-personas, transport, personas]
---

# DFMS Transport Management Personas

## Transport Management Personas

### 1. Transport Planner (TP)

**Profile**:
- **Age**: 28-45
- **Education**: Bachelor's in Logistics/Supply Chain Management
- **Experience**: 3-7 years in transport planning
- **Tech Proficiency**: Medium to High
- **Work Location**: Office (Headquarters)
- **Work Hours**: 8 AM - 6 PM (Extended during peak seasons)

**Role & Responsibilities**:
- Review approved Transport Requisitions (TR)
- Create Transport Orders (TO) from TRs
- Decide fleet type (Own vs Vendor) per TO
- Split TRs into multiple TOs when needed
- Monitor overall transport operations
- Handle trip incidents and partial deliveries
- Coordinate with Distribution and Procurement

**Primary Goals**:
- Optimize fleet utilization
- Minimize transport costs
- Ensure on-time deliveries
- Reduce idle time and delays
- Maintain operational efficiency

**Pain Points (Current State)**:
- Manual TR to TO conversion is time-consuming
- No real-time visibility into fleet availability
- Difficult to track multiple TOs simultaneously
- Phone-based coordination with TDOs and vendors
- Manual calculation of vehicle requirements
- No historical data for optimization

**System Usage Patterns**:
- Primary interface: Web dashboard
- Usage frequency: Continuous throughout work hours
- Peak usage: Morning (planning) and evening (review)
- Key features used:
  - TR review queue
  - TO creation and management
  - Fleet availability dashboard
  - Map-based trip monitoring
  - Calendar view for dispatch planning (Phase 2)
  - Trip analytics and reports (Phase 3)

**Success Metrics**:
- TO creation time < 15 minutes
- Fleet utilization > 75%
- On-time delivery rate > 95%
- Cost per trip reduced by 25%

**Quotes**:
> "I need to see all available vehicles and drivers at a glance to make quick decisions."

> "When a trip gets delayed, I need to know immediately so I can take action."

---

### 2. Transport Distribution Officer - Own Fleet (TDO - Own)

**Profile**:
- **Age**: 25-40
- **Education**: Diploma/Bachelor's in Business/Logistics
- **Experience**: 2-5 years in fleet operations
- **Tech Proficiency**: Medium
- **Work Location**: Office with field visits
- **Work Hours**: 7 AM - 7 PM (Shift-based)

**Role & Responsibilities**:
- Receive TOs assigned to Own Fleet
- Assign vehicles, drivers, and helpers to TOs
- Monitor trip execution in real-time
- Handle driver queries and issues
- Coordinate with Gate, Scaling, and Command Center
- Ensure POD collection and trip closure
- Manage driver attendance and availability

**Primary Goals**:
- Ensure smooth trip execution
- Maximize driver and vehicle utilization
- Minimize trip delays and incidents
- Maintain driver satisfaction
- Ensure complete documentation

**Pain Points (Current State)**:
- Manual vehicle and driver assignment
- Difficult to track driver availability
- Phone-based communication with drivers
- No real-time trip status visibility
- Manual POD collection and verification
- Delayed incident reporting

**System Usage Patterns**:
- Primary interface: Web dashboard + Mobile (occasional)
- Usage frequency: Continuous
- Key features used:
  - TO assignment queue
  - Vehicle and driver availability view
  - Real-time trip tracking (map view)
  - Driver state monitoring
  - POD verification
  - Trip closure workflow

**Success Metrics**:
- Assignment time < 10 minutes per TO
- Trip completion rate > 98%
- POD collection rate 100%
- Driver utilization > 80%

**Quotes**:
> "I need to know which drivers are available right now, not who was available yesterday."

> "When a driver reports an issue, I need all trip details instantly to make decisions."

---

### 3. Transport Distribution Officer - Vendor Fleet (TDO - Vendor)

**Profile**:
- **Age**: 26-42
- **Education**: Bachelor's in Business/Supply Chain
- **Experience**: 3-6 years in vendor management
- **Tech Proficiency**: Medium to High
- **Work Location**: Office
- **Work Hours**: 8 AM - 6 PM

**Role & Responsibilities**:
- Receive TOs assigned to Vendor Fleet
- Publish bidding requirements for non-contractual vendors
- Assign TOs to contractual vendors directly
- Evaluate vendor bids and select winners
- Monitor vendor trip execution
- Verify vendor invoices and PODs
- Track vendor performance

**Primary Goals**:
- Get competitive rates from vendors
- Ensure vendor reliability and performance
- Minimize vendor disputes
- Optimize vendor utilization
- Maintain vendor relationships

**Pain Points (Current State)**:
- Manual bidding process via phone/email
- No transparency in vendor pricing
- Difficult to compare vendor performance
- Delayed invoice processing
- Manual vendor payment tracking
- No vendor accountability mechanism

**System Usage Patterns**:
- Primary interface: Web dashboard
- Usage frequency: Daily (multiple times)
- Key features used:
  - TO assignment to vendors
  - Bidding portal management
  - Bid evaluation and comparison
  - Vendor trip monitoring
  - Invoice verification
  - Vendor performance reports (Phase 3)

**Success Metrics**:
- Bid turnaround time < 2 hours
- Vendor disputes < 5%
- Invoice processing time < 48 hours
- Vendor satisfaction > 4/5

**Quotes**:
> "I want vendors to compete fairly so I can get the best rates without manual negotiations."

> "I need a clear audit trail of all vendor interactions to avoid disputes."

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

