---
module: 03-users
specification: User & Driver — last_name optional (Sprint 8 — FB-002)
version: 1.0
phase: Phase 1
sprint: Sprint 8 (FB-002)
last_updated: 2026-08-13
related_stories: US-005, US-057
feedback_items: FB-002
baseline_spec: tenant-user-management.md
feedback_tracker: ../../03-backlog/sprints/sprint-8/feedback-resolution.md
implementation_reference:
  - nourish-backend/apps/users/models.py
  - nourish-backend/apps/users/admin.py
  - nourish-backend/apps/users/invitation_service.py
  - nourish-backend/apps/users/invitation_serializers.py
  - nourish-backend/apps/users/services.py
  - nourish-backend/apps/users/import_configs.py
---

# User & Driver — last_name optional (FB-002)

Sprint 8 implementation plan for [FB-002](../../03-backlog/sprints/sprint-8/feedback-resolution.md#fb-002--user--driver--last_name-optional). Amends [tenant-user-management.md](./tenant-user-management.md) (invite / user edit) and driver add / bulk I/O in `apps/users/`.

**Problem:** Ops cannot save a User or Driver with only a first name (example: **Karim**, last name empty). The client wants first name to be enough.

**Rule:** First name required. Last name optional. Blank last name is stored as empty (`""`). Never invent `Member` / `User` / `-`.

Do the steps **in this order**. Step 1 is the lock: without it, every form still fails on save.

---

## Why Driver is in this plan

A Driver **does not have a separate name**. Add Driver creates a **User** and stores first/last name there. Fix the User rule once, then stop Invite, Add Driver, and CSV from blocking a blank last name.

---

## Two traps

**Trap 1 — invite works, then the person cannot set a password**

Invite and activation are two different checks. The invite form can save `invitee_last_name = ""`. When Karim opens the link he only sets a password; names are copied from the invitation. `activate_invitation` still does `if not fn or not ln` and rejects. Change activation to require **first name only**.

**Trap 2 — the system invents `Member`**

`UserService.invite_user` writes `"Member"` when last name is blank. Empty must stay empty.

---

## Step 1 — Allow empty last name on User

Needed by FB-002-1, FB-002-2, and FB-002-3.

File: `apps/users/models.py`

- Change `last_name` to allow blank (`blank=True, default=""`).
- Keep `first_name` required.
- Drop `last_name` from `REQUIRED_FIELDS` (leave `first_name`).
- Add a migration. Do **not** rewrite existing users.

---

## Step 2 — Invite user + edit user (FB-002-1)

File: `apps/users/admin.py`

- `InviteUserForm`: stop setting `invitee_last_name.required = True` (keep first name required).
- `InvitationTokenAdmin.save_model`: if last name is missing, pass `""`.
- User edit form (`UserAdminForm`): no extra change after Step 1 — it follows the User model.

Same product rule on the invite API (admin and API stay aligned):

- `apps/users/invitation_serializers.py` — `CreateInvitationSerializer.last_name`: optional, allow blank.
- `apps/users/invitation_service.py` — `bulk_create_invitations_from_csv`: reject only if **first** name is empty.

---

## Step 3 — Activation

File: `apps/users/invitation_service.py` — `activate_invitation`

Today:

```python
if not fn or not ln:
    raise ValidationError("First and last name are required.")
```

Karim’s invitation already has `invitee_last_name = ""`. The activation page does not ask him to type last name again. This line then blocks password set.

Change: require **first name only**. Leave last name empty if it was empty.

---

## Step 4 — Do not invent `Member`

File: `apps/users/services.py` — `UserService.invite_user`

Today: blank last name becomes `"Member"`. Change: store blank. Do not touch the first-name `"Team"` fallback.

---

## Step 5 — Add driver (FB-002-2)

File: `apps/users/admin.py` — `DriverAdminForm` + `DriverAdmin.save_model`

- Last name on Add Driver is its **own** form box (not the User field). Mark it `required=False`.
- On save, copy `""` onto the new User and onto the invitation if the box is empty.
- Driver **edit** does not show name — name is edited on the User page (Step 2). Skip Driver change form.

---

## Step 6 — User CSV and Driver CSV (FB-002-3)

File: `apps/users/import_configs.py`

- `UserImportConfig` and `DriverImportConfig`: last name `required=False`, `default=""` (so a blank cell becomes empty string, not a crash).
- Keep the `last_name` **column** on the template. Ops may leave the cell empty.
- First name stays required.

---

## Step 7 — Tests

| Test | Passes when |
|------|-------------|
| Invite with blank last name | Saves; User last name is empty |
| Existing `test_invite_user_form_init_sets_required` | Last name `required is False` (today it expects `True`) |
| Activate with blank invite last name | Password set succeeds |
| Edit user, clear last name | Saves |
| Add driver with blank last name | Saves |
| User CSV + Driver CSV, blank `last_name` | Import OK |
| Same CSVs, blank `first_name` | Still rejected |

---

## Out of scope

| Leave it | Why |
|----------|-----|
| **Create Tenant** “admin full name must be two words” | Different screen (platform creates a company). Not staff User/Driver. |
| Deactivated accounts renamed to last name `User` | That is wiping personal data after deactivation, not creating a person. |
| Helper “full name” (one box) | Helpers are not first-name + last-name. |
| First name | Client still wants it mandatory. |

---

## How we know it is done

1. Invite a user: first name `Karim`, last name empty → saves.
2. Open Users list → you see **Karim**.
3. Open that user, leave last name empty, save → still OK.
4. Add a driver the same way → saves.
5. Import a 1-row User CSV and a 1-row Driver CSV with `last_name` empty → both import.
6. Karim opens the invite link and sets a password → succeeds.
7. Nowhere did the system write `Member` or `User` as a last name.
