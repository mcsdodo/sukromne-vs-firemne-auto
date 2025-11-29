# Sukromne vs Firemne Auto

Car cost comparison calculator for Slovak company owners comparing private vs company car ownership.

**Live demo:** https://mcsdodo.github.io/sukromne-vs-firemne-auto/

## Overview

This calculator helps Slovak company owners (VAT payers) determine whether it's more financially beneficial to:

1. **Buy a car privately** and receive reimbursements from the company for business use
2. **Buy a car through the company** and deduct all costs as business expenses

The calculator computes the **net cash to owner** over a configurable ownership period (2-8 years), accounting for taxes, VAT recovery, depreciation, running costs, and eventual car sale.

## Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| Annual company income | 100,000 EUR | Gross revenue before any deductions |
| Car price (with VAT) | 50,000 EUR | Purchase price including 23% VAT |
| Business usage | 100% or 50% | Affects VAT recovery and write-off deductions |
| Km per year | 25,000 km | Annual business mileage |
| Ownership period | 4 years | How long you plan to keep the car |
| Depreciation years | 4 years | Tax write-off period (2 years for EVs) |

### Tax Rates (Slovak Republic)

- **VAT:** 23%
- **Corporate tax:** 10%
- **Dividend tax:** 7%

### Reimbursement Rates

- **Km rate:** 0.256 EUR/km (Slovak standard)
- **Fuel reimbursement:** Actual consumption + 10% adjustment

## Calculation Logic

### Private Car Scenario

When you buy a car personally and use it for business:

**Annual Cash Flow:**
```
1. Company pays you reimbursements:
   - Km reimbursement = km/year × 0.256 EUR
   - Fuel reimbursement = (km/year ÷ 100) × consumption × fuel price × 1.10

2. Company taxes:
   Taxable profit = Income - Reimbursements
   Corporate tax = Taxable profit × 10%
   After-tax profit = Taxable profit - Corporate tax
   Dividend tax = After-tax profit × 7%
   Dividends = After-tax profit - Dividend tax

3. Your annual cash = Dividends + Reimbursements
```

**Multi-Year Calculation:**
```
Total cash over N years = Annual cash × N

Personal costs (paid from your pocket):
- Car purchase: Full price with VAT
- Insurance: Per year × N years (no VAT on insurance)
- Maintenance: Per year × N years (with VAT)
- Fuel: Calculated fuel cost × N years (with VAT)

Sale income = Car sale price (based on depreciation curve)

NET TO OWNER = Total cash - Car purchase - Running costs + Sale income
```

**Key point:** You pay VAT on everything but get tax-free reimbursements.

### Company Car Scenario

When the company buys the car:

**VAT and Depreciation:**
```
Car price (no VAT) = Car price ÷ 1.23
VAT amount = Car price - Car price (no VAT)
VAT reclaim = VAT amount × Business usage %

Annual write-off = Car price (no VAT) ÷ Depreciation years × Business usage %
Total write-off = Annual write-off × min(Ownership years, Depreciation years)
```

**Annual Cash Flow (per year):**
```
Deductible costs:
- Depreciation (if within depreciation period)
- Insurance (no VAT recovery - exempt)
- Maintenance (VAT recovered)
- Fuel (VAT recovered)

Taxable profit = Income - Deductible costs
Corporate tax = Taxable profit × 10%
After-tax profit = Taxable profit - Corporate tax
Dividend tax = After-tax profit × 7%
Dividends = After-tax profit - Dividend tax
```

**Multi-Year Calculation:**
```
Total dividends = Sum of yearly dividends (varies based on depreciation period)

Sale calculations:
- Sale price (based on depreciation curve)
- Sale tax = Sale price × 10%
- Net sale income = Sale price - Sale tax
- After dividend tax = Net sale income × (1 - 7%)

Non-deductible cost = (Car price - VAT reclaim) - Total write-off
(Only relevant when business usage < 100%)

NET TO OWNER = Total dividends + Sale income after taxes - Non-deductible cost
```

**Key point:** Company recovers VAT (except on insurance) and deducts all costs from taxable income.

## Car Depreciation Curve

The calculator uses a realistic market depreciation curve for residual car value:

| Year | Residual Value |
|------|----------------|
| 1 | 80% |
| 2 | 65% |
| 3 | 55% |
| 4 | 48% |
| 5 | 42% |
| 6 | 37% |
| 7 | 33% |
| 8 | 30% |

This curve is **user-adjustable** via an interactive chart.

## Business Usage: 100% vs 50%

Selecting **50% business usage** simulates declaring personal use of a company car:

- VAT recovery reduced to 50%
- Tax write-off deductions reduced to 50%
- Non-deductible portion of car cost applies

This typically makes the company car option less favorable.

## When Each Option Wins

### Private Car Wins When:
- High annual mileage (more reimbursements)
- Lower car price
- Short ownership period
- 50% business usage declared

### Company Car Wins When:
- Lower annual mileage
- Expensive car (VAT recovery matters more)
- Longer ownership period
- Electric vehicle (2-year depreciation)
- 100% business usage

## Features

- **Real-time calculations** - All values update instantly as you adjust inputs
- **Side-by-side comparison** - Clear breakdown of both scenarios
- **Cumulative chart** - Visual comparison of net cash over time
- **Depreciation chart** - Interactive curve for car residual value
- **Advanced settings** - Configure tax rates, fuel prices, consumption
- **Dark theme** - Easy on the eyes
- **Responsive design** - Works on mobile and desktop

## Tech Stack

- **Vue 3** (Composition API with `<script setup>`)
- **Vite 5** (build tool)
- **Chart.js** via vue-chartjs (charts)
- **Pure CSS** (no framework, Tailwind-inspired color palette)

## Project Structure

```
src/
├── composables/
│   └── useCalculator.js      # Core calculation logic (reactive state + computeds)
├── components/
│   ├── IncomeInput.vue       # Annual income slider
│   ├── CarPriceInput.vue     # Car price slider
│   ├── KmSlider.vue          # Km/year slider
│   ├── YearsInput.vue        # Ownership period slider
│   ├── DepreciationChart.vue # Interactive depreciation curve
│   ├── ResultsSummary.vue    # Side-by-side comparison cards
│   ├── CostChart.vue         # Cumulative net cash chart
│   └── AdvancedSettings.vue  # Configurable tax/cost parameters
└── App.vue                   # Main layout + business usage toggle
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is deployed to GitHub Pages. Build output goes to `dist/` folder.

## License

MIT
