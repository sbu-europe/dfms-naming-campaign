---
module: 02-master-data
specification: Point of Interest (POI) Management & Geofencing
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.5.1-6.5.8
last_updated: 2026-07-24
related_stories: US-014
---

# POI Management & Geofencing Specification

## Overview

Points of Interest (POIs) are fundamental entities in the DFMS platform, representing physical locations where transport, logistics, and quality control operations occur. POIs include depots, feed mills, warehouses, factories, ports, dealer locations, and supplier sites. The POI management system provides GPS-based geofencing, capacity tracking, and operational classification to support requisition management, trip monitoring, and real-time vehicle tracking.

This specification defines the POI data model, lifecycle management, geofencing capabilities, capacity tracking mechanisms, and integration with operational modules.

> **Runtime geofence / Live GPS / dwell (product SSOT):**  
> [`../09-tracking/README.md`](../09-tracking/README.md) · [`../09-tracking/geofence-boundary-management.md`](../09-tracking/geofence-boundary-management.md) · [`../09-tracking/vehicle-arrival-departure.md`](../09-tracking/vehicle-arrival-departure.md)  
> This master-data doc owns the **POI radius field and admin UX**; tracking owns **evaluation, events, and map**.

---

## Implementation status (nourish-backend / `apps.master_data`)

The following reflects the **current Django implementation** so this document can be read as *target behaviour* (below) plus *what exists in code today*:

| Area | Implemented now | Not in `POI` model / admin yet |
|------|-------------------|--------------------------------|
| Identity & location | `poi_code`, `name`, `poi_type` (**`POIType`** — poultry/logistics-specific enum), `address`, `city`, `country`, `latitude`/`longitude`, `geofence_radius_meters` | PRD TypeScript enum names in §1.1 differ from **`POIType`** labels — use DB choices as source of truth |
| Capacity (configured) | `storage_capacity_mt`, `capacity_threshold_pct`, `number_of_gates`, `number_of_scales` | — |
| Capacity (computed / stock) | **`POIStock`** one-to-one; changelist columns via `display_*` methods; **`POIStockInline`** on change form; `get_queryset().select_related("stock")` | PR snapshot APIs in dependent workflows — partial (see STK-01) |
| Admin layout | Fieldsets: main + collapsed **Geolocation** + **Capacity**; list/search/filter; LUP inline + stock inline on change | POI list map toggle (MDM-04-11); dependency-aware hard delete — roadmap |
| Map location picker (MDM-04-12) | **Select from map** on add/change: Leaflet modal, draggable pin, geofence circle preview, Nominatim reverse geocode → address/city on Apply; Cancel discards | POI changelist map view showing all geofences |
| Classification | — | **`operational_role`**, **`poi_category`** (source/destination/both) |
| Contacts | `contact_person`, `contact_phone` | **`in_charge_name`** (use `contact_person` or extend model later) |
| Status | `is_active` | Separate `status` enum — represented by **`is_active`** only |
| Bulk CSV | — | **`POI`** is **not** in **`import_configs.IMPORT_REGISTRY`**; **`POIAdmin`** does not use **`BulkImportExportMixin`** |

Sections **2–3** below remain the **intended** geofencing and capacity design; stock fields live on **`POIStock`**, not on **`POI`** directly.

### Django admin — POI map picker (MDM-04-12)

**Scope:** Additive enhancement to **`POIAdmin`** add/change only. Does **not** replace manual lat/lng entry.

| Item | Detail |
|------|--------|
| Entry point | **Select from map** button below longitude on the POI form |
| Modal | Leaflet + OpenStreetMap; draggable pin (tip = coordinate); circle from form `geofence_radius_meters` |
| Reverse geocode | Nominatim preview → fills **Address** (and **City** when available) on **Apply location** |
| Apply | Writes `latitude`, `longitude`, optional `address`/`city`; user still clicks **Save** on the POI form |
| Cancel | Close, backdrop click, or Escape — no form field changes |
| Source of truth | **Latitude/longitude** for geofencing; address text is helper data |
| Assets | `templates/admin/master_data/poi/change_form.html`, `static/admin/js/poi_map_picker.js`, `static/admin/css/poi_map_picker.css` |
| Admin wiring | `change_form_template` + `class Media` only — **must not** alter `list_display`, fieldsets, or inlines (see [MDM-04 AC-1a](../../../03-backlog/sprints/sprint-2/01-master-data-management/MDM-04-poi-management.md)) |

