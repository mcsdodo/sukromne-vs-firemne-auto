# Design: 50% Business Usage Toggle

## Overview

Add a toggle to declare 50% personal usage vs 100% business usage, affecting VAT reclaim and depreciation write-offs for company car scenario.

## User Decisions

1. **UI Placement**: Main inputs area (near car price/years)
2. **Default**: 100% business usage (toggle OFF)
3. **Label**: "Podnikateľske vyuzitie: 100% / 50%"
4. **VAT Display**: One-time amount at purchase
5. **Net Car Cost Formula**: Car price - VAT reclaimed - (Write-off x tax rate)

## Data Model

### New State (useCalculator.js)

```javascript
const businessUsagePercent = ref(1.0)  // 1.0 = 100%, 0.5 = 50%
```

### Affected Calculations

- `vatReclaim` = VAT amount x businessUsagePercent
- `annualWriteOff` = (carPriceNoVat / depreciationYears) x businessUsagePercent
- `netCarCost` = carPrice - vatReclaim - (totalWriteOff x companyTax)

### New Computed Values to Expose

- `vatAmount` - full VAT (for showing base in breakdown)
- `vatReclaim` - actual reclaimed amount
- `annualWriteOffBase` - full annual write-off (before %)
- `annualWriteOff` - adjusted for business usage %
- `totalWriteOff` - over ownership period
- `netCarCost` - final cost after all benefits

## UI Components

### Toggle Component

Location: Main inputs area in App.vue, after car price input

```vue
<div class="usage-toggle">
  <span class="toggle-label">Podnikatelske vyuzitie:</span>
  <button :class="{ active: businessUsagePercent === 1.0 }" @click="businessUsagePercent = 1.0">100%</button>
  <button :class="{ active: businessUsagePercent === 0.5 }" @click="businessUsagePercent = 0.5">50%</button>
</div>
```

### Per-Year Breakdown (Company Car Section)

Display in company car annual breakdown:

```
Rocny odpis: 10 162 EUR x 50% = 5 081 EUR
```

When 100%:
```
Rocny odpis: 10 162 EUR
```

### Total Breakdown (Above "Za X roky")

New section showing:

```
Vratene DPH: 9 350 EUR x 50% = 4 675 EUR
Celkovy odpis: 40 650 EUR x 50% = 20 325 EUR
Cista cena auta: 43 293 EUR
```

When 100%, hide the "x 50%" part:
```
Vratene DPH: 9 350 EUR
Celkovy odpis: 40 650 EUR
Cista cena auta: 38 618 EUR
```

## Calculation Examples

### 50K Car, 4 Years, 100% Business Use

- Car price with VAT: 50 000 EUR
- Car price without VAT: 40 650 EUR
- VAT amount: 9 350 EUR
- VAT reclaimed: 9 350 EUR (100%)
- Annual write-off: 10 162 EUR
- Total write-off: 40 650 EUR
- Tax savings from write-off: 40 650 x 10% = 4 065 EUR
- Net car cost: 50 000 - 9 350 - 4 065 = 36 585 EUR

### 50K Car, 4 Years, 50% Business Use

- Car price with VAT: 50 000 EUR
- Car price without VAT: 40 650 EUR
- VAT amount: 9 350 EUR
- VAT reclaimed: 4 675 EUR (50%)
- Annual write-off: 5 081 EUR (50% of 10 162)
- Total write-off: 20 325 EUR
- Tax savings from write-off: 20 325 x 10% = 2 032 EUR
- Net car cost: 50 000 - 4 675 - 2 032 = 43 293 EUR
