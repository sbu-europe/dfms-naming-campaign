# Contractual Vendor — TO Assignment (Admin)

**Module:** Vendor Management — Contractual Vendor TO Assignment  
**Scope:** Vendor Fleet TDO — **admin portal**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_173 | Assign TO-004 | TDO selects TO-004 and clicks Assign TO. | High | TDO | Manual | — | |
| TC_174 | Contractual option available | Assign TO shows Contractual and Non-Contractual Bidding options. | High | TDO | Manual | — | |
| TC_175 | Contractual vendor dropdown | Only Contractual-approved vendors listed. | Critical | TDO | Manual | — | |
| TC_176 | Direct assign no bidding | Select Contractual vendor → assign without bidding step. | Critical | TDO | Manual | — | |
| TC_177 | Rate hidden from vendor | Contractual rate applied in backend; not shown on vendor app. | Critical | Vendor App | Not Started | — | Verify on mobile |
| TC_178 | Status after assign | TO-004 Status = Assigned; sub-state = Awaiting Vendor Confirmation. | Critical | TDO | Manual | — | |
| TC_179 | Audit log | Contractual assignment logged with TDO ID, vendor ID, timestamp. | Medium | TDO | Manual | — | Skip |
| TC_183 | Contractual confirm audit | Contractual vendor confirmation logged. | Low | Backend | Manual | — | Skip |
| TC_184 | Vendor Confirmed sub-state | After contractual vendor confirms, TDO sees sub-state = Vendor Confirmed. | High | TDO | Manual | — | |
| TC_185 | Ready for Dispatch contractual | TDO clicks Ready for Dispatch for TO-004 → status Ready for Dispatch. | Critical | TDO | Manual | — | |

## Vendor app follow-up

After TC_176/TC_178, run vendor-app cases in [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) (TC_180–TC_182) and [09-trips-vendor-app.md](./09-trips-vendor-app.md) (TC_186–TC_187).
