---
source_document: PRD_DFMS_v1.0.md
source_sections: Vendor Onboarding & Registration
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [transport-order-management, trip-management]
---

# Vendor Onboarding & Registration

## Overview

Vendor Onboarding & Registration is the **vendor lifecycle entry point** that enables transport vendors (third-party trucking companies) to register, verify credentials, and gain access to the DFMS platform for bidding and trip execution. It establishes the **vendor master data foundation** and controls vendor access based on compliance, document verification, and admin approval.

The onboarding process differentiates between **Contractual vendors** (pre-negotiated rates, direct assignment) and **Non-Contractual vendors** (competitive bidding), ensuring appropriate workflow routing and rate management for each vendor type.

### Purpose

- Enable vendor self-registration via the **Vendor Mobile** app (initial delivery; web self-registration deferred)
- Capture vendor company details, contact information, and compliance documents
- Differentiate vendor types (Contractual vs Non-Contractual)
- Enforce document upload requirements (Trade License, BIN, TIN)
- Implement admin verification and approval workflow
- Support vendor profile management (vehicles, drivers, documents)
- Provide audit trail for all registration attempts
- Enforce tenant isolation for multi-tenancy

### Workflow Position

```
Vendor Discovers DFMS Platform
    ↓
Self-Registration → Vendor fills form, uploads documents
    ↓
Profile Submission → Status: PENDING_VERIFICATION
    ↓
Admin Review → Verifies documents, company legitimacy
    ↓
Approval Decision:
  - APPROVED → Vendor gains portal access, can bid/view TOs
  - REJECTED → Vendor notified with reason, can resubmit
    ↓
Vendor Profile Active → Can participate in operations
```

---

## Vendor Types

### Contractual Vendor (Fixed Rate)

**Definition:** Vendors with **pre-negotiated contractual rates** agreed upon through procurement/legal processes. Rates are fixed for specific routes, vehicle types, or time periods.

**Characteristics:**
- **No bidding required:** Transport Planners directly assign TOs
- **Pre-configured rates:** Rate card stored in system (per route, per km, per trip)
- **Priority access:** Higher allocation priority (trusted, reliable)
- **Long-term relationship:** Annual or multi-year contracts

**Use Cases:**
- Regular routes (factory → depot, depot → depot)
- High-volume transport requirements
- Critical deliveries requiring guaranteed capacity

**Workflow:**
```
TO Created → TP selects "Contractual Vendor" → System fetches pre-configured rate
  ↓
TO assigned to vendor → Vendor receives notification
  ↓
Vendor confirms vehicle/driver → Trip created
```

### Non-Contractual Vendor (Competitive Bidding)

**Definition:** Vendors without fixed-rate agreements who participate in **competitive bidding** for individual TOs. Rates determined dynamically through bid submission and evaluation.

**Characteristics:**
- **Bidding required:** Must submit competitive bids to win TOs
- **Variable rates:** Rate negotiated per TO (market-driven)
- **Flexible capacity:** Useful for overflow, seasonal demand, special routes
- **Performance-based:** Access dependent on quality scores, reliability

**Use Cases:**
- Ad-hoc transport needs
- Non-standard routes
- Peak season capacity overflow
- Cost optimization (competitive pricing)

**Workflow:**
```
TO Published for Bidding → Vendor views in portal
  ↓
Vendor submits bid (rate, vehicle count, availability) → Bidding window closes
  ↓
TP evaluates bids → Selects winning bid
  ↓
Vendor notified (winner) → Adds vehicle/driver details
  ↓
Trip created
```

---

## Vendor Self-Registration

### Purpose

Enable vendors to **independently register** on the platform without direct admin involvement, reducing onboarding friction and expanding vendor pool.

### Registration Form Fields

**Section 1: Company Details**
```typescript
interface VendorCompanyDetails {
  company_name: string;             // Legal entity name (required)
  company_type: 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED';
  registration_number: string;      // Company registration ID
  year_established: number;         // e.g., 2015
  
  // Business Contact
  office_address: string;           // Primary office location
  city: string;
  postal_code: string;
  phone: string;                    // Company phone
  email: string;                    // Company email (used for login)
  website?: string;                 // Optional
  
  // Fleet Information
  total_vehicles: number;           // Total fleet size
  vehicle_types: string[];          // e.g., ['Truck', 'Covered Van', 'Container']
}
```

