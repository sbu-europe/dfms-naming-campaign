---
title: Department-Specific Insights
category: stakeholder-insights
status: complete
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx
  - ../../source-documents/meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx
  - ../../source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx
  - ../../source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx
  - ../../source-documents/meeting-minutes/2025-10/Accounts_Finance_2025-10-08.docx
  - ../../source-documents/meeting-minutes/2025-10/Commercial_Operations_2025-10-08.docx
  - ../../source-documents/meeting-minutes/2025-10/MIS_Operations_2025-10-08.docx
tags: [department-insights, discovery, requirements]
---

# Department-Specific Insights

> Consolidated insights from 7 department discovery sessions

---

## 📋 Overview

This document consolidates insights from individual department discovery sessions conducted in September-October 2025. Each section captures the current processes, pain points, requirements, and expectations specific to that department.

**Departments Covered**:
1. Transport Operations
2. Procurement Operations
3. Distribution & Sales
4. QA/QC Operations
5. Accounts & Finance
6. Commercial Operations
7. MIS Operations

---

## 🚚 1. Transport Operations

**Session Date**: September 29, 2025  
**Participants**: 8 (including GM Operations, Head of Transport, BS23 team)  
**Duration**: 3 hours

### Current Process

#### Requisition & Fleet Request
- All transport requests via **WhatsApp Tracking Group**
- 20 depots submit feed distribution requests
- 5 feedmills: Bhaluka, Bogura, Jessore, Kapotakkho, Chittagong
- Morning stock checks trigger requisitions
- Distribution planned according to depot requirements
- In-house vehicle availability checked first
- External vendors contacted if capacity insufficient
- Example: 50 vehicles needed → 30 in-house + 20 vendor vehicles

#### Vehicle & Driver Assignment
- **Drivers**: Each vehicle has permanent driver + 5 backup drivers
- **Helpers**: Tied to specific drivers, occasionally reassigned
- **Onboarding Requirements**:
  - Driving license, National ID
  - Previous experience certificate
  - Biodata, 2 references from Nourish
  - Previous accident history verification
- **Helper Onboarding**:
  - National ID
  - References from known contacts

#### Trip Planning & Execution
- **Loading**: Trips begin at feedmills (2-3 internal loading points)
- Single vehicle collects from multiple loading points within same feedmill
- Multiple-drop trips are rare
- Each feedmill handles own loading (no cross-feedmill loading)
- **Delivery**: Single depot/unloading point per trip
- Drivers confirm delivery upon completion
- **Expected Duration**: 24 hours (often extends to 30+ hours)

#### Vehicle Tracking
- **In-house vehicles**: GPS tracked
  - Assumptions: 1 hour stationary = lunch, long idle = traffic
  - Tracked via kilometers along route
- **Vendor vehicles**: No GPS access to Nourish
  - Standard lead time: 24 hours
  - Delays handled through negotiation

#### Trip Completion & Delays
- Drivers confirm unloading before next trip
- **Delay handling**:
  1. Contact driver first
  2. Contact depot team if unresolved
- **Common delay causes**:
  - High queues at loading/unloading
  - Labor shortages (BORO season, peak hours, mango season)
  - Godown capacity constraints
  - QC checks at feedmills (vehicles wait for QC clearance)

### Key Pain Points

1. **Manual Tracking** (Critical)
   - 4-5 hours daily on manual Google Sheets
   - WhatsApp-based communication
   - No real-time visibility for vendor vehicles
   - Assumptions about delays

2. **Trip Delays** (Critical)
   - 20-30% trips exceed 24 hours
   - Queue management issues
   - QC clearance delays
   - Depot capacity constraints

3. **Planning Overhead** (High)
   - 2-3 hours daily for planning
   - Manual vehicle availability checking
   - Driver/helper assignment via phone

### Requirements & Expectations

#### Must-Have
- ✅ Real-time GPS tracking for ALL vehicles (own + vendor)
- ✅ Automated vehicle assignment
- ✅ Driver mobile app for status updates
- ✅ Real-time dashboard showing:
  - Completed trips count
  - Available vehicles
  - In-trip vehicles
  - Vehicle status (loading, unloading, maintenance, in-trip)
