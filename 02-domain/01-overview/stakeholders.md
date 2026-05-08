---
title: DFMS Stakeholder Mapping
category: business
phase: discovery
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ./user-personas.md
  - ../../source-documents/meeting-minutes/
  - ../../source-documents/discovery-phase/
tags: [stakeholders, personas, users, prd-aligned]
---

# DFMS Stakeholder Mapping

> Comprehensive mapping of all stakeholders, their roles, needs, and interactions with the DFMS platform

## Overview

DFMS serves multiple stakeholder groups across three main categories:
1. **Primary Stakeholders** - Organizations and teams directly using the system
2. **System Users** - Individual roles interacting with the platform
3. **External Stakeholders** - Third-party entities integrated with DFMS

---

## User Personas & Stakeholders (per PRD)

### Internal Users (Organization-side)

| Persona / Role | User Type | Key Responsibilities |
| --- | --- | --- |
| Super Admin | Internal (Platform) | Tenant onboarding, subscription control, role templates, system security, compliance monitoring |
| Tenant Admin | Internal (Organization) | User onboarding, role assignment, master data setup, admin-assisted account recovery |
| Commercial Officer | Internal | Product requisition for Port transfer and CNF clearance approval confirmation |
| Distribution Officer | Internal | Create TR against the FG product requisition requests with Source and Destination wise quantity planning |
| Distribution Manager | Internal | PR validation and approval, capacity override approvals, PR → TR conversion |
| Procurement Officer | Internal | Port Transfer Requisition review and approval and TR creation, stock/capacity checks, coordination with commercial team |
| Transport Planner | Internal | TO creation, vehicle & driver assignment, vendor bidding trigger |
| Transport Distribution Officer (Own Fleet) | Internal | Vehicle, driver and helper assignment |
| Transport Distribution Officer (Vendor Fleet) | Internal | Managing Contractual and Non-contractual vendors for each TO |
| Gate Man | Internal | Gate-in/out logging, document verification, discrepancy logging |
| Scaling Operator | Internal | Scale-in/out entry, queue token generation, command center notification |
| Command Center Officer | Internal | Vehicle queue monitoring, loading/unloading assignment |
| Loading Supervisor | Internal | Load start/end tracking, coordination with QC |
| Unloading Supervisor | Internal | Unload start/end tracking, QC trigger |
| QC Inspector (Physical) | Internal | Physical inspection, sampling, evidence capture |
| QC Lab Personnel | Internal | Lab test execution, result entry, report upload |
| QC Supervisor / Manager | Internal | QC pass/fail approval, escalation handling, QC analytics |
| Accounts / Finance Officer | Internal | Trip costing review, invoice approval, ERP sync |

### External Users (Outside Organization)

| Persona / Role | User Type | Key Responsibilities |
| --- | --- | --- |
| Vendor Admin | External (Partner) | Vendor profile management, bid participation, invoice submission |

### Standard Role Framework (For Any Organization)

| Role Category | Purpose | Configurability |
| --- | --- | --- |
| Admin Roles | Platform and organization control | Fully configurable via RBAC |
| Operations Roles | Transport, distribution, gate, QC execution | Module-based access |
| Compliance Roles | QC, audit, approvals | Role + workflow driven |
| Finance Roles | Costing, invoicing, reconciliation | Restricted, approval-based |
| External Roles | Vendors, drivers, agents | Isolated access via portal/mobile |

---

## Primary Stakeholders

### Brain Station 23 (BS23)

**Organization Type**: Product Developer and Service Provider

**Role**:
- DFMS product development and maintenance
- SaaS platform hosting and infrastructure
- Continuous product evolution and updates
- Customer support and technical assistance

**Interests**:
- Successful product launch and market adoption
- Sustainable SaaS business model
- Long-term client relationships
- Product scalability across multiple industries

**Responsibilities**:
- Deliver product as per specifications
- Maintain 99.9% platform uptime (per SLA)
- Provide regular feature updates
- Ensure data security and privacy compliance
- Offer technical support and training

