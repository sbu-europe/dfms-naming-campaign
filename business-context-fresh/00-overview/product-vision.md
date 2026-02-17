---
source_document: PRD_DFMS_v1.0.md
source_sections: Document Purpose, Product Overview, Purpose of the Document, Product Vision, DFMS Value Proposition, What DFMS Is NOT
extracted_date: 2026-02-13
---

## Document Purpose

This Product Requirements Document (PRD) defines the comprehensive requirements for the Distribution and Fleet Management System (DFMS), a multi-tenant SaaS platform designed to digitize and optimize transport and logistics operations for manufacturing, distribution, and supply chain organizations.

This document serves as the authoritative reference for:

*   Business stakeholders to understand the strategic value and business drivers
*   Product and engineering teams to design, develop, and implement the system
*   Quality assurance teams to develop test plans and validate requirements
*   Project management teams to plan resources, timelines, and deliverables
*   Executive management to make informed investment and go-to-market decisions

The Distribution and Fleet Management System (DFMS) is a comprehensive, multi-tenant SaaS platform designed to revolutionize transport and logistics operations for manufacturing, distribution, and supply chain companies in emerging markets. DFMS provides end-to-end visibility and control over the complete logistics lifecycle—from transport requisition creation to final delivery confirmation and billing—while supporting both owned and vendor fleet operations.


## Product Overview


## Purpose of the Document

DFMS is a centralized, role-driven digital platform designed to plan, execute, monitor and optimize Transport, fleet, and distribution operations across distributed supply chain locations such as feed mills, depots, warehouses, ports, and factories.


## Product Vision

DFMS) is a unified, enterprise-grade platform designed to digitize, standardize, and optimize end-to-end transport, quality control, and logistics operations across complex supply chain environments.

DFMS aims to replace fragmented manual processes (Excel sheets, WhatsApp coordination, paper challans, siloed systems) with a single source of operational truth covering:

*   Product movement
*   Fleet utilization
*   Vendor coordination
*   Quality assurance
*   Costing and billing
*   Compliance and auditability

The platform is designed to support organizations operating mixed fleet models (own + vendor), multi-location POIs, QC-heavy workflows, and high-volume daily transport operations.


## DFMS Value Proposition

DFMS value proposition includes:

*   Organizations operating large-scale logistics and distribution networks face challenges including:
*   Fragmented transport planning across departments
*   Manual gate, scaling, and QC processes
*   No real-time visibility into trips, delays, or incidents
*   Limited accountability across own and vendor fleets
*   Disconnected costing, invoicing, and audit trails
*   DFMS eliminates these gaps by providing a single operational backbone from

Product Requisition → Transport → Delivery → QC → Costing.


## What DFMS Is NOT

*   Not a Warehouse Management System (no bin-level inventory)
*   Not an ERP replacement
*   Not a GPS hardware provider
*   Not a CRM or Dealer Sales System

DFMS in an enterprise-grade, cloud-based platform that provides end-to-end management of transport and logistics, encompassing:

