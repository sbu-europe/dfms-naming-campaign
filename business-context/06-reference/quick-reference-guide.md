---
title: Quick Reference Guide
category: reference
status: complete
created: 2026-02-11
updated: 2026-02-11
---

# Quick Reference Guide

> Quick lookup guide for common information in DFMS business context

---

## 🎯 Most Important Documents

### Start Here
1. **[Project Summary](../00-overview/project-summary.md)** - 5-minute overview
2. **[Glossary](../00-overview/glossary.md)** - Key terms and acronyms
3. **[Business Context](../00-overview/business-context.md)** - Domain knowledge
4. **[Feature Overview](../04-phase-stories/feature-overview.md)** - All features at a glance

### For Developers
1. **[Phase 1 Summary](../04-phase-stories/phase-1/phase-1-summary.md)** - All Phase 1 user stories
2. **[Data Dictionary](../05-data-reference/data-dictionary.md)** - Complete data model
3. **[Business Rules](../01-business-domain/business-rules/business-rules.md)** - 112 business rules
4. **[Feature Dependencies](../04-phase-stories/feature-dependencies.md)** - What depends on what

### For Product Managers
1. **[Business Objectives](../02-requirements/business-objectives.md)** - Goals and KPIs
2. **[User Personas](../02-requirements/user-personas.md)** - 21 personas

### For QA
1. **[Functional Requirements](../02-requirements/functional-requirements/functional-requirements-summary.md)** - 91 user stories
2. **[Non-Functional Requirements](../02-requirements/non-functional-requirements/non-functional-requirements.md)** - Performance, security, etc.
3. **[User Stories](../04-phase-stories/phase-1/user-stories/)** - Detailed acceptance criteria

---

## 📊 Key Numbers

### Project Scope
- **Total User Stories**: 91 (62 Phase 1 + 14 Phase 2 + 14 Phase 3 + 1 mobile)
- **Phase 1 Duration**: 26 weeks (6 months)
- **Total Modules**: 12 major modules
- **Business Rules**: 112 rules
- **User Personas**: 21 personas

### Current State (Nourish)
- **Feedmills**: 5 (Bhaluka, Bogura, Jessore, Kapotakkho, Chittagong)
- **Depots**: 20+
- **Vehicles**: 80+ (30+ own, 50+ vendor)
- **Drivers**: 150+ (permanent + backup + vendor)
- **Vendors**: 30+
- **Daily Trips**: 50-100
- **Daily QC Checks**: 100-200

### Pain Points & Impact
- **Manual Work Time Lost**: 2,400+ hours/year
- **Annual Cost Impact**: BDT 4.6M

---

## 🗂️ Module Quick Reference

| Module | User Stories | Priority | Key Features |
|--------|--------------|----------|--------------|
| **Master Data** | US-001 to US-008 | P0 | Vehicle, Driver, Vendor, Location, Product, Zone |
| **Product Requisition** | US-009 to US-014 | P0 | TR creation, approval, capacity validation |
| **Transport Management** | US-015 to US-026 | P0 | TO creation, trip management, real-time tracking |
| **Vendor Management** | US-027 to US-034 | P0 | Vendor portal, bidding, performance tracking |
| **Operations** | US-035 to US-043, US-071 | P0 | Gate, scaling, loading/unloading, command center |
| **Quality Control** | US-044 to US-056 | P0 | QC workflow, sample tracking, lab integration |
| **Fleet Management** | US-057 to US-058 | P1 | Maintenance, workshop management |
| **Trip Costing** | US-059 to US-060 | P1 | Cost tracking, vendor billing |
| **Mobile Apps** | US-052, US-061, US-063 | P0 | Driver, QC, Vendor apps |
| **Reporting** | Phase 2 | P1 | Advanced reporting and analytics |
| **Notifications** | Phase 2 | P1 | Alerts and notifications |
| **Advanced Features** | Phase 3 | P2 | AI/ML, predictive analytics |

---

