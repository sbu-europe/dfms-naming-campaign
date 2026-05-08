---
title: DFMS Business Context
category: business
phase: discovery
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ./business-objectives.md
  - ../../source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx
  - ../../source-documents/discovery-phase/
tags: [business-context, domain, logistics, fleet-management, prd-aligned]
---

# DFMS Business Context

> Comprehensive business domain knowledge for the Distribution and Fleet Management System

## Executive Summary

DFMS (Distribution and Fleet Management System) is a unified, enterprise-grade platform designed to digitize, standardize, and optimize end-to-end transport, quality control, and logistics operations across complex supply chain environments.

The system addresses the critical need for centralized, automated, and transparent fleet management across multiple operational areas: transport planning, vehicle tracking, vendor coordination, quality control, and financial management.

### Primary Business Objectives

> For detailed business objectives, see **[Business Objectives](./business-objectives.md)**

---

## Industry Context

### Distribution & Logistics Sector

The distribution and logistics industry is characterized by:

**Key Characteristics**:
- High operational complexity with multiple moving parts
- Time-sensitive operations requiring real-time coordination
- Significant cost pressures (fuel, maintenance, labor)
- Regulatory compliance requirements
- Growing demand for transparency and traceability
- Increasing adoption of digital solutions

**Market Trends**:
- Digital transformation of traditional logistics operations
- Real-time tracking becoming standard expectation
- Integration with ERP and accounting systems
- Mobile-first solutions for field operations
- Data-driven decision making and analytics
- Vendor collaboration through digital platforms

**Target Industries**:
1. **Logistics Companies**: Third-party logistics providers managing fleets
2. **Manufacturers**: Companies with distribution operations
3. **FMCG Companies**: Fast-moving consumer goods distributors
4. **Government Programs**: Public sector distribution initiatives
5. **3PL Providers**: Specialized logistics service providers

---

## Business Domain Overview

### Core Business Processes

DFMS supports the complete lifecycle of distribution operations:

#### 1. Transport Planning & Scheduling
**Purpose**: Plan and schedule transportation of goods from origin to destination

**Key Activities**:
- Receive transport requirements from various departments
- Create Transport Requests (TRs) with product details
- Approve TRs and convert to Transport Orders (TOs)
- Optimize routes and consolidate multiple requests
- Assign vehicles and drivers to TOs

**Business Rules**:
- TRs must be approved before becoming TOs
- Vehicle assignment based on product type, weight, and capacity
- Routes optimized for efficiency and cost
- Special handling requirements must be considered

**Stakeholders**: Logistics Coordinators, Dispatchers, Transport Managers

---

#### 2. Fleet Management
**Purpose**: Manage vehicle inventory, utilization, and maintenance

**Key Activities**:
- Register and track all vehicles (own and vendor)
- Monitor vehicle utilization and performance
- Schedule preventive maintenance
- Track vehicle health and availability
- Manage vehicle documentation (licenses, insurance)
- Log workshop activities and costs

**Business Rules**:
- Vehicles must have valid licenses and insurance
- Preventive maintenance scheduled based on mileage/time
- Vehicle downtime tracked with reasons
- Each vehicle treated as individual entity with lifecycle

**Stakeholders**: Fleet Managers, Maintenance Supervisors

---

#### 3. Trip Execution & Monitoring
**Purpose**: Execute transportation trips with real-time monitoring

**Key Activities**:
- Driver receives trip assignment
- Vehicle departs from origin POI
- Real-time GPS tracking during transit
- Geofencing alerts at POI boundaries
- Loading and unloading at designated points
- Quality checks at various stages
- Trip completion and documentation

**Business Rules**:
- Drivers must accept trip assignments
- GPS tracking mandatory for all trips
- Arrival/departure logged at each POI
- Dwell time tracked for efficiency analysis
- Partial deliveries require new vehicle assignment

**Stakeholders**: Drivers, Dispatchers, QC Supervisors

---

#### 4. Vendor Management
**Purpose**: Collaborate with third-party logistics providers

**Key Activities**:
- Onboard and register vendors
- Share Transport Orders with vendor network
- Accept vendor bids for TOs
- Assign TOs to selected vendors
- Track vendor fleet and driver performance
- Process vendor invoices and payments
- Rate vendor performance

**Business Rules**:
- Vendors must be approved before bidding
- Bidding process transparent and fair
- Vendor fleet must meet quality standards
- Performance ratings affect future opportunities
- Invoice submission follows standardized format

**Stakeholders**: Vendor Relationship Managers, Vendors, Accounts Team

---

#### 5. Quality Control
**Purpose**: Ensure product quality throughout distribution

**Key Activities**:
- Pre-loading inspection (product quality, quantity, weight)
- In-transit quality monitoring
- Delivery inspection (condition, quantity verification)
- Photo/video documentation
- Quality metrics logging
- Issue reporting and resolution

**Business Rules**:
- QC checks mandatory at defined checkpoints
- Photo evidence required for quality issues
- Scale readings captured for weight verification
- Offline mode available for low-connectivity areas
- QC reports linked to trips for traceability

**Stakeholders**: QC Supervisors, Quality Managers

