---
title: DFMS Non-Functional Requirements
category: business
phase: requirements
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx
tags: [non-functional-requirements, performance, security, scalability, usability]
---

# DFMS Non-Functional Requirements

> System quality attributes and constraints

## Overview

This document defines the non-functional requirements (NFRs) for the DFMS platform, covering performance, scalability, availability, security, usability, and compatibility requirements. These requirements ensure the system meets quality standards and operational expectations.

---

## 1. Performance Requirements

### 1.1 Response Time

| Component | Requirement | Target | Maximum |
|-----------|-------------|--------|---------|
| Web Application Page Load | All pages load within acceptable time | < 3 seconds | 5 seconds |
| API Response Time | 95% of API calls | < 500ms | 1 second |
| API Response Time | 99% of API calls | < 1 second | 2 seconds |
| Dashboard Refresh | Real-time dashboards update | < 5 seconds | 10 seconds |
| GPS Update Frequency | Real-time location updates | Every 30 seconds | Every 60 seconds |
| Database Query | Standard queries | < 200ms | 500ms |
| Report Generation | Standard reports | < 5 seconds | 15 seconds |
| Complex Report Generation | Large datasets | < 30 seconds | 60 seconds |

**Requirements**:
- [Critical] Web application pages SHALL load within 3 seconds on standard broadband connection
- [Critical] 95% of API calls SHALL respond within 500ms
- [Critical] 99% of API calls SHALL respond within 1 second
- [High] Real-time dashboards SHALL update within 5 seconds
- [High] GPS location updates SHALL occur every 30 seconds
- [High] Database queries SHALL complete within 200ms for standard operations

**Measurement Conditions**:
- Standard broadband: 10 Mbps download, 2 Mbps upload
- Concurrent users: Up to 500 per tenant
- Database size: Up to 10 million trip records

---

### 1.2 Throughput

| Metric | Requirement |
|--------|-------------|
| Concurrent Users | Minimum 500 per tenant |
| Transactions per Second (TPS) | Minimum 100 TPS |
| GPS Updates | 1,000+ vehicles simultaneously |
| File Upload | 10 MB file in < 10 seconds |
| Bulk Data Import | 10,000 records in < 5 minutes |

**Requirements**:
- [Critical] System SHALL support minimum 500 concurrent users per tenant
- [Critical] System SHALL handle minimum 100 transactions per second
- [High] System SHALL process GPS updates for 1,000+ vehicles simultaneously
- [High] System SHALL support file uploads up to 10 MB within 10 seconds
- [Medium] System SHALL import 10,000 records via bulk upload within 5 minutes

---

### 1.3 Resource Utilization

| Resource | Normal Load | Peak Load |
|----------|-------------|-----------|
| CPU Utilization | < 60% | < 80% |
| Memory Utilization | < 70% | < 85% |
| Database Connection Pool | < 70% | < 90% |
| Disk I/O | < 60% | < 80% |
| Network Bandwidth | < 50% | < 75% |

**Requirements**:
- [High] CPU utilization SHALL remain below 60% under normal load
- [High] Memory utilization SHALL remain below 70% under normal load
- [High] Database connection pool SHALL not exceed 70% usage under normal load
- [Medium] System SHALL optimize resource usage to prevent bottlenecks

---

## 2. Scalability Requirements

### 2.1 Multi-Tenancy

**Requirements**:
- [Critical] System SHALL support 100+ tenants on single platform instance
- [Critical] System SHALL provide complete data isolation between tenants
- [Critical] System SHALL allow independent tenant configuration
- [High] System SHALL support tenant-specific customization without affecting other tenants
- [High] System SHALL allow dynamic tenant onboarding without system downtime

**Isolation Levels**:
- Schema-level data separation
- Tenant-specific user authentication
- Independent backup and restore per tenant
- Isolated audit logs per tenant

---

### 2.2 Data Growth

**Requirements**:
- [Critical] System SHALL handle 10 million+ trips annually across all tenants
- [Critical] System SHALL maintain performance as data grows
- [High] System SHALL support database sharding for large enterprise customers
- [High] System SHALL implement data archiving strategy for historical data
- [Medium] System SHALL provide data retention policies configurable per tenant

