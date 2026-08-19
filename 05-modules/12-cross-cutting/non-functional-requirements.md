---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Non-Functional Requirements, Performance, Scalability, Availability
extracted_date: 2026-02-13
last_updated: 2026-04-07
document_type: domain_specification
related_modules: [all-modules]
---

# Non-Functional Requirements

## Overview

Non-Functional Requirements (NFRs) define **system quality attributes** that govern how the DFMS platform performs, scales, and behaves under various conditions. Unlike functional requirements (which describe what the system does), NFRs describe how well the system does it—ensuring reliability, performance, security, usability, and maintainability.

### Purpose

- **Performance:** Define response time, throughput, and resource utilization targets
- **Scalability:** Ensure system handles growth in users, tenants, and data volume
- **Availability:** Guarantee uptime, backup, and disaster recovery capabilities
- **Usability:** Ensure intuitive interface, accessibility, and minimal training time
- **Compatibility:** Support diverse devices, browsers, GPS providers, and third-party systems

---

## Performance Requirements

### Web Application Performance

**Page Load Time:**
- **Target:** All pages load within **3 seconds** on standard broadband connection (5 Mbps+)
- **Measurement:** Time from navigation to full page render (DOM Content Loaded + Assets Loaded)
- **Optimization Strategies:**
  - Code splitting (load only required JavaScript)
  - Image compression and lazy loading
  - CDN for static assets (CSS, JS, images)
  - Browser caching (Cache-Control headers)

**Example:**
```typescript
// Metric: Time to Interactive (TTI)
const ttiBenchmark = 3000; // 3 seconds

performance.measure('page-load');
const pageLoadTime = performance.getEntriesByName('page-load')[0].duration;

if (pageLoadTime > ttiBenchmark) {
  console.warn(`Page load time ${pageLoadTime}ms exceeds target ${ttiBenchmark}ms`);
}
```

### API Response Time

**Response Time Targets:**
- **95th Percentile:** 500 milliseconds
- **99th Percentile:** 1 second
- **Measurement:** Time from API request received to response sent (excluding network latency)

**SLA Enforcement:**
```typescript
// API Gateway monitors response times
const apiResponseTimeSLA = {
  p95: 500,  // ms
  p99: 1000  // ms
};

// If 95% of requests exceed 500ms, trigger alert
if (currentP95ResponseTime > apiResponseTimeSLA.p95) {
  alertOpsTeam('API response time degraded');
}
```

**Optimization Strategies:**
- Database query optimization (indexes, query caching)
- API response caching (Redis for frequently accessed data)
- Pagination for large datasets (max 100 records per API call)
- Asynchronous processing for heavy operations (background jobs)

### Concurrent Users

**Capacity Target:**
- **Minimum:** 500 concurrent users per tenant
- **Definition:** Concurrent = users actively making requests in same 1-minute window
- **Load Testing:** Performance tested at 150% of target (750 concurrent users)

**Horizontal Scaling:**
- Auto-scale web/app servers when CPU > 70% for 5 minutes
- Add new instances within 2 minutes
- Load balancer distributes requests (round-robin)

### GPS Update Frequency

**Real-Time Tracking:**
- **Update Frequency:** Location updates every **30 seconds** from GPS devices
- **Latency:** Location visible in command center within **60 seconds** of capture (30s GPS + 30s transmission/processing)

**Data Flow:**
```
GPS Device → VTS Provider API → DFMS Ingestion Service → Database → WebSocket → Command Center Dashboard
   30s           instant              5s                  5s          5s           5s
                                    [Total: ~60 seconds]
```

### Dashboard Refresh

**Real-Time Dashboards:**
- **Refresh Frequency:** WebSocket updates every **5 seconds** for active dashboards
- **Examples:** Operations Dashboard (active trips), Command Center (queue status)

**Batch Dashboards:**
- **Refresh Frequency:** Daily at midnight for historical analytics
- **Examples:** Executive Dashboard (monthly KPIs), Vendor Analytics

---

## Scalability Requirements

### Multi-Tenancy

**Tenant Capacity:**
- **Target:** Support **100+ tenants** on single platform instance
- **Tenant Isolation:** Logical (shared database with tenant_id filtering) + Physical (dedicated schema for enterprise customers)