---

#### 6. Cost Management & Invoicing
**Purpose**: Track costs and generate accurate invoices

**Key Activities**:
- Calculate trip costs (fuel, tolls, driver wages)
- Track vehicle operating costs
- Generate invoices upon trip completion
- Sync invoices with ERP systems
- Process vendor claims
- Monitor cost trends and variances

**Business Rules**:
- Invoices auto-generated after trip completion
- Cost calculations based on distance, vehicle type, and time
- ERP synchronization mandatory for financial accuracy
- Partial claims supported with additional claim capability
- All costs must be auditable

**Stakeholders**: Accounts Managers, Finance Analysts

---

#### 7. Procurement & Inventory
**Purpose**: Manage product procurement and inventory (Phase 3)

**Key Activities**:
- Create Purchase Requests (PRs)
- Approve PRs and generate Purchase Orders (POs)
- Link POs with transport operations
- Track product inventory
- Coordinate delivery with transport team

**Business Rules**:
- PRs require approval workflow
- POs linked to specific products and quantities
- Transport automatically triggered for PO delivery
- Product specifications include transport requirements

**Stakeholders**: Procurement Managers, Inventory Controllers

---

## Business Entities

### Primary Entities

#### Transport Request (TR)
- **Definition**: Initial request for transportation of goods
- **Created By**: Logistics coordinators, department heads
- **Lifecycle**: Draft → Submitted → Approved → Converted to TO
- **Key Attributes**: Product details, quantity, origin, destination, requested date

#### Transport Order (TO)
- **Definition**: Confirmed transportation order with vehicle assignment
- **Created From**: Approved Transport Request
- **Lifecycle**: Created → Assigned → In Progress → Delivered → Completed → Invoiced
- **Key Attributes**: TR reference, vehicle, driver, route, estimated cost

#### Trip
- **Definition**: Actual journey of a vehicle from origin to destination
- **Associated With**: Transport Order
- **Lifecycle**: Created → Started → En Route → Arrived → Completed
- **Key Attributes**: TO reference, actual route, start/end times, GPS coordinates, dwell times

#### Vehicle
- **Definition**: Transport unit (truck, van, etc.)
- **Types**: Own vehicles, vendor vehicles
- **Lifecycle**: Registered → Active → Under Maintenance → Retired
- **Key Attributes**: Registration number, type, capacity, mileage, ownership

#### Driver
- **Definition**: Person operating a vehicle
- **Types**: Own drivers, vendor drivers
- **Lifecycle**: Registered → Active → On Trip → Inactive
- **Key Attributes**: License number, contact info, performance rating, assigned vehicle

#### Vendor
- **Definition**: Third-party logistics provider
- **Lifecycle**: Registered → Approved → Active → Suspended
- **Key Attributes**: Company name, fleet size, service areas, performance rating

#### Point of Interest (POI)
- **Definition**: Specific location in distribution network
- **Types**: Warehouse, depot, distribution hub, delivery point
- **Key Attributes**: Name, address, GPS coordinates, geofence boundary, operating hours

#### Quality Check (QC)
- **Definition**: Inspection record for product quality
- **Types**: Pre-loading, in-transit, delivery
- **Key Attributes**: Inspector, timestamp, product condition, quantity verified, photos

---

## Business Rules & Constraints

### Transport Planning Rules

1. **TR Approval**: All Transport Requests must be approved before conversion to Transport Orders
2. **Vehicle Capacity**: Vehicle assignment must respect weight and volume capacity limits
3. **Product Compatibility**: Certain products require specific vehicle types (e.g., refrigerated)
4. **Driver Assignment**: Drivers can only be assigned to one active trip at a time
5. **Route Optimization**: System suggests route optimization for multiple TRs to same destination

### Fleet Management Rules

1. **License Validity**: Vehicles with expired licenses cannot be assigned to trips
2. **Maintenance Windows**: Vehicles under maintenance marked unavailable
3. **Utilization Tracking**: All vehicle movements tracked for utilization metrics
4. **Preventive Maintenance**: Scheduled based on mileage thresholds or time intervals
5. **Vehicle Health**: 8/10 point checklist for vehicle health monitoring

### Quality Control Rules

1. **Mandatory Checkpoints**: QC checks required at loading, unloading, and delivery
2. **Photo Documentation**: Photos mandatory for quality issues or deviations
3. **Weight Verification**: Scale readings captured at loading and unloading
4. **Offline Capability**: QC data can be captured offline and synced later
5. **Inspection Completeness**: All QC fields must be filled before trip completion

### Vendor Management Rules

1. **Vendor Approval**: Only approved vendors can access TO listings
2. **Bidding Transparency**: All eligible vendors see same TO information
3. **Performance Rating**: Vendor ratings affect future TO visibility
4. **Invoice Standards**: Vendor invoices must follow standardized format
5. **Dispute Resolution**: Formal process for handling vendor disputes

### Financial Rules

1. **Invoice Generation**: Invoices auto-generated upon trip completion
2. **ERP Synchronization**: All invoices must sync with ERP within 24 hours
3. **Cost Accuracy**: Trip costs calculated based on actual distance and time
4. **Partial Claims**: System supports partial invoice claims with additional claims later
5. **Audit Trail**: All financial transactions must be auditable