**Capacity Planning**:
- Year 1: 1 million trips
- Year 2: 5 million trips
- Year 3: 10 million trips
- Year 5: 25 million trips

---

### 2.3 Horizontal Scaling

**Requirements**:
- [Critical] System SHALL support horizontal scaling based on load
- [Critical] System SHALL auto-scale based on CPU, memory, and request metrics
- [High] System SHALL distribute load across multiple application servers
- [High] System SHALL support stateless application design for easy scaling
- [Medium] System SHALL implement load balancing across server instances

**Scaling Triggers**:
- CPU utilization > 70% for 5 minutes
- Memory utilization > 75% for 5 minutes
- Request queue depth > 100
- Response time > 2 seconds for 95th percentile

---

### 2.4 Geographic Distribution

**Requirements**:
- [Medium] System SHALL support deployment across multiple geographic regions
- [Medium] System SHALL provide content delivery network (CDN) for static assets
- [Low] System SHALL support multi-region database replication

---

## 3. Availability & Reliability Requirements

### 3.1 Uptime

**Requirements**:
- [Critical] System SHALL maintain 99.5% uptime (excluding planned maintenance)
- [Critical] System SHALL limit planned downtime to maximum 4 hours per month
- [Critical] System SHALL provide 48-hour advance notice for planned maintenance
- [High] System SHALL support zero-downtime deployments for minor updates
- [High] System SHALL implement health checks and auto-recovery mechanisms

**Uptime Calculation**:
- 99.5% uptime = Maximum 3.65 hours downtime per month
- Excludes planned maintenance windows
- Measured 24/7/365

**Downtime Categories**:
- Planned Maintenance: Scheduled, announced 48 hours in advance
- Unplanned Outage: System failure, measured against SLA
- Degraded Performance: Partial functionality, not counted as downtime

---

### 3.2 Backup & Recovery

**Requirements**:
- [Critical] System SHALL perform daily automated backups
- [Critical] System SHALL retain backups for minimum 30 days
- [Critical] System SHALL achieve Recovery Point Objective (RPO) of 1 hour
- [Critical] System SHALL achieve Recovery Time Objective (RTO) of 4 hours
- [High] System SHALL test backup restoration monthly
- [High] System SHALL store backups in geographically separate location
- [Medium] System SHALL provide point-in-time recovery capability

**Backup Strategy**:
- Full backup: Daily at 2 AM
- Incremental backup: Every 4 hours
- Transaction log backup: Every 15 minutes
- Retention: 30 days rolling

**Recovery Scenarios**:
- Database corruption: Restore from last backup (RPO: 1 hour)
- Complete system failure: Restore full system (RTO: 4 hours)
- Accidental data deletion: Point-in-time recovery (RTO: 2 hours)

---

### 3.3 Fault Tolerance

**Requirements**:
- [Critical] System SHALL continue operating with degraded functionality if non-critical components fail
- [High] System SHALL implement redundancy for critical components
- [High] System SHALL automatically failover to backup systems
- [High] System SHALL log all failures and recovery actions
- [Medium] System SHALL provide graceful degradation under high load

**Critical Components**:
- Database servers (master-slave replication)
- Application servers (load-balanced cluster)
- Authentication service (redundant instances)
- GPS tracking service (fallback to last known location)

---

### 3.4 Data Integrity

**Requirements**:
- [Critical] System SHALL ensure data consistency across all operations
- [Critical] System SHALL implement transaction management (ACID properties)
- [Critical] System SHALL validate all data before persistence
- [High] System SHALL implement database constraints and referential integrity
- [High] System SHALL detect and prevent data corruption
- [High] System SHALL maintain audit trail for all data modifications

---

## 4. Security Requirements

### 4.1 Authentication

**Requirements**:
- [Critical] System SHALL implement secure user authentication
- [Critical] System SHALL support multi-factor authentication (MFA) for Admin and Finance roles
- [Critical] System SHALL enforce password policy: minimum 8 characters, complexity requirements
- [Critical] System SHALL enforce password expiry every 90 days
- [High] System SHALL lock accounts after 5 failed login attempts
- [High] System SHALL support password reset via email verification
- [High] System SHALL maintain password history (prevent reuse of last 5 passwords)
- [Medium] System SHALL support Single Sign-On (SSO) integration

