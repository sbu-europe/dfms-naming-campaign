# AWS Deployment Configuration

> Low-level AWS deployment setup and configuration

## 📖 High-Level Context

> **Source of Truth**: [`05-architecture/`](../../../05-architecture/)

- **[Phase 1 Deployment Strategy](../../../05-architecture/04-implementation/deployment-strategy/phase-1-deployment.md)** - High-level deployment approach
- **[Container View](../../../05-architecture/01-architecture/container-view.md)** - Infrastructure components

This document provides **AWS-specific deployment configuration** (EC2, RDS, ElastiCache, S3 setup).

---

## Overview

DFMS Phase 1 deployment uses cost-optimized AWS infrastructure: single EC2 instance, RDS PostgreSQL, ElastiCache Redis, and S3 for file storage.

---

## EC2 Setup

### Instance Configuration

**Instance Type**: t3.large
- **vCPUs**: 2
- **Memory**: 8 GiB
- **Network**: Up to 5 Gbps
- **Cost**: ~$60/month

### EC2 User Data Script

```bash
#!/bin/bash
# EC2 user data script for initial setup

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
yum install -y git

# Configure environment
mkdir -p /opt/dfms
cd /opt/dfms

# Clone repository (or use CodeDeploy)
# git clone <repository-url> .

# Set up environment variables
cat > .env << EOF
DEBUG=0
SECRET_KEY=${SECRET_KEY}
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
AWS_STORAGE_BUCKET_NAME=${S3_BUCKET}
EOF

# Start application
docker-compose -f docker-compose.prod.yml up -d
```

### Security Group Configuration

```json
{
  "SecurityGroupRules": [
    {
      "IpProtocol": "tcp",
      "FromPort": 80,
      "ToPort": 80,
      "CidrIpv4": "0.0.0.0/0",
      "Description": "HTTP"
    },
    {
      "IpProtocol": "tcp",
      "FromPort": 443,
      "ToPort": 443,
      "CidrIpv4": "0.0.0.0/0",
      "Description": "HTTPS"
    },
    {
      "IpProtocol": "tcp",
      "FromPort": 22,
      "ToPort": 22,
      "CidrIpv4": "YOUR_IP/32",
      "Description": "SSH"
    }
  ]
}
```

---

## RDS PostgreSQL Setup

### RDS Configuration

**Instance Type**: db.t3.small
- **vCPUs**: 2
- **Memory**: 2 GiB
- **Storage**: 20 GB GP3
- **Cost**: ~$25/month

### RDS Parameter Group

```sql
-- Custom parameter group settings
shared_preload_libraries = 'pg_stat_statements'
max_connections = 100
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### RDS Connection String

```python
# settings/production.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('RDS_DB_NAME'),
        'USER': env('RDS_USERNAME'),
        'PASSWORD': env('RDS_PASSWORD'),
        'HOST': env('RDS_HOSTNAME'),
        'PORT': env('RDS_PORT', default='5432'),
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'
        },
        'CONN_MAX_AGE': 600,  # Connection pooling
    }
}
```

### RDS Backup Configuration

- **Automated Backups**: Enabled
- **Backup Retention**: 7 days
- **Backup Window**: 03:00-04:00 UTC
- **Maintenance Window**: Sun 04:00-05:00 UTC

---

## ElastiCache Redis Setup

### ElastiCache Configuration

**Instance Type**: cache.t3.micro
- **vCPUs**: 2
- **Memory**: 0.5 GiB
- **Network**: Up to 5 Gbps
- **Cost**: ~$12/month

### Redis Configuration

```python
# settings/production.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 50,
                'retry_on_timeout': True,
            },
        },
        'KEY_PREFIX': 'dfms',
        'TIMEOUT': 300,
    },
}

# Celery broker
CELERY_BROKER_URL = env('REDIS_URL')
CELERY_RESULT_BACKEND = env('REDIS_URL')
```

---

## S3 Configuration

### S3 Bucket Setup

```python
# settings/production.py
AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}
AWS_DEFAULT_ACL = 'private'
AWS_S3_FILE_OVERWRITE = False

# Static files
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'

# Media files
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
```

### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicReadStatic",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dfms-files/static/*"
    },
    {
      "Sid": "AllowPrivateMedia",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/ec2-role"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::dfms-files/media/*"
    }
  ]
}
```

---

## IAM Roles and Policies

### EC2 Instance Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::dfms-files/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds-db:connect"
      ],
      "Resource": "arn:aws:rds-db:REGION:ACCOUNT_ID:dbuser:INSTANCE_ID/USERNAME"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## CloudWatch Monitoring

### CloudWatch Logs Configuration

```python
# settings/production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'cloudwatch': {
            'class': 'watchtower.CloudWatchLogHandler',
            'formatter': 'verbose',
            'log_group': 'dfms/application',
            'stream_name': 'django',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['cloudwatch'],
            'level': 'INFO',
        },
        'apps': {
            'handlers': ['cloudwatch'],
            'level': 'INFO',
        },
    },
}
```

### CloudWatch Alarms

```python
# CloudWatch alarms configuration
# CPU Utilization > 80%
# Memory Utilization > 80%
# Database Connections > 80
# 5xx Errors > 10 in 5 minutes
```

---

## Deployment Scripts

### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Deploying DFMS Backend..."

# Pull latest code
git pull origin main

# Update submodule
git submodule update --init --recursive

# Build Docker image
docker-compose -f docker-compose.prod.yml build

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml run --rm web python manage.py collectstatic --noinput

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Health check
sleep 10
curl -f http://localhost/health/ || exit 1

echo "Deployment completed successfully!"
```

---

## Environment Variables

### Production Environment Variables

```bash
# .env.production
# Django
DEBUG=0
SECRET_KEY=<from-secrets-manager>
ALLOWED_HOSTS=api.dfms.com,staging.dfms.com

# Database
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/dfms

# Redis
REDIS_URL=redis://elasticache-endpoint:6379/0
CELERY_BROKER_URL=redis://elasticache-endpoint:6379/0

# AWS
AWS_ACCESS_KEY_ID=<from-iam-role>
AWS_SECRET_ACCESS_KEY=<from-iam-role>
AWS_STORAGE_BUCKET_NAME=dfms-files
AWS_S3_REGION_NAME=us-east-1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@dfms.com
EMAIL_HOST_PASSWORD=<from-secrets-manager>

# Monitoring
SENTRY_DSN=<sentry-dsn>
```

---

## Cost Optimization

### Current Monthly Costs

- **EC2 t3.large**: ~$60
- **RDS db.t3.small**: ~$25
- **ElastiCache cache.t3.micro**: ~$12
- **S3 Storage**: ~$5
- **Data Transfer**: ~$5
- **Total**: ~$107/month

### Cost Optimization Strategies

1. **Reserved Instances**: 30-50% savings
2. **Spot Instances**: For development/testing
3. **S3 Lifecycle Policies**: Archive old files
4. **CloudWatch Log Retention**: Limit retention period
5. **Right-Sizing**: Monitor and adjust instance sizes

---

## Related Documentation

- **[Docker Configuration](./docker.md)** - Docker setup
- **[Phase 1 Deployment](../../../05-architecture/04-implementation/deployment-strategy/phase-1-deployment.md)** - High-level deployment strategy

---

**Last Updated**: 2026-02-13