---

## 1. POI Architecture

### 1.1 POI Entity Model

```typescript
POI {
  poi_id: UUID
  poi_name: string          // Unique per tenant
  poi_type: enum [
    'FinishedFeedDepot',
    'FeedMill',
    'FeedDealer',
    'SilageProject',
    'RawMaterialWarehouse',
    'Factory',
    'Port',
    'Supplier',
    'Other'
  ]
  
  // Location
  address: string
  latitude: Decimal         // -90 to +90
  longitude: Decimal        // -180 to +180
  geofence_radius: Integer  // meters, 50-1000m range
  
  // Contact
  in_charge_name: string (nullable)
  contact_phone: string (nullable)
  
  // Capacity
  total_capacity_mt: Decimal       // Metric tons
  current_stock_mt: Decimal        // Updated on loading/unloading
  in_transit_stock_mt: Decimal     // From active trips
  free_capacity_mt: Decimal (computed)
  
  // Classification
  operational_role: enum ['Inbound', 'Outbound', 'Neutral']
  poi_category: enum ['Source', 'Destination', 'Both']
  
  // Status
  status: enum ['Active', 'Inactive']
  
  // Metadata
  tenant_id: UUID
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

### 1.2 POI Types

**Manufacturing & Storage**:
- **Feed Mill**: Feed production facility
- **Finished Feed Depot**: FG storage and distribution point
- **Raw Material Warehouse**: RM storage facility
- **Factory**: Manufacturing plant
- **Silage Project**: Agricultural storage project

**Distribution**:
- **Feed Dealer**: Customer delivery point
- **Supplier**: Vendor pickup location
- **Port**: Import/export terminal

### 1.3 Operational Classification

**By Direction**:
- **Inbound**: Receives incoming shipments (warehouses, factories)
- **Outbound**: Sends outgoing shipments (depots, feed mills)
- **Neutral**: Both inbound and outbound (ports, transfer hubs)

**By Requisition Role**:
- **Source**: Origin POI for requisitions
- **Destination**: Target POI for requisitions
- **Both**: Can serve as either

---

## 2. Geofencing System

### 2.1 Geofence Configuration

**Geofence Definition**:
```
Circle-based geofence:
  Center: (latitude, longitude)
  Radius: 50 to 1000 meters (configurable)
```

**Radius Selection Guidelines**:
- **Small POIs** (gates, loading docks): 50-100m
- **Medium POIs** (depots, warehouses): 100-300m
- **Large POIs** (ports, factories): 300-1000m

### 2.2 Geofence Detection

**Entry/Exit Detection**:
```typescript
function detectGeofenceEvent(
    vehicleLocation: {lat, lng},
    poi: POI,
    previousState: 'Inside' | 'Outside'
): GeofenceEvent | null {
    // Calculate distance using Haversine formula
    const distance = calculateDistance(
        vehicleLocation,
        { lat: poi.latitude, lng: poi.longitude }
    );
    
    const isInside = distance <= poi.geofence_radius;
    
    if (isInside && previousState === 'Outside') {
        return {
            event_type: 'Entry',
            poi_id: poi.poi_id,
            vehicle_id: vehicle.vehicle_id,
            timestamp: NOW(),
            distance_from_center: distance
        };
    } else if (!isInside && previousState === 'Inside') {
        return {
            event_type: 'Exit',
            poi_id: poi.poi_id,
            vehicle_id: vehicle.vehicle_id,
            timestamp: NOW(),
            distance_from_center: distance
        };
    }
    
    return null;
}
```

### 2.3 Geofence Applications

**Trip Monitoring**:
- Detect vehicle arrival at source/destination POI
- Trigger gate-in/gate-out workflows
- Calculate dwell time (time inside geofence)
- Track trip milestone completion

**Real-Time Tracking**:
- Display vehicles within POI geofence
- Alert on unexpected POI visits
- Monitor loading/unloading duration

**Analytics**:
- Average dwell time per POI
- Peak hours analysis
- Congestion detection

---

## 3. Capacity Tracking

### 3.1 Capacity Components

```typescript
Capacity Calculation:
  total_capacity_mt:        // Configured storage limit
  current_stock_mt:         // Physical stock at POI
  in_transit_stock_mt:      // Stock en-route to POI
  free_capacity_mt:         // Computed: total - current - in_transit
  projected_capacity_mt:    // After pending requisitions
