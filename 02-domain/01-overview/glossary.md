---
title: DFMS Glossary - Terms and Definitions
category: business
phase: discovery
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../05-modules/11-reference/glossary.md
  - ../../source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx
  - ../../source-documents/discovery-phase/
tags: [glossary, terminology, definitions, prd-aligned]
---

# DFMS Glossary

> Comprehensive list of terms, acronyms, and definitions used across DFMS documentation

## A

### ADR (Architectural Decision Record)
A document that captures an important architectural decision made along with its context and consequences.

## B

### BS23
Brain Station 23 - The software development company building the DFMS product.

## C

### C4 Model
A hierarchical set of architecture diagrams for visualizing software architecture (Context, Container, Component, Code).

## D

### DFMS (Distribution and Fleet Management System)
The primary product name for the SaaS platform managing logistics and fleet operations.

### Driver
A person assigned to operate a vehicle for transporting goods. Tracked in the system with unique identifiers, licenses, and performance metrics.

### Driver Helper
An assistant assigned to help drivers during trips, particularly with loading, unloading, and quality checks.

### Dwell Time
The duration a vehicle spends stationary at a Point of Interest (POI) during loading, unloading, or waiting.

## E

### ERP (Enterprise Resource Planning)
External accounting/financial systems that DFMS integrates with for invoice synchronization and financial data exchange.

## F

### Fleet
The collection of vehicles owned or managed by an organization for distribution and logistics operations.

### FMCG (Fast-Moving Consumer Goods)
Consumer products that are sold quickly at relatively low cost. One of DFMS's target market segments.

## G

### Geofencing
Virtual geographic boundaries defined around Points of Interest (POIs) to trigger alerts when vehicles enter or exit these zones.

### GPS (Global Positioning System)
Satellite-based navigation system used for real-time vehicle tracking.

## H

### Helper
See **Driver Helper**.

### HQ (Headquarters)
Central administrative office that oversees all distribution and fleet operations.

## I

### IoT (Internet of Things)
Devices integrated with DFMS for live vehicle monitoring, such as GPS trackers and sensors.

### Invoice
A billing document generated after trip completion, synchronized with ERP systems for payment processing.

## L

### LFMS (Logistics and Fleet Management System)
Alternative name for DFMS, emphasizing the logistics aspect of the platform.

## M

### Multi-Tenancy
Architecture pattern allowing multiple organizations (tenants) to use the same application instance with complete data isolation.

### MVP (Minimum Viable Product)
The initial Phase 1 deployment containing core features essential for basic fleet management operations.

## N

### Nourish / Nourish Poultry
The launch client for DFMS, a poultry distribution company whose requirements shaped the initial product features.

## O

### Own Vehicle
A vehicle owned directly by the organization, as opposed to rented/vendor vehicles.

## P

### Phase 1, 2, 3
The three deployment phases of DFMS:
- **Phase 1 (MVP)**: Core foundation (26 weeks)
- **Phase 2**: Optimization & analytics (13 weeks)
- **Phase 3**: Enterprise expansion (13 weeks)

### PIM (Product Inventory Management)
Module for managing product catalogs, specifications, and transport requirements.

### PO (Purchase Order)
A formal order issued to purchase goods or services, managed in Phase 3 of DFMS.

### POI (Point of Interest)
A specific location in the logistics network (warehouse, depot, distribution hub, delivery point).

### PR (Purchase Request)
An internal request to procure goods or services, managed in Phase 3 of DFMS.

## Q

### QC (Quality Control)
Inspection and verification processes ensuring goods meet quality standards during loading, transport, and delivery.

### QC Supervisor
A field personnel responsible for conducting quality control inspections using the mobile QC app.

## R

### Rental Vehicle
A vehicle rented from vendors/third parties, tracked separately from own vehicles.

## S

### SaaS (Software as a Service)
Cloud-based software delivery model where DFMS is hosted and maintained by BS23, accessed by clients via subscription.

### SLA (Service Level Agreement)
Contractual commitment defining the level of service, response times, and support provided to clients.

## T

### T&D (Transport and Distribution)
Department responsible for managing transportation and distribution operations.

### Tenant
An organization using the DFMS platform with isolated data and configurations.

