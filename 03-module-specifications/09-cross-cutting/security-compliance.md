---
source_document: PRD_DFMS_v1.0.md
source_sections: Security, Compliance, Data Security, Access Control
extracted_date: 2026-02-13
last_updated: 2026-04-07
document_type: domain_specification
related_modules: [authentication-security, rbac, user-tenant-management]
related_stories: US-004, US-005, US-007, US-008
---

# Security & Compliance

## Overview

Security & Compliance defines the **security architecture, data protection mechanisms, regulatory compliance requirements, and access control policies** that protect DFMS platform data, ensure user privacy, and meet legal/industry standards for enterprise logistics operations.

### Purpose

- **Data Security:** Protect sensitive business data (trips, costs, vendor information) from unauthorized access
- **Access Control:** Implement role-based access control (RBAC) with principle of least privilege
- **Regulatory Compliance:** Meet ISO 27001, GDPR/data privacy, audit requirements
- **Incident Response:** Define procedures for security breach detection and response
- **Vendor Security:** Ensure third-party vendor data isolation and access restrictions

---

## Security Architecture

### Defense in Depth (Layered Security)

**Layer 1: Network Security**
- **Firewall:** Cloud-based firewall (AWS Security Groups, Azure NSG)
- **DDoS Protection:** CloudFlare or AWS Shield
- **VPN Access:** Admin access via VPN (no direct SSH to production)

**Layer 2: Application Security**
- **Authentication:** JWT-based, MFA for privileged roles
- **Authorization:** RBAC with API endpoint-level permission checks
- **Input Validation:** Schema validation, SQL injection prevention, XSS protection

**Layer 3: Data Security**
- **Encryption at Rest:** AES-256 for database and file storage
- **Encryption in Transit:** TLS 1.3 for all network communication
- **Data Masking:** Sensitive fields (bank accounts, NID) masked in logs/reports

**Layer 4: Audit & Monitoring**
- **Audit Logs:** Immutable logs for all user actions (2-year retention)
- **Intrusion Detection:** Real-time monitoring for suspicious activity
- **Alerting:** Automated alerts for security events (failed logins, privilege escalation attempts)

---

## Data Security

### Data Classification

**Highly Sensitive Data:**
- User passwords (hashed with bcrypt)
- Financial data (payment amounts, bank details)
- Personal Identifiable Information (PII): National ID, phone numbers

**Sensitive Data:**
- Trip details (routes, quantities, costs)
- Vendor bidding information
- Driver location data

**Public Data:**
- Product catalog (product names, categories)
- POI locations (depot addresses)

### Data Encryption

**At Rest:**
```typescript
// Database encryption (Transparent Data Encryption)
const databaseEncryption = {
  algorithm: 'AES-256-GCM',
  key_management: 'AWS KMS',
  key_rotation: '90 days'
};
```

**In Transit:**
```typescript
// HTTPS configuration
const tlsConfig = {
  protocol: 'TLS 1.3',
  cipher_suites: ['TLS_AES_128_GCM_SHA256', 'TLS_AES_256_GCM_SHA384'],
  hsts_enabled: true
};
```

### Data Masking

```typescript
function maskNationalID(nid: string): string {
  return nid.replace(/.(?=.{4})/g, '*');
}
```

---

## Access Control (RBAC)

**Role Hierarchy:**
1. **Administrative Roles:** Super Admin, Tenant Admin, Department Admin
2. **Operational Roles:** Transport Planner, QC Supervisor, Driver
3. **External Roles:** Vendor, Vendor Driver

**Permission Enforcement:**
- UI level (button visibility)
- API level (endpoint access)
- Database level (row-level security)

---

## Regulatory Compliance

### ISO 27001
- Annual security risk assessment
- Access control policy documentation
- Incident response plan
- Comprehensive audit trail

### GDPR / Data Privacy
- Right to access (data export)
- Right to be forgotten (account deletion)
- Right to rectification (profile updates)
- Data portability (JSON/CSV export)

---

## Incident Response

**Procedure:**
1. Detection: Security monitoring alerts
2. Containment: Isolate affected systems
3. Investigation: Analyze logs, identify root cause
4. Eradication: Remove threat, patch vulnerabilities
5. Recovery: Restore services
6. Post-Incident Review: Document lessons learned

---

## User Lifecycle Security (US-005, US-007, US-008)

### Password Reset Security Controls

| Control | Self-Service | Admin-Assisted |
|---|---|---|
| Reset token validity | 15 minutes | N/A (OTP-based) |
| OTP validity | 10 minutes | 10 minutes |
| Max OTP attempts | 3 per token | 3 per OTP |
| Rate limit | 3 requests/hour/user | No self-service limit |
| Password complexity | Enforced | Enforced |
| Password history | Last 3 passwords | Last 3 passwords |
| Session termination | All active sessions revoked | All active sessions revoked |
| Confirmation email | Sent on success | Sent on success |
| Audit logging | User ID, IP, timestamp, device | Admin ID, User ID, justification, IP |

### Account Deactivation Security Controls

| Control | Description |
|---|---|
| Permission enforcement | Only Super Admin and Tenant Admin can deactivate |
| Self-deactivation prevention | Users cannot deactivate their own account |
| Active assignment check | System warns of active TOs, trips, approvals before deactivation |
| Override with justification | Admin can override assignment check with mandatory remarks |
| Session termination | Immediate logout from all active sessions |
| Data preservation | All historical data preserved in audit trail; deactivated users remain in records |
| Login prevention | Deactivated users blocked from login until reactivated (temporary) or permanently |

### Audit Trail for Password Reset and Deactivation

| Event | Logged Fields |
|---|---|
| Self-Service Reset (initiated) | user_id, ip_address, device_id, timestamp |
| Self-Service Reset (completed) | user_id, ip_address, device_id, timestamp, status |
| Self-Service Reset (failed) | user_id, ip_address, device_id, timestamp, failure_reason |
| Admin-Assisted Reset | admin_id, user_id, justification, verification_method, ip_address, timestamp |
| Account Deactivation | admin_id, user_id, deactivation_type, reason, effective_date, ip_address, timestamp |
| Account Reactivation | admin_id, user_id, timestamp, ip_address |

---

## Summary

Security & Compliance provides:
- **Layered Security:** Network, application, data, audit layers
- **Data Protection:** AES-256 encryption, data masking, secure deletion
- **Access Control:** RBAC with least privilege, multi-tenant isolation
- **User Lifecycle Security:** Password reset (self-service + admin-assisted), account deactivation/reactivation, with comprehensive audit trails
- **Regulatory Compliance:** ISO 27001, GDPR/data privacy
- **Incident Response:** Detection, containment, recovery procedures