**Tenant Growth Strategy:**
```
0-50 tenants:   Single database instance (shared schema)
50-200 tenants: Database replication (read replicas for reports)
200+ tenants:   Database sharding (partition by tenant_id)
```

### Data Growth

**Trip Volume:**
- **Target:** Handle **10 million+ trips annually** across all tenants
- **Data Retention:** 
  - Transactional data (trips, TOs): 2 years (hot storage)
  - Archived data: 5 years (cold storage, S3/Glacier)

**Database Sizing:**
```typescript
const estimatedDataGrowth = {
  trips_per_year: 10_000_000,
  average_trip_size_kb: 50,        // Trip + related events
  annual_data_growth_gb: (10_000_000 * 50) / 1024 / 1024, // ~476 GB/year
  
  // With 2-year retention: ~1 TB hot storage
  // Plus indexes, logs, backups: ~3 TB total
};
```

### Horizontal Scaling

**Auto-Scaling Rules:**
- **Web/App Tier:** Scale up when CPU > 70% for 5 minutes, scale down when < 30% for 15 minutes
- **Database:** Read replicas for reporting workloads (vertical scaling for master)
- **Background Jobs:** Queue-based processing (SQS/RabbitMQ) with worker auto-scaling

**Scaling Thresholds:**
```typescript
const autoScalingConfig = {
  web_servers: {
    min_instances: 2,
    max_instances: 20,
    scale_up_cpu: 70,
    scale_down_cpu: 30
  },
  worker_servers: {
    min_instances: 1,
    max_instances: 10,
    scale_up_queue_depth: 1000,
    scale_down_queue_depth: 100
  }
};
```

### Database Sharding

