# Car Cost Calculator Design

## Overview

A static web calculator for company owners to compare the cost-effectiveness of:
- **Private car** - Using personal car, reimbursed by the company
- **Company car** - Purchasing a car through the company

The calculator helps decide which option costs less from the company owner's perspective, accounting for VAT recovery, corporate tax, and dividend tax implications.

## User Flow

1. Land on page with sensible defaults (25,000 km/year, 4 years)
2. Adjust km/year slider, see results update in real-time
3. Optionally expand "Advanced settings" to tweak rates and prices
4. View summary showing which option is cheaper + difference amount
5. View chart comparing cumulative costs over the selected time period

## Calculation Logic

### Tax Context

- Company tax: 10% of profit (configurable)
- Dividend tax: 7% of distributed profit (configurable)
- VAT: 23% (configurable)
- Business expenses reduce taxable profit

### Private Car (Company Perspective)

Costs paid to employee, fully deductible but no VAT recovery:

- **Kilometer reimbursement:** km/year × €0.256
- **Fuel reimbursement:** (km/year × consumption/100) × fuel price
- **Gross cost:** reimbursement + fuel
- **Tax saving:** gross cost × 10%
- **Net cost to company:** gross cost × 90%
- **Dividend-equivalent cost:** net cost / 0.93

### Company Car (Company Perspective)

Costs paid directly, VAT recoverable, costs deductible:

- **Depreciation:** (car price / 1.23) × 20% per year
- **Insurance:** €1,500 / 1.23 = net cost after VAT recovery
- **Maintenance:** €400 / 1.23 = net cost after VAT recovery
- **Fuel:** (km × consumption × 1.1 / 100) × fuel price / 1.23
- **Gross costs:** depreciation + insurance + maintenance + fuel
- **Tax saving:** gross costs × 10%
- **Net cost to company:** gross costs × 90%

### Multi-Year Logic

- Years 1-4: Full depreciation (20%/year)
- Year 5+: No depreciation (car fully written off), only running costs
- Cumulative totals shown for comparison

## UI Layout

### Main Screen (Top to Bottom)

1. **Header:** "Sukromne vs Firemne Auto"

2. **Primary Input - Kilometers Slider:**
   - Large, prominent range slider
   - Default: 25,000 km/year
   - Range: 5,000 - 60,000 km/year
   - Live value display

3. **Years Input:**
   - Smaller slider or number input
   - Default: 4 years
   - Range: 1-10 years

4. **Results Summary:**
   - Two cards side by side: "Private Car" | "Company Car"
   - Each shows total cost over selected period
   - Clear indicator which is cheaper + difference amount

5. **Chart:**
   - Bar or line chart showing cumulative costs per year
   - Two series: private vs company
   - X-axis: years, Y-axis: cumulative cost

6. **Advanced Settings (collapsed):**
   - Expandable section with all configurable parameters

### Advanced Settings Panel

**Reimbursement Rates:**
- Kilometer rate: €0.256/km
- Fuel price: €1.50/liter

**Car Costs:**
- Car price (incl. VAT): €50,000
- Insurance (incl. VAT): €1,500/year
- Maintenance (incl. VAT): €400/year
- Fuel consumption: 5.1 L/100km
- Consumption adjustment: +10%

**Tax Rates:**
- VAT rate: 23%
- Company tax: 10%
- Dividend tax: 7%
- Depreciation rate: 20%/year

## Technical Architecture

### Tech Stack

- Vue 3 + Vite
- Chart.js for visualization
- GitHub Pages hosting
- No backend - all calculations client-side

### Project Structure

```
/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/
│   │   ├── KmSlider.vue
│   │   ├── YearsInput.vue
│   │   ├── ResultsSummary.vue
│   │   ├── CostChart.vue
│   │   └── AdvancedSettings.vue
│   ├── composables/
│   │   └── useCalculator.js
│   └── assets/
│       └── styles.css
```

### Data Flow

- All inputs stored in reactive state (Vue refs)
- `useCalculator` composable takes inputs, returns computed costs
- Components subscribe to computed results, update automatically
- No API calls - everything client-side

### Deployment

- `npm run build` outputs to `/dist`
- GitHub Pages serves from `/dist` or `gh-pages` branch
- Deploy via `gh-pages` package or GitHub Actions

## Default Values Summary

| Parameter | Default Value |
|-----------|---------------|
| Kilometers/year | 25,000 |
| Years | 4 |
| Km rate | €0.256 |
| Fuel price | €1.50/L |
| Car price | €50,000 |
| Insurance | €1,500/year |
| Maintenance | €400/year |
| Fuel consumption | 5.1 L/100km |
| Consumption adjustment | +10% |
| VAT | 23% |
| Company tax | 10% |
| Dividend tax | 7% |
| Depreciation | 20%/year |