```

### 3.2 Stock Update Mechanism

**Stock Reduction (Source POI)**:
```
Trigger: Loading completion + Scale-out weight entry
Action: Reduce current_stock_mt by loaded quantity
```

**Stock Increase (Destination POI)**:
```
Trigger: QC Pass + Unloading completion
Action: Increase current_stock_mt by delivered quantity
```

**In-Transit Tracking**:
```typescript
function updateInTransitStock(poi_id: UUID): void {
    // Sum all active trips with this POI as destination
    const inTransit = await db.query(`
        SELECT SUM(quantity) as total
        FROM trips t
        JOIN transport_orders to ON t.to_id = to.to_id
        WHERE to.destination_poi_id = :poi_id
          AND t.status IN ('Dispatched', 'InTransit', 'Loading', 'Loaded')
    `);
    
    await updatePOI(poi_id, {
        in_transit_stock_mt: inTransit.total || 0
    });
}
```

### 3.3 Capacity Warnings

**Threshold-Based Alerts**:
```typescript
Capacity Utilization = (current_stock + in_transit) / total_capacity

Warning Levels:
  80%: Yellow alert (monitor)
  90%: Orange alert (caution)
  100%: Red alert (at capacity, block new requisitions)
```

**Requisition Validation**:
```typescript
function validateDestinationCapacity(
    poi_id: UUID,
    requisition_quantity: Decimal
): ValidationResult {
    const poi = await getPOI(poi_id);
    
    const projectedStock = poi.current_stock_mt +
                          poi.in_transit_stock_mt +
                          requisition_quantity;
    
    if (projectedStock > poi.total_capacity_mt) {
        return {
            valid: false,
            message: `Destination capacity exceeded. Available: ${poi.free_capacity_mt} MT, Requested: ${requisition_quantity} MT`,
            severity: 'Error'
        };
    } else if (projectedStock > poi.total_capacity_mt * 0.9) {
        return {
            valid: true,
            message: `Warning: Destination at 90%+ capacity after this requisition.`,
            severity: 'Warning'
        };
    }
    
    return { valid: true };
}
```

---

## 4. POI Lifecycle Management

### 4.1 POI Creation

**Creation Workflow**:
```
1. Admin enters POI details (name, type, address)
2. Admin sets GPS coordinates:
   - Manual entry in latitude/longitude fields, OR
   - **Select from map** → modal → drag pin to exact spot → preview geofence circle → Apply (optional reverse-geocoded address)