## 👥 Stakeholder Quick Reference

### Key Contacts

| Role | Name | Department | Key Needs |
|------|------|------------|-----------|
| **Specialist, Business Transformation** | Saadman Rahman Chowdhury | Management | Strategic visibility, ROI |
| **GM, Operations & Procurement** | Shahjahan Shek | Operations | Real-time tracking, vendor mgmt |
| **Consultant, Head of Transport** | Ahsan Mahmud | Transport | Trip management, mobile apps |
| **GM, Accounts** | Mohammed Al Amin Juel | Finance | Cost tracking, reconciliation |
| **Project Manager (BS23)** | Monojit Shil | BS23 | Project delivery |
| **Business Analysts (BS23)** | Nishat, Azmir, Mehrab | BS23 | Requirements, documentation |

### Stakeholder Groups

| Group | Count | Top Priority | Expected Benefit |
|-------|-------|--------------|------------------|
| **Management** | 3 | Strategic visibility | Data-driven decisions |
| **Transport Operations** | 8 | Real-time tracking | Improved visibility |
| **Procurement** | 5 | Vendor bidding | Transparent process |
| **Distribution/Sales** | 6 | Capacity validation | No wasted trips |
| **QA/QC** | 7 | Digital workflow | 60% faster clearance |
| **Accounts/Finance** | 4 | Real-time costing | 75% faster reconciliation |
| **MIS/Commercial** | 8 | Centralized data | Real-time reports |
| **Field Teams** | 80+ | Mobile apps | 50% less manual work |

---

## 📱 Mobile Applications

### Driver Mobile App (US-052)
**Users**: 150+ drivers  
**Key Features**:
- Trip acceptance/rejection
- Status updates (loaded, in-transit, delivered)
- GPS tracking
- Incident reporting
- Digital POD

### QC Supervisor Mobile App (US-061)
**Users**: 10+ QC supervisors  
**Key Features**:
- Digital QC checklists
- Photo capture
- QR code sample tracking
- Real-time lab test entry
- Instant clearance

### Vendor Mobile App (US-063)
**Users**: 30+ vendors  
**Key Features**:
- Online bidding
- Trip notifications
- Performance dashboard
- Bill submission
- Payment tracking

---

## 🗄️ Data Quick Reference

### Master Data Entities (6)
1. **Vehicle**: 80+ records (registration, type, capacity, GPS)
2. **Driver**: 150+ records (license, NID, mobile, rating)
3. **Vendor**: 30+ records (company, license, BIN/TIN, contract)
4. **Location**: 25+ records (feedmills, depots, GPS, capacity)
5. **Product**: 50+ records (feed, DOC, UOM, QC requirements)
6. **Zone**: 20+ records (geographic hierarchy)

### Transactional Data Entities (4)
1. **Transport Request (TR)**: 50-100/day (requisitions)
2. **Transport Order (TO)**: 50-100/day (approved orders)
3. **Trip**: 50-100/day (trip execution)
4. **Quality Check (QC)**: 100-200/day (inspections)

### Key Relationships
```
TR → TO → Trip → QC
         ↓
    Vehicle, Driver, Vendor
         ↓
    Location, Product
```

---

## 🔧 Business Rules Quick Reference

### Critical Rules (Top 10)

| Rule ID | Module | Description | Enforcement |
|---------|--------|-------------|-------------|
| BR-001 | Vehicle | Unique registration number | System |
| BR-011 | Driver | Unique mobile number | System |
| BR-021 | Vendor | Unique trade license, BIN, TIN | System |
| BR-022 | Vendor | Blacklisted vendors cannot be assigned | System |
| BR-061 | TR | TR number auto-generated | System |
| BR-063 | TR | Only APPROVED TRs convert to TOs | System |
| BR-073 | TO | Vehicle/driver must be assigned before trip | System |
| BR-083 | Trip | Actual quantity cannot exceed planned by >5% | System |
| BR-093 | QC | Clearance only if overall result is PASS | System |
| BR-094 | QC | Failed QC must have rejection reason | System |