**Password Policy**:
- Minimum length: 8 characters
- Must include: uppercase, lowercase, number, special character
- Cannot contain: username, common words
- Expiry: 90 days
- History: Last 5 passwords

---

### 4.2 Authorization

**Requirements**:
- [Critical] System SHALL implement Role-Based Access Control (RBAC)
- [Critical] System SHALL enforce principle of least privilege
- [Critical] System SHALL prevent unauthorized access to sensitive data
- [High] System SHALL support fine-grained permissions per module
- [High] System SHALL allow role customization per tenant
- [High] System SHALL audit all authorization decisions

**RBAC Implementation**:
- Predefined roles: Transport Planner, TDO, Distribution Officer, QC Supervisor, etc.
- Permissions: Create, Read, Update, Delete, Execute per resource
- Hierarchical roles: Manager inherits permissions of Officer
- Tenant-specific role assignments

---

### 4.3 Session Management

**Requirements**:
- [Critical] System SHALL implement secure session management
- [Critical] System SHALL auto-logout after 30 minutes of inactivity
- [Critical] System SHALL invalidate session on logout
- [High] System SHALL prevent concurrent sessions from same user account
- [High] System SHALL use secure, httpOnly, sameSite cookies
- [High] System SHALL regenerate session ID after authentication
- [Medium] System SHALL allow administrators to force logout users

**Session Security**:
- Session timeout: 30 minutes inactivity
- Absolute timeout: 8 hours
- Secure flag: true (HTTPS only)
- HttpOnly flag: true (prevent XSS)
- SameSite: Strict (prevent CSRF)

---

### 4.4 Data Encryption

**Requirements**:
- [Critical] System SHALL encrypt all data in transit using TLS 1.3
- [Critical] System SHALL encrypt sensitive data at rest using AES-256
- [High] System SHALL encrypt database backups
- [High] System SHALL securely store encryption keys in key management system
- [High] System SHALL rotate encryption keys annually
- [Medium] System SHALL encrypt sensitive fields in database (PII, financial data)

**Encryption Standards**:
- In transit: TLS 1.3 with strong cipher suites
- At rest: AES-256-GCM
- Key management: AWS KMS, Azure Key Vault, or equivalent
- Certificate: Valid SSL/TLS certificate from trusted CA

---

### 4.5 API Security

**Requirements**:
- [Critical] System SHALL authenticate all API requests using JWT tokens
- [Critical] System SHALL implement API rate limiting
- [Critical] System SHALL validate and sanitize all API inputs
- [High] System SHALL implement request signing for sensitive operations
- [High] System SHALL log all API access with user context
- [High] System SHALL implement API versioning
- [Medium] System SHALL provide API key management for external integrations

**API Security Measures**:
- Authentication: JWT with 1-hour expiry
- Rate limiting: 100 requests per minute per user
- Input validation: Schema-based validation
- Output encoding: Prevent injection attacks
- CORS: Whitelist allowed origins

---

### 4.6 Audit Logging

**Requirements**:
- [Critical] System SHALL maintain comprehensive audit trail for all user actions
- [Critical] System SHALL log all data modifications with timestamp and user
- [Critical] System SHALL ensure audit logs are tamper-proof
- [Critical] System SHALL retain audit logs for minimum 2 years
- [High] System SHALL log authentication events (login, logout, failed attempts)
- [High] System SHALL log authorization failures
- [High] System SHALL provide audit log search and export capabilities
- [Medium] System SHALL implement digital signatures for audit records

**Audit Log Contents**:
- Timestamp (UTC)
- User ID and username
- Action performed
- Resource affected
- Old value and new value (for updates)
- IP address
- Session ID
- Result (success/failure)

---

### 4.7 Compliance

**Requirements**:
- [High] System SHALL comply with GDPR for data privacy
- [High] System SHALL provide data export functionality for user data
- [High] System SHALL support data deletion requests
- [High] System SHALL comply with Bangladesh Road Transport Corporation (BRTC) regulations
- [High] System SHALL comply with Bangladesh tax laws (VAT, AIT)
- [Medium] System SHALL support driver license validation against BRTA database (if API available)
- [Medium] System SHALL integrate with weighbridge for legal load limits

---

## 5. Usability Requirements

### 5.1 User Interface

