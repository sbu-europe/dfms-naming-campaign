---
module: 02-master-data
specification: Bulk Import & Export — Master Data
version: 1.3
phase: Phase 1
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: 6.3.1, 6.3.2, 6.3.3
last_updated: 2026-04-17
related_stories: US-047, US-053, US-057, US-061, US-095, US-096
---

# Bulk Import & Export — Master Data Specification

## Overview

The DFMS platform provides CSV-based bulk import and export for **each model that** (1) includes **`BulkImportExportMixin`** on its Django admin class and (2) has an entry in the **shared** **`IMPORT_REGISTRY`** (`apps/master_data/import_configs.IMPORT_REGISTRY`). The **`users`** app registers **`driver`** and **`helper`** configs at startup (`UsersConfig.ready` → `register_user_import_configs()`), reusing the same registry, Celery tasks, and **`BulkImportJob`** / **`BulkExportJob`** models from **`apps/master_data`**.

Tenant admins upload a CSV from the model’s changelist, preview a paginated validation report, then confirm. Celery processes validation and writes. Job rows and files use a retention window controlled by **`FILE_RETENTION_DAYS`** in **`apps/master_data/models.py`** (currently **30 days**).

**Registry-backed bulk import/export (implemented)**:

| Registry key (`model_name`) | App | Model | Admin class |
|---|---|---|---|
| `productcategory` | `master_data` | `ProductCategory` | `ProductCategoryBulkAdmin` |
| `product` | `master_data` | `Product` | `ProductBulkAdmin` |
| `brand` | `master_data` | `Brand` | `BrandAdmin` |
| `vehicle` | `master_data` | `Vehicle` | `VehicleAdmin` |
| `supplier` | `master_data` | `Supplier` | `SupplierAdmin` |
| `dealer` | `master_data` | `Dealer` | `DealerAdmin` |
| `driver` | `users` | `Driver` | `DriverAdmin` |
| `helper` | `users` | `Helper` | `HelperAdmin` |

Admin import URLs follow the app label, e.g. **`/admin/users/driver/import/`**, **`/admin/users/helper/import/`** (mixin implemented in **`apps/users/admin.py`**).

**Not in `IMPORT_REGISTRY` (no admin bulk template wired yet)**:

| Entity | Notes |
|---|---|
| `POI` | CRUD via REST/admin; add **`POIImportConfig`** + mixin when POI CSV is required. |

---

## 1. Architecture

### 1.1 Import Flow

```
Tenant Admin
    │
    ├─► [1] GET  /admin/master_data/vehicle/import/
    │         Upload page — form + "Download CSV Template" link
    │
    ├─► [2] POST /admin/master_data/vehicle/import/
    │         Server: create BulkImportJob(status=pending, schema_name=current)
    │         Server: save uploaded CSV to uploaded_file
    │         Server: fire validate_bulk_import.delay(job_id, schema_name)
    │         Server: redirect → status polling page
    │
    ├─► [3] GET  /admin/master_data/vehicle/import/<job_id>/status.json
    │         Polling endpoint — returns {status, processed_rows, valid_rows, invalid_rows}
    │         Status page auto-refreshes every 3s via <meta http-equiv="refresh">
    │         UI uses processed_rows to show progress out of MAX_IMPORT_ROWS (5000)
    │         When status = preview_ready → redirect to preview page
    │
    ├─► [4] GET  /admin/master_data/vehicle/import/<job_id>/
    │         Preview page — paginated rows table (20 per page)
    │         Green rows = valid, Red rows = invalid with inline error messages
    │         Summary bar: "X valid rows, Y invalid rows"
    │         Two action buttons:
    │           ┌─ "Import Valid Rows (X)" → POST confirm
    │           └─ "Fix & Re-upload"       → cancels job, back to upload
    │
    ├─► [5] POST /admin/master_data/vehicle/import/<job_id>/confirm/
    │         Server: set job.status = confirmed
    │         Server: fire execute_bulk_import.delay(job_id, schema_name, import_valid_only=True)
    │         Server: redirect → final status page (polls until completed/failed)
    │
    └─► [6] GET  /admin/master_data/vehicle/import/<job_id>/
              Final status: "Import complete. 52 records created/updated. 3 rows skipped."
              Link: "← Back to Vehicles list"
```

### 1.2 Export Flow

```
Tenant Admin
    │
    ├─► [1] POST /admin/master_data/vehicle/export/
    │         Server: create BulkExportJob(status=pending, schema_name=current)
    │         Server: fire generate_bulk_export.delay(job_id, schema_name)
    │         Server: redirect → export status page
    │
    ├─► [2] GET  /admin/master_data/vehicle/export/<job_id>/
    │         Status page auto-refreshes every 3s
    │         When status = completed → show download button
    │
    └─► [3] GET  /admin/master_data/vehicle/export/<job_id>/download/
              Serves result_file as Content-Disposition: attachment
```

### 1.3 Job Status State Machine

**BulkImportJob**:

```
                    ┌── broker down ──────────────────────────────────────────────┐
                    │                                                              ▼
pending ──► validating ──► preview_ready ──► confirmed ──► importing ──► completed │ failed
               │  ▲              │                            │  ▲
               │  │              │                            │  │
               │  └─ acks_late   └── cancelled (user action)  │  └─ acks_late
               │     redeliver                                 │     redeliver
               │                                               │
               └── stale timeout (STALE_JOB_TIMEOUT_MINUTES) ─┘
               │   mark_stale_import_jobs task → failed        │
               └───────────────────────────────────────────────┘
```

Terminal states: `completed`, `failed`, `cancelled`

Transitions to `failed` via four distinct paths:
1. **Explicit exception** — `except` block in the Celery task catches a Python error and calls `self.retry()`; after `max_retries` exhausted, job is marked `failed`
2. **Broker down at enqueue time** — `.delay()` raises `OperationalError`; job is marked `failed` immediately in the view before the HTTP response (see §6.1 and §10.4)
3. **Worker SIGKILL / OOM** — process dies with no exception; `acks_late=True` + `reject_on_worker_lost=True` causes the broker to redeliver the task to another worker (see §5.1, §5.2); if redelivery also fails, the `mark_stale_import_jobs` watchdog catches any job stuck in a non-terminal state beyond `STALE_JOB_TIMEOUT_MINUTES` and marks it `failed` (see §5.5)
4. **Stale timeout** — `mark_stale_import_jobs` runs every 5 minutes; any job in `validating` or `importing` with `updated_at` older than `STALE_JOB_TIMEOUT_MINUTES` is marked `failed`

**BulkExportJob**:

```
pending ──► processing ──► completed
               │  ▲
               │  └─ acks_late redeliver / stale watchdog
               └──────────────────────────────────────► failed
```

### 1.4 Tenant Isolation and Rate Limiting in Celery

