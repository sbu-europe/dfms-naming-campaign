---
sprint: Sprint 4
title: Own-Fleet TO Execution - Supervisor, Driver, Yard (Gate & Scale), Command Center, POD
phase: phase-1
start_date: ~
end_date: ~
total_story_points: 83
status: Planned
jira_board: https://your-org.atlassian.net/jira/software/projects/DFS/boards
---

# Sprint 4 — Own-Fleet Yard & Field Execution (TO-Centric)

> Full sprint backlog with stories, sub-tasks, and PRD traceability.  
> **Vendor fleet, vendor portal, and non-contractual bidding remain out of scope** for this sprint narrative (own-fleet FG / Port execution thread only).

## Sprint boundary (contract with Sprint 3)


| Sprint 3 **ends with**                                                                                    | Sprint 4 **starts from**                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TO created; **vehicle, driver, helper, ETA** assigned (TO-02); TDO may set TO to `**Ready for Dispatch`** | **Pre-movement compliance** (supervisor), **driver TO list & execution milestones**, **yard chain** (gate → scale → queue → load/unload), **§6.8.5 execution + yard + closure substates** (TLS-01), **POD / closure** |


**Do not re-implement** PRD §6.8.1.4 *TO Execution – Own Fleet (TDO assignment)* — that is TO-02.

**No separate Trip record in Sprint 4:** all operational events, yard steps, driver actions, and POD attach to the **Transport Order (TO)** created in Sprint 3. When TDO sets `**Ready for Dispatch`**, the TO becomes **visible to the assigned driver** for execution (DM-01). **§6.8.1.7** (fleet availability validation) is enforced on **first driver execution action** (e.g. marking execution started) unless an earlier hook is agreed in technical design.

**Out of Sprint 4 backlog (deferred):** live **map / GPS / location** features (PRD §6.8.2 map layer & related); **§6.8.8 trip costing** — add in a later backlog tranche. **QA/E2E ticket** for this sprint is **removed** until stories are finalized.

## PRD Phase 1 spine (this sprint)


| Theme                                                     | PRD refs                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Driver Supervisor / crew                                  | §6.6.1.2; §6.6.3.3–§6.6.3.4 *(supervisor-led operational data — not master-data duplication of §6.6.3.1 / §6.6.3.6 or TDO assignment §6.6.3.2 / §6.6.3.7)*                                                                                                                                                                |
| TO lifecycle & execution                                  | §6.8.1.7; §6.8.5 (**execution + yard + closure substates** — Sprint 4 scope); §6.8.7; §7.1.9 *(tracking against TO; no separate trip entity in implementation)*                                                                                                                                                           |
| Driver mobile                                             | §6.16.1.1 + **Mobile Interface Requirements** → Driver Mobile (**map, navigation, background GPS deferred** out of Sprint 4; offline-safe read + POD capture in scope per DM-01)                                                                                                                                          |
| Gate                                                      | §6.10.1; §6.10.3; §6.10.4; **§6.10.2.1–§6.10.2.2** (on-demand TO at gate)                                                                                                                                                                                                                                                 |
| Scaling                                                   | §6.11.1–§6.11.3                                                                                                                                                                                                                                                                                                           |
| Command Center + load / unload ops                        | §6.5.1 (POI as site for CC/LU context); §6.12.1; §6.12.2; §6.12.4; §6.13.1; §6.14.1; §6.14.2                                                                                                                                                                                                                              |
| Raw-material sampling & QC decision (Sprint 4 simplified) | §6.15.1.2 (sample creation); §6.15.4.1 (QC Pass/Fail/Auto-Pass tracking) — implemented as **yes/no QC outcome only** in Sprint 4 (no physical/lab branch workflow)                                                                                                                                                        |
| Explicitly **not** Sprint 4 backlog                       | §6.8.2 live map dashboard; §6.8.8 costing; §6.6.1.3 (fleet health dashboard — P2); §6.6.2.x fuel (P2); §6.6.3.5 driver performance (P3); §6.8.3 calendar dispatch (P2); §6.8.4 TR conjoinment (P2); §6.8.6 incident / re-delivery (P2); §6.12.3 / §6.13.2 **push** notifications (P3 — use **in-app** visibility instead) |


