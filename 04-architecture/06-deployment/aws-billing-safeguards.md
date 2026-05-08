# AWS Billing Safeguards & Cost Controls

> Proactive measures to prevent unexpected AWS charges during development, testing, and early production for DFMS Phase 1.

**Last Updated**: 2026-03-31  
**Priority**: Set up ALL of Section 1 before any AWS resource is created.

---

## 1. Must-Do Before Creating Any Resource

These five controls must be in place before provisioning any AWS service.

### 1.1 Enable MFA on Root Account

```
AWS Console → Root user → Security credentials → MFA device
```

- Use a hardware token or authenticator app (not SMS)
- Store MFA recovery codes in 1Password / LastPass — not a personal device
- Root account should NEVER be used for day-to-day operations

### 1.2 Create a Billing Alert (Hard Limit)

```
AWS Console → Billing → Budgets → Create budget
```

| Budget | Type | Amount | Alert at |
|--------|------|--------|----------|
| Monthly total | Cost | $200 | 80% ($160) and 100% ($200) |
| EC2 only | Cost | $80 | 90% ($72) |
| RDS only | Cost | $40 | 90% ($36) |
| Forecasted overage | Forecasted | $250 | When forecast exceeds |

**Alert channels**: Email (all team leads) + SNS → Slack `#aws-billing` channel

```bash
# CLI equivalent
aws budgets create-budget \
  --account-id <ACCOUNT_ID> \
  --budget '{
    "BudgetName": "DFMS-Monthly-Total",
    "BudgetLimit": {"Amount": "200", "Unit": "USD"},
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "team@brainstation-23.com"}]
  }]'
```

### 1.3 Enable Cost Explorer

```
AWS Console → Billing → Cost Explorer → Enable
```

- Takes 24h to activate after first enable
- Use daily granularity to catch surprises early
- Set "Resource-level data" to ON (small extra cost but essential for debugging)

### 1.4 Enable AWS Cost Anomaly Detection

```
AWS Console → Billing → Cost Anomaly Detection → Create monitor
```

| Monitor | Type | Alert if |
|---------|------|---------|
| DFMS-Total | AWS services | > $20 spike from baseline |
| EC2-anomaly | EC2 service | > $15 above expected |

This detects runaway instances, accidental resource creation, and surprise data transfer charges automatically.

### 1.5 Activate IAM Billing Access

```
AWS Console → Root account → Account → IAM user and role access to Billing → Activate
```

Required so non-root IAM users can view (but not modify) billing data.

---

## 2. IAM Least-Privilege Policy

Never use root credentials or `AdministratorAccess` for application workloads.

### IAM User Groups

| Group | Who | Policy |
|-------|-----|--------|
| `dfms-developers` | Dev team | EC2 read, S3 specific bucket, CloudWatch read |
| `dfms-devops` | DevOps lead | EC2, RDS, ElastiCache, S3, CloudWatch, SSM write |
| `dfms-billing-read` | PM / Finance | Billing read-only |
| `dfms-ci` | GitHub Actions | ECR push, SSM read, specific S3 bucket |

### EC2 Instance Role (Minimal)

The EC2 instance that runs the app should only have:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect": "Allow", "Action": ["s3:GetObject","s3:PutObject","s3:DeleteObject"],
     "Resource": "arn:aws:s3:::dfms-prod-files/*"},
    {"Effect": "Allow", "Action": ["ssm:GetParameter","ssm:GetParameters"],
     "Resource": "arn:aws:ssm:ap-southeast-1:*:parameter/dfms/*"},
    {"Effect": "Allow", "Action": ["logs:CreateLogStream","logs:PutLogEvents"],
     "Resource": "arn:aws:logs:ap-southeast-1:*:log-group:dfms/*"},
    {"Effect": "Allow", "Action": ["cloudwatch:PutMetricData"],
     "Resource": "*"},
    {"Effect": "Allow", "Action": ["ecr:GetAuthorizationToken","ecr:BatchGetImage","ecr:GetDownloadUrlForLayer"],
     "Resource": "*"}
  ]
}
```

**Never put long-lived access keys on EC2.** Use the IAM Instance Profile (role attached at launch).

---

## 3. Resource Lifecycle Controls

### 3.1 Terminate DEV Resources After Use

The most common cause of surprise bills is forgotten resources. Apply this rule:

> **Any non-STG/non-PROD resource that is not in use for > 24 hours must be stopped or terminated.**

Enforce with a scheduled Lambda:

```python
# Lambda (runs daily at midnight SGT via EventBridge)
# Stops EC2 instances tagged Environment=dev that have been running > 8 hours
import boto3, datetime

def handler(event, context):
    ec2 = boto3.client('ec2', region_name='ap-southeast-1')
    instances = ec2.describe_instances(Filters=[
        {'Name': 'tag:Environment', 'Values': ['dev']},
        {'Name': 'instance-state-name', 'Values': ['running']}
    ])
    to_stop = []
    for r in instances['Reservations']:
        for i in r['Instances']:
            uptime = datetime.datetime.now(datetime.timezone.utc) - i['LaunchTime']
            if uptime.total_seconds() > 8 * 3600:
                to_stop.append(i['InstanceId'])
    if to_stop:
        ec2.stop_instances(InstanceIds=to_stop)
        print(f"Stopped: {to_stop}")