**Section 2: Vendor Type Selection**
```typescript
vendor_type: 'CONTRACTUAL' | 'NON_CONTRACTUAL';

// If CONTRACTUAL:
contract_details: {
  contract_number?: string;         // Pre-existing contract reference
  contract_start_date?: Date;
  contract_end_date?: Date;
  procurement_contact?: string;     // Procurement officer who negotiated contract
};

// If NON_CONTRACTUAL:
bid_preferences: {
  preferred_routes?: string[];      // e.g., ['Dhaka-Chittagong', 'Dhaka-Sylhet']
  min_bid_rate?: number;            // Minimum acceptable rate (optional)
};
```

**Section 3: Contact Person**
```typescript
interface PrimaryContact {
  full_name: string;                // Primary contact person (required)
  designation: string;              // e.g., 'Fleet Manager', 'Operations Head'
  phone: string;                    // Direct mobile
  email: string;                    // Personal email
  is_authorized_signatory: boolean; // Can sign legal documents
}

// Optional: Multiple contacts
additional_contacts?: PrimaryContact[];
```

**Section 4: Compliance Documents (Mandatory)**

**Trade License:**
- **Purpose:** Proves legal authorization to operate transport business
- **Format:** PDF, JPEG, PNG
- **Max Size:** 5 MB
- **Validity:** Must have valid expiry date

**BIN (Business Identification Number):**
- **Purpose:** Tax registration proof (for invoicing)
- **Format:** PDF, JPEG, PNG
- **Max Size:** 5 MB

**TIN (Tax Identification Number):**
- **Purpose:** Individual/company tax ID
- **Format:** PDF, JPEG, PNG
- **Max Size:** 5 MB

**Optional Documents:**
- **Truck Association Testimonial:** Recommendation letter from industry body
- **Insurance Certificate:** Vehicle insurance coverage
- **Bank Account Details:** For payment processing

### Data Model

```typescript
interface VendorRegistration {
  registration_id: string;          // Auto-generated (e.g., VR-2026-00123)
  
  // Company Details
  company_details: VendorCompanyDetails;
  
  // Vendor Type
  vendor_type: 'CONTRACTUAL' | 'NON_CONTRACTUAL';
  contract_details?: ContractDetails;
  bid_preferences?: BidPreferences;
  
  // Contacts
  primary_contact: PrimaryContact;
  additional_contacts?: PrimaryContact[];
  
  // Compliance Documents
  documents: {
    trade_license: DocumentUpload;
    bin_certificate: DocumentUpload;
    tin_certificate: DocumentUpload;
    truck_association_testimonial?: DocumentUpload;
    insurance_certificate?: DocumentUpload;
  };
  
  // Vehicles (Optional at registration, can add later)
  vehicles?: VendorVehicle[];
  
  // Drivers (Optional at registration)
  drivers?: VendorDriver[];
  
  // Registration Workflow
  status: VendorRegistrationStatus;
  submitted_at: Date;
  approved_by?: string;             // Admin user ID
  approved_at?: Date;
  rejection_reason?: string;
  resubmission_count: number;       // Track retry attempts
  
  // Metadata
  tenant_id: string;                // Vendor belongs to specific tenant
  created_at: Date;
  updated_at: Date;
}

interface DocumentUpload {
  document_id: string;
  document_type: 'TRADE_LICENSE' | 'BIN' | 'TIN' | 'TESTIMONIAL' | 'INSURANCE' | 'OTHER';
  file_url: string;                 // Cloud storage path
  file_name: string;
  file_size_kb: number;
  uploaded_at: Date;
  verified: boolean;                // Admin verification flag
  verified_by?: string;
  verified_at?: Date;
  expiry_date?: Date;               // For licenses, certificates
}

type VendorRegistrationStatus = 
  | 'DRAFT'                         // Vendor started but not submitted
  | 'PENDING_VERIFICATION'          // Submitted, awaiting admin review
  | 'UNDER_REVIEW'                  // Admin actively reviewing
  | 'APPROVED'                      // Verified and approved
  | 'REJECTED'                      // Rejected with reason
  | 'RESUBMITTED'                   // Vendor resubmitted after rejection
  | 'BLACKLISTED';                  // Vendor banned (fraud, poor performance)
```