**Requirements**:
- [Critical] System SHALL provide responsive design for desktop, tablet, and mobile
- [Critical] System SHALL support browser compatibility: Chrome, Firefox, Safari, Edge (latest 2 versions)
- [High] System SHALL comply with WCAG 2.1 Level AA accessibility standards
- [High] System SHALL provide consistent UI/UX across all modules
- [High] System SHALL support keyboard navigation
- [High] System SHALL provide clear error messages and validation feedback
- [Medium] System SHALL support customizable dashboard layouts
- [Medium] System SHALL provide contextual help and tooltips

**Screen Resolutions**:
- Desktop: 1920x1080 (primary), 1366x768 (minimum)
- Tablet: 1024x768
- Mobile: 375x667 (minimum)

---

### 5.2 Language Support

**Requirements**:
- [High] System SHALL support English and Bangla languages
- [High] System SHALL allow user-level language selection
- [High] System SHALL persist language preference across sessions
- [High] System SHALL provide instant language switching without page reload
- [Medium] System SHALL support easy addition of new languages
- [Medium] System SHALL provide centralized language packs for all system texts

**Localization Scope**:
- UI labels and buttons
- Menu items
- System messages and alerts
- Error messages
- Help text
- Reports (headers and labels)

---

### 5.3 Training & Documentation

**Requirements**:
- [High] System SHALL be intuitive enough for new users to be productive within 2 hours of training
- [High] System SHALL provide in-app help documentation
- [Medium] System SHALL provide video tutorials for common tasks
- [Medium] System SHALL provide user manuals per role
- [Medium] System SHALL provide tooltips for complex features

**Training Materials**:
- User manuals (PDF)
- Video tutorials (5-10 minutes each)
- In-app contextual help
- Quick start guides
- FAQ section

---

## 6. Compatibility Requirements

### 6.1 Browser Support

**Requirements**:
- [Critical] System SHALL support Chrome (latest 2 versions)
- [Critical] System SHALL support Firefox (latest 2 versions)
- [Critical] System SHALL support Safari (latest 2 versions)
- [Critical] System SHALL support Edge (latest 2 versions)
- [Medium] System SHALL gracefully degrade on older browsers with warning message

**Minimum Browser Versions** (as of 2026):
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

---

### 6.2 Mobile Platform Support

**Requirements**:
- [Critical] Mobile apps SHALL support Android 8+ (API level 26+)
- [Critical] Mobile apps SHALL support iOS 13+
- [High] Mobile apps SHALL work on devices with minimum 2 GB RAM
- [High] Mobile apps SHALL support both phone and tablet form factors
- [Medium] Mobile apps SHALL support offline mode for essential features

**Target Devices**:
- Android: Samsung, Xiaomi, Oppo, Vivo (popular in Bangladesh)
- iOS: iPhone 8 and newer, iPad (5th generation and newer)

---

### 6.3 Integration Compatibility

**Requirements**:
- [High] System SHALL integrate with major GPS/VTS providers in Bangladesh market
- [High] System SHALL provide pre-built connectors for SAP, Oracle, Microsoft Dynamics
- [High] System SHALL support REST API for custom integrations
- [Medium] System SHALL support local payment providers (bKash, Nagad, etc.)
- [Medium] System SHALL integrate with Google Maps / OpenStreetMap for routing

**Integration Standards**:
- REST APIs with JSON payload
- OAuth 2.0 for authentication
- Webhook support for real-time events
- Bulk data import/export via CSV/Excel

---

## 7. Maintainability Requirements

### 7.1 Code Quality

**Requirements**:
- [High] System SHALL follow industry-standard coding conventions
- [High] System SHALL maintain minimum 80% code coverage with automated tests
- [High] System SHALL use version control (Git) for all code
- [Medium] System SHALL implement continuous integration/continuous deployment (CI/CD)
- [Medium] System SHALL use code review process for all changes

---

### 7.2 Monitoring & Logging

**Requirements**:
- [Critical] System SHALL implement application performance monitoring (APM)
- [Critical] System SHALL log all errors with stack traces
- [High] System SHALL provide real-time system health dashboard
- [High] System SHALL alert administrators for critical errors
- [High] System SHALL monitor resource utilization (CPU, memory, disk, network)
- [Medium] System SHALL provide log aggregation and search capabilities