| Capability Domain | Description |
| --- | --- |
| Transport Planning & Execution | Manages the complete logistics lifecycle from Product Requisition (PR) → Transport Requisition (TR) → Transport Order (TO) → Trip → Proof of Delivery (POD). Includes configurable approval workflows (Depot/Feed Mill/Commercial → Distribution/Procurement → Transport), TR review dashboards, TO creation with quantity split, own vs vendor fleet assignment, incident handling (halt, partial delivery, re-delivery), and full auditability across all stages. |
| Fleet Operations (Own Vehicles) | Provides centralized management of own fleet vehicles including registration, capacity (derived from wheel count), ownership, depot/POI assignment, GPS tracker linkage, and document repository (fitness, tax token, insurance). Supports real-time vehicle status (Available, In-Trip, Loading/Unloading, Idle, Maintenance), utilization tracking, and automated availability filtering during TO and trip assignment. |
| Driver & Helper Management | Maintains structured master data for drivers and helpers with license details, NID, driver type (own, permanent/temporary), experience, references, accident history, medical and training records. Supports dynamic driver–vehicle–helper pairing, driver state tracking (on-trip, available, absent), and eligibility validation during trip assignment. |
| Gate, Scaling & Command Center Operations | Digitize yard Digitizes yard operations through standardized Gate-In → Scale-In → Queue → Load/Unload → Scale-Out → Gate-Out workflows. Captures vehicle, driver, party type (Supplier/Dealer/Internal), PO/DO/TO/Challan details, manual scale weights, queue token generation, discrepancy logging, and Command Center assignment of vehicles to loading/unloading points with full timestamp tracking. |
| Trip Management & GPS Workflow | Controls trip creation, scheduling, monitoring, and closure. Trips are created after TO approval with assigned vehicle, driver, helper, and route. Integrates GPS/VTS for near real-time location tracking, POI geofence entry/exit detection, dwell time calculation, map-based visualization, and auto-closure after QC Pass and POD confirmation. |
| Quality Assurance/Quality Control Workflow | Supports end-to-end QC operations for raw materials and finished goods across ports, feed mills, warehouses, and depots. Includes pre-QC context display, physical inspection, sampling with QR-based labeling, lab test request and result tracking, QC Pass/Fail/Auto-pass decisions, recheck escalation, evidence capture (photos/videos), and turnaround time measurement at each QC stage. |
| Product Requisition & Inventory Capacity View | Enables depots, feed mills, and commercial/procurement users to raise product requisitions for finished goods or port transfers with product, quantity, urgency, and source/destination POIs. Displays real-time POI capacity snapshots (total capacity, current stock, free capacity) and projected utilization after requisition, with threshold warnings to support capacity-aware planning. |
| Vendor Ecosystem & Bidding | Provides a vendor portal for transport vendors to onboard (contractual or non-contractual), manage compliance documents, receive TO-based bid invitations, submit rates and available vehicles, share truck/driver details, track trip execution, and submit invoices. Supports transparent bid evaluation, partial allocation across vendors, and vendor performance tracking. |
| Fuel, Workshop & Maintenance | Tracks vehicle operating health and costs through fuel consumption monitoring (fuel entries, mileage, receipts), fuel efficiency analytics, workshop job management (maintenance category, estimated vs actual time and cost), parts and service logging, downtime tracking, and automated vehicle status updates affecting availability for trip planning. |
| Gate/Depot/POI Inventory Visibility | Maintains POI master data (Factory, Feed Mill, Depot, Warehouse, Port) with GPS coordinates, geofence radius, and operational role (inbound/outbound/neutral). Tracks total storage capacity, current stock level, free capacity, and in-transit stock, updated at loading completion (source) and QC-passed unloading (destination). |
| Financial & Costing Management | Enables trip-level cost capture and analysis, including fuel, driver/helper cost, maintenance cost, and vendor rates. Supports manual cost entry, own vs vendor cost comparison, trip cost summaries, and integration hooks for ERP-based invoicing and vendor payment processing. |
| Mobility & Field Applications | Includes mobile and responsive interfaces for field execution: Driver app (trip view, route info, POD capture, offline staging), Vendor app (bidding, trip management, invoice submission), and QC mobile/web interface for on-site inspections, sampling, and evidence capture |
| Analytics, Reporting & Alerts | Delivers operational dashboards and standard reports covering trips, fleet utilization, vendor performance, QC turnaround, and costing. Provides KPI tracking, delay and exception analysis, exportable reports, and configurable alerts for key events (TO updates, delays, incidents, QC outcomes). |
| Security, Audit & Multi-tenancy | Implements enterprise-grade security with role-based access control (RBAC), configurable permissions per module, account lockout and admin override, password reset flows suitable for mixed digital literacy, and comprehensive audit logs for all sensitive actions. Multi-tenant architecture ensures strict data isolation per organization for secure SaaS deployment.. |
