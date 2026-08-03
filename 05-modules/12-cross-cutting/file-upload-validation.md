---
module: 12-cross-cutting
specification: File Upload Type & Size Validation
version: 1.0
phase: Phase 1
document_type: implementation_plan
last_updated: 2026-08-03
related_modules: [02-master-data, 03-users, 04-requisitions, 05-transport, 07-vendor-management, 09-mobile-apps]
related_stories: []
related_prd: ../../01-source/01-prd/PRD_DFMS_v1.0.md
source_constraints: >
  NFR — System SHALL support file uploads up to 10 MB;
  limitations.md — File upload size limited to 10 MB per file;
  product-requisition-management.md §7.3 — Arrival Notice PDF/JPEG/PNG, max 10 MB;
  vendor mobile TC_099 — compliance docs pdf/jpg/jpeg/png
baseline_code: >
  apps/requisitions/admin.py (PRDocumentForm.clean_file),
  apps/requisitions/views.py (documents action),
  apps/vendors/views.py (VendorComplianceDocumentUploadView, VendorSelfRegisterView),
  apps/master_data/serializers.py (BulkImportUploadSerializer),
  apps/users/invitation_views.py (TenantBulkInvitationView),
  apps/transport/driver_views.py / driver_transition_service.py
status: Planned — not implemented
---

# File Upload Type & Size Validation — Implementation Plan

## Overview

Backend file uploads today are **inconsistently validated**. Only PR document **admin** enforces extension + Content-Type + **10 MB**. Several live API paths accept `request.FILES` with little or no type/size enforcement (vendor KYC, PR document API, bulk invitations, driver photos). Django `DATA_UPLOAD_MAX_*` settings are unset.

This plan defines a **shared validation policy**, wires it into every **live** upload path, and aligns admin vs API behaviour. It does **not** redesign media storage, add virus scanning, or revive retired POD uploads.

**Primary path:** shared helper under `apps/core/` (or equivalent shared utilities package)  
**Touch paths:** requisitions, vendors, master_data, users, transport (+ Django settings)

---

## 0. Scope boundary

| In scope | Out of scope |
|----------|--------------|
| Shared upload validator (extension + max bytes; optional image verify) | Magic-byte / `python-magic` MIME sniffing (defer unless security review requires it) |
| All **live** upload entry points (API + Django Admin listed below) | Retired POD driver/admin upload surfaces |
| Align PR admin allowlist with product (PDF/JPEG/PNG) | New document types / Office formats for PR |
| Explicit Django body-size settings | S3 presigned direct uploads |
| Unit tests for accept/reject per upload class | Client-only picker changes (vendor app already filters types) |
| Clear 400 / form `ValidationError` messages | Antivirus / malware scanning |

### Locked product decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Default document max size | **10 MB** per file | NFR + limitations.md + PR §7.3 |
| Document allowlist | **`pdf`, `jpg`, `jpeg`, `png`** | PR model + vendor mobile TC_099; drop admin Office extras |
| Photo allowlist | **`jpg`, `jpeg`, `png`** | Field evidence photos only |
| Photo max upload size | **5 MB** (compress after accept) | Phone cameras; stored target remains ~1 MB via existing compressor |
| CSV import max size | **10 MB** + existing `MAX_IMPORT_ROWS = 5000` | Row cap alone does not bound memory |
| Invitation CSV max size | **2 MB** + existing row cap (100) | Tiny payload; whole file read into memory today |
| Content-Type trust | **Secondary only** — never sole gate; empty Content-Type OK if extension (+ image verify) passes | Client MIME is spoofable |
| `application/octet-stream` | Allowed for CSV **only when** extension is `.csv` | Browsers often send this |
| Validation layer | Run in **view / form / serializer / service choke point** before persist — do not rely on model `FileExtensionValidator` alone (`objects.create` skips validators) | Observed PR API gap |
| Admin vs API | **Same rules** for the same upload class | Avoid PR admin/API divergence |

---

## 1. Upload classes (canonical policy)

| Class | Allowed extensions | Max bytes | Extra checks |
|-------|-------------------|-----------|--------------|
| **Document** | pdf, jpg, jpeg, png | 10 × 1024² | Images: Pillow verify when extension is image |
| **Photo** | jpg, jpeg, png | 5 × 1024² | Pillow verify; then existing `compress_image_file` |
| **CSV import** | csv | 10 × 1024² | Keep row-limit validate in `ImportService` |
| **CSV invitations** | csv | 2 × 1024² | Keep `MAX_BULK_INVITATION_ROWS` |

Constants should live in one place (e.g. `apps/core/upload_validation.py` or `config/settings` + thin helpers) so limits are not duplicated.

```text
validate_upload(file, *, allowed_extensions, max_bytes, verify_image=False) -> file
  → raise ValidationError / serializers.ValidationError with stable message
```

**Suggested error copy (user-facing):**

