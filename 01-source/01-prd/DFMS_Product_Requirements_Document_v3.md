**PRODUCT REQUIREMENTS DOCUMENT**

**OptiLogist –**

**A Distribution and Fleet Management System**

(OptiLogist - DFMS)

*Multi-Tenant SaaS Platform*

*for*

*Transport & Logistics Operations Management*

Version 1.0

November 2025

**CONFIDENTIAL**

**Document Information**

|  |  |
| --- | --- |
| **Document Title** | OptiLogist Distribution and Fleet Management System – Product Requirement Document |
| **Document ID** | OptiLogist-PRD-003 |
| **Version** | 3.0 |
| **Date** | 06, July 2026 |
| **Classification** | Confidential – Internal Use Only |

**Version History**

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Version** | **Date** | **Author** | **Description of Changes** | **Approved By** |
| 1.0 | 03, November, 2025 | Nishat Farzana | Initial PRD created based on Business requirement and operational Workflows | Monojit Shil |
| 2.0 | 15 April, 2026 | Nishat Farzana | Master Data fields |  |
| 3.0 | 06 July, 2026 | Md Azmir Afridi Khan | New workflow for transport planner and elimination of TDO-Own fleet user role | Nishat Farzana, Md. Mahfuzur Rahman |

Table of Contents