**Monitoring Metrics**:
- Application: Response time, error rate, throughput
- Infrastructure: CPU, memory, disk, network
- Database: Query performance, connection pool, deadlocks
- Business: Active users, trips per hour, TO creation rate

---

### 7.3 Deployment

**Requirements**:
- [High] System SHALL support automated deployment
- [High] System SHALL support rollback to previous version
- [High] System SHALL support blue-green deployment for zero downtime
- [Medium] System SHALL provide deployment documentation
- [Medium] System SHALL support containerization (Docker)

---

## 8. Portability Requirements

**Requirements**:
- [High] System SHALL be deployable on cloud platforms (AWS, Azure, GCP)
- [High] System SHALL be deployable on-premises
- [Medium] System SHALL use containerization for environment consistency
- [Medium] System SHALL minimize vendor lock-in through standard technologies

---

## 9. Capacity Requirements

### 9.1 User Capacity

| User Type | Concurrent Users | Daily Active Users |
|-----------|------------------|-------------------|
| Internal Users | 200 per tenant | 500 per tenant |
| Vendors | 100 per tenant | 300 per tenant |
| Drivers | 200 per tenant | 500 per tenant |
| **Total** | **500 per tenant** | **1,300 per tenant** |

---

### 9.2 Data Capacity

| Data Type | Volume (Year 1) | Volume (Year 5) |
|-----------|-----------------|-----------------|
| Trips | 1 million | 25 million |
| Vehicles | 1,000 | 5,000 |
| Drivers | 1,500 | 7,500 |
| Vendors | 200 | 1,000 |
| GPS Points | 100 million | 2.5 billion |
| Documents (POD, Invoices) | 50 GB | 1 TB |

---

### 9.3 Transaction Capacity

| Transaction Type | Per Hour | Per Day |
|------------------|----------|---------|
| TO Creation | 100 | 2,000 |
| Trip Updates | 500 | 10,000 |
| GPS Updates | 36,000 | 864,000 |
| QC Inspections | 50 | 1,000 |
| Vendor Bids | 20 | 400 |

---

## 10. Environmental Requirements

### 10.1 Network Requirements

**Requirements**:
- [High] System SHALL function with minimum 2 Mbps internet connection
- [High] System SHALL optimize for high-latency connections (rural areas)
- [Medium] Mobile apps SHALL minimize data usage
- [Medium] System SHALL support offline mode for critical mobile features

**Network Conditions**:
- Minimum bandwidth: 2 Mbps
- Typical latency: 50-200ms
- Mobile data: 3G/4G/5G
- Offline support: Essential mobile features

---

### 10.2 Infrastructure Requirements

**Minimum Server Specifications** (for 500 concurrent users):
- CPU: 8 cores
- RAM: 32 GB
- Storage: 500 GB SSD
- Network: 1 Gbps

**Database Server**:
- CPU: 16 cores
- RAM: 64 GB
- Storage: 1 TB SSD (RAID 10)
- Network: 10 Gbps

---

## NFR Traceability Matrix

| NFR Category | Priority | Phase 1 | Phase 2 | Phase 3 | Testing Method |
|--------------|----------|---------|---------|---------|----------------|
| Performance | Critical | ✅ | ✅ | ✅ | Load testing, APM |
| Scalability | Critical | ✅ | ✅ | ✅ | Stress testing, capacity planning |
| Availability | Critical | ✅ | ✅ | ✅ | Uptime monitoring, DR testing |
| Security | Critical | ✅ | ✅ | ✅ | Penetration testing, security audit |
| Usability | High | ✅ | ✅ | ✅ | User acceptance testing, surveys |
| Compatibility | High | ✅ | ✅ | ✅ | Cross-browser/device testing |
| Maintainability | High | ✅ | ✅ | ✅ | Code review, static analysis |
| Portability | Medium | ✅ | ✅ | ✅ | Deployment testing |

---

## Related Documents

- [Functional Requirements](../03-functional-requirements/README.md) - Feature specifications
- [Business Objectives](../../01-overview/business-objectives.md) - Strategic goals
- [Technical Context](../../../04-architecture/) - Technical architecture and design

---

**Last Updated**: 2026-02-10  
**Status**: Approved  
**Version**: Based on PRD v1.0  
**Review Cycle**: Quarterly or per major release