**Engagement**:
- Product roadmap planning
- Feature prioritization
- Technical implementation
- Client onboarding and training
- Ongoing support and maintenance

---

### Nourish Poultry (Launch Client)

**Organization Type**: Poultry Distribution Company

**Role**:
- Launch client and requirements partner
- Primary validator of product features
- Reference client for future customers
- Contributor to product evolution

**Interests**:
- Streamlined logistics operations
- Cost reduction and efficiency gains
- Real-time visibility into fleet operations
- Data-driven decision making
- Vendor collaboration capabilities

**Business Context**:
- Operates in poultry distribution sector
- Manages both own fleet and vendor vehicles
- Multiple distribution points and warehouses
- Complex quality control requirements
- Need for ERP integration

**Pain Points** (Pre-DFMS):
- Manual trip planning and scheduling
- Fragmented fleet data across systems
- Limited real-time vehicle tracking
- Inconsistent vendor management
- Poor visibility into trip costs
- Manual quality control processes
- Delayed invoice processing

**Expected Benefits**:
- 40-50% reduction in manual processes
- Real-time fleet visibility
- Improved vendor collaboration
- Automated cost tracking and invoicing
- Better resource utilization
- Data-driven operational insights

**Departments Engaged**:
- Transport & Distribution (T&D)
- Procurement Operations
- Distribution & Sales
- Accounts & Finance
- Commercial Operations
- QA/QC Operations
- MIS (Management Information Systems)

---

## System Users by Department

### 1. Transport & Distribution Department

#### Transport Coordinator / Logistics Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Create and manage Transport Requests (TRs)
- Convert approved TRs to Transport Orders (TOs)
- Assign vehicles and drivers to trips
- Monitor trip progress and status
- Handle exceptions and incidents
- Coordinate with vendors

**Key Features Used**:
- TR/TO Management module
- Trip Management dashboard
- Vehicle assignment interface
- GPS tracking and monitoring
- Vendor Network Portal
- Reporting and analytics

**Pain Points Addressed**:
- Manual trip planning → Automated TR/TO workflow
- No real-time tracking → Live GPS monitoring
- Fragmented vendor communication → Centralized vendor portal

**Success Metrics**:
- Trip completion rate
- On-time delivery percentage
- Average dwell time at POIs
- Resource utilization rates

---

#### Dispatcher
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Real-time trip monitoring
- Vehicle tracking and coordination
- Route optimization
- Emergency response and incident handling
- Communication with drivers

**Key Features Used**:
- Live GPS tracking
- Geofencing alerts
- Trip status dashboard
- Vehicle location monitoring
- Communication tools

**Pain Points Addressed**:
- No real-time visibility → Live tracking with geofencing
- Manual route planning → System-suggested optimal routes
- Delayed incident response → Instant alerts and notifications

---

### 2. Fleet Management

#### Fleet Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Manage vehicle inventory
- Track vehicle utilization and performance
- Schedule preventive maintenance
- Monitor vehicle health
- Optimize fleet composition (own vs rental)

**Key Features Used**:
- Fleet Management module
- Vehicle registration and tracking
- Maintenance scheduling
- Utilization analytics
- Workshop management (Phase 3)
- Fleet health dashboard

**Pain Points Addressed**:
- No centralized vehicle data → Complete vehicle lifecycle tracking
- Reactive maintenance → Preventive maintenance scheduling
- Poor utilization visibility → Comprehensive utilization metrics

---

#### Maintenance Supervisor
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Log workshop activities
- Track maintenance costs
- Monitor vehicle downtime
- Manage spare parts inventory
- Schedule repairs

**Key Features Used**:
- Workshop Management module (Phase 3)
- Maintenance logging
- Cost tracking
- Vehicle health monitoring

---

### 3. Field Operations

#### Driver
**Primary Platform Access**: Mobile App (Driver App)

**Responsibilities**:
- Accept trip assignments
- Navigate routes
- Update trip status
- Report incidents
- Coordinate with helpers

**Key Features Used**:
- Trip assignment view
- GPS navigation
- Status updates
- Incident reporting
- Attendance logging