3. Admin configures geofence radius (circle in map picker reflects this value)
4. Admin sets total capacity and capacity threshold
5. System validates uniqueness and coordinates
6. Admin saves POI form → record persisted with status Active
7. System initializes POIStock row (current_stock = 0) via migration/seed
8. Geofencing engine reads lat/lng + geofence_radius_meters on next poll (VTG-01)
```

**Validation Rules**:
```typescript
{
  poi_name: {
    unique_per_tenant: true,
    min_length: 3,
    max_length: 100,
    pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
  },
  latitude: {
    min: -90,
    max: 90,
    precision: 6  // ~0.1m accuracy
  },
  longitude: {
    min: -180,
    max: 180,
    precision: 6
  },
  geofence_radius: {
    min: 50,
    max: 1000,
    unit: 'meters'
  },
  total_capacity_mt: {
    min: 0,
    max: 999999,
    unit: 'metric_tons'
  }
}
```

### 4.2 POI Updates

**Editable Fields**:
- POI name (with uniqueness check)
- Address
- GPS coordinates (triggers geofence update)
- Geofence radius (triggers geofence recalculation)
- Total capacity (triggers requisition re-validation)
- Contact information
- Operational role classification

**Non-Editable Fields**:
- POI ID
- Tenant ID
- Created timestamp
- Current stock (updated via operational events only)

**Cascade Effects**:
```typescript
async function updatePOI(poi_id: UUID, updates: Partial<POI>): Promise<void> {
    const poi = await getPOI(poi_id);
    
    // Coordinates changed: update GPS system
    if (updates.latitude || updates.longitude || updates.geofence_radius) {
        await gpsSystem.updateGeofence(poi_id, {
            center: { lat: updates.latitude || poi.latitude,
                     lng: updates.longitude || poi.longitude },
            radius: updates.geofence_radius || poi.geofence_radius
        });
        
        // Recalculate active trip geofence events
        await recalculateGeofenceEvents(poi_id);
    }
    
    // Capacity changed: re-validate pending requisitions
    if (updates.total_capacity_mt) {
        const pendingReqs = await getPendingRequisitions(poi_id, 'destination');
        for (const req of pendingReqs) {
            await validateDestinationCapacity(poi_id, req.quantity);
        }
    }
    
    // Apply updates
    await db.update('pois', poi_id, updates);
    
    // Audit log
    await auditLog({
        event: 'POIUpdated',
        poi_id,
        changes: updates,
        updated_by: getCurrentUser().user_id
    });
}
```

### 4.3 POI Deactivation

**Soft Delete (Deactivation)**:
```typescript
async function deactivatePOI(poi_id: UUID, reason: string): Promise<void> {
    // Check dependencies
    const dependencies = await checkPOIDependencies(poi_id);
    
    if (dependencies.has_active_inventory) {
        throw new Error('Cannot deactivate POI with active inventory. Transfer stock first.');
    }
    
    if (dependencies.pending_requisitions > 0) {
        throw new Warning(`${dependencies.pending_requisitions} pending requisitions reference this POI. Reassign or cancel them.`);
    }
    
    // Update status
    await updatePOI(poi_id, {
        status: 'Inactive',
        deactivation_reason: reason,
        deactivated_at: NOW()
    });
    
    // Remove from dropdown selections
    // Historical data preserved for audit/reporting
}
```

**Hard Delete Prevention**:
- Hard delete blocked if any historical trips reference POI
- Hard delete blocked if any requisitions (even completed) reference POI
- Only Super Admin can hard delete (after archive)

---

## 5. POI Classification System

### 5.1 Operational Role

**Inbound POIs**:
- Primary function: Receive shipments
- Examples: Warehouses, factories, feed mills (receiving RM)
- Workflows: Gate-in, unloading, QC, stock-in

**Outbound POIs**:
- Primary function: Send shipments
- Examples: Depots, feed mills (sending FG), ports (exports)
- Workflows: Stock-out, loading, gate-out, dispatch

**Neutral POIs**:
- Both inbound and outbound
- Examples: Ports (import/export), transfer hubs, cross-docking centers

### 5.2 Map Visualization

**Color-Coded Markers**:
```typescript
POI Type → Marker Color:
  'FeedMill'              → Blue
  'FinishedFeedDepot'     → Green
  'RawMaterialWarehouse'  → Orange
  'Factory'               → Purple
  'Port'                  → Red
  'FeedDealer'            → Yellow
  'Supplier'              → Brown
