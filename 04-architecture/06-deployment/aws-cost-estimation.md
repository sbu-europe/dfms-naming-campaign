# AWS Resource & Cost Estimation

> Per-environment resource sizing, monthly cost projections, and cost-optimisation strategies for DFMS Phase 1.

**Last Updated**: 2026-03-31  
**Region**: ap-southeast-1 (Singapore)  
**Currency**: USD  
**Exchange note**: For BDT budgeting, apply ~110 BDT/USD at time of planning.

---

## 1. Pricing Model Comparison

| Model | Commitment | Savings vs On-Demand | Best For |
|-------|-----------|----------------------|----------|
| On-Demand | None | Baseline | DEV/TEST/unpredictable |
| Savings Plan (Compute) | 1-year, no upfront | ~30% | STG/PROD once stable |
| Reserved Instance (RI) | 1-year, no upfront | ~30–37% | PROD after 3 months live |
| Reserved Instance (RI) | 3-year, partial upfront | ~50–55% | PROD long-term |
| Spot Instances | None | ~70–90% | CI/TEST workloads only — NOT prod |

**Recommendation for launch**:
- Launch Phase 1 on **On-Demand** (no lock-in while we validate load)
- After 30–60 days of stable production traffic, buy a **1-year Compute Savings Plan** for EC2 + Fargate (if migrated later)

---

## 2. DEV Environment

> Runs locally via Docker Compose. No AWS cost beyond what's listed.

| Service | Spec | Purpose | Est. Cost |
|---------|------|---------|-----------|
| EC2 (optional) | t3.micro (1 vCPU, 1 GB) | Shared dev server | ~$8/month |
| Local Docker | — | Standard dev path | $0 |
| S3 dev bucket | < 1 GB | Media uploads during dev | ~$0.02 |
| **Total (local)** | | | **$0/month** |
| **Total (shared EC2)** | | | **~$8/month** |

---

## 3. TEST Environment (CI/CD)

> Ephemeral — runs inside GitHub Actions. No persistent AWS resources.

| Item | Cost |
|------|------|
| GitHub Actions (free tier: 2,000 min/month) | $0 for typical usage |
| ECR image storage (~3 GB) | ~$0.30/month |
| **Total** | **~$0.30/month** |

> If CI jobs exceed 2,000 min/month (unlikely at this stage), GitHub charges $0.008/min on Linux runners.

---

## 4. STG Environment

> Mirror of production, right-sized for demos and QA. Always-on.

| Service | Spec | On-Demand/month | With 1yr Savings Plan |
|---------|------|-----------------|-----------------------|
| EC2 | t3.medium (2 vCPU, 4 GB) | $30.37 | ~$21 |
| RDS PostgreSQL | db.t3.micro (1 vCPU, 1 GB), 20 GB GP3 | $15.33 | ~$11 |
| ElastiCache Redis | cache.t3.micro (0.5 GB) | $11.52 | ~$8 |
| Elastic IP | 1 IP (free while attached) | $0 | $0 |
| Route 53 | 1 hosted zone + ~1M queries | $0.90 | $0.90 |
| S3 | ~5 GB + requests | $0.50 | $0.50 |
| ACM (TLS) | Wildcard cert | $0 | $0 |
| CloudWatch | Basic logs & metrics | $1.50 | $1.50 |
| **Total (On-Demand)** | | **~$60/month** | |
| **Total (Savings Plan)** | | | **~$43/month** |

**Cost-saving tip**: Stop the STG EC2 outside business hours (Mon–Fri, 9am–6pm SGT). Use an EventBridge rule + Lambda to auto-start/stop → reduces EC2 cost by ~60% (saves ~$18/month).

---

## 5. PROD Environment — Launch Day (< 50 users)

> Single EC2, managed RDS, managed Redis. Optimised for low initial load.

| Service | Spec | On-Demand/month | With 1yr RI / Savings Plan |
|---------|------|-----------------|-----------------------------|
| EC2 | t3.large (2 vCPU, 8 GB) | $60.74 | ~$43 |
| RDS PostgreSQL | db.t3.small (2 vCPU, 2 GB), 30 GB GP3 | $27.74 | ~$19 |
| ElastiCache Redis | cache.t3.micro (0.5 GB) | $11.52 | ~$8 |
| Elastic IP | 1 IP | $0 | $0 |
| Route 53 | 1 hosted zone | $0.90 | $0.90 |
| ACM (TLS) | Wildcard cert | $0 | $0 |
| S3 | ~10 GB storage + 50 GB transfer | $3.20 | $3.20 |
| SES | ~5,000 emails/month | $0.50 | $0.50 |
| CloudWatch | Logs + metrics + alarms | $3.00 | $3.00 |
| Secrets Manager / SSM | SSM Parameter Store (free tier) | $0 | $0 |
| WAF (optional launch) | Basic rule set | $6.00 | $6.00 |
| **Total (no WAF, On-Demand)** | | **~$108/month** | |
| **Total (no WAF, RI)** | | | **~$78/month** |
| **Total (with WAF, RI)** | | | **~$84/month** |

---

## 6. PROD Environment — Growth Phases

### Phase 1B: 50–200 users (3–6 months post-launch)