**Pain Points Addressed**:
- Paper-based trip sheets → Digital trip management
- No navigation support → Integrated GPS navigation
- Manual attendance → Automated GPS-based tracking

**Benefits**:
- Clear digital trip instructions
- Turn-by-turn navigation
- Easy status updates
- Digital incident reporting

---

#### Driver Helper
**Primary Platform Access**: Mobile App (Driver App)

**Responsibilities**:
- Assist with loading/unloading
- Support quality checks
- Help with documentation
- Coordinate with QC supervisors

**Key Features Used**:
- Trip details view
- Loading/unloading status
- QC support features

---

#### QC Supervisor / Quality Inspector
**Primary Platform Access**: Mobile App (QC App)

**Responsibilities**:
- Conduct quality inspections
- Document product quality and quantity
- Capture photos/videos as evidence
- Log pre-loading and post-delivery checks
- Report quality issues

**Key Features Used**:
- QC inspection interface
- Photo/video capture
- Quality metrics logging
- Scale readings input
- Offline mode capability

**Pain Points Addressed**:
- Manual paper-based QC → Digital inspection with photos
- Data entry delays → Real-time QC logging
- No connectivity at sites → Offline mode with later sync

**Success Metrics**:
- Inspection completion rate
- Quality compliance percentage
- Documentation completeness

---

### 4. Vendor Management

#### Vendor Relationship Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Onboard new vendors
- Manage vendor contracts
- Monitor vendor performance
- Handle vendor disputes
- Process vendor invoices

**Key Features Used**:
- Vendor Network Portal (admin side)
- Vendor registration and approval
- Performance dashboards
- Rating system
- Invoice management

---

#### Vendor (Third-Party Logistics Provider)
**Primary Platform Access**: Mobile App (Vendor App) + Web Portal

**Responsibilities**:
- View available Transport Orders
- Submit bids for TOs
- Manage their own fleet and drivers
- Track assigned trips
- Submit invoices

**Key Features Used**:
- TO listing and bidding
- Vendor fleet management
- Trip tracking
- Invoice submission
- Payment status tracking

**Pain Points Addressed**:
- Manual TO communication → Digital TO portal
- Invoice processing delays → Automated invoice submission
- No trip visibility → Real-time trip tracking

**Benefits**:
- Access to more opportunities (TO listings)
- Fair bidding process
- Transparent payment tracking
- Better trip coordination

---

### 5. Finance & Accounting

#### Accounts Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Review and approve trip invoices
- Process vendor payments
- Track transportation costs
- Budget monitoring
- Financial reporting

**Key Features Used**:
- Invoice review and approval
- Cost tracking dashboards
- ERP integration for financial sync
- Financial reports and analytics

**Pain Points Addressed**:
- Manual invoice processing → Automated invoice generation
- Data entry errors → System-generated accurate invoices
- Delayed ERP updates → Real-time ERP synchronization

---

#### Finance Analyst
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Analyze trip costs
- Monitor cost trends
- Budget forecasting
- Cost optimization recommendations

**Key Features Used**:
- Cost analytics dashboard
- Trip cost reports
- Fuel consumption reports
- Vendor cost comparison

---

### 6. Procurement

#### Procurement Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Create Purchase Requests (PRs)
- Manage Purchase Orders (POs)
- Coordinate with transport for product delivery
- Track procurement status

**Key Features Used**:
- PR/PO Management module (Phase 3)
- Product Inventory Management
- Transport coordination
- Vendor selection

---

### 7. Commercial Operations

#### Commercial Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Oversee vendor contracts
- Manage pricing models
- Analyze vendor economics
- Handle vendor disputes

**Key Features Used**:
- Vendor performance reports
- Cost analysis tools
- Contract management
- Dispute resolution system

---

### 8. Quality Assurance

#### QA/QC Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Define quality standards
- Monitor QC compliance
- Review quality reports
- Identify quality trends
- Implement quality improvements

**Key Features Used**:
- QC compliance dashboards
- Quality reports and analytics
- Inspection history
- Quality metrics tracking