### Registration Workflow

```
1. Vendor accesses registration page (public URL or invitation link)
2. Vendor fills company details:
   - Company name, type, registration number
   - Office address, contact details
   - Fleet size, vehicle types
3. Vendor selects vendor type:
   - Contractual: Enters contract details (if applicable)
   - Non-Contractual: Enters bid preferences
4. Vendor enters primary contact details
5. Vendor uploads mandatory documents:
   - Trade License (validates expiry date)
   - BIN Certificate
   - TIN Certificate
6. Vendor optionally adds:
   - Vehicle details (registration, type, capacity)
   - Driver details (name, license, contact)
7. Vendor reviews summary and submits
8. System validates:
   - All mandatory fields filled
   - Documents uploaded and within size limits
   - Email/phone not already registered
9. System creates vendor profile:
   - Status: PENDING_VERIFICATION
   - Email confirmation sent to vendor
10. Vendor receives confirmation:
    - "Your registration is under review. You'll be notified within 2-3 business days."
```

### UI/UX Behavior

**Multi-Step Registration Form:**

**Step 1: Company Information**
- Company Name, Type, Registration Number
- Office Address, City, Postal Code
- Phone, Email, Website

**Step 2: Vendor Type & Preferences**
- Radio buttons: Contractual / Non-Contractual
- Conditional fields based on selection

**Step 3: Primary Contact**
- Full Name, Designation, Phone, Email
- Checkbox: "I am authorized to sign on behalf of the company"

**Step 4: Document Uploads**
- Drag-and-drop file upload zones
- Progress bars for upload status
- Validation: File size, format, expiry date (for licenses)

**Step 5: Fleet & Drivers (Optional)**
- "Add Vehicle" button → Opens vehicle form
- "Add Driver" button → Opens driver form
- Can skip and add later

**Step 6: Review & Submit**
- Summary of all entered information
- Edit buttons for each section
- "Submit for Verification" button

**Real-Time Feedback:**
- Green checkmark: "Registration submitted successfully!"
- Info icon: "Your application is under review. We'll email you at [email] once approved."
- Warning: "Document [Trade License] will expire on [date]. Please ensure it's renewed."

---

## Admin Verification & Approval

### Purpose

Ensure only **legitimate, compliant vendors** gain platform access by verifying documents, company details, and business legitimacy.

### Admin Review Workflow

```
1. Admin receives notification: "New vendor registration: [Company Name]"
2. Admin opens vendor profile in Admin Dashboard
3. Admin reviews:
   - Company details (cross-check with public records if possible)
   - Contact information (phone/email validity)
   - Document uploads:
     - Trade License (valid, not expired, matches company name)
     - BIN Certificate (valid tax registration)
     - TIN Certificate (valid)
     - Testimonial (if provided, check authenticity)
4. Admin may request additional information:
   - Click "Request Clarification"
   - Enter message: e.g., "Please upload a clearer copy of Trade License"
   - Vendor notified via email/SMS
5. Admin makes decision:
   - Approve: Vendor profile activated, credentials sent
   - Reject: Vendor notified with reason, can resubmit
6. System updates vendor status and logs action
```

### Data Model Extensions

```typescript
interface VendorVerification {
  verification_id: string;
  registration_id: string;
  
  // Verification Details
  verified_by: string;              // Admin user ID
  verification_date: Date;
  
  // Document Checks
  document_checks: {
    trade_license: DocumentVerificationResult;
    bin_certificate: DocumentVerificationResult;
    tin_certificate: DocumentVerificationResult;
  };
  
  // Overall Decision
  decision: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
  decision_remarks: string;
  
  // Clarification Requests (if needed)
  clarification_requests?: {
    requested_at: Date;
    message: string;
    vendor_response?: string;
    responded_at?: Date;
  }[];
}

interface DocumentVerificationResult {
  document_type: string;
  verified: boolean;
  verification_notes?: string;      // e.g., "Expiry date: 2027-12-31, Valid"
  issues?: string;                  // e.g., "Blurry image, please reupload"
}
```

### Approval Actions

**Approve Vendor:**
```
1. Admin clicks "Approve Vendor"
2. System:
   - Updates vendor status → APPROVED
   - Creates vendor user account (email as username, auto-generated password)
   - Sends email with credentials:
     - Username: vendor@example.com
     - Temporary Password: XXXX-XXXX (must change on first login)
     - Portal URL: https://dfms.example.com/vendor/login
3. Vendor can now log in to Vendor Portal
```

