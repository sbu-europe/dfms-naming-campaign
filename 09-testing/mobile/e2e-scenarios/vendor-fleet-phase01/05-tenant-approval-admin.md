# Tenant Approval (Admin Portal)

**Module:** Vendor Management — Vendor Approval (Tenant Admin)  
**Scope:** Tenant admin web portal — **not vendor mobile app**  
**Status policy:** All rows **Manual** (or Playwright admin e2e when available). Not Maestro.

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_108 | Pending join request visible | Tenant Admin sees vendor with Join Status = Pending. | High | Tenant Admin | Manual | — | Run in admin portal |
| TC_109 | Documents visible to admin | Trade License, BIN, TIN, Truck Association viewable. | High | Tenant Admin | Manual | — | |
| TC_110 | Approval type options | Contractual and Non-Contractual options available. | Critical | Tenant Admin | Manual | — | |
| TC_111 | Approve Non-Contractual | Approve → Join Status = Approved; eligible for bidding. | Critical | Tenant Admin | Manual | — | Also covered by `make seed-vendor-mobile` for fixtures |
| TC_112 | Approve Contractual | Approve Contractual → directly assignable. | Critical | Tenant Admin | Manual | — | |
| TC_113 | Reject with remarks | Reject requires remarks. | High | Tenant Admin | Manual | — | |
| TC_114 | Resubmit after rejection | Rejected vendor can update and resubmit. | High | Mixed | Manual | — | |
| TC_115 | Non-Contractual no direct assign | Must go through bidding. | Critical | TDO | Manual | — | |
| TC_116 | Contractual no bidding UI | Rate applied from backend; hidden on vendor app. | Critical | Mixed | Manual | — | |
| TC_118 | Audit log | Approve/reject logged. | High | Tenant Admin | Manual | — | Skip |

## Admin gate for Maestro

Before Waves B–D mobile runs, ensure Non-Contractual approval for `VENDOR_EMAIL` (or run `make seed-vendor-mobile`).
