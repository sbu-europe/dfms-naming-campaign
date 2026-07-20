# Tenant Approval (Admin Portal)

**Module:** Vendor Management — Vendor Approval (Tenant Admin)  
**Scope:** Tenant admin web portal — **not vendor mobile app**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_108 | Pending join request visible | Tenant Admin sees vendor in Vendors list with Join Status = Pending. | High | Tenant Admin | Manual | — | |
| TC_109 | Documents visible to admin | Trade License, BIN, TIN, Truck Association Reference viewable before approval. | High | Tenant Admin | Manual | — | |
| TC_110 | Approval type options | Contractual and Non-Contractual options available. | Critical | Tenant Admin | Manual | — | |
| TC_111 | Approve Non-Contractual | Select Non-Contractual → Approve → Join Status = Approved; eligible for bidding. | Critical | Tenant Admin | Manual | — | |
| TC_112 | Approve Contractual | Select Contractual → Approve → Join Status = Approved; directly assignable without bidding. | Critical | Tenant Admin | Manual | — | |
| TC_113 | Reject with remarks | Reject without remarks blocked; with remarks succeeds; vendor notified. | High | Tenant Admin | Manual | — | |
| TC_114 | Resubmit after rejection | Rejected vendor can update info and resubmit → re-enters pending queue. | High | Mixed | Manual | — | Admin + vendor app |
| TC_115 | Non-Contractual no direct assign | Non-Contractual vendor cannot be directly assigned to TO without bidding. | Critical | TDO | Manual | — | |
| TC_116 | Contractual no bidding UI | Contractual vendor not shown bidding/price entry; rate applied from backend. | Critical | Mixed | Manual | — | Vendor app should hide bid price |
| TC_118 | Audit log | Approve/reject actions logged with Tenant Admin ID, vendor ID, contract type, timestamp. | High | Tenant Admin | Manual | — | Skip |

## Vendor app dependency

TC_111/TC_112 must be executed in admin before vendor-app bid/TO/trip tests can run for that account.
