---
title: DFMS Scope & Boundaries
category: overview
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../03-module-specifications/00-overview/scope.md
tags: [scope, boundaries, overview, prd-aligned]
---

# DFMS Scope & Boundaries

> What's included and excluded in the DFMS platform

## In Scope (per PRD)

- Multi-tenant SaaS platform with four subscription tiers (Basic, Starter, Growth, Enterprise)
- Web-based application for desktop for Operation Teams (Transport, Distribution, Admin, Accounts, Management)
- Mobile applications for Vendor roles
- Mobile interface for Driver, and QC Supervisor
- Complete transport lifecycle from requisition to delivery and billing with TR list, TR assignment to planner, TO creation, fleet availability check, won vehicle assignment, vendor requirement trigger
- Master Data Configuration: POIs, vehicles, drivers, helpers, vendors, routes, product catalogue, QC Checklist
- Product Requisition Management: PR Creation, distribution review/approval/hold, auto TR creation; capacity snapshot & threshold warning for source/destination POIs
- Owned fleet and vendor fleet management
- Real-time GPS tracking and geofencing
- Quality control workflow with mobile inspection app (Physical Inspection + Lab Inspection)
- Purchase requisition and order management
- Vendor bidding and contract management including vendor registration, verification, bid invitation, bid submission/evaluation, vendor truck/driver details submission, vendor TO status visibility
- Gate, scaling, and command center workflows including gate-in/out time logs, manual scale-in/scale-out weight capture, queue token printing after scale-in, command center assignment to loading/unloading points, discrepancy logs
- Loading/unloading operations: Load/unload start-end time logs and linkage to trip timeline KPIs
- GPS/VTS integration (using recommended vendors)
- Multi-language support (English and Bangla)
- Role-based access control and audit logging

## Out of Scope (per PRD)

- Dealer/agent order placement, dealer sales lifecycle, and retail distribution sales portal
- Product-wise inventory management (SKU/bin-wise stock, batch/lot tracking, FEFO/FIFO) – DFMS tracks **POI total capacity only**
- Full Warehouse Management System (WMS) features (inventory bin management, pick-pack-ship)
- Manufacturing execution/production planning (MES) and feed mill production control
- Customer Relationship Management (CRM) capabilities
- Full Procurement ERP replacement (end-to-end SCM, vendor sourcing, tendering, LC management, payment processing) – DFMS only supports limited PR/PO modules as defined and/or integrations
- Port/ICD customs clearance system and third-party sea enterprise workflows (only transport linkage and milestone tracking where applicable)
- Automated integration with physical weighing bridges/scaling machines in P1 (manual entry only in core scope)
- ERP Sync (Procurement Module – [To be considered under DFMS v2]), Human Resource Management System (HRMS)
- Manufacturing Execution System (MES) features
- Handle Driver recruitment
- HRMS payroll processing
- Direct customer order placement portal (B2C e-Commerce)
- IoT device manufacturing or GPS hardware provision
- Vehicle telematics analytics (provided by GPS vendors)
- Fuel card issuance and payment processing
- Handling Driver Salary and Helper Salary through DFMS Platform

## Assumptions (per PRD)

- Organizations have stable internet access at HO/depots/feed mills; offline capture will be used where connectivity is weak
- POI capacity (total storage volume) values and threshold rules (e.g., 80/90/100%) [TBD] will be configured and maintained by authorized users
- Stock/capacity updates will be driven by operational events: **loading completion + scale-out** (source reduction) and **unloading completion + QC pass** (destination increase)
- Vehicles are equipped with GPS devices or organizations willing to procure recommended devices
- Drivers/vendor reps/QC staff have Android smartphones capable of running DFMS apps and capturing photos (minimum OS/device baseline to be agreed)
- Manual inputs (gate times, scale weights, load/unload timestamps, QC observations) will be entered by designated staff and treated as source-of-truth
- Management commitment to digital transformation and change management
- Organization willing to standardize and digitize current manual processes
- GPS data from the IoT device is expected to be compatible with and sufficient to support the defined scope, functionality, and operational requirements of this platform

## Dependencies

### External Dependencies

- **GPS / VTS Provider**: API Access, documentation, support
- **Google Maps**: API keys, quota approval
- **ERP System** (If Integration considered): API availability, test environment access, data mapping

### Internal Dependencies

- **DevOps**: Dev / Test / Stage / Production environment setup
- **Business Teams**: Sample Data for testing, UAT
- **Legal / Compliance**: Approval for data handling practices

### Technical Dependencies

- Mobile app depends on Backend API completion
- GPS tracking depends on GPS / VTS provider integration
- Vendor portal depends on Core TO / TR modules

## Target Users (per PRD)

DFMS is designed for:

- Large Manufacturing organizations
- Agro-based enterprises
- FMCG logistics operators
- Multi-depot, multi-vendor transport eco-systems
- Organizations with internal QC and compliance requirements

---

## Related Documents

- [Product Vision](./product-vision.md) - Strategic vision
- [Value Proposition](./value-proposition.md) - How DFMS addresses challenges
- [Business Objectives](./business-objectives.md) - Strategic goals
- [Project Summary](./project-summary.md) - Complete project overview

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team

