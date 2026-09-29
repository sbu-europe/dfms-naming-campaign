---
module: 09-tracking
specification: GPS providers & device configuration
prd_refs: ["§9.1 GPS/VTS Integration"]
related_stories: [GPS-01]
last_updated: 2026-08-06
audience: Business Analyst, Ops, Tenant Admin (provisioning)
---

# GPS Providers & Device Configuration

DFMS receives vehicle location from one or more GPS providers. This file is the **single place** for all device / provider configuration context. Add a new segment when a new device type or cloud provider is onboarded.

## How a provider fits (business view)

```
GPS device on vehicle
  → Provider path (GT06 server / SinoTrack / Meitrack / …)
    → DFMS GPS feed (normalised location)
      → Live GPS, arrival/departure, dwell
```

## Rules that apply to every provider

- Location is **read-only** for users — no manual edit of a vehicle’s position on the map.
- Each vehicle links via **GPS Device ID / Tracker ID** (e.g. IMEI) on Vehicle master data.
- Unmapped devices must not appear as fleet vehicles on Live GPS.
- If signal is lost, DFMS shows **last known** location with a clear status.
- Tracking is expected **24/7**, including when a vehicle is not on an active trip (history may still be stored).

## Provider catalogue

| # | Provider | Status | Segment |
|---|----------|--------|---------|
| 1 | **GT06** (Jimi IoT GT06N) | **Active** | [GT06](#gt06--jimi-iot-gt06n) |
| 2 | **SinoTrack 901-M** | Planned | [SinoTrack 901-M](#sinotrack-901-m--planned) |
| 3 | **Meitrack T333 / T322** | Planned | [Meitrack T333 / T322](#meitrack-t333--t322--planned) |

---

## GT06 — Jimi IoT GT06N

### What this provider is

Hardware trackers (GT06N) send location over the cellular network to **DFMS’s own GT06 receive server**. DFMS does **not** use TrackSolid / OEM cloud as the system of record for this path.

**Business outcome:** once the device is configured and the IMEI is linked to a Vehicle, the vehicle can appear on Live GPS when it has a trackable trip (and location history can accumulate even when idle).

### Who does what

| Step | Who | What |
|------|-----|------|
| Install tracker in vehicle | Fleet / vendor ops | Physical install + SIM |
| SMS-configure APN, server, interval | Ops (phone SMS to SIM) | Device points at DFMS GT06 server |
| Register Vehicle + GPS Device ID (IMEI) | Tenant Admin / Fleet | Master data link |
| Confirm on Live GPS | Transport Planner / TDO / Admin | Vehicle moves on map |

### Device configuration (business meaning)

| Setting | Why it matters | Typical expectation |
|---------|----------------|---------------------|
| APN | Device can use mobile data | Per SIM carrier |
| Server address + port | Where location is sent | DFMS GT06 server for that environment |
| Upload interval | How often position updates | Ops-agreed (e.g. ~30s when ignition on) |
| IMEI / Tracker ID | Identity matched to Vehicle | Unique per device |

Send SMS commands to the **SIM number in the tracker**. Use English commas, no spaces around commas; commands end with `#`. Success reply is usually `OK`.

#### Provisioning sequence (Ops)

Run in order when fitting a new tracker or re-pointing a device to DFMS. Default OEM platform (`tracksolid.com`) is **not** used.

| Step | SMS command | Purpose |
|------|-------------|---------|
| 1 | `APN,<carrier_apn>#` | Carrier GPRS APN |
| 2 | `SERVER,0,<public_ip>,5023,0#` | DFMS GT06 server — TCP port **5023** |
| 3 | `TIMER,30,300#` | Upload: **30s** ACC ON, **300s** ACC OFF |
| 4 | `GPRSON,1#` | Enable GPRS if needed |
| 5 | `GPRSSET#` | Verify APN, server, GPRS status |

```text
APN,<carrier_apn>#
SERVER,0,<public_ip>,5023,0#
TIMER,30,300#
GPRSON,1#
GPRSSET#
```

**Field check:** `GPRSSET#` should show `GPRS:ON` and `Server:0,<your_ip>,5023,0`. Then confirm IMEI on the Vehicle in DFMS and a marker on **Live GPS**.

#### Common SMS reference (Ops)

| Need | Command pattern | Notes |
|------|-----------------|-------|
| APN | `APN,<apn>#` or `APN,<apn>,<user>,<password>#` | Required for GPRS |
| Server (IP) | `SERVER,0,<ip>,<port>,0#` | DFMS uses IP mode + port **5023** |
| Server (DNS) | `SERVER,1,<hostname>,<port>,0#` | Alternate; DFMS usually uses IP |
| GPRS on/off | `GPRSON,1#` / `GPRSON,0#` | |
| Upload interval | `TIMER,<acc_on_sec>,<acc_off_sec>#` | |
| Check params | `PARAM#` | IMEI, timers, SOS, etc. |
| Check GPRS | `GPRSSET#` | APN + server line |
| Reboot | Per device manual | After major config changes if needed |

Full OEM behaviour: device user manual (GT06N). SOS / center number / fuel cut-off are device features — **not** part of Live GPS product scope.

### What must be configured in DFMS

| Item | Where | Rule |
|------|-------|------|
| Vehicle GPS Device ID | Vehicle master | Must match device IMEI |
| Vehicle GPS Device ID linked | Vehicle master | IMEI / tracker identity must match the provider feed |
| Live GPS permission | RBAC | Who can open the map |

**Flow:**

```
Device online → DFMS receives location for that IMEI
  → IMEI matches Vehicle
    → Vehicle can appear on Live GPS
      → TO / trip context is shown when available
```

### How the device communicates

```
GT06 device (cellular)
  → sends location periodically to DFMS GT06 server
    → DFMS keeps latest position for live view
      → Live GPS map shows operators near real-time markers
        → History / trail available for trip or time window
```

| Concept | Business meaning |
|---------|------------------|
| Live position | What operators see “now” on the map |
| Trail / history | Path over time for a trip or period |
| Signal lost | No fresh updates; last known position still shown |

### Environments

| Environment | Device should point to | Notes |
|-------------|------------------------|-------|
| Local / demo | Dev GT06 host:port | Mock fleet may substitute for hardware |
| Staging | Staging host:port | Real devices for UAT |
| Production | Production host:port | Ops runbook owns exact IP/DNS |

Host/IP values live in the environment / ops sheet — not secrets in this product doc.

### Acceptance checks (Ops / BA)

- [ ] Device SMS config points at the correct environment server
- [ ] IMEI entered on Vehicle master
- [ ] Device online; Live GPS shows the vehicle when on an active trip
- [ ] Movement / speed visible; signal-lost behaviour understood after agreed threshold

### Status vs PRD

| Topic | Status |
|-------|--------|
| GT06 as production location source | **Done** |
| Multi-device support beyond GT06 | **Planned** — GT06 is active today; SinoTrack and Meitrack are future device segments |

---

## SinoTrack 901-M — Planned

### What this device would be

SinoTrack **901-M** is a planned GPS tracker model for DFMS vehicle visibility. It is **not active** in the current runtime yet; GT06 covers the current Live GPS path.

### Planned business outcomes (when onboarded)

- Device identity mapped to Vehicle GPS Device ID in DFMS
- Provisioning steps documented for SIM, APN, server target, and reporting interval
- Same Live GPS operator experience as GT06 once data reaches DFMS
- Device-specific commands and field checks captured in this file when onboarding starts

### Status

| Topic | Status |
|-------|--------|
| SinoTrack 901-M onboarding | **Planned** |
| DFMS runtime support | **Not active yet** |

When SinoTrack onboarding starts, expand this segment with the same headings as GT06: Who does what, Device configuration, DFMS link, Communication flow, Environments, Acceptance checks.

---

## Meitrack T333 / T322 — Planned

### What these devices would be

Meitrack **T333** and **T322** are planned tracker models for DFMS. They are not active in the current runtime yet; GT06 remains the active device path today.

### Planned business outcomes (when onboarded)

- Device identity mapped to Vehicle GPS Device ID in DFMS
- Model-specific provisioning steps documented for SIM, APN, server target, and reporting interval
- Same Live GPS operator experience as other supported devices once data reaches DFMS
- Separate notes captured if T333 and T322 require different configuration commands or capabilities

### Status

| Topic | Status |
|-------|--------|
| Meitrack T333 onboarding | **Planned** |
| Meitrack T322 onboarding | **Planned** |
| DFMS runtime support | **Not active yet** |

When Meitrack onboarding starts, expand this segment with the same headings as GT06: Who does what, Device configuration, DFMS link, Communication flow, Environments, Acceptance checks.

---

## Adding another device / provider

Copy the GT06 segment structure:

1. What this provider is  
2. Who does what  
3. Device or portal configuration (business)  
4. DFMS master-data link  
5. How location reaches DFMS (BA diagram)  
6. Environments  
7. Acceptance checks  
8. Status vs PRD  

Update the [Provider catalogue](#provider-catalogue) table.

---

## Related

- [Live GPS (GPS-01)](../../../03-backlog/phase-1/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md)
- [Module hub](../README.md)