| Failure | Message pattern |
|---------|-----------------|
| Missing file | `No file provided.` (existing where present) |
| Bad extension | `Unsupported file type '.{ext}'. Allowed: {list}.` |
| Oversize | `File too large. Maximum size is {N} MB.` |
| Not an image | `File is not a valid image.` |

---

## 2. Current vs expected (live paths)

| # | Path | Current | Expected |
|---|------|---------|----------|
| A | **PR docs — admin** `PRDocumentForm.clean_file` | Ext (incl. Office) + Content-Type + 10 MB | **Document** class only (pdf/jpg/jpeg/png) + 10 MB; call shared helper |
| B | **PR docs — API** `ProductRequisitionViewSet.documents` | `objects.create` — model validator likely skipped; no size | Same **Document** rules before create; do not rely on model validators alone |
| C | **Bulk CSV — API** `BulkImportUploadSerializer` | `.csv` + loose MIME; no byte cap | **CSV import** class (ext + 10 MB); MIME secondary |
| D | **Bulk CSV — admin** `import_upload_view` (+ users admin twin) | `.csv` only; no byte cap | Same as C |
| E | **Bulk invitations** `TenantBulkInvitationView` | Any file; `read()` all; row cap only | **CSV invitations** (`.csv` + 2 MB) **before** `read()` |
| F | **Vendor KYC** compliance upload + self-register | No type/size | **Document** class inside `VendorRegistrationService.replace_document` / register (covers both views) |
| G | **Driver transition photo** | Soft Content-Type for compress; other types still saved | **Photo** class reject; then compress JPEG/PNG |
| H | **Driver certificates** admin `FileField`s | None | **Document** class on `DriverAdminForm` (or field clean) |
| I | **Gate entry photos** API | ImageField via serializer; no size | **Photo** class if endpoint remains writable; else lock write if product confirms unused |

**Latent / out of scope for wiring unless re-enabled:** POD upload, `VendorTODocument`, `VendorInvoice.invoice_file`, QC evidence, scale photo UI, lab report upload.

---

## 3. Implementation design

### 3.1 Shared module

Add something like:

```text
apps/core/upload_validation.py
  DOCUMENT_EXTENSIONS / PHOTO_EXTENSIONS / CSV_EXTENSIONS
  DOCUMENT_MAX_BYTES / PHOTO_MAX_BYTES / CSV_IMPORT_MAX_BYTES / CSV_INVITE_MAX_BYTES
  validate_uploaded_file(file, *, allowed_extensions, max_bytes, require_image=False)
  validate_document(file)
  validate_photo(file)
  validate_csv_import(file)
  validate_csv_invitation(file)
```

- Use `file.size` when available; avoid full read for size checks.
- For `require_image=True`, open with Pillow and close; reject on failure.
- Do **not** mutate the file pointer without rewind (`seek(0)`).

### 3.2 Call-site wiring (choke points)

| Path | Wire at |
|------|---------|
| A | `PRDocumentForm.clean_file` → `validate_document` |
| B | `documents` POST → `validate_document(file)` then create |
| C | `BulkImportUploadSerializer.validate_csv_file` → `validate_csv_import` |
| D | Admin import POST after `request.FILES.get` → `validate_csv_import` |
| E | `TenantBulkInvitationView.post` before `upload.read()` |
| F | `VendorRegistrationService.replace_document` (+ register loop over uploads) |
| G | `record_driver_transition` or view before service — `validate_photo` then compress |
| H | `DriverAdminForm.clean_<field>` or shared `clean` for the three document fields |
| I | Serializer `validate_gate_in_photo` / `validate_gate_out_photo` or disable writes |

### 3.3 Model validators

Keep `FileExtensionValidator` on `PRDocument.file` as defence-in-depth, but **treat shared helper as the real gate**. Optionally call `full_clean()` after construct — prefer explicit validate-before-create for clarity.

### 3.4 Settings

| Setting | Recommendation |
|---------|----------------|
| `DATA_UPLOAD_MAX_MEMORY_SIZE` | `12 * 1024 * 1024` (slightly above 10 MB product max) |
| `FILE_UPLOAD_MAX_MEMORY_SIZE` | Keep Django default or align with 2.5–12 MB (disk spill OK) |

Define `POD_MAX_IMAGE_SIZE_BYTES` / `POD_MAX_IMAGE_DIMENSION` explicitly in settings if still used by compressor (today only `getattr` defaults).

### 3.5 PR admin allowlist cleanup

Update `ALLOWED_EXTENSIONS` / `ALLOWED_CONTENT_TYPES` in `apps/requisitions/admin.py` to match **Document** class (remove doc/docx/xls/xlsx) so admin matches model + product §7.3.

---

## 4. Build order