**Reject Vendor:**
```
1. Admin selects rejection reason (dropdown):
   - Invalid documents
   - Company not found
   - Fraudulent information
   - Other (manual entry)
2. Admin enters detailed remarks (required)
3. System:
   - Updates vendor status → REJECTED
   - Sends email to vendor with rejection reason
   - Allows vendor to resubmit with corrections
```

**Request Clarification:**
```
1. Admin clicks "Request Clarification"
2. Admin enters message: "Please upload clearer copy of BIN certificate"
3. System:
   - Updates status → UNDER_REVIEW (clarification pending)
   - Sends email/SMS to vendor
   - Vendor logs in, uploads new document, resubmits
4. Admin receives notification: "Vendor resubmitted after clarification"
5. Admin re-reviews and approves/rejects
```

---

## Vendor Profile Management

### Purpose

Allow approved vendors to **maintain and update** their profile, vehicles, drivers, and documents post-registration.

### Vendor Profile Dashboard

**Sections:**
1. **Company Profile:** Edit company details, contact info
2. **Vehicles:** Add, edit, remove vehicles
3. **Drivers:** Add, edit, remove drivers
4. **Documents:** Upload renewed documents (e.g., trade license renewal)
5. **Performance:** View quality scores, completed trips, earnings
6. **Support:** Contact admin, raise issues

### Vehicle Management

**Add Vehicle:**
```typescript
interface VendorVehicle {
  vehicle_id: string;               // Auto-generated
  vendor_id: string;
  
  // Vehicle Details
  registration_number: string;      // License plate (unique)
  vehicle_type: 'TRUCK' | 'COVERED_VAN' | 'CONTAINER' | 'PICKUP' | 'TRAILER';
  capacity_kg: number;              // Load capacity
  capacity_uom: 'KG' | 'TON';
  
  // Specifications
  make: string;                     // e.g., TATA, Ashok Leyland
  model: string;
  year: number;                     // Manufacture year
  color?: string;
  
  // Compliance
  fitness_certificate_url?: string; // Vehicle fitness document
  fitness_expiry_date?: Date;
  insurance_certificate_url?: string;
  insurance_expiry_date?: Date;
  
  // Operational Status
  status: 'ACTIVE' | 'UNDER_MAINTENANCE' | 'INACTIVE';
  current_location?: string;        // POI or address
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}
```

**Driver Management:**
```typescript
interface VendorDriver {
  driver_id: string;
  vendor_id: string;
  
  // Personal Details
  full_name: string;
  date_of_birth: Date;
  phone: string;
  email?: string;
  address?: string;
  
  // License Details
  license_number: string;           // Unique
  license_type: string;             // e.g., 'Heavy Vehicle', 'Light Vehicle'
  license_expiry_date: Date;
  license_document_url?: string;
  
  // Experience
  years_of_experience: number;
  
  // Operational Status
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  current_assignment?: string;      // Trip ID (if assigned)
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}
```

---

## Access Control & Security

### Before Approval

**Vendor Access:** **NONE**
- Cannot log in to Vendor Portal
- Cannot view TOs, bids, trips
- Can only view registration status (via public check page or email link)

### After Approval

**Vendor Portal Access:**
- **Contractual Vendors:** Can view assigned TOs, manage trips, track payments
- **Non-Contractual Vendors:** Can view open bids, submit bids, manage winning trips, track payments

**Role-Based Permissions:**
```typescript
const vendorPermissions = {
  'VENDOR_USER': [
    'VIEW_OWN_PROFILE',
    'EDIT_OWN_PROFILE',
    'ADD_VEHICLE',
    'EDIT_VEHICLE',
    'ADD_DRIVER',
    'EDIT_DRIVER',
    'VIEW_ASSIGNED_TOS',         // Contractual
    'VIEW_OPEN_BIDS',            // Non-Contractual
    'SUBMIT_BID',                // Non-Contractual
    'VIEW_TRIPS',
    'UPDATE_TRIP_STATUS',
    'UPLOAD_POD',
    'VIEW_INVOICES'
  ],
  'VENDOR_ADMIN': [
    // All VENDOR_USER permissions, plus:
    'MANAGE_USERS',              // Add/remove vendor team members
    'VIEW_PERFORMANCE_REPORTS',
    'EXPORT_DATA'
  ]
};
```

