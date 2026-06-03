# GT06 Ingest Server — Integration Contract

> **Status**: Active (Phase 1 scaffold)  
> **Implementation**: `nourish-backend/services/gt06-ingest/`  
> **Hardware**: Jimi IoT GT06N (Concox GT06 protocol over TCP)  
> **Last Updated**: June 2026

---

## Purpose

DFMS operates its **own GT06 TCP ingest server** instead of relying on TrackSolid / GPSWOX as the system of record for device data.

| Layer | Responsibility |
|---|---|
| `services/gt06-ingest/` | Device gateway — TCP listener, protocol parse, ACK, event storage |
| `apps/tracking/` (Django) | Business layer — trip linkage, geofence, map APIs (Phase 2 integration) |

---

## Data path

```text
GT06N device ──TCP:5023──► gt06-ingest service
                                │
                                ▼
                          Redis (latest + history)
                                │
                                ▼ (future)
                          Django apps/tracking ──► PostgreSQL gps_tracking
                                │
                                ▼
                          Command Centre map / US-026 APIs
```

---

## Protocol

- **Transport**: TCP (plain text binary, not HTTP)
- **Framing**: `0x7878` start, length byte, protocol number, payload, serial, CRC-16/X-25, `0x0D0A` stop
- **Phase 1 message types**: `0x01` login, `0x12` location, `0x13` status, `0x16` alarm
- **Device identity**: IMEI (8-byte BCD in login packet)

---

## Service ports

| Port | Protocol | Consumer |
|---|---|---|
| `5023` | TCP | GT06N devices (public internet) |
| `8080` | HTTP | Health checks, dev verification, future DFMS polling |

---

## HTTP read API (Phase 1 — verification)

```http
GET /health
GET /devices
GET /devices/{imei}/latest
GET /devices/{imei}/history?limit=100
```

These endpoints are **read-only** and for operations/debugging. Production DFMS consumption will move to Redis queue → Django Celery (planned).

---

## Device provisioning (operations)

SMS commands sent to the device SIM (by Nourish ops):

```text
APN,<carrier_apn>#
SERVER,0,<public_ip>,5023,0#
TIMER,30,300#
GPRSSET#
```

Default OEM platform (`tracksolid.com`) is **not used**.

---

## Multi-tenancy (planned)

TCP connections carry IMEI only — no HTTP `Host` header. A **public-schema device registry** (`IMEI → tenant_schema + vehicle_id`) will route events to the correct tenant before writing to `gps_tracking`.

---

## Related documents

- [External systems](../../04-architecture/01-system-design/integration/external-systems.md)
- [US-026 Real-time map dashboard](../../../03-backlog/stories/US-026-realtime-map-dashboard.md)
- Implementation README: `nourish-backend/services/gt06-ingest/README.md`

---

**Contact**: DFMS Engineering
