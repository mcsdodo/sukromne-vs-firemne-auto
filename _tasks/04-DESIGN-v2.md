# Car Cost Calculator v2 - Income-Based Model

## Overview

Update the calculator to use an income-based model that shows the true "net cash to owner" for each scenario, with full breakdown of calculation steps.

## Key Changes from v1

1. **New calculation model** - Based on annual company income (€100K default)
2. **Full breakdown display** - Show every calculation step
3. **Insurance VAT fix** - Insurance has no VAT (was incorrectly applying VAT recovery)
4. **Personal car costs** - Private option must subtract car purchase + running costs paid from dividends

## Calculation Model

### Inputs

**Primary:**
- Annual company income: €100,000 (configurable)
- Km per year: 25,000 (slider)
- Years: 4 (slider)

**Car costs (all existing, with VAT where applicable):**
- Car price: €50,000 (with VAT)
- Insurance: €1,500/year (NO VAT)
- Maintenance: €400/year (with VAT)
- Fuel consumption: 5.1 L/100km (+10% adjustment)
- Fuel price: €1.50/L (with VAT)

**Rates:**
- Km reimbursement: €0.256/km
- VAT: 23%
- Company tax: 10%
- Dividend tax: 7%
- Depreciation: 25%/year

### Private Car Calculation (Annual)

```
1. Reimbursements = (km × €0.256) + (km × consumption × 1.1 / 100 × fuel_price)
2. Taxable profit = income - reimbursements
3. Company tax = taxable_profit × 10%
4. After-tax profit = taxable_profit - company_tax
5. Dividend tax = after_tax_profit × 7%
6. Dividends = after_tax_profit - dividend_tax
7. Annual cash = dividends + reimbursements
```

**Over N years:**
```
Total cash = annual_cash × years
Personal car cost = car_price (with VAT)
Personal running costs = (insurance + maintenance + fuel) × years
  - Insurance: no VAT
  - Maintenance: with VAT
  - Fuel: (km × consumption × 1.1 / 100 × fuel_price) with VAT

NET TO OWNER = total_cash - personal_car_cost - personal_running_costs
```

### Company Car Calculation (Annual)

```
1. Depreciation = (car_price / 1.23) × 25% [for years 1-4, then 0]
2. Insurance = €1,500 (no VAT recovery - insurance exempt)
3. Maintenance = €400 / 1.23 (VAT recovered)
4. Fuel = (km × consumption × 1.1 / 100 × fuel_price) / 1.23 (VAT recovered)
5. Total deductions = depreciation + insurance + maintenance + fuel
6. Taxable profit = income - total_deductions
7. Company tax = taxable_profit × 10%
8. After-tax profit = taxable_profit - company_tax
9. Dividend tax = after_tax_profit × 7%
10. Dividends = after_tax_profit - dividend_tax
```

**Over N years:**
```
NET TO OWNER = sum of annual dividends (no personal costs)
```

## UI Layout

### Main Screen

1. **Header** - "Sukromne vs Firemne Auto" + subtitle (unchanged)

2. **Inputs Section:**
   - Annual income input (new) - €100,000 default
   - Km/year slider - 25,000 default
   - Years slider - 4 default

3. **Results Section** - Two side-by-side breakdown cards:

```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│       SÚKROMNÉ AUTO             │  │       FIREMNÉ AUTO              │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ Príjem firmy         €100,000   │  │ Príjem firmy         €100,000   │
│ - Náhrady             - €X,XXX  │  │ - Náklady auta       - €XX,XXX  │
│ = Zdaniteľný zisk     €XX,XXX   │  │ = Zdaniteľný zisk    €XX,XXX   │
│ - Daň z príjmu (10%)  - €X,XXX  │  │ - Daň z príjmu (10%) - €X,XXX   │
│ = Zisk po dani        €XX,XXX   │  │ = Zisk po dani       €XX,XXX   │
│ - Daň z dividend (7%) - €X,XXX  │  │ - Daň z dividend (7%)- €X,XXX   │
│ = Dividendy           €XX,XXX   │  │ = Dividendy          €XX,XXX   │
│ + Náhrady            + €X,XXX   │  │                                 │
│ = Ročne v hotovosti   €XX,XXX   │  │ = Ročne v hotovosti  €XX,XXX   │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ Za X rokov           €XXX,XXX   │  │ Za X rokov          €XXX,XXX   │
│ - Kúpa auta          - €50,000  │  │ - Osobné náklady          €0   │
│ - Prevádzkové nákl.  - €XX,XXX  │  │                                 │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ ČISTÝ VÝNOS          €XXX,XXX   │  │ ČISTÝ VÝNOS         €XXX,XXX   │
└─────────────────────────────────┘  └─────────────────────────────────┘

         ▼ [Winner] ušetrí €XX,XXX za X rokov ▼
```

4. **Chart** - Cumulative net cash comparison over years (unchanged concept)

5. **Advanced Settings** - Add annual income to existing parameters

## Files to Modify

1. **`src/composables/useCalculator.js`**
   - Add `annualIncome` ref (default 100000)
   - Rewrite `privateAnnualCost` → `privateScenario` with full breakdown
   - Rewrite `companyAnnualCost` → `companyScenario` with full breakdown
   - Fix insurance VAT (no recovery)
   - Export all intermediate values for UI

2. **`src/components/ResultsSummary.vue`**
   - Replace simple cards with detailed breakdown tables
   - Accept new props for all breakdown values
   - Keep winner highlight logic

3. **`src/components/AdvancedSettings.vue`**
   - Add annual income input

4. **`src/App.vue`**
   - Add income input (or integrate into sliders section)
   - Pass new props to ResultsSummary

## Implementation Notes

- Insurance is VAT-exempt: don't apply `/1.23` to insurance
- Depreciation only applies for years 1-4 (at 25%/year = 100% total)
- Private car fuel is reimbursed AND paid personally - the reimbursement offsets personal cost
- Chart should show cumulative "net to owner" not just costs