## Development flow (recommended build order)

Stories are **numbered for dependency flow**, not menu order.

```
Wave A — Crew & compliance (parallel with early TLS stub)
  DS-01 → DS-02

Wave B — TLS-01 state machine (§6.8.5 extensions) + TO Ready for Dispatch → driver eligibility
  TLS-01   (execution + yard + closure substates; event ingest from yard + driver)

Wave C — Driver field channel (no map / GPS in Sprint 4)
  DM-01   (§6.16.1.1 — TO list when Ready for Dispatch; milestones; POD)

Wave D — Yard chain (outbound + inbound)
  LUP-01 (loading/unloading **points** per POI — can start once POI exists; before first CC assignment)
  GT-02 (on-demand TO when no planner TO) → GT-01 → SC-01 → CC-01 → LD-01
  Finished-goods inbound path (e.g., Port Consignment TO from planner): after **CC-01 unloading-point assignment** and unload capture (LD-01), proceed to closure gate in POD-01 (QC optional per policy)
  Raw-material path: after **CC-01 unloading-point assignment** and unload capture (LD-01), run **QC-01** (sampling + QC yes/no), then proceed to closure gate in POD-01
  (planner TO path: skip GT-02)

Wave E — Closure
  POD-01  (depends on DM-01 + TLS-01 + destination unload path + GT-01 gate-out)
```

---

## Epic: Driver Supervisor & Crew Operations

> **Fleet → TO readiness**: licence / health / handover checklists; driver **state** and **manual attendance**; **On Leave** maintenance. Does **not** replace MDM driver/vehicle records (Sprint 2) or TDO assignment (Sprint 3).


