# Profile Completion — Documents (TC_027–TC_035)

**Source:** DFMS UAT Test Suite — Vendor Profile Completion.
**Scope:** Vendor mobile app. Reset docs via `make seed-vendor-mobile` before required-doc flows.

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_027 | Trade License required | Trade License required before proceed | Vendor App | **Covered** | `onboarding/03_…` | Passed |
| TC_028 | BIN required | BIN Certificate required | Vendor App | **Covered** | `onboarding/04_…` | Passed |
| TC_029 | TIN required | TIN Certificate required | Vendor App | **Covered** | `onboarding/05_…` | Passed |
| TC_030 | Truck Assoc required | Truck Association Reference required | Vendor App | **Covered** | `onboarding/06_…` | Passed |
| TC_031 | All 4 docs formats | All 4 docs upload PNG/JPG/JPEG/PDF | Vendor App | **Covered** | `onboarding/07_…` | Passed (PNG via Maestro) |
| TC_032 | Unsupported format | Unsupported file format rejected | Vendor App | **Partial** | code review picker | No dedicated Maestro negative flow |
| TC_033 | Oversized file | Oversized document rejected if size limit applies | Vendor App | **Not Started** | — | Size not enforced in app picker path |
| TC_034 | Upload fail retry | Clear error + retry on upload failure | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_035 | Proceed to Tenants | After 4 docs → Tenants page | Vendor App | **Covered** | `onboarding/07_…` | Passed |
