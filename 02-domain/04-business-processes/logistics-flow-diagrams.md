# Logistics Flow Diagrams

## 1. Complete Distribution Workflow

```mermaid
flowchart TB
    Start([Start]) --> PR[Product Requisition<br/>Created by Requester]

    PR --> Validate{Validate<br/>Stock & Rules}
    Validate -->|Invalid| Reject1[Rejected]
    Validate -->|Valid| DistApproval[Distribution<br/>Officer Review]

    DistApproval --> DistDecision{Approve?}
    DistDecision -->|No| Reject1
    DistDecision -->|Yes| MgrApproval[Manager<br/>Final Approval]

    MgrApproval --> MgrDecision{Approve?}
    MgrDecision -->|No| Reject1
    MgrDecision -->|Yes| TR[Transport<br/>Requisition Created]

    TR --> TO[Transport Order<br/>Generated]
    TO --> Assign[Assign Vehicle<br/>& Driver]

    Assign --> GateIn[Gate In<br/>Vehicle Entry]
    GateIn --> ScaleIn[Scale In<br/>Empty Weight]

    ScaleIn --> Queue[Queue Token<br/>Generation]
    Queue --> Command[Command Center<br/>Bay Assignment]

    Command --> Loading{Loading or<br/>Unloading?}
    Loading -->|Loading| LoadStart[Loading Start]
    Loading -->|Unloading| UnloadStart[Unloading Start]

    LoadStart --> LoadEnd[Loading Complete]
    UnloadStart --> UnloadEnd[Unloading Complete]

    LoadEnd --> QC1[Quality Control<br/>Physical Check]
    UnloadEnd --> QC1

    QC1 --> QCDecision{QC Pass?}
    QCDecision -->|Fail| QCFail[QC Failed<br/>Escalation]
    QCDecision -->|Pass| ScaleOut[Scale Out<br/>Loaded Weight]

    ScaleOut --> GateOut[Gate Out<br/>Vehicle Exit]
    GateOut --> Transit[In Transit<br/>GPS Tracking]

    Transit --> Delivery[Delivery at<br/>Destination]
    Delivery --> POD[Proof of Delivery<br/>Capture]

    POD --> TripClose[Trip Closure]
    TripClose --> Costing[Trip Costing<br/>Calculation]

    Costing --> End([End])
    Reject1 --> End
    QCFail --> End

    style PR fill:#e3f2fd
    style TR fill:#e8f5e9
    style TO fill:#fff3e0
    style QC1 fill:#ffebee
    style POD fill:#f3e5f5
    style Costing fill:#fce4ec
```

## 2. Vehicle Trip Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Available: Vehicle Ready

    Available --> Assigned: Assign to Trip
    Assigned --> GateIn: Arrive at Origin

    GateIn --> Weighing: Enter Premises
    Weighing --> Queued: Get Queue Token

    Queued --> Loading: Bay Assigned
    Loading --> QualityCheck: Loading Complete

    QualityCheck --> Failed: QC Fail
    QualityCheck --> Loaded: QC Pass
    Failed --> Loading: Retry

    Loaded --> GateOut: Exit Origin
    GateOut --> InTransit: Start Journey

    InTransit --> Arrived: Reach Destination
    Arrived --> Unloading: Start Unload

    Unloading --> Delivered: POD Captured
    Delivered --> TripComplete: Trip Closed

    TripComplete --> Available: Ready for Next

    InTransit --> Breakdown: Vehicle Issue
    Breakdown --> Maintenance: Send to Workshop
    Maintenance --> Available: Repaired
```

## 3. Multi-Stop Trip Flow

```mermaid
flowchart LR
    subgraph "Origin"
        O_Gate[Gate In]
        O_Scale[Scale In]
        O_Load[Loading]
        O_QC[QC Check]
    end

    subgraph "Stop 1"
        S1_Arrive[Arrive]
        S1_Deliver[Partial Delivery]
        S1_POD[POD Capture]
    end

    subgraph "Stop 2"
        S2_Arrive[Arrive]
        S2_Deliver[Partial Delivery]
        S2_POD[POD Capture]
    end

    subgraph "Final Destination"
        F_Arrive[Arrive]
        F_Deliver[Final Delivery]
        F_POD[POD Capture]
        F_Close[Trip Close]
    end

    O_Gate --> O_Scale
    O_Scale --> O_Load
    O_Load --> O_QC
    O_QC --> S1_Arrive

    S1_Arrive --> S1_Deliver
    S1_Deliver --> S1_POD
    S1_POD --> S2_Arrive

    S2_Arrive --> S2_Deliver
    S2_Deliver --> S2_POD
    S2_POD --> F_Arrive

    F_Arrive --> F_Deliver
    F_Deliver --> F_POD
    F_POD --> F_Close