---

### 9. Distribution & Sales

#### Distribution Manager
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Plan distribution schedules
- Coordinate with transport team
- Monitor delivery performance
- Handle customer escalations

**Key Features Used**:
- Distribution planning tools
- Delivery tracking
- POI management
- Performance reports

---

### 10. MIS / IT Operations

#### System Administrator
**Primary Platform Access**: Web Portal (Admin Panel)

**Responsibilities**:
- User management
- Role and permission configuration
- System configuration
- Tenant setup (for multi-tenant deployment)
- Audit log review

**Key Features Used**:
- User Management module
- Role-based access control
- System configuration
- Audit logs
- Integration management

---

#### Data Analyst
**Primary Platform Access**: Web Portal

**Responsibilities**:
- Generate custom reports
- Analyze operational data
- Create dashboards
- Provide insights to management

**Key Features Used**:
- Advanced Analytics module
- Custom report builder
- Data export capabilities
- BI integration (Enterprise tier)

---

## External Stakeholders

### GPS / VTS Providers
**Type**: Technology Integration Partner

**Role**: Provide real-time vehicle location data

**Integration Points**:
- GPS tracking API
- Vehicle location updates
- Historical trip data
- Device management

---

### ERP / Accounting Systems
**Type**: Software Integration

**Role**: Financial data synchronization

**Integration Points**:
- Invoice synchronization
- Cost data exchange
- Payment status updates
- Financial reporting data

---

### SMS Gateway Provider
**Type**: Communication Service

**Role**: Send notifications and alerts

**Integration Points**:
- SMS API for notifications
- Delivery status tracking
- Emergency alerts

---

### IoT Device Providers
**Type**: Hardware Integration

**Role**: Vehicle monitoring devices

**Integration Points**:
- Real-time sensor data
- Vehicle health metrics
- Fuel consumption data

---

## Stakeholder Engagement Summary

### Discovery Phase Meetings

Based on meeting minutes, the following departments participated in discovery:

| Department | Meeting Date | Key Focus Areas |
|------------|--------------|-----------------|
| Transport Operations | 2025-09-29 | Trip management, driver workflows, GPS tracking |
| Procurement Operations | 2025-10-06 | PO management, product inventory, vendor coordination |
| Distribution & Sales | 2025-10-06 | Distribution planning, delivery tracking, POI management |
| QA/QC Operations | 2025-10-06 | Quality inspection workflows, mobile QC app requirements |
| Accounts & Finance | 2025-10-08 | Invoice processing, cost tracking, ERP integration |
| Commercial Operations | 2025-10-08 | Vendor contracts, pricing models, dispute resolution |
| MIS Operations | 2025-10-08 | System administration, reporting, data analytics |
| General (All Teams) | 2025-11-25, 2025-12-01, 2025-12-17 | Cross-functional workflows, integration points |

---

## User Persona Summary

| Persona | Primary Access | Key Goals | Critical Features |
|---------|----------------|-----------|-------------------|
| Logistics Coordinator | Web | Efficient trip planning | TR/TO Management, Vehicle Assignment |
| Dispatcher | Web | Real-time monitoring | GPS Tracking, Alerts |
| Fleet Manager | Web | Fleet optimization | Vehicle Management, Maintenance Scheduling |
| Driver | Mobile App | Clear trip execution | Trip View, Navigation, Status Updates |
| QC Supervisor | Mobile App | Quality assurance | Inspection Interface, Photo Capture |
| Vendor | Mobile + Web | Business opportunities | Bidding Portal, Trip Tracking |
| Accounts Manager | Web | Accurate financials | Invoice Management, ERP Integration |
| System Admin | Web | User management | Admin Panel, Configuration |

---

## Related Documents

- [Project Summary](./project-summary.md) - Overall project context
- [User Personas](../02-requirements/02-user-personas/user-personas.md) - Detailed persona descriptions
- [Meeting Minutes](../../source-documents/meeting-minutes/) - Discovery session records

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Status**: Approved  
**Maintained By**: Business Context Team

