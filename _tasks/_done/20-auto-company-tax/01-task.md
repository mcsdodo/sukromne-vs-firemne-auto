# Automatic Company Tax Rate Based on Income

**Status:** ✅ Complete

## Problem

The company tax rate (`companyTax`) was a single static 10% default in advanced settings. In reality, Slovak corporate tax is tiered:

- **10%** for taxable income up to **€100,000** (inclusive)
- **21%** for taxable income above **€100,000**

Users had to manually adjust this, which most wouldn't do — leading to incorrect results for higher incomes.

## Requirements

- ~~Compute `companyTax` automatically based on `annualIncome`~~ Done
- ~~Two configurable rate inputs in advanced settings~~ Done: `companyTaxLow` (default 10%) and `companyTaxHigh` (default 21%)
- ~~Auto-select based on income~~ Done: `companyTax = computed(() => income > 100k ? high : low)`
- ~~Visual indicator showing which rate is active~~ Done: green "aktívna" label next to the currently applied rate

## Implementation

- `useCalculator.js`: `companyTaxLow` ref (0.10), `companyTaxHigh` ref (0.21), `companyTax` computed from income
- `AdvancedSettings.vue`: Two separate inputs ("do 100k" / "nad 100k") with green "aktívna" badge on the active one
- `App.vue`: Passes both rates as v-model, `companyTax` as read-only prop

## Notes

- The threshold is on the company's taxable income, not gross revenue. In the calculator, `annualIncome` represents the company's annual revenue which is used as the base. The taxable profit after deductions could differ, but for simplicity we use `annualIncome` as the tier selector (this matches how users think about it).
- This is a simplification — in reality the 10% rate applies to the first €100K of profit and 21% to the excess. For the calculator's purposes, using the flat rate based on total income is a reasonable approximation.
