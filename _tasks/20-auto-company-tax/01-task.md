# Automatic Company Tax Rate Based on Income

**Status:** 📋 Planning

## Problem

The company tax rate (`companyTax`) is currently a static 10% default in advanced settings. In reality, Slovak corporate tax is tiered:

- **10%** for taxable income up to **€100,000** (inclusive)
- **21%** for taxable income above **€100,000**

Users must manually adjust this, which most won't do — leading to incorrect results for higher incomes.

## Requirements

- Compute `companyTax` automatically based on `annualIncome`
  - `annualIncome <= 100_000` → `companyTax = 0.10`
  - `annualIncome > 100_000` → `companyTax = 0.21`
- Remove `companyTax` as an editable input from advanced settings
- Show a read-only note in the advanced settings section explaining the current rate and why (e.g. "Daň z príjmu PO: 10% (príjem do 100 000 €)" or "21% (príjem nad 100 000 €)")
- The tax rate should update reactively when income changes

## Notes

- The threshold is on the company's taxable income, not gross revenue. In the calculator, `annualIncome` represents the company's annual revenue which is used as the base. The taxable profit after deductions could differ, but for simplicity we use `annualIncome` as the tier selector (this matches how users think about it).
- This is a simplification — in reality the 10% rate applies to the first €100K of profit and 21% to the excess. For the calculator's purposes, using the flat rate based on total income is a reasonable approximation.