```

## 4. Geofencing & GPS Tracking

```mermaid
flowchart TB
    subgraph "Vehicle Tracking"
        GPS[GPS Device]
        TRACK[Location Updates<br/>Every 30 seconds]
    end

    subgraph "Geofence Events"
        ORIGIN_FENCE[Origin Geofence]
        DEST_FENCE[Destination Geofence]
        ROUTE_FENCE[Route Deviation]
    end

    subgraph "System Actions"
        ENTRY[Log Entry Time]
        EXIT[Log Exit Time]
        ALERT[Send Alert]
        DWELL[Calculate Dwell Time]
    end

    subgraph "Notifications"
        SMS[SMS Alert]
        EMAIL[Email Alert]
        PUSH[Push Notification]
        DASHBOARD[Dashboard Update]
    end

    GPS --> TRACK
    TRACK --> ORIGIN_FENCE
    TRACK --> DEST_FENCE
    TRACK --> ROUTE_FENCE

    ORIGIN_FENCE -->|Enter| ENTRY
    ORIGIN_FENCE -->|Exit| EXIT
    DEST_FENCE -->|Enter| ENTRY
    DEST_FENCE -->|Exit| EXIT
    ROUTE_FENCE -->|Deviation| ALERT

    ENTRY --> DWELL
    EXIT --> DWELL
    ALERT --> SMS
    ALERT --> EMAIL
    ALERT --> PUSH

    DWELL --> DASHBOARD

    style GPS fill:#e1f5fe
    style ALERT fill:#ffcdd2
    style DASHBOARD fill:#c8e6c9
```

## 5. Quality Control Process

```mermaid
flowchart TD
    Start([QC Triggered]) --> Type{QC Type}

    Type -->|Loading| LoadQC[Loading QC]
    Type -->|Unloading| UnloadQC[Unloading QC]
    Type -->|Random| RandomQC[Random Check]

    LoadQC --> Physical[Physical Inspection<br/>- Package Condition<br/>- Count Verification<br/>- Label Check]
    UnloadQC --> Physical
    RandomQC --> Physical

    Physical --> PhyResult{Pass Physical?}
    PhyResult -->|No| Fail[QC Failed<br/>Create Issue]
    PhyResult -->|Yes| NeedLab{Lab Test<br/>Required?}

    NeedLab -->|No| Pass[QC Passed]
    NeedLab -->|Yes| LabSample[Collect Sample]

    LabSample --> LabTest[Lab Analysis<br/>- Moisture<br/>- Quality Grade<br/>- Contamination]

    LabTest --> LabResult{Lab Results<br/>Acceptable?}
    LabResult -->|No| Fail
    LabResult -->|Yes| Pass

    Pass --> UpdateTrip[Update Trip Status]
    Fail --> Escalate[Escalate to Manager]

    Escalate --> Decision{Manager<br/>Decision}
    Decision -->|Accept| Pass
    Decision -->|Reject| Reject[Reject Shipment]

    UpdateTrip --> End([QC Complete])
    Reject --> End

    style Physical fill:#fff3e0
    style LabTest fill:#e3f2fd
    style Pass fill:#c8e6c9
    style Fail fill:#ffcdd2
```

## 6. Gate Management Flow

```mermaid
sequenceDiagram
    participant D as Driver
    participant G as Gate Operator
    participant S as System
    participant W as Weighbridge
    participant C as Command Center

    D->>G: Arrive at Gate
    G->>S: Search Vehicle/Trip
    S-->>G: Trip Details

    alt First Entry
        G->>S: Gate In Entry
        S->>S: Record Entry Time
        S->>S: Generate Token
        S-->>G: Token Number
        G->>D: Provide Token

        D->>W: Proceed to Weighbridge
        W->>S: Record Empty Weight
        S->>C: Add to Queue
        C-->>D: Bay Assignment

    else Return Entry
        G->>S: Gate Out Entry
        S->>S: Record Exit Time

        D->>W: Loaded Vehicle
        W->>S: Record Loaded Weight
        S->>S: Calculate Net Weight

        G->>S: Final Clearance
        S->>S: Update Trip Status
        S-->>G: Exit Approved
    end

    G->>D: Allow Passage
```

## 7. Command Center Dashboard View

```mermaid
graph TB
    subgraph "Real-time Monitoring"
        subgraph "Vehicle Status"
            AVAIL[Available: 25]
            TRANSIT[In Transit: 45]
            LOADING[Loading: 12]
            MAINT[Maintenance: 3]
        end

        subgraph "Queue Management"
            WAIT[Waiting: 8]
            LOAD_BAY[Loading Bays: 5/10]
            UNLOAD_BAY[Unloading Bays: 3/8]
        end

        subgraph "GPS Tracking"
            MAP[Live Map View]
            ROUTES[Active Routes: 45]
            DELAYS[Delayed: 5]
            ETA[ETA Monitoring]
        end

        subgraph "Alerts & Issues"
            GEO_ALERT[Geofence Violations: 2]
            QC_FAIL[QC Failures: 1]
            BREAKDOWN[Breakdowns: 0]
            DELAY_ALERT[Delays > 2hrs: 3]
        end
    end

    subgraph "Actions"
        ASSIGN[Assign Bay]
        REROUTE[Reroute Vehicle]
        NOTIFY[Send Notification]
        ESCALATE[Escalate Issue]
    end

    WAIT --> ASSIGN
    DELAYS --> REROUTE
    GEO_ALERT --> NOTIFY
    QC_FAIL --> ESCALATE

    style AVAIL fill:#c8e6c9
    style TRANSIT fill:#fff3e0
    style DELAYS fill:#ffcdd2
    style MAP fill:#e1f5fe