```

### 3.2 Auto-Stop STG Outside Business Hours

```
EventBridge rule: cron(0 13 ? * MON-FRI *)  → Stop STG EC2  (9pm SGT / 1pm UTC)
EventBridge rule: cron(0 2 ? * MON-FRI *)   → Start STG EC2 (10am SGT / 2am UTC)
```

Saves ~60% of the STG EC2 cost (~$18/month saved).

### 3.3 ECR Lifecycle Policy

Prevent image registry from accumulating indefinitely:

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 tagged images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {"type": "expire"}
    },
    {
      "rulePriority": 2,
      "description": "Remove untagged images after 1 day",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 1
      },
      "action": {"type": "expire"}
    }
  ]
}
```

### 3.4 S3 Lifecycle Rules

```
Bucket: dfms-prod-files

Rule 1 — media/uploads/*
  Transition to S3 Intelligent-Tiering after 30 days
  (auto-moves infrequent objects to cheaper storage class)

Rule 2 — logs/*
  Expire (delete) after 90 days

Rule 3 — backups/*
  Transition to Glacier Instant Retrieval after 30 days
  Expire after 365 days
```

### 3.5 CloudWatch Log Retention

Never leave log groups at "Never expire" (default). Always set:

```bash
# Set 30-day retention on all DFMS log groups
aws logs put-retention-policy \
  --log-group-name "dfms/application" \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name "dfms/nginx" \
  --retention-in-days 14
```

---

## 4. Service Limit Safeguards

Some AWS services charge per unit in ways that are easy to accidentally spike.

| Service | Risk | Safeguard |
|---------|------|-----------|
| **SES** | Accidental email loop sends thousands of emails | Set SES sending limit = 500/day in sandbox; request production access only after testing |
| **S3 requests** | Poorly optimised code making thousands of HEAD requests per page load | Use `django-storages` correctly; avoid per-file existence checks |
| **RDS storage** | Auto-scaling storage (once enabled, cannot shrink) | Start with fixed 30 GB GP3; do not enable auto-scale until needed |
| **ElastiCache** | Memory overflow eviction leading to cache misses → DB hammering | Set `maxmemory-policy = allkeys-lru`; monitor memory in CloudWatch |
| **EC2 data transfer** | Serving large media files directly from EC2 | Serve from S3 directly (not through EC2); add CloudFront in Phase 2 |
| **NAT Gateway** | Accidental creation in a VPC | Phase 1 uses public subnet (no NAT); if private subnet needed later, budget $35+/month for NAT |
| **Elastic IP** | Left attached to stopped instance = free; detached IP = $0.005/hour (~$3.60/month) | Release all unused Elastic IPs immediately |

---

## 5. Billing Anomaly Response Playbook

When an alert fires (budget threshold or anomaly detection):

```
Step 1: Log in to Cost Explorer → filter by service and linked account
        → identify the service driving the spike

Step 2: Check resource inventory
        aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,State.Name,InstanceType,Tags]'
        aws rds describe-db-instances
        aws s3api list-buckets

Step 3: If the resource is unknown or accidental → terminate immediately
        aws ec2 terminate-instances --instance-ids <id>

Step 4: If the resource is legitimate → estimate true month-end cost
        → if > $50 above budget, escalate to project lead

Step 5: Document in Slack #aws-billing with:
        - What caused the spike
        - What was done to fix it
        - What safeguard was added to prevent recurrence
```

---

## 6. Pre-Purchase Checklist (Before Any Reserved Instance / Savings Plan)

Do not commit to reserved capacity until all conditions are met:

- [ ] Application has been live in production for at least 30 days
- [ ] CloudWatch shows stable, predictable CPU and memory usage patterns
- [ ] No major architectural changes planned (e.g., switching to ECS) in next 6 months
- [ ] Cost Explorer "RI/SP recommendations" have been reviewed
- [ ] A 1-year no-upfront commitment has been compared with 1-year partial-upfront (ROI calculated)

---

## 7. Quick Reference — Common Billing Mistakes

| Mistake | Monthly Cost Impact | How to Avoid |
|---------|--------------------|----|
| Left a t3.large running for a weekend test | +$4.50 for 48h | Stop instance after use; use auto-stop Lambda |
| NAT Gateway created by accident | +$35/month minimum | Never create private subnets without budgeting NAT |
| RDS storage auto-scaling enabled | Cannot reduce; grows forever | Fix storage size; resize manually when needed |
| CloudWatch logs never expire | $0.03/GB/month, grows silently | Set 30-day retention on all log groups |
| Detached Elastic IP left for a month | +$3.60 | Release IPs not in use |
| CloudTrail enabled with S3 logging + no lifecycle | S3 fills with logs | Set 90-day lifecycle on CloudTrail bucket |
| SES in sandbox sending loops | Could generate support tickets | Implement email send rate limiting in code |
| Multi-region replication enabled on wrong S3 bucket | 2× storage + transfer costs | Only enable CRR on the backups bucket |

---

## Related Documents

- [Resource & Cost Estimation](./aws-cost-estimation.md)
- [AWS Deployment Strategy](./aws-deployment-strategy.md)
- [Pre-Production Checklist](./README.md)
