# Sukromne vs Firemne Auto

Car cost comparison calculator for Slovak company owners comparing private vs company car ownership. Available at: https://mcsdodo.github.io/sukromne-vs-firemne-auto/

## Overview

This calculator helps Slovak company owners (VAT payers) determine whether it's more financially beneficial to:
1. **Buy a car privately** and receive reimbursements from the company for business use
2. **Buy a car through the company** and deduct all costs as business expenses

## Business Logic

### Key Assumptions

- Company owner is a VAT payer (23% VAT rate)
- Company tax rate: 10%
- Dividend tax rate: 7%
- Car depreciation: configurable (default 4 years, 2 years for electric vehicles)

### Private Car Scenario

When the owner buys a car privately and uses it for business:

1. **Company pays reimbursements** (tax-deductible):
   - Km rate: 0.256 EUR/km
   - Fuel costs: actual consumption + 10% adjustment

2. **Company financials (annual)**:
   ```
   Taxable profit = Annual income - Reimbursements
   Company tax = Taxable profit * 10%
   After-tax profit = Taxable profit - Company tax
   Dividend tax = After-tax profit * 7%
   Dividends = After-tax profit - Dividend tax
   Annual cash to owner = Dividends + Reimbursements
   ```

3. **Personal costs** (paid from dividends):
   - Car purchase (with VAT) - proportional to ownership period
   - Insurance (NO VAT)
   - Maintenance (with VAT)
   - Fuel (with VAT)

4. **Net to owner**:
   ```
   Personal car cost = Car price * min(years, depreciation_years) / depreciation_years
   Net = (Annual cash * years) - Personal car cost - Running costs
   ```

### Company Car Scenario

When the company buys the car:

1. **Company deductions** (VAT recovered except insurance):
   - Depreciation: Car price (ex-VAT) / depreciation_years
   - Insurance: full cost (NO VAT recovery)
   - Maintenance: cost ex-VAT
   - Fuel: cost ex-VAT

2. **Company financials (per year)**:
   ```
   Deductions = Depreciation (if within period) + Insurance + Maintenance + Fuel
   Taxable profit = Annual income - Deductions
   Company tax = Taxable profit * 10%
   After-tax profit = Taxable profit - Company tax
   Dividend tax = After-tax profit * 7%
   Dividends = After-tax profit - Dividend tax
   ```

3. **Net to owner**:
   ```
   Net = Sum of dividends over all years (no personal costs)
   ```

### Key Differences

| Aspect | Private Car | Company Car |
|--------|-------------|-------------|
| Car VAT | Paid, not recovered | Recovered |
| Insurance VAT | N/A (exempt) | N/A (exempt) |
| Running costs VAT | Paid, not recovered | Recovered |
| Tax benefit | Reimbursements deductible | All costs deductible |
| Depreciation | Proportional personal cost | Tax deduction |

### When Private Wins

- High km/year (more reimbursements)
- Low car price
- Short ownership period

### When Company Wins

- Low km/year
- Expensive car
- Long ownership period
- Electric cars (faster 2-year depreciation)

## Tech Stack

- Vue 3 (Composition API with `<script setup>`)
- Vite 5
- Chart.js via vue-chartjs

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
  composables/
    useCalculator.js    # Core calculation logic
  components/
    IncomeInput.vue     # Annual income slider
    KmSlider.vue        # Km/year slider
    DepreciationInput.vue # Depreciation years slider
    YearsInput.vue      # Ownership period slider
    ResultsSummary.vue  # Side-by-side comparison cards
    CostChart.vue       # Cumulative net cash chart
    AdvancedSettings.vue # Configurable parameters
  App.vue               # Main app layout
```