[1. Executive Summary 1](#_Toc237870086)

[1.1 Document Purpose 1](#_Toc237870087)

[2. Product Overview 1](#_Toc237870088)

[2.1 Purpose of the Document 1](#_Toc237870089)

[2.2 Product Vision 1](#_Toc237870090)

[2.3 DFMS Value Proposition 1](#_Toc237870091)

[2.4 What DFMS Is NOT 2](#_Toc237870092)

[2.5 Scope 4](#_Toc237870093)

[2.5.1 In Scope 4](#_Toc237870094)

[2.5.2 Out of Scope 4](#_Toc237870095)

[2.5.3 Assumptions 5](#_Toc237870096)

[2.5.4 Dependencies 5](#_Toc237870097)

[2.5.4.1 External Dependencies 5](#_Toc237870098)

[2.5.4.2 Internal Dependencies 5](#_Toc237870099)

[2.5.4.3 Technical Dependencies 5](#_Toc237870100)

[2.5.5 Target Users 5](#_Toc237870101)

[3. Business Context 7](#_Toc237870102)

[3.1 Business Objectives 7](#_Toc237870103)

[3.1.1 Primary Business Objectives 7](#_Toc237870104)

[3.1.1.1 Current-State Challenges 7](#_Toc237870105)

[3.1.1.2 Business Impact 7](#_Toc237870106)

[3.1.2 Stakeholder-Specific Objectives 7](#_Toc237870107)

[4. User Personas & Stakeholders 9](#_Toc237870108)

[4.1 Internal Users (Organization-side) 9](#_Toc237870109)

[4.2 External Users (Outside Organization) 10](#_Toc237870110)

[4.3 Standard Role Framework (For Any Organization) 10](#_Toc237870111)

[5. System Architecture & Technical Approach 11](#_Toc237870112)

[5.1 High-Level Architecture 11](#_Toc237870113)

[5.2 User Flow Diagram 11](#_Toc237870114)

[5.2.1 Operational Flow (Finished Goods) 11](#_Toc237870115)

[5.2.2 Operational Flow (Port Consignment Transfer) 12](#_Toc237870116)

[5.3 Technology Stack 14](#_Toc237870117)

[6. Functional Requirements by Module 15](#_Toc237870118)

[6.1 System Foundation 15](#_Toc237870119)

[6.1.1 Authentication & Security 15](#_Toc237870120)

[6.1.2 Multi-Factor Authentication (2FA) 15](#_Toc237870121)

[6.1.3 Session Control 16](#_Toc237870122)

[6.1.4 Role-based Access Control (Role Hierarchy) 17](#_Toc237870123)

[6.1.5 Dynamic Role Builder 20](#_Toc237870124)

[6.1.6 Multi-Tenant Separation in RBAC 21](#_Toc237870125)

[6.2 User & Tenant Management 21](#_Toc237870126)

[6.2.1 Organization Signup & Tenant Creation 21](#_Toc237870127)

[6.2.2 Subscription Plan Selection 22](#_Toc237870128)

[6.2.3 User Invitation & Activation 23](#_Toc237870129)

[6.2.4 Drivers Invitation & Activation 24](#_Toc237870130)

[6.2.5 OTP Verification System 25](#_Toc237870131)

[6.2.6 Account Deactivation 26](#_Toc237870132)

[6.2.7 Password & Account Reset 27](#_Toc237870133)

[6.2.8 User Activity & Audit Logs 27](#_Toc237870134)

[6.2.9 Tenant Data Isolation 28](#_Toc237870135)

[6.3 Master Data Configuration 28](#_Toc237870136)

[6.3.1 Entity Registration (Master Setup) 28](#_Toc237870137)

[6.3.2 Bulk Upload & Inline Master Data Management 32](#_Toc237870138)

[6.3.3 Master Tables (CRUD Operation) 33](#_Toc237870139)

[6.3.4 Data Consistency Rules (Referential Control) 34](#_Toc237870140)

[6.4 Product Inventory Management (PIM) 35](#_Toc237870141)

[6.4.1 Product Catalogue Management – Product Master Data 35](#_Toc237870142)

[6.5 POI (Point of Interest) - Management & Geofencing 37](#_Toc237870143)

[6.5.1 Point Of Interest (POI) Setup, CRUD & Classification 37](#_Toc237870144)

[6.5.2 GPS Tracking & Monitoring (Live GPS) 39](#_Toc237870145)

[6.5.3 POI Geofencing Boundary Management 40](#_Toc237870146)

[6.5.4 Vehicle Arrival Tracking at POI 40](#_Toc237870147)

[6.5.5 Dwell Time Tracking 41](#_Toc237870148)

[6.5.6 GPS-Based Vehicle Maintenance Tracking 42](#_Toc237870149)

[6.6 Fleet & Vehicle Management 42](#_Toc237870150)

[6.6.1 Vehicle Brands 42](#_Toc237870151)

[6.6.2 Vehicle Registration & Master Data Management 43](#_Toc237870152)

[6.6.3 Vehicle Status and Health Management 45](#_Toc237870153)

[6.6.4 Vehicle Tracking & Dashboard 46](#_Toc237870154)

[6.6.5 Vehicle Status Matrix & Availability 47](#_Toc237870155)

[6.6.6 Vehicle and Resource Assignment 47](#_Toc237870156)

[6.6.7 Vehicle Utilization Analytics 47](#_Toc237870157)

[6.6.8 Vehicle Downtime Management 48](#_Toc237870158)

[6.6.9 Manual Workshop Entry 48](#_Toc237870159)

[6.7 Driver & helper Management 49](#_Toc237870160)

[6.7.1 Driver Master Data & Driver Invitation as Users 49](#_Toc237870161)

[6.7.2 Driver-Vehicle Assignment 50](#_Toc237870162)

[6.7.3 Driver State Tracking 51](#_Toc237870163)

[6.7.4 Driver Availability Status Tracking 51](#_Toc237870164)

[6.7.5 Driver Leave Management 52](#_Toc237870165)

[6.7.6 Driver Performance Tracking 53](#_Toc237870166)

[6.7.7 Helper Profile 53](#_Toc237870167)

[6.7.8 Helper Assignment 54](#_Toc237870168)

[6.8 Fuel Management System 54](#_Toc237870169)

[6.8.1 Fuel Management – Fuel Consumption Tracking 54](#_Toc237870170)

[6.8.2 Fuel Management – Fuel Entry System 55](#_Toc237870171)

[6.8.3 Fuel Performance Monitoring 55](#_Toc237870172)

[6.9 Product Requisition & Transport Requisition Management 55](#_Toc237870173)

[6.9.1 Finished Goods Product Requisition Creation 55](#_Toc237870174)

[6.9.2 Distribution Review & TR Creation by Distribution Officer (DO) - (Finished Goods) 57](#_Toc237870175)

[6.9.3 Transport Requisition (TR) Approval Process by Distribution Manager (DM) 58](#_Toc237870176)

[6.9.4 Source Stock Validation & Update 59](#_Toc237870177)

[6.9.5 Destination Stock Validation & Update 60](#_Toc237870178)

[6.10 Port Shipment Management 61](#_Toc237870179)

[6.10.1 Port Shipment (Import) Registration 61](#_Toc237870180)

[6.10.2 Procurement Approval Process (Port Shipment Registration Transfer) 62](#_Toc237870181)

[6.11 Transport Order (TO) Management 63](#_Toc237870182)

[6.11.1 Transport Requisition (TR) Assessment & Review by Transport Planner 63](#_Toc237870183)

[6.11.2 Transport Order (TO) Creation by Transport Planner - Finished Goods 65](#_Toc237870184)

[6.11.3 Transport Order (TO) Creation by Transport Planner - Port Shipments Transfer 66](#_Toc237870185)

[6.11.4 TO Lifecyle Management 67](#_Toc237870186)

[6.11.5 Vehicle Execution – Vehicle Planning for Own Fleet (TP) 68](#_Toc237870187)

[6.12 TO Execution 69](#_Toc237870188)

[6.12.1 To Execution – Own Fleet 69](#_Toc237870189)

[6.12.2 TO Execution – Vendor Fleet by TDO – Vendor Fleet): Contractual Vendor Assignment 70](#_Toc237870190)

[6.12.3 TO Execution – Vendor Fleet by TDO – Vendor Fleet): Non-Contractual Vendor (Bidding Workflow) 70](#_Toc237870191)

[6.12.4 Vendor Execution & Confirmation 71](#_Toc237870192)

[6.12.5 Transport Order (TO) - Vendors (Contractual/Non-contractual) View 72](#_Toc237870193)

[6.12.5.1 Fleet Availability Validation (Own Fleet) 73](#_Toc237870194)

[6.13 Transport Dashboard – Map-Based Dashboard 73](#_Toc237870195)

[6.13.1 Live GPS 73](#_Toc237870196)

[6.13.2 Dashboard Layer – KPIs, POI Presence, TO Route View, Default Landing 75](#_Toc237870197)

[6.13.3 TO Dispatch Planning (Calendar View) 76](#_Toc237870198)

[6.13.4 TR Conjoinment 77](#_Toc237870199)

[6.13.5 Partial & Re-Delivery Management (Accident / Incident Handling) 77](#_Toc237870200)

[6.13.6 Trip Closure & Proof of Delivery (POD) 78](#_Toc237870201)

[6.13.7 Trip Costing 79](#_Toc237870202)

[6.14 Vendor Management 80](#_Toc237870203)

[6.14.1 Vendor Onboarding & Registration 80](#_Toc237870204)

[6.14.2 Vendor Tenant-Join Approval Workflow 81](#_Toc237870205)

[6.14.3 Vendors Profile 81](#_Toc237870206)

[6.14.4 Vendor Bidding Portal (TDO Publish to Bidding) 82](#_Toc237870207)

[6.14.5 Bid Evaluation 83](#_Toc237870208)

[6.14.6 Bid Position & Probability Indicator 83](#_Toc237870209)

[6.14.7 Vehicle & Driver Information Submission 83](#_Toc237870210)

[6.14.8 Real-time TO Updates (Vendor Portal) 84](#_Toc237870211)

[6.14.9 Vendor Billing & Claims Management 84](#_Toc237870212)

[6.14.10 Vendor Trip Cost & Billing & Claims Management 85](#_Toc237870213)

[6.14.11 Vendor Rating System 85](#_Toc237870214)

[6.15 Gate Management 85](#_Toc237870215)

[6.15.1 Gate-In Entry against System Generated TO 85](#_Toc237870216)

[6.15.2 On Demand Third Party Supplier and Dealer Management At Gate-In 86](#_Toc237870217)

[6.15.3 Gate-Out Entry 87](#_Toc237870218)

[6.16 Scaling/Weighing Management 88](#_Toc237870219)

[6.16.1 Scale-In (Weight Entry) 88](#_Toc237870220)

[6.16.2 Queue Token Generation 89](#_Toc237870221)

[6.16.3 Scale-Out (Weight Exit) 89](#_Toc237870222)

[6.17 Command Center Operations 90](#_Toc237870223)

[6.17.1 Queue Monitoring – View Waiting Vehicles 90](#_Toc237870224)

[6.17.2 Bay (Load/Unload Point) Assignments 91](#_Toc237870225)

[6.17.3 Assignment Alert (Live Queue Visibility) 91](#_Toc237870226)

[6.18 Loading Operation Management 92](#_Toc237870227)

[6.18.1 Loading Monitoring – Load Start/End Date & Time Entry 92](#_Toc237870228)

[6.18.2 Loading Notifications 92](#_Toc237870229)

[6.18.3 Unload Monitoring – Unload Start/End Date & Time Entry 93](#_Toc237870230)

[6.19 Mobile Interface 93](#_Toc237870231)

[6.19.1.1 Driver Mobile Interface - Trip Management (Trip Assignment & Navigation) 93](#_Toc237870232)

[6.19.2 Mobile Interface – QC/QA Inspection 94](#_Toc237870233)

[6.19.2.1 Mobile QC Inspection Interface 94](#_Toc237870234)

[6.19.2.2 Physical Inspection (Quality Control – QC) - Pre-QC Context Display 94](#_Toc237870235)

[6.19.2.3 Sample Creation 95](#_Toc237870236)

[6.19.2.4 Sample Labeling (QR Code) 95](#_Toc237870237)

[6.19.2.5 Exception Recording (Media Capture) 96](#_Toc237870238)

[6.19.2.6 QC Context Display 96](#_Toc237870239)

[6.19.3 Sampling 96](#_Toc237870240)

[6.19.3.1 Sample Collection Event 96](#_Toc237870241)

[6.19.3.2 Configurable Checklist & Sampling Form 97](#_Toc237870242)

[6.19.3.3 QR Code Label 97](#_Toc237870243)

[6.19.3.4 Sampling Timestamp 97](#_Toc237870244)

[6.19.4 Lab Test Request Creation 97](#_Toc237870245)

[6.19.4.1 Create Lab Request 97](#_Toc237870246)

[6.19.4.2 Lab Estimated Completion 98](#_Toc237870247)

[6.19.4.3 Lab Report Upload 98](#_Toc237870248)

[6.19.4.4 Lab Status Monitoring 98](#_Toc237870249)

[6.19.5 QC Analysis 99](#_Toc237870250)

[6.19.5.1 QC Pass/Fail/Auto-Pass Tracking 99](#_Toc237870251)

[6.19.5.2 Escalation Workflow (Recheck) 99](#_Toc237870252)

[6.19.5.3 QC Trigger on Unloading – Notify QC Department 99](#_Toc237870253)

[6.20 Mobile Application 100](#_Toc237870254)

[6.20.1 Vendor Mobile Application 100](#_Toc237870255)

[6.20.1.1 Vendor Portal Access (Bidding & Trip Management) 100](#_Toc237870256)

[6.20.1.2 Invoice Management & Claims Submission 100](#_Toc237870257)

[6.21 Multi-language Support 100](#_Toc237870258)

[6.21.1 Language Configuration & Toggle 100](#_Toc237870259)

[6.21.2 Multi-Lingual UI/UX – Mobile Applications 101](#_Toc237870260)

[6.22 Reporting & Analytics 101](#_Toc237870261)

[6.22.1 Transport & Trip Reports 101](#_Toc237870262)

[6.22.2 Vendor Reports 102](#_Toc237870263)

[6.22.3 Fleet, Vehicle & Driver Performance Reports 102](#_Toc237870264)

[6.22.4 Costing & Finance Reports 103](#_Toc237870265)

[6.22.5 System Usage & Audit Reports 103](#_Toc237870266)

[6.23 Notification & Alerts 103](#_Toc237870267)

[6.23.1 Basic System Alerts 103](#_Toc237870268)

[6.23.2 Stakeholder Notification (Role-Based Alerts) 104](#_Toc237870269)

[6.23.3 TO Update Alerts 104](#_Toc237870270)

[7. Phase-wise Feature Structure 106](#_Toc237870271)

[7.1 Phase – 1 Core Foundation & Operational Enablement (MVP Scope) 106](#_Toc237870272)

[7.1.1 System Foundation & Security 106](#_Toc237870273)

[7.1.2 Master Date Configuration 106](#_Toc237870274)

[7.1.3 POI Management 106](#_Toc237870275)

[7.1.4 Product Inventory Management (PIM) 106](#_Toc237870276)

[7.1.5 Product Requisition Management 107](#_Toc237870277)

[7.1.6 Transport Requisition (TR) Management 107](#_Toc237870278)

[7.1.7 Transport Order (TO) Management 107](#_Toc237870279)

[7.1.8 Vendor Management & Bidding 107](#_Toc237870280)

[7.1.9 Gate, Weighing, Command Center & QC Operations 107](#_Toc237870281)

[7.1.10 Quality Control (QC) Workflow 107](#_Toc237870282)

[7.1.11 Trip Management & Tracking 108](#_Toc237870283)

[7.1.12 GPS Tracking & Basic Trip Costing 108](#_Toc237870284)

[7.2 Phase – 2 Intermediate Enhancements & Analytics 108](#_Toc237870285)

[7.2.1 Transport Planning Optimization 108](#_Toc237870286)

[7.2.2 Fleet & Vehicle Enhancements 108](#_Toc237870287)

[7.2.3 Fuel Management System 108](#_Toc237870288)

[7.2.4 Vendor Billing & Finance Integration 108](#_Toc237870289)

[7.2.5 Reporting & Dashboard 108](#_Toc237870290)

[7.3 Phase 3 – Workshop, Advanced Analytics, Alerts KPIs and Tracking 109](#_Toc237870291)

[7.3.1 Multi-Language Support 109](#_Toc237870292)

[7.3.2 Vendor Intelligence & Competitive Transparency 109](#_Toc237870293)

[7.3.3 Fleet, Fuel & Driver Performance 109](#_Toc237870294)

[7.3.4 Operational Event Notification and Alerts 109](#_Toc237870295)

[7.3.5 Reporting & Advanced Analytics 110](#_Toc237870296)

[7.3.6 Workshop & Maintenance 110](#_Toc237870297)

[7.3.7 Procurement Automation & Integration 110](#_Toc237870298)

[1.1 110](#_Toc237870299)

[8. Non-Functional Requirements 111](#_Toc237870300)

[8.1 Performance Requirements 111](#_Toc237870301)

[8.2 Scalability Requirements 111](#_Toc237870302)

[8.3 Availability & Reliability 111](#_Toc237870303)

[8.4 Security Requirements 111](#_Toc237870304)

[8.5 Usability Requirements 111](#_Toc237870305)

[8.6 Compatibility Requirements 111](#_Toc237870306)

[9. Integration Requirements 112](#_Toc237870307)

[9.1 GPS/VTS Integration 112](#_Toc237870308)

[9.2 Map & Routing APIs 112](#_Toc237870309)

[10. Security & Compliance 113](#_Toc237870310)

[10.1 Data Security 113](#_Toc237870311)

[10.2 Access Control 113](#_Toc237870312)

[10.3 Audit & Compliance 113](#_Toc237870313)

[10.4 Regulatory Compliance 113](#_Toc237870314)

[11. Mobile Application Requirements 114](#_Toc237870315)

[11.1 Vendor Mobile App (Flutter) 114](#_Toc237870316)

[12. Mobile Interface Requirements 115](#_Toc237870317)

[12.1 Driver Mobile Interface 115](#_Toc237870318)

[12.2 QC Inspector - Physical Mobile Interface 115](#_Toc237870319)

[13. Training & Documentation 116](#_Toc237870320)

[13.1 Documentation Deliverables 116](#_Toc237870321)

[13.2 Knowledge Transfer 116](#_Toc237870322)

[2 Glossary & Terminology 117](#_Toc237870323)

[2.1 Appendix A 117](#_Toc237870324)

[2.2 Domain Terms 117](#_Toc237870325)

[2.3 117](#_Toc237870326)

[2.4 117](#_Toc237870327)

[3 Document Sign-off 118](#_Toc237870328)

# Executive Summary

## Document Purpose

This Product Requirements Document (PRD) defines the comprehensive requirements for the OptiLogist - Distribution and Fleet Management System (DFMS), a multi-tenant SaaS platform designed to digitize and optimize transport and logistics operations for manufacturing, distribution, and supply chain organizations.

This document serves as the authoritative reference for:

* Business stakeholders to understand the strategic value and business drivers
* Product and engineering teams to design, develop, and implement the system
* Quality assurance teams to develop test plans and validate requirements
* Project management teams to plan resources, timelines, and deliverables
* Executive management to make informed investment and go-to-market decisions

The OptiLogist - Distribution and Fleet Management System (DFMS) is a comprehensive, multi-tenant SaaS platform designed to revolutionize transport and logistics operations for manufacturing, distribution, and supply chain companies in emerging markets. DFMS provides end-to-end visibility and control over the complete logistics lifecycle—from transport requisition creation to final delivery confirmation and billing—while supporting both owned and vendor fleet operations.

## Product Overview

## Purpose of the Document

DFMS is a centralized, role-driven digital platform designed to plan, execute, monitor and optimize Transport, fleet, and distribution operations across distributed supply chain locations such as feed mills, depots, warehouses, ports, and factories.

## Product Vision

DFMS) is a unified, enterprise-grade platform designed to digitize, standardize, and optimize end-to-end transport, quality control, and logistics operations across complex supply chain environments.

DFMS aims to replace fragmented manual processes (Excel sheets, WhatsApp coordination, paper challans, siloed systems) with a single source of operational truth covering:

* Product movement
* Fleet utilization
* Vendor coordination
* Quality assurance
* Costing and billing
* Compliance and auditability

The platform is designed to support organizations operating mixed fleet models (own + vendor), multi-location POIs, QC-heavy workflows, and high-volume daily transport operations.

## DFMS Value Proposition

DFMS value proposition includes:

* Organizations operating large-scale logistics and distribution networks face challenges including:
* Fragmented transport planning across departments
* Manual gate, scaling, and QC processes
* No real-time visibility into trips, delays, or incidents
* Limited accountability across own and vendor fleets
* Disconnected costing, invoicing, and audit trails
* DFMS eliminates these gaps by providing a single operational backbone from

Product Requisition → Transport → Delivery → QC → Costing.

## What DFMS Is NOT

* Not a Warehouse Management System (no bin-level inventory)
* Not an ERP replacement
* Not a GPS hardware provider
* Not a CRM or Dealer Sales System

DFMS in an enterprise-grade, cloud-based platform that provides end-to-end management of transport and logistics, encompassing:

|  |  |
| --- | --- |
| **Capability Domain** | **Description** |
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

## Scope

### In Scope

* Multi-tenant SaaS platform with four subscription tiers (Basic, Starter, Growth, Enterprise)
* Web-based application for desktop for Operation Teams (Transport, Distribution, Admin, Accounts, Management)
* Mobile applications for Vendor roles
* Mobile interface for Driver, and QC Inspector - Physical
* Complete transport lifecycle from requisition to delivery and billing with TR list, TR assignment to planner, TO creation, fleet availability check, won vehicle assignment, vendor requirement trigger
* Master Data Configuration: POIs, vehicles, drivers, helpers, vendors, product catalogue, QC Checklist, Loading/Unloading Points
* Product Requisition Management: PR Creation, distribution review/approval/hold, TR creation; capacity snapshot & threshold warning for source/destination POIs
* Owned fleet and vendor fleet management with bidding
* Real-time GPS tracking and geofencing
* Quality control workflow with mobile inspection app (Physical Inspection + Lab Inspection)
* Vendor bidding and contract management including vendor registration, verification, bid invitation, bid submission/evaluation, vendor truck/driver details submission, vendor TO status visibility
* Gate, scaling, and command center workflows including gate-in/out time logs, manual scale-in/scale-out weight capture, queue token printing after scale-in, command center assignment to loading/unloading points, discrepancy logs
* Loading/unloading operations: Load/unload start-end time logs and linkage to trip timeline KPIs
* GPS/VTS integration (using recommended vendors)
* Multi-language support (English and Bangla)
* Role-based access control and audit logging

### Out of Scope

* Dealer/agent order placement, dealer sales lifecycle, and retail distribution sales portal
* Product-wise inventory management (SKU/bin-wise stock, batch/lot tracking, FEFO/FIFO) – DFMS tracks **POI total capacity only**
* Full Warehouse Management System (WMS) features (inventory bin management, pick-pack-ship)
* Manufacturing execution/production planning (MES) and feed mill production control
* Customer Relationship Management (CRM) capabilities
* Full Procurement ERP replacement (end-to-end SCM, vendor sourcing, tendering, LC management, payment processing) – DFMS only supports limited PR/PO modules as defined and/or integrations
* Port/ICD customs clearance system and third-party sea enterprise workflows (only transport linkage and milestone tracking where applicable)
* Automated integration with physical weighing bridges/scaling machines in P1 (manual entry only in core scope)
* ERP Sync (Procurement Module – [To be considered under DFMS v2]),
* Human Resource Management System (HRMS)
* Manufacturing Execution System (MES) features
* Handle Driver recruitment
* HRMS payroll processing
* Direct customer order placement portal (B2C e-Commerce)
* IoT device manufacturing or GPS hardware provision
* Vehicle telematics analytics (provided by GPS vendors)
* Fuel card issuance and payment processing
* Handling Driver Salary and Helper Salary through DFMS Platform

### Assumptions

* Organizations have stable internet access at HO/depots/feed mills; offline capture will be used where connectivity is weak
* POI capacity (total storage volume) values and threshold rules (e.g., 80/90/100%) [TBD] will be configured and maintained by authorized users’
* Stock/capacity updates will be driven by operational events: **loading completion + scale-out** (source reduction) and **unloading completion + QC pass** (destination increase)
* Vehicles are equipped with GPS devices or organizations willing to procure recommended devices
* Drivers/vendor reps/QC staff have Android smartphones capable of running DFMS apps and capturing photos (minimum OS/device baseline to be agreed)
* Manual inputs (gate times, scale weights, load/unload timestamps, QC observations) will be entered by designated staff and treated as source-of-truth
* Management commitment to digital transformation and change management
* Organization willing to standardize and digitize current manual processes
* GPS data from the IoT device is expected to be compatible with and sufficient to support the defined scope, functionality, and operational requirements of this platform

### Dependencies

### External Dependencies

* GPS / VTS Provider: API Access, documentation, support
* Google Maps: API keys, quota approval
* ERP System (If Integration considered TBD): API availability, text environment access, data mapping

### Internal Dependencies

* DevOps: Dev / Test / Stage / Production environment setup
* Business Teams: Sample Data for testing, UAT
* Legal / Compliance: Approval for data handling practices

### Technical Dependencies

* Mobile app depends on Backend API completion
* GPS tracking depends on GPS / VTS provider integration
* Vendor portal depends on Core TO / TR modules

### Target Users

DFMS is designed for:

* Large Manufacturing organizations
* Agro-based enterprises
* FMCG logistics operators
* Multi-depot, multi-vendor transport eco-systems
* Organizations with internal QC and compliance requirements

# Business Context

## Business Objectives

### Primary Business Objectives

The primary objectives of DFMS are:

* Digitize and automate end-to-end transport and logistics operations
* Provide real-time visibility across the entire supply chain
* Optimize fleet utilization and reduce operational costs
* Improve on-time delivery and turnaround time
* Increase fleet and driver utilization
* Improve data-driven transport planning decisions
* Create a scalable, multi-tenant platform supporting diverse customer sizes

### Current-State Challenges

Organizations currently facing:

* Manual PR / TR / TO Handling
* No real-time visibility into vehicle location or status
* Ad-hoc vendor selection and rate management
* Disconnected QC and lab workflows
* Limited stock and capacity awareness at POIs
* Manual costing, invoicing, and reconciliation
* High dependency on human coordination and tribal knowledge

### Business Impact

* Delivery delays and missed commitments
* Vehicle idle time and congestion at POIs
* Quality disputes without evidence trails
* Cost leakage due to poor vendor and trip costing visibility
* Compliance and audit risks

### Stakeholder-Specific Objectives

|  |  |
| --- | --- |
| **Stakeholder Group** | **Key Objectives** |
| Executive Management | Reduce logistics operating costs; Improve ROI in fleet investments; Enable strategic decisions through analytics; Ensure regulatory compliance |
| Transport/Logistics Managers | Optimize trip planning Reduce empty runs; Improve on-time delivery; Balance owned vs vendor fleet; Real-time operational visibility |
| Fleet Managers | Maintain 100% compliance; Reduce vehicle downtime; Optimize maintenance costs; Track fuel consumption. |
| Finance Department | Accurate cost tracking; Invoicing; Timely vendor |
| Operations Teams | Streamline workflows; Reduce manual data entry; Improve QC turnaround; Real-time exception alerts; Mobile accessibility |
| Vendors/Partners | Fair bidding opportunities; Transparent performance tracking; Timely payments; Easy invoice submission; Clear expectations |

# User Personas & Stakeholders

## Internal Users (Organization-side)

|  |  |  |
| --- | --- | --- |
| Persona / Role | User Type | Key Responsibilities |
| Platform Super Admin (DFMS Platform Admin) | Platform Portal | Tenant onboarding, subscription control, role templates, system security, compliance monitoring |
| Tenant Super Admin | Tenant Portal (All Menu) | Tenant Super Admin will be onboarded and managed by DFMS Platform Admin. Tenant Super Admin will have access to all the modules including Dashboard, Requisition, Port Shipments, Distribution, Procurement, Transport, Master Data, Gate Operations, Scaling Operations, Command Center Operations, Loading Operations, Unloading Operations, QC Checkpoint, Fleet Operations & Driver Management under Driver Supervisor Module, Trips, Vendors, User & Access Module. Tenant Super Admin will be able to onboard and Manage (Create, Update, Suspension) all Users |
| Tenant Admin | Tenant Portal (All Menu) | **Tenant Admin** will be onboarded and managed by **Tenant Super Admin. Tenant Admin**  will have access to all the modules including Dashboard, Requisition, Port Shipments, Distribution, Procurement, Transport, Master Data, Gate Operations, Scaling Operations, Command Center Operations, Loading Operations, Unloading Operations, QC Checkpoint, Fleet Operations & Driver Management under Driver Supervisor Module, Trips, Vendors, User & Access Module. Tenant Admin won't be able to create Tenant Super Admin or manage (Update or Delete) tenant super Admin. |
| POI Admin | Tenant Portal (All Menu) | POI-Admin user will be able to perform all yard operation modules at their single assigned POI only — Gate (Gate-In/Gate-Out), Scaling, Command Center, Loading, Unloading, and QC Checkpoint when applicable at that site. |
| Depot Officer | FG Product Transfer Requester | Create FG Transfer Request (Depot) |
| Feed Mill Officer | FG Product Transfer Requester | Create FG Transfer Request (Feed Mill) |
| Commercial Officer | RM Port Shipment Requester | Product requisition for Port shipment and CNF clearance approval confirmation |
| Distribution Officer (DO) | FG Transport Requester | Create TR against the FG product requisition requests with Source and Destination wise quantity planning, PR → TR conversion |
| Distribution Manager | FG Transport Requester Approver | TR validation and approval, capacity override approvals |
| Procurement Officer | RM Transport Requester and Approver | Create/Update and Review Transport Request (TR) for Port Shipment request and approves Port shipment and makes distribution breakdown plan |
| Transport Planner (TP) | Transport Order Requester, Planner | Create TOs against TR with Vehicle Quantity, C&F Clearance Note, and type of vehicle required, assigns fleet (Own vs Vendor), Vehicle Planning with vehicle, driver and helper assignment of Own Fleet |
| Transport Distribution Officer (Vendor Fleet) | Vendor TO Management | Managing Contractual and Non-contractual vendors for each TO, Bid management |
| GateMan | Yard Operation | Manages gate-in/gate-out entries, On-demand TO creation for Dealer and Supplier entries |
| Scaling Operator | Yard Operation | Enters Scale-in/out entry, queue token generation |
| Command Center Officer | Yard Operation | Scaled Vehicle queue monitoring, loading/unloading assignment |
| Loading Personnel | Yard Operation | Logs loading start/end times, Quantity Loaded, and Seal Number |
| Unloading Personnel | Yard Operation | Logs Unload start/end tracking |
| QC Inspector (Physical) | Yard Operation | Physical inspection, sampling, evidence capture |
| QC QA Lab Technician | Yard Operation | Lab test execution, result entry, report upload |
| Driver Supervisor | Yard Operation | Responsible for managing vehicle inspection, Dispatch Approval, Driver attendance and Leave management |
| Driver | Yard Operation | Uses mobile interface for trip updates |
| Accounts / Finance Officer | Finance | Trip costing review, invoice approval, ERP sync |

## External Users (Outside Organization)

|  |  |  |
| --- | --- | --- |
| Persona / Role | User Type | Key Responsibilities |
| Vendor – Contractual Vendor | Vendor Transport Supply | Access assigned TOs, input vehicle information, Driver information |
| Vendor – Non-Contractual Vendor | Vendor Transport Supply – Bid & Win | Access bid management for bidding |

## Standard Role Framework (For Any Organization)

|  |  |  |
| --- | --- | --- |
| Role Category | Purpose | Configurability |
| Admin Roles | Platform and organization control | Fully configurable via RBAC |
| Operations Roles | Transport, distribution, gate, QC execution | Module-based access |
| Compliance Roles | QC, audit, approvals | Role + workflow driven |
| Finance Roles | Costing, invoicing, reconciliation | Restricted, approval-based |
| External Roles | Vendors, drivers, agents | Isolated access via portal/mobile |

# System Architecture & Technical Approach

## High-Level Architecture

OptiLogist - Distribution and Fleet Management System (DFMS) follows a modern, cloud-native, multi-tenant SaaS architecture with the following key components:

![High-level Architecture Diagram](data:image/png;base64...)

Figure 1: High-Level Infrastructure Diagram

## User Flow Diagram

This section holds the end-to-end operational flow diagram for Finished Goods and Port Transfer of the OptiLogist platform.

## Operational Flow (Finished Goods)

Below is a snippet of the End-to-End Operational Workflow for Product Requisition (Finished Goods) from Depot/Feed Mill/Factory/Warehouse to Distribution approval to Transport request and Transport order creation –

![](data:image/png;base64...)

Figure 2: Product Requisition to Distribution Department Approval to Transport Requisition and Transport Order Creation

Below is a snippet of the End-to-End Operational Workflow for Transport planning utilizing (Own vehicle) or through vendor vehicle by vendor bidding –

![](data:image/png;base64...)

Figure 3: Transport Planning

Below is a snippet of the End-to-End Operational Workflow for Gate-in to Gate-out workflow including scale-in/Scale-out, Command Center Operations, Loading/Unloading, Scale-out, and Gate-out –

![](data:image/png;base64...)

Figure 4: Workflow for Gate-in to Gate-out workflow including scale-in/Scale-out, Command Center Operations, Loading/Unloading, Scale-out, and Gate-out from Source POI to Destination POI

## Operational Flow (Port Consignment Transfer)

Below is a snippet of the End-to-End Operational Workflow for Product Requisition (Port Consignment Transfer) from Commercial to procurement approval to Transport request and Transport order creation –

![](data:image/png;base64...)

Figure 2: Product Requisition to Distribution Department Approval to Transport Requisition and Transport Order Creation

Below is a snippet of the End-to-End Operational Workflow for Transport planning utilizing (Own vehicle) or through vendor vehicle by vendor bidding –

![](data:image/png;base64...)

Figure 3: Transport Planning

Below is a snippet of the End-to-End Operational Workflow for Gate-in to Gate-out workflow including scale-in/Scale-out, Command Center Operations, QC (physical & Lab Analysis), Loading/Unloading, Scale-out, and Gate-out –

![](data:image/png;base64...)

Figure 4: Workflow for Gate-in to Gate-out workflow including scale-in/Scale-out, Command Center Operations, QC (physical & Lab Analysis), Loading/Unloading, Scale-out, and Gate-out

## Technology Stack

|  |  |
| --- | --- |
| **Layer** | **Technology Options** |
| Frontend Web | Django Templates + Bootstrap 5 (+ Alpine.js) |
| Mobile Apps | Flutter for cross-platform (Android + iOS) |
| Backend API | Django 5 + DRF + Gunicorn |
| Database | PostgreSQL 15 (schema-per-tenant) |
| Cloud Platform | AWS |
| Caching | Redis 7 |
| Message Queue | Celery + Redis |
| Storage | Amazon S3 |
| API Gateway | Nginx |

# Functional Requirements by Module

This section details the functional requirements organized by major system modules. Each module description includes user stories, acceptance criteria, and business rules.

## System Foundation

### Authentication & Security

**Version 1.0, Phase - 1**

**User Story:** *As a Platform user (Tenant Super Admin & Tenant Admin), I want to log in securely with my credentials through a domain-scoped, secured login flow so that only I can access my account and my organization’s data*.

**Acceptance Criteria:**

* Every login surface (Platform Admin Portal, Tenant/Client Portal) requires a valid identifier and password before any session is created
* Platform Admin Portal is served at the platform admin domain; Tenant Portal is served at each tenant's own subdomain, with the login page branded to that organization.
* CSRF protection is enforced on every authentication form submission
* Login with unique credentials (email + OTP Verification + Password Setup)
* Tenant Super Admin will be sent Admin portal URL with 6-dogit OTP.
* Tenant Super Admin needs to click on the invitation link which will redirect him to OTP verification page and will input the 6-digit OTP.
* System will navigate Tenant Super Admin user to Password setup page after successful OTP verification and will be able to set new password for his account.
* Tenant Super admin will be able to login to the portal using the registered email, input password.
* Tenant admin will be able update the system generated password from the profile menu
* Password field masked with show/hide toggle
* System will validate username and password credentials
* Display appropriate error messages for invalid credentials
* All actions logged in audit trail with admin ID and justification

**Functional Requirements:**

* [Critical] System SHALL require unique email, password and OTP verification for all user logins
* [Critical] System SHALL log all actions with timestamp, user ID, IP address, and device ID.
* [Critical] System SHALL validate identifier and password against the correct tenant schema, resolved automatically from the request's domain/subdomain.
* [Critical] System SHALL NOT create an authenticated session until credential validation succeeds; for roles subject to Multi-Factor Authentication, the session SHALL be created only after OTP verification.
* [Critical] System SHALL preserve the originally requested destination URL through the full login (and, where applicable, OTP) sequence so the user lands on the correct page after authentication.
* [Critical] System SHALL enforce tenant data isolation at the authentication layer — credentials valid in one tenant schema SHALL NOT authenticate against another tenant's schema.
* [High] System SHALL display a branded, tenant-specific login page reflecting the organisation's name on the tenant subdomain.
* [High] System SHALL pre-populate the email/identifier field when a valid email query parameter is present (used by invitation and welcome emails).
* [High]System SHALL block login for suspended tenant accounts with a clear inline message.
* [Medium] System SHALL log all authentication attempts, successful and failed, for audit purposes

### Multi-Factor Authentication (2FA)

**Version 1.0, Phase - 1**

**User Story:** *As a Super Admin or Tenant Admin, I want to be required to verify a one-time code sent to my email after my password is accepted so that my account — and the data it can access — is protected by a second layer of authentication even if my password is compromised*.

**Acceptance Criteria:**

* Admin users are required to verify identity using one-time password (OTP)
* After correct password entry, the user is not signed in immediately — they are presented with an OTP challenge screen instead of the dashboard.
* A 6-digit numeric OTP is generated and dispatched to the user's registered email asynchronously, arriving within seconds (platform admin) to under 30 seconds (tenant portal).
* 2FA verification required after password validation
* The OTP is valid for 10 minutes from generation.
* Submitting the correct OTP creates the authentication session and redirects to the originally requested page.
* Submitting an incorrect OTP shows an inline error and does not create a session
* An expired OTP shows a clear “Code has expired’ message and requires the user to restart the login sequence.
* The user cannot bypass the OTP step by navigating directly to an authenticated URL mid-flow
* The user can request the OTP be resent, subject to a cooldown period.
* Excessive failed OTP attempts trigger a temporary lockout.
* For returning Tenant Portal users, the full sign-in sequence is three steps: identifier (email) → OTP → password.
* User will be able to try for another OTP request is after 10 minutes timeframe

**Functional Requirements:**

* [Critical] System SHALL require a 6-digit, single-use OTP after password validation for Super Admin and Tenant Admin roles before a session is created.
* [Critical] OTP SHALL expire exactly 10 minutes after generation; an expired OTP SHALL be rejected and SHALL require the user to restart authentication from the credentials step.
* [Critical] System SHALL NOT permit navigation to any authenticated page while an OTP challenge is pending.
* [Critical] System SHALL support OTP (One-Time Password) delivery via email or SMS for MFA.
* [High] System SHALL allow the user to request OTP resend, gated by a cooldown period (60 seconds on the Tenant Portal) to prevent abuse.
* [High] System SHALL lock out further OTP attempts after a configurable number of consecutive failures, for a limited duration.
* [High] System SHALL log every OTP attempt (success and failure) for audit purposes.
* [Low] The system SHALL remember trusted devices for 30 days to reduce MFA frequency.

### Session Control

**Version 1.0, Phase - 1**

**User Story:** *As a logged-in user, I want my session to remain active while I am using the system and to expire automatically after a period of inactivity so that my account stays convenient to use during a work session while still being protected if I forget to log out*.

**Acceptance Criteria:**

* Once authenticated, the user's session persists across requests without needing to re-authenticate for each action.
* System tracks active sessions (IP, Device) per user
* A session remains valid for 24 hours from last activity; each active request extends (refreshes) the expiry, creating a sliding 24-hour window.
* A session remains valid for 24 hours from last activity; each active request extends (refreshes) the expiry, creating a sliding 24-hour window.
* System display active sessions in Admin dashboard (where applicable)
* System SHALL support session termination by Admin
* System SHALL invalidate session on password change
* System SHALL support "Log out from all devices" for Admin
* Any user action (click, scroll, keyboard input) resets inactivity timer

**Functional Requirements:**

* [Critical] System SHALL track all active user sessions with IP address and device identifier.
* [Critical] Session cookie lifetime SHALL be set to 24 hours (86,400 seconds).
* [Critical] Session expiry SHALL operate as a sliding window — each authenticated request SHALL refresh the session's expiry timestamp, so an actively used session does not expire mid-session.
* [Critical] Session expiry today is time-based only (24-hour sliding window); there is no self-service or admin-assisted way to revoke a specific active session before it naturally expires.
* [Critical] System SHALL support OTP (One-Time Password) delivery via email or SMS for MFA.

### Role-based Access Control (Role Hierarchy)

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Admin, I want to assign each user a predefined system role with a fixed set of permissions and an access scope so that every user can only see and act on the data and functions relevant to their job function.*

**System Roles:**

**Administrative Roles:**

|  |  |
| --- | --- |
| Role | Key Permissions |
| Super Admin | Manages global configurations, plans, billing, subscription plans, billing, and tenant-level controls across all organizations |
| Tenant Super Admin | Tenant Super Admin will be onboarded and managed by DFMS Platform Admin. Tenant Super Admin will have access to all the modules including Dashboard, Requisition, Port Shipments, Distribution, Procurement, Transport, Master Data, Gate Operations, Scaling Operations, Command Center Operations, Loading Operations, Unloading Operations, QC Checkpoint, Fleet Operations & Driver Management under Driver Supervisor Module, Trips, Vendors, User & Access Module. Tenant Super Admin will be able to onboard and Manage (Create, Update, Suspension) all Users |
| Tenant Admin | **Tenant Admin** will be onboarded and managed by **Tenant Super Admin. Tenant Admin**  will have access to all the modules including Dashboard, Requisition, Port Shipments, Distribution, Procurement, Transport, Master Data, Gate Operations, Scaling Operations, Command Center Operations, Loading Operations, Unloading Operations, QC Checkpoint, Fleet Operations & Driver Management under Driver Supervisor Module, Trips, Vendors, User & Access Module. Tenant Admin won't be able to create Tenant Super Admin or manage (Update or Delete) tenant super Admin. |
| POI Admin | POI-Admin user will be able to perform all yard operation modules at their single assigned POI only — Gate (Gate-In/Gate-Out), Scaling, Command Center, Loading, Unloading, and QC Checkpoint when applicable at that site. |

**Operational Roles:**

Operational roles perform **day-to-day execution** and **cannot manage users or system configurations.**

|  |  |
| --- | --- |
| Role | Key Responsibilities |
| Product Transfer Requester (Depot / Feed Mill) | Create FG Transfer Request (Depot/Feed mill) |
| Product Transfer Requester (Commercial Officer) | Create RM Transfer Request(Commercial Officer) |
| Distribution Officer (DO) | Creates Transport Request (TR) and forwards to Distribution Manager for Approval |
| Approver – Distribution Manager (DM) | Approves TRs and validates capacity per POI |
| Approver – Procurement | Create Transport Request (TR) and approves Port Transfer requisition and makes distribution breakdown plan |
| Transport Planner (TP) | Create TOs with Vehicle Quantity, C&F Clearance Note, and type of vehicle required, assigns fleet (Own vs Vendor), manages trips |
| Transport Distribution Officer (TDO-Vendor Fleet) | Manages Vehicle, Driver, and Helper Assignment process and Estimated time of arrival (ETA) |
| Gate Operation (Gate man) | Manages gate-in/gate-out entries |
| Scaling Operator (Weighbridge Operator) | Enters Scale-in/Scale-out weights and prints queue token |
| Command Center Officer | Assign loading/unloading lines based on product type and urgency |
| Loading Operator | Logs loading start/end times, Quantity Loaded, and Seal Number |
| Unloading Operator | Logs unloading start/end times |
| QC Inspector - Physical | Performs physical QC checks, sampling and approval |
| QC Lab Technician | Performs lab testing and updates reports |
| Driver Supervisor | Responsible for managing driver-vehicle handover checklist, Driver and helper attendance and availability status input |
| Driver | Uses mobile interface for trip updates |
| Helper | Optional – associated with the drivers |
| Vendors | Manages bidding, vehicle information submission, invoice submissions |
| Accounts/Finance Officer | Utilizes platform reports like trip costing. Vendor invoices & Billings |

**Acceptance Criteria:**

* The system ships with a fixed, pre-seeded catalogue of system roles (10 roles), each with an associated department, functional type label, access scope, and permission set — Tenant Admins assign existing roles to users; they do not define new roles or edit the permission catalogue.
* Roles categorized into:
  + Administrative roles (Super Admin, Tenant Admin) and
  + Operational roles (Assigned to exactly one department, e.g., Transport, Procurement, Distribution, Gate Operations)
* Each role has specific permission scope and access rights and access level classification defined at system level of either Global (data across all locations within the tenant) or Local (data restricted to the user's assigned department/POI).
* Each operational role SHALL be assigned an access type as either:
  + Global Access – user can view and act across all applicable locations / requests within the tenant
  + Local Access – user can view and act only withing assigned department, POI, feed mill, depot or location content
* Tenant Admin can assign the following department specific operational roles during user creation
* System SHALL support the following department-based role assignments:
  + Depot / Feed Mill / Commercial
    - Depot Manager (*Requester, local*)
    - Feed Mill Manager (*Requester, local*)
    - Commercial Officer (*Requester, local*)
  + Procurement
    - Procurement Officer (*Approver, Global*)
  + Distribution
    - Distribution Officer (DO) (*Executor, Global)*
    - Distribution Manager (DM) (*Approver, Global*)
  + Transport
    - Transport Planner (TP) *(Global*)
    - Transport Distribution Officer (TDO-Vendor Fleet) *(Global*)
  + Quality Assurance / Quality Control (QA / QC)
    - QC Inspector – Physical *(Local*)
    - QA Lab Technician *(Local*)
  + Operations
    - Command Center Officer *(Local*)
    - Unloading Personnel *(Local*)
    - Loading Personnel *(Local*)
    - Driver Supervisor
    - Driver Helper
    - Vendors *(Contractual/Non-contractual)*
* Super Admin controls global configurations across all tenants
* Tenant Admin SHALL manage department assignment, role assignment, and access scope configuration
* Operational roles have task-specific access (e.g., Gate Operator only access gate operations)
* Role permissions organized by functional module, including but not limited to:
  + Product Requisition Management
  + Distribution Management
  + Transport Requisition to TO Management
  + Fleet Management
  + Trip Management
  + Quality Control (QC)
  + Gate operation
  + Scaling Operations
  + Command Center operations
  + Vendor Management
  + Reporting and Analytics
* System enforces role permissions at multiple security layers:
  + UI level
    - Control Menu visibility
    - Control button access
    - Restrict page access
  + API Level
    - Validate role permissions before endpoint access
  + Database level
    - Apply row-level or location-level data restriction where applicable
* Local users SHALL only access records, tasks, and operational events related to their assigned location / POI / department
* Global users SHALL be allowed to access records across all relevant locations within the tenant, based on role permissions
* Operational roles SHALL have task-specific access only.
  + Example: Gate Operator can only access gate operations
* A department-level manager without Approver role cannot approve requisitions
* Same user cannot approve their own requisition.
* Once a request in approved by an authorized global approver (e.g.,) DM or PO), the request SHALL NOT be editable or reverted by operational users
* Tenant admins SHALL be able to update role mappings, department mappings, and approval configurations, and all such changes SHALL be recorded in the system audit log

**Functional Requirements:**

* [Critical] System SHALL implements hierarchical role structure with pre-defined roles (a fixed, pre-seeded set of 10 system roles at the platform level):
  + Super Admin,
  + Tenant Admin (Organization Admin)
  + POI Admin
  + Department Admin
    - Product Requisition Department
    - Distribution Department
      * Manage DO and DM users
      * View Requests for FG transfer from Feed mills and Depot
      * Assign FG transfer request to corresponding users (DO and DM)
  + Operational Roles including
    - Distribution Officer
    - Distribution Manager
    - Procurement Officer
    - Commercial Officer
    - Depot Manager
    - Feed Mill Manager
    - Transport Planner
    - Transport Distribution Officer – Vendor Fleet
    - QC Inspector - Physical
    - QA Lab Technician
    - Finance/Accounts Manager
    - Gate Man
    - Scaling Officer
    - Command Center Officer
    - Loading Operator
    - Unloading Operator
    - Driver Supervisor
    - Driver
    - Helper
    - Vendor Admin
* [Critical] Each role SHALL have defined permission scope covering specific modules and operations.
* [High] System SHALL allow department assignment during user creation

### Dynamic Role Builder

**Version 2.0**

**User Story:** *As a Super Admin, I want to create new roles with specific permissions so that I can accommodate unique organizational needs beyond pre-defined roles*.

**Acceptance Criteria:**

* Admin can configure CRUD (Create/Read/Update/Delete) permission per role per module
* Permission matrix organized by modules: User Management, Fleet Management, Trip Management, QC, Gate, Scaling, Loading/Unloading, Product Requisition, etc.
* Admin selects permissions from available permission matrix during role creation
* System validates role name uniqueness within tenant
* Newly created role immediately available for user assignment
* Admin can clone existing role permissions after creation
* Admin can deactivate (not delete) custom roles only if no users are assigned to them
* Admin can delete custom roles only if no users are currently assigned
* System prevents modification of pre-defined system roles (only custom roles can be edited)

**Functional Requirements:**

* [Critical] Super Admin SHALL be able to create custom roles with granular permissions at runtime using Dynamic Role Builder.
* [Critical] Admins SHALL configure CRUD (Create, Read, Update, Delete) permission per role per module.

### Multi-Tenant Separation in RBAC

**Version 2.0**

**User Story:** *As a system, I want to enforce tenant-level isolation in role-based access control so that roles and permissions are scoped to individual organizations*.

**Acceptance Criteria:**

* All roles (pre-defined and custom) scoped to tenant level.
* Tenant Admin can only view and manage roles within their tenant
* User assigned to a role can only access data within their tenant
* Tenant ID automatically validated in all permission checks
* Custom roles created by one tenant not visible to other tenants
* Super Admin can view roles across all tenants for platform management
* Role-based queries automatically filter data by tenant context
* No cross-tenant role assignments possible (User from Tenant A cannot be assigned role from Tenant B)

**Functional Requirements:**

* [Critical] System SHALL implement logical and physical tenant data isolation
* [Critical] Each tenant SHALL have a unique tenant ID and dedicated database schema.
* [Critical] All user data (users, fleet, trips, vendors) SHALL be scoped to tenant ID.
* [High] The system SHALL prevent tenant ID tampering through request validation.

## User & Tenant Management

### Organization Signup & Tenant Creation

**Version 1.0, Phase - 1**

**User Story:** *As a Platform Super Admin, I want to register a new client organization through a guided form so that the organization receives an isolated database schema, a dedicated login domain, and a working Tenant Admin account without manual database intervention*.

**Acceptance Criteria:**

* A Super Admin creates a new tenant by submitting a form capturing:
  + Organization Name
  + Business Category
  + Industry Type
  + Subscription Plan
  + Tenant Admin Name
  + Tenant Admin Email
  + Contact Number
  + Address
* Email and mobile number verified through OTP before account activation
* System auto-generates a unique tenant ID upon successful registration
* Tenant data stored in isolated schema/database ensuring multi-tenant separation
* The new Tenant Admin receives a welcome email containing their login URL (with email pre-filled), a temporary password, and setup instructions.
* The new Tenant Admin receives a welcome email containing their login URL (with email pre-filled), a temporary password, and setup instructions.
* OTP valid for 10 minutes with resend option after 2 minutes cooldown
* Failed OTP attempts (>3) temporarily block registration for 15 minutes
* All registration attempts logged with timestamp, IP address, device information
* System validates email domain uniqueness to prevent duplicate registrations

**Functional Requirements:**

* [Critical] System SHALL provide a public registration form for new organization signup.
* [Critical] Registration form SHALL collect:
  + Organization/Company name
  + Admin email
  + Contact number
  + Business category
  + Industry Type
  + Address.
* [Critical] Upon successful registration, system SHALL generate unique tenant ID and dedicated database schema.
* [Critical] System SHALL auto-generate a temporary password (12 characters, mixed case, digit, and special character) for the initial Tenant Admin and SHALL force a password change on first login.
* [High] System SHALL dispatch a welcome email (asynchronously) to the new Tenant Admin containing the login URL, temporary password, and first-login instructions.
* [High] Temporary password SHALL expire 72 hours after generation.
* [High] System SHALL support reactivating a previously suspended tenant.

### Subscription Plan Selection

**Version 2.0**

**User Story:** *As an organization, I want to select a subscription plan that matches my business size so that I only pay for features I need*.

**Subscription Tiers:**

|  |  |  |  |
| --- | --- | --- | --- |
| **Tier** | **Users** | **Trips/Month** | **Key Features** |
| Basic | 5 | 100 | TR/TO, Fleet basics, GPS tracking |
| Starter | 15 | 500 | All Basic + Vendor portal, QC module |
| Growth | 50 | 2000 | All Starter + Analytics, Cost management, PR/PO |
| Enterprise | Unlimited | Unlimited | All features + White-label, ERP integration |

**Acceptance Criteria:**

* System displays all four subscription tiers with feature comparison
* Admin can select plans during registration or upgrade/downgrade from settings as a request (Served by Backend Engine)
* System enforces plan limits on user count, trip creation, storage usage

**Functional Requirements:**

* [Critical] System SHALL present four subscription tiers: Basic, Starter, Growth, Enterprise.
* [Critical] Each tier SHALL define limits for: Active users, Monthly trip capacity, Data storage (GB), Available modules.
* [Critical] System SHALL bind selected plan limits to tenant account and enforce usage metrics.

### User Invitation & Activation

**Version 1.0, Phase - 1**

**User Story:** *As an Tenant Super Admin, I want to invite new users to my organisation by entering their name, email, and role so that they receive an activation link and can set their own password to get started.*

**Acceptance Criteria:**

* A Tenant Admin invites a user by providing first name, last name, email address, and one or more predefined operational roles.
* The Super Admin role cannot be assigned through the invitation flow; it is not offered as an option.
* Invitation:
  + Invite User’ form captures
    - Onboarding option:
      * Email
      * Phone
    - 2FA
      * If email is chosen, then 2FA option will show None/Email
      * If phone is chosen, then 2FA option will show None/Phone
    - User Email
    - User Mobile Number
    - User’s First Name
    - User’s Last Name
    - Employee ID
    - Role Type (Drop Down menu)
      * Pre-filled Department (Tenant Admin, Depot / Feed Mill / Commercial, Procurement, Distribution, Transport, QA/QC, Operations, Gate Operations, Scaling / Weight, Costing & Finance)
      * POI (for Yard roles this field will be visible)
* For onboarding option:
  + System will send shorten domain URL in the user’s registered email / phone number with 6-digit OTP.
  + After clicking the invitation link system will navigate to the OTP verification page.
  + After successfully OTP verification step, system will navigate to the Password setup page
  + On successful activation, the user's account status becomes Active and they are signed in.
  + Invitation links expire after 7 days; expired or already-used links show a clear, specific error.
  + All invitation actions (invite sent, resent, cancelled, activated) are audit logged with inviter, invitee, role, and timestamp.
* System allow role assignment during invitation
* System allow bulk user invitation via CSV upload
* System validate role permissions against tenant plan limits (TBD)
* System enforce unique email or mobile number per tenant
* System allow invitation resend (with cooldown period)
* System expires invitations after 7 days
* System allow the Admin to resend the invitation if it has expired.
* System activate account only after OTP verification
* User completes verification: set password, Verify phone/email OTP(applicable for enabled 2FA), accept T&C
* Status tracked: Sent → Pending → Invited → Activated/Expired

**Functional Requirements:**

* [Critical] Admins SHALL invite users using either **email address** or **mobile phone number**..
* [Critical] System SHALL provide a user invitation form with the following fields:
  + Onboarding Option (Email / Phone)
  + Two-Factor Authentication (2FA)
  + Email Address
  + Mobile Phone Number
  + First Name
  + Last Name
  + Employee ID
  + Role Assignment
  + Department Assignment (Tenant Admin, Depot / Feed Mill / Commercial, Procurement, Distribution, Transport, QA/QC, Operations, Gate Operations, Scaling / Weight, Costing & Finance)
  + POI Assignment (Applicable for Yard roles)
* [Critical] System SHALL dynamically configure available 2FA options based on the selected onboarding method:
  + Email onboarding → None / Email
  + Phone onboarding → None / Phone
* [Critical] System SHALL validate unique mobile number per tenant for invited users.
* [High] Activation link SHALL expire after 7 days
* [High] System SHALL log all invitation and activation events with user ID and timestamp.
* [High] Admin SHALL be able to resend or revoke pending invitations
* [Medium] System SHALL support bulk user invitation via CSV upload, with per-row validation and a row-level success/failure report.
* [Medium] System SHALL log all invitation lifecycle events (sent, resent, cancelled, activated, expired) for audit purposes.

### Drivers Invitation & Activation

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Admin, I want to invite drivers so that they can be onboarded into the system with their profile, license, and compliance details captured for operations.*

**Acceptance Criteria:**

* System allows admin to invite drivers via mobile phone number or email
* Invitation:
  + 'Invite Driver' form captures:
    - Onboarding option:
      * Email
      * Phone
    - Driver's First Name
    - Driver's Last Name
    - Employee ID
    - Contact Number
    - Driver Type (Drop Down menu)
      * Permanent
      * Temporary
      * Own
      * Vendor
    - Driving License Number, Class, Expiry
    - License Type
    - National ID
    - Joining Date
    - Experience Certificate (Document Upload)
    - Biodata (Document Upload)
    - Medical Certificate (Document Upload)
    - Medical Certificate Expiry Date (Date range selection)
    - Reference Contact (minimum 2 Contact Information)
    - Accident History (free text / record entry)
    - Last Training / Assessment Information
* For Phone onboarding option:
  + System will send shorten domain URL in the user’s registered email / phone number with 6-digit OTP.
  + After clicking the invitation link system will navigate to the OTP verification page.
  + After successfully OTP verification step, system will navigate to the Password setup page
* System allows role/type assignment (Permanent / Temporary / Own / Vendor) during invitation
* System allows bulk driver invitation via CSV upload (fields: Name, Employee ID, License No., Contact, Driver Type, etc.)
* System validates:
  + Unique National ID and Driving License Number per tenant
  + Driving License expiry date is not in the past
  + Minimum 2 reference contacts provided before activation
  + Mandatory upload of Medical Certificate and Experience Certificate before activation is complete
* System enforces unique email or mobile number per driver, per tenant
* System allows invitation resend (with cooldown period)
* System expires invitations after 7 days
* System flags drivers whose License Expiry or Medical Certificate is nearing expiry (configurable threshold, e.g. 30 days) for admin follow-up
* System stores Last Training/Assessment Information as a record that can be updated post-activation without re-triggering invitation flow

### OTP Verification System

**Version 1.0, Phase - 1**

**User Story:** *As a platform user, I want a consistent, secure one-time-code verification experience across login, account activation, and password reset so that every sensitive identity-confirming action in the system is protected the same way*.

**Acceptance Criteria:**

* A single, unified OTP mechanism is used for 2FA login ([6.1.2](#_Multi-Factor_Authentication_(2FA))), account activation ([6.2.3](#_User_Invitation_&)), and password reset ([6.2.7](#_Password_&_Account)).
* OTP codes are 6 digits, numeric, and delivered by email or SMS.
* Both OTPs verified before account activation
* A user can request an OTP resend, subject to a cooldown period.
* Repeated failed verification attempts trigger a temporary lockout.
* Every OTP generation, verification, and resend event is logged.
* All attempts logged with timestamp, IP, device ID
* Logs exportable for audit
* Rate limiting max 5 OTP requests per hour per user

**Functional Requirements:**

* [Critical] System SHALL generate a 6-digit numeric OTP and store it server-side (Redis) with a fixed 10-minute expiry for every OTP-gated flow (login 2FA, activation, password reset).
* [Critical] System SHALL validate submitted OTPs against the stored value and invalidate the OTP immediately on successful verification (single use).
* [High] System SHALL enforce a resend cooldown period before a new OTP can be requested for the same pending action.
* [High] System SHALL lock out further verification attempts for a limited period after repeated consecutive failures.
* [High] System SHALL log every OTP operation — generation, successful verification, failed verification, resend — with user ID, operation type, and timestamp for audit purposes.

### Account Deactivation

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Admin, I want to deactivate a user's account so that a user who has left the organisation, changed roles, or poses a security concern immediately loses access to the system.*

**Acceptance Criteria:**

* A Tenant Admin can deactivate any user account within their tenant.
* Deactivation immediately terminates the user's active sessions and blocks any further login attempts.
* A deactivated user is excluded from all assignment dropdowns (transport orders, trips, approvals, tasks) across the platform.
* Two deactivation options:
  + Temporary Suspension: Inactive, preserve data, reactivatable
  + Permanent: Disabled permanently, data archived
* Mandatory fields: Reason, effective date, admin remarks
* Immediate logout from all sessions
* Historical data preserved in audit trail
* Deactivation logged with full details
* Temporary accounts reactivated with approval
* Email notification sent to user
* Deactivated users blocked from new assignments
* Prevent deactivation if user has active critical assignments
* Support bulk deactivation with validation
* Allow admin to view deactivation history

**Functional Requirements:**

* [Critical] Admins CAN deactivate user accounts temporarily or permanently.
* [Critical] System SHALL preserve historical audit records for deactivated users.
* [Critical] Deactivation SHALL log timestamp, admin ID, and reason.
* [High] System SHALL prevent deactivation if user has active critical assignments.
* [High] Temporary suspension SHALL allow reactivation without data loss.
* [Medium] System SHALL support bulk deactivation with validation
* [Medium] Admin SHALL be able to view deactivation history.

### Password & Account Reset

**Version 1.0, Phase - 1**

**User Story:** *As a user who has forgotten my password, I want to reset it securely through a self-service flow — or have a Tenant Admin assist me — so that I can regain access to my account without compromising security*.

**Acceptance Criteria:**

* Admin-Assisted Reset (Preferred for low literacy users of the platform):
  + A Tenant Admin (or Super Admin) can trigger an admin-assisted password reset for a user who cannot complete the self-service flow, generating a fresh OTP for the user.
  + Click Generate Password to create a password for the user from Reset Password option. Use the eye icon to view the generated password, then enter the same password in the Confirm Password field to confirm it. User cannot reuse the last 3 passwords
  + All assisted resets logged
  + Admin provides justification remarks
* Self-Service Reset:
  + A "Forgot Password" option is available on the login page, initiating a self-service reset via email.
  + Password reset requires successful OTP or link verification before a new password can be set.
  + New passwords must meet complexity requirements (minimum length, mixed case, number, special character).
  + Successful password reset terminates all of the user's other active sessions.
  + All sessions are terminated

***Note:*** *Assisted reset option provided to support users with low digital literacy.*

**Functional Requirements:**

* [Critical] System SHALL send secure password reset link valid for 10 minutes.
* [Critical] All password resets SHALL be logged with timestamp, user ID, and IP address.
* [Critical] Super Admin and Tenant admin CAN trigger assisted reset after offline verification.
* [Critical] System SHALL generate reset OTP for admin-assisted process.
* [High] Password reset SHALL terminate all active user sessions.
* [High] Audit log SHALL include method, timestamp, IP/device, success/failure for all attempts.
* [Medium] System SHALL rate-limit reset requests (max 3 per hour per user).
* [Medium] Email notification SHALL be sent after successful password change.
* [Low] System SHALL provide password strength meter during reset.

### User Activity & Audit Logs

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Admin, I want a single, filterable, read-only audit log covering every significant action taken by every user in my tenant — from login events to master data changes to approvals — so that I can answer "who did what, when, and as which role" without hunting through module-specific logs.*

**Acceptance Criteria:**

* Authentication events (login success/failure, logout, password reset, failed login attempts, account lockout, session timeout) are logged for every user.
* Create, update, and status-change actions on user accounts and master/operational data are logged with the acting user, timestamp, entity, and the changed values (old → new).
* The audit record captures the role the acting user held at the time of the action, not their current role — so a later role change or deactivation does not retroactively alter historical audit records.
* A Tenant Admin can view a single, unified audit log for their tenant, filterable by date range, user, role, module, entity type, and action type, with free-text search and a detail view showing field-level old/new values.
* The audit log can be exported as CSV for a filtered result set.
* Audit records are immutable — no update or delete operation is available through any interface, including direct admin access.
* Only Tenant Admin (and platform-level Super Admin, for platform-wide events) can access the tenant's audit log; all other roles are denied with HTTP 403.
* Audit records are retained for a minimum of 2 years.
* Access to the audit log viewer is itself recorded as an audited event.

**Functional Requirements:**

* [Critical] System SHALL log, for every audited action: acting user ID and display name, the role held by the user at the time of the action, action verb, entity type and ID, a human-readable summary, old and new field values for changes, and a timezone-explicit timestamp.
* [Critical] System SHALL provide a filterable, paginated audit log viewer with filters for date range, user, role, module, entity type, and action type, plus free-text search on the action summary.
* [Critical] System SHALL support exporting a filtered audit log result set as CSV.
* [High] System SHALL retain audit logs for 2 years minimum.
* [High] System SHALL provide real-time audit dashboard with filtering capabilities.

### Tenant Data Isolation

**Version 1.0, Phase - 1**

**User Story:** *As a platform operator, I want every tenant's data to live in a fully isolated database schema so that one client's data can never be mixed with, queried by, or exposed to another client, even in the event of an application-level bug*.

**Acceptance Criteria:**

* Platform-wide data (tenant records, domains, subscriptions) is kept separate in a shared schema, inaccessible to tenant-scoped requests
* Each tenant is provisioned with its own dedicated PostgreSQL schema at creation time, holding all of that tenant's operational data (users, roles, vehicles, trips, master data, and so on).
* Tenant ID auto-appended to all queries
* No cross-tenant data in UI or API
* Database foreign keys enforce boundaries
* API endpoints validate tenant context
* Tenant-specific file storage folders
* Encrypted separate tenant backups

**Functional Requirements:**

* [Critical] System SHALL implement logical and physical tenant data isolation
* [Critical] System SHALL provision a dedicated PostgreSQL schema per tenant, isolating all tenant-scoped application data from every other tenant at the database level.
* [Critical] All user data (users, fleet, trips, vendors) SHALL be scoped to tenant ID

## Master Data Configuration

### Entity Registration (Master Setup)

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Super Admin, Tenant Admin, I want to register and manage standardized master data (POI, Loading/unloading Points, Vehicles Brands, Vehicles, Helpers, Dealers, Suppliers, Product Categories, Product Sub-category, Products.) so that all DFMS workflows operate consistently, traceably, and without manual data errors*.

**Acceptance Criteria:**

* System provides master setup menus for:
  + Vehicles, Vehicle Brands, Dealers, Helpers, Suppliers
  + Loading/Unloading Points, Point of Interests (POIs),
  + Product Catalogue – Product, Product Category, Product Sub-Category
  + QC Checklist templates
* Each master record has mandatory fields validation and unique ID generation
* System will support registration of the following **master entities,** aligned with real operational data:
  + Human & Transport Entities
    - **Helper Master:** Helper registration captures Employee ID, Full Name, Contact Number, and status as mandatory fields; National ID Number is an optional field, with uniqueness enforced only when a value is provided. Helper Master Data form captures:
      * Helper Name
      * Employee ID
      * National ID
      * Reference from known contacts
    - **Driver Supervisor**
      * Supervisor Name
      * Employee ID
      * Contact Number
    - **Vehicle Master:** Vehicle registration validates vehicle type, license/registration number format, chassis number format, and captures optional fields including brand (drawn from a tenant-maintained Brand catalogue), body type, fuel type, mileage, and assigned driver/POI. Vehicle Master Data form captures:
      * Registration Number
      * Vehicle Type (pre-defined)
        + Pickup Van
        + Open Truck
        + Covered Truck
        + Nosimon
        + Auto
        + Tom Tom
        + Tractor
        + Primemover
        + Poultry Carrier
        + Tipper
        + Delivery Van
      * Body Type
        + Open Body
        + Closed Body
        + Container
        + Flatbed
        + Tanker
        + Refrigerated
        + Lowbed
      * Fuel Type
        + Diesel
        + Petrol
        + CNG
        + Electric
        + Hybrid
        + LPG
      * Capacity (Max Load Capacity) – (Numeric Input)
      * Capacity Unit Type
        + MT
        + KG
        + Bag
      * Number of Wheels (Numeric Input)
      * Brand
      * Model (required)
      * Year of Manufacture
      * Chassis Number (required, unique)
        + VIN (Vehicle Identification Number) format
        + Uniqueness validation
      * Allowed Product Category (FG / RM / Both / Machineries / By Products)
      * GPS Device ID
        + Tracker ID
        + SIM Number associated with the Tracker device
* License/Registration Number (required, unique)
* Format validation: Bangladesh vehicle registration pattern
* Display format: Dhaka Metro-GA-11-1234
* Calculated Distance Travelled
* Total Distance Travelled (KM)
* Purchase Information (optional)
* Purchase Date
* Purchase Price
* Ownership (Own/Vendor)
* Assigned Driver (Optional)
* Select from active drivers
* Can be assigned post-registration
  + - Transport Vendors: Vendor registration from Vendor Portal captures company details, vendor type (Contractual/Non-Contractual), contact information, compliance documents, and fleet information, with duplicate detection on Trade License or TIN.
      * Contractual (Direct assignment (no bidding required))
        + Join Status
        + Platform account
        + Company Name
        + Contact Person
        + Email
        + Phone
        + Address
        + Testimonial / Reference from Truck Association
        + Trade License
        + BIN
        + TIN
      * Non-Contractual (Eligible for bidding)
        + Join Status
        + Platform account
        + Company Name
        + Contact Person
        + Email
        + Phone
        + Address
        + Testimonial / Reference from Truck Association
        + Trade License
        + BIN
        + TIN
    - Supplier Master
      * Supplier Code
      * Supplier Name
      * Contact Number
      * Email
      * Address
      * Latitude
      * Longitude
      * Geofence Radius
      * Site POI (Supplier premises POI used for inbound transport)
    - Dealer Master
      * Dealer Code
      * Dealer Name
      * Contact Number
      * Email
      * Address
      * Latitude
      * Longitude
      * Geofence Radius
      * Site POI (Dealer delivery site POI)
  + Product & Material Entities
    - Finished Goods (FG)
      * FG Product Name
      * FG Product Item Code
      * Standard Pack Size (Pallet / Drum / Roll – Text Input)
      * Product Category
      * Product Sub-Category
      * Unit of Measure (Bag / Ton / Piece / Carton / KG / Liter)
      * Standard weight per unit (Defined for UOM – Bag, Carton, Piece)
      * Status (Active/Inactive)
    - Raw Material (RM)
      * RM Product Name
      * RM Product Item Code
      * Type of Packing (Pallet / Drum / Roll)
      * Product Category
      * Product Sub-Category
      * Unit of Measure (Bag / Ton / Piece / Carton / KG / Liter)
      * Standard weight per unit (Defined for UOM – Bag, Carton, Piece)
      * Status (Active / Inactive)
    - QC Checklist
  + Point of Interest (POI):
    - POI (Depot / Feed Mill / Factory / Warehouse with geofence): POI registration captures name, type, address, GPS coordinates, geofence radius (50–1000m), and storage capacity, with an interactive map picker for setting coordinates.
* Each master entity (Vehicle, Driver, Helper, Vendor, POI, Product) supports create, view, edit, and deactivate operations; hard delete is restricted or blocked where the record is referenced elsewhere in the system.
* Each entity enforces its own uniqueness rules — for example, unique registration number and chassis number per tenant for Vehicles; unique Employee ID and Contact Number for Helpers; unique Trade License/TIN duplicate detection for Vendors; unique POI name per tenant.
* Only Active records are selectable in downstream workflows (requisitions, transport orders, trips, QC); inactive/deactivated records remain visible for historical reference only.
* Every create, update, and status-change action on a master entity is audit logged.
* Only Tenant Admin roles can create/update master entities (RBAC enforced).
* Inactive master records cannot be used in new transactions but remain available for historical reference.
* Any master changes must be audit-logged (who/when/what changed)

**Functional Requirements:**

* [Critical] System SHALL provide a centralized **Master Date Configuration module** accessible only to authorized Admin roles.
* [Critical] System SHALL provide dedicated setup menus for the following master categories:
  + Vehicles
  + Drivers
  + Helpers
  + Transport Vendors
  + Suppliers
  + Dealers
  + POIs for each Projects (Depots / Feed Mills / Warehouse / Factories / Ports)
  + Product Catalogue (PIM)
  + QC Checklist
* [Critical] System SHALL validate mandatory fields before allowing submission.
* [Critical] System SHALL auto-generates unique UUID for each registered entity.
* [Critical] System SHALL provide create, read, update, and deactivate (soft-delete) operations for Vehicles, Drivers, Helpers, Vendors, POIs, and Products, each scoped to the tenant.
* [Critical] System SHALL exclude inactive/deactivated master records from selection in new requisitions, transport orders, trips, and QC workflows, while preserving them for historical reference on existing records.
* [Critical] System SHALL block hard deletion of a master record when it is referenced by any transactional record (transport order, trip, QC record, etc.), permitting only soft deactivation in that case.
* [High] All create, update, deactivate and delete actions SHALL be audit logged with:
  + User ID
  + Timestamp
  + Entity Type
  + Field(s) changed
  + Old value vs new value
* [High] System SHALL detect potential duplicates and warn user before creation
* [High] System SHALL support saving draft entities for later completion

### Bulk Upload & Inline Master Data Management

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Admin, I want to upload and manage large volumes of Master data (POI, Drivers, Vehicles, Helpers, Products, etc.,) using bulk CSV upload and inline editing so that DFMS can be onboarded quickly and maintained efficiently without repetitive manual entry.*

**Acceptance Criteria:**

* System provides **Bulk Upload Functionality** for all supported master entities:
  + Helpers
  + Vehicles
  + Brand
  + Suppliers
  + Dealers
  + POIs (Depot / Feed Mill / Warehouse / Factory / Port)
  + Products (FG / RM)
  + Loading/Unloading Points
  + Product Category and Sub-category
  + QC Checklist
* Bulk upload supports
  + Initial bulk creation
  + Subsequent bulk append (new records added without overwriting existing ones)
* Bulk upload format:
  + CSV file (UTF-8 encoded)
  + System-provided downloadable template per entity
* System validates each row independently and reports:
  + Successful rows
  + Failed rows with error reason
* Admin can:
  + Delete individual rows (single record delete)
  + Edit individual fields AT COLUMN LEVEL
  + Update records inline without re-uploading the file
* A reusable bulk import/export framework is available across Products, Vehicles, Helpers, Suppliers, Dealers, and Users, each with a dedicated CSV template.
* A reusable bulk import/export framework is available across Products, Vehicles, Helpers, Suppliers, Dealers, and Users, each with a dedicated CSV template.
* Each entity's CSV template is downloadable and marks mandatory fields, with sample values and format hints.
* Bulk upload is append-only — existing records are never overwritten by an upload; only new records are added.
* The same entity type can be uploaded multiple times to append additional records incrementally.
* Each row in an uploaded file is validated independently; the system reports which rows succeeded and which failed, with a reason for each failure.
* Inline editing is available at both the row and column (individual field) level directly in list views, without requiring the full edit form.
* Every bulk upload action and every inline edit is audit logged.
* All bulk and inline operations are audit logged

**Functional Requirements:**

* [Critical] System SHALL provide a Bulk Upload option for each master entity
* [Critical] Bulk upload SHALL support CSV file format only
* [Critical] System SHALL provide entity-specific CSV templates with
  + Mandatory fields marked
  + Date type hints
  + Sample values
* [Critical] Bulk upload SHALL support append-only behavior:
  + Existing records are NOT overwritten by default
  + New records are added to the existing master dataset
* [Critical] System SHALL allow uploading additional CSV files to append new master records
* [Critical] System SHALL support inline editing at:
  + Row level
  + Column (Field) level
* [Critical] Changes Shall be saved immediately or via explicit **save** action
* [Critical] All bulk upload actions SHALL be audit logged:
  + Entity type
  + File name
  + Uploaded by
  + Timestamp
  + Number of rows processed / success / failed
* [Critical] System SHALL allow single-row delete actions SHALL record:
  + Delete reason
  + Deleting user
  + Timestamp
* [High] System SHALL allow bulk upload multiple times for the same entity.
* [High] Upload progress and completion status SHALL be shown to the user
* [Medium] System SHALL normalize phone number fields during bulk import (stripping hyphens, adding a leading zero when missing, validating exactly 11 digits) for Users and Drivers.

### Master Tables (CRUD Operation)

**Version 1.0, Phase - 1**

**User Story:** *As a Tenant Admin, I want full CRUD capability for master data so that the system stays up to date with changing operational needs*.

**Acceptance Criteria:**

* Admin can create/Edit/View/Delete:
  + Vehicles, Helpers
  + Depots/Feed mills/Warehouse/Factory, POIs
  + Product Categories/items (via PIM)
* CREATE Operations:
  + See [section 5.3.1](#_Entity_Registration_(Master) Entity Registration for ‘Create’ acceptance criteria
* READ Operations:
  + Master data list view displays key columns
  + List view supports search, sort, pagination, and filter by status/type
  + Default pagination: 25 records per page (adjustable to 50, 100)
  + Column Sorting: Click column header to sort ascending/descending
  + Quick Search: Search bar at top searches across all displayed columns
  + Advanced search panel with filters for: Status, Type, Category, Date range, Created by, Last modified
* UPDATE Operations:
  + Inline editing: Click field value to edit simple fields
  + Edit form: Click ‘Edit’ button to open full form for complex operations
  + Field validation: Same rules as create, displayed in real-time.
  + Change confirmation: Dialog shown for critical field changes
  + Audit log entry: Every update logged with: User ID, Timestamp, Field name, Old value, New value
  + Cascade update: Changes propagate to dependent records where applicable
* DELETE Operations:
  + Soft delete (default): Record marked as "Inactive", not removed from database
  + Hard delete: Available only to Super Admin with two-step confirmation
  + Dependency check: System prevents delete if active dependencies exist
  + Delete action shows dependency warning when master is already used.
  + Hard delete is blocked if the entity is referenced by PR/TR/TO/Trips/QC records
  + Cascade delete: Option to delete entity and all dependencies (if allowed)
  + Delete audit log: Timestamp, admin ID, entity details, reason logged
* Common across all operations:
  + Depot Managers can only view entities in their depot
  + All operations respect RBAC permissions
  + Success/error messages displayed prominently with appropriate icons

**Functional Requirements:**

* [Critical] Admins SHALL create, edit, delete master data for all entity types.
* [Critical] System SHALL maintain referential integrity (see section 5.3.3).
* [Critical] List view SHALL support pagination (25/50/100 per page).
* [Critical] List view SHALL support column sorting and full-text search.
* [Critical] System SHALL prevent deletion of records with active dependencies.
* [Critical] All CRUD operations SHALL be logged in audit trail.
* [High] Advanced filtering SHALL be available (status, type, date range).
* [High] Export to Excel/ CSV SHALL be available with applied filters.
* [High] Soft delete SHALL be default behavior preserving audit history.
* [High] Concurrent edit detection SHALL prevent data loss from simultaneous updates.
* [Medium] Restore function SHALL be available for soft-deleted records (90 days).
* [Medium] Approval workflow SHALL be enforced for sensitive field updates.

### Data Consistency Rules (Referential Control)

**Version 1.0, Phase – 1**

**User Story:** *As a System Admin, I want referential integrity rules so that wrong master relationships do not break operational workflows*.

**Acceptance Criteria:**

* System validates dependencies like:
  + Drivers/helpers must be valid and active before assignment
  + Vendor vehicle records must belong to approved vendor profiles
  + Vehicle must be assigned to existing active depot
  + Product must belong to valid category
  + User must have valid role assignment
* Dropdown/lookup fields only show valid options:
  + Only active entities displayed in dropdowns
  + Inactive/deleted entities excluded from selection lists
  + Depot dropdown filtered by user permissions
  + Vehicle dropdown shows only vehicles available for assignment
* System provides detailed error messages for constraint violations:
  + "Cannot delete Depot ABC - 5 vehicles and 12 users currently assigned"
  + "Cannot delete Product Category Feed - 23 products exist under this category"
  + "Cannot modify Route XY - 3 approved TRs currently reference this route"
* System prevents saving inconsistent mappings (with error message indicating root cause)
* A route cannot exist without valid POIs
* A POI cannot be deactivated if it is referenced in open PR/TR/TO/Trip
* Product types must match configured allowed UOM and QC mapping rules

**Functional Requirements:**

* [Critical] System SHALL validate all foreign key relationships before saving records.
* [Critical] System SHALL prevent deletion of parent records with active child records.
* [Critical] Dropdown/lookup fields SHALL only display valid, active related entities.
* [Critical] Error messages SHALL clearly indicate constraint violations with entity details.
* [Medium] System SHALL maintain relationship history for audit purposes.

## Product Inventory Management (PIM)

### Product Catalogue Management – Product Master Data

**Version 1.0, Phase 1**

**User Story:** *As a Tenant Admin, I want to define and manage product master data — including its category structure and its transport and quality-control attributes — so that every downstream workflow (requisitions, transport planning, QC, and costing) operates from standardized, accurate product information.*

**Acceptance Criteria:**

* Products are managed with full create, edit, view, and deactivate operations; there is no hard delete, so product history is always preserved.
* System supports two product types:
  + Finished Goods (FG)
  + Raw Materials (RM)
* For **Finished Goods (FG)**:
  + Product SKU Code *(Unique per tenant)*
  + Product Item Code *(Unique per tenant)*
  + Product Name
  + Product Type (Raw Material/Finished Goods)
  + Product Category
  + Product Sub-Category
  + Unit of Measure (Bag/Ton/KG/Liters/Piece/Carton)
  + Weight per Unit (KG) *[Required for Bag, Pieces, Cartons. Auto-filled for Ton (1000), KG (1), Liters (1).]*
  + Standard Pack Size (Pallet/Drum/Roll)
  + Standard Pack Size *[Pack Size: (Pellet/Drum/Roll)]*
  + Description
  + Barcode Ean
  + Manufacturer Name
  + Preferred Vehicle body Type
    - Open Body
    - Closed Body
    - Container
    - Flat
    - Tanker
    - Refrigerated
  + Special Handling Requirements
  + Status (Active/Inactive)
* For **Raw Materials (RM):**
  + Product SKU Code
  + Product Item Code
  + Product Name
  + Product Type (Raw Material/Finished Goods)
  + Product Category
  + Product Sub-Category
  + Unit of Measure (Bag/Ton/KG/Liters/Piece/Carton)
  + Weight per Unit (KG) *[Required for Bag, Pieces, Cartons. Auto-filled for Ton (1000), KG (1), Liters (1).]*
  + Standard Pack Size *[Pack Size: (Pellet/Drum/Roll)]*
  + Description
  + Barcode Ean
  + Manufacturer Name
  + Preferred Vehicle body Type
    - Open Body
    - Closed Body
    - Container
    - Flat
    - Tanker
    - Refrigerated
  + Special Handling Requirements
  + Status (Active/Inactive)
* Product codes are unique within a tenant
* Inactive products cannot be selected in PR/TR/TO/QC workflows
* All product create/update actions are audit logged
* Deactivating a product preserves its history; deactivated products cannot be selected in new requisitions, transport orders, or QC tests, while existing historical references to them remain read-only and intact.
* Product categories and sub-categories are separately managed as their own master records (code, name, status), with sub-category selection dependent on the chosen category.
* All create, update, and status-change operations on products are audit logged with user, timestamp, and changed fields.

**Functional Requirements:**

* [Critical] System SHALL provide a centralized Product Master module under PIM.
* [Critical] System SHALL enforce unique Product Code/SKU per tenant.
* [Critical] System SHALL support multiple product types aligned with DFMS operations (Feed, RM, FG, DOC, Packaging)
* [High] System SHALL allow activating/deactivating products without deleting historical references.
* [High] System SHALL conditionally require Weight Per Unit only when the product's Unit of Measure is Bag, Pieces, or Cartons, and SHALL hide/omit this field for Ton, KG, or Liters.
* [High] System SHALL provide separate CRUD management for Product Category and Product Sub-Category as their own master records, each with a code, name, and active status.
* [Medium] A product marked Inactive cannot be used in new operational transactions
* [Medium] System SHALL capture supplementary product attributes where available, including Barcode/EAN Code, Manufacturer Name, and Special Handling Requirements, all as optional fields.

## POI (Point of Interest) - Management & Geofencing

### Point Of Interest (POI) Setup, CRUD & Classification

**Version 1.0, Phase 1**

**User Story:** *As a Tenant Admin, I want to define and manage Points of Interest (POIs) with GPS coordinates, geofence radius, and storage capacity, so that all DFMS workflows — requisitions, transport orders, gate operations, and capacity planning — can reference accurate, real-world operational locations.*

**Acceptance Criteria:**

* Tenant Admin can create POI with:
  + POI (Project) name (required, unique per tenant, 3-100 characters)
  + POI Type
    - Aquaculture
    - Breeder
    - Breeder Farm
    - Broiler
    - Broiler Farm
    - Depot
    - Depot, Godown
    - Feed Mill
    - Farm
    - Godown
    - Green Field
    - Hatchery
    - Office
    - Port
    - Poultry Lab
    - Production Unit
    - R&D
    - Supplier Premises
    - Vendor Premises
    - Warehouse
    - Waste Management
    - Other
  + POI Classification: Inbound / Outbound / Neutral
    - Default classification based on POI Type:
      * Factory: Default = Outbound (finished goods production)
      * Depot: Default = Neutral (receives and distributes)
      * Feed mill: Default = Inbound (receives raw materials primarily)
      * Port: Default = Outbound (moves out raw materials primarily)
      * Warehouse: Default = Neutral (storage and distribution)
      * Distribution: Default = Neutral (hub operations)
  + Address/area (full text address)
  + Geofence Coordinates: GPS coordinates are validated to valid ranges (Latitude −90 to 90, Longitude −180 to 180); latitude/longitude are the system's source of truth for geofencing.
    - Latitude (required, -90 to 90),
    - longitude (required, -180 to 180)
      * Manual entry: Type latitude and longitude
    - Geofence radius (Meters) (required, 50-1000m range, default 100m)
  + In-Charge Person Name (optional)
  + Contact Number (optional, phone format validation)
  + Total storage capacity (considered ‘Total Capacity’ for PR stock view) (numeric in metric tons). Total Storage Capacity, Current Stock, Free Capacity, and Projected Capacity are visible on the POI detail view and on Requisition creation as a source/destination capacity snapshot, with configurable threshold warnings at 80% and 90% utilization.
  + Status (Active/Inactive, default Active)
* POI record shows operational status (Active/Inactive)
* POI capacity is tracked as ‘Total Capacity’ (not bin-level WMS)
* POI must be active to be used in PR/TR/TO
* The POI create/edit form includes an interactive map location picker (draggable pin, geofence circle preview, reverse-geocoded address) so the admin can set coordinates visually instead of typing raw values; the reverse-geocoded address is a convenience helper and may differ from map labels.
* The POI list is paginated, searchable, sortable, and filterable by Type and Status, and shows Name, Type, Address, Coordinates, Geofence Radius, Capacity, and Status.
* Setting a POI to Inactive blocks it from being selected in new Product Requisitions, Transport Requests, Transport Orders, or Gate workflows; active trips already referencing it are unaffected.
* Deleting a POI is a soft delete by default; hard delete is blocked if the POI is referenced by any Requisition, Transport Request, Transport Order, Trip, or Gate record.
* CSV bulk upload is available with a downloadable template, row-level error reporting, and append-only behavior.
* Every create, update, and deactivate action is audit logged.

**Functional Requirements:**

* [Critical] System SHALL provide a POI Setup module accessible to Tenant Admin users
* [Critical] System SHALL restrict POI creation and editing to Tenant Admin (RBAC-gated).
* [Critical] System SHALL allow creation of POIs with mandatory fields:
  + POI Name *(Unique)*
  + POI Type
  + Location
  + Geofence Radius
  + Total Storage Capacity
* [Critical] Admin CAN define POIs with Name, Type, GPS Coordinates, Radius.
* [Critical] System SHALL validate GPS coordinates within valid range (-90/90, -180/180).
* [Critical] POI name SHALL be unique within tenant.
* [Critical] System SHALL display POIs on interactive map with geofencing circles.
* [Critical] POI geofence SHALL be used by:
  + GPS Tracking
  + Vehicle arrival detection
  + Dwell time tracking
* [Critical] POI geofence data SHALL integrate with:
  + Transport Order (TO) execution
  + Trip monitoring
  + Gate-in / Get-out validation
* [Critical] Only Active POIs SHALL be selectable in:
  + Product Requisition (Source / Destination)
  + Transport Requisition (TR)
  + Transport Order (TO)
  + Destination Breakdown Plan
  + Command Center assignment, QC and Gate workflows
* [High] System SHALL calculate and expose:
  + Current Stock (from PR / TR / Trip updates)
  + Free Capacity
  + Total Capacity
* [High] System SHALL provide full CRUD (create, read, update, soft delete) with a hard-delete block when the POI is referenced elsewhere in the platform.
* [High] System SHALL provide a map-based location picker on the POI form, with the geofence circle preview driven by the configured radius.
* [High] Geofencing radius SHALL be configurable between 50-1000 meters.
* [High] System SHALL prevent deletion of POIs with active dependencies.
* [Medium] System SHALL compute and expose current stock, free capacity, and projected capacity per POI, with configurable 80%/90% threshold warnings.

## GPS Tracking & Monitoring (Live GPS)

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, Transport Distribution Officer, or Tenant Admin, I want to see the real-time GPS location of vehicles on a map, so that I can monitor trip progress, respond to delays, and confirm route compliance without relying on phone calls.*

**Acceptance Criteria:**

* Authorized operators can open a Live GPS map view (under tenant admin / Tracking) showing near real-time markers for all GPS-linked vehicles, including trip/Transport Order context where available.
* Fleet vehicles are shown on the map even when not currently on an active trip.
* All active, geocoded POIs render as geofence circles on the map, using the radius configured on the POI record.
* Each vehicle is uniquely matched to its live position via the Vehicle master's GPS Device ID (matched to the tracking provider's device identity, e.g. IMEI).
* The map displays speed, movement, and connection status per vehicle, including a distinct "signal-lost" state; after an idle threshold (approximately 10 minutes) with no update, the vehicle shows its last known position with an explicit signal-lost indicator rather than an invented position.
* Live vehicles show a recent trail/path on the map, and operators can "follow" a selected vehicle with the map camera.
* Map refresh interval is configurable platform-wide.
* Operators can browse vehicle history in two ways: Transport-Order-centric (trips/TOs within a time window) and idle history (periods when the vehicle was not on a trip), including position/speed series and activity/dwell summaries.
* GPS positions are read-only for all users — there is no user-facing create, edit, or delete of GPS data; positions are system-calculated from the provider feed.
* Each vehicle is uniquely identifiable
* Vehicle lifecycle date is maintained end-to-end
* Live vehicle location is displayed on a map interface
* GPS data is sourced from integrated IoT/GPS providers
* GPS refresh interval is configurable (e.g., 30s / 60s / 120s) [TBD]
* GPS data is read-only for all users
* Location accuracy depends on the GPS provider and network conditions
* Last known location is displayed if signal is lost
* GPS tracking is done by the system 24/7
* Utilization and operational metrics for TO are visible per vehicle
* Vehicle entity cannot be deleted once used in a trip

**Functional Requirements:**

* [Critical] System SHALL integrate with third party GPS/IoT providers using secure APIs
* [Critical] System SHALL display real-time vehicle location on map view
* [Critical] System SHALL display near real-time vehicle markers and active POI geofence circles on a live map for authorized roles (Transport Planner, TDO, Tenant Admin, Tenant Super Admin).
* [Critical] System SHALL match each vehicle to its live position using the Vehicle master's GPS Device ID.
* [Critical] System SHALL treat GPS position data as read-only for all user roles; no manual write/edit/delete of positions is permitted.
* [High] System SHALL show connection/movement status per vehicle, including a signal-lost state with last-known-position display after the configured idle threshold.
* [High] System SHALL provide vehicle trail display and a "follow vehicle" map camera mode.
* [High] System SHALL provide Transport-Order-centric and idle-period history browsing via dedicated tracking history APIs.
* [Medium] System SHALL make the live map refresh interval configurable at the platform level.
* [Medium] System SHALL prevent hard deletion of a vehicle that has been used on a trip, to preserve historical GPS/trip linkage.
* [High] System SHALL link associate GPS data with vehicle ID, TO ID and Trip ID

## POI Geofencing Boundary Management

**Version 1.0, Phase 1**

**User Story:** *As a Tenant Admin, I want to define a geofence radius, in metres, for each Point of Interest, so that vehicle arrival and departure can be detected automatically when a vehicle enters or leaves a facility.*

**Acceptance Criteria:**

* Tenant Admin (or other roles authorized to edit POI master data) can define or edit a geofence radius, in metres, for each POI directly from the standard POI edit form — there is no separate geofence object to manage.
* The geofence is always a circle centered on the POI's latitude/longitude, with exactly one active geofence per POI.
* Radius changes are validated against a sane minimum/maximum range *(50-1000m)*
* Only Active POIs with coordinates participate in operational and map-based geofencing.
* Radius (and coordinate) changes take effect immediately for live trips and on the Live GPS map — no restart, cache flush, or trip re-creation is required.
* Roles with POI view access can see the radius as read-only context; only roles with POI write access can edit it.
* Changing a POI's radius does not delete or alter historical arrival/departure event records already logged against that POI.

**Functional Requirements:**

* [Critical] System SHALL store geofence radius as a field on the POI master record, editable only by roles with POI write permission.
* [Critical] System SHALL enforce that each POI has exactly one active circular geofence, centered on its stored coordinates.
* [Critical] System SHALL apply radius and coordinate changes immediately to the live arrival/departure evaluation engine and to Live GPS map rendering.
* [High] System SHALL validate radius values against a configured minimum/maximum range.
* [High] System SHALL preserve historical geofence event records unchanged when a POI's radius or coordinates are later modified.

## Vehicle Arrival Tracking at POI

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner or Transport Distribution Officer, I want the system to automatically detect when a vehicle enters or leaves a facility geofence, so that arrival and departure are logged without relying on phone calls or manual gate entry alone.*

**Acceptance Criteria:**

* While a vehicle is executing an active trip linked to a Transport Order, each GPS update is evaluated against the geofence circles of that Transport Order's origin and destination POIs.
* Entry and exit are detected using Haversine distance against the POI center and its current configured radius, plus a small detection buffer; presence state (inside/outside) is tracked so that one Arrival (entry) and one Departure (exit) are recorded per visit.
* An Arrival event is recorded on outside-to-inside transition; a Departure event is recorded on inside-to-outside transition. Both are linked to Vehicle, Trip, Transport Order, POI, and timestamp.
* On Departure, geofence dwell time (departure minus arrival) is calculated automatically and stored on the event; users cannot manually enter or override this value.
* When a vehicle enters the Transport Order's origin geofence while en route, trip status automatically advances to "arrived at source"; entering the destination geofence advances status to "arrived at destination."
* Idle or off-trip vehicles do not generate Transport-Order-linked arrival/departure events in Phase 1, even though their position may still be visible on the Live GPS map.
* Arrival/departure event history is viewable by authorized roles via the tracking API, scoped by trip/Transport Order.
* All arrival/departure records are system-generated; there is no admin or user workflow to manually create, edit, or delete an event.

**Functional Requirements:**

* [Critical] System SHALL evaluate GPS updates for a vehicle on an active trip only against that trip's Transport Order origin and destination geofence circles — not against every active POI in the tenant.
* [Critical] System SHALL detect entry (Arrival) and exit (Departure) using Haversine distance against POI center, current radius, and a detection buffer, maintaining inside/outside presence state per vehicle/POI pair.
* [Critical] System SHALL persist Arrival and Departure events with linkage to Vehicle, Trip, Transport Order, and POI, and SHALL calculate geofence dwell time automatically on Departure.
* [Critical] System SHALL automatically advance trip status to "arrived at source" or "arrived at destination" on the corresponding geofence entry while the trip is en route.
* [High] System SHALL suppress Transport-Order-linked arrival/departure event generation for idle or off-trip vehicles
* [High] System SHALL expose arrival/departure event history via a read-only tracking API, filterable by trip and Transport Order.
* [High] System SHALL keep all geofence event records read-only to users — no manual creation, editing, or deletion.

*Note: All active, geocoded POIs are visible as geofence circles on the Live GPS map (see 6.5.2). Automated arrival/departure event****logging****, however, is scoped only to a trip's Transport Order origin and destination — this keeps planner-facing "arrived at source/destination" signals meaningful rather than generating noise from every nearby facility a vehicle happens to pass. Gate-in/gate-out timestamps remain a separate, independent clock and are not replaced by GPS-based arrival detection.*

## Dwell Time Tracking

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner or Transport Distribution Officer, I want to see planned, gate, and geofence dwell time for the source and destination POIs on a Transport Order, so that I can compare plan against actual and identify delays without relying on a single clock source.*

**Acceptance Criteria:**

* The system presents three distinct dwell perspectives, side by side, for both the source and destination legs of a Transport Order:
  + **Planned** — the planned dwell time from Transport Order planning/milestone data.
  + **Real Time (Gate)** — gate-out minus gate-in, derived from yard/gate operation timestamps where those events exist.
  + **Geofence time** — departure minus arrival, calculated from GPS-based arrival/departure events at the POI boundary (see [6.5.4](#_Vehicle_Arrival_Tracking)).
* Geofence dwell is auto-calculated on every Departure event and applies to both source and destination POIs.
* All three dwell values are viewable together in the Transport Order's milestone/timeline context, so planners can compare plan vs. gate vs. geofence without navigating away.
* If actual (geofence) dwell exceeds planned dwell, the overrun is visible in the Transport Order context for planner review.
* Geofence dwell values are system-calculated only; there is no manual entry or override workflow..

**Functional Requirements:**

* [Critical] System SHALL calculate geofence dwell time automatically as departure timestamp minus arrival timestamp for each vehicle/POI visit, for both source and destination legs.
* [Critical] System SHALL display Planned, Real Time (Gate), and Geofence time together within the Transport Order milestone view.
* [High] System SHALL surface a visible planned-vs-actual comparison when actual (geofence) dwell exceeds planned dwell.
* [Medium] System SHALL expose dwell data via the Transport Order timeline/geofence-events API for downstream reporting.

*Note: Phase 1 exception visibility is limited to comparing actual dwell against planned dwell within the Transport Order context. Proactive in-fence alerts, POI-level configurable dwell thresholds, and a dedicated exception-management centre were not part of this delivered scope.*

## GPS-Based Vehicle Maintenance Tracking

**Version 1.0, Phase 2**

**User Story:** *As a Transport Planner, I want to use GPS movement and distance data to plan vehicle maintenance proactively, so that vehicles are serviced on time, breakdown risk is reduced, and fleet availability improves.*

**Acceptance Criteria:**

* System tracks
  + System calculates distance travelled per vehicle using GPS odometer data (Depends on the GPS IoT device capability)
  + Distance since last service
  + Remaining distance before next service
  + Maintenance Threshold can be configured (e.g., Every 5000 km / 10,000 km / 20,000 km)
  + Identify high-stress vehicle usage patterns
* System computes vehicle usage indicators:
  + Average daily distance
  + High-load route frequency
  + Idle vs movement ratio

**Functional Requirements:**

* [High] System SHALL calculate cumulative distance travelled since last maintenance
* [High] System SHALL allow configuration of distance-based maintenance threshold
* [High] System SHALL associate GPS mileage with vehicle maintenance records

## Fleet & Vehicle Management

## Vehicle Brands

**Version 1.0, Phase 1**

User Story: *As a Tenant Admin, I want to maintain a catalog of vehicle brand names for my tenant, so that vehicle registration uses a consistent, controlled list instead of free-text brand entry.*

**Acceptance Criteria:**

* Admin can view the list of vehicle brands.
* Tenant Admin can create, view, edit, and deactivate brand names under a dedicated Brands screen within Master Data.
* Brand name is unique per tenant.
* When registering or editing a vehicle, Brand is an optional dropdown populated only from the tenant's active Brand catalog; free-text brand entry is not available on the vehicle form.
* Deactivating a brand hides it from the dropdown for new vehicle selections; vehicles already linked to that brand remain valid.
* Admin can search, filter, import, and export vehicle brands.

**Functional Requirements:**

* [Critical] System SHALL provide a Brands management screen under Master Data, restricted to Tenant Admin (per RBAC) for create/edit/deactivate.
* [Critical] System SHALL enforce brand name uniqueness per tenant.
* [High] System SHALL populate the vehicle form's Brand field exclusively from the tenant's active Brand catalog, with no free-text alternative.
* [Medium] System SHALL exclude deactivated brands from the dropdown for new selections while preserving existing vehicle-brand links.

## Vehicle Registration & Master Data Management

**Version 1.0, Phase 1**

**User Story:** *As a Tenant Super Admin or Transport Planner or tenant admin, I want to register vehicles with complete identification and configuration details so that vehicles can be tracked, assigned, and monitored throughout transport operations.*

**Acceptance Criteria:**

* System allows registration of vehicles with unique identifiers:
  + Vehicle registration captures:
    - Registration/License Number (*mandatory, unique per tenant, validated against the Bangladesh registration format*)
      * Format validation: Bangladesh vehicle registration pattern
      * Display format: Dhaka Metro-GA-11-1234
    - Vehicle Type *(required)*
      * Pickup Van
      * Open Truck
      * Covered Truck
      * Nosimon
      * Auto
      * Tom Tom
      * Tractor
      * Primemover
      * Poultry Carrier
      * Tipper
      * Delivery Van
    - Body Type *(Required)*
      * Open Body
      * Closed Body
      * Container
      * Flatbed
      * Tanker
      * Refrigerated
      * Lowbed
    - Fuel Type *(Required)*
      * Diesel
      * Petrol
      * CNG
      * Electric
      * Hybrid
    - Capacity (Max Load Capacity)
      * Manual override allowed
      * Capacity Unit
        + MT
        + KG
    - Number of Wheels (*Numeric Input, Required*)
      * 4, 6, 10, 12, 16, 18, 20+
    - Brand *(optional dropdown from the tenant Brand catalog — see* [*6.6.1*](#_Vehicle_Brands)*)*
    - Model (Optional)
    - Year of Manufacture
    - Chassis Number (*unique per tenant, VIN format)*
      * VIN (Vehicle Identification Number) format
      * Uniqueness validation
    - Vehicle Color
    - Allowed Product Category (FM / RM / Both, Byproducts, Machineries)
    - Odometer Reading
      * Odometer reading [Initial & Current] (numeric, KM)
      * Current Odometer Reading
      * Average Mileage
      * Total Distance Travelled
    - Assigned Driver (Optional)
      * Select from active drivers
      * Can be assigned post-registration
    - GPS Tracker/Device ID
      * Tracker ID
      * Sim Number
    - Date of Purchase (optional)
    - Year of Manufacture
    - Fitness Certificate Expiry Date
    - Insurance Expiry Date
* Registration Number and Chassis Number are stored as a unique entity in the system
* The vehicle list view is paginated, searchable, sortable, and filterable by Status, Vehicle Type, Brand, Is Active Status, Assigned POI.
* System SHALL provide search by registration number, type, POI
* The system supports full CRUD, inline editing at row and column level, and vehicle activation/deactivation.
* Referential integrity is enforced — an Assigned POI must exist and be Active.
* The system supports full CRUD, inline editing at row and column level, and vehicle activation/deactivation.
* Referential integrity is enforced — an Assigned POI must exist and be Active.
* A vehicle cannot be assigned to a trip unless its operational status is Active, and one vehicle can only be assigned to one active trip at a time.

**Functional Requirements:**

* [Critical] System SHALL validate all mandatory vehicle fields (Vehicle Type, Registration Number, Chassis Number, Model, Number of Wheels, Fitness Certificate Expiry, Insurance Expiry) before save.
* [Critical] System SHALL enforce uniqueness of Registration Number and Chassis Number per tenant.
* [Critical] System SHALL provide CSV bulk upload with a vehicle-specific template, append-only behavior, per-row independent validation, and audit-logged upload actions (file name, uploader, timestamp, rows processed/succeeded/failed).
* [Critical] System SHALL enforce referential integrity for Assigned POI (must exist and be Active).
* [High] System SHALL provide search by registration number, type, and depot, with multi-criteria filtering.
* [High] System SHALL support inline editing at row and field level from the vehicle list.
* [High] System SHALL exempt vendor-owned vehicles from mileage-tracking validation rules.
* [Medium] System SHALL support single-row delete with a mandatory delete reason, deleting user, and timestamp captured.

*Note: Vehicle operational status transitions (Available / Active / Idle / Under Maintenance) are driven by workflow and inspection events rather than direct manual editing — see* [*6.6.3*](#_Vehicle_Status_and)*.*

## Vehicle Status and Health Management

**Version 1.0, Phase 1**

**User Story:** *As a Driver Supervisor, I want to run a vehicle inspection checklist before a Transport Order is released to Dispatch, and manage vehicles that fail inspection through a maintenance queue and return-to-service re-inspection, so that dispatch is not needlessly blocked while unsafe vehicles are reliably removed from service with a clear audit trail.*

**Acceptance Criteria:**

* A Transport Order enters the Driver Supervisor's dispatch-readiness queue once the Transport Distribution Officer (Own Fleet) has fully assigned
  + vehicle,
  + driver,
  + helper(s), and
  + ETA (queue is keyed on the "Ready for Dispatch" status).
* Immediately before releasing the Transport Order to Dispatch, the Driver Supervisor chooses to either
  + skip the checklist (no inspection record required) or
  + run the predefined daily inspection checklist against the assigned vehicle in the context of that Transport Order.
* The daily inspection checklist is a single, generalized, predefined, immutable set of items grouped into seven sections —
  + Engine,
  + Clutch,
  + Gear Box,
  + Container,
  + Electric,
  + Chassis, and
  + Cabin — each item scored per line (OK / Issue / N/A) with a remarks field; no user can add, remove, or edit checklist sections/items.
* If the checklist outcome is "Vehicle OK," the Transport Order transitions to Dispatched.
* If the checklist outcome is "Vehicle not OK," the vehicle's operational status is set to **Under Maintenance** (excluding it from new Transport Distribution Officer assignment), the linked Transport Order rolls back to Under Planning for the TDO to reassign vehicle/driver/helper/ETA, and the vehicle/driver/helper links on that order are cleared.
* The Driver Supervisor has a dedicated **Under Maintenance queue** (scoped to their own fleet/POI) listing each vehicle's registration, operational status, date flagged, and last inspection outcome, with search/filter by registration.
* From the maintenance queue, the Supervisor can start a new re-inspection using the same predefined checklist, in a "maintenance clearance" context (no Transport Order required). A passed re-inspection sets the vehicle back to Available and re-enables it for TDO assignment; a failed re-inspection keeps it Under Maintenance with a captured rejection reason.
* A vehicle flagged **Under Maintenance** via master-data deactivation (is\_active = False) is visible in the queue but cannot be cleared to Available until it is reactivated in master data — the system surfaces a clear blocking message.
* Every **skip**, **checklist completion**, **rejection**, and **maintenance-clearance** action is audit logged (who, when, vehicle, inspection/TO reference), including a distinct "Maintenance Completed" label on the inspection history for return-to-service passes (separate from a routine pre-dispatch "Vehicle OK" outcome).
* Basic **Vehicle status** he will be able to view are:
  + **No Active TO** – when this vehicle is not assigned to any TO
  + **Scheduled** – when a vehicle is assigned to a TO but TO not started yet
  + **In – Transit** – Vehicle is moving towards Source or Destination
  + **Under Maintenance** – Vehicle is taken for maintenance.
  + **Inactive** – Vehicle is set to not serving mode

**Functional Requirements:**

* [Critical] System SHALL provide a single predefined, immutable daily inspection checklist covering seven fixed sections (Engine, Clutch, Gear Box, Container, Electric, Chassis, Cabin) with per-item OK/Issue/N/A scoring and remarks.
* [Critical] System SHALL allow the Driver Supervisor to either skip the checklist or complete it before transitioning a Transport Order to Dispatch.
* [Critical] System SHALL transition the vehicle to **Under Maintenance** and the linked Transport Order to Under Planning (clearing vehicle/driver/helper assignment) when the checklist outcome is "Vehicle not OK."
* [Critical] System SHALL exclude vehicles with operational status **Under Maintenance** from Transport Distribution Officer assignment pickers.
* [High] System SHALL provide a Driver Supervisor maintenance queue, scoped to their fleet/POI, listing Under Maintenance vehicles with status, date flagged, and last inspection outcome.
* [High] System SHALL support a maintenance-clearance re-inspection flow, using the same checklist template, that returns a vehicle to Available on a pass and keeps it Under Maintenance (with reason) on a fail.
* [High] System SHALL block a return to Available for vehicles deactivated in master data (is\_active = False) until master-data reactivation occurs, with a clear blocking message to the user.
* [High] System SHALL audit-log all skip, checklist-complete, reject, and maintenance-clearance actions, including a distinct "Maintenance Completed" label for return-to-service passes.

*Note: This capability spans the vehicle master's operational-status model (*[*6.6.2*](#_Vehicle_Registration_&)*) and the Driver Supervisor's inspection/checklist workflow, delivered together as the vehicle license, health, and handover checklist feature.*

## Vehicle Tracking & Dashboard

**Version 1.0, Phase 2**

**User Story:** *As a Transport Planner, I want a dashboard showing vehicle availability so that I can plan trips effectively.*

**Acceptance Criteria:**

* Dashboard displays vehicle availability status
* System will track per vehicle
  + Kilometers
  + Fuel intake
  + Maintenance Window history
  + Operational lifecycle
* Maintenance and downtime visibility available
* Filters available by depot and ownership
* Vehicle under maintenance are unavailable for assignment

**Functional Requirements:**

* [Critical] System SHALL provide a fleet Health Dashboard
* [Critical] System SHALL track per vehicle:
  + Kilometers
  + Fuel intake
  + Maintenance history
  + Operational lifecycle
* [High] Dashboard SHALL display:
  + **No Active TO** – when this vehicle is not assigned to any TO
  + **Scheduled** – when a vehicle is assigned to a TO but TO not started yet
  + **In – Transit** – Vehicle is moving towards Source or Destination
  + **Under Maintenance** – Vehicle is taken for maintenance.
  + **Inactive** – Vehicle is set to not serving mode
* [High] System SHALL link vehicle entity with TO, Trip, Driver, Fuel, and maintenance records

## Vehicle Status Matrix & Availability

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want to view real-time vehicle status for each vehicle so that I can plan assignments efficiently.*

**Acceptance Criteria:**

* System displays vehicle status as:
  + **No Active TO** – when this vehicle is not assigned to any TO
  + **Scheduled** – when a vehicle is assigned to a TO but TO not started yet
  + **In – Transit** – Vehicle is moving towards Source or Destination
  + **Under Maintenance** – Vehicle is taken for maintenance.
  + **Inactive** – Vehicle is set to not serving mode
* Status can be filtered by depot, ownership and vehicle type
* Vehicle in Maintenance cannot be assigned

**Functional Requirements:**

* [Critical] System SHALL maintain real-time vehicle status indicators.
* [Critical] System SHALL update vehicle state automatically based on trip events.

## Vehicle and Resource Assignment

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner (TP), I want to track vehicle assignments and utilization so that fleet efficiency can be monitored.*

**Acceptance Criteria:**

* TP will be able to assign vehicle and associated driver & Helper to a Transport Order (TO).

**Functional Requirements:**

* [Critical] System SHALL track vehicle-to-TO assignment history.
* [Critical] System SHALL calculate utilization based on trips and time.

## Vehicle Utilization Analytics

**Version 1.0, Phase 2**

**User Story:** *As a Transport Planner, I want to analyze vehicle utilization so that under- or over-utilized assets can be optimized.*

**Acceptance Criteria:**

* Utilization metrics visible per vehicle.

**Functional Requirements:**

* [High] System SHALL calculate:
  + Trips per vehicle
  + Active vs idle time

## Vehicle Downtime Management

**Version 1.0, Phase 2**

**User Story:** *As a Driver supervisor, I want to track vehicle downtime so that availability and planning accuracy improves.*

**Acceptance Criteria:**

* Downtime reasons logged
* Change status of vehicle to ‘Under Maintenance’
* Availability adjusted automatically.

**Functional Requirements:**

* [High] System SHALL log downtime with:
  + Reason
  + Start & End date time
* [High] Downtime SHALL reduce availability metrics

## Manual Workshop Entry

**Version 1.0, Phase 3**

**User Story:** *As a Vehicle supervisor, I want to manually record workshop activities, maintenance costs, issues, and estimated vs Actual repair time for vehicles, so that vehicle health, downtime and maintenance costs are properly tracked.*

**Acceptance Criteria:**

* Vehicle Supervisor can create a **Workshop Job Entry** against a selected Vehicle
* Each Job Entry captures:
  + Vehicle ID
  + Workshop Type (Internal / External)
  + Workshop Location / Name (Dropdown)
  + Maintenance Category (Preventive / Breakdown / Accident / Inspection)
  + Problem Description (Free Text)
  + Date & Time In (Vehicle Received at Workshop)
  + Estimated Repair Duration (Hours / Days)
  + Estimated Cost
  + Actual Cost
  + Receipt
* System allows entry of:
  + Actual Repair Start Date & Time
  + Actual Repair End Date & Time
* System automatically calculates:
  + Actual Repair Duration
  + Delays vs Estimated Time
* Vehicle Status changes automatically:
  + Maintenance – In Progress
  + Maintenance – Completed
* User can record:
  + Part Cost with text box input for used Parts
  + Outsourced Service Cost
  + Miscellaneous Cost
* System auto-calculates:
  + Total Maintenance Cost
* Costs are linked to:
  + Vehicle ID
  + Maintenance Job Reference
* Workshop Job can be marked **Completed** only if
  + Actual End time is entered
  + Cost Summary is saved
* On Completion:
  + Vehicle status changes back to **Available / Idle**
  + Maintenance history updated
* Each vehicle maintains a **Maintenance timeline** showing:
  + Date
  + Type of Maintenance
  + Cost
  + Downtime
* All entries are audit-logged

**Functional Requirements:**

* [Critical] System SHALL allow manual creation of workshop maintenance jobs against vehicles
* [Critical] System SHALL
* [High] Vehicles marked under active workshop jobs SHALL be excluded from:
  + TR Assignment
  + TO Creation
  + Trip Planning
* [High] Vehicle Downtime SHALL be calculated from workshop entry timestamps

## Driver & helper Management

## Driver Master Data & Driver Invitation as Users

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner or Tenant Admin, I want to register and manage driver profiles with compliance and license information, so that only verified, currently-licensed drivers are assigned to trips.*

**Acceptance Criteria:**

* Driver profile captures:
  + Contact Number\* *(unique per tenant)*
  + Email (Login) *(optional)*
  + First Name
  + Last Name
  + Employee ID
  + Email
  + Driver Type (Permanent/Temporary/Own/Vendor)\*
  + Driving License Number,
  + License Type\*
  + License Expiry Date\*
  + National ID *(optional, unique per tenant when provided)*
  + Reference Contact (Minimum 2 contact)
  + Accident History
  + Last training Assessment Information
  + Address
  + Experience Certificate (Document upload)
  + Biodata (Document upload)
  + Medical Certificate (Document upload)
  + Status
    - Available *(default, unassigned)*
    - On Execution *(derived from an active Transport Order on road/yard)*
    - Assigned
    - Inactive *(Not serving currently)*
    - On Leave
* Uniqueness is enforced per tenant on Contact Number, Driving License Number, National ID Number (when provided), and Employee ID (on the linked User).
* CSV bulk import creates or links the User and Driver together per row, supports optional invitation dispatch per row rules, and reports row-level success/failure.
* The driver list (active drivers only) is searchable and filterable, and the driver detail view shows license/document status alongside current operational state (see [6.7.3](#_Driver_State_Tracking)).

**Functional Requirements:**

* [Critical] System SHALL create a linked User record (Role = Driver, Department = Operations) in the same transaction as every Driver record, for both single and bulk creation paths.
* [Critical] System SHALL enforce per-tenant uniqueness on Contact Number, Driving License Number, and Employee ID (on the linked User); National ID Number uniqueness is enforced only when a value is provided.
* [Critical] System SHALL support CSV bulk import of drivers, creating/linking the paired User and Driver rows per record with row-level validation and error reporting.
* [High] System SHALL store license type, license expiry date, and medical certificate expiry date on the Driver record, with document upload support (Experience Certificate, Biodata, Medical Certificate).
* [High] System SHALL list only active drivers by default in the driver list API, with search and filter support.
* [Medium] System SHALL support an optional permanent/home vehicle link on the Driver record.

*Note: Driver Master Data was delivered as a combined User+Driver profile within the platform's user-management module (apps.users), not as a stand-alone master-data entity — this reflects a deliberate architectural decision (driver is a user profile type, not a vehicle-adjacent asset). Performance metrics (on-time delivery %, incident count, fuel efficiency, ratings) and a multi-step guided registration wizard, both described in the original story draft, were not part of the delivered Phase 1 scope.*

## Driver-Vehicle Assignment

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want to assign drivers to vehicles so that trips are carried out with the correct and available personnel.*

**Acceptance Criteria:**

* System allows assignment and reassignment of drivers to vehicles
* Only drivers in an assignable state (not On Leave, not already on an active trip) and vehicles that are not Under Maintenance can be assigned
* One driver can be assigned to only one active vehicle at a time
* On Leave drivers are blocked from being selected on new Transport Order assignments at the API validation level.
* Assignment triggers the driver's operational state to move to Assigned (see 6.7.3); trip completion or reassignment returns the driver to Available.
* Assignment history is retained for audit and reporting

**Functional Requirements:**

* [Critical] Assignment triggers the driver's operational state to move to Assigned (see [6.7.3](#_Driver_State_Tracking)); trip completion or reassignment returns the driver to Available.
* [Critical] System SHALL prevent assigning:
  + Absent drivers
  + Drivers already assigned to an active trip
  + Vehicles under maintenance
* [High] System SHALL store assignment records including:
  + Driver ID
  + Vehicle ID
  + Assignment start date & time
  + Assignment end date & time
  + Assigned by (user)
* [High] System SHALL update driver operational state to Assigned upon Transport Order assignment, and back to Available upon trip completion or reassignment.

## Driver State Tracking

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, Transport Distribution Officer, and Driver Supervisor, I want to see driver states so that I can assign trips efficiently.*

**Acceptance Criteria:**

* Driver states updated automatically based on trip and GPS data
* Supported driver states:
  + On Execution
  + Assigned
  + Available *(default, unassigned)*
  + Inactive *(Not serving currently)*
  + On Leave
* Effective driving hours calculated using GPS trip data
* State transitions are triggered automatically by Transport Order assignment (Available → Assigned), trip execution start (Assigned → On Execution), and trip completion (On Execution → Available), as well as manually by the Driver Supervisor (e.g. setting On Leave).
* Driver state visible in planning and dispatch screens
* Driver state ‘On Trip’ takes precedence over all other states
* Driving hours calculation MUST exclude idle or parked durations

**Functional Requirements:**

* [Critical] System SHALL track driver state as:
  + On Execution
  + Assigned
  + Available
  + On Leave
  + Inactive (Not serving currently)
* [Critical] System SHALL update driver state based on:
  + Trip assignment
  + Trip start and completion
  + Manual attendance input (where applicable)
* [High] System SHALL calculate effective driving hours using GPS movement data per trip
* [High] System SHALL expose driver state in:
  + Trip planning screens
  + Vehicle assignment views
  + Dispatch boards
  + Driver Supervisor Menu

*Note: The five-state model (Available/Assigned/On Execution/On Leave/Inactive) is assembled from two coordinated pieces: the base current\_state field on the Driver profile (*[*6.7.1*](#_Driver_Master_Data)*) and the dedicated Driver State Tracking service, which adds the automatic transition hooks tied to Transport Order execution events and the full audit trail. Both were delivered together as one coherent capability.*

## Driver Availability Status Tracking

**Version 1.0, Phase 1**

**User Story:** *As a Driver Supervisor, I want to record driver attendance and working hours against a configurable daily maximum, so that scheduling stays within compliant working-hour limits..*

**Acceptance Criteria:**

* System supports attendance capture through:
  + Manual entry of
    - Driver,
    - POI,
    - Entry Date & Time,
    - Exit Date & Time
    - Notes
* A consolidated view shows calculated working hours per driver per day.
* Maximum daily working hours is configurable at the tenant level (default reference: 12 hours); when a driver's recorded hours exceed the configured maximum, the system returns a warning rather than a hard block.
* Attendance is managed through a dedicated "Driver Attendance" menu item, separate from Driver Leave Management (see [6.7.5](#_Driver_Leave_Management)).

**Functional Requirements:**

* [High] System SHALL support manual attendance entry (driver, POI, entry/exit date-time) with a uniqueness constraint of one record per driver per date.
* [High] System SHALL calculate and expose working hours per driver per day from recorded attendance.
* [High] System SHALL enforce a configurable maximum daily working-hours threshold (default 12 hours) as a soft warning, not a hard block.

*Note: Attendance in Phase 1 is captured manually by the Driver Supervisor. Automatic derivation of working hours from GPS trip movement data, and consolidation of manual and GPS-derived hours into a single record, were part of the original concept but were not delivered in Phase 1 — attendance is a manual-entry system of record only.*

## Driver Leave Management

**Version 1.0, Phase 1**

**User Story:** *As a Driver Supervisor, I want to manage driver leaves so that driver availability is accurately maintained and trip planning reflects who is available.*

**Acceptance Criteria:**

* System supports leave capture through:
  + Manual entry of
    - Driver
    - Start Date
    - End Date
    - Reason
* Can search leave records by driver name
* Setting a leave record automatically transitions the driver's state to On Leave.
* Drivers On Leave cannot be selected on new Transport Order assignments; the validation is enforced at the API level.
* A leave record can be edited before its start date, and can be cancelled early, which returns the driver to Available.
* Driver Leave Management is exposed as its own navigation menu item, separate from Driver Attendance.

**Functional Requirements:**

* [Critical] System SHALL allow Supervisor to add a driver leave record with Driver, Start Date, End Date, and Reason
* [Critical] System SHALL auto-derive Leave Status (Upcoming, Active, Expired, Cancelled) based on Start Date, End Date, and current date
* [High] System SHALL auto-capture Registered by based on the logged-in user
* [High] System SHALL prevent driver assignment to any TO overlapping an Active or Upcoming leave record
* [Medium] System SHALL allow Supervisor to search leave records by driver
* [Medium] System SHALL allow Supervisor to filter leave records by Status
* [Medium] System SHALL allow Supervisor to edit or cancel an existing leave record
* [Medium] System SHALL display leave record counts per status
* [Medium] System SHALL log all leave record additions, edits, and cancellations for audit

## Driver Performance Tracking

**Version 1.0, Phase 3**

**User Story:** *As a driver supervisor, I want to view detailed driver performance metrics so that I can coach drivers and improve operational outcomes.*

**Acceptance Criteria:**

* System tracks:
  + Total trips completed
  + Average trip duration vs planned
  + Delivery delay count
  + Incident-linked trips
  + Idle time percentage

**Functional Requirements:**

* [Critical] System SHALL display driver performance dashboard

## Helper Profile

**Version 1.0, Phase 1**

**User Story:** *As a Tenant Super Admin, Tenant admin I want to register and manage helper profiles so that helpers can be formally linked to drivers and tracked during transport operations.*

**Acceptance Criteria:**

* System allows creation and management of helper profiles
* Each helper profile stores:
  + Employee ID I*(mandatory, unique)*
  + Helper Full Name *(Mandatory)*
  + National ID *(optional – uniqueness is enforced per tenant only if a value is provided)*
  + Reference from known contacts (2)
  + Contact number *(mandatory, unique)*
  + Address *(optional)*
* System SHALL allow helper profile update with audit logging.
* Each helper MUST have a unique national ID.
* CSV bulk upload is supported with a template, append-only behavior, row-level error reporting, and inline row/column editing.
* All create, update, and status changes are audit logged.

**Functional Requirements:**

* [Critical] System allows creation and management of helper profiles
* [Critical] System SHALL capture the following mandatory helper information:
  + Employee ID I(mandatory, unique)
  + Helper Full Name (Mandatory)
  + National ID (optional – uniqueness is enforced per tenant only if a value is provided)
  + Reference from known contacts (2)
  + Contact number (mandatory, unique)
  + Address (optional)
* [High] System SHALL allow helper profile updates with audit logging.

*Note: National ID Number is an optional field for helpers in the delivered system — this is a deliberate difference from the driver profile, where license and identity fields carry stricter mandatory requirements, reflecting the lighter-weight compliance profile appropriate to a helper role.*

## Helper Assignment

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, Transport Distribution Officer (TDO), I want to assign helpers to a Transport Order (TO) so that trips are carried out with the required supporting personnel.*

**Acceptance Criteria:**

* One or more helpers can be assigned to a driver for a given trip (many-to-one mapping of helpers to a driver/trip context).
* The system prevents assigning a helper who already has a conflicting active-trip assignment.
* Assignment history is retained per trip, recording Driver ID, Vehicle ID, and Trip/Transport Order reference.
* Helper status auto-updates to On Trip on assignment and back to Available on trip completion.

**Functional Requirements:**

* [Critical] System SHALL support many-to-one mapping (multiple helpers to one driver).
* [High] System SHALL link helper assignments to:
  + Driver
  + Vehicle
  + Trip/Transport Order (TO)
* [High] System SHALL store helper assignment history per trip.

## Fuel Management System

## Fuel Management – Fuel Consumption Tracking

**Version 1.0, Phase 2**

**User Story:** *As a Driver supervisor, I want to track fuel consumption so that fuel efficiency and cost can be analyzed.*

**Acceptance Criteria:**

* Mileage and fuel captured
* Consumption calculated per KM.
* Fuel calculations rely on last recorded mileage

**Functional Requirements:**

* [High] System SHALL track:
  + Mileage
  + Fuel intake
* [High] System SHALL calculate fuel consumption per kilometer

## Fuel Management – Fuel Entry System

**Version 1.0, Phase 2**

**User Story:** *As a Driver, I want to record refueling events so that fuel tracking remains accurate.*

**Acceptance Criteria:**

* Fuel entries captured
* Receipt and mileage photo supported

**Functional Requirements:**

* [High] System SHALL allow fuel entry with:
  + Fuel quantity
  + Mileage reading
  + Receipt image
* [High] Workshop Supervisor SHALL be able to record refueling on behalf of drivers

## Fuel Performance Monitoring

**Version 1.0, Phase 3**

**User Story:** *As a Transport Planner, Transport Distribution Officer, and Driver Supervisor, I want to monitor vehicle fuel performance so that inefficient vehicles, misuse or maintenance issues can be identified early*

**Acceptance Criteria:**

* System calculates:
  + Fuel consumption per km
  + Fuel cost per trip
* Performance is viewable Per vehicle

**Functional Requirements:**

* [High] System SHALL calculate mileage using GPS distance and fuel entry data
* [High] System SHALL compute fuel efficiency trends per vehicle

## Product Requisition & Transport Requisition Management

Product Requisition Management module handles two distinct transfer workflows:

1. Finished Goods Transfer: Initiated by Depot/Feed mill – Approved by Distribution Department → Forwarded to Transport Department upon approval
2. Port Transfer: Initiated by Commercial Team (L.C Shipment) - Approved by Procurement Department → Distribution breakdown by Procurement Department → Forwarded to Transport Department

Both workflows integrates with real-time stock validation at source, capacity validation at destination, and transport requisition request (TR) generation upon approval.

## Finished Goods Product Requisition Creation

**Version 1.0, Phase 1**

**User Story:** *As a Depot or Feed Mill Officer, I want to raise a Finished Goods Product Requisition specifying product, quantity, and destination POI, so that the Distribution department is notified of demand and can plan Transport Requests accordingly.*

**Acceptance Criteria:**

* **Requester (Depot / Feed Mill)** Workflow
  + Requisition raised by:
    - Depot
    - Feed mill
  + Routed to Distribution for approval
  + Distribution:
    - TR Created by Distribution Officer with Number of vehicles required and Vehicle Type definition
    - TR approved by Distribution Manager
  + On Submitted:
    - Transport Requisition (TR) forwarded to Transport Department
* Users can add multiple product line items per PR
* Depot Officer / Feed Mill Officer shall define and enter the following information while creating a Product Requisition:
  + Requisition Type *(auto-set to Finished Goods),* Requester Name and Department (auto-filled, read-only), Destination POI (pre-filled from the requester's assigned POI, editable to any active POI), Preferred Delivery Date & Time, Urgency (Normal/High/Critical), and optional Special Instructions.
  + System auto-generates a PR number in the format *PR-FG-YYYYMMDD-XXXX*.
  + Source POI is not captured on the PR — it is defined later by the Distribution team when Transport Requests are created against the PR.
  + PR supports multiple product line items. Each line is entered via a searchable product autocomplete (name, SKU, or item code) which auto-populates Product Item Code, Product Name, Category, Sub-Category, and Type of Packing from the Product Master. The officer manually enters Unit of Measure, Quantity, and Weight per Unit (pre-filled from master data where available, editable).
  + System auto-calculates Total Weight per line item (Quantity × Weight per Unit) and a grand total across all line items.
  + PR lifecycle: Draft → Submitted. A Draft can be saved and edited; once submitted, the PR is locked from further edits by the requester and becomes visible to the Distribution department.
  + Urgency remains editable by the requester even after submission, since operational priority can change after the PR is raised.
  + Officer can cancel a Draft or Submitted PR with a mandatory cancellation reason. A PR with an active Transport Request against it cannot be cancelled.
  + Officer sees only their own PRs in the list view, with status, urgency, and search filters, and colour-coded status badges (**Draft, Submitted, In Progress, Fully Allocated, Fulfilled, Cancelled**).
  + Depot/Feed Mill Officers are restricted to the Finished Goods PR flow only — Port Shipment (import) registration is not available to this role.
* Logistics details captured:
  + Destination POI (project auto filled from which requester is making his request) (Auto-filled from Requester POI)
  + Preferred Delivery Date & Time
  + Special Instructions
  + Inventory Capacity (Stock of Requester POI) (Read-only)
* System displays capacity snapshot for requester POIs to Requester with Total Capacity, Free Stock, Current Capacity
* PR Documents (Documents upload)
  + Document Type
    - Arrival Notice
    - Other
* PR Status
  + Draft - This state when the depo/feedmill officer creates FG TR.
  + Submitted – This state when the PR has been submitted now appears in DO queues.
  + Partially Allocated – Distribution Officer opens TR from a submitted PR.
  + Fully Allocated - When the TR can take the full qty
  + Cancelled - When DO/DM reject the PR

**Functional Requirements:**

* [Critical] System SHALL allow only Depot and Feed mill users to raise Finished Goods requisitions.
* [Critical] System SHALL route Finished Goods requisition to Distribution for approval.
* [Critical] Commercial Officers SHALL only create Port Consignment PRs
* [Critical] Depot / Feed Mill Officers SHALL only create FG PRs

## Distribution Review & TR Creation by Distribution Officer (DO) - (Finished Goods)

**Version 1.0, Phase 1**

**User Story:** *As a Distribution Officer, I want to review all submitted Finished Goods Product Requisitions in a queue and create one or more Transport Requests against each, specifying source POI and quantity, so that demand from depots and feed mills is planned into concrete shipment legs before Transport Planning.*

**Acceptance Criteria:**

* **Transport Request** **Creation** Workflow conducted by:
  + Distribution Officer (DO)
* **Distribution Officer (DO):**
  + **DO** can view a list of submitted Finished Goods Product Requisitions
  + PR detail view shows full product line items, destination POI, urgency, delivery date, special instructions, requester details, the list of TRs already created against the PR with their statuses and allocated quantities, and the remaining unallocated quantity.
  + **DO** can create one or more TRs from a single PR (partial or full quantity)
  + A "Create Transport Request" action is available from PR detail (hidden once the PR is Fully Allocated or Cancelled).
  + System auto-generates a TR number in the format TR-FG-YYYYMMDD-XXXX.
  + System tracks Total PR Quantity, Total Allocated (across all TRs), and Remaining Quantity in real time, and blocks any TR that would cause the allocated total to exceed the PR quantity.
  + A single PR can be fulfilled by multiple TRs, each with a different Source POI; all TRs share the Destination POI inherited from the PR.
  + TR lifecycle on creation: Submitted directly to Pending Approval (no Draft state) — locked from further DO edits until the Distribution Manager rejects it back.
  + Distribution Officer's TR list shows TRs they created, with PR reference, status, source/destination, and quantity, filterable by status and date.
  + **TR captures** –
    - **Source** POI
    - **Transfer Quantity of Finished Goods**
    - Delivery Date
    - **Remarks (if any)**
  + System forwards the TR to **Distribution Manager (DM)** for review
  + PR Review queue search filters:
    - PR Number
    - Destination POI
  + Actions supported:
    - TR Creation with Source and destination POI, Quantity, Delivery date, Vehicle number and type of vehicle
* System displays capacity snapshot for requester (Destination) POIs to Distribution Officer (DO) and Distribution Manager (DM)
* TR Status:
  + **Pending Approval** – This state will be shown until TR is reviewed from Distribution Manager
  + **Rejected** – Status will be shown is TR is rejected by DM
  + **Available for Transport Planning** – Status will be shown after DM approves the TR
  + **Partially Allocated** – TP partially allocates TO for this TR
  + **Fully Allocated** – TP fully allocates TO against this TR
* Transport Request Approval routed to Distribution Manager
* Mandatory remarks are required for overrides or deviations.
* Approval authority is determined by transfer type

**Functional Requirements:**

* [Critical] System SHALL allow **Distribution Officer (DO)** to view approved **Product Requisitions (PRs)**.
* [Critical] System SHALL allow DO to create one or more Transport Request (TR) directly from a Product Requisition (PR).
* [Critical] System SHALL enforce mandatory fields including Source POI, Destination POI, Transfer quantity, Delivery Date, Expected Vehicle count, and vehicle type
* [Critical] System SHALL validate TR quantity does not exceed the approved PR quantity and allow partial quantity allocation
* [Critical] System SHALL display real-time capacity snapshots for source and destination POIs during TR creation
* [Critical] System SHALL route submitted TRs to the **Distribution Manager (DM)** for approval
* [Critical] System SHALL require mandatory remarks for TR override actions
* [High] System SHALL provide PR review filters for DO by POI, Product Category, and transfer Type
* [High] System SHALL allow DO to view PR line-item details while creating a TR
* [High] System SHALL support creation of multiple TRs from a single PR until the full quantity is allocated
* [High] System SHALL display warnings when destination capacity is limited or met threshold limit.

*Note: The Transport Request at DO-creation stage captures only Source POI, Transfer Quantity, Delivery Date, and Remarks. Vehicle count and vehicle type are not captured here — they are captured later by the Transport Planner at TR assessment (see* [*6.11.1*](#_Transport_Requisition_(TR))*).*

## Transport Requisition (TR) Approval Process by Distribution Manager (DM)

**Version 1.0, Phase 1**

**User Story:** As a Distribution Manager (DM), I want to review, approve and update Transport Request (TR) created by DO so that products are being transferred at their desired POIs based on coordinated approval workflow*.*

**Acceptance Criteria:**

* **Distribution Approval** Workflow:
  + Approval workflow conducted by
    - Distribution Manager (DM)
  + **Distribution Manager (DM):**
    - DM receives TR forwarded from DO and reviews it and if needed can modify
      * Transfer Quantity for each Source (Loading POI)
      * Delivery Date
      * and approve the TR. After approval, System sends the TR to Transport Department.
      * Remarks
    - PR Review queue supports filters:
      * POI
      * Product Category
    - Distribution Manager can take one of three actions on a pending TR:
      * **Approve**: TR status moves to Approved and auto-transitions to Available for Transport Planning.
      * **Approve with Modification**: DM can revise Transfer Quantity, Delivery Date, and Remarks before approving; mandatory remarks are required whenever a modification is made, and the revised values are what get saved and carried forward onto the approved TR.
      * **Reject**: requires a mandatory rejection reason; TR status moves to Rejected and is returned to the DO with remarks
* System displays capacity snapshot for requester (Destination) POIs to Distribution Manager (DO)
* Approved Transport Request (TR) routed to Transport Department

**Functional Requirements:**

* [Critical] System SHALL route Transport Requests (TRs) created by Distribution Officers (DO) to the Distribution Manager (DM) for approval
* [Critical] System SHALL allow distribution Manager (DM) to view detailed TR information including source POI, destination POI, Transfer quantities, delivery date, expected vehicle count and vehicle type
* [Critical] System SHALL allow DM to modify TR quantities for each source and destination POI before approval
* [Critical] System SHALL allow DM to modify expected number of vehicles and vehicle type during TR review
* [Critical] System SHALL allow DM to approve or reject a TR
* [Critical] System SHALL require mandatory remarks when a TR is modified before approval
* [Critical] System SHALL forward approved TRs to the Transport Management Section
* [Critical] System SHALL display real-time capacity snapshots for source and destination POIs to the Distribution Manager during TR review
* [Critical] System SHALL lock approved TRs from further modification by DO users after approval

## Source Stock Validation & Update

**Version 1.0, Phase 1**

**User Story:** As a requester (Depot / Feed Mill / Commercial), Distribution Officer, Distribution Manager, Procurement Officer, Command Center Officer, I want visibility into current, reserved, and in-transit stock at source POIs, and I want the system to automatically reserve and deduct that stock as TRs are approved and trucks depart, so that requisitions and approvals are grounded in real inventory rather than assumptions.

**Acceptance Criteria:**

* Source POI:
  + Current Capacity (MT)
  + Total Capacity (MT)
  + Free Space
* After Loading:
  + Current Capacity reduced
  + Free capacity recalculated
* Tenant Super Admin, Tenant Admin, Depot Officer, Feed mill Officer, Procurement and Distribution Officer, Distribution Manager users sees updated stock
* Source POI detail and the PR/TR creation and review surfaces display four live figures per POI:
  + Current Stock (MT),
  + Reserved Stock *(quantity committed against approved TRs/TOs not yet scaled out)*,
  + In-Transit Stock *(loaded on trucks en route, post scale-out/pre-QC-pass)*, and
  + Free Capacity *(Total Capacity − Current Stock − Reserved Stock)*. All four figures are read-only from these surfaces.
* When a Distribution Manager or Procurement Officer approves a TR, Reserved Stock at the source POI is incremented by the TR's allocated quantity; if the TR is later rejected, modified downward, or cancelled, the reservation is reversed.
* When a Transport Order transitions to in-transit (truck departs source gate), In-Transit Stock is incremented at both source (outgoing) and destination (incoming); reversed if the TO is cancelled post-dispatch.
* When Scale-out is confirmed (weighbridge exit), Current Stock and Reserved Stock at the source POI are both reduced by the confirmed loaded weight. If confirmed stock would go negative, the system logs a warning but does not block the scale-out operation.
* Before a Command Center Officer can assign a loading bay to a TO, the system validates that Current Stock plus In-Transit Stock at the source POI is sufficient to cover the TO's allocated quantity; insufficient stock returns a blocking error with available/required quantities shown. This is a warning gate on bay assignment only — it does not block gate-in or scale-in.
* Every stock mutation writes an append-only movement log entry (POI, event type, linked TO/TR, quantity, before/after values, actor, timestamp), viewable read-only by Tenant Admin.
* A stock snapshot API returns the full live figures for a POI, role-gated to Tenant Admin, Requester roles, Distribution Officer/Manager, Procurement Officer, and Command Center Officer.

**Functional Requirements:**

* [Critical] System SHALL maintain live Current Stock, Reserved Stock, and In-Transit Stock per POI, updated event-driven from TR approval, TO dispatch, and scale-out confirmation.
* [Critical] System SHALL reserve source stock on TR approval and release the reservation on TR rejection, downward modification, or cancellation.
* [Critical] System SHALL deduct source Current Stock and Reserved Stock atomically with scale-out confirmation.
* [High] System SHALL block Command Center bay assignment with a structured error when source stock is insufficient to cover the TO's allocated quantity.
* [High] System SHALL write an append-only audit log entry for every stock mutation.
* [Medium] System SHALL expose a role-gated stock snapshot API per POI.

## Destination Stock Validation & Update

**Version 1.0, Phase 1**

**User Story:** As a Distribution and Procurement, I want to see total capacity, current stock, free capacity, and projected utilization at destination POIs, with threshold warnings, so that I do not approve transfers that would overflow the destination.

**Acceptance Criteria:**

* System displays:
  + Total Capacity
  + Current stock
  + Free Capacity
* After Unloading:
  + Current Capacity Increased
  + Free capacity recalculated
* Tenant Super Admin, Tenant Admin, Depot Officer, Feed mill Officer, Procurement and Distribution Officer, Distribution Manager users sees updated stock
* Destination POI detail and the TR/TO approval surfaces display:
  + Total Capacity (from POI master data),
  + Current Stock,
  + Free Capacity *(Total Capacity − Current Stock − Reserved Stock)*,
  + In-Transit Incoming *(quantity on approved TOs en route, post scale-out/pre-QC-pass)*, and
  + Projected Utilization % *((Current Stock + In-Transit Incoming) / Total Capacity × 100)*. Figures are read-only from these surfaces.
* A threshold warning badge displays when **Projected Utilization** reaches the configured **capacity threshold** (**default 80%,** configurable per POI by Tenant Admin, with a tenant-level default fallback), escalating visually at 90%.
* When a Distribution Manager approves a TR, or a Procurement Officer submits a destination breakdown plan, the system validates **Free Capacity** at the destination against the requested quantity. If **Free Capacity** is insufficient, the system raises a blocking warning requiring the approver to confirm an override with mandatory remarks before the approval can proceed — it is not a hard block.
* On QC Pass at the destination (see 6.10 TO Lifecycle), destination **Current Stock** is incremented by the QC-confirmed received quantity and In-Transit Incoming is decremented by the same amount. On QC Fail, **Current Stock** is left unchanged and In-Transit Incoming is cleared for that TO.
* Every stock mutation at the destination writes the same append-only movement log described for source stock (6.8.4).

**Functional Requirements:**

* [Critical] System SHALL validate destination capacity before approval.
* [High] Stock updates SHALL update stock only after QC pass.
* [High] System SHALL reject addition upon QC failure.
* [High] System SHALL display capacity utilization and threshold warnings.

## Port Shipment Management

## Port Shipment (Import) Registration

**Version 1.0, Phase 1**

**User Story:** *As a Commercial Officer, I want to register a Port Shipment in DFMS with full import / shipment documentation and line-level RM cargo, So that Procurement can plan distribution across destination POIs and raise Transport Requests; after Transport Planning, Transport Orders are created for execution.*

**Acceptance Criteria:**

* **Registration (Commercial)** Workflow:
  + A Port Shipment is a structured record of an inbound import shipment — not a Product Requisition — created by the **Commercial Officer** via a dedicated top-level Port Shipments menu, separate from the Requisition (Finished Goods) menu. Commercial Officers do not have access to the Requisition → Finished Goods flow.
    - Record Type: Port Shipment / import (auto filled)
    - Entered by: (auto filled)
    - Department: (auto filled, read-only)
  + System auto-generates a Port Shipment reference in the format *PS-PORT-YYYYMMDD-XXXX.*
  + Shipment registration routed to Procurement
  + Procurement:
    - Views shipment & LC details
    - Defines Destination-wise quantity allocation by inputting the quantity to be distributed for each POI
    - Creates TR based on allocation
  + Transport department:
    - Transport Planner:
      * C&F clearance note/Approval (Yes / No)
      * Number of vehicle and
      * Vehicle type defined
* Mandatory shipment information captured:
  + Bill of Lading (BL) Number
  + LC Number
  + Vessel Name
  + Voyage Name
  + Container Number
  + C&F Agent Name
  + Point of Loading (POL)
  + Estimated Time of Arrival (ETA)
  + The shipment record supports multiple raw material cargo line items, each entered via product autocomplete that auto-fills Product Name, Category (Raw Material), Sub-Category, and Type of Packing from the Product Master; Unit of Measure, Quantity, and Weight per Unit are entered manually. Total Weight per line and a grand total across all lines are auto-calculated.
  + Attachment option (Attachment of **Arrival Notice**)
  + Remarks
* Lifecycle: **Draft → Submitted**. Submission requires all mandatory LC/shipment fields and the Arrival Notice to be complete. Once submitted, the record is locked for the Commercial Officer (except cancellation) and becomes visible to Procurement.
* Status badges:
  + Draft,
  + Submitted,
  + In Progress (at least one TR created against it),
  + Fulfilled,
  + Cancelled.
* Commercial Officer can cancel a Draft or Submitted shipment with a mandatory reason, only if no TR has yet been created against it.

**Functional Requirements:**

* [Critical] System SHALL enforces LC and shipment metadata entry.
* [Critical] Port shipment registration SHALL always route to Procurement.
* [Critical] Commercial Officers SHALL only create Port Shipment Registration
* [High] System SHALL allow procurement to define POI-wise allocation.
* [High] TR creation SHALL be restricted to Procurement for port shipment registration

## Procurement Approval Process (Port Shipment Registration Transfer)

**Version 1.0, Phase 1**

**User Story:** *As a Procurement Officer I want the top-level Port Shipments area to show all submitted shipments (tenant scope) with full LC and line detail So that I can plan distribution and create Transport Requests (PC-02) without a separate “queue” menu under Procurement*

**Acceptance Criteria:**

* Procurement Officer (PO) can view Port shipment registration submitted by Commercial Officer.
* System displays shipment reference details including:
  + Shipment RIG ID
  + Bill of Lading (BL) Number
  + LC Number
  + Vessel Name
  + Voyage Name
  + Container Number
  + C&F Agent Name
  + Point of Loading (POL)
  + Estimated Time of Arrival (ETA)
  + Tentative Quantity per RM Item code with quantity, weight, UOM, Type of Packing, Product Category, Sub-Category, **Total Calculated weight**, Inventory Capacity
  + Arrival Notice Attachment
  + Remarks from Commercial
* Procurement Officer (PO) can create **Destination Breakdown Plan** while creating Transport Requisition (TR) by -
  + Source POI (Port)
  + Selecting one or more destination POIs
  + Allocating quantity (in Tons / bags / pieces / Cartons) per destination
* Procurement Officer submits the TR.
* System auto-generates a TR number in the format TR-PORT-YYYYMMDD-XXXX.
* TR can be generated without complete allocation
* Upon submission, system sends the **Transport Requisition (TR)** linked to the original PR to Transport Department.
* Generated TR is routed to the Transport Department.
* Procurement Officer cannot submit destination plan without completing mandatory fields.

**Functional Requirements:**

* [Critical] System SHALL allow Procurement Officers to view approved Port Transfer requisitions.
* [Critical] System SHALL display shipment reference details including PR ID, LC number, BL number, commodity, and tentative quantity.
* [Critical] System SHALL allow Procurement Officers to create destination-wise quantity allocation plans in Tons per product item.
* [Critical] System SHALL allow mapping of Project From (Port) and multiple Project To (Destination POIs).
* [Critical] System SHALL generate a Transport Requisition (TR) only after destination breakdown plan submission.
* [Critical] System SHALL route the generated TR to the Transport management section.
* [High] System SHALL restrict destination plan creation access to authorized Procurement roles only.
* [High] System SHALL prevent TR generation if destination allocation is incomplete or invalid.
* [High] System SHALL link the generated TR with the originating PR ID for traceability.
* [Medium] System SHOULD maintain an audit trail for destination plan creation and updates.
* [Medium] System SHOULD allow Procurement Officers to edit the destination plan before final submission

## Transport Order (TO) Management

## Transport Requisition (TR) Assessment & Review by Transport Planner

**Version 1.0, Phase 1**

**User Story:** *As a transport Planner, I want to view all Transport Requests that are available for planning — both Finished Goods and Port Consignment — and submit my vehicle and fleet planning inputs against each one, so that Transport Orders can subsequently be created with the correct fleet allocation.*

**Acceptance Criteria:**

* Transport Planner sees TRs in two tabs:
  + **Finished Goods tab**: TRs with status Available for Transport Planning or Under Planning, showing TR ID, Parent PR reference, product/packing details, quantity, weight, urgency, required delivery date/time, Source POI, and Destination POI. Filterable by Date, Source/Destination POI, and Urgency; sorted by Delivery Date (ascending default) or Urgency.
  + **Port Consignment tab**: TRs of the same statuses, showing TR ID, Parent shipment reference, product/commodity details, BL/LC/Vessel/Voyage/Container/C&F Agent/POL/ETA and Arrival Notice attachment, tentative quantity per RM item, Source (Port) POI, Destination POI, requested delivery date, and the destination breakdown plan. Filterable by Date, POI, ETA, and Urgency; sorted by ETA (ascending default) or Urgency.
* List is filterable by:
  + Status
  + Date
  + Urgency
  + Transfer Type (Finished Goods Transfer / Port Consignment Transfer)
* Each TR displays:
  + Transfer Type
  + For **Finished Goods:**
    - TR Number
    - Product Request (PR)
      * Status
      * Urgency (Normal / High / Critical)
      * Source PR
      * Requested by
      * Source POI
      * Destination POI
      * Delivery Date
      * Remarks
      * Total Quantity
      * Created at (Date)
      * Updated at (Date)
      * Product Item Code
      * Product Category
      * Type of Packing
      * Product Quantity (Number of Bags/Pieces/Tons/Cartons)
      * Weight per unit
      * Total Calculated Weight
      * Unit of Measurement (UOM) - No. of Bags, Pieces, Carton, Tons
      * Weight/Tonnage
  + For Port Consignment Transfer, each TR displays:
    - TR ID
    - Product Request (PR)
      * Product Item Code
      * Product Category
      * BL Number
      * LC Number
      * Voyage Name
      * Vessel Number
      * Container Number
      * C&F Agent Name
      * Point of Loading (POL)
      * Estimated Time of Arrival
      * Arrival Notice Attachment
      * Commodity
      * Tentative Quantity against RM Item Code
      * Weight/Tonnage
      * Pickup & Drop locations
      * Requested delivery Date & Time
      * Destination Breakdown Plan
    - Input for Port Consignment TR
      * C&F Clearance Note / Approval (Yes / No)
      * **Quantity of vehicles required** for the transfer
      * **Vehicle Type**
* TRs are visible only after approval from distribution/Procurement
* On each TR, the Transport Planner submits mandatory planning inputs before TO creation is permitted:
  + Quantity of Vehicles Required and
  + Vehicle Type (both TR types);
  + additionally, for Port Consignment TRs,
    - C&F Clearance Note/Approval status (Yes/No).
* Once planning inputs are saved, the TR status transitions to Under Planning and is locked to that planner's queue.
* The TR detail/planning input screen displays
  + Own Fleet available count (vehicles matching required type and status) and
  + Vendor Fleet available count (active contractual vendors with matching fleet type) to guide the planner's fleet type decision; these counts inform the decision but do not block submission.
* All planning input submissions are audit logged with planner identity, timestamp, and fields entered.
* TR status (Draft, Pending Approval, Approved, Available for Planning, Assigned, Converted to TO, Closed)
* TRs cannot be planned unless mandatory transport inputs are completed
* TRs originate only from approved product requisitions
* TR visibility follows role-based access control

**Functional Requirements:**

* [Critical] System SHALL display all approved TRs to Transport Planner (TP) in the Transport dashboard.
* [Critical] System SHALL restrict visibility to approved TRs only.
* [Critical] System SHALL enforce role-based access control for TR visibility
* [Critical] System SHALL display TR status
* [Critical] System SHALL allow Transport Planner to view TR details separately for **Finished Goods Transfer** and **Port Consignment Transfer**
* [Critical] System SHALL display **Finished Goods TR details** and **Port Consignment TR Details** with TR ID and linked Product Requisition (PR) details for Finished Goods Transfers and Port Consignment Transfer respectively
* [High] System SHALL allow Transport Planner to input for FG Transfer **required number of vehicles,** **vehicle type for TR.**
* [High] System SHALL allow Transport Planner to input for Port Transfer **required number of vehicles,** **vehicle type for TR and C&F Clearance note / approval (Yes / No).**
* [High] System SHALL display Product details, commodity, tentative quantity, Pickup and drop locations, delivery date & time
* [Medium] System SHALL allow filtering TRs by date, route, transfer type
* [Medium] System SHALL prevent TO creation for TRs without mandatory Transport input

## Transport Order (TO) Creation by Transport Planner - Finished Goods

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want to create one or multiple Transport Orders (TOs) against a single TR so that transport can be executed efficiently with partial quantity allocation if required.*

**Acceptance Criteria:**

* Transport Planner (TP) can create one or multiple TOs against a TR
* TP can split TR quantity across multiple TOs
* Each TO is tagged as:
  + Own Fleet OR
  + Vendor Fleet
* All product-related attributes are inherited from TR and read-only
* TO Creation is allowed only from approved TRs
* For **Finished Goods:**
  + TP input Linked TR with creating TO
  + TP see the snapshot of TR
  + System pulls product related information like
    - Product Item Code
    - Product Name
    - Product Category and Sub-Category
    - Type of Packing
    - Quantity per item code
    - Weight per unit
    - Source POI
    - Destination POI
    - Requested Delivery Date
    - Number of vehicles required
    - Vehicle type
  + System allows TP to input
    - Fleet Type (Own / Vendor)
    - Allocated quantity per TO [Load split quantity per TO] (≤ remaining TR quantity)
    - Planned Delivery Date & Time
* Each TO is routed based on fleet type:
  + Own Fleet → TDO (Own Fleet)
  + Vendor Fleet → TDO (Vendor Fleet)
* Planned Milestones:
  + Source → Arrival (Date range selection required) & Departrture (Date range selection required)
  + Destination → Arrival (Date range selection required) & Departrture (Date range selection required)
* Notes
* TOs are forwarded automatically after fleet decisions
* Sum of TO quantities must not exceed TR quantity
* TO creation requires valid TR reference
* A TO cannot be handled by both fleet types simultaneously

## Transport Order (TO) Creation by Transport Planner - Port Shipments Transfer

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want to create one or multiple Transport Orders (TOs) against a single TR so that transport can be executed efficiently with partial quantity allocation if required.*

**Acceptance Criteria:**

* Transport Planner (TP) can create one or multiple TOs against a TR
* TP can split TR quantity across multiple TOs
* Each TO is tagged as:
  + Own Fleet OR
  + Vendor Fleet
* System displays **Own Fleet vs Vendor fleet availability count** to support planning decisions.
* All product-related attributes are inherited from TR and read-only
* TO Creation is allowed only from approved TRs
* For **Port Consignment Transfer:**
  + TP input Linked TR with creating TO
  + System pulls product related information like
    - Product Item Code (read-only from TR)
    - Product Category (read-only from TR)
    - BL Number (read-only from TR)
    - LC Number (read-only from TR)
    - Voyage Name (read-only from TR)
    - Vessel Number (read-only from TR)
    - Container Number (read-only from TR)
    - C&F Agent Name (read-only from TR)
    - Point of Loading (POL) (read-only from TR)
    - Estimated Time of Arrival (read-only from TR)
    - Arrival Notice Attachment (read-only from TR)
    - Commodity (read-only from TR)
    - Tentative Quantity against RM Item Code (read-only from TR)
    - Weight/Tonnage (read-only from TR)
    - Pickup & Drop locations (read-only from TR)
    - Requested delivery Date & Time (read-only from TR)
    - Destination Breakdown Plan (read-only from TR)
    - Required Number of Vehicles (read-only from TR)
    - Vehicle Type (read-only from TR)
  + System allows TP to input
    - Fleet Type (Own vs Vendor) based on fleet availability count
    - C&F Clearance Note
    - Number of vehicles required
    - Vehicle type
    - Allocated quantity per TO [Load split quantity per TO] (≤ remaining TR quantity)
    - Planned Delivery Date & Time
* Each TO is routed based on fleet type:
  + Own Fleet → TP (Own Fleet)
  + Vendor Fleet → TDO (Vendor Fleet)
* Planned Milestones:
  + Source → Arrival (Date range selection required) & Departure (Date range selection required)
  + Destination → Arrival (Date range selection required) & Departure (Date range selection required)
* TOs are forwarded automatically after fleet decisions
* Sum of TO quantities must not exceed TR quantity
* TO creation requires valid TR reference
* A TO cannot be handled by both fleet types simultaneously.

**Functional Requirements:**

* [Critical] System SHALL allow creation of multiple TOs against a single TR.
* [Critical] System SHALL support partial quantity allocation across TOs.
* [Critical] System SHALL enforce that total TO quantity does not exceed approved TR quantity
* [Critical] System SHALL enforce selection of exactly one fleet type per TO
* [Critical] System SHALL display Own Fleet vs Vendor Fleet availability counts to TP
* [Critical] System SHALL capture C&F clearance note status, Number of vehicles required, and Vehicle type from TP to Tr before TO creation
* [High] System SHALL inherit and lock product attributes from TR as read-only
* [High] System SHALL prevent TO execution before TDO assignment.
* [High] System SHALL auto-generate unique TO IDs

## TO Lifecyle Management

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner (TP), I want to track the full lifecycle of a trip so that I have end-to-end visibility.*

**Acceptance Criteria:**

* Lifecycle State Transitions:
  + TO can move through the following states with defined sub-states:
    - **Created** → TO created by TP but not yet finalized.
      * Sub-states:
        + **Planning Required** –

Own Fleet - TP needs to assign Vehicle, Driver, Planned Milestone

Vendor Fleet – TP needs to choose Planned Milestone

Contractual/Non-Contractual – If the **Planned Milestone** is set TO status will shift to Assigned

* + - * + **Bidding in Progress (Until bidding window is open)**

Non-Contractual – Bidding in Progress – Status will shown until any bid is own by any vendor

* + - * + **Bidding Window Closed**

When bidding window is closed

* + - **Assigned** → Vehicle, Driver, and Helper assigned
    - **Ready For Dispatch** → Driver Supervisor completed vehicle inspection or Skip vehicle inspection for both the TO state will be Ready for Dispatch
    - **Driving Towards Source** → Driver initiated trip and Vehicle is travelling toward Pickup/loading point/Source POI
    - **At Source** → Vehicle has arrived at source POI and gate-in is recorded
      * Sub-states:
        + **Waiting for Command Center** (Scale-in complete)
        + **Assigned Loading Point**
        + **Loading Started**
        + **Loading Completed**
        + **Scale-out**
    - **Driving Towards Destination** – when vehicle has departed from Source POI and gate-out is recorded
    - **At Destination** → Vehicle arrived at destination POI and gate-in is recorded
      * Sub-States (FG):
        + **Waiting for Command Center (Scale-in complete)**
        + **Assigned Unloading Point**
        + **Unloading Started**
        + **Unloading Completed**
        + **Scale-out**
      * Sub-States (RM):
        + **Flagged for QC (Scale-in Complete)**
        + **Sampling Started**
        + **Waiting for Command Center (When QC result is submitted)**
        + **Assigned Unloading Point**
        + **Unloading Started**
        + **Unloading Completed**
        + **Scale-out**
    - **Closed** → Gate out is when recorded
* TP, TDO-Vendor Fleet, Driver Supervisor, POI Admin, Tenant Super Admin, Tenant Admin, Driver, Vendor will be able to view current TO status and sub-states in the system.
* State Transitions can only occur according to allowed workflow rules (e.g., TO cannot be dispatched before assignment is confirmed)
* System logs all state transitions for audit purposes

**Functional Requirements:**

* [Critical] System SHALL support full lifecycle states and sub-states as defined.
* [High] System SHALL log all lifecycle transitions.
* [High] System SHALL allow TDO, TP and operation staff view states based on activity completion

## Vehicle Execution – Vehicle Planning for Own Fleet (TP)

**Version 1.0, Phase 1**

**User Story:** *As a transport planner, I want to view own-fleet vehicles with their status, review a vehicle's assigned and assignable TOs, and assign vehicle, driver, helper and planned milestones to a TO, so that trips can be executed using internal resources.*

**Acceptance Criteria:**

* Views list of
  + Own-fleet vehicles with Registration number,
  + Type
  + Capacity
  + Operational status
    - In Transit
    - Scheduled
    - No Active To
  + Planned TO(s) count
* Searches vehicles by registration number
* Selects a vehicle to view:
  + TOs currently assigned to it (status, route, load, driver, planned arrival)
  + Assignable TOs matching that vehicle type, with a capacity fit check (within/exceeds capacity)
* Selects "Review & assign" on a TO to open the assignment screen
* TP assigns:
  + Driver
  + Helper (optional)
  + Planned milestones
    - Trip Start (Time & Date Range selection)
    - Source:
      * Arrival (Time & Date Range selection)
      * Departure (Time & Date Range selection)
    - Destination:
      * Arrival (Time & Date Range selection)
      * Departure (Time & Date Range selection)
* Vehicle, driver, and all planned milestones are required before a TO becomes Assigned
* Vehicles under maintenance or active trip cannot be assigned new TOs
* One driver cannot be assigned to multiple active TOs
* Drivers who are On Leave cannot be assigned to any TOs
* Assigned TO is removed from the assignable list and reflected under "Assigned to this vehicle"

Functional Requirements:

* [Critical] System SHALL display own-fleet vehicle list with registration, type, capacity, operational status, and planned TO count
* [Critical] System SHALL display assigned and assignable TOs for a selected vehicle, filtered by matching vehicle type
* [Critical] System SHALL calculate and display capacity fit between TO load and vehicle capacity
* [Critical] System SHALL require driver and all planned milestones before a TO can be assigned
* [High] System SHALL restrict driver assignment to available drivers only (not On Leave, not on another active TO)
* [High] System SHALL restrict vehicle assignment to available vehicles only (not under maintenance or in-transit)
* [Medium] System SHALL allow optional helper assignment
* [Medium] System SHALL update TO status to Assigned and remove it from the assignable list upon confirmation

## TO Execution

## To Execution – Own Fleet

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want to assign available vehicles, drivers, and helpers to Own Fleet Transport Orders (TOs) and set an Estimated Time of Arrival (ETA) so that trips can be executed using internal resources and drivers can see their assignments.*

**Acceptance Criteria:**

* TP views a queue of all TOs with **fleet type = Own Fleet** and status, filterable by status, fleet type
* Queue displays TO Number, Parent TR, Source POI, Destination POI, Quantity, Total Weight (KG), Fleet Type, Planned Delivery Date, Status, Sub-state, Created by, Created At.
* TP selects a vehicle from the available own-fleet pool, filtered by Status = Available, matching Vehicle Type, and assigned POI near the source
* System prevents assigning vehicles that are Under Maintenance or already on an active trip; one vehicle per TO
* TP selects a driver from the available pool — only drivers who are Available, not On Trip, not On Leave, and hold a valid (non-expired) license are shown
* One driver cannot be assigned to multiple active TOs simultaneously (conflict check enforced)
* TP optionally assigns one or more helpers from the available pool (Status = Available, not on a conflicting active TO); helpers are linked to the driver and the TO
* TP enters the Estimated Time of Arrival (ETA) at destination (date + time); ETA is pre-suggested from the planned delivery date plus estimated route duration, and is visible to all stakeholders once set
* On vehicle + driver assignment, TO status transitions to Assigned; on ETA confirmation, TO status transitions to Ready for Dispatch
* All assignment actions are audit-logged
* Once assigned, the driver can view the TO (route, special instructions, contact information) in their own account; the driver's list shows only active and upcoming TOs

**Functional Requirements:**

* [Critical] System SHALL restrict vehicle assignment to available vehicles only (excluding Under Maintenance and On Active Trip).
* [Critical] System SHALL restrict driver assignment to available drivers only (excluding On Leave, On Trip, and expired-license drivers) and enforce a one-active-TO-per-driver conflict check.
* [Critical] System SHALL bind driver and helper(s) to the assigned vehicle and TO, with conflict checking on helper assignment.
* [Critical] System SHALL transition TO status Created → Assigned → Ready for Dispatch based on assignment and ETA confirmation, with all transitions audit-logged.

## TO Execution – Vendor Fleet by TDO – Vendor Fleet): Contractual Vendor Assignment

**Version 1.0, Phase 1**

**User Story:** *As a Transport Distribution Officer – Vendor Fleet (TDO), I want to assign a contractual vendor to a Transport Order (TO) so that the TO can be executed via a pre-agreed vendor partnership with rates applied automatically.*

**Acceptance Criteria:**

* TDO (Vendor Fleet) views a queue of all TOs with fleet type = Vendor Fleet and status Created
* TDO selects a contractual vendor from the active vendor list (vendor type = Contractual); the vendor picker shows Company Name, Fleet Info, and Contact
* Contractual rates are applied automatically from the backend — the TDO does not enter rates manually; rates are system-controlled and hidden from the vendor's own view
* Vendors do NOT submit price bids
* Contractual rates are applied automatically from backend
* Contractual rates are system-controlled
* TO status transitions to Assigned to Vendor, then to Ready for Dispatch once assignment is complete

**Functional Requirements:**

* [Critical] System SHALL allow assignment of TOs to contractual vendors from the active vendor list.
* [Critical] System SHALL auto-apply the pre-agreed contractual rate from the backend and hide rate information from the contractual vendor's view.
* [Critical] System SHALL transition TO status Created → Assigned to Vendor → Ready for Dispatch, with all actions audit-logged.

*Note: This section covers Contractual Vendor Assignment only. Non-Contractual Vendor bidding (*[*6.12.2*](#_TO_Execution_–)*), Vendor Execution & Confirmation (§6.10.5), and vendor-side TO visibility (§6.10.6) are documented separately and are unaffected by this update.*

## TO Execution – Vendor Fleet by TDO – Vendor Fleet): Non-Contractual Vendor (Bidding Workflow)

**Version 1.0, Phase 1**

**User Story:** *As a Transport Department Officer (Vendor Fleet), I want to publish bidding requirements for a Transport Order to non-contractual vendors, receive and compare their bids, and award to one or more winners, so that competitive rates and vehicle availability are obtained when no contractual vendor assignment applies.*

**Acceptance Criteria:**

* TDO (Vendor Fleet) publishes bidding requirements for a TO, specifying –
  + Required Number of Vehicles,
  + Required Vehicle Type,
  + Required Capacity, and
  + an optional (non-binding) Reference Rate, together with
  + a bidding window Open Date/Time (defaults to now if omitted) and
  + mandatory Close Date/Time. Deadlines must be at least 2 hours and at most 7 days from publish time.
* Publishing is only allowed when the TO's data is complete (route, pickup time, required vehicle type/capacity, quantity) and the TO does not already have an active bidding session. On publish, the TO transitions to Open for Bidding and eligible non-contractual vendors are notified (in-app; email where wired).
* Eligibility is scoped to vendors who have completed onboarding and are approved to join the tenant, are registered as non-contractual, meet any configured minimum rating, and are not blacklisted.
* After publish, only the bidding window (**Bid open** and/or **Bid close** date/time) can be edited via a dedicated timeline update — all other published parameters (**vehicle count**, **vehicle type**, **capacity**, **reference rate**, **eligibility filters**) are immutable and can only be changed by cancelling and republishing the session. Every window update is audit logged with before/after timestamps.
* Vendors submit a bid consisting of **Offered Rate** and **Offered Vehicle Count**; the bid timestamp is recorded immutably and bids cannot be edited after submission (corrections require withdraw-and-resubmit before the window closes, where policy allows).
* The system auto-closes the bidding session at the deadline and blocks late submissions.
* TDO reviews submitted bids side-by-side (rate, offered vehicle count, submission time, remarks), with the lowest bid highlighted and basic statistics (min/avg/max) shown, and can sort by cost, offered vehicle count, or submission time.
* TDO selects one or more winning vendors, allocating an awarded vehicle count per winner (not exceeding the vendor's offered count); on approval, winning bids move to Accepted and non-selected bids move to Rejected/Closed. The award decision, once approved, is final and is recorded in an immutable winning log (vendor, bid, awarded count, TDO user, timestamp).
* TDO can instead reject all bids for a TO with a mandatory reason, which closes the bidding session and notifies all bidders that the TO was not awarded.
* Publish, window changes, bid submission, award, and reject-all events are all audit logged, including the bid timestamp evidence chain.

**Functional Requirements:**

* [Critical] System SHALL support a full non-contractual bidding cycle: publish → vendor bid submission (rate + vehicle count, immutable, timestamped) → TDO review and award or reject-all.
* [Critical] System SHALL restrict TDO edits after publish to the bidding window timeline only; any other change requires cancel and republish.
* [Critical] System SHALL enforce the bidding deadline policy (minimum 2 hours, maximum 7 days from publish) and auto-close the session at the deadline, blocking late bids.
* [Critical] System SHALL allow TDO to award one or more winning vendors with per-vendor awarded vehicle counts and SHALL persist an auditable winning log.
* [High] System SHALL allow TDO to select winning vendor at per preference
* [High] System SHALL allow TDO to reject all bids with a mandatory reason, closing the session and notifying all bidders.

## Vendor Execution & Confirmation

**Version 1.0, Phase 1**

**User Story:** *As a vendor (contractual or non-contractual), I want to receive the Transport Order requirement details after assignment or award, confirm my vehicle and Driver information, so that I can execute and close out the trip correctly.*

**Acceptance Criteria:**

* Vendor receives TO notification of the TO/Bid requirement. [In-app Notifications will be handled in phase 3)
* Vendor (Contractual) or winning (Non-contractual) vendors assigns:
  + Driver Name (mandatory field)
  + Driver Phone (mandatory field)
  + Vehicle number (mandatory field)
  + Vehicle Type (mandatory field)
  + Vehicle Capacity [tons] (mandatory field)
  + Driver NID/License (optional field)
  + Helper Name (optional field)
  + Helper NID (optional field)
* Contractual rate information is never exposed on the vendor's assignment or execution screens — vendors do not see the resolved contractual rate through this surface.
* Vendor can view TO status updates (e.g., Assigned, Completed, Closed) via the vendor portal's TO list.
* Phase 2:
  + Vendor executes trip and after completion of a TO, Vendors will be able to submit -
    - POD (Proof of Delivery)
    - GRN Copy (Goods received Note)
    - Invoice (Allowed only after trip completion)

**Functional Requirements:**

* [Critical] System SHALL notify winning vendors.
* [High] Vendor SHALL allow vendor to submit POD, GRN and invoice

## Transport Order (TO) - Vendors (Contractual/Non-contractual) View

**Version 1.0, Phase 1**

**User Story**: *As a Vendor (Contractual & Non-Contractual), I want to view the list of Transport Orders (TOs) assigned to me and detailed information so that I can track and manage my assigned transport operations.*

Acceptance Criteria:

* Vendor can view complete details of an assigned TO.
* Vendor can view TO information including
  + TO number
  + Tenant
  + Assignment type (Contractual / Non Contractual)
  + TO status
    - Assigned
    - Ready for Dispatch
    - Under Planning
    - Cancelled
    - Driving Towards Source
    - At Source
    - Loaded / Pickup Completed
    - Driving Towards Destination
    - At Destination
    - Delivered / Unloaded
    - Completed
    - Bill Disbursed
    - Closed
    - In Progress
  + Vehicle & driver confirmation status. (Yes/No)
  + Route
    - Origin
    - Destination
  + Planned Schedule
    - Planned Start (Date & Time
    - Source Arrival
    - Source Departure
    - Destination Arrival
    - Destination Departure
  + Product
    - Product Name
    - Quantity
  + Vehicle Requirements
    - Required Vehicle Type
    - Required Capacity (tons)
  + Date
    - Assigned Date
    - Expected pickup

Functional Requirements:

* [Critical] System SHALL display complete details of the selected Transport Order.
* [Critical] System SHALL display route, schedule, and assignment information for the TO.
* **[High]** System SHALL allow the vendor to submit vehicle and driver information for eligible Transport Orders.
* **[High]** System SHALL display the latest TO status and schedule updates in real time.

## Fleet Availability Validation (Own Fleet)

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want the system to validate fleet availability so that only eligible vehicles are assigned* *I want the system to validate that a vehicle and driver are genuinely available before they are committed to a Transport Order's execution, so that double-assignment and other resourcing conflicts are prevented.*

**Acceptance Criteria:**

* Fleet availability validation runs at the point of the driver's first execution action on a TO (e.g., transition into in-transit status), confirming the assigned vehicle and driver are in a valid state to execute
* TP assignment screens surface vehicle, driver (autocomplete selection), and helper (multi-select autocomplete) fields, drawing on read-only master data for Vehicles, Drivers, and Helpers.
* TO fleet-type selection dynamically toggles the assignment form between Own Fleet and Vendor Fleet sections, so the correct resourcing fields are shown per TO.
* System checks real-time vehicle status:
  + **No Active TO** – when this vehicle is not assigned to any TO
  + **Scheduled** – when a vehicle is assigned to a TO but TO not started yet
  + **In – Transit** – Vehicle is moving towards Source or Destination
  + **Under Maintenance** – Vehicle is taken for maintenance.
  + **Inactive** – Vehicle is set to not serving mode
* Only available vehicles appear for assignment

**Functional Requirements:**

* [Critical] System SHALL validate fleet availability before vehicle assignment.

## Transport Dashboard – Map-Based Dashboard

The Transport Dashboard is delivered in two layers: a real-time GPS and geofencing map ("Live GPS"), available today, and a broader operational dashboard layer (KPI summary, POI presence panel, TO-centric route highlighting, and default-landing behavior for Transport Planner and TDO roles.

## Live GPS

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, Transport Distribution Officer, or Tenant Admin, I want to see the real-time GPS location of vehicles on a map so that I can monitor trip progress, respond to delays, and ensure route compliance without phone calls.*

**Acceptance Criteria:**

* System displays an interactive map view as default dashboard for transport planners and transport distribution officer (Fleet)
* Map shows:
  + All active vehicles (Own fleet)
  + Linked TOs with states
  + All POIs with geofence boundaries
* Vehicle markers update location in near real-time (based on GPS refresh rate)
* Each vehicle marker visually indicates:
  + Own Fleet
  + Vehicle State
  + TO State
  + Source POI
  + Destination POI
  + TO reference
* Clicking a vehicle opens a context panel with operational details
* All registered POIs appear on the map with
  + Name
  + Type
  + Geofence Radius overlay
* Vehicle entering or exiting a POI geofence is visually identifiable
* POI markers indicate:
  + Current vehicle count inside geofence
  + Loading / Unloading activity
* Map supports TO-centric view:
  + Source – Destination route visualization
  + Current vehicle position in route
* Each TO shows:
  + TO ID
  + Transfer Type
  + Planned vs Actual ETA
  + Assigned vehicle and driver
* Dashboard visually flags:
  + Halted TOs
  + Vehicle Idle beyond threshold
  + Geofence dwell time violations
* Clicking a vehicle or TO opens a side panel showing:
  + Vehicle Details
  + Driver & Helper
  + TO Status
  + Last known GPS update
* Dashboard displays KPI widgets:
  + Active TOs
  + Vehicle in Transit
  + Idle Vehicles
  + Halted TOs
* TP, TDP and Tenant Admin with permission open the Live GPS page
* GPS-linked vehicles appear as near real-time map markers, with TO/trip context shown when available; GPS-linked fleet vehicles are visible even when not on an active trip
* All active, geocoded POIs render on the map with geofence circles sized from the POI master record
* Each vehicle marker shows speed, movement, and connection status, including a distinct Signal-Lost state
* After an idle threshold (~10 minutes) with no update, a signal-lost vehicle displays its last known position with an explicit "last known" indicator — the system does not fabricate a new position
* Live vehicles can display a recent trail/path on the map, and operators can "follow" a selected vehicle
* Map refresh interval is configurable platform-wide
* Operators can browse vehicle history in a TO-centric way (trips/TOs within a time window) and browse idle history for periods when the vehicle was not on a trip
* GPS positions are read-only for all users; there is no manual edit or delete of GPS position data

**Functional Requirements:**

* [Critical] System SHALL display an interactive live gps map as the default landing view for users with roles
  + Transport Planner
  + Tenant Admin
  + Tenant Super Admin
  + Transport Distribution Officer (TDO – Vendor Fleet)
* [Critical] System SHALL display GPS-linked vehicles as near real-time markers with TO/trip context when available.
* [Critical] System SHALL display **all active own fleet vehicles** on the map
* [Critical] System SHALL render active POIs with geofence circles using the POI master radius.
* [Critical] System SHALL show vehicle speed, movement, and connection status, including a Signal-Lost state with last-known-position fallback after the configured idle threshold.
* [Critical] System SHALL support a trail/path view and a "follow vehicle" mode.
* [Critical] Each vehicle marker SHALL visually represents
  + Fleet Type (Own Fleet)
  + Vehicle State
  + Linked TO State
  + Source POI
  + Destination POI
  + Transport Order reference number
* [Critical] System SHALL provide a configurable platform-wide map refresh interval.
* [Critical] System SHALL provide TO-centric and idle (non-trip) vehicle history browsing.

## Dashboard Layer – KPIs, POI Presence, TO Route View, Default Landing

**Version 1.0, Phase 2 or 3**

**User Story:** *As a Transport Planner or Transport Distribution Officer, I want a real-time map-based operational view of vehicles, TOs, and POIs as my default landing page, so that I can monitor execution status — KPIs, POI presence, and TO-centric context — from one place without switching screens.*

**Acceptance Criteria:**

* Dashboard displays a KPI widget bar (e.g., Active TOs, Vehicles in Transit, Idle Vehicles, Halted TOs, Signal-Lost Count)
* Dashboard displays a POI presence panel listing vehicles currently inside each POI's geofence, with entry time and duration-so-far
* Dashboard supports a TO-centric route view:
  + source-to-destination route visualization with current vehicle position,
  + TO reference,
  + transfer type, and
  + planned vs. actual ETA
* Dashboard visually flags halted TOs, vehicles idle beyond threshold, and geofence dwell-time violations at the dashboard level.
* Clicking a vehicle or TO opens a side panel with
  + vehicle details,
  + assigned driver/helper,
  + current TO status, and
  + last known GPS update.

**Functional Requirements:**

* [High] System SHALL display a KPI widget bar summarizing active TOs, vehicles in transit, idle vehicles, halted TOs, and signal-lost vehicles.
* [High] System SHALL support a TO-centric route view with planned-vs-actual ETA and current vehicle position along the route.
* [High] System SHALL visually flag halted TOs, idle-beyond-threshold vehicles, and dwell-time violations at the dashboard level.
* [Medium] System SHALL provide a POI presence panel showing vehicles currently inside each POI's geofence, with entry time and duration-so-far.
* [Medium] System SHALL expose this dashboard layer via a dedicated, read-only API family; all system-calculated fields (positions, presence, KPIs) SHALL have no user write path.

*Note: The underlying data this dashboard layer needs — GPS positions, POI geofence radii, arrival/departure events, and dwell timing — is already produced by the delivered Live GPS, POI Geofencing Boundary Management, Vehicle Arrival Tracking, and Dwell Time Tracking features (*[*6.5.3*](#_POI_Geofencing_Boundary)*–*[*6.5.5*](#_Dwell_Time_Tracking)*). The remaining work is the aggregation layer: the KPI bar, the POI presence panel, the TO-centric route view, and setting this as the default landing page for Transport Planner and TDO roles.*

## TO Dispatch Planning (Calendar View)

**Version 1.0, Phase 2**

**User Story:** *As a Transport Planner, I want a visual dispatch view so that I can plan trips by date, fleet type and urgency.*

**Secondary User Story:** *As a Transport Planner, I want to see which vehicle and driver is assigned to each TO on a given date.*

*As a Transport Planner, I want to view TOs grouped under their parent TR for better operation Context*

*As a Transport Planner, I want to see vehicle-wise assignment timelines to avoid overbooking*

**Acceptance Criteria:**

* System shows all **created and planning-eligible TOs** in calendar view
* Calendar supports daily, weekly, and monthly views
* Calendar support date navigation (Previous / next, date picker)
* Calendar loads **only approved TOs** (post-TR approval)
* Each TO is displayed as a calendar block showing:
  + TO ID
  + T R Reference
  + Transfer Type (FG / Port)
  + Fleet Type (Own Fleet / Vendor Fleet)
  + Vehicle Number
  + Driver Name
  + Source POI
  + Destination POI
  + Urgency
  + Planned Date
* TO blocks are read-only in calendar view (No status or quantity change)
* Planner can filter by date, vehicle category, urgency.
* Calendar visually groups or tags TOs that belong to the same TR
* Once assignment is completed, calendar shows:
  + Assigned vehicle
  + Assigned Driver
  + Assigned Helper
* Unassigned TOs are clearly flagged as ‘Unassigned’
* System provides a vehicle-wise calendar view
  + Each vehicle appears as a calendar row
  + Assigned TOs appear in the vehicle’s timeline
* Vehicle calendar highlights:
  + Idle gaps between TOs
* Calendar visually differentiates:
  + Own fleet TOs
  + Vendor Fleet TOs
  + Fleet type is shown via color, label, or icon

**Functional Requirements:**

* [Critical] System SHALL provide calendar-based view of all TO.
* [High] System SHALL segregate TOs visually based on Fleet type (Own Fleet / Vendor Fleet)

## TR Conjoinment

**Version 1.0, Phase 2**

**User Story:** *As a Transport Planner and Transport Distribution Officer, I want to assign a single vehicle to multiple Transport Orders when route and capacity permit, so that partial deliveries can be optimized without merging or altering individual TOs*

**Secondary User Story:** *As a TDO, I want the system to track each TO independently even when they share the same vehicle.*

*As a Transport Planner, I want to view the execution sequence of TOs assigned to a single vehicle*

*As a Operation/Accounts, I want to each TO to retain its own delivery status, POD, QC and costing.*

**Acceptance Criteria:**

* System allows multiple TOs to be assigned to one vehicle under the same TR only if
* Assigned TOs are executed as:
  + Multi stop delivery within a single trip
  + Sequential trips along the same route
* Only one TO per vehicle can be ‘In Transit’ status at any time
* Vehicle must complete or close
  + TO-1 before TO2 execution starts
* System shows ordered sequence of TOs per vehicle
* Each TO:
  + Retains its own status lifecycle
  + Has independent delivery confirmation (POD)
  + Has individual QC outcome
* Vehicle starts with TO1 – Location 1
* After TO1 completion:
  + TO1 marked Delivered / Closed
  + Vehicle automatically transitions to TO2
* System tracks TO2 independently while using the same vehicle

**Functional Requirements:**

* [Medium] System SHALL allow assignment of multiple TOs (from same or multiple TRs) to a single vehicle.
* [Medium] System SHALL enforce only one TO per vehicle in “In Transit” status.

## Partial & Re-Delivery Management (Accident / Incident Handling)

**Version 1.0, Phase 2**

**User Story:** *As a Transport Planner, I want to halt an ongoing Transport Order (TO) in case of accidents or similar incidents and create a new TO for the pending quantity using a new vehicle, so that partial deliveries are handled systematically, remaining goods are delivered correctly, and all operational exceptions are auditable.*

**Acceptance Criteria:**

* Incident Handling & TO Halt:
  + TP can halt an active TO at any in-progress state:
    - In Transit – Source
    - At Source
    - In Transit – Destination
  + TP must provide a mandatory reason and remarks (E.g., Explaining the incident like accident, breakdown, security issue)
  + Halted TO is marked with a distinct status
    - Halted – Incident
  + System records halt timestamp, user, and reason for audit
* Quantity Reconciliation for Incident-Based Re-Delivery
  + System allows TP to create a new TO (Re-Delivery TO) linked to the halted TO against the original TR
  + TP must enter:
    - Original Expected Quantity while creating the new TO
  + Expected quantity is visible throughout the TO lifecycle
  + At destination POI
    - System records unloaded weight from the **scale-in** and **scale-out** weights of vehicle at destination POI to identity delivered goods quantity
    - System calculates actual delivered quantity based on scale-in and scale-out weight with expected quantity to be delivered
  + System automatically:
    - Compares Expected Quantity against Actual Delivered Quantity
    - Calculates quantity variance
* Audit trial mandatory

**Functional Requirements:**

* [Critical] System SHALL allow Transport Planner to halt an active TO at any in-progress stage.
* [Critical] System SHALL require selection of incident type before halting a TO
* [Critical] System SHALL require mandatory remarks during halt action
* [Critical] Halted TO SHALL transition to status ‘Halted – Incident’
* [Critical] System SHALL allow creation of a new TO linked to the halted TO
* [Critical] TP SHALL input expected quantity for re-delivery TO
* [Critical] System SHALL calculate delivered quantity using:
  + Destination POI Scale-in Weight
  + Destination POI Scale-out weight
* [Critical] System SHALL display
  + Expected Quantity
  + Actual delivered quantity
  + Quantity variance
* [Critical] Successfully delivered SHALL update destination inventory only after QC Pass
* [Medium] Cost calculation SHALL support Original TO Cost, Re-delivery TO Cost
* [High] Halt action SHALL record:
  + TO ID
  + User ID
  + Timestamp
  + Fleet Type
  + Remarks
* [High] System SHALL generate new TO for pending quantity

## Trip Closure & Proof of Delivery (POD)

**Version 1.0, Phase 1**

**User Story:** *As a Transport Planner, I want a Transport Order to close only once proof of delivery and all lane-appropriate operational checkpoints are satisfied, so that closure reflects operational reality and cannot be short-circuited.*

**Acceptance Criteria:**

* A per-TO closure checklist tracks the prerequisite flags relevant to closure: POD uploaded, scale-out done, gate-out done, loading complete, unloading complete, and (for RM inbound) QC passed.
* Closure rules are lane-aware:
  + FG outbound: loading complete + scale-out + gate-out + POD.
  + FG inbound: unloading complete + scale-out + gate-out + POD.
  + RM inbound: unloading complete + sampling done + QC pass + scale-out + gate-out + POD.
* A TO cannot move to Closed without a driver-captured POD artifact linked to it. If a QC outcome exists for the TO, a QC Fail blocks closure outright; only a QC Pass permits closure to proceed (for RM inbound TOs, the sampling checkpoint must also be captured before the QC decision is considered valid for closure purposes).
* A gate-out timestamp is required as part of the closure path for all lanes.
* Transport Planner can view the closure checklist status per TO and a filtered exceptions list of TOs currently blocked from closing, with the blocking reason shown.
* Every closure attempt — whether it succeeds or is blocked — is audit logged with actor, timestamp, lane, and (if blocked) the specific blocking reasons.
* Unloading Personnel confirms delivery at destination POI by inputting
  + Number of bags unloaded
  + Weight (System Calculated)
  + Unload End date & Time (Timestamp)
* Driver confirms delivery in app with POD attachment
* Gate-out time recorded
* Trip auto-closes after:
  + Unloading
  + POD received
  + Scale-out logged
  + Gate-out logged
* Trip cannot close without gate-out logged
* QC fail blocks closure

**Functional Requirements:**

* [Critical] System SHALL auto-close trip upon QC pass and POD confirmation.
* [High] System SHALL capture gate-out timestamp

## Trip Costing

**Version 1.0, Phase 2**

**User Story:** *As an Accounts or Financial Officer and Transport Planner, I want to record and review trip-level costs for each completed TOs so that I can analyze delivery expenses, compare own vs vendor costs, and prepare accurate invoices.*

**Acceptance Criteria:**

* Each completed trip has a **Trip Cost Sheet**
* System supports TO-level cost capture linked to:
  + Transport Order (TO) ID
  + Vehicle Type (Own / Vendor)
  + Vehicle Number
  + Driver
* Cost types supported included:
  + Distance-based cost
  + Vendor Trip Charge (If Vendor Fleet Used)
  + Maintenance Allocation (Manual – applicable for Own Fleet)
  + Fuel Cost (Manual – applicable for Own Fleet)
  + Toll / Ferry / Parking (Manual – applicable for Own Fleet)
  + Other Operational Changes
* System distinguishes:
  + Own Fleet Cost
  + Vendor Fleet Cost
* Manual cost entry is allowed only for authorized roles
* Cost history is audit-logged
* Trip cost summary is available after TO closure

**Functional Requirements:**

* [Critical] System SHALL generates a Trip Cost record once a Trip is created
* [Critical] System SHALL allow manual entry of:
  + Fuel cost
  + Vendor Trip Charge (If Vendor Fleet used)
  + Maintenance Allocation (Manual – applicable for Own Fleet)
  + Toll / Ferry / Parking (Manual – applicable for Own Fleet)
  + Other Operational Changes
* [Critical] System SHALL calculate:
  + Total Trip Cost
  + Cost per KM
* [High] System SHALL differentiates Own Fleet vs Vendor Fleet costing

## Vendor Management

## Vendor Onboarding & Registration

**Version 1.0, Phase 1**

**User Story:** *As a transport vendor, I want to register my company on Vendor App and request to join a tenant so that I can participate in transport bidding and execute trips for the organization/tenant.*

**Acceptance Criteria:**

* Vendor self-registers on the Vendor Mobile app by providing a vendor registration form capturing:
  + Company Name
  + Email
  + Phone
  + Password
* Vendor must upload mandatory compliance document:
  + Trade License
  + BIN
  + TIN
  + Contact Information
  + Testimonial / reference from Truck Association
* Vendors can view all available tenants after account registration.
* Vendor can search tenants by tenant name.
* Vendor can send a join request to a tenant that they are not already associated with.
* The system displays the current join request status
  + Join
  + Requested
  + Approved (Contractual Vendor/ Non-Contractual Vendor)
* Vendor Contract Type Selection (tenant super admin. Tenant admin can choose these types)
  + Contractual Vendor (Fixed Rate)
    - Contractual vendors can be directly assigned to TOs by TDO (Transport Distribution Officer) instead of bidding
  + Non-Contractual Vendor (Bidding)
    - Non-Contractual vendors are sent bidding notification with vehicle requirement with route information with optional expected bid price. In return, vendors can submit bid with price and number of vehicles available for the TO execution. After approval or winning, vendors will need to add vehicle and driver information with the TO.
* Vendor profile is saved in **Pending Verification** status. Submitted vendor profile remains inactive until admin approval
* Vendors cannot access bidding or TO details before approval
* Vendor registration data is tenant-specific and isolated

**Functional Requirements:**

* [Critical] System SHALL provide a vendor self-registration interface (web/mobile).
* [Critical] System SHALL require document uploads (trade license, BIN, TIN) before submission.
* [High] Vendor registration form SHALL capture company, vehicle, driver, and compliance data.
* [High] System SHALL allow vendors to manage multiple vehicles under one profile.
* [Critical] System SHALL require vendors to verify their email address during registration.
* [Critical] System SHALL require vendors to verify their phone number using OTP during registration.
* [Critical] System SHALL keep the vendor profile in Pending Verification status until authorized admin approval.
* [High] System SHALL allow vendors to resend email/phone verification if verification is unsuccessful or expired.
* [Critical] System SHALL display the list of all available tenants to registered vendors.
* [Critical] System SHALL allow vendors to submit a join request for a tenant.
* [High] System SHALL display the current join request status for each tenant.
* [High] System SHALL allow rejected vendors to resubmit corrected information.
* [High] All vendor registration attempts SHALL be logged for audit.

## Vendor Tenant-Join Approval Workflow

**Version 1.0, Phase 1**

**User Story:** *As an Tenant Admin & Tenant Super Admin, I want to review and approve or reject vendor requests to join my tenant, and assign the vendor's tenant-scoped type on approval, so that only vetted vendors can see and act on my tenant's bids and transport orders.*

**Acceptance Criteria:**

* Admin views vendor profiles in a verification queue
* Admin can Approve or Reject vendor registration
* Rejected profiles require remarks and allow resubmission
* On approval, the Tenant Admin must select the vendor's tenant-scoped type:
  + Contractual (Fixed Rate) — vendor may receive direct Transport Order assignment from the TDO for this tenant, with no bidding requirement.
  + Non-Contractual — vendor may receive bid notifications and submit bids for this tenant, subject to publish rules.
* Approved vendors become active and eligible for bidding as per TO assignment to the bids
* Approval is mandatory before vendor participation
* On rejection, the Tenant Admin must provide a reason/remarks; the rejection and remarks are recorded against the join request.
* The vendor cannot self-edit their tenant-scoped vendor type — it is Tenant Admin–controlled only.
* The vendor can only see bids, trips, and Transport Orders for tenants where their join status is Approved. A Pending or Rejected join status blocks all tenant-specific visibility.
* Join request submission, approval, and rejection events are logged for audit; the approval audit entry includes the selected vendor type.
* Rejected vendors must resubmit updated information

**Functional Requirements:**

* [Critical] System SHALL provide an Admin verification queue for vendor profiles.
* [Critical] System SHALL enforce mandatory rejection remarks.
* [High] Vendor approval status SHALL be updated in real-time.

## Vendors Profile

**Version 1.0, Phase 1**

**User Story:** *As TP, TDO,* I want to view the vendor list view in read-only mode, so that I can review vendor information without being able to create, edit, or delete vendor records.

Acceptance Criteria

* TDO and TP can access the Vendor List view page.
* Users can view vendor details and status.
* Users can search the vendor list.
* Users cannot create, edit, approve, reject, suspend, or delete vendor records.
* All vendor management actions are hidden or disabled for TDO and TP users.

Functional Requirements:

* **[Critical]** System SHALL provide read-only access to the Vendor List for TDO and TP roles.
* **[Critical]** System SHALL prevent TDO and TP users from performing any vendor management actions.
* **[High]** System SHALL allow users to search, filter, and sort the vendor list.
* **[High]** System SHALL display the latest vendor information and status in real time.

## Vendor Bidding Portal (TDO Publish to Bidding)

**Version 1.0, Phase 1**

**User Story:** *As a vendor, I want to view available transport bids and submit competitive rates so that I can win trips* *As a Transport Distribution Officer (TDO), I want to publish a Transport Order to a bidding portal with a defined bidding window and eligibility rules so that eligible non-contractual vendors can submit competitive bids within that window.*

**Acceptance Criteria:**

* TDO can publish a Transport Order into an open-for-bidding state only when the TO's status is compatible (e.g., Planned) and its data is complete (route, pickup time, required vehicle type/capacity, quantity/tonnage); publishing is blocked if the TO already has an active bidding session.
* At publish time, the TDO must provide a mandatory
  + bid-close date/time (bid-open date/time defaults to now if omitted),
  + the required number of vehicles,
  + required vehicle type, and
  + required capacity/tonnage.
  + Reference/guide rate, estimated cost, and minimum vendor rating threshold are optional inputs.
* The bidding deadline must be at least **2 hours** and **no more than 7 days** from publish time (enforced server-side). The system auto-closes bidding at the deadline and blocks late submissions.
* Only vendors who have completed platform onboarding, are approved to join the TO's tenant, and hold Non-Contractual tenant-scoped vendor type are eligible to bid.
* After publishing, only the **bidding window timeline (open/close date-time)** can be edited by the TDO; all other published parameters (vehicle count, type, capacity, reference rate, minimum rating) are immutable — any other change requires cancelling and republishing the session.
* TDO can view active bidding sessions and bid counts, and can cancel an active bidding session with a required reason.
* All publish, window-update, and cancel actions are logged for audit, including before/after values for window-timeline changes.
* Transport distribution officer (TDO) publishes bids with:
  + Information like Route, Tonnage (weight expected to carry), urgency, required vehicle type, Bid submission window, required quantity of vehicles
* Vendor can view TOs
  + Pending (When the vehicle and driver required for submission)
  + In Progress (When the TO lifecycle has been started)
  + Completed (When the TO lifecylce has been ended)
* Vendor can view in Bids page:
  + Open (When TDO publish the bid for opening)
  + Submitted (When vendor submits the bids)
  + Won (When TDO assign TO to the vendor)
* Vendor submit structured bids with rate and vehicle availability
* System records bid timestamp and rate validity

**Functional Requirements:**

* [Critical] System SHALL provide support configurable bid submission windows.
* [Critical] System SHALL allow eligible vendors to view the bidding list when bids are published.
* [High] System SHALL prevent bid submission after window closure.
* [High] Bids MAY be manually closed or cancelled without awarding.

## Bid Evaluation

**Version 1.0, Phase 1**

**User Story:** *As a Transport Distribution Officer, I want to evaluate vendor bids from non-contractual vendors and approve selected vendors.*

**Acceptance Criteria:**

* TDO can compare bids side-by-side including key parameter such as rate, vehicle availability, vehicle type, bid validity

**Functional Requirements:**

* [Critical] System SHALL provide support winner against a single TO.
* [High] System SHALL track bid winning log with user and timestamp.

## Bid Position & Probability Indicator

**Version 1.0, Phase 3**

**User Story:** *As a Vendor, I want to understand my bid position so that I can access competitiveness.*

**Acceptance Criteria:**

* After bid submission, vendor will be able to view color-coded indicator:
  + Green – Highly Competitive
  + Yellow – Moderate
  + Red – Low Probability
* Indicator reflects relative position, not exact competitor rates
* Exact competitor pricing must not be disclosed.

**Functional Requirements:**

* [Critical] System SHALL bid position based on internal scoring logic.
* [Critical] System SHALL display bid probability using color indicators only.

## Vehicle & Driver Information Submission

**Version 1.0, Phase 1**

**User Story:** *As a Vendor, I want to submit vehicle and driver details so that trips can be executed.*

**Acceptance Criteria:**

* Vendor submits after bid winning:
  + Driver name
  + Driver phone
  + Vehicle number
  + Vehicle type
  + Vehicle capacity
  + Driver NID/License
  + Helper name
  + Helper NID
* Vendor can update vehicle and driver details with audit trail.
* Vendor will be able to edit Vehicle and Driver information in case of any accidents or uncertain conditions against the same TO.
* Vendor substitution requires Transport Department visibility.

**Functional Requirements:**

* [Critical] System SHALL require vehicle & driver submission after bid winning and before starting trip.
* [Critical] System SHALL allow update with reasoning of driver and vehicle information with audit trails.

## Real-time TO Updates (Vendor Portal)

**Version 1.0, Phase 1**

**User Story:** *As a Vendor, I want real-time updates on my transport orders details page so that I can manage execution effectively.*

**Acceptance Criteria:**

* Vendor portal shows TO status changes:
  + Assigned
  + Ready for Dispatch
  + Under Planning
  + Cancelled
  + Driving Towards Source
  + At Source
  + Loaded / Pickup Completed
  + Driving Towards Destination
  + At Destination
  + Delivered / Unloaded
  + Completed
  + Bill Disbursed
  + Closed
  + In Progress

**Functional Requirements:**

* [Critical] System SHALL provide real-time TO updates to vendor portal.
* [Critical] Vendor SHALL not modify TO status directly.

## Vendor Billing & Claims Management

**Version 1.0, Phase 2**

**User Story:** *As a Vendor, I want to submit invoices and claims so that I can receive payments efficiently.*

**Acceptance Criteria:**

* Vendor can submit bill claims for completed TOs into one invoice
* Vendor uploads against each TO:
  + Invoice
  + Proof of Delivery (POD)
  + Goods receive Note (GRN)
  + Additional Expense claims supported
* Only completed trips are billable
* Missing POD/GRN blocks invoice submission.

**Functional Requirements:**

* [Critical] System SHALL allow consolidated invoice submission.
* [Critical] System SHALL link invoices to corresponding TOs

## Vendor Trip Cost & Billing & Claims Management

**Version 1.0, Phase 2**

**User Story:** *As an Accounts Officer, I want vendor trip to be finalized per trip so that invoices can be generated accurately without disputes.*

**Acceptance Criteria:**

* Vendor cost is linked to:
  + TO ID
  + Trip ID
  + Vendor ID
* Vendor cost may originate from:
  + Contractual rate (pre-configured, hidden from vendor)
  + Approved Bid Rate (non-contractual)
* Vendor Cost is locked after Bid approval
* System supports:
  + One invoice per TO
* Supports documents (POD, GRN) are mandatory before invoicing submission

**Functional Requirements:**

* [Critical] System SHALL allow consolidated invoice submission.
* [Critical] System SHALL link invoices to corresponding TO

## Vendor Rating System

**Version 1.0, Phase 2**

**User Story:** *As a Tenant Admin, I want to rate vendors so that future allocation decision improves.*

**Acceptance Criteria:**

* Vendor ratings calculated based on performance metrics (TBD).
* Ratings visible internally for decision-making.

**Functional Requirements:**

* [Low] System SHALL allow configurable vendor rating framework.

## Gate Management

## Gate-In Entry against System Generated TO

**Version 1.0, Phase 1**

**User Story:** *As a Gate man, I want to register vehicle gate-in details so that all incoming vehicles are formally logged and validated before operational processing.*

**Acceptance Criteria:**

* When the gateman selects a system-generated Transport Order (TO) from the Vehicle Entry (Gate-in) menu, the system shall automatically retrieve and display the following information:
  + TO number
  + Gate POI
  + System auto-fetch:
    - Vehicle Registration Number
    - Product Line Items Information associated with TO
    - Total Weight (KG)
    - Driver Information (Driver Name, Driver Contact Number)
    - Project From Information
  + Gate-in Details:
    - Document Category (Internal Transfer (TO/Challan) This will be automatically selected and shown
    - Input Gate-in Date and Time\*
    - Party Name (Supplier/Dealer/Distributor)
    - Remarks (If any)
* Gate-in cannot be saved without vehicle number
* All entries are timestamp and auditable

**Functional Requirements:**

* [Critical] System **SHALL** allow the Gateman to select a **system-generated Transport Order (TO)** from the **Vehicle Entry (Gate-in)** menu.
* [Critical] System **SHALL** automatically retrieve and display the following information upon TO selection:
  + TO Number
  + Gate POI
  + Vehicle Registration Number
  + Product Line Items
  + Total Weight (KG)
  + Driver Information (Driver Name and Contact Number)
  + Project From Information
* [High] System SHALL automatically set the Document Category as Internal Transfer (TO/Challan) for system-generated TOs, and the field SHALL be read-only.
* [High] System **SHALL** record all Gate-in transactions with system-generated timestamps.
* [High] System **SHALL** maintain an audit trail for all Gate-in transactions, including the user, timestamp, and changes made to the record.

## On Demand Third Party Supplier and Dealer Management At Gate-In

**Version 1.0, Phase 1**

**User Story:** *As a Gateman, I want to create a Transport Order on the spot when a vehicle arrives with only a Delivery Order (dealer pickup) or Purchase Order (supplier delivery) and no pre-created TO, so that scaling, loading/unloading, and QC workflows can proceed without waiting for a planner-created TO.*

**Acceptance Criteria:**

* **Dealer (DO) — finished goods outbound:** Gateman selects the Dealer path and captures DO number, dealer name, finished-goods product, planned quantity, driver name, driver contact, and optional remarks. The system creates a gate-created FG Transport Order with a unique TO ID, classified as Finished Goods – Dealer Outbound, linked to the gate-in record, and eligible to proceed through scaling, loading, scale-out, and gate-out.
  + Dealer vehicle arrives with a DO copy for finished goods pickup
  + Gate man enters:
    - DO Number
    - Dealer Name (Dropdown menu – list shows Master dealer list)
    - Finished Goods product line Items
    - Product Quantity
    - Vehicle Registration Number
    - Driver information
      * Driver name
      * Driver contact details
    - Remarks (If any)
  + System creates a Gate-Created FG Transport Order (TO)
  + Generated TO is tagged as:
    - Source Gate
    - Transfer Type: Finished Goods – Dealer Outbound
  + TO becomes immediately available for
    - Scaling
    - Loading
    - Gate-out
  + Inventory Deduction occurs after loading & Scale-out
* **Supplier (PO) – raw material inbound:** Gateman selects the Supplier path and captures PO number, supplier name, raw-material product, expected quantity, driver name, driver contact, and optional remarks. The system creates a gate-created RM Transport Order linked to the gate session, following the inbound path (scale-in, QC sampling, unloading, scale-out) with inventory update gated on QC Pass.
  + Gate man enters:
    - PO Number
    - Supplier Name
    - Raw Material product line items
    - Product Quantity
    - Driver information
    - Driver name
    - Driver contact details
    - Remarks (If any)
  + System creates a Gate-Created RM Transport Order (TO)
  + Generated TO follows inbound workflow:
    - Scale-in
    - QC Sampling
    - Lab test
    - Unloading
    - Scale-out
  + Inventory is updated only after QC Pass

**Functional Requirements:**

* [Critical] System SHALL allow gate-man to generate an On-demand FG TO against a Dealer DO
* [Critical] System SHALL auto-generate a unique TO ID and link it to the gate-in record
* [Critical] System SHALL classify the TO as ‘Dealer Outbound – Finished Goods’
* [High] System SHALL allow FG quantity validation against available inventory

## Gate-Out Entry

**Version 1.0, Phase 1**

**User Story:** *As a Gateman, I want to register gate-out for a vehicle only once the required upstream steps are complete, so that vehicles cannot exit the yard before scaling and loading/unloading/QC obligations are satisfied.*

**Acceptance Criteria:**

* Gate-out is allowed only when business rules are satisfied for the visit's flow type:
  + Finished-goods outbound: scale-out completed and loading completed.
  + Finished-goods inbound: scale-out completed and unloading completed.
  + Raw-material inbound: scale-out completed, unloading completed, and QC not failed.
* Gate-out records are locked from edits once created, consistent with the audit trail requirement.
* Gate-out time stored against vehicle
* Linked to QC and scaling completion
* Gate-out cannot occur before scale-out
* Gate-out is blocked if QC status is pending (for unloading flows)
* Free-text remarks can be attached to both gate-in and gate-out events.
* Every remark, gate-in, and gate-out action is captured in the gate activity log with user, POI, timestamp, and action type.
* Vehicle-registration mismatches against the assigned TO vehicle can be recorded with a documented supervisor-override policy rather than silently blocking the transaction.

**Functional Requirements:**

* [Critical] System SHALL allow gate-out date and time entry after receiving gate clearance copy from Scaling.

## Scaling/Weighing Management

## Scale-In (Weight Entry)

**Version 1.0, Phase 1**

**User Story:** *I want to record the vehicle weight and a physical waiting (P.C.) code at scale-in so that command center and loading teams can queue the vehicle using the same code issued at the yard.*

**Acceptance Criteria:**

* Scale-in requires a vehicle number and must follow a completed gate-in for the same visit session.
* Operator enters the physical **P.C. code** (Waiting/Queue code) as free text, sourced from the physical waiting slip or yard issue — the system does **not** auto-generate P.C. codes or serial numbers. When provided, the code is trimmed and validated as unique among active queue tokens at the POI.
* Operator records **loaded vehicle weight** or **empty vehicle weight** depending on which state the vehicle arrives in (empty-in / loaded-in), entering the weighbridge reading in kilograms; the system stores and displays weight as "{MT} MT ({kg} kg)".
* Scale-in captures weight ID, material name/code, challan number, scale-in date/time, and operator ID.
* A printable queue slip is generated after scale-in, reprinting the entered P.C. code and visit summary.
* On scale-in completion, the vehicle is added to the Command Center queue in the same transaction — if scale-in fails, the vehicle does not appear on the queue. The Scaling Operator only sees vehicles at their own assigned site.
* Scaling operator can log Scale-in date & Time from the Scale-In menu under Scaling Section
  + Select the TO from the drop-down menu (Vehicle number shows with the To selected
  + Input
    - PC Code
    - Weight (KG)
* Scale-in timestamp stored after Save button is clicked
* Command Center notified
* Scale-in must occur after gate-in
* Weight entries are immutable after scale-out

**Functional Requirements:**

* [Critical] System SHALL allow manual weight entry of scale-in readings.
* [Critical] System SHALL store:
  + Vehicle number
  + P.C Code
  + Challan Number
  + Scale-in Date & Time
  + Weight with Goods (KG)
  + Empty Vehicle Weight (KG)
  + Net Weight (System Calculated) (KG)
* [High] System SHALL store operator ID and Timestamp.
* [High] System notify Command Center upon scale-in completion
* [High] System SHALL allow logging discrepancies such as wrong quantity or driver mismatch.

## Queue Token Generation

**Version 1.0, Phase 1**

**User Story:** *As a Scaling Operator, I want to issue queue token so that vehicle flow can be managed efficiently.*

**Acceptance Criteria:**

* A queue token is created automatically when scale-in completes, carrying the operator-entered
  + P.C. code,
  + Queue Serial Number
  + Vehicle number,
  + Product type (FG/RM),
  + Scale-in date/time,
  + Loaded Vehicle weight, and
  + Scale-out weight
  + POI

**Functional Requirements:**

* [High] System SHALL generate a unique waiting queue token (P.C. Code) after scale-in.
* [Critical] System SHALL generate a gate pass token with Delivery Note which will be printable format with information
  + P.C. code,
  + Queue Serial Number
  + Vehicle number,
  + Product type (FG/RM),
  + Scale-in date/time,
  + Loaded Vehicle weight, and
  + Scale-out weight
  + POI
* [High] System SHALL support printing the token using a desk printer in PDF format.

## Scale-Out (Weight Exit)

**Version 1.0, Phase 1**

**User Story:** *As a Scaling Operator, I want to record the remaining weight at scale-out, have net weight calculated automatically, and generate a printable gate pass so that the vehicle's weighing record is complete and traceable before it exits the yard.*

**Acceptance Criteria:**

* Scale-out records the remaining weight (loaded vehicle weight if the vehicle was empty at scale-in, or empty vehicle weight if it was loaded at scale-in), entered in kilograms and displayed as "{MT} MT ({kg} kg)".
* The system auto-calculates **net weight** = loaded weight − empty weight once both readings are available; net weight is shown as an absolute value in the same MT (kg) format.
* Scale-out requires its own independent, operator-entered **P.C. code** (free text, same input pattern as scale-in) — this code is not matched or validated against the scale-in P.C. code.
* Either weighing (scale-in or scale-out) can independently be flagged as an "empty vehicle" reading; both flags are operator documentation only, with no mutual-exclusion rule.
* A printable gate pass is generated after scale-out, including vehicle number, item name, net weight, and the scale-out P.C. code.
* Once scale-out is recorded, the corresponding scale-in row is locked from further edits, including the P.C. code.

**Functional Requirements:**

* [Critical] System SHALL record scale-out weight.
* [Critical] Scaling operator can log Scale-out date & Time from the Scale-Out menu under Scaling Section
  + Select the TO from the Pending Session drop-down menu (Vehicle number shows with the To selected
  + Input
    - PC Code
    - Weight (KG)
* [High] System SHALL allow logging discrepancies such as wrong quantity or driver mismatch.

## Command Center Operations

## Queue Monitoring – View Waiting Vehicles

**Version 1.0, Phase 1**

**User Story:** *As a Command Center Officer, I want to see all vehicles that have completed scale-in and are not yet assigned to a bay, so that I can manage yard congestion and plan loading/unloading assignments.*

**Acceptance Criteria:**

* System displays all vehicles that have completed Scale-in
* Vehicles awaiting assignment are clearly distinguishable from the Queue Menu
* Only vehicles with completed Scale-In are eligible to appear in the Command Center queue
* For raw-material vehicles, the queue indicates whether QC has passed, since bay (unloading) assignment remains blocked until QC Pass is recorded.
* For raw-material Transport Orders, the Command Center does not assign an unloading point until QC has recorded a Pass; the CC Officer assigns the unloading point only after Pass is recorded (QC itself never assigns the bay).
* The assignment updates the Transport Order's sub-state on the execution timeline (e.g., "Assigned to Loading Point").
* The Command Center Officer's queue and assignment screens show only loading/unloading points at their own assigned site.
* Vehicles already assigned to a loading point must not appear in the waiting queue

**Functional Requirements:**

* [Critical] System SHALL display a centralized queue showing all vehicles that have completed Scale-in and awaiting loading assignment.
* [High] Each queue entry SHALL display:
  + TO / Challan Number
  + TO Status
  + TO Sub-statis
  + Product Type (FG/RM)
  + Vehicle Number
  + Scale-in Date & Time
  + Gross Weight Scale-in
  + Queue Serial (This serial will be system generated)
  + Line items
    - Product Item Code
    - Product Name
    - Product Category
    - Product Sub-Category
    - Type of Packaging (Pallet / Drum / Roll)
    - Allocated Quantity
    - Total Weight
    - UOM
  + Assignments for this visit
  + TO/Challan reference
* [High] Queue SHALL refresh automatically without manual reload.

## Bay (Load/Unload Point) Assignments

**Version 1.0, Phase 1**

**User Story:** *As a Command Center Officer, I want to assign a waiting vehicle to a loading or unloading point so that yard congestion is controlled and loading/unloading crews know what to expect..*

**Acceptance Criteria:**

* Vehicle can be assigned multiple loading & unloading points under a POI
* Assignment is immediately visible to operational teams (Loading or unloading personnels)
* Vehicle can be assigned to a loading point
* For raw-material Transport Orders, the Command Center does not assign an unloading point until QC has recorded a Pass; the CC Officer assigns the unloading point only after Pass is recorded (QC itself never assigns the bay).
* The assignment updates the Transport Order's sub-state on the execution timeline (e.g., "Assigned to Loading Point").
* The Command Center Officer's queue and assignment screens show only loading/unloading points at their own assigned site.

**Functional Requirements:**

* [Critical] System SHALL allow command center officials to assign a TO/Challan or vehicle to a specific loading or unloading point from a specific POI
* [High] After TO selection, Command Center officer can view:
  + TO Status
  + POI Classification Type (RM Inbound, FG Outbound)
  + Vehicle Number
  + Gross Weight scale-in (MT)
  + Source POI
  + Destination POI
  + Total Allocated quantity
  + QC (Queue) Status
* [High] System SHALL update vehicle status immediately after assignment

## Assignment Alert (Live Queue Visibility)

**Version 1.0, Phase 1**

**User Story:** *As a Loading and Unloading Personnel, I want newly assigned vehicles to appear in my live queue view as soon as the Command Center Officer assigns them, so that I know what to expect at my bay without waiting for a separate alert.*

**Acceptance Criteria:**

* For raw-material Transport Orders, the Command Center does not assign an unloading point until QC has recorded a Pass; the CC Officer assigns the unloading point only after Pass is recorded (QC itself never assigns the bay).
* The assignment updates the Transport Order's sub-state on the execution timeline (e.g., "Assigned to Loading Point").
* The Command Center Officer's queue and assignment screens show only loading/unloading points at their own assigned site.
* **Phase 3**:
  + Alert sent instantly after assignment
  + Alert contains vehicle and assignment details

**Functional Requirements:**

* [High] System SHALL send notification to loading or unloading teams after assignment.
* [High] Notification SHALL include:
  + Vehicle Number
  + Assigned Loading/Unloading Point
  + Product Type
  + Vehicle Capacity
  + Product Type
  + Urgency Level

## Loading Operation Management

## Loading Monitoring – Load Start/End Date & Time Entry

**Version 1.0, Phase 1**

**User Story:** *As a Loading personnel, I want to record loading start and end times against a vehicle so that loading duration and operational efficiency can be tracked accurately.*

**Acceptance Criteria:**

* Operator can select a vehicle number assigned for loading
* Operator can input **loading start** timestamp
* Operator can input **loading end** timestamp
  + Quantality (Depends on Product UOM)
  + Weight (KG) [System Calculated]
  + Seal Number
* The product-line quantities capture table shows a live-calculated loaded weight per line (quantity × weight-per-unit from the product master) with a running total, alongside the entered actual quantity.
* System stores timestamps against the corresponding vehicle and TO

**Functional Requirements:**

* [High] System SHALL allow authorized loading operators to enter Load Start Date & Time against a vehicle number.
* [High] System SHALL allow authorized loading operators to enter Load End Date & Time against the same vehicle number with Number of bags loaded, Seal number, weight
* [High] System SHALL validate that load End Date & Time cannot be earlier than Load Start Time
* [High] Loading timestamp SHALL be linked to the associated TO/Trip record.

## Loading Notifications

**Version 1.0, Phase 3**

**User Story:** *As a Transport Department user, I want to be notified when loading is completed so that downstream trip execution can proceed without delay.*

**Acceptance Criteria:**

* Notification sent immediately after loading completion
* Notification references the correct vehicle and TO
* Notification is triggered only after Load End is saved

**Functional Requirements:**

* [High] System SHALL automatically notify the Transport Department when Load End Date & Time is recorded.

## Unload Monitoring – Unload Start/End Date & Time Entry

**Version 1.0, Phase 1**

**User Story:** *As a Unloading personnel, I want to record unloading start and end times against a vehicle so that unloading duration and operational efficiency can be tracked accurately.*

**Acceptance Criteria:**

* Operator can input unloading start timestamp
* Operator can input unloading end timestamp
  + Number of Bags unloaded
  + Weight
* System stores timestamps against the corresponding vehicle and TO
* This applies to both finished-goods inbound and raw-material inbound lanes; for raw-material trips, unloading cannot start until QC has recorded a Pass.
* If QC orders a resample or a Fail during an in-progress unload, the active unload assignment is cancelled and the cancellation is clearly indicated to Unloading Personnel.
* After an unload event is captured for a raw-material Transport Order, sufficient context (TO/unload-event reference) is available and persisted for the QC Supervisor to run sampling and record a decision.
* Unloading Personnel only see inbound trips at their own destination site; loading and unloading remain separate menus/roles.
* Unload events emit Transport Order sub-state transitions ("Unloading Started" / "Unloading Completed") to the execution timeline.

**Functional Requirements:**

* [High] System SHALL allow authorized unloading operators to enter unload Start Date & Time against a vehicle number.
* [High] System SHALL allow authorized loading operators to enter unload End Date & Time against the same vehicle number
* [High] System SHALL validate chronological correctness of unloading timestamps

## Mobile Interface

## Driver Mobile Interface - Trip Management (Trip Assignment & Navigation)

**Version 1.0, Phase 1**

**User Story:** *As a driver* *I want to see my assigned Transport Orders once they are ready for dispatch, advance execution milestones after my supervisor dispatches the trip, and upload proof of delivery when the trip completes, so that operations have traceable execution evidence for every trip I run.*

**Acceptance Criteria:**

* Driver can view only Transport Orders assigned to them, from status "Ready for Dispatch" through any downstream execution state to "Closed". While a TO is "Ready for Dispatch", it is visible but execution-transition controls are disabled with a clear "awaiting dispatch by supervisor" message.
* Once the Driver Supervisor dispatches the TO, the Driver can begin triggering the driver-allowed lifecycle transitions for that TO's flow lane:
  + FG outbound: In Transit – Source → At Source → Loaded/Pickup Completed → In Transit – Destination → At Destination → Delivered/Unloaded.
  + FG inbound and RM inbound: In Transit – Destination → At Destination → Delivered/Unloaded (no source-leg steps for the driver on these lanes).
* The TO detail view shows TO reference, flow lane, current status/sub-state, pickup and drop POI, product type, quantity, urgency, and special instructions, and returns only the transitions valid for that TO's lane so the app never offers an invalid next step.
* On the first driver-triggered transition after dispatch, the system re-validates vehicle/driver availability and rejects with a descriptive error if the vehicle is unavailable, the driver is on leave, or the vehicle is under maintenance.
* Proof of Delivery (POD) upload is enabled only once the TO reaches "Completed" status. The Driver can attach one to three files (JPEG, PNG, or PDF); images are auto-compressed before storage. POD is linked to the TO with submitter and timestamp.
* Update or initiate Trip start state
* Trip status visible (Assigned, In-Transit, Delivered)
* Drivers can only view trips assigned to them

**Functional Requirements:**

* [High] System SHALL display assigned trips to the logged-in driver
* [High] Trips Details SHALL include TO ID, Pickup POI, drop POI, product type, quantity, and urgency

## Mobile Interface – QC/QA Inspection

## Mobile QC Inspection Interface

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical and QA Lab Technician, I want to conduct inspection and track time so that QC activities remain efficient.*

**Acceptance Criteria:**

* QC actions become available only after Command Center flags a raw-material Transport Order for QC (following scale-in).
* QC Inspection forms accessible on mobile
* Time tracking supported per QC activity

**Functional Requirements:**

* [High] System SHALL provide a responsive mobile QC interface accessible via web
* [High] QC Inspector - Physicals SHALL be able to perform inspections, sampling, and lab request creation

## Physical Inspection (Quality Control – QC) - Pre-QC Context Display

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want to view complete contextual information against the vehicle number before inspection so that I can perform accurate and traceable quality checks.*

**Acceptance Criteria:**

* QC action is available only after Command Center updates the raw-material Transport Order's status to flag it for QC (following scale-in).
* System displays
  + TO Number
  + Vehicle Number
  + Product Information
  + Origin POI
  + Destination POI
  + Gross Weight
* Supplier or Dealer name visible against the vehicle number and TO or challan number reference
* QC action is available only after Command Center updates the raw-material Transport Order's status to flag it for QC (following scale-in).
* QC Context must be displayed before any sample creation
* QC actions are blocked if mandatory context data is missing

**Functional Requirements:**

* [High] System SHALL display QC Context including POI From/To, Supplier/Dealer, Challan No., Date & Time, Item Name, and Quantity.
* [High] QC Context Shall be fetched from TO/Challan reference.

## Sample Creation

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want to create a sample record against the flagged Transport Order so that my inspection observations are captured before a Pass/Fail decision can be made.*

**Acceptance Criteria:**

* QC Inspector - Physical creates a sample record linked to the Transport Order, capturing a **physical analysis** text field and a free-text remarks field.
* The sample record is stamped with a timestamp and an auto-generated sample identifier.
* The system blocks recording a QC decision until at least one sample exists for the Transport Order.
* Sample creation is written to the Transport Order execution timeline.
* Inspector can create sample
* Sampling start date & time recorded
* QC Inspector - Physical will be able to add against a vehicle number
  + Physical Analysis (Text Input)
  + Final Result (QC Pass / QC Fail / QC Auto-Pass)
    - On **Pass**, the Transport Order is marked QC-passed and becomes available in the Command Center queue for unloading-point assignment; the QC Supervisor does not assign the unloading point — the CC Officer does, after Pass.
    - On **Fail**, the Transport Order is blocked: Command Center cannot assign an unloading point, unloading cannot start, scale-out is blocked, and gate-out is blocked.
    - While unloading is in progress, the QC Supervisor can trigger a **resample**, which resets the QC state, clears the previous decision, and cancels the active unloading assignment in Command Center; the TO returns to the QC queue and a new sample plus decision is required before re-assignment.
    - While unloading is in progress, the QC Supervisor can **override** an existing decision to Fail, which likewise cancels the active unloading assignment and blocks re-assignment until a new sample and Pass decision are recorded.
* Sampling end date & time recorded
* Sampling must occur after QC Sampling event creation
* Sampling timestamp must be sequential

**Functional Requirements:**

* [High] System SHALL allow QC Inspection to create samples against an Unload Item Code.
* [High] System SHALL capture sampling start and end timestamp manually.
* [High] Inspector remarks SHALL be mandatory for sample creation.

## Sample Labeling (QR Code)

**Version 1.0, Phase 2/3**

**User Story:** *As a QC Inspector - Physical, I want each sample to be uniquely labeled so that lab tracking remains accurate.*

**Acceptance Criteria:**

* QC Inspector - Physical can initiate the **Sample Send Time** by inputting the Sampling End Date & Time
* QR code generated per sample/ Bag
* QR tied to unload item
* One QR code per sample

**Functional Requirements:**

* [High] System SHALL generate a unique QR code for each sample.
* [High] QR code be tied to the unload item Code.

## Exception Recording (Media Capture)

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want to capture photos of defects so that evidence is preserved.*

**Acceptance Criteria:**

* Photo upload supported during sampling
* Timestamp stored.

**Functional Requirements:**

* [High] System SHALL allow photo upload for QC inspection

## QC Context Display

**Version 1.0, Phase 2/3**

**User Story:** *As a QC Inspector - Physical, I want to see supplier, PO / TO, and RM item code to ensure correct checklist usage.*

**Acceptance Criteria:**

* Supplier and PO / TO visible
* Expected checklist shown
* Checklist displayed depends on Product category

**Functional Requirements:**

* [High] System SHALL display Supplier, PO, RM item code, and expected QC checklist

## Sampling

## Sample Collection Event

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want to collect samples from multiple side and record comments in the system to ensure quality consistency*

**Acceptance Criteria:**

* Sampling sides recorded (Top/Middle/Bottom)
* System will calculate average of multiple samples moisture content input for each sample under the specific vehicle

**Functional Requirements:**

* [High] System SHALL allow recording of sampling

## Configurable Checklist & Sampling Form

**Version 1.0, Phase 2/3**

**User Story:** *As a QC Inspector - Physical or QA – Lab Technician, I want checklist to adapt based on product categories.*

**Acceptance Criteria:**

* Checklist adapts per product type
* Checklist configuration maintained in master data

**Functional Requirements:**

* [High] System SHALL dynamically adapt QC checklist based on product type (RM)

## QR Code Label

**Version 1.0, Phase 2/3**

**User Story:** *As a QC Inspector - Physical, I want system to generate a QR Code for each sample.*

**Acceptance Criteria:**

* System generates QR Code for each sample with unique data values with unique data values
* System shall generate the separate for each sample under a vehicle

**Functional Requirements:**

* [High] System SHALL capture sampling start and end timestamp manually

## Sampling Timestamp

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want to record sampling start and end times for traceability.*

**Acceptance Criteria:**

* Sampling timestamps stored
* Sampling end cannot precede sampling start

**Functional Requirements:**

* [High] System SHALL capture sampling start and end timestamp manually

## Lab Test Request Creation

## Create Lab Request

**Version 1.0, Phase 2/3**

**User Story:** *As a QC Inspector - Physical, I want to route lab test request to QA Lab Technician so that samples are tested systematically.*

**Acceptance Criteria:**

* QC Inspector - Physical creates lab test request from the same vehicle per sample and system tracks the Sample Send for Test Date and Time.
* QA - Lab Technician will scan QR so that system tracks the Lab test start time and will be able to input lab test name, results as report in PNG / PDF format against test added against the sample with Test completion time.
* System will track the lab test expected completion time for each test (Insert test names as text input) by QA (Lab Technician) under a sample.
* System will start the Lab testing time as soon as the QA Lab Technician scans the QR for a sample (QR scan logs send and receive time)
* QR scan triggers test start
* QR scan time is authoritative lab start time

**Functional Requirements:**

* [High] System SHALL allow QC Inspector - Physicals to create lab test requests against the vehicle per sample
* [High] QA Lab Technician scanning QR SHALL automatically trigger lab test start time

## Lab Estimated Completion

**Version 1.0, Phase 2/3**

**User Story:** *As a QA Lab Technician, I want to enter estimated time so stakeholders can plan.*

**Acceptance Criteria:**

* ETA entered

**Functional Requirements:**

* [High] System SHALL allow lab to enter estimated completion time against each test under a particular sample

## Lab Report Upload

**Version 1.0, Phase 2/3**

**User Story:** *As a QA Lab Technician, I want to upload test reports result.*

**Acceptance Criteria:**

* Report result submission

**Functional Requirements:**

* [High] System SHALL allow QA Lab Technician to submit result of the lab test report

## Lab Status Monitoring

**Version 1.0, Phase 2/3**

**User Story:** *As a QC Inspector - Physical, I want to track lab progress.*

**Acceptance Criteria:**

* Status visible (To-Do, WIP, Completed)

**Functional Requirements:**

* [High] System SHALL track lab status as To-Do, Work in Progress, or Completed

## QC Analysis

## QC Pass/Fail/Auto-Pass Tracking

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want to record QC outcomes so that downstream processes can proceed.*

**Acceptance Criteria:**

* QC status selectable
* Remarks can be added
* Auto-pass allowed

**Functional Requirements:**

* [High] System SHALL allow QC status enter: Pass, Fail, Auto-pass
* [High] System SHALL allow reinitiate sampling if QC failed and Passed

## Escalation Workflow (Recheck)

**Version 1.0, Phase 1**

**User Story:** *As a QC Inspector - Physical, I want rejected or passed QC samples recheck for decision.*

**Acceptance Criteria:**

* Resample and override-to-Fail are both available only while an unload assignment is active for the Transport Order.
* Triggering either action immediately cancels the active Command Center unloading assignment via a direct service integration between QC and Command Center.
* Both resample and override events are written to the Transport Order execution timeline with reason/remarks and, for override, the prior decision for audit.
* After a resample or override-to-Fail, the Transport Order is blocked from unloading re-assignment until a new sample is created and a new Pass decision is recorded.

**Functional Requirements:**

* [High] System SHALL allow QC inspector to reinitiate sampling and add remarks in mandatory

## QC Trigger on Unloading – Notify QC Department

**Version 1.0, Phase 3**

**User Story:** *As a QC Inspector - Physical, I want to be notified before unloading begins so that QC sampling and inspection can be prepared on time.*

**Acceptance Criteria:**

* QC Team notified before unloading starts

**Functional Requirements:**

* [High] System SHALL notify the QC department when a vehicle is assigned for unloading.
* [High] Notification SHALL include:
  + Vehicle number
  + POI (Source/Destination)
  + Product Type
  + TO/Challan reference

[High] System SHALL validate chronological correctness of unloading timestamps

## Mobile Application

## Vendor Mobile Application

## Vendor Portal Access (Bidding & Trip Management)

**Version 1.0, Phase 1**

**User Story:** *As a vendor, I want to view TO list for bidding so that I can participate in transport operations after approval.*

**Acceptance Criteria:**

* Vendor can view available bid
* Vendor can track active and completed trips

**Functional Requirements:**

* [High] Vendor SHALL be able to view active bids, assigned trips and completed tripsInvoice Management & Claims Submission
* [High] Vendor SHALL be able add driver and helper and vehicle details after winning bids

## Invoice Management & Claims Submission

**Version 1.0, Phase 2**

**User Story:** *As a vendor, I want to manage invoices and submit claims through mobile so that billing is faster and transparent.*

**Acceptance Criteria:**

* Vendor can submit invoices against a trip ID
* Vendor can track active and completed trips

**Functional Requirements:**

* [High] Vendor SHALL be able to submit claims against a trip ID with POD note
* [High] Vendor SHALL be able be able to upload supporting documents (POD, GRN, invoice)

## Multi-language Support

## Language Configuration & Toggle

**Version 1.0, Phase 3**

**User Story:** *As a Web and Mobile application operational user, I want switch the system language between English and Bangla so that I can comfortably use the platform in preferred language.*

**Acceptance Criteria:**

* User can toggle language between English and Bangla from profile or header menu
* Language preference persists across sessions
* Language change applies instantly without page reload
* Default system language is English
* Language preference is user-specific, not tenant-wide
* Maintain dictionaries for system texts, labels, menus
* Centralized configuration for adding future languages.

**Functional Requirements:**

* [High] System SHALL provide a language toggle option in both web and mobile interfaces
* [High] System SHALL support at least:
  + English
  + Bangla
* [High] Selected language preference SHALL be stored against user profile
* [High] Language preferences SHALL apply to:
  + Menus
  + Labels
  + Buttons
  + System messages

## Multi-Lingual UI/UX – Mobile Applications

**Version 1.0, Phase 3**

**User Story:** *As a Vendor or Driver, I want the mobile app or interface to support both English and Bangla so that field operations are easy to understand.*

**Acceptance Criteria:**

* Vendor mobile app supports English & Bangla
* Language toggle available in mobile settings
* Language preference syncs with user profile
* Mobile UI follows same dictionary as web

**Functional Requirements:**

* [High] Vendor Mobile App (Flutter) SHALL support bilingual UI
* [High] Language preference SHALL sync across devices
* [High] Offline language fallback SHALL sync across devices

## Reporting & Analytics

## Transport & Trip Reports

**Version 1.0, Phase 3**

**User Story:** *As a Transport, Distribution or Management user, I want visibility into daily transport operations so that I can monitor trip execution, delays and turnaround efficiency.*

**Acceptance Criteria:**

* System provides Trip Summary report including:
  + Trip ID
  + Status
  + Route
  + Vehicle
  + Driver
  + Product Type
* System provides Trip Delay report identifying trips exceeding expected timelines
* System provides Trip Turnaround report covering:
  + Gate-in
  + Scale-in
  + Load/Unload
  + Scale-out
  + Gate-out
* Reports are filterable by date range, POI, vehicle, route, and trip status
* Turnaround time calculation uses actual event timestamps only
* Users can view reports based on RBAC permission

**Functional Requirements:**

* [High] System SHALL generate a Trip Summary report with full trip lifecycle visibility
* [High] System SHALL calculate and display Trip Turnaround Time using gate, scaling, and loading timestamps
* [High] System SHALL identify delayed trips based on configured SLA or planned timelines
* [High] System SHALL allow filtering by:
  + Date
  + Depot/POI
  + Vehicle
  + Driver
  + Trip Status

## Vendor Reports

**Version 1.0, Phase 3**

**User Story:** *As a Transport user, I want vendor-specific performance and billing reports so that I can evaluate vendor contribution and manage disputes.*

**Acceptance Criteria:**

* Vendor Trip performance report shows:
  + Trips completed
  + On-time delivery percentage
* Vendor Bids Participation report shows:
  + Bids submitted
  + Bids won
* Vendor performance metrics derive only from completed trips

**Functional Requirements:**

* [High] System SHALL generate Vendor Trip Performance reports
* [High] System SHALL track vendor bid participation and bid success ratio
* [High] System SHALL provide a Vendor Dispute report

## Fleet, Vehicle & Driver Performance Reports

**Version 1.0, Phase 3**

**User Story:** *As a Transport user, I want visibility into fleet utilization and vehicle health so that I can optimize asset usage and maintenance planning.*

**Acceptance Criteria:**

* Fleet utilization report shows:
  + Active vehicles
  + Idle Vehicles
  + Vehicles under Maintenance
* Report displays trips per vehicle
* Vehicle health indicators visible where available

**Functional Requirements:**

* [High] System SHALL generate Fleet Utilization reports by vehicle status
* [High] System SHALL calculate trips per vehicle within selected period

## Costing & Finance Reports

**Version 1.0, Phase 3**

**User Story:** *As a Finance Officer, I want consolidated cost and payment reports so that I can monitor transport expenses and vendor liabilities.*

**Acceptance Criteria:**

* Trip Costing report includes:
  + Fuel Cost
  + Maintenance Cost
  + Vendor Transport Cost
* Vendor Invoice Summary report shows:
  + Submitted invoices
  + Approved Invoices

**Functional Requirements:**

* [High] System SHALL generate Trip Costing reports combining all cost components
* [High] System SHALL calculate Vendor Invoice Summary reports

## System Usage & Audit Reports

**Version 1.0, Phase 3**

**User Story:** *As an Admin, I want system activity and audit reports so that I can ensure compliance and trace critical operational changes.*

**Acceptance Criteria:**

* Audit log captures:
  + User activities
  + TR/TO edits
* Audit records include timestamp and user reference
* Audit records cannot be deleted or edited

**Functional Requirements:**

* [High] System SHALL maintain immutable audit logs for:
  + User actions
  + TR/TO modifications
* [High] System SHALL allow filtering audit logs by:
  + User
  + Module
  + Date Range

## Notification & Alerts

## Basic System Alerts

**Version 1.0, Phase 3**

**User Story:** *As a operation user, I want to receive system alerts for key transport and logistics events so that I can take timely action and avoid operational delays.*

**Acceptance Criteria:**

* System generates alerts for key DFMS events:
  + TO Creation and assignment
  + Vendor Bidding published / closed
  + Vehicle Assigned / Changed
  + Gate-in / Gate-in completion
  + Loading Started / Completed
  + Unloading Started
  + QC Triggered / QC Passed / QC Failed
  + Delivery completed / POS received
* Each alert included:
  + Event Type
  + Reference ID (TR /TO / Trip / Vehicle)
  + Timestamp
  + Action status

**Functional Requirements:**

* [High] System SHALL generate alerts for TO lifecycle events

## Stakeholder Notification (Role-Based Alerts)

**Version 1.0, Phase 3**

**User Story:** *As a System Admin, I want notifications to be role-specific so that users receive only the alerts relevant to their responsibility.*

**Acceptance Criteria:**

* Alerts are mapped to user roles:
  + Transport Planner
  + Transport Distribution Officer
  + Distribution Officer
  + Distribution Manager
  + Procurement Officer
  + Gate Man
  + Scaling Personnel
  + Command Center Officer
  + QC Inspector - Physical
  + QA Lab Technician
  + Vendor
  + Driver
* Same event may notify multiple roles with different context

**Functional Requirements:**

* [High] System SHALL route alert based on roles

## TO Update Alerts

**Version 1.0, Phase 3**

**User Story:** *As a Transport Planner, I want alerts for TO status changes so that I can manage exceptions proactively.*

**Acceptance Criteria:**

* Alerts are generated for the following TO Events:
  + TO Created
  + TO Assigned to:
    - Own Fleet
    - Vendor Fleet
  + Vehicle Assigned
  + Gate-in Completed
  + Delivery Completed
  + TO Halted (Incidents)
  + TO Closed

**Functional Requirements:**

* [High] System SHALL generate alerts for all TO lifecycle events

# Phase-wise Feature Structure

This section outlines the DFMS feature rollout plan across three implementation phases. Each phase is designed to progressively enhance operational capability, automation, and intelligence while ensuring system stability and user adoption.

## Phase – 1 Core Foundation & Operational Enablement (MVP Scope)

**Timeline: 24-28 Weeks**

**Objectives:** Deliver a fully usable DFMS platform covering end-to-end transport execution, gate operations, QC, vendor handling, and basic costing with secure multi-tenant access.

**Target Outcome:**

DFMS replaces manual and fragmented transport workflows with a centralized digital system

## System Foundation & Security

* Multi-tenant organization signup and tenant isolation
* Organization Onboarding and tenant isolation
* User Authentication (login, session control, lockout policy)
* Role-Based Access Control (RBAC) with predefined roles
* User-role assignment by department (Transport, Distribution, Procurement, QC, Gate, Command Center)
* Audit Logging for user actions

## Master Date Configuration

* Master creation and management for:
  + Vehicles
  + Drivers
  + Helpers
  + Vendors (Contractual & Non-Contractual)
  + Depots / Feed Mills / Warehouses / Factories / Ports (POIs)
  + Routes
  + Products (via Product Inventory Management)
  + QC checklist templates
* Bulk upload (CSV) and inline edit/delete
* Active/Inactive master control
* Referential integrity enforcement

## POI Management

* POI creation with:
  + GPS coordinates
  + Geofence radius
  + POI type classification
  + Storage capacity (MT)
* POI CRUD operations
* POI linkage with routing and transport workflows

## Product Inventory Management (PIM)

* Finished Goods (FG) and Raw Material (RM) product master
* Product attributes:
* SKU / Item Code
  + Category and sub-category
  + Unit of measure
  + Standard weight per unit
* Product activation/deactivation
* Audit trail for product changes

## Product Requisition Management

* Internal requisition creation by:
  + Depot / Feed Mill (Finished Goods)
  + Commercial Team (Port / Import)
* Pre-filled requester and POI context
* Stock and capacity visibility (informational)
* Threshold-based warnings
* Approval workflows:
  + Distribution approval (FG)
  + Procurement + CNF confirmation (Port)
* Automatic Transport Requisition (TR) generation

## Transport Requisition (TR) Management

* TR review queue for Transport Department
* Filtering by route, urgency, product type
* Assignment of TR to Transport Planner
* Support for multiple TOs from a single TR

## Transport Order (TO) Management

* TO creation from approved TRs
* Vehicle type and capacity validation
* Own Fleet vs Vendor Fleet decision per TO
* Forwarding TOs to designated Transport Distribution Officers (TDO)
* Fleet availability check

## Vendor Management & Bidding

* Vendor onboarding with document verification
* Contractual vs Non-Contractual vendor classification
* Vendor bidding portal
* Bid submission and evaluation
* Partial quantity allocation to vendors
* Vendor portal TO visibility

## Gate, Weighing, Command Center & QC Operations

* Gate-in and gate-out entry
* Handling of PO / DO / TO / Challan documents
* On-demand TO creation at gate:
  + Dealer outbound (DO)
  + Supplier inbound (PO)
* Manual scale-in and scale-out weight entry
* Queue token generation and printing
* Command center queue monitoring
* Loading/unloading assignment

## Quality Control (QC) Workflow

* QC event auto-creation
* Sample creation and QR labeling
* Physical inspection checklist
* Lab test request and result tracking
* QC pass/fail/recheck handling
* Evidence capture (photo, video, timestamp)

## Trip Management & Tracking

* Trip creation from TO
* Driver and vehicle assignment
* Trip lifecycle management
* Partial delivery handling (incident-based)
* Proof of Delivery (POD) capture
* Trip auto-closure on QC pass

## GPS Tracking & Basic Trip Costing

* Live GPS tracking (read-only)
* POI geofencing and dwell time tracking
* Basic trip costing:
  + Distance-based
  + Manual cost entry
* Vendor vs Own fleet cost segregation

## Phase – 2 Intermediate Enhancements & Analytics

**Timeline: 12-14 Weeks**

**Objective:** Enhance efficiency, fleet utilization, financial visibility, and operational analytics.

## Transport Planning Optimization

* TO Dispatch Planner (calendar view):
  + Daily, weekly, monthly views
* TR conjoinment suggestions
* Multi-TO assignment to single vehicle
* Route consolidation logic

## Fleet & Vehicle Enhancements

* Vehicle entity lifecycle tracking
* Fleet health dashboard
* Preventive maintenance scheduling
* Vehicle downtime logging
* Manual workshop entry (issues, cost, duration)

## Fuel Management System

* Fuel consumption tracking
* Mileage-based fuel efficiency
* Fuel entry by supervisors or drivers
* Fuel receipt and odometer image upload

## Vendor Billing & Finance Integration

* Vendor invoice submission
* Consolidated vendor billing
* Claims and dispute management
* ERP integration for cost and invoice sync

## Reporting & Dashboard

* Trip performance dashboards
* Fleet utilization reports
* QC analytics
* Operational KPI reporting
* Export to Excel / CSV

## Phase 3 – Workshop, Advanced Analytics, Alerts KPIs and Tracking

**Timeline: 12-14 Weeks**

**Objective:** Introduce multi-language support, advanced analytics, procurement automation.

## Multi-Language Support

* User-level language toggle between **English and Bangla**
* Language preference persists across sessions
* Instant language switching without page reload
* Centralized language packs for system texts, menus, labels, and alerts
* Architecture supports adding future languages
* Bilingual support across:
  + Web application
  + Vendor mobile application
* Multi-lingual system notifications and alerts (TO, GPS, QC)

## Vendor Intelligence & Competitive Transparency

* Bid probability and competitiveness indicator for vendors
* Color-coded bid position visibility:
  + High, Medium, Low probability
* Relative positioning without exposing competitor pricing
* Enhanced vendor engagement and fairness in bidding

## Fleet, Fuel & Driver Performance

* Fuel performance monitoring using:
  + Fuel intake records
  + GPS-based distance
  + Trip type (FG / Port)
  + Maintenance history
* Driver performance analytics including:
  + Trip completion metrics
  + Delivery delays
  + Idle time
  + Incident-linked trips
* Performance data used for evaluation, incentives, and risk analysis

## Operational Event Notification and Alerts

* Automated notifications for:
  + Loading completion
  + QC trigger before unloading
* Event-based alerts delivered to relevant operational teams
* Standard system alerts for transport operations
* Role-based stakeholder notification configuration
* Transport Order (TO) event alerts including:
  + TO creation
  + Assignment (own/vendor)
  + Vehicle assignment
  + Gate-in completion
  + Delivery completion
  + TO halt (incident)
  + TO closure

## Reporting & Advanced Analytics

* Transport & Trip reports:
  + Trip summary
  + Trip delays
  + Turnaround time analysis
* Vendor performance and billing reports
* Fleet utilization and maintenance reports
* Costing and finance reports:
  + Trip costing
  + Fuel expense analysis
  + Vendor invoice summaries
* System usage and audit reports:
  + User activity
  + TR/TO edits
  + QC status changes

## Workshop & Maintenance

* Manual workshop job management for vehicles
* Capture of:
  + Maintenance activities
  + Estimated vs actual time and cost
  + Parts and outsourced services
* Automatic vehicle status updates during maintenance lifecycle
* Maintenance cost linkage with vehicle lifecycle and analytics

## Procurement Automation & Integration

* Product Requisition (PR) management with:
  + Item classification
  + Hierarchical approvals
  + Audit trail
  + PIM integration
* Purchase Order (PO) management:
  + Manual and auto PO generation
  + Multi-line PO support
  + Price variance validation
  + Tax and terms configuration
  + PDF document generation
* End-to-end traceability:
  + PR → PO → TO

# Non-Functional Requirements

## Performance Requirements

* Web Application: All pages load within 3 seconds on standard broadband connection
* API Response Time: 95% of API calls respond within 500ms, 99% within 1 second
* Concurrent Users: Support minimum 500 concurrent users per tenant
* GPS Update Frequency: Real-time location updates every 30 seconds
* Dashboard Refresh: Real-time dashboards update within 5 seconds

## Scalability Requirements

* Multi-Tenancy: Support 100+ tenants on single platform instance
* Data Growth: Handle 10 million+ trips annually across all tenants
* Horizontal Scaling: Auto-scale based on load (CPU, memory, requests)
* Database Sharding: Support sharding for large enterprise customers

## Availability & Reliability

* Uptime SLA: 99.5% uptime (excluding planned maintenance)
* Planned Downtime: Maximum 4 hours per month with 48-hour advance notice
* Backup Strategy: Daily automated backups with 30-day retention
* Disaster Recovery: RPO of 1 hour, RTO of 4 hours

## Security Requirements

* Authentication: Multi-factor authentication for Admin and Finance roles
* Password Policy: Minimum 8 characters, complexity requirements, 90-day expiry
* Session Management: Auto-logout after 30 minutes inactivity, concurrent session control
* Data Encryption: TLS 1.3 in transit, AES-256 at rest
* Audit Logging: Comprehensive audit trail for all user actions with 2-year retention
* API Security: JWT tokens, rate limiting, request validation

## Usability Requirements

* Responsive Design: Web interface works on desktop (1920x1080), tablet (1024x768), mobile (375x667)
* Browser Support: Chrome, Firefox, Safari, Edge (latest 2 versions)
* Mobile App: Native or hybrid apps for Android 8+ and iOS 13+
* Accessibility: WCAG 2.1 Level AA compliance
* Language Support: English and Bangla with easy addition of new languages
* Training Time: New users productive within 2 hours of training

## Compatibility Requirements

* GPS Devices: Support major GPS/VTS providers in Bangladesh market
* ERP Systems: Pre-built connectors for SAP, Oracle, Microsoft Dynamics
* Mobile OS: Android 8+ and iOS 13+ for mobile applications
* Payment Gateways: Support local payment providers (bKash, Nagad, etc.)

# Integration Requirements

## GPS/VTS Integration

* Real-time location data pull every 30 seconds
* Historical track data retrieval for playback
* Support multiple GPS providers with configurable data mapping
* Geofence definition sync with GPS devices

## Map & Routing APIs

* Google Maps / OpenStreetMap for geocoding and routing
* Route optimization based on distance, traffic, tolls
* ETA calculation and dynamic updates
* Geofence visualization on maps

# Security & Compliance

## Data Security

* Multi-tenant data isolation with schema-level separation
* Encryption at rest (AES-256) and in transit (TLS 1.3)
* Database access controls with principle of least privilege
* Regular security audits and penetration testing
* Secure API endpoints with authentication and rate limiting

## Access Control

* Role-Based Access Control (RBAC) with configurable permissions
* Multi-factor authentication for privileged accounts
* IP whitelisting option for enterprise tenants
* Automatic session timeout and concurrent session control
* Password complexity enforcement and periodic rotation

## Audit & Compliance

* Comprehensive audit trail for all user actions and data modifications
* Tamper-proof audit logs with digital signatures
* Export capabilities for compliance reporting
* 2-year audit log retention as default, configurable per tenant
* GDPR compliance features for data privacy

## Regulatory Compliance

* Bangladesh Road Transport Corporation (BRTC) compliance for vehicle documents
* Tax compliance (VAT, AIT) as per Bangladesh tax laws
* Driver license validation against BRTA database (if API available)
* Weighbridge integration for legal load limits

# Mobile Application Requirements

## Vendor Mobile App (Flutter)

**Key Features:**

* Active bidding opportunities with TO details
* Bid submission interface
* Assigned TO details with delivery instructions
* Trip status tracking
* Invoice submission and tracking
* Claims submission with supporting documents
* Payment status and vendor ledger view
* Performance scorecard
* Notifications for new bids and payments

**Technical Requirements:**

* Cross-platform: Single codebase for Android and iOS
* Push notifications for bidding opportunities
* Document upload (photos of receipts, bills)
* Offline view of past trips and invoices

# Mobile Interface Requirements

## Driver Mobile Interface

**Key Features:**

* Trip assignment notifications and details view
* Trip status updates (Dispatched, In Transit, Arrived, Completed)
* Fuel entry with photo receipt upload
* Proof of Delivery capture (signature + photo)
* Emergency contact and support

**Technical Requirements:**

* Platform: Android 8+ and iOS 13+
* Offline Capability: Essential features work without connectivity
* Background GPS: Continuous location tracking even when app in background
* Photo Compression: Auto-compress images to reduce data usage
* Battery Optimization: Minimal battery drain during GPS tracking

## QC Inspector - Physical Mobile Interface

**Key Features:**

* QC event/trip list view with pending inspections
* Configurable inspection checklists by product category
* Time tracking: gate-in, sampling, lab test, QC completion
* Photo/video capture with GPS timestamp
* Lab result entry and pass/fail determination
* Offline data entry with sync when online
* QC performance dashboard

**Technical Requirements:**

* Responsive web application accessible on tablets
* Camera integration for high-quality photo capture
* GPS metadata embedded in photos
* Local storage for offline QC entries

# Training & Documentation

## Documentation Deliverables

* User Manuals
* Admin Guide
* API Documentation
* Technical Architecture Document

## Knowledge Transfer

* KT sessions for IT support team
* Video tutorials for common tasks

# Glossary & Terminology

## Appendix A

|  |  |
| --- | --- |
| Acronyms | Description |
| PR | Product Requisition |
| TR | Transport Requisition |
| TO | Transport Order |
| POI | Point of Interest |
| CNF | Clearing & Forwarding Agent |
| BL | Bill of Lading |
| LC | Letter of Credit |
| QC | Quality Control |
| POD | Proof od Delivery |
| GRN | Goods Receipt Note |
| GPS | Global Positional System |
| VTS | Vehicle Tracking System |
| DFMS | Distribution and Fleet Management System |

## Domain Terms

|  |  |
| --- | --- |
| Domain Terms | Description |
| Consignment | Batch of goods being transported |
| Geofencing | Virtual boundary around a physical location |
| Dwell Time | Time vehicle spends at a location |
| Haversine distance | Haversine distance is the shortest over-surface distance between two points on a sphere, calculated using their latitude and longitude coordinates |

# Document Sign-off

This Product Requirements Document represents the comprehensive functional and non-functional requirements for the OptiLogist - Distribution and Fleet Management System (DFMS) platform. Stakeholder review and approval are required before proceeding to detailed design and development phases.

--- End of Document ---