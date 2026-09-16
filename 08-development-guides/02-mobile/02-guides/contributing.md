---
last_updated: 2026-09-16
---

# Vendor Mobile — Contribution Conventions

## Feature checklist

1. Add/extend under `lib/presentation/feature/<name>/` with `binding/`, `route/`, `screen/`, ViewModel.
2. Domain model + repository method in `domain/` if new capability.
3. Live + seed implementations in `data/` when toggling matters.
4. Register DI in `DataModule` / bindings.
5. Update product spec under `DFMS-product-context/.../vendor-mobile/` if behavior/rules change.
6. Add/adjust Maestro flow under `.maestro/flows/`.

## Do not

- Call HTTP from ViewModels (go through repositories).
- Depend on `data` from `domain`.
- Treat Driver/QC Flutter specs as implemented unless status says so.

## Style

Follow existing `BaseViewModel` / adaptive UI patterns in the repo. Prefer matching neighboring features over introducing a new state-management library.