- ✅ Auto-triggered delay notifications
- ✅ Driver attendance tracking (HRIS integration planned)

#### Should-Have
- Route optimization
- Queue management system
- ETA predictions
- Performance analytics (vehicle utilization, driver performance)

#### Nice-to-Have
- Predictive maintenance alerts
- Fuel consumption tracking
- Driver behavior analysis

### Success Metrics
- Planning time: 3 hours → 30 minutes
- Tracking time: 5 hours → 30 minutes
- Vehicle visibility: 40% → 100%
- On-time delivery: 75% → 90%

---

## 📦 2. Procurement Operations

**Session Date**: October 6, 2025  
**Participants**: 5 (including GM Operations, Procurement team, BS23 team)  
**Duration**: 2 hours

### Current Process

#### Vendor Onboarding
- **Documents Collected**:
  - Trade License
  - BIN and TIN certificates
  - Testimonial from Truck Association
  - Enlisted vehicle list
  - Vehicle registration numbers
  - Driver and helper details
- **Security**: Deposit taken + Deed of Agreement (Tk. 100 stamp)
- **Storage**: All vendor details in Excel sheet
- **Contact**: SMS and phone calls when vehicles needed

#### Vendor Bidding
- **Process**: WhatsApp-based bidding channel
- **Two Types**:
  1. **Finished goods vendors**: Annual contracts (no bidding)
  2. **Raw material vendors**: Bidding conducted
- **Timeline**:
  - Query sent via WhatsApp ~10 AM
  - Vendors respond with rates
  - Nourish evaluates and selects best price
  - Order confirmed with designated vendor

#### Vendor Management
- **Performance**: No systematic tracking
- **Feedback**: Informal only
- **Underperformance**: Vendors called for feedback
- **Penalties**: Weight shortage rules:
  - Up to 40 kg loss: Not penalized
  - Above 40 kg: Vendor compensates (e.g., 70 kg loss = 30 kg compensation)
- **Accountability**: Challan specifies quantity, van sealed with numbered seal

### Key Pain Points

1. **Manual Bidding** (Critical)
   - WhatsApp-based process
   - 1-2 hours daily
   - No bid history
   - No transparency concerns addressed
   - Cannot analyze bidding patterns

2. **Vendor Performance** (High)
   - No performance metrics
   - No rating system
   - Cannot identify best vendors
   - Repeat issues with poor performers

3. **Payment Reconciliation** (Medium)
   - Vendors submit trip-wise bills (not consolidated)
   - Manual verification required
   - Weight shortage calculations manual
   - 3-4 days monthly for reconciliation

### Requirements & Expectations

#### Must-Have
- ✅ Digital vendor onboarding portal
- ✅ Online bidding system with transparency
- ✅ Vendor performance scoring
- ✅ Automated payment reconciliation
- ✅ Weight shortage auto-calculation
- ✅ Vendor blacklist management

#### Should-Have
- Historical rate comparison
- Vendor analytics dashboard
- Automated vendor selection based on performance
- Mobile app for vendors

#### Nice-to-Have
- Vendor intelligence (market rate predictions)
- Vendor capacity planning
- Vendor collaboration portal

### Success Metrics
- Vendor onboarding: 1 week → 1 day
- Bidding time: 2 hours → 30 minutes
- Payment reconciliation: 4 days → 1 day
- Vendor performance visibility: 0% → 100%

---

## 🏪 3. Distribution & Sales

**Session Date**: October 6, 2025  
**Participants**: 6 (Sales team leads, Distribution team, BS23 team)  
**Duration**: 2.5 hours

### Current Process

#### Inventory & Requisition
- Depot stock levels monitored through **Sales App** and **MIS system**
- Distribution department checks:
  1. Current inventory levels (live from MIS)
  2. Depot capacity thresholds
- Prioritization when vehicles limited:
  - 10 vehicles available, 20 locations requesting
  - Depots with lower inventory prioritized

#### DOC (Day-Old Chicks) Delivery
- Marketing/Sales team raises requisitions
- Vehicles dispatched to dealer points
- DOCs delivered to depots
- **Open Questions**:
  - How to mark vehicles as received?
  - How to capture delivery confirmation?
  - Currently: Narayan Babu confirms delivery condition
