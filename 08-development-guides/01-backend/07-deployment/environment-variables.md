# Environment Variables

> Low-level environment variable configuration

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../../04-architecture/)

- **[Deployment Strategy](../../../04-architecture/06-deployment/)** - High-level deployment approach

This document provides **environment variable configuration** (settings, secrets management, validation).

---

## Overview

Environment variables configure the application for different environments. This document lists all environment variables, their purposes, and validation rules.

---

## Environment Variable Categories

### Django Configuration

```bash
# Core Django Settings
DEBUG=0
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=api.dfms.com,staging.dfms.com
DJANGO_SETTINGS_MODULE=config.settings.production

# Security
CSRF_TRUSTED_ORIGINS=https://api.dfms.com,https://staging.dfms.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Database Configuration

```bash
# PostgreSQL (RDS)
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/dfms
DB_NAME=dfms
DB_USER=dfms_user
DB_PASSWORD=your-db-password
DB_HOST=rds-endpoint.amazonaws.com
DB_PORT=5432
```

### Redis Configuration

```bash
# Redis (ElastiCache)
REDIS_URL=redis://elasticache-endpoint:6379/0
REDIS_HOST=elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_DB=0
```

### Celery Configuration

```bash
# Celery Broker
CELERY_BROKER_URL=redis://elasticache-endpoint:6379/0
CELERY_RESULT_BACKEND=redis://elasticache-endpoint:6379/0
CELERY_TIMEZONE=UTC
```

### AWS Configuration

```bash
# AWS Credentials (from IAM role in production)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=dfms-files
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=dfms-files.s3.amazonaws.com
```

### Email Configuration

```bash
# SMTP Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@dfms.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@dfms.com
```

### JWT Configuration

```bash
# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_LIFETIME_MINUTES=15
REFRESH_TOKEN_LIFETIME_DAYS=7
```

### External Integrations

```bash
# GPS/VTS
GPS_API_URL=https://api.gps-provider.com
GPS_API_KEY=your-gps-api-key

# ERP
ERP_API_URL=https://api.erp-provider.com
ERP_API_KEY=your-erp-api-key

# Maps Service
MAPS_API_URL=https://maps.googleapis.com/maps/api
MAPS_API_KEY=your-maps-api-key

# SMS Gateway
SMS_ENABLED=false
SMS_PROVIDER=mimsms
MIMSMS_BASE_URL=https://api.mimsms.com
MIMSMS_API_KEY=your-mimsms-api-key
MIMSMS_USERNAME=your-account@mimsms.com
MIMSMS_SENDER_NAME=8809612444598
MIMSMS_TRANSACTION_TYPE=T
MIMSMS_REQUEST_TIMEOUT_SECONDS=10
MIMSMS_CAMPAIGN_PREFIX=dfms
MIMSMS_BULK_CHUNK_SIZE=100

# Payment Gateway
PAYMENT_GATEWAY_URL=https://api.payment-provider.com
PAYMENT_GATEWAY_API_KEY=your-payment-api-key
PAYMENT_GATEWAY_SECRET_KEY=your-payment-secret-key
PAYMENT_RETURN_URL=https://api.dfms.com/payment/callback
```

### Monitoring

```bash
# Sentry
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# CloudWatch
AWS_CLOUDWATCH_LOG_GROUP=dfms/application
AWS_CLOUDWATCH_REGION=us-east-1
```

---

## Environment-Specific Configuration

### Development (.env.development)

```bash
DEBUG=1
SECRET_KEY=dev-secret-key-not-for-production
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dfms_dev
REDIS_URL=redis://localhost:6379/0
```

### Staging (.env.staging)

```bash
DEBUG=0
SECRET_KEY=<from-secrets-manager>
ALLOWED_HOSTS=staging.dfms.com
DATABASE_URL=<staging-rds-url>
REDIS_URL=<staging-redis-url>
```

### Production (.env.production)

```bash
DEBUG=0
SECRET_KEY=<from-secrets-manager>
ALLOWED_HOSTS=api.dfms.com
DATABASE_URL=<production-rds-url>
REDIS_URL=<production-redis-url>
```

---

## Settings Configuration

### Environment Variable Loading

```python
# config/settings/base.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)

# Environment variable helper
def env(key, default=None, cast=str):
    """Get environment variable with optional casting"""
    value = os.getenv(key, default)
    if value is None:
        return None
    
    if cast == bool:
        return value.lower() in ('true', '1', 'yes')
    elif cast == int:
        return int(value)
    elif cast == float:
        return float(value)
    elif cast == list:
        return [item.strip() for item in value.split(',')]
    
    return cast(value)
```

### Settings Usage

```python
# config/settings/production.py
from .base import *

DEBUG = env('DEBUG', default=False, cast=bool)
SECRET_KEY = env('SECRET_KEY')
ALLOWED_HOSTS = env('ALLOWED_HOSTS', cast=list)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT', default='5432'),
    }
}
```

---

## Secrets Management

### AWS Secrets Manager

```python
# apps/core/secrets.py
import boto3
import json
from django.conf import settings

class SecretsManager:
    """AWS Secrets Manager integration"""
    
    @staticmethod
    def get_secret(secret_name):
        """Get secret from AWS Secrets Manager"""
        client = boto3.client('secretsmanager', region_name=settings.AWS_REGION)
        
        try:
            response = client.get_secret_value(SecretId=secret_name)
            secret = json.loads(response['SecretString'])
            return secret
        except Exception as e:
            raise Exception(f"Failed to get secret: {str(e)}")


# Usage in settings
if settings.USE_AWS_SECRETS:
    secrets = SecretsManager.get_secret('dfms/production')
    SECRET_KEY = secrets['SECRET_KEY']
    DATABASE_PASSWORD = secrets['DATABASE_PASSWORD']
```

---

## Environment Variable Validation

### Validation on Startup

```python
# config/settings/base.py
import sys

REQUIRED_ENV_VARS = [
    'SECRET_KEY',
    'DATABASE_URL',
    'REDIS_URL',
]

def validate_environment():
    """Validate required environment variables"""
    missing = []
    for var in REQUIRED_ENV_VARS:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"ERROR: Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)

# Validate on import
if not DEBUG:
    validate_environment()
```

---

## .env.example Template

```bash
# .env.example
# Copy this file to .env and fill in values

# Django
DEBUG=0
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=dfms-files
AWS_S3_REGION_NAME=us-east-1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# External APIs
GPS_API_KEY=your-gps-api-key
ERP_API_KEY=your-erp-api-key
MAPS_API_KEY=your-maps-api-key
SMS_GATEWAY_API_KEY=your-sms-api-key
PAYMENT_GATEWAY_API_KEY=your-payment-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## Related Documentation

- **[Docker Configuration](./docker.md)** - Docker environment setup
- **[AWS Setup](./aws-setup.md)** - AWS environment configuration

---

**Last Updated**: 2026-02-13