Likely changes:
- EC2: **t3.large → t3.xlarge** (4 vCPU, 16 GB) — if CPU/memory pressure observed
- RDS: **db.t3.small → db.t3.medium** (2 vCPU, 4 GB) — for connection headroom
- No other changes required

| Service | Spec | On-Demand/month |
|---------|------|----------------|
| EC2 | t3.xlarge | $121 |
| RDS | db.t3.medium | $55 |
| ElastiCache | cache.t3.micro | $12 |
| Others (unchanged) | — | ~$15 |
| **Total** | | **~$203/month** |

### Phase 1C: 200–500 users (6–12 months)

Likely changes:
- Add **Application Load Balancer** (ALB)
- Add second EC2 (horizontal scale or separate Celery node)
- ElastiCache: upgrade to **cache.t3.small** (1.5 GB)
- Consider RDS **Multi-AZ** for uptime SLA

| Service | Spec | On-Demand/month |
|---------|------|----------------|
| EC2 (×2) | t3.large | $122 |
| ALB | Per LCU pricing (~100 req/s) | ~$20 |
| RDS | db.t3.medium Multi-AZ | $110 |
| ElastiCache | cache.t3.small | $23 |
| Others | — | ~$20 |
| **Total** | | **~$295/month** |

### Phase 2: 500+ users / Multi-tenant scale

See [aws-scalability-plan.md](./aws-scalability-plan.md) for ECS/Fargate migration path.  
Estimated cost: **$600–$1,200/month** depending on tenant count.

---

## 7. Summary — Cost Ladder

| Stage | Users | Est. Monthly (On-Demand) | Est. Monthly (RI/SP) |
|-------|-------|--------------------------|----------------------|
| Launch | < 50 | ~$108 | ~$78 |
| Growth | 50–200 | ~$203 | ~$145 |
| Scale | 200–500 | ~$295 | ~$210 |
| Multi-tenant | 500+ | $600–$1,200 | $430–$860 |

---

## 8. Cost Optimisation Strategies (Phase 1)

### Immediate Wins (before launch)

| Action | Saving | Effort |
|--------|--------|--------|
| Use `t3` over `t2` instances (better burst) | ~10% better value | Already done |
| GP3 storage instead of GP2 for RDS | ~20% storage cost reduction | Specify during RDS creation |
| S3 Intelligent-Tiering for media files | 40% on infrequently accessed files | S3 lifecycle rule |
| CloudWatch log retention = 30 days (not infinite) | Avoids log storage creep | Set on log group |
| Use SSM Parameter Store (free) instead of Secrets Manager ($0.40/secret) | ~$5–10/month | Use SSM |
| ECR lifecycle policy — keep only last 10 images | Reduces ECR storage | Add lifecycle rule |

### After 30 Days Live

| Action | Saving | When |
|--------|--------|------|
| 1-year EC2 Compute Savings Plan | ~30% on EC2 | After stable baseline |
| 1-year RDS Reserved Instance | ~30% on RDS | After stable baseline |
| Auto-stop STG environment overnight | ~$18/month on STG | Immediately |
| Right-size EC2 after 2 weeks of CloudWatch data | 20–40% if over-provisioned | After 2 weeks live |

### Avoid These Common Cost Traps

| Trap | Why It Happens | Prevention |
|------|----------------|------------|
| NAT Gateway data transfer charges | EC2 in private subnet → internet through NAT | Phase 1: EC2 in public subnet (no NAT needed); Phase 2: budget NAT costs |
| Unused Elastic IPs | IP allocated but instance stopped/terminated | Release IPs immediately when not in use |
| Data transfer between AZs | Multi-AZ RDS + cross-AZ queries | Ensure app and RDS are in same AZ in Phase 1 |
| CloudWatch Log explosion | Verbose Django `DEBUG`-level logging in prod | Set `LOG_LEVEL=WARNING` in prod |
| S3 request costs | Thousands of tiny file GETs | Use CloudFront in front of S3 for media (Phase 2) |
| Forgotten test/dev resources | One-off experiments left running | Resource tagging + weekly cost review |

---

## 9. Resource Tagging Policy

All AWS resources must be tagged at creation for cost tracking and audit.

| Tag Key | Example Value | Purpose |
|---------|--------------|---------|
| `Project` | `DFMS` | Cost centre grouping |
| `Environment` | `prod` / `stg` / `dev` | Per-environment cost split |
| `Owner` | `bs-team` | Accountable team |
| `ManagedBy` | `manual` / `terraform` | Provisioning method |
| `CostCenter` | `nourish-phase1` | Billing allocation |

Set up a **Cost Allocation Tag** in AWS Billing → Tags so these appear in Cost Explorer reports.

---

## 10. Monthly Cost Review

**Cadence**: Review AWS Cost Explorer on the 1st of each month.

**Checklist**:
- [ ] Compare actual vs estimated cost per environment
- [ ] Identify any unexpected services in the bill
- [ ] Check if any reserved capacity is underutilised
- [ ] Review CloudWatch log volumes and adjust retention if needed
- [ ] Check S3 storage growth rate and forecast

---

## Related Documents

- [AWS Deployment Strategy](./aws-deployment-strategy.md)
- [Billing Safeguards & Cost Controls](./aws-billing-safeguards.md)
- [Post-Production Scalability Plan](./aws-scalability-plan.md)
