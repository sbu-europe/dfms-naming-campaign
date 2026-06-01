---
jira_key: DFS-054
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: GT-01
title: Gate — Gate-In, Gate-Out & Remarks
epic: Gate Operations
status: Carry-over
story_points: 8
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - GT-01-3
  - GT-01-9
  - GT-01-10
  - GT-01-11
  - GT-01-14
source: ../../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md
---

# GT-01 — Gate-In, Gate-Out & Remarks (Sprint 5 Carry-over)

> **Full story context, business rules, document category routing, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/04-gate/GT-01-gate-in-out-remarks.md`](../../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| GT-01-3 | `GateInAdmin` — complete document category routing logic; inline for gate-in items (product, quantity) | DFS-054-3 | Partial | Wire document category to operational flow routing (AC-2): `Internal Transfer → TO-Linked Workflow` active; `Supplier` and `Dealer` paths behind feature flag | High |
| GT-01-9 | TLS-01 event emission — `GATE_IN` / `GATE_OUT` events on save | DFS-054-9 | Partial | Complete TLS-01 timeline event emission in `GateInService` and `GateOutService`; verify events visible on `GET …/timeline` | High |
| GT-01-10 | Gateman UI — fast-entry gate-in form (vehicle reg, TO lookup, document category, remarks) | DFS-054-10 | Partial | Complete frontend gate-in form; ensure vehicle registration lookup and TO number autocomplete are functional; document category dropdown routes correctly | High |
| GT-01-11 | Gateman UI — gate-out form with guard status indicators | DFS-054-11 | Partial | Complete gate-out form; show guard matrix status (scale-out, loading/unloading complete flags) visually before allowing submit | High |
| GT-01-14 | E2E test coverage | ~ | Pending | Validate source/destination gate-in, gate-out guards (all three flow types), discrepancy remarks, TLS-01 timeline events | Medium |

---

## Open AC Items (from Sprint 4 DoD)

- [ ] Document category captured at gate-in and determines downstream routing; Internal Transfer active; Dealer/Supplier behind feature flag (GT-01-3 / AC-2)
- [ ] Gate events emit `GATE_IN` / `GATE_OUT` timeline events to TLS-01 with timestamps (GT-01-9 / AC-5)
- [ ] UAT: vehicle arrives → gate-in → scale-in → … → gate-out happy path completes end-to-end
- [ ] Unit tests: gate-out guard rules for FG outbound, FG inbound, RM inbound
- [ ] Gateman can only operate within their assigned POI; unauthorised POI access returns 403

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Document category routing complete; Internal Transfer → TO-Linked active; Supplier/Dealer feature-flagged (GT-01-3)
- [ ] `GATE_IN` and `GATE_OUT` TLS-01 events emitted with timestamps (GT-01-9)
- [ ] Gate-in form fast-entry complete with TO number autocomplete (GT-01-10)
- [ ] Gate-out form shows guard status indicators before submit (GT-01-11)
- [ ] E2E sub-task GT-01-14 passes in staging

---

*Sprint 4 completion: ~70% | Sprint 5 target: 100% | Jira: DFS-054*
