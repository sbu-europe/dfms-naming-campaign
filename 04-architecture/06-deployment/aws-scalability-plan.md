# Post-Production Scalability Plan

> How DFMS grows from a single-tenant pilot to a horizontally scalable multi-tenant SaaS platform, with concrete triggers, actions, and cost implications at each tier.

**Last Updated**: 2026-03-31  
**Phase 1 Baseline**: Single EC2 + RDS + ElastiCache, single tenant (Nourish)

---

## 1. Scaling Philosophy

> **Scale when the data says to, not before.**

Phase 1 is deliberately over-simplified. The goal is to validate the product with real users before investing in infrastructure complexity. Every scaling step should be triggered by a concrete, measured signal — not by anticipation.

| Principle | Application |
|-----------|------------|
| **Measure first** | Use CloudWatch dashboards for 30 days before making any infra change |
| **Vertical before horizontal** | Upgrade instance size before adding instances — simpler, cheaper, reversible |
| **Managed over self-managed** | Use AWS-managed services (RDS, ElastiCache, SES) — avoid running your own Postgres/Redis cluster |
| **Stateless application containers** | All app state in RDS or Redis, never in local container storage — this makes horizontal scaling trivial |
| **Automate at scale, manual at launch** | Manual deployments are fine for < 5 releases/month; invest in auto-deployment pipelines when cadence increases |

---

## 2. Scaling Tiers

### Tier 0 — Launch (Current)

**Target users**: 0–50  
**Tenant count**: 1 (Nourish)  
**Infrastructure**: Single EC2 + RDS + ElastiCache (no redundancy)

```
Internet → Route 53 → EC2 (t3.large)
                         ├── Nginx
                         ├── Django/Gunicorn (4 workers)
                         ├── Celery Worker (2 processes)
                         └── Celery Beat (1 process)
                      RDS db.t3.small
                      ElastiCache cache.t3.micro
```

**Monthly cost**: ~$108 (On-Demand)  
**SLA target**: Best-effort, < 2h RTO  
**Deployment model**: SSH + `docker-compose up -d`

---

### Tier 1 — Growth (triggered by signals below)

**Target users**: 50–200  
**Tenant count**: 1–3  
**Changes**: Vertical scale EC2 + RDS; add Application Load Balancer; separate Celery node

**Trigger signals** (any one of these):
- EC2 CPU > 70% sustained for > 3 days
- RDS CPU > 60% or connection count > 60
- API p95 response time > 800ms
- Celery queue depth > 50 tasks routinely
- EC2 memory available < 1 GB

**Actions**:

1. **EC2**: t3.large → t3.xlarge (4 vCPU, 16 GB) — zero-downtime: stop old, snapshot, resize, start
2. **RDS**: db.t3.small → db.t3.medium (2 vCPU, 4 GB) — multi-minute downtime; schedule maintenance window
3. **Celery**: Move Celery workers to a separate t3.small EC2 (decouples worker CPU from web CPU)
4. **ALB**: Add an Application Load Balancer in front of EC2 (needed before adding second web EC2)
5. **Monitoring**: Enable enhanced RDS monitoring, set up custom Celery queue depth metric

```
Internet → Route 53 → ALB
                       ├── EC2 (t3.xlarge) — Django web + Nginx
                       └── EC2 (t3.small)  — Celery worker + beat
                      RDS db.t3.medium
                      ElastiCache cache.t3.micro
```

**Monthly cost**: ~$230 (On-Demand) | ~$165 (Savings Plan)

---

### Tier 2 — Scale (multi-tenant, high availability)

**Target users**: 200–500  
**Tenant count**: 3–10  
**Changes**: Multi-AZ RDS, Redis replication, dual web EC2 behind ALB, CloudFront for media

**Trigger signals** (any one of these):
- Second tenant signed up and onboarded
- EC2 CPU still > 60% after Tier 1 scaling
- RDS failover needed (client SLA requires < 30s DB recovery)
- Media CDN needed (images/docs loading slowly for remote users)

**Actions**:

