---
source_document: PRD_DFMS_v1.0.md
source_sections: Security, Compliance, Data Security, Access Control
extracted_date: 2026-02-13
last_updated: 2026-04-07
document_type: domain_specification
related_modules: [authentication-security, rbac, user-tenant-management]
related_stories: US-004, US-005, US-008
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

For the full RBAC specification, see [rbac.md](../01-foundation/rbac.md) and [permission-catalog-phase1.md](../01-foundation/permission-catalog-phase1.md).

**Role Hierarchy (Four-Tier):**
1. **Tier 1 – Super Admin:** Platform-level, cross-tenant (System-Wide access)
2. **Tier 2 – Tenant Admin:** Organization-level, single tenant (Global access)
3. **Tier 3 – Operational Users:** Task-level, day-to-day execution

**Operational Roles by Department:**

| Department | Roles | Functional Type | Access Scope |
|------------|-------|-----------------|-------------|
| Depot / Feed Mill / Commercial | Depot Officer, Feed Mill Officer, Commercial Officer | Requester | Local |
| Procurement | Procurement Officer | Approver | Global |
| Distribution | Distribution Officer (DO), Distribution Manager (DM) | DO=Executor, DM=Approver | DO=Local, DM=Global |
| Transport | Transport Planner (TP), Transport Distribution Officer (TDO) | Executor | Global |
| QA / QC | QC Inspector – Physical, QA Lab Technician | Executor | Local |
| Operations | Command Center Officer, Loading/Unloading Personnel, Driver Supervisor, Driver Helper | Executor | Local |

**External Roles:** Vendor Admin (via Vendor Portal)

**Functional Role Types:**
- **Requester** – Creates requisitions/requests. Cannot approve own requests.
- **Approver** – Approves/rejects requests. Cannot approve own requests (separation of duties).
- **Executor** – Executes approved tasks. Cannot modify approval status.

**Access Scope Levels:**
- **Global Access** – Data and actions across all locations within the tenant.
- **Local Access** – Data only within assigned department, POI, depot, feed mill, or operational unit.

**Permission Enforcement (Defense in Depth):**
- **UI level:** Menu visibility, page access, button availability based on role + functional type + access scope
- **API level:** Middleware validates permissions before endpoint access. Unauthorized requests return HTTP 403.
- **Database level:** Row-level security for tenant isolation and Local/Global access scope enforcement

---

## User Lifecycle Security (US-005)

Security controls applied across the user invitation, activation, and password reset lifecycle:

### Invitation & Activation Security
- **Activation tokens**: 64-character cryptographically secure hex tokens, unique per invitation
- **Token expiry**: 7 days from creation; expired tokens cannot be reused
- **OTP verification**: Both email and SMS OTP required before account activation
- **Email uniqueness**: Enforced per tenant to prevent duplicate accounts
- **Mobile uniqueness**: Enforced per tenant for OTP delivery integrity
- **Plan limit enforcement**: Invitation blocked if tenant exceeds subscription user limit
- **Bulk upload validation**: CSV rows individually validated; partial processing supported

### Password Reset Security
- **Self-service reset**: Reset link valid 15 minutes; SMS OTP valid 10 minutes
- **Admin-assisted reset**: OTP valid 10 minutes; admin must provide justification (min 10 chars) and verification method
- **Rate limiting**: Max 3 self-service reset requests per hour per user
- **Session termination**: All active sessions terminated upon successful password reset
- **Password complexity**: Min 8 chars, uppercase + lowercase + number + special character
- **Password history**: Last 3 passwords cannot be reused
- **Enumeration prevention**: Self-service reset always returns success regardless of whether email exists
- **OTP brute-force prevention**: Max 3 incorrect OTP attempts per token; token invalidated after

### Password Reset Audit Trail
All password reset events are logged with immutable audit entries:

| Event | Logged Details |
|---|---|
| Self-Service Reset Initiated | User ID, IP address, timestamp |
| Self-Service Reset Completed | User ID, IP address, device ID, timestamp |
| Admin-Assisted Reset Initiated | Admin ID, User ID, justification, verification method, IP, timestamp |
| Admin-Assisted Reset Completed | Admin ID, User ID, IP, timestamp |
| Reset Failed (expired/wrong OTP) | User ID, failure reason, IP, timestamp |

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