### Tenant Isolation

**Multi-Tenancy Enforcement:**
- Vendor profile belongs to **single tenant** (`tenant_id`)
- Vendor can only view/bid on TOs from **own tenant**
- Cannot access data from other tenants (enforced at database query level)

---

## Resubmission & Rejection Handling

### Resubmission Workflow

```
1. Vendor receives rejection email with reason
2. Vendor logs back into registration page (using email link)
3. Vendor sees:
   - Rejection reason highlighted
   - Fields that need correction marked
4. Vendor makes corrections:
   - Re-uploads documents (if invalid)
   - Updates company details (if incorrect)
5. Vendor resubmits
6. System:
   - Increments resubmission_count
   - Updates status → RESUBMITTED
   - Notifies admin: "Vendor [Company] resubmitted after rejection"
7. Admin re-reviews (same workflow as initial review)
```

### Resubmission Limits

**Business Rule:** Allow up to **3 resubmissions**. After 3 rejections, vendor must contact support for manual review.

```typescript
if (vendor.resubmission_count >= MAX_RESUBMISSIONS) {
  throw new Error('Maximum resubmission attempts reached. Please contact support at support@dfms.com');
}
```

---

## Integration Points

### Downstream: Transport Order (TO) Management

**Vendor Profile → TO Assignment:**
- Contractual vendors appear in "Assign Vendor" dropdown (TP view)
- Non-Contractual vendors receive bid notifications for open TOs

### Downstream: Bidding System

**Vendor Approval → Bidding Eligibility:**
- Only APPROVED vendors can view/submit bids
- Vendor type determines bidding access

### Downstream: Trip Management

**Vendor → Vehicle/Driver Assignment:**
- Vendor vehicles available for trip assignment (post-bid win)
- Vendor drivers assigned to trips

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Total vendors:** 50-200 vendors per tenant
- **Daily registrations:** 1-5 new vendor registrations
- **Admin review time:** 2-3 business days per vendor

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All vendor data filtered by `tenant_id`
- **Role-Based Access:**
  - Vendor User: Own profile, own vehicles/drivers, assigned TOs/trips
  - Admin: All vendors (tenant-wide), verification actions

### Audit Requirements

**Mandatory Audit Events:**
- Vendor registration submission
- Admin approval/rejection
- Clarification requests
- Profile updates (company, vehicles, drivers)
- Document uploads/renewals

---

## Key Design Decisions

### Why Self-Registration?

**Rationale:**
- Reduces admin workload (vendors enter own data)
- Faster onboarding (no manual data entry)
- Scalable (supports large vendor pools)

### Why Admin Approval Required?

**Rationale:**
- Quality control (ensures only legitimate vendors)
- Fraud prevention (document verification)
- Compliance (regulatory requirements)

### Why Differentiate Contractual vs Non-Contractual?

**Rationale:**
- Different operational workflows (direct assignment vs bidding)
- Different rate management (fixed vs variable)
- Different priority levels (contractual = higher trust)

---

## Related User Stories

- **US-064:** Vendor Self-Registration
- **US-065:** Document Upload & Verification
- **US-066:** Admin Vendor Approval
- **US-067:** Vendor Profile Management
- **US-068:** Vehicle Management
- **US-069:** Driver Management

---

## Summary

Vendor Onboarding & Registration is the **vendor lifecycle entry point** that provides:

- **Self-Registration:** Vendor Mobile app for vendor sign-up (web deferred)
- **Vendor Type Differentiation:** Contractual (direct assignment) vs Non-Contractual (bidding)
- **Document Verification:** Mandatory compliance documents (Trade License, BIN, TIN)
- **Admin Approval Workflow:** Review, approve, reject, request clarification
- **Profile Management:** Vehicle/driver management, document renewal
- **Access Control:** Approval-gated portal access, tenant isolation
- **Resubmission Support:** Allow vendors to correct and resubmit after rejection
- **Audit Trail:** Complete logging of registration, verification, and approval actions

Vendor Onboarding ensures that only verified, compliant vendors gain platform access, maintaining operational integrity and regulatory compliance.
