# Lab Test flow — MDM-05 + QC-02

**The story in one line:** Admin defines the tests → Inspector sends the bag → Lab works a **code**, not a truck → Unloading still needs **QC Pass**.

Use this order in the room. Each section is one slide.

---

## Slide 1 — The four steps

Follow left to right. Lab Complete does **not** open the unloading bay.

```mermaid
flowchart LR
  A["1. Admin<br/>sets up the test list"] --> B["2. Inspector<br/>samples and sends the bag"]
  B --> C["3. Lab<br/>opens the code, runs tests, uploads reports"]
  C --> D["4. Inspector<br/>sees Lab Completed"]
  D -.-> E["Unloading bay<br/>only after QC Pass"]
```

| Step | Who | What they do |
|------|-----|----------------|
| 1 | Tenant Admin | Create categories, units, and tests (with a reference number, e.g. `20 ppb`) |
| 2 | Inspector | Sample is already on the truck (QC-01). They **send it to lab** and **stick a QR on the bag** |
| 3 | Lab technician | Scan the QR **or** pick the code. They never see the truck, TO, or product. Tenant Super Admin / Tenant Admin can do the same Lab Queue work after selecting **Working site**. |
| 4 | Inspector | Sees lab status on **their** QC screen. Command Center still waits for **Pass** |

---

## Slide 2 — Step 1: Admin builds the catalog (MDM-05)

A test cannot be saved until a **category** and a **unit** exist. The number on the test is a **reference** (`Aflatoxin B1 — 20 ppb`). The system does not treat it as max or min.

```mermaid
flowchart LR
  C["1. Test category<br/>e.g. Contaminant"] --> T["3. Lab test"]
  U["2. Lab unit<br/>e.g. ppb"] --> T
  T --> R["Aflatoxin B1<br/>20 ppb"]
```

**Example row after save**

| Code | Name | Category | Reference |
|------|------|----------|-----------|
| AFLA-B1 | Aflatoxin B1 | Contaminant | 20 ppb |
| MOISTURE | Moisture | Moisture | 12.5 % |

**Rules to say out loud**

- Only **Admin** (or Tenant Super Admin) can do this. Lab cannot.
- Pick category and unit from the list — do not type them on the test.
- Lab unit is **not** Bag / Ton / KG (those are for products).
- Do not delete. **Deactivate** — old samples keep the name; new work cannot pick it.

---

## Slide 3 — Steps 2–4: Bag goes to the lab (QC-02)

Inspector owns the **shipment**. Lab owns the **bag code**. Opening by QR or by picking the code is the **same** sample.

```mermaid
flowchart TD
  S1["Inspector already has a QC sample on the truck"] --> S2["Inspector: Send to lab"]
  S2 --> S3["System prints a QR for the sample code"]
  S3 --> S4["Inspector sticks QR on the bag"]
  S4 --> S5["Lab queue shows that code as To-Do"]
  S5 --> S6{"Lab opens it"}
  S6 -->|Scan QR on the bag| S7["Status becomes In progress"]
  S6 -->|Pick the code in the queue| S7
  S7 --> S8["Lab picks tests from the admin list<br/>e.g. Moisture 12.5 % and Aflatoxin B1 20 ppb"]
  S8 --> S9["Lab enters expected finish time per test"]
  S9 --> S10["Lab uploads a PDF or photo per test"]
  S10 --> S11{"Every test has a report?"}
  S11 -->|No| S10
  S11 -->|Yes| S12["Status: Completed"]
  S12 --> S13["Inspector sees Completed on the TO"]
  S13 --> S14["Unloading still needs QC Pass — not this status"]
```

---

## Slide 4 — Lab queue status

```mermaid
flowchart LR
  T["To-Do<br/>sent, lab has not opened it"] --> I["In progress<br/>opened, still filing reports"]
  I --> C["Completed<br/>every attached test has a report"]
```

- Lab cannot jump from To-Do to Completed. They must open first.
- They must attach **at least one** test from the catalog. They cannot type a new name.
- Completed ≠ Pass. Pass is still the inspector on QC-01.

---

## Slide 5 — What the lab sees (and what they must not)

The lab screen is **blind** to the truck. Same rule on the API.

```mermaid
flowchart TB
  subgraph yes["Lab technician — yes"]
    Y1[The sample code]
    Y2[To-Do / In progress / Completed]
    Y3[When it was sent, opened, finished]
    Y4["Tests from the catalog, with the reference number"]
  end

  subgraph no["Lab technician — no"]
    N1[TO / vehicle / product / supplier]
    N2[Pass or Fail]
    N3[Assign unloading bay]
    N4[Change the test catalog]
  end
```

Inspector **does** see the TO. Blindness is for Lab Queue (technician, and Tenant Super Admin / Tenant Admin when covering lab). Catalog setup stays admin-only (MDM-05).

---

## Order of work

1. Ship **MDM-05** (category → unit → tests).
2. Then ship **QC-02** (send, QR, lab queue, attach, report).
3. Do **not** change QC-01 Pass / Fail or Command Center for this work.