All Celery tasks run in a worker process with no active Django tenant schema. Every task that touches tenant data wraps its body in `schema_context(schema_name)` from `django_tenants.utils`. The `schema_name` is captured at job creation time from `connection.schema_name` (the current HTTP request's tenant schema) and stored as a plain `CharField` on the job model. This is the established pattern in `apps/tenants/tasks.py`.

To prevent resource exhaustion, the API and Admin views enforce a **Tenant Rate Limit** of a maximum of 3 concurrent active jobs per tenant. If a tenant attempts to queue a 4th job while 3 are still in `pending`, `validating`, or `importing`/`processing` states, the request is rejected with HTTP 429.

```python
# Pattern used by all three tenant-aware tasks
with schema_context(schema_name):
    job = BulkImportJob.objects.get(id=job_id)
    job.status = "validating"
    job.save()
    # ... all DB access here is tenant-isolated
```

---

## 2. Data Models

### 2.1 BulkImportJob

Tracks the full lifecycle of one CSV import attempt. Lives in the tenant's PostgreSQL schema (inherits `TenantAwareModel`).

```python
FILE_RETENTION_DAYS     = 30   # module-level constant in apps/master_data/models.py
MAX_IMPORT_ROWS         = 5000 # hard cap on preview_data size; see §4.1
STALE_JOB_TIMEOUT_MINUTES = 30 # jobs stuck in validating/importing beyond this → failed; see §5.5

class BulkImportJob(TenantAwareModel):
    model_name    = models.CharField(max_length=50)       # e.g. "vehicle", "driver"
    schema_name   = models.CharField(max_length=100)      # for Celery task context
    status        = models.CharField(max_length=20, default="pending")
    uploaded_file = models.FileField(upload_to="bulk_imports/%Y/%m/")
    created_by    = models.ForeignKey("users.User", null=True, on_delete=models.SET_NULL)
    total_rows    = models.PositiveIntegerField(default=0)
    processed_rows= models.PositiveIntegerField(default=0)
    valid_rows    = models.PositiveIntegerField(default=0)
    invalid_rows  = models.PositiveIntegerField(default=0)
    preview_data  = models.JSONField(default=list)         # see §2.3
    error_summary = models.JSONField(default=list)
    completed_at  = models.DateTimeField(null=True, blank=True)
    expires_at    = models.DateTimeField(db_index=True)    # auto-set on first save

    class Meta:
        app_label = "master_data"
        db_table = "bulk_import_jobs"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.pk:
            self.expires_at = now() + timedelta(days=FILE_RETENTION_DAYS)
        super().save(*args, **kwargs)
```

**Status values:**

| Status | Meaning |
|---|---|
| `pending` | Job created, task not yet started |
| `validating` | Celery task is parsing and validating CSV rows |
| `preview_ready` | Validation complete; preview_data populated; awaiting admin decision |
| `confirmed` | Admin confirmed import; execute task queued |
| `importing` | Celery task is writing rows to the database |
| `completed` | All valid rows written successfully |
| `failed` | An unrecoverable error occurred (task exception, file read error) |

### 2.2 BulkExportJob

```python
class BulkExportJob(TenantAwareModel):
    model_name   = models.CharField(max_length=50)
    schema_name  = models.CharField(max_length=100)
    status       = models.CharField(max_length=20, default="pending")
    result_file  = models.FileField(upload_to="bulk_exports/%Y/%m/", blank=True)
    created_by   = models.ForeignKey("users.User", null=True, on_delete=models.SET_NULL)
    total_rows   = models.PositiveIntegerField(default=0)
    processed_rows= models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at   = models.DateTimeField(db_index=True)    # auto-set on first save

    class Meta:
        app_label = "master_data"
        db_table = "bulk_export_jobs"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.pk:
            self.expires_at = now() + timedelta(days=FILE_RETENTION_DAYS)
        super().save(*args, **kwargs)
```

### 2.3 preview_data JSON Structure

`BulkImportJob.preview_data` is a list of row dicts, populated by `ImportService.validate()`:

```python
[
    {
        "row_num": 2,           # CSV row number (header = row 1)
        "status": "valid",      # "valid" | "invalid"
        "data": {               # raw CSV values after type coercion
            "registration_number": "DHA-1234",
            "vehicle_type": "truck",
            "capacity_mt": "15.500"
        },
        "errors": []            # list of error strings; empty when valid
    },
    {
        "row_num": 3,
        "status": "invalid",
        "data": {
            "registration_number": "",
            "vehicle_type": "spaceship",
            "capacity_mt": "abc"
        },
        "errors": [
            "registration_number: This field is required.",
            "vehicle_type: 'spaceship' is not a valid choice. Valid values: truck, pickup, tanker, container, covered_van, open_truck.",
            "capacity_mt: Enter a valid decimal number."
        ]
    }
]
```

**Scale note**: JSON preview is suitable for master data loads up to `MAX_IMPORT_ROWS` (5,000) rows. This limit is explicitly set for Phase 1 as we are using PostgreSQL. It prevents multi-MB JSON blobs from degrading DB performance and memory consumption in `preview_data`. `ImportService.validate()` raises a hard `ValidationError` if the CSV exceeds this limit before any row is written to `preview_data`. If imports regularly approach that ceiling in future phases, `preview_data` will be migrated to a separate `BulkImportRow(job=FK, row_num, status, data, errors)` model for true database-level pagination and batching.

---

## 3. Import Config Registry

### 3.1 Design

`apps/master_data/import_configs.py` defines a generic registry so **each** model with a config class shares the same validation pipeline. Adding import support for a new model = add one config class and register it in **`IMPORT_REGISTRY`**. Today the registry holds **six** `master_data` models plus **`driver`** and **`helper`** registered from **`apps/users/import_configs.py`** at app startup; **`POI`** is not registered yet.

```python
@dataclass
class FieldConfig:
    name: str
    required: bool = True
    validator: callable | None = None   # called with raw string value
    coerce: callable | None = None      # called after validation; converts to Python type

class BaseImportConfig:
    model = None
    fields: list[FieldConfig] = []
    unique_lookup: str = ""             # field used in update_or_create lookup

    def validate_row(self, row: dict) -> tuple[bool, dict, list[str]]:
        """
        Returns (is_valid, cleaned_data, error_list).
        Runs field-level validation, type coercion, and finally model-level 
        validation via model.full_clean().
        """
        ...

    def get_csv_headers(self) -> list[str]:
        """
        Returns required and optional column headers.
        Explicitly excludes attachment/file fields.
        """
        return [f.name for f in self.fields]

    def perform_batch_import(self, cleaned_rows: list[dict]) -> None:
        """
        Write validated rows to the database using batch processing.
        
        Uses bulk_create for new records and bulk_update for existing ones
        to minimize database hits. Batched into chunks of 500.
        """
        ...

    def get_export_queryset(self):
        return self.model.objects.filter(is_active=True).order_by("pk")

    def get_export_row(self, obj) -> dict:
        ...

IMPORT_REGISTRY: dict[str, BaseImportConfig] = {
    "poi":             POIImportConfig(),
    "productcategory": ProductCategoryImportConfig(),
    "product":         ProductImportConfig(),
    "vehicle":         VehicleImportConfig(),
    "driver":          DriverImportConfig(),
    "helper":          HelperImportConfig(),
    "supplier":        SupplierImportConfig(),
    "dealer":          DealerImportConfig(),
}
```

### 3.2 Per-Model Required CSV Columns

| Model | Required columns | Optional columns |
|---|---|---|
| `POI` | `poi_code`, `name`, `poi_type` | `address`, `city`, `latitude`, `longitude`, `geofence_radius_meters`, `storage_capacity_mt`, `contact_person`, `contact_phone` |
| `ProductCategory` | `code`, `name` | `parent_code` |
| `Product` | `sku`, `name`, `product_type`, `uom` | `category_code`, `description`, `standard_weight_kg`, `requires_qc`, `qc_tolerance_percent` |
| `Vehicle` | `registration_number`, `vehicle_type`, `capacity_mt` | `make`, `model`, `year_of_manufacture`, `fitness_certificate_expiry`, `route_permit_expiry`, `insurance_expiry`, `gps_device_id`, `owner_name` |
| `Driver` | `employee_code`, `full_name`, `phone_number`, `license_number` | `license_expiry`, `license_type`, `address`, `emergency_contact`, `emergency_phone` |
| `Helper` | `employee_code`, `full_name`, `phone_number` | `national_id` |
| `Supplier` | `supplier_code`, `name` | `contact_person`, `phone`, `email`, `address`, `country_of_origin`, `notes` |
| `Dealer` | `dealer_code`, `name` | `zone_code`, `contact_person`, `phone`, `email`, `address`, `credit_limit` |

### 3.3 Validation Rules

**Header validation** (before any row processing):
- All required column names must be present; validation fails immediately with a clear error if any are missing.
- Extra columns are silently ignored.
- **Attachments excluded**: Any `FileField` or `ImageField` defined on the model is strictly omitted from the downloadable template and ignored if supplied in the CSV. File uploads must be handled per-record via standard interfaces.

**Row-level validation** (per row):
- Required fields: non-empty after `strip()`. If a required field is empty, the row is marked invalid and will not be imported.
- Choice fields (e.g. `vehicle_type`, `poi_type`, `product_type`, `uom`): value must be in the model's `TextChoices` set.
- Decimal fields: parseable by `decimal.Decimal`; no negative values where not meaningful.
- Date fields (`YYYY-MM-DD` format): parseable by `datetime.date.fromisoformat`.
- Boolean fields (`requires_qc`): `"true"/"false"/"1"/"0"/"yes"/"no"` (case-insensitive).
- FK-by-code fields (e.g. `origin_poi_code` for `Route`): resolved to a DB object; error if the referenced code does not exist in the tenant's data.

**Model-level validation**:
- After field coercion, the config instantiates an in-memory model object (`instance = model(**cleaned_data)`) and calls `instance.full_clean()` to run any cross-field constraints, custom `clean()` logic, or `UniqueConstraint` checks defined on the model.
- Validation errors are appended to the row's `errors` list.

**Uniqueness**: 
- The unique lookup field (e.g. `registration_number` for `Vehicle`) is used to match existing records during batch import. Existing records are updated, and new records are created.

---

## 4. Service Layer

### 4.1 ImportService

`apps/master_data/services.py`

```python
ALLOWED_CSV_CONTENT_TYPES = {"text/csv", "text/plain", "application/csv", "application/octet-stream"}

class ImportService:

    @classmethod
    def validate(cls, job: BulkImportJob) -> None:
        """
        Parse uploaded CSV and run per-row validation.
        Writes preview_data, total_rows, valid_rows, invalid_rows to job.
        Called inside validate_bulk_import Celery task.

        Guards (in order):
        1. File extension must be .csv  — rejects .xlsx, .json, .txt etc. at
           the service layer, independent of the upload surface (admin or API).
        2. Row count must not exceed MAX_IMPORT_ROWS — prevents multi-MB JSON
           being stored in the preview_data JSONField.
        """
        # Guard 1: file type — defence-in-depth below the serializer/form layer
        file_name = job.uploaded_file.name or ""
        if not file_name.lower().endswith(".csv"):
            raise ValidationError(
                f"Uploaded file '{file_name}' is not a CSV. "
                "Only .csv files are accepted."
            )

        config = IMPORT_REGISTRY[job.model_name]
        reader = csv.DictReader(
            io.TextIOWrapper(job.uploaded_file.open("rb"), encoding="utf-8-sig")
        )
        preview_data = []
        valid = invalid = 0

        for row_num, row in enumerate(reader, start=2):
            # Guard 2: row cap — fail fast before storing an oversized blob
            if row_num - 1 > MAX_IMPORT_ROWS:
                raise ValidationError(
                    f"CSV exceeds the maximum of {MAX_IMPORT_ROWS} data rows. "
                    "Split the file and upload in batches."
                )
            is_valid, cleaned, errors = config.validate_row(row)
            preview_data.append({
                "row_num": row_num,
                "status": "valid" if is_valid else "invalid",
                "data": cleaned,
                "errors": errors,
            })
            if is_valid:
                valid += 1
            else:
                invalid += 1

            # Update progress periodically for the UI
            if (row_num - 1) % 500 == 0:
                job.processed_rows = row_num - 1
                job.save(update_fields=["processed_rows"])

        job.preview_data = preview_data
        job.total_rows = valid + invalid
        job.processed_rows = valid + invalid
        job.valid_rows = valid
        job.invalid_rows = invalid
        job.status = "preview_ready"
        job.save()

    @classmethod
    def execute(cls, job: BulkImportJob, import_valid_only: bool) -> None:
        """
        Batch write valid rows to the database inside a single transaction.
        Called inside execute_bulk_import Celery task.
        If import_valid_only=True, invalid rows are skipped.
        If a user chooses to proceed with errors, only the valid rows are imported.
        """
        config = IMPORT_REGISTRY[job.model_name]
        rows_to_import = [
            r["data"] for r in job.preview_data
            if r["status"] == "valid" or not import_valid_only
        ]
        
        with transaction.atomic():
            if rows_to_import:
                config.perform_batch_import(rows_to_import)
            
            job.status = "completed"
            job.processed_rows = len(rows_to_import)
            job.completed_at = now()
            job.save(update_fields=["status", "processed_rows", "completed_at"])
```

### 4.2 ExportService

Memory-safe streaming via `.iterator(chunk_size=500)` — the full queryset is never loaded into Python memory.

```python
class ExportService:

    @classmethod
    def generate(cls, job: BulkExportJob) -> None:
        """
        Stream all active records to a CSV file.
        Saves file to job.result_file using tempfile to prevent memory exhaustion.
        Called inside generate_bulk_export Celery task.
        """
        import tempfile
        from django.core.files import File

        config = IMPORT_REGISTRY[job.model_name]
        
        with tempfile.NamedTemporaryFile(mode="w+", encoding="utf-8-sig", newline="") as temp_file:
            writer = csv.DictWriter(temp_file, fieldnames=config.get_csv_headers())
            writer.writeheader()
            count = 0

            for obj in config.get_export_queryset().iterator(chunk_size=500):
                writer.writerow(config.get_export_row(obj))
                count += 1
                if count % 500 == 0:
                    job.processed_rows = count
                    job.save(update_fields=["processed_rows"])

            temp_file.flush()

            job.result_file.save(
                f"{job.model_name}_export_{job.id}.csv",
                File(temp_file, name=f"{job.model_name}_export_{job.id}.csv"),
                save=False,
            )

        job.total_rows = count
        job.processed_rows = count
        job.status = "completed"
        job.completed_at = now()
        job.save()
```

---

## 5. Celery Tasks

All four tasks live in `apps/master_data/tasks.py`.

### 5.1 validate_bulk_import

**`acks_late=True` + `reject_on_worker_lost=True`**: Celery's default `acks_early=False` acknowledges the message to the broker *before* the task body runs. If the worker process is killed (SIGKILL, OOM, EC2 shutdown) after acknowledgment but before completion, the message is gone — no redelivery, no exception, no `except` block. The job remains frozen in `validating` forever.

Setting `acks_late=True` delays acknowledgment until the task *returns successfully*. Setting `reject_on_worker_lost=True` (requires `acks_late=True`) instructs the broker to reject (not acknowledge) the message if the worker connection is lost, triggering automatic redelivery to another worker. Combined with `max_retries=3`, this covers both soft failures (caught exceptions) and hard crashes (worker death).

**Tradeoff**: With `acks_late=True`, a worker crash after successful completion but before acknowledgment causes the task to run twice. This is safe here because `ImportService.validate()` is idempotent — it overwrites `preview_data` on the same job record — and the `mark_stale_import_jobs` watchdog (§5.5) provides a safety net for any edge cases.

```python
@celery_app.task(
    name="master_data.validate_bulk_import",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    acks_late=True,
    reject_on_worker_lost=True,
)
def validate_bulk_import(self, job_id: str, schema_name: str) -> None:
    with schema_context(schema_name):
        job = BulkImportJob.objects.get(id=job_id)
        job.status = "validating"
        job.save(update_fields=["status", "updated_at"])
        try:
            ImportService.validate(job)
        except Exception as exc:
            job.status = "failed"
            job.error_summary = [str(exc)]
            job.save(update_fields=["status", "error_summary"])
            raise self.retry(exc=exc)
```

### 5.2 execute_bulk_import

Same `acks_late` + `reject_on_worker_lost` rationale as §5.1. `ImportService.execute()` uses `update_or_create` (see `BaseImportConfig.get_or_create` constraint in §3.1), so redelivery after a crash is safe — rows already written are updated to the same values, not duplicated.

```python
@celery_app.task(
    name="master_data.execute_bulk_import",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    acks_late=True,
    reject_on_worker_lost=True,
)
def execute_bulk_import(self, job_id: str, schema_name: str, import_valid_only: bool) -> None:
    with schema_context(schema_name):
        job = BulkImportJob.objects.get(id=job_id)
        job.status = "importing"
        job.save(update_fields=["status", "updated_at"])
        try:
            ImportService.execute(job, import_valid_only)
        except Exception as exc:
            job.status = "failed"
            job.error_summary = [str(exc)]
            job.save(update_fields=["status", "error_summary"])
            raise self.retry(exc=exc)
```

### 5.3 generate_bulk_export

```python
@celery_app.task(
    name="master_data.generate_bulk_export",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def generate_bulk_export(self, job_id: str, schema_name: str) -> None:
    with schema_context(schema_name):
        job = BulkExportJob.objects.get(id=job_id)
        job.status = "processing"
        job.save(update_fields=["status"])
        try:
            ExportService.generate(job)
        except Exception as exc:
            job.status = "failed"
            job.save(update_fields=["status"])
            raise self.retry(exc=exc)
```

### 5.4 purge_expired_bulk_files

Runs daily via Celery Beat. Iterates all tenant schemas and deletes expired job records + their physical files.

**Concurrency guard — `select_for_update(skip_locked=True)`**

Without a lock, Celery Beat clock drift or a worker restart mid-execution can fire two instances simultaneously. Both workers would reach `job.uploaded_file.delete(save=False)` on the same row: the first succeeds, the second gets a storage error (or silently swallows it) before also calling `job.delete()` — leaving orphan DB records or double-delete errors on S3.

`select_for_update(skip_locked=True)` acquires a Postgres row-level lock per job. The second worker skips any row already locked by the first. Because the lock is held only for the duration of the inner `atomic()` block (file delete + DB delete), the operation is both safe and non-blocking.

```python
@celery_app.task(
    name="master_data.purge_expired_bulk_files",
    ignore_result=True,
)
def purge_expired_bulk_files() -> None:
    from apps.tenants.models import Tenant

    for tenant in Tenant.objects.exclude(schema_name="public"):
        with schema_context(tenant.schema_name):

            expired_imports = (
                BulkImportJob.objects
                .filter(expires_at__lte=now())
                .select_for_update(skip_locked=True)
            )
            with transaction.atomic():
                for job in expired_imports:
                    job.uploaded_file.delete(save=False)
                    job.delete()

            expired_exports = (
                BulkExportJob.objects
                .filter(expires_at__lte=now())
                .select_for_update(skip_locked=True)
            )
            with transaction.atomic():
                for job in expired_exports:
                    job.result_file.delete(save=False)
                    job.delete()
```

`select_for_update()` requires a `transaction.atomic()` context — the two `atomic()` blocks above provide that. Import and export jobs are handled in separate transactions so a storage error on one batch does not roll back the other.

### 5.5 mark_stale_import_jobs

**Why this task exists**: `acks_late=True` + `reject_on_worker_lost=True` (§5.1, §5.2) handles worker crashes by redelivering the task. However, redelivery requires the broker connection to be alive when the worker dies. In scenarios where the broker itself is unreachable at the moment of worker death, or when the job's `updated_at` is stale because the task never started (e.g., the task was queued but no worker was available), redelivery does not happen and the job remains frozen.

This task is the final safety net. It runs every 5 minutes and forcibly marks any import or export job stuck in a non-terminal processing state beyond `STALE_JOB_TIMEOUT_MINUTES` as `failed`, giving the tenant admin immediate feedback rather than an infinite spinner.

```python
@celery_app.task(
    name="master_data.mark_stale_import_jobs",
    ignore_result=True,
)
def mark_stale_import_jobs() -> None:
    """
    Watchdog: finds jobs stuck in a processing state and marks them failed.
    Runs every 5 minutes via Celery Beat.

    Uses updated_at (auto-set on every model save) to measure elapsed time
    in a given status — no separate started_at field needed. A job whose
    updated_at is older than STALE_JOB_TIMEOUT_MINUTES and whose status is
    still a non-terminal processing state has clearly not made progress.
    """
    from apps.tenants.models import Tenant
    from django.utils.timezone import now
    from datetime import timedelta

    stale_cutoff = now() - timedelta(minutes=STALE_JOB_TIMEOUT_MINUTES)
    processing_states = ["validating", "importing", "pending"]   # pending = task never started
    export_processing_states = ["processing", "pending"]

    for tenant in Tenant.objects.exclude(schema_name="public"):
        with schema_context(tenant.schema_name):
            stale_imports = (
                BulkImportJob.objects
                .filter(status__in=processing_states, updated_at__lte=stale_cutoff)
                .select_for_update(skip_locked=True)
            )
            with transaction.atomic():
                for job in stale_imports:
                    job.status = "failed"
                    job.error_summary = [
                        f"Job timed out after {STALE_JOB_TIMEOUT_MINUTES} minutes "
                        f"in status '{job.status}'. The worker may have crashed. "
                        "Please re-upload the CSV to try again."
                    ]
                    job.save(update_fields=["status", "error_summary"])

            stale_exports = (
                BulkExportJob.objects
                .filter(status__in=export_processing_states, updated_at__lte=stale_cutoff)
                .select_for_update(skip_locked=True)
            )
            with transaction.atomic():
                for job in stale_exports:
                    job.status = "failed"
                    job.save(update_fields=["status"])
```

**Re-upload path after stale failure**: The `bulk_import_status.html` template (§7.2) already renders a "link back to upload" when `status = failed`. The error message written by this task explicitly instructs the admin to re-upload, completing the recovery UX loop without any additional UI changes.

**Celery Beat registration** in `config/settings/base.py`:

```python
CELERY_BEAT_SCHEDULE = {
    # ... existing entries ...
    "purge-expired-bulk-files": {
        "task": "master_data.purge_expired_bulk_files",
        "schedule": crontab(hour=0, minute=30),   # daily at 00:30 UTC
    },
    "mark-stale-import-jobs": {
        "task": "master_data.mark_stale_import_jobs",
        "schedule": crontab(minute="*/5"),         # every 5 minutes
    },
}
```

---

## 6. Admin Integration

### 6.1 BulkImportExportMixin

A Django admin mixin that injects six custom URL routes and overrides `changelist_view` to pass `import_url`/`export_url` to the template context. Any `ModelAdmin` gains full import/export capability by adding this mixin to its MRO as the first base class.

```python
class BulkImportExportMixin:
    """
    Plug-in mixin for any TenantMasterDataAdmin.
    Adds Import CSV and Export All CSV to the changelist.
    Relies on IMPORT_REGISTRY having a config for self.model._meta.model_name.
    """

    def get_urls(self):
        model_name = self.model._meta.model_name
        extra = [
            path("import/",
                 self.admin_site.admin_view(self.import_upload_view),
                 name=f"master_data_{model_name}_import_upload"),
            path("import/<uuid:job_id>/",
                 self.admin_site.admin_view(self.import_preview_view),
                 name=f"master_data_{model_name}_import_preview"),
            path("import/<uuid:job_id>/confirm/",
                 self.admin_site.admin_view(self.import_confirm_view),
                 name=f"master_data_{model_name}_import_confirm"),
            path("import/<uuid:job_id>/status.json",
                 self.admin_site.admin_view(self.import_status_json_view),
                 name=f"master_data_{model_name}_import_status"),
            path("export/",
                 self.admin_site.admin_view(self.export_trigger_view),
                 name=f"master_data_{model_name}_export"),
            path("export/<uuid:job_id>/",
                 self.admin_site.admin_view(self.export_status_view),
                 name=f"master_data_{model_name}_export_status"),
        ]
        return extra + super().get_urls()

    def changelist_view(self, request, extra_context=None):
        model_name = self.model._meta.model_name
        extra_context = extra_context or {}
        extra_context["import_url"] = reverse(
            f"admin:master_data_{model_name}_import_upload"
        )
        extra_context["export_url"] = reverse(
            f"admin:master_data_{model_name}_export"
        )
        return super().changelist_view(request, extra_context)
```

**Broker-down error handling in upload and export trigger views**

Every view that calls `.delay()` must handle `kombu.exceptions.OperationalError` (broker unreachable). Without this guard, the `BulkImportJob` record is created in the DB with `status=pending` but the task is never queued — a permanently orphaned record the admin can only see in the job history table with no way to retry.

The correct pattern is to mark the job `failed` before returning an error response, so the admin sees an actionable error rather than an infinite spinner:

```python
# Pattern used in import_upload_view and export_trigger_view
from kombu.exceptions import OperationalError

try:
    validate_bulk_import.delay(str(job.id), job.schema_name)
except OperationalError as exc:
    job.status = "failed"
    job.error_summary = [
        "Task queue is unavailable. Please try again in a few minutes."
    ]
    job.save(update_fields=["status", "error_summary"])
    # Re-render the upload form with a user-visible error (admin SSR)
    # or return HTTP 503 (API — see §10.4)
    ...
```

This same pattern applies in `export_trigger_view` wrapping `generate_bulk_export.delay()` and in the API `BulkImportViewSet.create()` / `BulkExportViewSet.create()`.

**Applying the mixin to existing admins** (example):

```python
@admin.register(Vehicle)
class VehicleAdmin(BulkImportExportMixin, TenantOnlyAdminMixin, admin.ModelAdmin):
    list_display  = ("registration_number", "vehicle_type", "capacity_mt", "is_active")
    list_filter   = ("vehicle_type", "is_active")
    search_fields = ("registration_number",)
```

Apply this mixin **per model** that should expose bulk CSV, and ensure **`IMPORT_REGISTRY[self.model._meta.model_name]`** exists. Unregistered models (e.g. **`POI`** today) do not get import/export URLs.

### 6.2 Job History Admins (optional pattern)

Dedicated read-only **`BulkImportJob` / `BulkExportJob`** `ModelAdmin` classes are **recommended** for operational audit; they are **not required** for the mixin workflow (recent jobs are often surfaced on the per-model upload page). Example:

```python
@admin.register(BulkImportJob)
class BulkImportJobAdmin(TenantOnlyAdminMixin, admin.ModelAdmin):
    list_display   = ("model_name", "status", "total_rows", "valid_rows",
                      "invalid_rows", "created_by", "created_at", "expires_at")
    list_filter    = ("model_name", "status")
    readonly_fields = [f.name for f in BulkImportJob._meta.fields]

    def has_add_permission(self, request):    return False
    def has_change_permission(self, request, obj=None): return False

@admin.register(BulkExportJob)
class BulkExportJobAdmin(TenantOnlyAdminMixin, admin.ModelAdmin):
    list_display   = ("model_name", "status", "total_rows",
                      "created_by", "created_at", "expires_at")
    list_filter    = ("model_name", "status")
    readonly_fields = [f.name for f in BulkExportJob._meta.fields]

    def has_add_permission(self, request):    return False
    def has_change_permission(self, request, obj=None): return False
```

---

## 7. Templates

All templates extend `admin/base_site.html` and live in `templates/admin/master_data/`.

### 7.1 bulk_import_upload.html

- File upload `<form enctype="multipart/form-data">` with a `<input type="file" accept=".csv">`
- "Download CSV Template" link → GET `import/` with `?template=1` query param; returns a `text/csv` response with headers only, derived from `config.get_csv_headers()` — always in sync with the current model fields
- Table of the last 5 import jobs for this model (status, rows, date, link to preview if still available)

### 7.2 bulk_import_status.html

- `<meta http-equiv="refresh" content="3">` for automatic polling **only when `status` is `pending` or `validating`** — the meta-refresh tag is omitted entirely for terminal states (`failed`, `completed`, `cancelled`) to avoid infinite page reloads after resolution
- Spinner animation while `status` is `pending` or `validating`
- Once `preview_ready`: JavaScript `window.location.replace()` redirects to preview page (or meta-refresh handles it on the next 3-second cycle)
- If `status = failed`: shows `job.error_summary` list, prominent "Re-upload CSV" button linking back to the upload page — this is the recovery path for broker-down failures (§6.1), worker crashes resolved by the stale watchdog (§5.5), and explicit task exceptions
- If `status = cancelled`: shows "This import was cancelled" with a link back to upload

### 7.3 bulk_import_preview.html

- Summary bar: `X valid rows | Y invalid rows | Z total rows`
- **Admin pagination (design system):** `resolve_admin_list_pagination` — `?p=` + `?per_page=` (`VALID_PER_PAGE` 15/25/50/100/200, default 25); footer `.dfms-pagination-parent` + **Rows per page:** (see [Data Display](../../07-design-system/02-components/data-display.md)). Replaces legacy fixed 20 / `?page=` on this SSR preview only.
- Paginated table using Django's `Paginator` over filtered `job.preview_data`
- Rows with `status = valid`: green left border
- Rows with `status = invalid`: red left border + error messages in a collapsible cell
- Columns: row number, all CSV field values, validation status, errors
- **Status filter (Sprint 9 FB-004):** right sidebar `#changelist-filter` → **By status** → **All** / **Valid** / **Invalid** (`?status=valid|invalid`; omit for All). Summary counts stay job-global. Shared by Master Data, User, and Driver preview. Full plan: **[bulk-import-preview-status-filter-fb004.md](./bulk-import-preview-status-filter-fb004.md)**.
- Two action buttons at top and bottom:
  - `<form method="POST" action="confirm/">` → "Import Valid Rows ({{ job.valid_rows }})"
  - `<a href="../../import/">` → "Fix & Re-upload" (sets job status to `cancelled` via GET handler)

### 7.4 bulk_export_status.html

- `<meta http-equiv="refresh" content="3">` while `status = pending | processing`
- When `status = completed`: shows download button linking to `export/<job_id>/download/`
- Total rows exported displayed
- If `status = failed`: shows error message, link to retry

---

## 8. File Retention & Cleanup

Both job models auto-populate `expires_at = created_at + FILE_RETENTION_DAYS` in their `save()` override on first creation. **`FILE_RETENTION_DAYS`** in **`apps/master_data/models.py`** (currently **30**) controls this globally.

The `purge_expired_bulk_files` Celery Beat task (see §5.4) runs daily and:
1. Iterates all non-public tenant schemas
2. Enters each schema with `schema_context`
3. Queries `BulkImportJob.objects.filter(expires_at__lte=now())`
4. For each expired job: calls `job.uploaded_file.delete(save=False)` → deletes the physical file from storage (local media or S3)
5. Deletes the DB record
6. Repeats for `BulkExportJob`

The download link on the export status page naturally becomes unavailable once the file is purged. The status page shows the `expires_at` timestamp so admins know when to download before expiry.

### 8.1 Operational Monitoring Requirements

The following items must be monitored in production. If any are absent, file accumulation, frozen jobs, or silent data loss will eventually occur without any alert.

#### Celery Beat Uptime

If Celery Beat goes down, both periodic tasks (`purge_expired_bulk_files` and `mark_stale_import_jobs`) stop running silently:

- Files and DB records accumulate without bound
- Stale jobs in `validating`/`importing` are never resolved; affected tenant admins see infinite spinners indefinitely

**Required monitoring**:

| Method | Description |
|---|---|
| **Heartbeat task** | Register a `celery_beat_heartbeat` task that runs every minute and writes a timestamp to Django's cache (Redis). A separate health-check endpoint reads this key and returns `503` if the timestamp is older than 3 minutes. Wire this to an uptime monitor (Sentry, Datadog, PagerDuty). |
| **django-celery-beat DB check** | `PeriodicTask.objects.filter(enabled=True, last_run_at__lte=now() - timedelta(minutes=10))` — alert if any enabled task has not run in 10 minutes. |
| **Sentry alert** | Configure `sentry-sdk` (already in `requirements/production.txt`) to capture `kombu.exceptions.OperationalError` with a dedicated alert rule — broker outages surface immediately rather than being silently swallowed. |

#### Worker Health

| Concern | Mitigation already in spec | Monitoring requirement |
|---|---|---|
| Worker SIGKILL / OOM | `acks_late=True` + redelivery + stale watchdog (§5.1, §5.2, §5.5) | Monitor worker count via Flower or `celery inspect ping`; alert if active worker count drops to 0 |
| Task queue depth | — | Alert if `bulk_import` / `bulk_export` queue length exceeds N tasks (configurable); indicates worker starvation |
| Repeated task failures | `max_retries=3` marks job `failed` | Monitor `BulkImportJob.objects.filter(status="failed")` count per tenant; spike indicates systemic issue |

#### Storage Health (S3 / local media)

The `purge_expired_bulk_files` task deletes files using `job.uploaded_file.delete(save=False)`. A storage error (S3 permission revoked, disk full) will raise an exception inside the `atomic()` block and roll back the DB deletion for that batch while the next batch proceeds. This means the DB record is not deleted but the file may or may not have been deleted, depending on when the error occurred.

**Required**: Log storage errors from the purge task to Sentry with the `job.id` and `tenant.schema_name` so they can be cleaned up manually. Do not suppress storage exceptions silently.

---

## 9. Unit Test Plan

Tests live in `tests/unit/test_master_data/` following the project's pytest + factory_boy + `schema_context` conventions established in `tests/unit/test_tenants/test_service.py`.

### 9.1 Test File Structure

```
tests/
├── unit/
│   └── test_master_data/
│       ├── test_import_configs.py    # §9.2 — FieldConfig & per-model configs
│       ├── test_import_service.py    # §9.3 — ImportService.validate + execute
│       ├── test_export_service.py    # §9.4 — ExportService.generate
│       ├── test_tasks.py             # §9.5 — Celery tasks (mocked services)
│       └── test_admin_views.py       # §9.6 — Admin HTTP views
├── factories/
│   └── master_data_factories.py      # extend existing file with BulkImportJobFactory
```

### 9.2 test_import_configs.py — Import Config Registry

**Scope**: `import_configs.py` — pure Python, no DB required.

| Test class | Test name | What it asserts |
|---|---|---|
| `TestFieldConfig` | `test_required_field_empty_value_invalid` | Empty string on required field → `is_valid=False`, error present |
| `TestFieldConfig` | `test_optional_field_empty_value_valid` | Empty string on optional field → valid, value absent from cleaned |
| `TestFieldConfig` | `test_choice_validator_rejects_unknown_value` | `vehicle_type="spaceship"` → error mentions valid choices |
| `TestFieldConfig` | `test_choice_validator_accepts_valid_value` | `vehicle_type="truck"` → valid |
| `TestFieldConfig` | `test_decimal_coercion_valid` | `"15.5"` → `Decimal("15.5")` in cleaned |
| `TestFieldConfig` | `test_decimal_coercion_invalid` | `"abc"` → error |
| `TestFieldConfig` | `test_date_coercion_valid` | `"2026-12-31"` → `date(2026, 12, 31)` |
| `TestFieldConfig` | `test_date_coercion_invalid` | `"31-12-2026"` → error |
| `TestFieldConfig` | `test_boolean_coercion_truthy_values` | `"true"/"1"/"yes"` → `True` |
| `TestFieldConfig` | `test_boolean_coercion_falsy_values` | `"false"/"0"/"no"` → `False` |
| `TestRegistryCompleteness` | `test_registry_contains_expected_models` | `IMPORT_REGISTRY.keys()` matches the models that expose bulk CSV (master_data six + `driver` + `helper` when `users` app is loaded) |
| `TestRegistryCompleteness` | `test_every_config_has_unique_lookup` | `config.unique_lookup` is non-empty for all configs |
| `TestRegistryCompleteness` | `test_get_csv_headers_returns_list_of_strings` | For each config, `get_csv_headers()` returns `list[str]` with at least one entry |
| `TestVehicleImportConfig` | `test_valid_row_passes` | Full valid vehicle row → `is_valid=True`, no errors |
| `TestVehicleImportConfig` | `test_missing_required_field_fails` | Row missing `capacity_mt` → `is_valid=False`, error names the field |
| `TestVehicleImportConfig` | `test_all_required_columns_present_in_headers` | Required field names are subset of `get_csv_headers()` |
| `TestProductImportConfig` | `test_invalid_uom_choice` | `uom="gallons"` → error with valid choices listed |
| `TestProductImportConfig` | `test_requires_qc_boolean_parsing` | `requires_qc="yes"` → `True` |
| *(Future)* `TestDriverImportConfig` | *if Driver CSV is added under `users`* | Full driver row passes |

### 9.3 test_import_service.py — ImportService

**Scope**: `ImportService.validate()` and `ImportService.execute()` — DB required, runs inside tenant `schema_context`.

```python
pytestmark = [pytest.mark.django_db, pytest.mark.unit]
```

**Fixtures**:
- `tenant` — from `conftest.py`
- `import_job(tenant, tmp_path)` — creates a `BulkImportJob` with a real CSV file using `factory_boy`; runs inside `schema_context(tenant.schema_name)`

| Test class | Test name | What it asserts |
|---|---|---|
| `TestImportServiceValidate` | `test_all_valid_rows_sets_preview_data` | All rows valid → `job.valid_rows == N`, `job.invalid_rows == 0`, `job.status == "preview_ready"` |
| `TestImportServiceValidate` | `test_mixed_rows_correct_counts` | 3 valid + 2 invalid rows → counts correct, each dict has `row_num`/`status`/`data`/`errors` |
| `TestImportServiceValidate` | `test_invalid_rows_contain_error_messages` | Invalid row's `errors` list is non-empty and descriptive |
| `TestImportServiceValidate` | `test_valid_rows_have_empty_errors` | Valid row's `errors` is `[]` |
| `TestImportServiceValidate` | `test_empty_csv_sets_zero_counts` | CSV with header only → `total_rows == 0`, `status == "preview_ready"` |
| `TestImportServiceValidate` | `test_utf8_bom_csv_parsed_correctly` | CSV with UTF-8 BOM (`\ufeff`) header → field names parsed without BOM prefix |
| `TestImportServiceValidate` | `test_non_csv_extension_raises_validation_error` | Job with `uploaded_file.name = "data.xlsx"` → `ValidationError` raised, `job.status` never set to `preview_ready` |
| `TestImportServiceValidate` | `test_row_count_exceeding_max_raises_validation_error` | CSV with `MAX_IMPORT_ROWS + 1` data rows → `ValidationError` with message mentioning `MAX_IMPORT_ROWS` |
| `TestImportServiceValidate` | `test_row_count_at_max_is_accepted` | CSV with exactly `MAX_IMPORT_ROWS` data rows → `status == "preview_ready"`, no error |
| `TestImportServiceExecute` | `test_valid_rows_written_to_db` | Execute with 3 valid vehicle rows → `Vehicle.objects.count() == 3` |
| `TestImportServiceExecute` | `test_import_valid_only_skips_invalid_rows` | 2 valid + 1 invalid, `import_valid_only=True` → 2 records created, `job.status == "completed"` |
| `TestImportServiceExecute` | `test_existing_record_updated_not_duplicated` | Row with existing `registration_number` → record updated, count unchanged |
| `TestImportServiceExecute` | `test_atomic_rollback_on_db_error_no_records_written` | Patch `config.perform_batch_import` to raise → 0 records in DB (full rollback) |
| `TestImportServiceExecute` | `test_status_completed_inside_atomic_block` | Patch `config.perform_batch_import` to raise → `job.status` remains `"importing"` (status save rolled back with rows) |
| `TestImportServiceExecute` | `test_completed_at_set_on_success` | After execute, `job.completed_at` is not `None` |
| `TestImportServiceExecute` | `test_status_set_to_completed` | `job.status == "completed"` after successful execute |

### 9.4 test_export_service.py — ExportService

**Scope**: `ExportService.generate()` — DB required.

| Test class | Test name | What it asserts |
|---|---|---|
| `TestExportServiceGenerate` | `test_generates_csv_with_correct_headers` | First line of CSV matches `config.get_csv_headers()` |
| `TestExportServiceGenerate` | `test_row_count_matches_active_records` | 5 vehicles created → `job.total_rows == 5`, CSV has 6 lines (header + 5) |
| `TestExportServiceGenerate` | `test_inactive_records_excluded` | 1 active + 1 inactive vehicle → only 1 data row in CSV |
| `TestExportServiceGenerate` | `test_result_file_saved_to_job` | After generate, `job.result_file.name` is non-empty |
| `TestExportServiceGenerate` | `test_csv_encoded_with_utf8_bom` | File bytes start with `b'\xef\xbb\xbf'` (UTF-8 BOM) |
| `TestExportServiceGenerate` | `test_empty_queryset_produces_header_only_csv` | No records → CSV has exactly 1 line |
| `TestExportServiceGenerate` | `test_status_set_to_completed` | `job.status == "completed"` after generate |

### 9.5 test_tasks.py — Celery Tasks

**Scope**: Tasks called synchronously (no worker needed) with services mocked. Uses `unittest.mock.patch`.

```python
pytestmark = [pytest.mark.django_db, pytest.mark.unit]
```

| Test class | Test name | What it asserts |
|---|---|---|
| `TestValidateBulkImportTask` | `test_calls_import_service_validate` | `ImportService.validate` called with correct job object |
| `TestValidateBulkImportTask` | `test_sets_status_to_validating_before_service` | `job.status == "validating"` when service is called (captured via side_effect) |
| `TestValidateBulkImportTask` | `test_sets_status_to_failed_on_exception` | When `ImportService.validate` raises, `job.status == "failed"` and `job.error_summary` is populated |
| `TestValidateBulkImportTask` | `test_retries_on_exception` | `self.retry` called when service raises (mock `max_retries=0` to avoid infinite loop) |
| `TestExecuteBulkImportTask` | `test_calls_import_service_execute_with_correct_args` | `ImportService.execute(job, import_valid_only=True)` called |
| `TestExecuteBulkImportTask` | `test_sets_status_to_importing_before_service` | `job.status == "importing"` when service runs |
| `TestExecuteBulkImportTask` | `test_sets_status_to_failed_on_exception` | Exception → `job.status == "failed"` |
| `TestGenerateBulkExportTask` | `test_calls_export_service_generate` | `ExportService.generate(job)` called |
| `TestGenerateBulkExportTask` | `test_sets_status_to_processing` | `job.status == "processing"` when service runs |
| `TestGenerateBulkExportTask` | `test_sets_status_to_failed_on_exception` | Exception → `job.status == "failed"` |
| `TestValidateBulkImportTask` | `test_acks_late_set_on_task` | Task decorator has `acks_late=True` and `reject_on_worker_lost=True` — verified via `validate_bulk_import.acks_late` and `validate_bulk_import.reject_on_worker_lost` attributes |
| `TestExecuteBulkImportTask` | `test_acks_late_set_on_task` | Same check on `execute_bulk_import` task |
| `TestPurgeExpiredBulkFilesTask` | `test_deletes_expired_import_job_and_file` | Expired `BulkImportJob` → DB record deleted, `uploaded_file.delete()` called |
| `TestPurgeExpiredBulkFilesTask` | `test_deletes_expired_export_job_and_file` | Expired `BulkExportJob` → DB record deleted, `result_file.delete()` called |
| `TestPurgeExpiredBulkFilesTask` | `test_does_not_delete_non_expired_jobs` | Job with `expires_at` in future → not deleted |
| `TestPurgeExpiredBulkFilesTask` | `test_iterates_all_tenant_schemas` | Called with 2 tenants → `schema_context` entered twice |
| `TestPurgeExpiredBulkFilesTask` | `test_select_for_update_skip_locked_called` | `select_for_update(skip_locked=True)` called — verified by patching the queryset method |
| `TestPurgeExpiredBulkFilesTask` | `test_second_concurrent_call_skips_locked_rows` | Two concurrent calls; second worker deletes 0 records — no double-delete exception |
| `TestMarkStaleImportJobsTask` | `test_marks_validating_job_as_failed_after_timeout` | `BulkImportJob(status="validating", updated_at=now()-35min)` → `status == "failed"` after task runs |
| `TestMarkStaleImportJobsTask` | `test_marks_importing_job_as_failed_after_timeout` | Same for `status="importing"` |
| `TestMarkStaleImportJobsTask` | `test_marks_pending_job_as_failed_after_timeout` | `status="pending"` stuck for 35 minutes → `failed` (task was never picked up by any worker) |
| `TestMarkStaleImportJobsTask` | `test_does_not_touch_recently_updated_job` | Job in `validating` but `updated_at=now()-5min` → status unchanged |
| `TestMarkStaleImportJobsTask` | `test_does_not_touch_terminal_jobs` | Jobs in `completed`, `failed`, `cancelled`, `preview_ready` → none changed |
| `TestMarkStaleImportJobsTask` | `test_marks_stale_export_job_failed` | `BulkExportJob(status="processing", updated_at=now()-35min)` → `failed` |
| `TestMarkStaleImportJobsTask` | `test_error_summary_contains_actionable_message` | Failed job's `error_summary[0]` mentions "re-upload" to guide the admin |
| `TestMarkStaleImportJobsTask` | `test_skip_locked_used_on_stale_query` | `select_for_update(skip_locked=True)` called — concurrent calls safe |

### 9.6 test_admin_views.py — Admin HTTP Views

**Scope**: Admin URL responses. Uses `django.test.Client` logged in as a staff/tenant user inside `schema_context`. Celery tasks are mocked with `patch(...delay)`.

| Test class | Test name | What it asserts |
|---|---|---|
| `TestImportUploadView` | `test_get_returns_upload_form` | GET `/admin/master_data/vehicle/import/` → HTTP 200, contains `<form` |
| `TestImportUploadView` | `test_get_template_download_returns_csv` | GET with `?template=1` → `Content-Type: text/csv`, correct headers in body |
| `TestImportUploadView` | `test_post_valid_csv_creates_job_and_fires_task` | POST with valid CSV file → `BulkImportJob` created, `validate_bulk_import.delay` called once, HTTP 302 |
| `TestImportUploadView` | `test_post_non_csv_file_rejected` | POST with `.xlsx` → HTTP 200 with form error, no job created |
| `TestImportUploadView` | `test_post_empty_file_rejected` | POST with empty file → HTTP 200 with form error |
| `TestImportUploadView` | `test_post_broker_down_marks_job_failed_and_shows_error` | `validate_bulk_import.delay` raises `OperationalError` → `job.status == "failed"`, response is HTTP 200 with error message (not HTTP 302), no orphaned `pending` job left |
| `TestImportUploadView` | `test_unauthenticated_redirects_to_login` | No session → HTTP 302 to login |
| `TestImportStatusView` | `test_failed_status_omits_meta_refresh` | `status=failed` → response HTML does NOT contain `<meta http-equiv="refresh"` |
| `TestImportStatusView` | `test_failed_status_shows_reupload_link` | `status=failed` → response HTML contains link back to upload page |
| `TestImportStatusView` | `test_pending_status_includes_meta_refresh` | `status=pending` → response HTML contains `<meta http-equiv="refresh"` |
| `TestImportStatusView` | `test_returns_json_with_status_fields` | GET `status.json` → `{"status": "validating", "valid_rows": 0, "invalid_rows": 0}` |
| `TestImportPreviewView` | `test_returns_paginated_preview` | GET preview page with 25 rows in preview_data → page 1 has 20 rows, `has_next=True` |
| `TestImportPreviewView` | `test_page_2_shows_remaining_rows` | GET `?page=2` → 5 rows on page 2 |
| `TestImportPreviewView` | `test_job_not_found_returns_404` | Unknown `job_id` → HTTP 404 |
| `TestImportConfirmView` | `test_post_fires_execute_task` | POST confirm → `execute_bulk_import.delay` called with correct args, HTTP 302 |
| `TestImportConfirmView` | `test_confirm_sets_job_status_to_confirmed` | After POST, `job.status == "confirmed"` |
| `TestImportConfirmView` | `test_get_not_allowed` | GET confirm → HTTP 405 |
| `TestExportTriggerView` | `test_post_creates_export_job_and_fires_task` | POST → `BulkExportJob` created, `generate_bulk_export.delay` called, HTTP 302 |
| `TestExportTriggerView` | `test_get_not_allowed` | GET → HTTP 405 |
| `TestExportStatusView` | `test_completed_job_shows_download_link` | `status=completed`, `result_file` set → response contains download URL |
| `TestExportStatusView` | `test_pending_job_shows_spinner` | `status=pending` → no download link |

---

## 10. REST API Layer

The REST API runs **in parallel with the Django admin SSR flow** and shares the exact same service layer (`ImportService`, `ExportService`) and Celery tasks. No business logic is duplicated between the two surfaces. The API adds only serializers and ViewSets on top of the shared core.

```
                    ┌─────────────────────────────┐
                    │     Shared Core Layer        │
                    │  ImportService               │
                    │  ExportService               │
                    │  Celery Tasks                │
                    │  IMPORT_REGISTRY             │
                    └──────────┬──────────────────-┘
                               │
              ┌────────────────┴─────────────────┐
              │                                   │
   ┌──────────▼──────────┐           ┌────────────▼────────────┐
   │   Django Admin SSR  │           │   DRF REST API          │
   │   BulkImportExport  │           │   BulkImportViewSet     │
   │   Mixin + Templates │           │   BulkExportViewSet     │
   │   (§6, §7)          │           │   Serializers (§10.3)   │
   └─────────────────────┘           └─────────────────────────┘
      Browser / Admin UI               Frontend Apps / Mobile
```

### 10.1 Design Decisions

**Why separate `BulkImportViewSet` / `BulkExportViewSet` rather than `@action` on existing ViewSets?**

The existing `VehicleViewSet`, `DriverViewSet` etc. are model-CRUD-focused (one resource, standard list/create/retrieve/update/destroy). Import/export jobs are their own resources with their own lifecycle and a `model_name` field that captures context. Merging them into existing ViewSets would:

- Break Single Responsibility Principle — CRUD and async job management are different concerns
- Produce awkward URLs: `/vehicles/import/{job_uuid}/` where `{job_uuid}` is not a vehicle PK
- Force every entity ViewSet to grow with import/export actions, making them hard to read

Two dedicated ViewSets registered alongside the existing ones is the clean separation.

**Why not per-model nested routes?**

RESTful nested routes (`/vehicles/bulk-imports/`) require either `drf-nested-routers` (new dependency) or manual URL wiring. The `model_name` field on the job model serves as the routing context equivalently, and the flat structure is simpler to consume and document.

### 10.2 Endpoints

Registered at **`/api/v1/bulk-imports/`** and **`/api/v1/bulk-exports/`** (see `config/urls.py` → `apps/master_data/urls.py`).

#### Import Endpoints

| Method | URL | Purpose | Status |
|---|---|---|---|
| `POST` | `/bulk-imports/` | Upload CSV + create job + fire validation | 202 |
| `GET` | `/bulk-imports/{id}/` | Job status; paginated preview when `preview_ready` | 200 |
| `POST` | `/bulk-imports/{id}/confirm/` | Confirm import (fire execute task) | 202 |
| `DELETE` | `/bulk-imports/{id}/` | Cancel a pending/preview_ready job | 204 |
| `GET` | `/bulk-imports/template/` | Download headers-only CSV template | 200 |

#### Export Endpoints

| Method | URL | Purpose | Status |
|---|---|---|---|
| `POST` | `/bulk-exports/` | Trigger async export | 202 |
| `GET` | `/bulk-exports/{id}/` | Job status + download URL when complete | 200 |
| `GET` | `/bulk-exports/{id}/download/` | Stream result CSV file | 200 |

### 10.3 Serializers

New serializers appended to `apps/master_data/serializers.py`:

```python
from .models import BulkImportJob, BulkExportJob
from .import_configs import IMPORT_REGISTRY

MODEL_NAME_CHOICES = list(IMPORT_REGISTRY.keys())


class BulkImportUploadSerializer(serializers.Serializer):
    """
    Validates the multipart/form-data upload request.

    File type is validated here (serializer/API surface) AND again in
    ImportService.validate() (service layer). The double-check is intentional:
    the serializer gives a clean 400 to API callers before any DB row is
    created; the service-layer guard is defence-in-depth for any path that
    bypasses the serializer (e.g. admin form, management commands).
    """
    model_name = serializers.ChoiceField(choices=MODEL_NAME_CHOICES)
    csv_file   = serializers.FileField()

    def validate_csv_file(self, file):
        name = getattr(file, "name", "") or ""
        content_type = getattr(file, "content_type", "") or ""

        if not name.lower().endswith(".csv"):
            raise serializers.ValidationError(
                "Only .csv files are accepted. "
                f"Received: '{name}'."
            )
        allowed_types = {
            "text/csv", "text/plain",
            "application/csv", "application/octet-stream",
        }
        if content_type and content_type.split(";")[0].strip() not in allowed_types:
            raise serializers.ValidationError(
                f"Unexpected content type '{content_type}'. "
                "Upload a plain CSV file."
            )
        return file


class BulkImportJobSerializer(serializers.ModelSerializer):
    """Job status/metadata response — all fields read-only."""
    class Meta:
        model  = BulkImportJob
        fields = [
            "id", "model_name", "status",
            "total_rows", "processed_rows", "valid_rows", "invalid_rows",
            "error_summary", "created_at", "completed_at", "expires_at",
        ]
        read_only_fields = fields


class BulkImportPreviewRowSerializer(serializers.Serializer):
    row_num = serializers.IntegerField()
    status  = serializers.ChoiceField(choices=["valid", "invalid"])
    data    = serializers.DictField()
    errors  = serializers.ListField(child=serializers.CharField())


class BulkImportPreviewSerializer(serializers.Serializer):
    """
    Wraps job metadata + one page of preview rows.
    Constructed manually in the ViewSet retrieve() method
    (not a ModelSerializer — preview_data is paged in Python before serialization).
    """
    job         = BulkImportJobSerializer()
    rows        = BulkImportPreviewRowSerializer(many=True)
    count       = serializers.IntegerField()
    page        = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    page_size   = serializers.IntegerField()
    next        = serializers.URLField(allow_null=True)
    previous    = serializers.URLField(allow_null=True)


class BulkImportConfirmSerializer(serializers.Serializer):
    import_valid_only = serializers.BooleanField(default=True)


class BulkExportTriggerSerializer(serializers.Serializer):
    model_name = serializers.ChoiceField(choices=MODEL_NAME_CHOICES)


class BulkExportJobSerializer(serializers.ModelSerializer):
    """Adds a computed download_url field — null until status=completed."""
    download_url = serializers.SerializerMethodField()

    class Meta:
        model  = BulkExportJob
        fields = [
            "id", "model_name", "status", "total_rows", "processed_rows",
            "download_url", "created_at", "completed_at", "expires_at",
        ]
        read_only_fields = fields

    def get_download_url(self, obj) -> str | None:
        if obj.status != "completed" or not obj.result_file:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(
                reverse("bulk-export-download", kwargs={"pk": obj.pk})
            )
        return None
```

### 10.4 ViewSets

New ViewSets appended to `apps/master_data/views.py`:

```python
from django.core.paginator import Paginator
from django.db import connection
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .import_configs import IMPORT_REGISTRY
from .models import BulkExportJob, BulkImportJob
from .serializers import (
    BulkExportJobSerializer, BulkExportTriggerSerializer,
    BulkImportConfirmSerializer, BulkImportJobSerializer,
    BulkImportPreviewSerializer, BulkImportUploadSerializer,
)
from .tasks import execute_bulk_import, generate_bulk_export, validate_bulk_import


class BulkImportViewSet(viewsets.GenericViewSet):
    """
    Full import lifecycle via REST.
    Reuses ImportService + Celery tasks shared with the Django admin flow.
    """
    permission_classes = [IsTenantUser]
    queryset = BulkImportJob.objects.all()

    PAGE_SIZE = 20

    def create(self, request):
        """POST /bulk-imports/ — upload CSV, create job, fire validation task."""
        # Tenant rate limiting: max 3 active import jobs per tenant
        active_jobs = BulkImportJob.objects.filter(status__in=["pending", "validating", "importing"]).count()
        if active_jobs >= 3:
            return Response(
                {"detail": "Maximum number of concurrent import jobs (3) reached. Please wait for them to finish."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = BulkImportUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = BulkImportJob.objects.create(
            model_name    = serializer.validated_data["model_name"],
            schema_name   = connection.schema_name,
            uploaded_file = serializer.validated_data["csv_file"],
            created_by    = request.user,
        )
        try:
            validate_bulk_import.delay(str(job.id), job.schema_name)
        except OperationalError:
            # Broker is unreachable — mark the job failed immediately so
            # the client receives a 503 rather than polling a frozen job forever.
            job.status = "failed"
            job.error_summary = ["Task queue is unavailable. Please try again."]
            job.save(update_fields=["status", "error_summary"])
            return Response(
                {"detail": "Task queue is currently unavailable. Please retry shortly."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            BulkImportJobSerializer(job).data,
            status=status.HTTP_202_ACCEPTED,
        )

    def retrieve(self, request, pk=None):
        """
        GET /bulk-imports/{id}/?page=N
        Returns job status. When status=preview_ready, includes one page of preview rows.
        """
        job = get_object_or_404(BulkImportJob, pk=pk)
        page_num   = int(request.query_params.get("page", 1))
        paginator  = Paginator(job.preview_data, self.PAGE_SIZE)
        page_obj   = paginator.get_page(page_num)

        def _page_url(p):
            req = request.build_absolute_uri(request.path)
            return f"{req}?page={p}"

        data = BulkImportPreviewSerializer({
            "job":         job,
            "rows":        list(page_obj),
            "count":       paginator.count,
            "page":        page_num,
            "total_pages": paginator.num_pages,
            "page_size":   self.PAGE_SIZE,
            "next":        _page_url(page_num + 1) if page_obj.has_next() else None,
            "previous":    _page_url(page_num - 1) if page_obj.has_previous() else None,
        }, context={"request": request}).data
        return Response(data)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """POST /bulk-imports/{id}/confirm/ — confirm and enqueue execute task."""
        job = get_object_or_404(BulkImportJob, pk=pk)
        if job.status != "preview_ready":
            return Response(
                {"detail": f"Cannot confirm a job with status '{job.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = BulkImportConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job.status = "confirmed"
        job.save(update_fields=["status"])
        try:
            execute_bulk_import.delay(
                str(job.id),
                job.schema_name,
                serializer.validated_data["import_valid_only"],
            )
        except OperationalError:
            job.status = "failed"
            job.error_summary = ["Task queue is unavailable. Please try again."]
            job.save(update_fields=["status", "error_summary"])
            return Response(
                {"detail": "Task queue is currently unavailable. Please retry shortly."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            BulkImportJobSerializer(job).data,
            status=status.HTTP_202_ACCEPTED,
        )

    def destroy(self, request, pk=None):
        """DELETE /bulk-imports/{id}/ — cancel a pre-confirm job."""
        job = get_object_or_404(BulkImportJob, pk=pk)
        if job.status not in ("pending", "validating", "preview_ready"):
            return Response(
                {"detail": "Cannot cancel a job that is already confirmed or completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        job.status = "cancelled"
        job.save(update_fields=["status"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="template")
    def template_download(self, request):
        """GET /bulk-imports/template/?model_name=vehicle — headers-only CSV."""
        model_name = request.query_params.get("model_name", "")
        if model_name not in IMPORT_REGISTRY:
            return Response(
                {"detail": f"Unknown model_name '{model_name}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        config   = IMPORT_REGISTRY[model_name]
        response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
        response["Content-Disposition"] = (
            f'attachment; filename="{model_name}_import_template.csv"'
        )
        writer = csv.DictWriter(response, fieldnames=config.get_csv_headers())
        writer.writeheader()
        return response


class BulkExportViewSet(viewsets.GenericViewSet):
    """Handles async export lifecycle via REST."""
    permission_classes = [IsTenantUser]
    queryset = BulkExportJob.objects.all()

    def create(self, request):
        """POST /bulk-exports/ — trigger export, return 202 immediately."""
        # Tenant rate limiting: max 3 active export jobs per tenant
        active_jobs = BulkExportJob.objects.filter(status__in=["pending", "processing"]).count()
        if active_jobs >= 3:
            return Response(
                {"detail": "Maximum number of concurrent export jobs (3) reached. Please wait for them to finish."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = BulkExportTriggerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = BulkExportJob.objects.create(
            model_name  = serializer.validated_data["model_name"],
            schema_name = connection.schema_name,
            created_by  = request.user,
        )
        try:
            generate_bulk_export.delay(str(job.id), job.schema_name)
        except OperationalError:
            job.status = "failed"
            job.save(update_fields=["status"])
            return Response(
                {"detail": "Task queue is currently unavailable. Please retry shortly."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            BulkExportJobSerializer(job, context={"request": request}).data,
            status=status.HTTP_202_ACCEPTED,
        )

    def retrieve(self, request, pk=None):
        """GET /bulk-exports/{id}/ — job status + download_url when completed."""
        job = get_object_or_404(BulkExportJob, pk=pk)
        return Response(BulkExportJobSerializer(job, context={"request": request}).data)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """GET /bulk-exports/{id}/download/ — stream result CSV as attachment."""
        job = get_object_or_404(BulkExportJob, pk=pk, status="completed")
        if not job.result_file:
            return Response(
                {"detail": "Export file is not available."},
                status=status.HTTP_404_NOT_FOUND,
            )
        response = FileResponse(
            job.result_file.open("rb"),
            content_type="text/csv",
        )
        filename = os.path.basename(job.result_file.name)
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
```

### 10.5 URL Registration

`apps/master_data/urls.py` — append two `router.register` calls:

```python
from .views import BulkExportViewSet, BulkImportViewSet

router.register("bulk-imports", BulkImportViewSet, basename="bulk-import")
router.register("bulk-exports", BulkExportViewSet, basename="bulk-export")
```

This produces the routes in §10.2 under the existing `/api/v1/master-data/` prefix with zero manual URL wiring.

### 10.6 Request / Response Contract

**POST `/bulk-imports/`** (multipart/form-data):

```
model_name: "vehicle"
csv_file:   <binary CSV>
```

Response `202 Accepted`:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "model_name": "vehicle",
  "status": "pending",
  "total_rows": 0,
  "processed_rows": 0,
  "valid_rows": 0,
  "invalid_rows": 0,
  "error_summary": [],
  "created_at": "2026-04-01T10:00:00Z",
  "completed_at": null,
  "expires_at": "2026-04-08T10:00:00Z"
}
```

**GET `/bulk-imports/{id}/?page=1`** (after validation completes):

```json
{
  "job": {
    "id": "550e8400-...",
    "model_name": "vehicle",
    "status": "preview_ready",
    "total_rows": 55,
    "processed_rows": 55,
    "valid_rows": 52,
    "invalid_rows": 3,
    "error_summary": [],
    "created_at": "2026-04-01T10:00:00Z",
    "completed_at": null,
    "expires_at": "2026-04-08T10:00:00Z"
  },
  "rows": [
    {
      "row_num": 2,
      "status": "valid",
      "data": { "registration_number": "DHA-1234", "vehicle_type": "truck", "capacity_mt": "15.500" },
      "errors": []
    },
    {
      "row_num": 3,
      "status": "invalid",
      "data": { "registration_number": "", "vehicle_type": "spaceship", "capacity_mt": "abc" },
      "errors": [
        "registration_number: This field is required.",
        "vehicle_type: 'spaceship' is not a valid choice. Valid: truck, pickup, tanker, container, covered_van, open_truck.",
        "capacity_mt: Enter a valid decimal number."
      ]
    }
  ],
  "count": 55,
  "page": 1,
  "total_pages": 3,
  "page_size": 20,
  "next": "https://tenant.dfms.com/api/v1/master-data/bulk-imports/550e8400-.../?page=2",
  "previous": null
}
```

**POST `/bulk-imports/{id}/confirm/`**:

```json
{ "import_valid_only": true }
```

Response `202 Accepted` — same shape as job status with `status: "confirmed"`.

**POST `/bulk-exports/`**:

```json
{ "model_name": "vehicle" }
```

Response `202 Accepted`:

```json
{
  "id": "661f9511-...",
  "model_name": "vehicle",
  "status": "pending",
  "total_rows": 0,
  "processed_rows": 0,
  "download_url": null,
  "created_at": "2026-04-01T11:00:00Z",
  "completed_at": null,
  "expires_at": "2026-04-08T11:00:00Z"
}
```

**GET `/bulk-exports/{id}/`** (after completion):

```json
{
  "id": "661f9511-...",
  "model_name": "vehicle",
  "status": "completed",
  "total_rows": 247,
  "processed_rows": 247,
  "download_url": "https://tenant.dfms.com/api/v1/master-data/bulk-exports/661f9511-.../download/",
  "created_at": "2026-04-01T11:00:00Z",
  "completed_at": "2026-04-01T11:00:42Z",
  "expires_at": "2026-04-08T11:00:00Z"
}
```

### 10.7 Error Responses

| Scenario | Status | Response body |
|---|---|---|
| Unknown `model_name` | 400 | `{"model_name": ["Value 'xyz' is not a valid choice."]}` |
| Non-file or empty upload | 400 | `{"csv_file": ["No file was submitted."]}` |
| Job not found | 404 | `{"detail": "Not found."}` |
| Confirm job not in `preview_ready` | 400 | `{"detail": "Cannot confirm a job with status 'importing'."}` |
| Cancel confirmed/completed job | 400 | `{"detail": "Cannot cancel a job that is already confirmed or completed."}` |
| Download on non-completed job | 404 | `{"detail": "Not found."}` (via `get_object_or_404(status="completed")`) |
| Unauthenticated request | 401 | `{"detail": "Authentication credentials were not provided."}` |
| Too many active jobs | 429 | `{"detail": "Maximum number of concurrent import jobs (3) reached. Please wait for them to finish."}` |
| Celery broker unreachable at enqueue | 503 | `{"detail": "Task queue is currently unavailable. Please retry shortly."}` — job is marked `failed` before response; no orphaned `pending` record |

### 10.8 API Test Plan

Two additional test files complement §9.

#### test_api_serializers.py — Serializer Unit Tests

**Scope**: Pure serializer validation, no DB, no HTTP.

| Test class | Test name | What it asserts |
|---|---|---|
| `TestBulkImportUploadSerializer` | `test_valid_csv_file_passes` | Valid `model_name` + `.csv` file → `is_valid=True` |
| `TestBulkImportUploadSerializer` | `test_invalid_model_name_rejected` | `model_name="spaceship"` → error on `model_name` |
| `TestBulkImportUploadSerializer` | `test_missing_csv_file_rejected` | No `csv_file` field → error on `csv_file` |
| `TestBulkImportUploadSerializer` | `test_xlsx_extension_rejected` | File with `name="data.xlsx"` → `ValidationError` on `csv_file` mentioning extension |
| `TestBulkImportUploadSerializer` | `test_txt_extension_rejected` | File with `name="data.txt"` → `ValidationError` on `csv_file` |
| `TestBulkImportUploadSerializer` | `test_invalid_content_type_rejected` | `content_type="application/vnd.ms-excel"` → `ValidationError` on `csv_file` |
| `TestBulkImportUploadSerializer` | `test_octet_stream_content_type_accepted` | `content_type="application/octet-stream"` + `.csv` name → `is_valid=True` (browsers sometimes send this) |
| `TestBulkImportUploadSerializer` | `test_no_content_type_accepted_if_extension_valid` | `content_type=""` + `name="data.csv"` → `is_valid=True` (content_type check skipped when absent) |
| `TestBulkImportJobSerializer` | `test_status_field_is_read_only` | Attempt to pass `status` in data → field silently ignored |
| `TestBulkImportPreviewSerializer` | `test_pagination_fields_all_present` | Serialized output has `count`, `page`, `total_pages`, `next`, `previous` |
| `TestBulkImportPreviewSerializer` | `test_rows_serialized_correctly` | `rows` list has `row_num`, `status`, `data`, `errors` for each entry |
| `TestBulkImportConfirmSerializer` | `test_import_valid_only_defaults_true` | Empty body → `import_valid_only=True` |
| `TestBulkImportConfirmSerializer` | `test_import_valid_only_false_accepted` | `{"import_valid_only": false}` → `False` |
| `TestBulkExportJobSerializer` | `test_download_url_null_when_pending` | `status=pending` job → `download_url=null` |
| `TestBulkExportJobSerializer` | `test_download_url_absolute_when_completed` | `status=completed` + mock `request` → `download_url` starts with `http` |
| `TestBulkExportJobSerializer` | `test_download_url_null_without_request_context` | No `request` in context → `download_url=null` (safe fallback) |
| `TestBulkExportTriggerSerializer` | `test_invalid_model_name_rejected` | Unknown model → validation error |

#### test_bulk_import_export_api.py — Integration Tests

**Scope**: Full HTTP roundtrip using `TenantClient` (from `conftest.py`) authenticated as `tenant_admin`. Celery tasks mocked with `@patch(...delay)`.

```python
pytestmark = [pytest.mark.django_db, pytest.mark.integration]
```

| Test class | Test name | What it asserts |
|---|---|---|
| `TestBulkImportUploadAPI` | `test_post_valid_csv_returns_202` | POST valid CSV → 202, body has `id` and `status=pending` |
| `TestBulkImportUploadAPI` | `test_post_creates_job_in_db` | After POST, `BulkImportJob.objects.count() == 1` |
| `TestBulkImportUploadAPI` | `test_post_fires_validate_task_with_correct_args` | `validate_bulk_import.delay` called with `(str(job.id), schema_name)` |
| `TestBulkImportUploadAPI` | `test_post_invalid_model_name_returns_400` | `model_name="invalid"` → 400, no job created |
| `TestBulkImportUploadAPI` | `test_post_no_file_returns_400` | Missing `csv_file` → 400 |
| `TestBulkImportUploadAPI` | `test_post_xlsx_file_returns_400_before_job_created` | POST `.xlsx` file → 400, `BulkImportJob.objects.count() == 0` (rejected at serializer, no job created) |
| `TestBulkImportUploadAPI` | `test_post_wrong_content_type_returns_400` | `content_type="application/vnd.ms-excel"` + `.csv` name → 400 |
| `TestBulkImportUploadAPI` | `test_broker_down_returns_503_and_marks_job_failed` | `validate_bulk_import.delay` raises `OperationalError` → 503, `job.status == "failed"`, `job.error_summary` non-empty, no orphaned `pending` job |
| `TestBulkImportUploadAPI` | `test_unauthenticated_returns_401` | No JWT → 401 |
| `TestBulkImportUploadAPI` | `test_rate_limit_rejects_fourth_active_job` | 3 pending jobs exist → POST returns 429 |
| `TestBulkImportConfirmAPI` | `test_broker_down_on_confirm_returns_503_and_marks_job_failed` | `execute_bulk_import.delay` raises `OperationalError` → 503, job status reverted to `failed` |
| `TestBulkExportTriggerAPI` | `test_broker_down_returns_503_and_marks_export_job_failed` | `generate_bulk_export.delay` raises `OperationalError` → 503, `job.status == "failed"` |
| `TestBulkExportTriggerAPI` | `test_rate_limit_rejects_fourth_active_export_job` | 3 pending export jobs exist → POST returns 429 |
| `TestBulkImportRetrieveAPI` | `test_get_pending_job_returns_200_with_empty_rows` | GET pending job → 200, `rows=[]`, `count=0` |
| `TestBulkImportRetrieveAPI` | `test_get_preview_ready_job_returns_rows` | Job with 5 preview rows → 200, `rows` has 5 items |
| `TestBulkImportRetrieveAPI` | `test_preview_paginated_20_per_page` | Job with 25 rows → `?page=1` returns 20 rows, `total_pages=2` |
| `TestBulkImportRetrieveAPI` | `test_page_2_returns_remaining_5_rows` | `?page=2` → 5 rows, `previous` is non-null, `next` is null |
| `TestBulkImportRetrieveAPI` | `test_nonexistent_job_returns_404` | Random UUID → 404 |
| `TestBulkImportConfirmAPI` | `test_confirm_preview_ready_job_returns_202` | POST confirm → 202, `status=confirmed` |
| `TestBulkImportConfirmAPI` | `test_confirm_fires_execute_task_with_correct_args` | `execute_bulk_import.delay` called with `(str(job.id), schema, True)` |
| `TestBulkImportConfirmAPI` | `test_confirm_non_preview_ready_job_returns_400` | Job in `importing` state → 400 |
| `TestBulkImportConfirmAPI` | `test_import_valid_only_false_passed_to_task` | Body `{"import_valid_only": false}` → task called with `False` |
| `TestBulkImportConfirmAPI` | `test_get_confirm_url_returns_405` | GET confirm endpoint → 405 |
| `TestBulkImportCancelAPI` | `test_delete_pending_job_returns_204` | DELETE pending job → 204, `job.status == "cancelled"` |
| `TestBulkImportCancelAPI` | `test_delete_preview_ready_job_returns_204` | DELETE `preview_ready` job → 204 |
| `TestBulkImportCancelAPI` | `test_delete_confirmed_job_returns_400` | DELETE `confirmed` job → 400 |
| `TestBulkImportCancelAPI` | `test_delete_completed_job_returns_400` | DELETE `completed` job → 400 |
| `TestTemplateDownloadAPI` | `test_get_valid_model_returns_csv` | `?model_name=vehicle` → 200, `Content-Type: text/csv`, first row = vehicle headers |
| `TestTemplateDownloadAPI` | `test_template_has_no_data_rows` | Only 1 line in CSV (the header) |
| `TestTemplateDownloadAPI` | `test_get_unknown_model_returns_400` | `?model_name=unknown` → 400 |
| `TestTemplateDownloadAPI` | `test_all_8_models_return_valid_template` | Parameterized: each registry key → 200 |
| `TestBulkExportTriggerAPI` | `test_post_valid_trigger_returns_202` | POST `{model_name: "product"}` → 202, `status=pending`, `download_url=null` |
| `TestBulkExportTriggerAPI` | `test_post_creates_export_job_in_db` | `BulkExportJob.objects.count() == 1` |
| `TestBulkExportTriggerAPI` | `test_post_fires_generate_task_with_correct_args` | `generate_bulk_export.delay` called with `(str(job.id), schema_name)` |
| `TestBulkExportTriggerAPI` | `test_post_invalid_model_name_returns_400` | Unknown model → 400 |
| `TestBulkExportStatusAPI` | `test_get_pending_job_has_null_download_url` | GET pending job → `download_url=null` |
| `TestBulkExportStatusAPI` | `test_get_completed_job_has_absolute_download_url` | GET completed job → `download_url` is full HTTPS URL ending in `/download/` |
| `TestBulkExportDownloadAPI` | `test_download_completed_job_returns_csv_stream` | GET download → 200, `Content-Type: text/csv`, `Content-Disposition: attachment` |
| `TestBulkExportDownloadAPI` | `test_download_pending_job_returns_404` | GET download on pending job → 404 |

---

## 11. Implementation Order

The recommended sequence ensures each layer is testable before the next builds on it. The SSR admin and REST API tracks run in parallel after the shared core is in place.

```
── Shared Core ────────────────────────────────────────────────────────────
1. models.py         — BulkImportJob, BulkExportJob, expires_at (+ migration)
2. import_configs.py — `IMPORT_REGISTRY` + configs for each bulk-enabled model (`master_data` + `users` driver/helper)
3. services.py       — ImportService + ExportService (.iterator streaming)
4. tasks.py          — 4 Celery tasks (validate, execute, export, purge)
   ↑ Write unit tests §9.2 – §9.5 here