### Third-Party Logistics
See **3PL**.

### TO (Transport Order)
A confirmed transportation order created from an approved Transport Request, assigned to vehicles and drivers.

### TR (Transport Request)
An initial request for transportation, created by logistics teams, requiring approval before becoming a Transport Order.

### Trip
The complete journey of a vehicle from origin to destination, including all associated activities (loading, travel, unloading).

### 3PL (Third-Party Logistics Provider)
External logistics companies that provide transportation and distribution services. One of DFMS's target market segments.

## U

### UAT (User Acceptance Testing)
Testing period at the end of each phase where Nourish validates that features work as expected.

### Utilization
Metric measuring how efficiently vehicles are being used (kilometers traveled, trips completed, idle time).

## V

### Vendor
External third-party logistics provider that owns vehicles and drivers, participating through the Vendor Network Portal.

### Vendor Network Portal
Web-based interface allowing vendors to view transport orders, submit bids, manage their fleet, and submit invoices.

### Vehicle
A transport unit (truck, van, etc.) used for distribution, tracked with unique identifiers, capacity, and maintenance history.

### VTS (Vehicle Tracking System)
External GPS tracking service providers that DFMS integrates with for real-time vehicle monitoring.

## W

### Warehouse
A storage facility serving as a Point of Interest in the distribution network.

### Workshop
Facility where vehicle maintenance and repairs are performed, tracked in the Workshop Management module (Phase 3).

---

## Domain-Specific Terms

### Conjoinment (TR Optimization)
System capability to combine multiple Transport Requests heading to similar destinations into a single Transport Order for efficiency.

### Cost Sharing Model
Business arrangement where custom features beyond standard DFMS scope are developed with shared investment between BS23 and the client.

### Dynamic POI
Point of Interest that can be created, modified, or removed in real-time based on operational needs.

### Geofence Arrival/Departure
Automated logging when a vehicle enters or exits a POI's geofenced boundary.

### Incident Logging
Recording of exceptions, deviations, or issues during trips for audit and accountability.

### Partial Delivery
Scenario where only part of a transport order is delivered, requiring a new vehicle assignment for remaining goods.

### Pre-Loading Inspection
Quality check performed before goods are loaded onto a vehicle.

### Route-Price Analysis
AI/ML-powered analysis to determine optimal vehicle assignment based on route and cost factors.

### Scale Reading
Weight measurement captured at loading/unloading points for accuracy and compliance.

### Tenant Isolation
Security measure ensuring complete data separation between different organizations using DFMS.

### Trip Lifecycle
Complete sequence of states a trip goes through: Created → Assigned → En Route → Delivered → Completed → Invoiced.

### Vehicle Assignment
Process of allocating a specific vehicle and driver to a Transport Order.

---

## Acronyms Quick Reference

| Acronym | Full Form |
|---------|-----------|
| ADR | Architectural Decision Record |
| API | Application Programming Interface |
| BS23 | Brain Station 23 |
| ERP | Enterprise Resource Planning |
| FMCG | Fast-Moving Consumer Goods |
| GPS | Global Positioning System |
| HQ | Headquarters |
| IoT | Internet of Things |
| LFMS | Logistics and Fleet Management System |
| MFA | Multi-Factor Authentication |
| MVP | Minimum Viable Product |
| PIM | Product Inventory Management |
| PO | Purchase Order |
| POI | Point of Interest |
| PR | Purchase Request |
| QC | Quality Control |
| RBAC | Role-Based Access Control |
| SaaS | Software as a Service |
| SLA | Service Level Agreement |
| SMS | Short Message Service |
| SSO | Single Sign-On |
| T&D | Transport and Distribution |
| TO | Transport Order |
| TR | Transport Request |
| UAT | User Acceptance Testing |
| VTS | Vehicle Tracking System |
| 3PL | Third-Party Logistics Provider |

---

## Related Documents

- [Project Summary](./project-summary.md) - Overall project overview
- [Business Context](./business-context.md) - Detailed domain context
- [Terminology](../README.md) - Extended terminology guide
- [Acronyms](../README.md) - Complete acronym list

---

**Last Updated**: 2026-02-13  
**Status**: Living document - Aligned with PRD v1.0  
**Maintainer**: Business Context Team

