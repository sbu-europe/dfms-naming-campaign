# TO Creation — Vendor Fleet (Batch)

**Module:** Transport Order (TO) Management  
**Scope:** Transport Planner / backend — **not automatable on vendor mobile app**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_075 | Multiple TOs per TR | Verify multiple TOs can be created against the same TR without vehicle-count restriction. Precondition: TR approved with Number of Vehicles = 4. Create 4 TOs (Vendor Fleet), then attempt 5th/6th — all allowed while quantities remain within TR. | Critical | TP | N/A | — | |
| TC_076 | Exact batch count | Verify system creates exactly the number of TOs specified (e.g. 3) in one submission with unique IDs. | Critical | TP | N/A | — | |
| TC_077 | Fleet type & status | Verify all created TOs carry Fleet Type = Vendor Fleet and Status = Created. | Critical | TP | N/A | — | |
| TC_078 | Planned delivery date | Verify Planned Delivery Date/Time is applied consistently across all TOs in the batch. | High | TP | N/A | — | |
| TC_079 | Quantity cap | Verify combined allocated quantity across batch TOs cannot exceed TR remaining quantity. | Critical | TP | N/A | — | |
| TC_080 | TDO queue routing | Verify Vendor Fleet TOs appear in TDO (Vendor Fleet) queue, not Own Fleet TDO queue. | Critical | TDO | N/A | — | |
| TC_081 | Invalid TO count | Verify creating 0 or negative number of TOs is rejected. | Medium | TP | N/A | — | |
| TC_082 | Audit log | Verify batch TO creation is recorded in Audit Log with TP ID and all generated TO IDs. | Medium | TP | Manual | — | Skip |
| TC_202 | Independent TO records | Verify TOs from same TR are saved as independent records (unique IDs, individual status), not bundled. | High | TP | N/A | — | |

## Vendor app impact

These cases establish backend data (TO-002, TO-003, TO-004) used by downstream vendor-app tests for bids, TO confirmation, and trips. Seed via admin/TP before running mobile Maestro flows.