---

## Operational Workflows

### Primary Workflows

1. **TR to TO to Trip Workflow**
   - Logistics coordinator creates TR
   - Manager approves TR
   - System converts TR to TO
   - Vehicle and driver assigned
   - Trip created and executed
   - Invoice generated

2. **Vendor Bidding Workflow**
   - TO shared with vendor network
   - Vendors submit bids
   - Best bid selected
   - TO assigned to vendor
   - Vendor executes trip
   - Vendor submits invoice

3. **Quality Control Workflow**
   - Pre-loading inspection
   - Product loaded onto vehicle
   - In-transit monitoring
   - Delivery inspection
   - QC report generated
   - Issues escalated if needed

4. **Maintenance Workflow**
   - Preventive maintenance scheduled
   - Vehicle marked unavailable
   - Workshop activities logged
   - Costs tracked
   - Vehicle returned to service

---

## Key Performance Indicators (KPIs)

### Operational KPIs

- **On-Time Delivery Rate**: Percentage of trips completed on schedule
- **Average Dwell Time**: Time spent at POIs for loading/unloading
- **Vehicle Utilization**: Percentage of time vehicles are productively used
- **Trip Completion Rate**: Percentage of trips completed successfully
- **Route Efficiency**: Actual vs. planned route distance

### Quality KPIs

- **QC Compliance Rate**: Percentage of trips with complete QC checks
- **Quality Issue Rate**: Percentage of trips with quality problems
- **Documentation Completeness**: Percentage of trips with complete documentation

### Financial KPIs

- **Cost Per Trip**: Average cost per completed trip
- **Cost Per Kilometer**: Average cost per kilometer traveled
- **Fuel Efficiency**: Kilometers per liter of fuel
- **Invoice Accuracy**: Percentage of invoices without disputes
- **Payment Cycle Time**: Average time from trip completion to payment

### Vendor KPIs

- **Vendor Performance Score**: Composite score based on multiple factors
- **Vendor On-Time Rate**: Vendor-specific on-time delivery percentage
- **Vendor Cost Efficiency**: Cost comparison across vendors
- **Vendor Reliability**: Percentage of accepted TOs completed successfully

---

## Integration Points

### Internal Integrations

1. **ERP/Accounting System**
   - Invoice synchronization
   - Cost data exchange
   - Payment status updates
   - Financial reporting

2. **Product Inventory System**
   - Product catalog sync
   - Inventory levels
   - Product specifications
   - Transport requirements

### External Integrations

1. **GPS/VTS Providers**
   - Real-time vehicle location
   - Historical trip data
   - Device management
   - Geofencing capabilities

2. **SMS Gateway**
   - Notification delivery
   - Alert messages
   - Emergency communications

3. **IoT Devices**
   - Vehicle sensors
   - Fuel monitoring
   - Temperature monitoring (for refrigerated transport)

---

## Compliance & Audit

### Regulatory Compliance

- **Vehicle Licensing**: All vehicles must maintain valid licenses
- **Driver Licensing**: Drivers must have valid commercial licenses
- **Insurance**: Mandatory insurance for all vehicles
- **Safety Standards**: Compliance with transportation safety regulations
- **Environmental**: Emission standards compliance

### Audit Requirements

- **Activity Logs**: All user actions logged for audit trail
- **Data Retention**: Transaction data retained per regulatory requirements
- **Change Tracking**: All modifications to TRs, TOs, and invoices tracked
- **Access Logs**: User access and authentication events logged
- **Incident Reporting**: All incidents documented with justification

---

## Success Factors

### Critical Success Factors

1. **User Adoption**: Field teams (drivers, QC) must adopt mobile apps
2. **Data Accuracy**: Real-time data must be accurate and reliable
3. **System Uptime**: 99.9% availability for operational continuity
4. **Integration Stability**: Seamless integration with ERP and GPS systems
5. **Vendor Participation**: Active vendor engagement in bidding portal
6. **Performance**: Fast response times for real-time operations

### Risk Mitigation

1. **Connectivity Issues**: Offline mode for mobile apps in low-connectivity areas
2. **Data Loss**: Regular backups and disaster recovery procedures
3. **System Downtime**: High availability architecture with failover
4. **Integration Failures**: Retry mechanisms and error handling
5. **User Resistance**: Comprehensive training and change management

---

## Future Considerations

### Potential Enhancements

- AI/ML for predictive maintenance
- Advanced route optimization algorithms
- Blockchain for supply chain transparency
- Autonomous vehicle integration
- Drone delivery coordination
- Carbon footprint tracking
- Customer portal for delivery tracking

---

## Related Documents

- [Project Summary](./project-summary.md) - Overall project overview
- [Stakeholders](./stakeholders.md) - Complete stakeholder mapping
- [Glossary](./glossary.md) - Terms and definitions
- [Business Processes](../04-business-processes/README.md) - Detailed process documentation
- [Requirements](../02-requirements/) - Functional and non-functional requirements

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team