| #   | Story                                                                                                                     | Task ID | Jira    | SP  | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ------- | ------- | --- | ------- |
| 1   | [Vehicle licence, health & handover checklists](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | DS-01   | DFS-050 | 5   | Pending |
| 2   | [Driver state, attendance & leave (supervisor)](01-driver-supervisor/DS-02-driver-state-attendance-leave.md)              | DS-02   | DFS-051 | 5   | Pending |


**Sub-total**: 10 SP

---

## Epic: Driver Mobile (Phase 1 — no map / location)

> Responsive web **or** dedicated mobile shell — single driver identity; **assigned TOs only**. **Map, turn-by-turn navigation, and background GPS are not in Sprint 4.**


| #   | Story                                                                                                         | Task ID | Jira    | SP  | Status  |
| --- | ------------------------------------------------------------------------------------------------------------- | ------- | ------- | --- | ------- |
| 1   | [TO list, execution milestones & POD capture](03-driver-mobile/DM-01-driver-mobile-to-list-milestones-pod.md) | DM-01   | DFS-053 | 8   | Pending |


**Sub-total**: 8 SP

---

## Epic: Gate Operations

> Gate-in / gate-out / remarks for **TO-linked internal transfer** (and other document categories per PRD); supports **source and destination** POIs. **On-demand TO** for dealer DO and supplier PO per **§6.10.2.1–§6.10.2.2**.


| #   | Story                                                                                          | Task ID | Jira    | SP  | Status  |
| --- | ---------------------------------------------------------------------------------------------- | ------- | ------- | --- | ------- |
| 1   | [Gate-in, gate-out & discrepancy remarks](04-gate/GT-01-gate-in-out-remarks.md)                | GT-01   | DFS-054 | 8   | Pending |
| 2   | [On-demand TO creation — Dealer DO & Supplier PO](04-gate/GT-02-on-demand-to-creation-gate.md) | GT-02   | DFS-062 | 8   | Pending |


**Sub-total**: 16 SP

---

## Epic: Scaling / Weighing


| #   | Story                                                                                         | Task ID | Jira    | SP  | Status  |
| --- | --------------------------------------------------------------------------------------------- | ------- | ------- | --- | ------- |
| 1   | [Scale-in, queue token (P.C. code) & scale-out](05-scaling/SC-01-scale-in-out-queue-token.md) | SC-01   | DFS-055 | 8   | Pending |


**Sub-total**: 8 SP

---

## Epic: Command Center & Loading / Unloading

> **§6.12.3** push notifications → **out of scope**; Command Center and bay crews see assignments via **live queue UI** and **TO** context. **Loading/unloading points** are sub-locations **under a POI** (PRD §6.12.2); they are defined in **LUP-01** and referenced through assignment and LD-01 timestamps.


| #   | Story                                                                                                                          | Task ID | Jira    | SP  | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------- | ------- | --- | ------- |
| 1   | [Loading & unloading points — create & maintain per POI](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | LUP-01  | DFS-063 | 5   | Pending |
| 2   | [Queue monitoring, bay assignment & waiting serial](06-command-center-loading/CC-01-queue-assign-serial.md)                    | CC-01   | DFS-056 | 8   | Pending |
| 3   | [Load / unload start–end capture (E2E)](06-command-center-loading/LD-01-load-unload-timestamps.md)                             | LD-01   | DFS-057 | 5   | Pending |


**Sub-total**: 18 SP

---

## Epic: Lifecycle & POD


| #   | Story                                                                                                                                     | Task ID | Jira    | SP  | Status  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- | --- | ------- |
| 1   | [TO lifecycle — execution, yard & closure substates (+ audit)](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | TLS-01  | DFS-059 | 13  | Pending |
| 2   | [TO closure — POD & gate-out linkage](07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md)                              | POD-01  | DFS-060 | 5   | Pending |
| 3   | [Raw-material QC — sampling & pass/fail decision](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md)                 | QC-01   | DFS-064 | 5   | Pending |


**Sub-total**: 23 SP

---

## Epic: Vendor Management (Planning Context)

> Adds Sprint 4 backlog context for vendor onboarding, verification, tenant join, portal, bidding, and post-award submission. This does **not** change the Trip Execution delivery scope above; it provides vendor-management backlog context in the same sprint folder for planning and sequencing.

**Vendor mobile app context (from Sprint 4)**:

- `[08-vendor-management/VENDOR-MOBILE-CONTEXT.md](08-vendor-management/VENDOR-MOBILE-CONTEXT.md)`


| #   | Story / Context                                                                                                                   | Task ID | Jira | SP  | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- | --- | ------- |
| 1   | [Vendor Onboarding Entry (Self-registration + Invite)](08-vendor-management/VM-01-vendor-onboarding-entry.md)                     | VM-01   | ~    | ~   | Pending |
| 2   | [Compliance Docs + Reference + Multi-vehicle Profile](08-vendor-management/VM-02-compliance-docs-and-profile.md)                  | VM-02   | ~    | ~   | Pending |
| 3   | [Platform Verification Queue + Approve/Reject + Resubmission](08-vendor-management/VM-03-admin-verification-workflow.md)          | VM-03   | ~    | ~   | Pending |
| 4   | [Vendor Portal Views + Visibility Rules](08-vendor-management/VM-04-vendor-portal-views.md)                                       | VM-04   | ~    | ~   | Pending |
| 5   | [Vendor ↔ Tenant Join Requests + Tenant Approval](08-vendor-management/VM-09-vendor-tenant-join-and-approval.md)                  | VM-09   | ~    | ~   | Pending |
| 6   | [TDO Publish TO to Bidding Portal (deadline + eligibility + notify)](08-vendor-management/VM-10-tdo-publish-to-bidding-portal.md) | VM-10   | ~    | ~   | Pending |
| 7   | [Bid Submission (windows + edit/withdraw + late-bid prevention)](08-vendor-management/VM-05-bid-submission.md)                    | VM-05   | ~    | ~   | Pending |
| 8   | [TDO Bid Evaluation (compare + award/reject-all + winning log)](08-vendor-management/VM-08-bid-evaluation.md)                     | VM-08   | ~    | ~   | Pending |
| 9   | [Vehicle & Driver Submission After Award + Audit Trail](08-vendor-management/VM-06-vehicle-driver-submission.md)                  | VM-06   | ~    | ~   | Pending |
| 10  | [Real-time TO Updates in Vendor Portal](08-vendor-management/VM-07-realtime-to-updates.md)                                        | VM-07   | ~    | ~   | Pending |


---

## QA & Testing

> No QA / E2E backlog item is defined in Sprint 4 yet. Add Playwright (or project-standard) coverage **after** stories are finalized. When added, reference: TO-centric execution (no Trip record), yard chain (GT → SC → CC → LD), TLS-01 §6.8.5 substates, and POD-01 closure — **without** map/GPS or §6.8.8 costing unless those are pulled into scope in a later sprint.

## End-to-End flow this sprint delivers (Own Fleet, TO from Sprint 3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SUPERVISOR / COMPLIANCE (Sprint 4)                                          │
│  Handover checklist (§6.6.1.2) + driver attendance / leave (§6.6.3.3–4)     │
└───────────────────────────────┬───────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TDO / SPRINT 3 HANDOFF                                                      │
│  TO **Ready for Dispatch** → same TO visible to assigned driver (DM-01);      │
│  §6.8.5 substates progressed via TLS-01 (+ §6.8.1.7 on first driver action)     │
└───────────────────────────────┬───────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DRIVER APP (§6.16.1.1 — no map/GPS backlog in Sprint 4)                    │
│  My **TOs** → execution milestones; POD capture linked to **TO**              │
└───────────────────────────────┬───────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  YARD: [GT-02 on-demand TO if needed] Gate (§6.10) → Scale-in (§6.11.1) → …   │
│  **L/U points (LUP-01)** → Command Center assign point + serial (§6.12) →     │
│  FG outbound: load path; FG inbound (Port/internal): unload path; RM inbound:  │
│  unload + QC-01 sampling + QC yes/no (§6.14.2 + §6.15.4.1 simplified)         │
│  → Scale-out → Gate-out                                                         │
└───────────────────────────────┬───────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLOSE                                                                       │
│  TLS-01 timeline + KPIs (§6.8.5); POD + gate-out (+ QC checkpoint for RM flow)│
│  (§6.8.7 / §6.14.2 / §6.15.4.1 simplified) — **no §6.8.8** costing in Sprint 4│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Dependency map

```
Sprint 3: TO-01, TO-02 (assigned; TDO may set Ready for Dispatch)
    │
    ├──► DS-01, DS-02 (can start early; optional gate on driver execution per policy)
    │
    ├──► TLS-01 (§6.8.5 execution + yard + closure substates)
    │         └──► DM-01 (driver TO list & milestones)
    │         └──► yard + POD-01
    │
    ├──► GT-02 (gate-created TO) → TDO assignment as needed — gate path when no planner TO
    │
    ├──► LUP-01 → GT-01 → SC-01 → CC-01 → LD-01
    │         ├──► FG outbound / FG inbound closure path (POD-01 rules)
    │         └──► QC-01 (raw-material checkpoint) → POD-01
    │
    └──► POD-01 (after DM-01 + TLS-01 + LD/GT path as applicable)

Vendor Onboarding (VM-01/02/03)          ──→  Tenant Join (VM-09)
Tenant Join (VM-09)                      ──→  Vendor Portal Visibility + Bidding (VM-04/05/08)
Bid Award (VM-08)                        ──→  Vehicle/Driver Submission (VM-06)
Transport Order status changes            ──→  Vendor Portal TO Updates (VM-07)
```

**Prerequisites from earlier sprints**: MDM POI / vehicle / driver / helper / route (Sprint 2); TR → TO → assignment (Sprint 3). **LUP-01** extends each POI with operational load/unload **points** used by Sprint 4 yard apps.

## Menu structure & role access (Sprint 4 additions)


| Area                                                                                  | Roles                                  | Purpose                                                                                      |
| ------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Fleet / Driver Supervisor** *(exact menu TBD — may live under Fleet or Operations)* | `driver_supervisor`                    | Checklists, attendance, leave, vehicle Under Maintenance from handover                       |
| **Transport**                                                                         | Planner, TDO, Driver                   | TDO sets **Ready for Dispatch**; driver **my TOs**                                           |
| **Gate**                                                                              | `gateman`                              | Gate-in / gate-out / remarks; **on-demand TO** (Dealer DO / Supplier PO)                     |
| **Scaling / Weighbridge**                                                             | `scaling_operator`                     | Scale-in, token, scale-out                                                                   |
| **Command Center**                                                                    | `command_center_officer`               | Post-scale queue, **assignment to POI loading/unloading point** (see LUP-01), waiting serial |
| **Loading / Unloading**                                                               | Loading / unloading personnel          | Start–end timestamps at **assigned point**, bags, weight, seal (load)                        |
| **Master / POI**                                                                      | `tenant_admin` (or same as POI master) | **LUP-01**: create/load/edit **L/U points** under each POI                                   |


> Portal keys and permission codes to be added in implementation (`portal_navigation.py`, `constants_rbac.py`) when stories are pulled into development.

## Demo feedback

> No demo feedback recorded for Sprint 4 yet. Log: `[feedback.md](feedback.md)`

---

## Notes

- **Incident / halt / re-delivery** (§6.8.6) is **Phase 2** — do not scope into TLS-01 beyond documenting a future hook.  
- **§6.8.8 Trip costing** is **not** in Sprint 4 backlog — track for a later sprint.  
- **Unloading personnel** fields in §6.8.7 overlap **LD-01** at destination; **POD-01** ties driver app POD + **TO** closure rules.
- `QC-01` owns Sprint 4 raw-material QC gate after unloading assignment/capture: sampling event + `QC Passed` yes/no only. Detailed physical/lab sub-workflows from §6.15 remain for a later sprint.

---

## Sprint 4 folder index (all docs in this sprint)

Use this as the canonical entry point for everything under `04-backlog/sprints/sprint-4/`.

### Core sprint docs

- [Sprint 4 README (this file)](README.md)
- [Demo feedback log](feedback.md)

### Story packs (by folder)

- **Driver supervisor**
  - [DS-01 — Vehicle licence, health & handover checklists](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md)
  - [DS-02 — Driver state, attendance & leave](01-driver-supervisor/DS-02-driver-state-attendance-leave.md)

- **Dispatch / Trip (removed)**
  - [Dispatch note (why removed; TO-centric handoff)](02-dispatch-trip/README.md)

- **Driver mobile**
  - [DM-01 — Driver TO list, milestones & POD capture](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md)

- **Gate**
  - [GT-01 — Gate-in, gate-out & discrepancy remarks](04-gate/GT-01-gate-in-out-remarks.md)
  - [GT-02 — On-demand TO creation (Dealer DO / Supplier PO)](04-gate/GT-02-on-demand-to-creation-gate.md)

- **Scaling**
  - [SC-01 — Scale-in, queue token & scale-out](05-scaling/SC-01-scale-in-out-queue-token.md)

- **Command center & loading/unloading**
  - [LUP-01 — Loading/unloading points per POI](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md)
  - [CC-01 — Queue monitoring, bay assignment & waiting serial](06-command-center-loading/CC-01-queue-assign-serial.md)
  - [LD-01 — Load/unload timestamps](06-command-center-loading/LD-01-load-unload-timestamps.md)

- **Lifecycle & POD**
  - [TLS-01 — Execution + yard + closure substates (+ audit)](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md)
  - [POD-01 — Closure, POD & gate-out linkage](07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md)
  - [QC-01 — Raw-material sampling & pass/fail decision](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md)

- **Vendor management (planning context)**
  - [Vendor management index](08-vendor-management/README.md)
  - [Vendor mobile context](08-vendor-management/VENDOR-MOBILE-CONTEXT.md)
  - [VM-01 — Vendor onboarding entry](08-vendor-management/VM-01-vendor-onboarding-entry.md)
  - [VM-02 — Compliance docs & profile](08-vendor-management/VM-02-compliance-docs-and-profile.md)
  - [VM-03 — Admin verification workflow](08-vendor-management/VM-03-admin-verification-workflow.md)
  - [VM-04 — Vendor portal views](08-vendor-management/VM-04-vendor-portal-views.md)
  - [VM-05 — Bid submission](08-vendor-management/VM-05-bid-submission.md)
  - [VM-06 — Vehicle/driver submission after award](08-vendor-management/VM-06-vehicle-driver-submission.md)
  - [VM-07 — Realtime TO updates](08-vendor-management/VM-07-realtime-to-updates.md)
  - [VM-08 — Bid evaluation](08-vendor-management/VM-08-bid-evaluation.md)
  - [VM-09 — Vendor ↔ tenant join & approval](08-vendor-management/VM-09-vendor-tenant-join-and-approval.md)
  - [VM-10 — TDO publish TO to bidding portal](08-vendor-management/VM-10-tdo-publish-to-bidding-portal.md)

