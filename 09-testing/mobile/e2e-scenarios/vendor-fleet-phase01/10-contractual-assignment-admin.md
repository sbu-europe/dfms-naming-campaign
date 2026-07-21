# Contractual Vendor — TO Assignment (Admin)

**Module:** Vendor Management — Contractual Vendor TO Assignment  
**Scope:** Vendor Fleet TDO — **admin portal**  
**Status policy:** All rows **Manual** unless noted for vendor-app visibility.

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_173 | Assign TO-004 | TDO selects TO-004 → Assign TO. | High | TDO | Manual | — | Admin portal |
| TC_174 | Contractual option available | Contractual + Non-Contractual Bidding options. | High | TDO | Manual | — | |
| TC_175 | Contractual vendor dropdown | Only Contractual vendors listed. | Critical | TDO | Manual | — | |
| TC_176 | Direct assign no bidding | Assign without bidding step. | Critical | TDO | Manual | — | |
| TC_177 | Rate hidden from vendor | Rate not shown on vendor app. | Critical | Vendor App | Not Started | — | Maestro assert after assign |
| TC_178 | Status after assign | Assigned / Awaiting Vendor Confirmation. | Critical | TDO | Manual | — | |
| TC_179 | Audit log | Assignment logged. | Medium | TDO | Manual | — | Skip |
| TC_183 | Contractual confirm audit | Confirmation logged. | Low | Backend | Manual | — | Skip |
| TC_184 | Vendor Confirmed sub-state | After confirm, Vendor Confirmed. | High | TDO | Manual | — | |
| TC_185 | Ready for Dispatch contractual | Ready for Dispatch for TO-004. | Critical | TDO | Manual | — | |

## Admin gate (Wave E)

1. Approve Contractual vendor (TC_112).
2. Direct-assign TO-004 (TC_176).
3. Run Maestro contractual TO/trip cases in `08` / `09`.