- **Need**: Detailed discussion with Sales team on DOC planning control

### Key Pain Points

1. **No Capacity Validation** (High)
   - Requisitions approved without capacity check
   - Vehicles arrive at full depots
   - No warning system for capacity limits
   - Reactive management

2. **Manual Prioritization** (Medium)
   - Manual decision-making when vehicles limited
   - Requires checking MIS for inventory levels
   - Time-consuming process

3. **DOC Process Unclear** (Medium)
   - Delivery confirmation process undefined
   - Receipt marking unclear
   - Planning control needs clarification

### Requirements & Expectations

#### Must-Have
- ✅ Integration with Sales App/MIS
- ✅ Auto-TR creation from sales orders
- ✅ Capacity-aware requisitions with warnings
- ✅ Automated prioritization based on inventory
- ✅ Real-time delivery tracking
- ✅ Customer delivery notifications

#### Should-Have
- ETA updates to customers
- Delivery confirmation workflow
- DOC-specific workflow
- Demand forecasting

#### Nice-to-Have
- Customer self-service portal
- Delivery scheduling
- Route optimization for multi-drop

### Success Metrics
- Requisition processing: Manual → Automated
- Capacity violations: 20% → 0%
- Customer delivery visibility: 0% → 100%
- DOC delivery confirmation: Manual → Digital

---

## 🔬 4. QA/QC Operations

**Session Date**: October 6, 2025  
**Participants**: 7 (QC supervisors, Lab technicians, BS23 team)  
**Duration**: 2.5 hours

### Current Process

#### QC Workflow
- **Sample Collection**: Paper-based
- **QC Checklists**: Manual forms
- **Lab Tests**: Results on paper
- **QC Reports**: Manually typed
- **Sample Tracking**: No digital tracking
- **Vehicle Clearance**: Vehicles wait 1-2 hours for QC clearance
- **Chain of Custody**: Paper-based

#### Quality Control Points
- **At Feedmills**: Vehicles cannot proceed until QC checks cleared
- **At Unloading Points**: QC verification before acceptance
- **Lab Tests**: Manual entry of test results
- **Compliance**: Paper-based documentation

### Key Pain Points

1. **Paper-Based Process** (Critical)
   - Vehicles wait 1-2 hours for clearance
   - Paper reports can be lost
   - Difficult to trace quality issues
   - No historical QC data analysis
   - Compliance documentation challenges

2. **Sample Tracking** (High)
   - Manual sample labeling
   - No QR code or barcode
   - Samples occasionally misplaced
   - Cannot trace sample history
   - Audit trail gaps

3. **QC Delays** (High)
   - Backlogs at feedmills
   - Vehicles queued waiting for clearance
   - Lab efficiency issues
   - Manual data entry delays

### Requirements & Expectations

#### Must-Have
- ✅ Mobile QC app for inspectors
- ✅ Digital checklists
- ✅ Photo capture capability
- ✅ QR code sample tracking
- ✅ Real-time lab test entry
- ✅ Auto-QC report generation
- ✅ Instant clearance notifications

#### Should-Have
- Sample chain of custody tracking
- Historical QC data analysis
- Trend analysis and alerts
- Batch traceability
- Non-conformance tracking

#### Nice-to-Have
- AI-powered quality predictions
- Automated sample routing
- Lab equipment integration
- CAPA (Corrective Action) management

### Success Metrics
- QC clearance time: 2 hours → 30 minutes
- Paper forms: 100% → 0%
- Sample traceability: 50% → 100%
- QC data digitization: 50% → 100%

---

## 💰 5. Accounts & Finance

**Session Date**: October 8, 2025  
**Participants**: 4 (GM Accounts, Finance team, BS23 team)  
**Duration**: 2 hours

### Current Process

#### Vendor Payments
- **Finished Goods Vendors**: Monthly bills submitted officially
- **Raw Material Vendors**: Two payment methods:
  1. Direct payment at unloading points
  2. Payment within 10-15 days (per deed clause)
- **Claims**: With challan copy
- **Reconciliation**: Manual verification and assessment
- **Processing**: Monthly settlement

