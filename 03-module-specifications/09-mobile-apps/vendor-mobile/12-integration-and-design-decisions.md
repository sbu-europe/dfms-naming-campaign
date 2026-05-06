---
last_updated: 2026-05-06
---

# Vendor Mobile — Integration & Design Decisions

## Integration points

### Upstream: Vendor Portal Module
- Mobile app syncs with web-based vendor portal (shared backend)

### Upstream: Vendor Bidding Module
- Bid opportunities fetched from bidding system
- Bid submissions processed by bidding workflow

### Downstream: Trip Management Module
- Assigned TOs convert to trips upon post-award driver/vehicle submission
- Real-time trip status updates

## Key design decisions

### Why mobile app (not just web)?
- Push notifications for time-sensitive bid alerts
- Mobile convenience for on-the-go vendor management
- Better UX for post-award driver/vehicle detail submission (form entry, camera access)

### Why limited offline (not full offline)?
- Bid submission requires real-time validation (bid window open, no duplicates)
- Post-award actions require immediate backend updates (trip creation)
- Most vendors have reliable connectivity (office/warehouse environments)

### Why blind bidding?
- Prevents collusion (vendors cannot see competitors' bids)
- Ensures fair competition
- Industry best practice for procurement