```

## 8. Vendor Management Flow

```mermaid
flowchart LR
    subgraph "Vendor Onboarding"
        REG[Registration]
        DOC[Document<br/>Submission]
        VER[Verification]
        APP[Approval]
        ACT[Activation]
    end

    subgraph "Vehicle Management"
        ADD_VEH[Add Vehicles]
        VEH_DOC[Vehicle<br/>Documents]
        VEH_APP[Vehicle<br/>Approval]
    end

    subgraph "Driver Management"
        ADD_DRV[Add Drivers]
        DRV_DOC[Driver<br/>License & Docs]
        DRV_APP[Driver<br/>Approval]
    end

    subgraph "Operations"
        RECEIVE[Receive<br/>Trip Request]
        BID[Submit Bid]
        ASSIGN[Get Assignment]
        EXECUTE[Execute Trip]
        INVOICE[Submit Invoice]
    end

    REG --> DOC
    DOC --> VER
    VER --> APP
    APP --> ACT

    ACT --> ADD_VEH
    ADD_VEH --> VEH_DOC
    VEH_DOC --> VEH_APP

    ACT --> ADD_DRV
    ADD_DRV --> DRV_DOC
    DRV_DOC --> DRV_APP

    VEH_APP --> RECEIVE
    DRV_APP --> RECEIVE
    RECEIVE --> BID
    BID --> ASSIGN
    ASSIGN --> EXECUTE
    EXECUTE --> INVOICE
```

## 9. Approval Hierarchy

```mermaid
graph TD
    subgraph "Product Requisition Approval"
        PR_CREATE[Requester<br/>Creates PR]
        PR_L1[Distribution Officer<br/>Level 1 Approval]
        PR_L2[Distribution Manager<br/>Level 2 Approval]
        PR_FINAL[Approved PR]
    end

    subgraph "Transport Order Approval"
        TO_CREATE[Transport Planner<br/>Creates TO]
        TO_REVIEW[TDO Review]
        TO_APPROVE[Manager Approval]
        TO_FINAL[Approved TO]
    end

    subgraph "QC Escalation"
        QC_ISSUE[QC Failure]
        QC_SUPER[QC Supervisor<br/>Review]
        QC_MGR[Manager<br/>Decision]
        QC_FINAL[Final Decision]
    end

    PR_CREATE --> PR_L1
    PR_L1 -->|Approve| PR_L2
    PR_L1 -->|Reject| PR_CREATE
    PR_L2 -->|Approve| PR_FINAL
    PR_L2 -->|Reject| PR_CREATE

    TO_CREATE --> TO_REVIEW
    TO_REVIEW --> TO_APPROVE
    TO_APPROVE --> TO_FINAL

    QC_ISSUE --> QC_SUPER
    QC_SUPER --> QC_MGR
    QC_MGR --> QC_FINAL

    style PR_FINAL fill:#c8e6c9
    style TO_FINAL fill:#c8e6c9
    style QC_FINAL fill:#e1f5fe
```

## 10. Data Flow for Trip Costing

```mermaid
flowchart TD
    subgraph "Input Data"
        DISTANCE[Distance<br/>Calculated]
        FUEL[Fuel<br/>Consumption]
        TOLL[Toll<br/>Charges]
        LABOR[Driver &<br/>Helper Cost]
        VEHICLE[Vehicle<br/>Type Rate]
    end

    subgraph "Cost Calculation"
        BASE[Base Cost<br/>Distance × Rate]
        VAR[Variable Cost<br/>Fuel + Toll]
        FIXED[Fixed Cost<br/>Labor + Overhead]
    end

    subgraph "Output"
        TOTAL[Total<br/>Trip Cost]
        PROFIT[Profit<br/>Margin]
        INVOICE[Invoice<br/>Amount]
    end

    DISTANCE --> BASE
    VEHICLE --> BASE
    FUEL --> VAR
    TOLL --> VAR
    LABOR --> FIXED

    BASE --> TOTAL
    VAR --> TOTAL
    FIXED --> TOTAL

    TOTAL --> PROFIT
    PROFIT --> INVOICE

    style TOTAL fill:#fff3e0
    style INVOICE fill:#c8e6c9
```

---

## Legend

### Colors Used in Diagrams
- 🟦 **Blue** (#e3f2fd): Input/Initial stages
- 🟩 **Green** (#c8e6c9): Success/Approved states
- 🟨 **Yellow** (#fff3e0): Processing/In-progress
- 🟥 **Red** (#ffcdd2): Failure/Alert states
- 🟪 **Purple** (#f3e5f5): External systems/Special processes
- 🟧 **Orange** (#ffe0b2): Intermediate stages

### Shapes
- **Rectangle**: Process/Action
- **Diamond**: Decision point
- **Circle**: Start/End point
- **Parallelogram**: Input/Output
- **Cylinder**: Database/Storage