# Depreciation & Car Sale Design

## Overview

Enhance the calculator with:
1. Realistic depreciation options (2-year for EV, 4-year for ICE)
2. Car sale income/tax calculations at end of ownership period

## Requirements

### Depreciation Changes
- Move depreciation input from main page to Advanced Settings under "Dane" section
- Change from slider to dropdown with two options:
  - 2 years (EV vehicles)
  - 4 years (ICE vehicles)

### Car Sale Calculations
- When selling the car at end of ownership, calculate:
  - Residual value using linear interpolation
  - Income tax from sale (company car only)
  - Net income to owner after taxes

### Residual Value Formula
Anchors: 2 years = 80%, 4 years = 60%, 6 years = 40%

```javascript
residualPercent = 1.0 - (years * 0.10)
// Clamp to reasonable bounds (min 20%, max 90%)
```

### Tax Calculations
- Tax is calculated on **full sale price** (not profit over book value)
- Depreciation write-offs happen during ownership but don't affect sale tax basis

**Private car:**
```javascript
saleIncome = carPrice × residualPercent
totalCost = multiYearRunningCosts - saleIncome
```

**Company car:**
```javascript
salePrice = carPrice × residualPercent
saleTax = salePrice × companyTax
netSaleIncome = salePrice - saleTax
saleIncomeToOwner = netSaleIncome × (1 - dividendTax)
totalCost = multiYearRunningCosts - saleIncomeToOwner
```

## UI Changes

### 1. Remove DepreciationInput from Main Page
- Remove `<DepreciationInput>` component from App.vue template

### 2. Add Dropdown to AdvancedSettings
Under "Dane" section:
```html
<div class="setting">
  <label>Odpisy (roky)</label>
  <select>
    <option value="2">2 roky (EV)</option>
    <option value="4">4 roky (ICE)</option>
  </select>
</div>
```

### 3. Update ResultsSummary - Add Sale Sections

**Private car card:**
```
─────────────────────────
Predaj auta
  Predajná cena:     €30,000
─────────────────────────
Celkom (po predaji): €XX,XXX
```

**Company car card:**
```
─────────────────────────
Predaj auta
  Predajná cena:     €30,000
  Daň z predaja:     -€3,000
  Čistý príjem:      €27,000
  Po dani z dividend: €25,110
─────────────────────────
Celkom (po predaji): €XX,XXX
```

### 4. Chart Update
- Sale income appears in final year only (when car is actually sold)

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.vue` | Remove DepreciationInput component |
| `src/components/AdvancedSettings.vue` | Add depreciation dropdown under "Dane" |
| `src/composables/useCalculator.js` | Add residual value and sale tax calculations |
| `src/components/ResultsSummary.vue` | Add "Predaj auta" sections to both cards |
| `src/components/CostChart.vue` | Include sale income in final year |

## Example Calculation

**Scenario: €50,000 car, 4-year ownership, 10% company tax, 7% dividend tax**

- Residual value: 60% → Sale price = €30,000
- Sale tax: €30,000 × 10% = €3,000
- Net sale income: €30,000 - €3,000 = €27,000
- After dividend tax: €27,000 × 93% = €25,110 to owner

Private owner recovers: €30,000
Company owner recovers: €25,110