#### Transport Cost Adjustment
- Weight shortage deductions from transport cost
- Example: Truck hired for BDT 25,000
  - 60-70 kg shortage → BDT 3,000-4,000 deduction
  - 40 kg or less → No penalty, adjusted from cost
- **Current Issue**: Vendors submit trip-wise bills (not consolidated)

#### Cost Tracking
- **Current**: Manual cost tracking
- **Reporting**: Month-end only
- **Analysis**: Limited historical analysis
- **Allocation**: Manual cost center allocation

### Key Pain Points

1. **Manual Reconciliation** (Critical)
   - 3-4 days monthly for reconciliation
   - Payment disputes common
   - Vendor dissatisfaction
   - Cash flow issues for vendors
   - Administrative overhead

2. **No Real-time Costing** (High)
   - Trip costs known only at month-end
   - Cannot track costs in real-time
   - Difficult to identify cost overruns early
   - Limited cost optimization opportunities

3. **Trip-wise Billing** (Medium)
   - Vendors submit separate bills per trip
   - Not consolidated monthly
   - Increases reconciliation workload
   - Difficult to track overall vendor costs

### Requirements & Expectations

#### Must-Have
- ✅ Real-time trip costing
- ✅ Automated vendor bill reconciliation
- ✅ Weight shortage auto-calculation
- ✅ Penalty auto-calculation
- ✅ Payment voucher auto-generation
- ✅ Consolidated vendor billing

#### Should-Have
- ERP integration
- Auto-posting of transactions
- Cost center allocation
- Budget vs actual tracking
- Fuel consumption tracking
- Maintenance cost tracking

#### Nice-to-Have
- Predictive cost analysis
- Cost optimization recommendations
- Vendor payment portal
- Digital payment integration

### Success Metrics
- Reconciliation time: 4 days → 1 day
- Real-time cost visibility: 0% → 100%
- Payment disputes: 20% → 5%
- Vendor payment cycle: 30 days → 15 days

---

## 🏢 6. Commercial Operations

**Session Date**: October 8, 2025  
**Participants**: 5 (Commercial team, BS23 team)  
**Duration**: 2 hours

### Current Process

#### Commercial Management
- Contract management with vendors
- Rate negotiations
- Service level agreements
- Compliance monitoring
- Market rate tracking

#### Vendor Contracts
- **Finished Goods**: Annual contracts
- **Raw Materials**: Trip-based or short-term contracts
- **Terms**: Defined in Deed of Agreement
- **Penalties**: Specified in contracts
- **Renewals**: Manual tracking and renewal

### Key Pain Points

1. **Contract Management** (Medium)
   - Manual contract tracking
   - Renewal dates not tracked systematically
   - Difficult to compare contract terms
   - No centralized contract repository

2. **Rate Management** (Medium)
   - Market rate tracking manual
   - Difficult to benchmark rates
   - Rate history not easily accessible
   - No rate trend analysis

3. **SLA Monitoring** (Medium)
   - No automated SLA tracking
   - Manual compliance monitoring
   - Difficult to identify SLA violations
   - No alerts for SLA breaches

### Requirements & Expectations

#### Must-Have
- ✅ Digital contract repository
- ✅ Contract renewal alerts
- ✅ Rate comparison tools
- ✅ SLA monitoring dashboard
- ✅ Vendor compliance tracking

#### Should-Have
- Market rate benchmarking
- Rate trend analysis
- Contract template management
- Automated SLA alerts
- Vendor scorecard

#### Nice-to-Have
- Contract analytics
- Rate prediction models
- Automated contract generation
- E-signature integration

### Success Metrics
- Contract tracking: Manual → Automated
- Renewal alerts: 0% → 100%
- SLA visibility: Limited → Complete
- Rate benchmarking: Manual → Automated

---

## 📊 7. MIS Operations

**Session Date**: October 8, 2025  
**Participants**: 3 (MIS team, BS23 team)  
**Duration**: 1.5 hours

### Current Process

#### Data Management
- **Current Systems**: MIS Portal, Sales App, Google Sheets, WhatsApp
- **Data Flow**: Fragmented across systems
- **Reporting**: Manual report generation
- **Data Quality**: Inconsistent across sources
- **Integration**: Limited integration between systems