| Step | Work | Verify |
|------|------|--------|
| **0** | Add `apps/core/upload_validation.py` + unit tests (accept/reject matrix per class) | Tests green in isolation |
| **1** | Wire **F** vendor KYC + **B** PR API (highest risk) | Reject oversize / bad ext with 400; happy path still 201 |
| **2** | Align **A** PR admin to shared Document rules | Admin form rejects Office + oversize; PDF 10 MB OK |
| **3** | Wire **G** driver photo reject + compress | Non-image → 400; large JPEG within 5 MB accepted & compressed |
| **4** | Wire **C** + **D** CSV import byte cap | >10 MB rejected before job create |
| **5** | Wire **E** invitation CSV | Non-csv / >2 MB rejected before `read()` |
| **6** | Wire **H** (+ **I** or lock) | Admin / gate behaviour matches policy |
| **7** | Django body-size settings | Oversized multipart fails predictably at app layer |
| **8** | Regression: existing bulk-import / PR / vendor registration tests updated | CI green |

---

## 5. API / Admin behaviour contract

| Surface | Success | Failure |
|---------|---------|---------|
| REST multipart | Unchanged 2xx body shape | `400` with `detail` or field errors; no partial persist |
| Django Admin | Save succeeds | Form / message ERROR; file not stored |
| Vendor register with multiple docs | Each file validated independently; fail request if any invalid | No partial document replace for that request (keep existing transaction semantics) |

No new public endpoints. No response schema version bump required if error payloads stay conventional DRF/Admin.

---

## 6. Testing plan

### 6.1 Unit — shared helper

- Each class: allowed extension under limit → pass  
- Wrong extension → fail  
- Size = max → pass; size = max + 1 → fail  
- Photo: truncated/non-image bytes with `.jpg` name → fail when `require_image=True`  
- CSV: `.CSV` uppercase extension → pass  

### 6.2 Integration / API

| Case | Expect |
|------|--------|
| PR `POST …/documents/` with `.exe` renamed or `.docx` | 400 |
| PR upload > 10 MB | 400 |
| Vendor document upload PDF 1 MB | 200/201 as today |
| Vendor upload `.zip` | 400 |
| Bulk import CSV > 10 MB | 400 before job row |
| Invitations `.txt` / huge file | 400 |
| Driver transition `photo` = PDF | 400 |
| Driver transition JPEG within 5 MB | 200 + milestone photo set |

### 6.3 Admin (Playwright MCP scenario plan)

Executable admin SSR cases live in:

[`../../09-testing/backend/e2e-scenarios/12-cross-cutting/file-upload-validation-e2e-scenarios.md`](../../09-testing/backend/e2e-scenarios/12-cross-cutting/file-upload-validation-e2e-scenarios.md)

| Area | Coverage (TC IDs) |
|------|-------------------|
| PR / Port Shipment document inline | TC01–TC06 — valid PDF/JPEG; reject Office / bad ext / &gt;10 MB |
| Bulk CSV import (Products + Users) | TC07–TC12 — non-CSV + &gt;10 MB upload gate |
| Driver Documents fieldset | TC13–TC16 — valid PDF/JPEG; reject oversize + bad type |

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Admin users currently upload Office to PR | Product already specifies PDF/JPEG/PNG; communicate breaking change; convert externally |
| Mobile cameras produce HEIC | Out of allowlist — client should convert to JPEG (vendor/driver apps); backend rejects HEIC unless product adds it later |
| False reject on empty Content-Type | Gate on extension (+ Pillow for images); Content-Type optional |
| Double compression / seek bugs | Always `seek(0)` after Pillow / compress |

---

## 8. Open items (need product only if contested)

1. Confirm **dropping Office formats** on PR admin (recommended: yes).  
2. Confirm **gate photo** write path: enforce Photo class vs disable API writes.  
3. Whether HEIC/WebP should ever be allowed for driver photos (default: **no** for v1).

---

## 9. Related references

| Doc / code | Relevance |
|------------|-----------|
| [product-requisition-management.md](../04-requisitions/product-requisition-management.md) §7.3 | Arrival Notice type + 10 MB |
| `02-domain/.../non-functional-requirements.md` | 10 MB upload NFR |
| `02-domain/.../limitations.md` | 10 MB per-file limitation |
| `09-testing/mobile/.../03-onboarding-documents.md` TC_099 | Vendor app PDF/image allowlist |
| `docs/architecture/bulk-import-export.md` | Row limits; extend with byte cap note when implemented |

---

## 10. Definition of done

- [ ] Shared validator module exists and is the single source of limits  
- [ ] All live paths A–H (and I or locked) call the shared policy  
- [ ] PR admin allowlist matches Document class  
- [ ] Vendor KYC cannot store arbitrary file types/sizes  
- [ ] PR API cannot bypass type/size via `objects.create`  
- [ ] CSV import + invitations have byte caps  
- [ ] Driver photos reject non-images before save  
- [ ] Unit + API tests cover reject/accept matrix  
- [ ] Django body-size settings document the upload ceiling story  

---

**Last Updated**: 2026-08-03  
**Status**: Planned — ready for implementation