**Sharding Strategy (For Large Customers):**
- **Shard Key:** `tenant_id` (ensures single tenant's data on one shard)
- **Trigger:** When single tenant exceeds 500 GB data
- **Implementation:** Dedicated database instance for enterprise tenant

---

## Availability & Reliability

### Uptime SLA

**Service Level Agreement:**
- **Uptime Target:** **99.5% uptime** (excluding planned maintenance)
- **Allowed Downtime:** 3.65 hours per month (30-day month)
- **Measurement:** Monthly uptime percentage based on health check pings (every 1 minute)

**Uptime Calculation:**
```typescript
const monthlyUptimeSLA = 0.995; // 99.5%
const totalMinutesInMonth = 30 * 24 * 60; // 43,200 minutes
const allowedDowntimeMinutes = totalMinutesInMonth * (1 - monthlyUptimeSLA); // 216 minutes (3.6 hours)
```

**SLA Penalties (If Contractual):**
- 99.0-99.5%: 10% monthly fee credit
- 98.0-99.0%: 25% monthly fee credit
- <98.0%: 50% monthly fee credit

### Planned Downtime

**Maintenance Windows:**
- **Maximum Downtime:** 4 hours per month
- **Advance Notice:** 48 hours minimum
- **Preferred Window:** Sunday 2 AM - 6 AM (low traffic period)

### Backup Strategy

**Automated Daily Backups:**
- **Frequency:** Daily at 2 AM (database full backup)
- **Retention:** 30 days
- **Storage:** AWS S3 (Standard class) with versioning

**Backup Types:**
- **Full Backup:** Daily (entire database)
- **Incremental Backup:** Every 4 hours (transaction logs)
- **Backup Verification:** Weekly restore test to staging environment

**Backup Recovery Time:**
- **Small Tenant (< 10 GB):** 30 minutes
- **Medium Tenant (10-100 GB):** 2 hours
- **Large Tenant (> 100 GB):** 4 hours

### Disaster Recovery

**Recovery Objectives:**
- **RPO (Recovery Point Objective):** **1 hour** (maximum data loss)
- **RTO (Recovery Time Objective):** **4 hours** (maximum downtime after disaster)

**Disaster Recovery Strategy:**
```
1. Multi-AZ database deployment (automatic failover in same region)
2. Cross-region database replication (DR region in different geography)
3. Disaster event detected → Failover to DR region
4. DNS updated to point to DR region
5. Services resume within 4 hours
```

**DR Testing:**
- **Frequency:** Quarterly
- **Test Scope:** Full failover to DR region, verify all services functional

---

## Security Requirements

### Authentication

**Multi-Factor Authentication (MFA):**
- **Required Roles:** Super Admin, Tenant Admin, Finance roles
- **MFA Methods:** 
  - SMS OTP (6-digit code)
  - Authenticator App (Google Authenticator, Authy)
- **Enrollment:** Mandatory at first login

### Password Policy

**Password Complexity:**
- **Minimum Length:** 8 characters
- **Complexity:** Must include uppercase, lowercase, number, special character
- **Expiry:** 90 days (user prompted to change password)
- **History:** Cannot reuse last 3 passwords

**Rate Limiting (Password Reset):**
- Maximum 3 self-service reset requests per hour per user
- Admin-assisted resets not subject to self-service rate limits
- Suspicious patterns (multiple resets across different users from same IP) trigger additional verification

**Example Validation:**
```typescript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  expiryDays: 90,
  preventReuse: 3
};

function validatePassword(password: string): boolean {
  const meetsComplexity = password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[0-9]/.test(password) &&
         /[!@#$%^&*]/.test(password);
  const notCommon = !commonPasswordList.includes(password.toLowerCase());
  return meetsComplexity && notCommon;
}
```

### Session Management

**Session Security:**
- **Auto-Logout:** After **30 minutes** of inactivity
- **Concurrent Session Control:** Maximum 3 concurrent sessions per user
- **Session Token:** JWT with 8-hour expiry, refresh token for 7 days

### Data Encryption

**Encryption Standards:**
- **In Transit:** TLS 1.3 (HTTPS for web, mTLS for API-to-API)
- **At Rest:** AES-256 encryption for:
  - Database (transparent data encryption)
  - File storage (S3 server-side encryption)
  - Backups

### Audit Logging (US-009)

**Comprehensive Audit Trail:**
- **Authentication Events:** Login (success/failure), logout, account lockout, session timeout, password reset (admin-assisted/self-service)
- **User Actions:** CRUD operations (create, read, update, delete) on all entities, with before/after values for updates
- **OTP Operations:** OTP generation, verification (success/failure with attempt count), resend
- **Permission Changes:** Role assignment, permission updates
- **Admin Actions:** User deactivation/reactivation, invitation, admin-assisted password resets (with justification)
- **Log Retention:** Minimum 2 years (configurable up to 7 years per tenant)
- **Log Storage:** Immutable, append-only (no UPDATE, no DELETE within retention period)
- **Log Encryption:** AES-256 at rest

**Audit Log Performance:**
- Log writing must not impact operation performance (< 50ms per log entry)
- Support 10M+ log entries per tenant
- Support 1000+ log writes per second
- Dashboard query response < 500ms for filtered queries
- Export streaming for large datasets (100k+ entries)

**Audit Log Format:**
```typescript
interface AuditLog {
  log_id: string;
  timestamp: Date;
  user_id: string | null;           // null for system-generated events
  actor_id: string | null;          // Admin who performed the action
  tenant_id: string;
  event_type: string;               // e.g., "LOGIN", "CREATE", "UPDATE", "OTP_GENERATION"
  entity_type: string;              // e.g., "Trip", "Vehicle", "User"
  entity_id: string;
  action: string;                   // e.g., "Vehicle.Create", "User.Deactivate"
  status: 'success' | 'failure';
  failure_reason?: string;
  ip_address: string;
  device_id: string;
  user_agent: string;
  location?: string;
  details: Record<string, any>;     // before/after values, error messages, justification
}
```

**Audit Log Access Control:**
- Only Security Admin and Tenant Admin can view audit logs (`UserMgmt.AuditLog.Read`)
- Only Security Admin and Tenant Admin can export audit logs (`UserMgmt.AuditLog.Export`)
- All audit log access and export operations are themselves audited

### API Security

**API Protection:**
- **Authentication:** JWT tokens (Bearer token in Authorization header)
- **Rate Limiting:** 1000 requests per hour per user (burst: 100 requests per minute)
- **Request Validation:** Schema validation for all API payloads (reject malformed requests)

---

## Usability Requirements

### Responsive Design

**Device Support:**
- **Desktop:** 1920x1080 (primary), 1366x768 (minimum)
- **Tablet:** 1024x768 (iPad, Android tablets)
- **Mobile:** 375x667 (iPhone SE), 414x896 (iPhone 11+)

**Responsive Breakpoints:**
```css
/* Desktop */
@media (min-width: 1024px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Mobile */
@media (max-width: 767px) { ... }
```

### Browser Support

**Supported Browsers (Latest 2 Versions):**
- Google Chrome (v120+)
- Mozilla Firefox (v120+)
- Apple Safari (v17+)
- Microsoft Edge (v120+)

**Testing Strategy:** Automated cross-browser testing (BrowserStack) on every release

### Mobile Applications

**Platform Support:**
- **Android:** Minimum Android 8.0 (API 26), Target Android 14+ (API 34)
- **iOS:** Minimum iOS 13.0, Target iOS 17+

### Accessibility

**WCAG 2.1 Level AA Compliance:**
- **Keyboard Navigation:** All features accessible via keyboard
- **Screen Reader Support:** ARIA labels for all interactive elements
- **Color Contrast:** Minimum 4.5:1 contrast ratio for text
- **Text Resizing:** Support up to 200% zoom without layout breaking

### Language Support

**Supported Languages:**
- **English** (Primary)
- **Bangla** (Bengali, secondary)

**Internationalization (i18n):**
- All UI text externalized to language files (JSON)
- Easy addition of new languages (translate JSON file)
- Date/time formatting localized per user preference

### Training Time

**User Onboarding Target:**
- **New Users:** Productive within **2 hours** of training
- **Training Materials:** Video tutorials, user manuals, in-app tooltips
- **Contextual Help:** Help icons (?) next to complex features with pop-up explanations

---

## Compatibility Requirements

### GPS Device Compatibility

**Supported GPS/VTS Providers:**
- **Bangladesh Market Leaders:** 
  - Track & Trace BD
  - Fleet Management BD
  - GPS BD
- **Integration Method:** REST API or Webhook (real-time push)
- **Configurable Mapping:** Map GPS provider data fields to DFMS schema

### ERP System Integration

**Pre-Built Connectors:**
- **SAP:** SAP Business One, SAP S/4HANA
- **Oracle:** Oracle ERP Cloud, Oracle NetSuite
- **Microsoft:** Microsoft Dynamics 365

**Integration Methods:**
- REST APIs (JSON payload)
- File-based integration (CSV/XML imports)
- Database-level integration (read-only access to ERP tables)

### Payment Gateway Integration

**Supported Local Providers (Bangladesh):**
- bKash (mobile financial service)
- Nagad (digital wallet)
- Rocket (mobile banking)

**Use Cases:**
- Vendor payment processing
- Driver incentive disbursement

---

## Key Design Decisions

### Why 99.5% Uptime (Not 99.9%)?
**Rationale:**
- 99.9% requires complex high-availability architecture (active-active multi-region)
- Cost-benefit: 99.5% acceptable for logistics domain (not mission-critical like healthcare)
- Allows planned maintenance windows without violating SLA

### Why 30-Second GPS Update Frequency?
**Rationale:**
- Balance between real-time visibility and data cost (GPS data transmission expensive)
- 30 seconds sufficient for transport monitoring (vehicles move slowly, not racing)
- Reduces backend processing load (120 updates/hour vs 3600/hour if 1-second updates)

### Why 500 Concurrent Users Per Tenant?
**Rationale:**
- Based on typical logistics company size (100-500 employees, 10-20% concurrent usage)
- Allows headroom for growth (500 concurrent = ~2000 total users at 25% concurrency)
- Cost-effective infrastructure sizing

---

## Related Specifications
- [Authentication & Security](../01-foundation/authentication-security.md)
- [Security & Compliance](./security-compliance.md)
- [Integration Requirements](./integration-requirements.md)

---

## Summary

Non-Functional Requirements define:
- **Performance:** 3s page loads, 500ms API response, 500 concurrent users
- **Scalability:** 100+ tenants, 10M+ trips/year, horizontal auto-scaling
- **Availability:** 99.5% uptime, 4-hour maintenance, daily backups, 1-hour RPO, 4-hour RTO
- **Security:** MFA for admins, 90-day password expiry, TLS 1.3, AES-256, 2-year audit logs
- **Usability:** Responsive design, latest 2 browser versions, 2-hour training time
- **Compatibility:** GPS providers, ERP connectors, local payment gateways

NFRs ensure DFMS platform is performant, scalable, reliable, secure, and user-friendly for enterprise logistics operations.
