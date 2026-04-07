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

## User Lifecycle Security (US-005, US-007)

Security controls applied across user invitation, activation, password reset, and account deactivation:

### Invitation & Activation Security (US-005)
- **Activation tokens**: 64-character cryptographically secure hex tokens, unique per invitation, 7-day expiry
- **OTP verification**: Both email and SMS OTP required before account activation
- **Email/mobile uniqueness**: Enforced per tenant to prevent duplicate accounts
- **Plan limit enforcement**: Invitation blocked if tenant exceeds subscription user limit

### Password Reset Security (US-005)
- **Self-service reset**: Reset link valid 15 min; SMS OTP valid 10 min; max 3 requests/hour
- **Admin-assisted reset**: OTP valid 10 min; mandatory justification (min 10 chars) and verification method
- **Session termination**: All active sessions terminated upon successful password reset
- **Enumeration prevention**: Self-service reset always returns success regardless of whether email exists

### Account Deactivation Security (US-007)
- **Permission enforcement**: Only Super Admin and Tenant Admin can deactivate (`UserMgmt.User.Deactivate`)
- **Self-deactivation prevention**: Admin cannot deactivate their own account
- **Last admin protection**: System prevents deactivation of the last active Tenant Admin
- **Immediate session termination**: All active sessions and tokens revoked upon deactivation
- **Login prevention**: Deactivated users (`Suspended`/`Inactive`) blocked at login Step 1
- **Assignment prevention**: Deactivated users excluded from all operational assignment workflows
- **Active assignment check**: Critical assignments (TOs, trips, approvals, QC) validated before deactivation; override requires mandatory justification
- **Data preservation**: Historical data preserved in audit trail; permanently deactivated user data archived but not deleted
- **Reactivation control**: Only temporary suspensions can be reactivated; permanent deactivation is irreversible
- **Plan limit on reactivation**: Subscription user limit checked before allowing reactivation

### Deactivation Audit Trail

| Event | Logged Details |
|---|---|
| User Deactivated (Temporary) | Admin ID, User ID, reason, remarks, effective date, IP, override details |
| User Deactivated (Permanent) | Admin ID, User ID, reason, remarks, effective date, IP, override details |
| User Reactivated | Admin ID, User ID, reactivation reason, IP, timestamp |
| Bulk Deactivation | Admin ID, user count, per-user success/failure, reason |
| Deactivation Override | Admin ID, User ID, override remarks, active assignments at time |

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

## Summary

Security & Compliance provides:
- **Layered Security:** Network, application, data, audit layers
- **Data Protection:** AES-256 encryption, data masking, secure deletion
- **Access Control:** RBAC with least privilege, multi-tenant isolation
- **Regulatory Compliance:** ISO 27001, GDPR/data privacy
- **Incident Response:** Detection, containment, recovery procedures
