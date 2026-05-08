# Backup and Recovery

> Low-level backup and recovery implementation

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Deployment Strategy](../../../04-architecture/06-deployment/)** - High-level deployment approach

This document provides **backup and recovery implementation** (database backups, file backups, recovery procedures).

---

## Overview

DFMS implements automated backups for PostgreSQL (RDS), Redis, and S3 files. Backups are stored in AWS S3 with retention policies. Recovery procedures are documented and tested.

---

## Database Backups

### RDS Automated Backups

```python
# AWS RDS Configuration
# - Automated backups enabled
# - Backup retention: 7 days
# - Backup window: 03:00-04:00 UTC
# - Copy tags to snapshots: Yes
```

### Manual Database Backup

```bash
# apps/core/management/commands/backup_database.py
from django.core.management.base import BaseCommand
from django.conf import settings
import boto3
from datetime import datetime
import subprocess

class Command(BaseCommand):
    help = 'Backup database to S3'
    
    def handle(self, *args, **options):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'/tmp/dfms_backup_{timestamp}.sql'
        s3_key = f'backups/database/{timestamp}.sql'
        
        # Dump database
        subprocess.run([
            'pg_dump',
            f'--host={settings.DATABASES["default"]["HOST"]}',
            f'--dbname={settings.DATABASES["default"]["NAME"]}',
            f'--username={settings.DATABASES["default"]["USER"]}',
            f'--file={backup_file}',
        ])
        
        # Upload to S3
        s3_client = boto3.client('s3')
        s3_client.upload_file(
            backup_file,
            settings.AWS_STORAGE_BUCKET_NAME,
            s3_key
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Backup uploaded to s3://{settings.AWS_STORAGE_BUCKET_NAME}/{s3_key}')
        )
```

---

## File Backups

### S3 Backup Configuration

```python
# S3 Lifecycle Policy
# - Transition to Glacier after 30 days
# - Delete after 90 days
# - Versioning enabled
```

### S3 Backup Script

```python
# apps/core/management/commands/backup_s3.py
from django.core.management.base import BaseCommand
from django.conf import settings
import boto3
from datetime import datetime

class Command(BaseCommand):
    help = 'Backup S3 files'
    
    def handle(self, *args, **options):
        s3_client = boto3.client('s3')
        timestamp = datetime.now().strftime('%Y%m%d')
        
        # List all objects
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
        
        # Copy to backup bucket
        backup_bucket = f'{settings.AWS_STORAGE_BUCKET_NAME}-backup'
        
        for page in pages:
            for obj in page.get('Contents', []):
                copy_source = {
                    'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                    'Key': obj['Key']
                }
                s3_client.copy_object(
                    CopySource=copy_source,
                    Bucket=backup_bucket,
                    Key=f'{timestamp}/{obj["Key"]}'
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Files backed up to {backup_bucket}')
        )
```

---

## Recovery Procedures

### Database Recovery

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier dfms-restored \
    --db-snapshot-identifier dfms-snapshot-20260213

# Restore from S3 backup
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup.sql
```

### File Recovery

```bash
# Restore from S3 backup
aws s3 sync s3://dfms-backup/20260213/ s3://dfms-files/
```

---

## Backup Retention

### Retention Policy

```python
# apps/core/management/commands/cleanup_old_backups.py
from django.core.management.base import BaseCommand
import boto3
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Cleanup old backups'
    
    def handle(self, *args, **options):
        s3_client = boto3.client('s3')
        cutoff_date = datetime.now() - timedelta(days=90)
        
        # List backups
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Prefix='backups/'
        )
        
        deleted_count = 0
        for page in pages:
            for obj in page.get('Contents', []):
                if obj['LastModified'] < cutoff_date:
                    s3_client.delete_object(
                        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                        Key=obj['Key']
                    )
                    deleted_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Deleted {deleted_count} old backups')
        )
```

---

## Related Documentation

- **[AWS Setup](./aws-setup.md)** - AWS backup configuration
- **[Environment Variables](./environment-variables.md)** - Backup settings

---

**Last Updated**: 2026-02-13

