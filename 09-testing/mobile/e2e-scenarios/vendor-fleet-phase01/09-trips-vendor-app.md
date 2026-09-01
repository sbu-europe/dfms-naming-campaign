# Ready for Dispatch, Trips & Yard (TC_068–TC_082, TC_157)

**Source:** DFMS UAT — Ready for Dispatch and Tracks + Yard FG/RM.
**App label:** Trips (not Tracks).
**Yard FG/RM (TC_074–082):** largely **Skipped** / out of mobile automation scope.

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_068 | Admin Ready for Dispatch | Admin moves Submitted → Ready for Dispatch | Tenant Admin | **Pass** | Playwright | Pass |
| TC_069 | Trip visible after RFD | TO on Trips tab only after RFD | Vendor App | **Pass** | `trips/02_…` | Passed (Trips; PDF says Tracks) |
| TC_070 | Start trip from Trips | Start trip when Ready for Dispatch | Vendor App | **Pass** | `trips/04_…` | Passed |
| TC_071 | Start blocked early | Start unavailable before RFD | Vendor App | **Pass** | Playwright | Pass |
| TC_072 | Status Driving Towards Source | Start → Driving Towards Source | Vendor App | **Pass** | Playwright + Maestro | Pass |
| TC_073 | Planned schedule on Trips | Trips shows planned schedule after RFD | Vendor App | **Pass** | `trips/02_…` | Active trip detail shows Planned Schedule / Route |
| TC_074 | FG yard workflow | FG TO through full yard ops after start | Vendor App | **Skipped** | — | Full FG chain out of scope / Skip |
| TC_075 | Yard status realtime | Yard statuses realtime on Trips | Vendor App | **Skipped** | — | Out of scope |
| TC_076 | Auto-close after gate-out | TO auto-closes after dest gate-out | Vendor App | **Skipped** | — | Out of scope |
| TC_077 | No manual Complete Trip | App has no manual Complete/Close action | Vendor App | **Not Started** | — | Assert absence of CTA |
| TC_078 | Closed → Completed section | Closed TO under Completed | Vendor App | **Pass** | `trips/03_…` | Completed tab accessible; full yard auto-close remains Skipped elsewhere |
| TC_079 | In-progress → Pending | In-progress stays under Pending/Active | Vendor App | **Pass** | `trips/02_…` | In-progress stays under Active (not Completed) |
| TC_080 | RM QC-gated workflow | RM TO follows QC-gated yard path | Vendor App | **Skipped** | — | Out of scope |
| TC_081 | RM auto-close | RM TO auto-closes after final stage | Vendor App | **Skipped** | — | Out of scope |
| TC_082 | Cannot skip yard stage | Cannot skip mandatory yard stage | Vendor App | **Skipped** | — | Out of scope |
| TC_157 | POD submission E2E | Upload POD after Gate-Out → Completed | Vendor App | **Skipped** | — | POD still prototype / not automated |
