# Design: 4th scenario — Paušál 50/100 + 1% zdanené

**For:** [01-task.md](./01-task.md), backed by [02-research.md](./02-research.md)

## What we're building

A **4th column**, parallel to the existing three (`Súkromné`, `Firemné 100%`, `Paušál 50/80`):
a company car under paušál VAT (50%, unaffected by any of this), but where the owner elects to
be personally taxed on private use (**nepeňažný príjem**, 1% rule) in exchange for **100%**
income-tax deductibility on the company side instead of the 80% cap.

This is not "the same paušál plus a forgotten cost" — per [02-research.md](./02-research.md),
the 1%-taxed treatment and the 80% flat-rate cap are **mutually exclusive** regimes under
§19 ods. 2 písm. t) vs. §5 ods. 3 písm. a). It's a genuine 4th structuring choice, worth
surfacing on its own rather than folding into the existing paušál column — even though, once
modeled precisely, it turns out to be the *worse* choice at the app's defaults (nets ~2,121
EUR **less** than the 80% column over 4 years; see [02-research.md](./02-research.md)). That
result is itself the useful finding: a company owner might assume "100% deduction beats an
80% cap" and be wrong once the personal tax on the benefit is priced in — showing that
clearly is exactly what this calculator is for.

## Scope decision: zero-salary owner only

**In scope:** the owner draws **no salary** from the company — dividends only, the persona this
calculator has always implicitly modeled (no salary/payroll concept exists anywhere in
`useCalculator.js` today). In this case (confirmed in research): personal income tax only
(19% default), **no odvody** (a konateľ with no right to regular income isn't a "zamestnanec"
for sociálne poistenie purposes).

**Out of scope:** the "owner is also a paid employee" case. That would need employer-side
payroll cost modeling the app has never had (a new company-cost concept, not a car-specific
one) — a materially bigger change. It's quantified and documented as a limitation instead (see
"Texts" below), not built.

## Formula

```
NEPENAZNY_PRIJEM_YEARS = 8   // §5 ods. 3 in force for 8 years from entry into service

For ownership year y (1-indexed, y <= 8):
  base(y)   = carPrice × (1 − 0.125 × (y − 1))      // full price incl. VAT; reduced 12.5%/yr
  annual(y) = base(y) × 0.12                          // 1% × 12 months
  tax(y)    = annual(y) × personalIncomeTaxRate       // new input, default 19%

For y > 8: base/annual/tax = 0
```

Company-side deduction: `makeCompanyScenario(0.5, 1.0, 0.8)` — same factory used for the other two
company scenarios, VAT at 50% (paušál, unaffected), tax deductibility at 100% (this is *why*
100% is allowed — the benefit is taxed to the owner instead).

Fuel is the exception (third argument, `fuelTaxPercent`). Fuel stays at the 80% PHL paušál
under § 19 ods. 2 písm. l), also with the 1% regime (FS 523850, otázka č. 5, quoted in
[02-research.md](./02-research.md)). The non-deductible 20% of fuel goes into
`nonDeductibleRunning`, the same as in the Paušál 50/80 column. Added 2026-10-02; the first
version deducted fuel at 100%.

Owner-side: subtract `tax(y)` from that year's dividends. `netToOwner` = base scenario's
`netToOwner` minus the sum of `tax(y)` across the ownership period. This only touches the
dividend/`netToOwner` chain — `taxableProfit`, corporate tax, and dividend tax are untouched
(this is a personal cost to the owner, not a company expense).

## New input

`personalIncomeTaxRate` (ref, default `0.19`) — editable in Advanced Settings, alongside the
existing tax-rate inputs, and included in the URL-sync param list. 19% matches the first
Slovak PIT bracket (up to €43,983.32/year for 2026); the benefit amount is small enough in
every realistic case here to stay in that bracket.

## Where it lives in the code

- [useCalculator.js](../../../src/composables/useCalculator.js): new `pausalTaxedScenario`
  computed, built on `makeCompanyScenario(0.5, 1.0)`, wrapping it to subtract the per-year
  personal tax from dividends/`netToOwner`/`totalCashOverYears`, and exposing the benefit
  amount + tax as new fields for the UI. Add to `scenarioNets`, `bestOption` (generic,
  no code change needed there — already iterates `Object.keys`), and a 4th cumulative series
  in `yearlyData`.
- [CompanyStyleCard.vue](../../../src/components/CompanyStyleCard.vue): reused as-is for the 4th
  column (same component powers `Firemné 100%` and `Paušál 50/80` today). One existing binding
  changes (`= Dividendy` row now reads `scenario.dividends` instead of `scenario.annualCash` —
  harmless no-op for the other two scenarios, where the two fields are identical). One new
  conditional row (`- Nepeňažný príjem 1% (daň X%)`), only rendered when the scenario carries
  that field. One new footnote stating the zero-salary assumption.
- [ResultsSummary.vue](../../../src/components/ResultsSummary.vue): 4th `<CompanyStyleCard>`,
  `bestLabel` gets a 4th branch, grid goes 3 → 4 columns (collapses to 1 column below 1000px
  already).
- [CostChart.vue](../../../src/components/CostChart.vue): 4th dataset, distinct color
  (`#8b5cf6`, violet — doesn't clash with the existing gray/green/amber or the app's blue
  UI-accent color).
- [useUrlSync.js](../../../src/composables/useUrlSync.js): add `pit` param for
  `personalIncomeTaxRate`.
- [AdvancedSettings.vue](../../../src/components/AdvancedSettings.vue): new input under "Dane".
- [README.md](../../../README.md): new section documenting the regime, the mutual-exclusivity
  finding, the zero-salary assumption, and the "if employed too" caveat with numbers.
- [useCalculator.test.js](../../../src/composables/useCalculator.test.js): new tests mirroring
  the existing `pausalScenario` describe block (rate/base mechanics, mutual exclusivity of
  taxPercent, benefit decline schedule, netToOwner delta sanity, chart accumulation).

## Texts (explicit documentation of the zero-salary assumption)

**In-card footnote** (next to the new tax-deduction row, Slovak, matching existing note style):
`pozn.: predpoklad = žiadna mzda, len dividendy (inak by pribudli odvody, cca 14-36%)`

**README section** (English prose matching existing section style): states the mutual
exclusivity finding with its source (financnasprava FAQ), the zero-salary assumption and why
odvody are 0 in that case, and the "if also employed" caveat (employee-side and employer-side
odvody would apply), so a reader who *is* also drawing a salary knows the number shown doesn't
apply to them as-is. (The draft figures "+1,400-1,850/year -> -1,264/+170/year" came from an
earlier model and are stale: they predate the final result and the 2026-10-02 fuel fix. Do not
reuse them.)

## Non-goals (reconfirmed)

- Electric vehicles (0.5% rate) — no vehicle-type input exists.
- Modeling owner salary / employer-side payroll cost — out of scope, documented instead.
- Resolving the open zdravotné poistenie question for the zero-salary case — flagged as
  unresolved in research; not modeled (treated as 0, consistent with the confirmed
  sociálne-poistenie-is-0 finding, and disclosed as an open question in the README caveat).