1. **RDS**: Enable Multi-AZ standby (automatic failover in < 60s) — double the RDS cost but required for SLA
2. **RDS Read Replica**: Add one read replica for report queries and analytics (offloads primary)
3. **EC2**: Add second web EC2 (t3.large) behind ALB — true horizontal scaling; deploy in a different AZ
4. **ElastiCache**: Upgrade to cache.t3.small (1.5 GB) or enable Redis replication group (primary + 1 replica)
5. **CloudFront**: Put CloudFront CDN in front of S3 for static and media files (faster for users, cheaper egress)
6. **Auto Scaling Group**: Replace manual EC2 management with an ASG (min 2, max 4 instances) for web layer
7. **Session affinity**: Confirm Redis-backed sessions work across multiple EC2 nodes (already implemented)

```
Internet → Route 53 → CloudFront (static/media)
                    → ALB
                       ├── EC2 (t3.large) AZ-a — Django web
                       └── EC2 (t3.large) AZ-b — Django web
                       EC2 (t3.small) — Celery worker (separate ASG)
                      RDS db.t3.medium Multi-AZ (primary + standby)
                      RDS Read Replica (db.t3.medium)
                      ElastiCache (cache.t3.small, replication group)
```

**Monthly cost**: ~$500–$700 (On-Demand) | ~$360–$500 (Savings Plan + RIs)

---

### Tier 3 — SaaS Platform (10+ tenants, full HA)

**Target users**: 500+  
**Tenant count**: 10+  
**Changes**: Containerised workloads on ECS Fargate, managed secrets, WAF, full observability stack

**Trigger signals**:
- Manual deployment becoming a bottleneck (> 8 deploys/month)
- EC2 instance management overhead growing
- Need for per-tenant resource isolation or per-tenant scaling
- Compliance requirements (SOC 2, ISO 27001) requiring immutable infrastructure

**Architecture**:

```
Internet
   │
Route 53 (Geo routing per region)
   │
CloudFront (CDN — static + media)
   │
WAF (OWASP rule set, rate limiting)
   │
ALB (multi-AZ)
   │
ECS Fargate (web tasks — auto-scale 2–20)
ECS Fargate (celery tasks — auto-scale 1–10)
   │
RDS Aurora PostgreSQL (multi-AZ, serverless v2 for auto-scale)
ElastiCache Redis Cluster (3-node, auto-failover)
S3 + CloudFront
SSM Parameter Store (secrets)
ECR (private container registry)
   │
Observability:
  CloudWatch + Container Insights
  Sentry (app errors)
  Grafana + CloudWatch data source (dashboards)
```

**Key migration steps** from Tier 2:

1. Package application as a production Docker image (already done)
2. Push to ECR (already done in CI pipeline)
3. Create ECS cluster + task definitions (replaces `docker-compose.prod.yml`)
4. Migrate RDS to Aurora PostgreSQL Serverless v2 (scales compute automatically, compatible with `django-tenants`)
5. Replace ElastiCache single-node with Cluster Mode
6. Move to AWS Secrets Manager (or keep SSM — cheaper)
7. Enable AWS WAF with managed rule groups

**Monthly cost**: $1,000–$2,500 depending on tenant count and traffic

---

## 3. Scaling Decision Matrix

| Signal | Current Tier | Recommended Action |
|--------|-------------|-------------------|
| EC2 CPU sustained > 70% | Tier 0 | Upgrade to t3.xlarge |
| EC2 memory < 1 GB free | Tier 0 | Upgrade to t3.xlarge |
| RDS connections > 60 | Tier 0 | Upgrade to db.t3.medium |
| API p95 > 800ms | Tier 0/1 | Profile, optimise, then scale |
| Celery queue depth > 50 | Tier 0/1 | Separate Celery EC2 |
| Second tenant onboarded | Tier 1 | Enable Multi-AZ RDS |
| EC2 crashes = downtime | Tier 1 | Add second EC2 + ALB |
| RDS failover needed | Tier 1 | Multi-AZ RDS |
| 10+ tenants | Tier 2 | Migrate to ECS Fargate |
| Compliance required | Any | SOC 2 / ISO review before Tier 3 |

---

## 4. Database Scaling Strategy

### Connection Pooling (before scaling DB instance)

Django's `CONN_MAX_AGE = 600` provides basic connection reuse. When connections become a bottleneck (> 80/100 max connections), add **PgBouncer** before upgrading RDS:

```
Django → PgBouncer (pool 20 connections) → RDS (actual 5–10 connections used)
```

PgBouncer runs as a Docker container on the same EC2; reduces RDS connection count by 4–5×.

### Read Replica for Reports