── SSR Track ───────────────────────────────── ── REST API Track ──────────
5a. admin.py                                   5b. serializers.py
    BulkImportExportMixin                           7 new serializers
    ModelAdmins that mix in bulk + registry        5c. views.py
    (optional) BulkImportJobAdmin                   BulkImportViewSet
    (optional) BulkExportJobAdmin                   BulkExportViewSet
6a. Templates                                  5d. urls.py
    4 new HTML templates                            2 new router.register()
    change_list.html buttons                   ↑ Write API tests §9.6 + §10.8
   ↑ Write admin tests §9.6 here

── Final ──────────────────────────────────────────────────────────────────
7. config/settings/base.py — Celery Beat schedule entry for purge task
```

---

## 12. Files Changed

| File | Type | Change |
|---|---|---|
| `apps/master_data/models.py` | Modified | Add `BulkImportJob`, `BulkExportJob`, `FILE_RETENTION_DAYS` |
| `apps/master_data/import_configs.py` | New | `FieldConfig`, `BaseImportConfig`, per-model configs, `IMPORT_REGISTRY` |
| `apps/master_data/services.py` | Modified | Replace `BulkUploadService` with `ImportService` + `ExportService` |
| `apps/master_data/tasks.py` | New | 5 Celery tasks (validate, execute, export, purge, mark_stale) |
| `apps/master_data/admin.py` | Modified | `BulkImportExportMixin` on registry-backed admins (e.g. Product, Vehicle, Supplier, Dealer, Brand, ProductCategory); optional job history admins |
| `apps/master_data/serializers.py` | Modified | Add `BulkImportUploadSerializer`, `BulkImportJobSerializer`, `BulkImportPreviewRowSerializer`, `BulkImportPreviewSerializer`, `BulkImportConfirmSerializer`, `BulkExportTriggerSerializer`, `BulkExportJobSerializer` |
| `apps/master_data/views.py` | Modified | Add `BulkImportViewSet`, `BulkExportViewSet` |
| `apps/master_data/urls.py` | Modified | Register `bulk-imports` and `bulk-exports` ViewSets |
| `apps/master_data/migrations/0003_bulk_import_export_jobs.py` | New | DB migration |
| `config/settings/base.py` | Modified | `CELERY_BEAT_SCHEDULE` entries for `purge_expired_bulk_files` and `mark_stale_import_jobs` |
| `templates/admin/change_list.html` | Modified | Import/Export buttons in `object-tools` block |
| `templates/admin/master_data/bulk_import_upload.html` | New | Upload form + template download + recent jobs |
| `templates/admin/master_data/bulk_import_status.html` | New | Polling page with meta-refresh |
| `templates/admin/master_data/bulk_import_preview.html` | New | Paginated validation preview |
| `templates/admin/master_data/bulk_export_status.html` | New | Export polling + download link |
| `tests/unit/test_master_data/test_import_configs.py` | New | §9.2 tests |
| `tests/unit/test_master_data/test_import_service.py` | New | §9.3 tests |
| `tests/unit/test_master_data/test_export_service.py` | New | §9.4 tests |
| `tests/unit/test_master_data/test_tasks.py` | New | §9.5 tests |
| `tests/unit/test_master_data/test_admin_views.py` | New | §9.6 tests |
| `tests/unit/test_master_data/test_api_serializers.py` | New | §10.8 serializer tests |
| `tests/integration/test_bulk_import_export_api.py` | New | §10.8 API integration tests |
| `tests/factories/master_data_factories.py` | Modified | Add `BulkImportJobFactory`, `BulkExportJobFactory` |

---

## 13. Related Documentation

**Cross-references:** Other specs in `02-master-data/` link to this document wherever bulk CSV import/export is discussed (README, master-data-configuration, vehicle, product, POI, supplier/dealer).

- **[master-data-configuration.md](master-data-configuration.md)** — Master data entities, vehicle capacity, driver assignment, referential integrity
- **[product-inventory-management.md](product-inventory-management.md)** — Product data model, QC configuration, transport attributes
- **[poi-management.md](poi-management.md)** — POI entity model, geofencing, capacity tracking

**Related User Stories:**

- US-047: Vendor Master Data (Admin CRUD & Bulk Upload)
- US-053: Vehicle Master Data Management
- US-057: Driver Master Data Management
- US-061: Helper Master Data Management
- US-095: Product Master Data Management (CRUD)
- US-096: Route, Supplier & Dealer Master Data

**Source**: DFMS_Product_Requirements_Document_v3.md — Sections 6.3.1, 6.3.2, 6.3.3