```

**Marker Annotations**:
- POI name
- Current capacity utilization (%)
- Active vehicles in geofence
- Pending requisitions count

---

## 6. Integration Points

### 6.1 Requisition Management

POI data used in:
- **Source POI Selection**: Filter active outbound/neutral POIs
- **Destination POI Selection**: Filter active inbound/neutral POIs
- **Stock Validation**: Check source has sufficient stock
- **Capacity Validation**: Check destination has free capacity
- **Distance Calculation**: Calculate route distance between source/destination POIs

### 6.2 Transport Order & Trip Management

- **Route Planning**: Use POI coordinates for route calculation
- **GPS Tracking**: Monitor vehicle position relative to POI geofence
- **Milestone Tracking**: Detect arrival/departure from POIs
- **ETA Calculation**: Estimate arrival time based on distance and traffic

### 6.3 Gate Operations

- **Gate-In**: Validate vehicle at correct POI (geofence check)
- **Gate-Out**: Record departure from POI
- **POI-Specific Gates**: Multiple gates per POI with individual operators

### 6.4 QC Operations

- **QC Location**: QC performed at destination POI
- **Sample Collection**: Link samples to POI location
- **Lab Assignment**: Assign lab based on POI proximity

---

## 7. Capacity Snapshot View

### 7.1 Real-Time Capacity Dashboard

**Per-POI Display**:
```
┌──────────────────────────────────────────────────┐
│ POI: Dhaka Depot #1                             │
├──────────────────────────────────────────────────┤
│ Total Capacity:    1000 MT                       │
│ Current Stock:      650 MT (65%)                 │
│ In-Transit:         200 MT (20%)                 │
│ Available:          150 MT (15%) ⚠️              │
│                                                   │
│ Projected (after pending PRs):                   │
│   +150 MT incoming → 0 MT free (100%) 🔴        │
│                                                   │
│ Status: Near capacity - Review new requisitions  │
└──────────────────────────────────────────────────┘
```

### 7.2 Capacity Trend Analysis

**Historical Tracking**:
- Daily capacity snapshots
- Peak utilization periods
- Stock turnover rate
- Average dwell time of stock

**Forecasting**:
- Predicted capacity in next 7/30 days
- Seasonal patterns
- Optimization recommendations

---

## 8. Business Rules

### 8.1 POI Selection Rules

```typescript
Requisition Creation:
  IF product_type == 'FinishedGoods':
      source_poi_types = ['FeedMill', 'FinishedFeedDepot']
      dest_poi_types = ['FinishedFeedDepot', 'FeedDealer']
  ELSE IF product_type == 'RawMaterial':
      source_poi_types = ['Port', 'Supplier', 'RawMaterialWarehouse']
      dest_poi_types = ['FeedMill', 'Factory', 'RawMaterialWarehouse']
```

### 8.2 Geofence Accuracy

- GPS accuracy: Minimum 10m (typical mobile GPS)
- Geofence buffer: 20m added to radius for detection tolerance
- Position update frequency: Every 30 seconds while trip active

### 8.3 Stock Reconciliation

**Periodic Reconciliation**:
- Daily: Compare system stock vs physical count
- Weekly: Audit capacity utilization
- Monthly: Reconcile completed trips vs stock movements

**Discrepancy Handling**:
```typescript
IF abs(system_stock - physical_count) > tolerance_threshold:
    CREATE stock_adjustment_record
    REQUIRE supervisor_approval
    UPDATE current_stock_mt to physical_count
    LOG adjustment in audit trail
```

---

## 9. Data Model Details

### 9.1 Computed Fields

```typescript
// Free capacity calculation
free_capacity_mt = total_capacity_mt - current_stock_mt - in_transit_stock_mt

// Capacity utilization percentage
capacity_utilization = ((current_stock_mt + in_transit_stock_mt) / total_capacity_mt) * 100

// Projected capacity after requisition
projected_stock_mt = current_stock_mt + in_transit_stock_mt + pending_requisition_quantity
projected_utilization = (projected_stock_mt / total_capacity_mt) * 100
```

### 9.2 Indexes for Performance

```sql
CREATE INDEX idx_poi_tenant_status ON pois(tenant_id, status);
CREATE INDEX idx_poi_type ON pois(poi_type);
CREATE INDEX idx_poi_coordinates ON pois(latitude, longitude);  -- For spatial queries
CREATE INDEX idx_poi_name_tenant ON pois(poi_name, tenant_id);  -- Unique constraint
```

---

## 10. Related Documentation

- **[Bulk Import & Export](bulk-import-export.md)** - CSV bulk import/export for POI (and other master entities)
- **[Master Data README](README.md)** - Overall master data management
- **[Product Master Data Management](product-master-data-management.md)** - Product master data
- **[Product Requisition Management](../04-requisitions/product-requisition-management.md)** - How POIs are used in requisitions
- **[Trip Management](../05-transport/trip-management.md)** - Geofence integration with trips

**Related User Stories:**
- US-014: Capacity Checking and Warnings

**Source**: PRD_DFMS_v1.0.md - Sections 6.5.1-6.5.8
