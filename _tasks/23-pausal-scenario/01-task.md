# Third Scenario: Paušalizácia výdavkov (replace the 50% toggle)

**Status:** 📋 Planning

## Goal

Today the app has a **100% / 50%** business-usage **toggle** ([App.vue](../../src/App.vue) lines 18–19)
that switches the single company-car scenario between full deduction and a flat 50% applied
**uniformly** to both VAT recovery and the write-off.

**Remove the toggle entirely.** Instead, always show **three columns** side by side:

1. **Firemné 100%** — company car, full VAT recovery + full write-off (today's `businessUsagePercent = 1.0`)
2. **Firemné 50/80** — paušalizácia výdavkov: **VAT 50% deductible, TAX 80% deductible**
3. **Súkromné** — private car (existing, unchanged)

No mode switch — the user compares all three at once.

## Key change: split the flat percentage into two

The current toggle applies **one** percentage to everything:

```js
const vatReclaim   = computed(() => vatAmount.value        * businessUsagePercent.value)
const annualWriteOff = computed(() => annualWriteOffBase.value * businessUsagePercent.value)
```

The paušál column needs **two independent percentages** — VAT and income-tax deductibility
differ:

| Item | Firemné 100% | Paušál 50/80 |
|------|--------------|--------------|
| VAT recovery (purchase + running costs) | × 1.00 | **× 0.50** |
| Depreciation write-off | × 1.00 | **× 0.80** |
| Running-cost tax deduction | × 1.00 | **× 0.80** |

Everything else (corporate tax, dividend tax, year-by-year dividend logic, depreciation
curve, sale income) is **identical** to the company scenario — only the two deduction rates
change.

## Refactor approach

- Drop the `businessUsagePercent` ref. Parameterise the company scenario by a
  `(vatPercent, taxPercent)` pair instead of a single uniform percentage.
- Build the company computed twice: `companyScenario` = `(1.0, 1.0)`, `pausalScenario` = `(0.5, 0.8)`.
- `vatReclaim` and `annualWriteOff` derive from the respective percentages.

## Things to remove

- [App.vue](../../src/App.vue) — the 100%/50% toggle buttons (lines 18–19) and the
  `businessUsagePercent` wiring (lines 36, 97, 112).
- [ResultsSummary.vue](../../src/components/ResultsSummary.vue) — `businessUsagePercent` prop
  (line 258) and the `is50Percent` computed (line 284); rework whatever conditional text it drives.
- [useUrlSync.js](../../src/composables/useUrlSync.js) — the `usage` hash key (line 6).
  Decide if a replacement setting is needed (probably not — three columns are always shown).

## Affected areas

- [useCalculator.js](../../src/composables/useCalculator.js) — refactor company scenario to
  take `(vatPercent, taxPercent)`; add `pausalScenario`; update 3-way savings comparison and chart data.
- [App.vue](../../src/App.vue) — remove toggle, render third column, 3-way layout, chart series.
- [ResultsSummary.vue](../../src/components/ResultsSummary.vue) — three-way display.
- [README.md](../../README.md) — document the three scenarios; drop the toggle description.

## Open questions — RESOLVED

See [02-research.md](./02-research.md) for the Slovak-tax-law backing.

1. **Editable rates?** ✅ **Fixed.** 50% (VAT) and 80% (tax) are statutory constants, not inputs.
   - VAT 50%: §49 ods. 5 / §85n zákona o DPH (new from 1.1.2026, EU derogation to 30.6.2028).
   - Tax 80%: §19 ods. 2 písm. t) + l) zákona 595/2003 — applies to **depreciation and running
     costs** without a logbook. Confirms write-off × 0.80 is correct.

2. **Sale handling for paušál** ✅ **Researched.** Output VAT on sale = **full 23%**, same as the
   company scenario — *but* add a **§54 input-VAT refund**: the undeducted half of the purchase
   VAT is reclaimed pro-rata over the remaining 5-year period when sold within 5 years:
   ```
   pausalSaleVatRefund = (vatAmount × 0.50) × max(0, 5 − yearsOwnedAtSale) / 5
   ```
   The 100% column has no such adjustment. Details + official worked example in
   [02-research.md](./02-research.md).

3. **Layout** ✅ **Confirmed** — 3 columns, 3 chart series, 3-way savings comparison.