**Total Business Rules**: 112 (see [Business Rules](../01-business-domain/business-rules/business-rules.md))

---

---

## 🔍 Common Lookups

### Find a User Story
- **By Module**: See [Phase 1 Summary](../04-phase-stories/phase-1/phase-1-summary.md)
- **By Number**: `US-###` files in `04-phase-stories/phase-1/user-stories/`
- **By Feature**: See [Feature Overview](../04-phase-stories/feature-overview.md)

### Find a Business Rule
- **By Module**: See [Business Rules](../01-business-domain/business-rules/business-rules.md)
- **By ID**: Search for `BR-###` in business rules document

### Find Data Structure
- **Entity Definition**: See [Data Dictionary](../05-data-reference/data-dictionary.md)
- **Master Data**: See [Master Data Overview](../05-data-reference/master-data/master-data-overview.md)
- **Transactional Data**: See [Transactional Data Overview](../05-data-reference/transactional-data/transactional-data-overview.md)

### Find Stakeholder Info
- **Personas**: See [User Personas](../02-requirements/user-personas.md)

---

## 🚀 Implementation Quick Reference

### Phase 1 Sprint Allocation

| Sprint | Weeks | Focus | User Stories |
|--------|-------|-------|--------------|
| **Sprint 1-2** | 1-4 | Foundation | US-001 to US-008 (Master Data) |
| **Sprint 3-4** | 5-8 | Core Transport | US-009 to US-026 (TR, TO, Trip) |
| **Sprint 5-6** | 9-12 | Vendor & QC | US-027 to US-056 (Vendor, QC) |
| **Sprint 7-8** | 13-16 | Operations | US-035 to US-043, US-071 |
| **Sprint 9-10** | 17-20 | Mobile Apps | US-052, US-061, US-063 |
| **Sprint 11-12** | 21-24 | Costing & Fleet | US-057 to US-060 |
| **Sprint 13** | 25-26 | UAT & Launch | Testing, training, go-live |

### Critical Path
1. Master Data (US-001 to US-008) - Foundation
2. TR/TO Management (US-009 to US-020) - Core workflow
3. Trip Management (US-021 to US-026) - Execution
4. QC Workflow (US-044 to US-056) - Quality gates
5. Mobile Apps (US-052, US-061, US-063) - Field enablement

---

## 📞 Support & Questions

### Documentation Questions
- Check [Glossary](../00-overview/glossary.md) for term definitions
- Check [Cross-Reference Index](./cross-reference-index.md) for document relationships
- Check [Source Document Mapping](../00-overview/source-document-mapping.md) for original sources

### Technical Questions
- Data model: See [Data Dictionary](../05-data-reference/data-dictionary.md)
- Business logic: See [Business Rules](../01-business-domain/business-rules/business-rules.md)
- API contracts: See `technical-context/` folder (in parent directory)

### Business Questions
- Requirements: See [Functional Requirements](../02-requirements/functional-requirements/)
- Objectives: See [Business Objectives](../02-requirements/business-objectives.md)
- Processes: See [Business Processes](../01-business-domain/business-processes/)

---

## 🔗 External Links

### Source Documents
- Location: `../../source-documents/`
- **PRD**: `source-documents/01-prd/PRD_DFMS_v1.0.md`
- **SOW Documents**: `source-documents/03-sow/` (Phase 1, 2, 3)
- **WBS Documents**: `source-documents/04-wbs/` (Epics, Stories, Timeline, Risks, Releases)
- **Flow Diagrams**: `source-documents/02-flow-diagram/`
- **Historical**: Business Proposal, Discovery Phase, Meeting Minutes (archived)

### Related Repositories
- Backend: (To be created - will import this as submodule)
- Frontend: (To be created - will import this as submodule)
- Mobile: (To be created - will import this as submodule)

---

**Last Updated**: February 11, 2026  
**Version**: 1.0.0  
**Status**: ✅ Complete

