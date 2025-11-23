# Depreciation Logic Fix - Design Document

## Overview

Fix the depreciation/write-off logic to properly handle:
1. Dynamic depreciation periods (not hardcoded to 4 years)
2. Proportional private car cost based on ownership period
3. UI change from percentage to years

## Calculation Logic

### Two Independent Inputs
- `depreciationYears` (default 4) - how long until car is fully written off
- `years` (default 4) - how long you plan to own the car

### Private Car Scenario
```
personalCarCost = carPrice × min(years, depreciationYears) / depreciationYears
```
Examples:
- 1 year ownership, 4yr depreciation: €50,000 × (1/4) = €12,500
- 4 year ownership, 4yr depreciation: €50,000 × (4/4) = €50,000
- 6 year ownership, 4yr depreciation: €50,000 × (4/4) = €50,000 (capped)

### Company Car Scenario
```
depreciation applies for y <= depreciationYears
```
- Years within depreciation period: full deductions (with depreciation)
- Years after depreciation period: reduced deductions (no depreciation benefit)

## UI Changes

### Main Inputs (new order)
1. Income slider (unchanged)
2. Km/year slider (unchanged)
3. **Depreciation years** - new slider, range 1-8 years, default 4, label "Odpisy (roky)"
4. Years slider (unchanged) - label "Obdobie vlastnictva (roky)"

### Advanced Settings
- Remove `depreciationRate` (percentage) - replaced by main input

### ResultsSummary
- Show proportional note on "Kupa auta" when `years < depreciationYears`

## Files to Modify

1. `src/composables/useCalculator.js` - Replace depreciationRate with depreciationYears, update calculations
2. `src/components/DepreciationInput.vue` - New slider component
3. `src/App.vue` - Add DepreciationInput, remove depreciationRate binding
4. `src/components/AdvancedSettings.vue` - Remove depreciationRate
5. `src/components/ResultsSummary.vue` - Add proportional cost display
