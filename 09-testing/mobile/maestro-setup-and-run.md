---
section: 09-testing/mobile
title: Maestro Setup and Run Guide — Vendor App
version: 1.0
last_updated: 2026-07-21
app_repo: nourish-vendor-app
test_case_specs: ./e2e-scenarios/vendor-fleet-phase01/
---

# Maestro setup and run guide

Operational guide for Maestro E2E tests on the **DFMS Vendor Flutter app**
(`nourish-vendor-app`). Test-case specifications and **Maestro Status** tracking
live in [`e2e-scenarios/vendor-fleet-phase01/`](./e2e-scenarios/vendor-fleet-phase01/)
(TC_075–TC_215).

> Maestro is **not** installed through npm. Packages named `maestro` or
> `maestro-cli` on npm are unrelated. Use the official CLI below.

## 0. Seed backend fixtures (required for logged-in flows)

From `nourish-backend` (Docker Compose local stack):

```bash
make seed
MAESTRO_VENDOR_EMAIL=vendor2@gmail.com \
MAESTRO_VENDOR_PASSWORD='Abc@123456' \
MAESTRO_ONBOARDING_EMAIL=onboarding.test@example.com \
MAESTRO_ONBOARDING_PASSWORD=Test@1234 \
MAESTRO_JOIN_VENDOR_EMAIL=join.test@example.com \
MAESTRO_JOIN_VENDOR_PASSWORD=Test@1234 \
MAESTRO_VENDOR_PHONE=01712345678 \
make seed-vendor-mobile
```

`seed-vendor-mobile` creates/updates:

- Approved Non-Contractual vendor + nourish membership (complete onboarding)
- Onboarding-incomplete vendor (no mandatory docs)
- **Join-ready** vendor (`JOIN_VENDOR_EMAIL`): onboarded, membership on `nourish` cleared each run

It does **not** create open bids, awarded TOs, or Ready-for-Dispatch trips — those still require TDO/admin (or Playwright MCP).

### Tenant join loop (TC_102–105 → approve → TC_117)

```bash
# Mobile: Join → Requested + locked
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e JOIN_VENDOR_EMAIL="$JOIN_VENDOR_EMAIL" \
  -e JOIN_VENDOR_PASSWORD="$JOIN_VENDOR_PASSWORD" \
  .maestro/flows/tenants/03_tenant_join_request_and_lock.yaml

# Backend shell approve (preferred over Playwright for this loop)
cd ../nourish-backend
make approve-vendor-join

# Mobile: full menu after approve
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e JOIN_VENDOR_EMAIL="$JOIN_VENDOR_EMAIL" \
  -e JOIN_VENDOR_PASSWORD="$JOIN_VENDOR_PASSWORD" \
  .maestro/flows/tenants/04_tenant_join_after_approve_full_menu.yaml
```

Do not re-seed between Join and post-approve flows — `seed-vendor-mobile` clears join membership.

Optional Playwright admin smoke (not vendor mobile; use for admin UI TCs in `05-tenant-approval-admin.md`):

```bash
scripts/compose-local.sh exec -T web playwright install chromium
scripts/compose-local.sh exec -T web pytest -q tests/e2e/test_admin_login_smoke.py -m "e2e and admin_auth"
```

## 1. Prerequisites

- Java 17+
- Flutter/FVM for `nourish-vendor-app`
- Android Studio / SDK (Android) or Xcode (iOS simulator)
- Running emulator, simulator, or USB-debug device

```bash
java -version
fvm flutter --version
adb --version
```

## 2. Install Maestro

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Or on macOS:

```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

Add to `~/.zshrc` if needed:

```bash
export PATH="$PATH:$HOME/.maestro/bin"
maestro --version
```

## 3. Start an Android emulator

```bash
emulator -list-avds
emulator -avd Pixel_7_Emulator
adb devices
```

Pin a device when multiple are connected:

```bash
maestro --device emulator-5554 test <flow-or-directory>
```

## 4. Build and install the app

From `nourish-vendor-app/`:

```bash
fvm flutter run \
  --flavor flavor_dev \
  -t lib/main/main_flavor_dev.dart \
  -d emulator-5554
```

Or install APK only:

```bash
fvm flutter build apk \
  --flavor flavor_dev \
  -t lib/main/main_flavor_dev.dart \
  --debug

adb -s emulator-5554 install -r \
  build/app/outputs/flutter-apk/app-flavor_dev-debug.apk
```

Expected package: `com.dfms.app.dev.debug`

## 5. Configure test environment

```bash
cd nourish-vendor-app
cp .maestro/.env.example .maestro/.env.local
```

Edit `.maestro/.env.local` (gitignored). Never commit real credentials.

Maestro 2.6.x loads variables via shell export or `--env` flags (not `--env-file`):

```bash
set -a && source .maestro/.env.local && set +a

maestro --device emulator-5554 test \
  --env APP_ID="$APP_ID" \
  --env VENDOR_EMAIL="$VENDOR_EMAIL" \
  --env VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  .maestro/flows/smoke
```

## 6. Run tests

All commands from `nourish-vendor-app/`:

```bash
# Smoke
set -a && source .maestro/.env.local && set +a
maestro --device emulator-5554 test \
  --env APP_ID="$APP_ID" --env VENDOR_EMAIL="$VENDOR_EMAIL" --env VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  .maestro/flows/smoke

# One feature
maestro --device emulator-5554 test \
  --env APP_ID="$APP_ID" --env VENDOR_EMAIL="$VENDOR_EMAIL" --env VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  .maestro/flows/auth

# Full suite
maestro --device emulator-5554 test \
  --env APP_ID="$APP_ID" --env VENDOR_EMAIL="$VENDOR_EMAIL" --env VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  .maestro
```

Suite config: `nourish-vendor-app/.maestro/config.yaml`

## 7. Flow layout (app repo)

```text
nourish-vendor-app/.maestro/
├── config.yaml
├── .env.example
├── helpers/
└── flows/
    ├── smoke/
    ├── auth/
    ├── onboarding/
    ├── tenants/
    ├── bids/
    ├── tos/
    ├── trips/
    ├── profile/
    └── settings/
```

## 8. Update test results

After each Maestro run, update **Maestro Status** in the matching feature file
under [`e2e-scenarios/vendor-fleet-phase01/`](./e2e-scenarios/vendor-fleet-phase01/):

| Status | When to use |
|--------|-------------|
| Not Started | No run yet |
| Partial | Flow exists but TC not fully satisfied |
| Covered | Flow passes |
| Manual | Needs admin/backend setup |
| N/A | Out of scope for mobile app |

## 9. Reports and debugging

```bash
mkdir -p .maestro/output

maestro --device emulator-5554 test \
  --env APP_ID="$APP_ID" --env VENDOR_EMAIL="$VENDOR_EMAIL" --env VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  --format junit --output .maestro/output/report.xml \
  .maestro
```

Maestro Studio (selector inspection):

```bash
maestro --device emulator-5554 studio
```

## 10. Recommended execution order

1. Smoke → Auth → Profile/Settings → Tenants → Bids → TOs → Tracks → full suite
2. Seed backend fixtures before data-dependent flows (open bids, awarded TOs, active trips)

## Related

- Test case specs → [`e2e-scenarios/vendor-fleet-phase01/README.md`](./e2e-scenarios/vendor-fleet-phase01/README.md)
- Flow README → `nourish-vendor-app/.maestro/README.md`
- Backend e2e → [`../backend/e2e-scenarios/`](../backend/e2e-scenarios/)