#### Reporting
- **Daily Reports**: Manual compilation
- **Weekly Reports**: Manual compilation
- **Monthly Reports**: 2-3 days to generate
- **Ad-hoc Reports**: Time-consuming to create
- **Distribution**: Manual email distribution

### Key Pain Points

1. **Data Silos** (Critical)
   - Data scattered across multiple systems
   - No single source of truth
   - Inconsistent data across departments
   - Difficult to reconcile data
   - Manual data consolidation required

2. **Manual Reporting** (High)
   - 2-3 days for monthly reports
   - Reports outdated by delivery time
   - Cannot generate ad-hoc reports quickly
   - Limited historical analysis
   - Human errors in calculations

3. **No Real-time Data** (High)
   - All data is historical
   - No real-time dashboards
   - Decisions based on outdated data
   - Cannot identify issues proactively

### Requirements & Expectations

#### Must-Have
- ✅ Centralized data repository
- ✅ Real-time dashboards
- ✅ Automated report generation
- ✅ Ad-hoc reporting capability
- ✅ Data quality validation
- ✅ Role-based access control

#### Should-Have
- Data warehouse
- Business intelligence tools
- Custom dashboard creation
- Scheduled report delivery
- Data export capabilities (Excel, PDF)
- API access for integrations

#### Nice-to-Have
- Predictive analytics
- AI-powered insights
- Natural language queries
- Mobile dashboards
- Data visualization tools

### Success Metrics
- Report generation time: 3 days → Real-time
- Data accuracy: 70% → 95%
- Dashboard adoption: 0% → 80%
- Ad-hoc report capability: Limited → Full

---

## 📈 Cross-Department Insights

### Common Themes

1. **Digital Transformation** (All Departments)
   - Move from manual to digital processes
   - Eliminate paper-based workflows
   - Real-time data availability

2. **Integration** (All Departments)
   - Need for system integration
   - Single source of truth
   - No duplicate data entry

3. **Mobile Access** (5/7 Departments)
   - Field teams need mobile apps
   - Real-time updates from field
   - Offline capability required

4. **Automation** (All Departments)
   - Automated workflows
   - Reduced manual intervention
   - Auto-generated reports

5. **Visibility** (All Departments)
   - Real-time dashboards
   - Performance metrics
   - Trend analysis

### Department Interdependencies

```
Distribution/Sales → Transport Operations → Vendor Management
                                         ↓
                                    QA/QC Operations
                                         ↓
                                 Accounts & Finance
                                         ↓
                                  MIS & Commercial
```

**Key Integration Points**:
1. Sales → Transport: Requisition to TO conversion
2. Transport → Vendor: Vehicle assignment
3. Transport → QC: QC clearance workflow
4. Transport → Finance: Cost tracking
5. All → MIS: Data consolidation and reporting

---

## 🎯 Priority Requirements by Department

| Department | P0 (Critical) | P1 (High) | P2 (Medium) |
|-----------|---------------|-----------|-------------|
| **Transport** | GPS tracking, Mobile app, Dashboard | Route optimization, Analytics | Predictive maintenance |
| **Procurement** | Digital bidding, Vendor portal | Performance tracking | Vendor intelligence |
| **Distribution** | Capacity validation, Integration | Delivery tracking | Customer portal |
| **QA/QC** | Mobile QC app, Digital workflow | Sample tracking | AI quality predictions |
| **Finance** | Real-time costing, Auto-reconciliation | ERP integration | Predictive cost analysis |
| **Commercial** | Contract management, SLA monitoring | Rate benchmarking | Contract analytics |
| **MIS** | Centralized data, Real-time dashboards | BI tools | Predictive analytics |

---

## 📚 Related Documents

- [Discovery Summary](./discovery-summary.md) - Overall discovery process
- [Pain Points](./pain-points.md) - Detailed pain point analysis
- [Expectations](./expectations.md) - Stakeholder expectations
- [User Stories](../03-features/) - How insights translate to features

---

**Last Updated**: February 2026  
**Status**: Complete  
**Departments Covered**: 7  
**Total Participants**: 30+  
**Session Duration**: 15+ hours total