Heavy reports and analytics queries should be directed to a read replica via a second database alias:

```python
# settings/production.py
DATABASES = {
    'default': {  # Primary — writes
        'ENGINE': 'django_tenants.postgresql_backend',
        'HOST': env('RDS_PRIMARY_HOST'),
        ...
    },
    'replica': {  # Read replica — reports
        'ENGINE': 'django_tenants.postgresql_backend',
        'HOST': env('RDS_REPLICA_HOST'),
        ...
    }
}

DATABASE_ROUTERS = ['config.routers.ReplicaRouter']
```

### Multi-tenant Schema Performance

As tenant count grows, watch for:
- `migrate_schemas --tenant` taking too long (> 5 min) → run tenant migrations in parallel batches
- Cross-schema queries (only possible via `public` schema views) → avoid; keep all business logic schema-isolated
- Bloated `public` schema — only shared tables here (`tenants`, `domains`)

---

## 5. Celery Worker Scaling

| Load Level | Configuration |
|-----------|--------------|
| Phase 1 (< 50 users) | 2 Celery processes on same EC2 as web |
| Tier 1 (50–200 users) | Dedicated t3.small EC2, 4 Celery processes |
| Tier 2 (200–500 users) | ECS Fargate Celery tasks, auto-scale on queue depth |
| Tier 3 (500+ users) | SQS + Celery (BROKER_URL = SQS) for infinite scalability |

**CloudWatch custom metric** (set up at Tier 1):

```python
# Celery worker sends queue depth metric every minute to CloudWatch
import boto3
from celery import Celery

def report_queue_depth():
    app = Celery()
    inspect = app.control.inspect()
    active = inspect.active() or {}
    total = sum(len(v) for v in active.values())
    boto3.client('cloudwatch').put_metric_data(
        Namespace='DFMS/Celery',
        MetricData=[{'MetricName': 'QueueDepth', 'Value': total, 'Unit': 'Count'}]
    )
```

---

## 6. Cost Growth vs User Growth Projection

| Users | Tenants | Tier | Est. Monthly Cost | Cost Per User |
|-------|---------|------|------------------|--------------|
| 10 | 1 | 0 | $108 | $10.80 |
| 50 | 1 | 0 | $108 | $2.16 |
| 150 | 2 | 1 | $230 | $1.53 |
| 350 | 5 | 2 | $550 | $1.57 |
| 800 | 12 | 3 | $1,400 | $1.75 |
| 2,000 | 30 | 3 | $2,800 | $1.40 |

> Cost per user **drops significantly** from launch to Tier 1 as fixed infrastructure is shared. Plan pricing accordingly.

---

## 7. Scalability Monitoring Dashboard

Set up a CloudWatch dashboard with these widgets from day 1:

| Widget | Metric | Purpose |
|--------|--------|---------|
| EC2 CPU | `CPUUtilization` | Web server health |
| EC2 Memory | `mem_used_percent` (CloudWatch Agent) | Memory pressure |
| RDS CPU | `CPUUtilization` | DB health |
| RDS Connections | `DatabaseConnections` | Connection pool |
| RDS Disk | `FreeStorageSpace` | Storage headroom |
| ElastiCache Memory | `FreeableMemory` | Redis capacity |
| Celery Queue | Custom `QueueDepth` | Task backlog |
| API 5xx Count | `5XXError` from Nginx log metric filter | Error rate |
| API Latency | `ResponseTime` p95 from Nginx logs | Performance |

Review this dashboard every sprint retrospective — not just when incidents happen.

---

## 8. Multi-Region Considerations (Phase 3+)

Currently out of scope but worth noting for planning:

- **Primary region**: ap-southeast-1 (Singapore) — closest to Bangladesh
- **DR region**: ap-south-1 (Mumbai) — second closest, lower cost
- **Trigger**: Client expansion to a second country, or compliance requiring in-country data residency
- **Cost impact**: 2× infrastructure + S3 cross-region replication costs
- **Effort**: 2–3 sprints to set up Route 53 latency routing + RDS cross-region replica

---

## Related Documents

- [AWS Deployment Strategy](./aws-deployment-strategy.md)
- [Resource & Cost Estimation](./aws-cost-estimation.md)
- [Billing Safeguards](./aws-billing-safeguards.md)
- [Pre-Production Checklist](./README.md)
