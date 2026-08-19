---
story: INFRA-04
story_title: Caching and Session Storage (Redis-backed)
jira_key: DFS-004
sprint: "Sprint 1"
feedback_date: 2026-03-31
recorded_by: Development Team
status: Open
---

# Feedback: INFRA-04 — Caching and Session Storage

## FB-003 — Session Timeout: Extend from 30 Minutes to 24 Hours

| Field | Value |
|-------|-------|
| **Source** | Client (Nourish) |
| **Raised by** | Client team |
| **Priority** | Medium |
| **Status** | Open |

The current 30-minute session timeout is too short for operational users who work continuous shifts. Users are frequently logged out mid-task, disrupting workflows (gate operators, warehouse managers, etc.).

**Expected Behaviour:**
- `SESSION_COOKIE_AGE` changed from `1800` (30 min) to `86400` (24 hours)
- Applies to both tenant portal sessions and platform admin sessions

**Acceptance Criteria Added:**
- [ ] `SESSION_COOKIE_AGE = 86400` (24 hours) set in `config/settings/base.py`
- [ ] Session expiry is confirmed in testing: session expires 24 hours after login

---

## Action Items

| # | Action | Description | Jira Sub-task | Source | Priority | Status |
|---|--------|-------------|---------------|--------|----------|--------|
| FB-003 | Extend session timeout to 24 hours | Set `SESSION_COOKIE_AGE = 86400` | DFS-004-6 | Client | Medium | Open |

---

## Notes

- This is a config-only change in `config/settings/base.py` — low implementation effort
- Applies to both tenant portal JWT sessions and platform admin Django sessions
- May need a separate, shorter timeout for the platform admin portal (security consideration — to be discussed)
