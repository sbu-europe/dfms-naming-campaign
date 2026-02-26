---
source_document: PRD_DFMS_v1.0.md
source_sections: Scope, In Scope, Out of Scope
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
---

# Product Scope

## In Scope

### Core Platform
- Multi-tenant SaaS platform with subscription tiers (Basic, Starter, Growth, Enterprise)
- Web-based application for desktop users (operations, management, admin)
- Mobile applications for drivers, QC supervisors, vendors
- Role-based access control and audit logging
- Multi-language support (English and Bangla)

### Transport Lifecycle Management
- **Product Requisition (PR):** Depot, feed mill, commercial officers create PRs
- **Transport Requisition (TR):** Distribution/procurement review, approval, TR creation
- **Transport Order (TO):** TO creation, fleet assignment (own vs vendor)
- **Trip Management:** Trip creation, GPS tracking, status updates, POD capture
- **Delivery Confirmation:** Digital POD with signature and photos

### Fleet Management
- **Own Fleet:** Vehicle registration, driver management, helper management
- **Vendor Fleet:** Vendor onboarding, bidding system, contractual/non-contractual vendors
- **Real-Time Tracking:** GPS/VTS integration, geofencing, live location updates
- **Fleet Availability:** Real-time vehicle status (available, in-trip, maintenance)

### POI Operations
- **Gate Management:** Gate-in/gate-out logging, document verification, discrepancy logging
- **Scaling/Weighing:** Scale-in/scale-out weight capture, queue token printing
- **Command Center:** Queue management, loading/unloading assignment
- **Loading/Unloading:** Start/end time tracking, trip timeline linkage

### Quality Control
- **Physical Inspection:** Configurable checklists by product category
- **Sample Management:** QR-labeled samples for traceability
- **Lab Testing:** Test request, result tracking, evidence capture
- **QC Decision:** Pass/Fail/Recheck with photo/video evidence

### Master Data Configuration
- POIs (depots, factories, ports)
- Vehicles (registration, capacity, GPS linkage)
- Drivers & helpers (license, NID, references)
- Vendors (onboarding, documents, compliance)
- Products (catalogue, categories, UOM, QC requirements)
- Routes (origin-destination pairs)

### Vendor Ecosystem
- Vendor registration and verification
- Bid invitation for non-contractual vendors
- Bid submission and evaluation
- Vendor performance tracking
- Invoice submission and approval

---

## Out of Scope

### Warehouse Management
- **No bin-level inventory:** No SKU/batch/lot tracking
- **No pick-pack-ship:** Not a full WMS
- **Capacity tracking only:** Total POI capacity, not item-wise stock

### ERP Functionality
- **No full procurement:** Limited PR/PO for transport requisition only
- **No accounting:** Trip costing and invoicing only, not full financial management
- **No HR/payroll:** Driver attendance tracking, but no salary processing

### Manufacturing Systems
- **No MES:** No production planning or shop floor control
- **No feed mill operations:** No production execution management

### Customer-Facing Systems
- **No CRM:** No customer relationship or sales management
- **No dealer portal:** No B2B order placement for dealers/agents
- **No B2C e-commerce:** No direct consumer order portal

### Customs & Trade
- **No customs clearance:** Only transport linkage to ports, not LC/customs workflows

### Hardware Provision
- **No GPS device manufacturing:** Integrates with existing GPS providers
- **No IoT device supply:** Platform only, not hardware vendor

### Advanced Features (Phase 2+)
- Automated weighbridge integration (manual entry only in Phase 1)
- Fuel card issuance and payment processing
- Full ERP sync (procurement module)
- Automated route optimization (AI/ML)

---

## Assumptions

### Infrastructure
- Organizations have stable internet at HQ/depots/feed mills
- Offline capability for mobile apps in low-connectivity areas
- Vehicles equipped with GPS devices (or organization willing to procure)
- Drivers have Android smartphones for mobile app

### Data & Configuration
- POI capacity values configured and maintained by authorized users
- Stock updates driven by operational events (loading completion, unloading + QC pass)
- Manual inputs (gate times, scale weights) treated as source-of-truth

### Organizational Readiness
- Management commitment to digital transformation
- Willingness to standardize and digitize manual processes
- Change management and user training support

### External Dependencies
- GPS/VTS provider API access and support
- Google Maps API keys and quota approval
- ERP system API availability (if integration required)

---

## Dependencies

### External Dependencies
- **GPS/VTS Provider:** API access, documentation, support
- **Google Maps:** API keys, quota approval
- **ERP System (if integration):** API availability, test environment access, data mapping

### Internal Dependencies
- **DevOps:** Dev/test/stage/production environment setup
- **Business Teams:** Sample data for testing, UAT participation
- **Legal/Compliance:** Approval for data handling practices

### Technical Dependencies
- Mobile app depends on backend API completion
- GPS tracking depends on GPS/VTS provider integration
- Vendor portal depends on core TO/TR modules

---

## Phase 1 Scope (MVP)

**Core Foundation & Operational Enablement:**
- User & tenant management
- Role-based access control
- Master data configuration (POI, vehicles, drivers, products)
- Transport lifecycle (PR → TR → TO → Trip → Delivery)
- Fleet management (own fleet + vendor fleet)
- Gate, scaling, command center operations
- Quality control workflows
- GPS tracking and geofencing
- Vendor bidding system
- Mobile apps (driver, QC, vendor)
- Basic reporting

**Phase 2+:**
- Fuel management
- Advanced analytics & dashboards
- Predictive ETA
- Route optimization
- Automated weighbridge integration

---

## Summary

DFMS is **focused on transport and logistics operations**, not a full ERP, WMS, or manufacturing system. The platform digitizes the end-to-end transport lifecycle from requisition to delivery, with strong support for quality control, vendor management, and yard operations—all critical for manufacturing and distribution companies in emerging markets.
