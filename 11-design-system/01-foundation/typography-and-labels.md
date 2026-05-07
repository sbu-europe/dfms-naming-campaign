---
title: Typography & Label Conventions
category: design-system
section: foundations
status: approved
created: 2026-05-07
last_updated: 2026-05-07
---

# Typography & Label Conventions

> Defines how text labels — navigation items, column headers, form field labels, and fieldset titles — are capitalised throughout the DFMS admin panel.

---

## Decision: Sentence-case with acronym exceptions

DFMS follows **Django's default sentence-case convention** for all labels, with one hard rule: **domain acronyms are always ALL CAPS**, regardless of position in a sentence.

### Rationale

- Sentence-case is the convention recommended by most modern design systems (Material, Atlassian, GOV.UK) and is Django's built-in default — this minimises maintenance burden.
- For a dense ops dashboard, acronyms carry meaning. `Poi`, `Tr`, `To`, `Uom` are confusing; `POI`, `TR`, `TO`, `UOM` are instantly recognisable to operators.
- Title-casing every label was considered but rejected: the churn is not worth the marginal readability gain for a developer-maintained admin panel.

---

## Acronym reference

The following acronyms must always be written in ALL CAPS in all labels, headings, and UI text:

| Acronym | Meaning |
|---------|---------|
| POI | Point of Interest (depot/warehouse/feed mill) |
| PR | Product Requisition |
| TR | Transport Requisition |
| TO | Transport Order |
| PS | Port Shipment |
| FG | Finished Goods |
| RM | Raw Material |
| UOM | Unit of Measure |
| KG | Kilogram |
| ID | Identifier |
| SKU | Stock Keeping Unit |
| ETA | Estimated Time of Arrival |
| C&F / CF | Cost & Freight |
| LC | Letter of Credit |
| TDO | Transport Dispatch Officer |

Plural forms (`TRs`, `TOs`, `PRs`, `POIs`) follow the same rule — the acronym portion stays uppercase.

---

## Implementation

### Source labels (preferred)

The primary fix is at the model/admin layer. Any Django model field whose name contains an acronym must have an explicit `verbose_name` to prevent Django from lowercasing it during auto-generation:

```python
# models.py — correct
pr_number = models.CharField(..., verbose_name="PR number")
tr_type   = models.CharField(..., verbose_name="TR type")
source_poi = models.ForeignKey(..., verbose_name="source POI")
to_number  = models.CharField(..., verbose_name="TO number")
```

Without `verbose_name`, Django generates `Pr number`, `Tr type`, `Source poi` — all incorrect.

Fields fixed as of **2026-05-07** across apps:

| App | Field | `verbose_name` added |
|-----|-------|----------------------|
| `requisitions` | `pr_number` | `"PR number"` |
| `requisitions` | `pr_type` | `"PR type"` |
| `requisitions` | `tr_number` | `"TR number"` |
| `requisitions` | `tr_type` | `"TR type"` |
| `requisitions` | `source_poi` | `"source POI"` |
| `requisitions` | `destination_poi` (TR & PR) | `"destination POI"` |
| `requisitions` | `target_poi` | `"target POI"` |
| `transport` | `to_number` | `"TO number"` |
| `transport` | `origin_poi` | `"origin POI"` |
| `transport` | `destination_poi` | `"destination POI"` |
| `master_data` | `assigned_poi` | `"assigned POI"` |
| `operations` | `poi` (GateEntry) | `"POI"` |
| `users` | `poi` (InvitationToken) | `"POI"` |

Admin `short_description` values on computed columns are set directly and already follow this convention.

### JS safety net (`dfms_labels.js`)

As a secondary safeguard, `static/admin/js/dfms_labels.js` is loaded on every admin page. It post-processes the rendered DOM to:

1. Apply title-case to sidebar nav item labels (`.dfms-nav-item-label`), nav group headings (`.dfms-nav-group-label`), changelist column headers, fieldset headings, and form field labels.
2. Restore known acronyms to ALL CAPS after title-casing (`poi → POI`, `tr → TR`, `tos → TOs`, etc.).

This catches auto-generated labels from any new fields that haven't yet received an explicit `verbose_name`, and corrects Django's `capfirst` rendering of `verbose_name_plural` in the nav sidebar (which only uppercases the first character of the whole string, leaving internal words lowercase).

**The JS is a safety net, not the primary fix.** New fields with acronyms should always have `verbose_name` set at source.

#### Acronym list in JS

The JS acronym set is maintained in `static/admin/js/dfms_labels.js`:

```js
const ACRONYMS = new Set([
  'poi', 'pois', 'tr', 'trs', 'to', 'tos', 'pr', 'prs', 'ps', 'fg', 'uom', 'id', 'ids',
  'kg', 'mt', 'sku', 'csv', 'otp', 'sms', 'dfs',
  'rm', 'lc', 'cf', 'qc', 'eta', 'gps', 'url',
]);
```

Add new domain acronyms here as the system grows.

---

## When adding new fields — checklist

- [ ] Field name contains an acronym (POI, TR, TO, PR, UOM, KG, etc.) → add `verbose_name`
- [ ] New admin computed column → set `short_description` in Title Case with correct acronym casing
- [ ] New fieldset title in `admin.py` → write in sentence-case, capitalise acronyms (e.g. `"POI assignment"`, `"TR planning inputs"`)
- [ ] New nav section (app or model) → `verbose_name_plural` in Title Case with correct acronyms (e.g. `"Transport Orders (TOs)"`)
- [ ] New acronym introduced → add to both this doc and the JS acronym set

---

**Owner**: Engineering  
**Related files**: `static/admin/js/dfms_labels.js`, `static/admin/css/custom.css`
