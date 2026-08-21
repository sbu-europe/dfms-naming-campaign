# Award Admin, Dispatch & RBAC (TC_141–TC_147, TC_151–TC_156, TC_158–TC_160)

**Scope:** TDO award APIs, Ready for Dispatch gates, RBAC, audit skips.
**Source:** Phase01 admin extras.

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_141 | TDO view responded bids | TDO sees responded bids / comparison | TDO | **Pass** | Playwright tos | Pass |
| TC_142 | Award any vendor | Can award non-lowest | TDO | **Pass** | Playwright | Pass |
| TC_143 | Split awards | Different vendors per TO | TDO | **Pass** | Playwright | Pass |
| TC_144 | Award locked | Cannot re-award | TDO | **Pass** | Playwright | Pass |
| TC_145 | Close bid without award | Cancel/close open bid | TDO | **Pass** | Playwright | Pass |
| TC_146 | PARTIALLY_AWARDED | Session status after partial award | TDO | **Pass** | Playwright | Pass when multi-TO OPEN fixture seeded each run |
| TC_147 | Reject all bids for TO | Reject all with reason | TDO | **Pass** | Playwright | Pass |
| TC_151 | RFD gated on confirm | RFD only after Vendor Confirmed | TDO | **Pass** | Playwright | Pass |
| TC_152 | Own Fleet TDO blocked | Own Fleet actor blocked from VF actions | TDO | **Pass** | Playwright | Pass |
| TC_153 | VF TDO Own Fleet blocked | VF TDO cannot Own Fleet assign | TDO | **Pass** | Playwright | Pass |
| TC_154 | TP access restricted | TP no Bid Mgmt / Assign TO / RFD | TP | **Pass** | Playwright | Pass |
| TC_155 | Revoked vendor blocked | Suspended vendor cannot bid | TDO | **Pass** | Playwright | Pass |
| TC_156 | Early RFD blocked | confirm-vendor before confirm → 422 | TDO | **Pass** | Playwright | Pass |
| TC_158 | Bid publish audit | Bid publish audit log | TDO | **Skip** | — | PDF Skip |
| TC_159 | Award audit | Award / confirm audit logs | Backend | **Skip** | — | PDF Skip |
| TC_160 | Concurrent bid load | Concurrent bid submissions | Backend | **Skip** | — | Not Playwright |
