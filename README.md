# Sukromne vs Firemne Auto

Car cost comparison calculator for Slovak company owners comparing private vs company car ownership.

**Live demo:** https://mcsdodo.github.io/sukromne-vs-firemne-auto/

## Overview

This calculator helps Slovak company owners (VAT payers) determine which of three options is most financially beneficial:

1. **Súkromné auto (private)** — buy a car privately and receive reimbursements from the company for business use
2. **Firemné auto 100% (company, full)** — buy through the company with full VAT recovery and full cost deduction (requires a logbook proving exclusive business use)
3. **Paušál 50/80** — buy through the company under *paušalizácia výdavkov*: **50% VAT** deductible and **80%** income-tax deductible on all expenses, with no logbook required

The calculator computes the **net cash to owner** over a configurable ownership period (2-8 years) for all three at once, accounting for taxes, VAT recovery, depreciation, running costs, and eventual car sale.

## Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| Annual company income | 100,000 EUR | Gross revenue before any deductions |
| Car price (with VAT) | 50,000 EUR | Purchase price including 23% VAT |
| Km per year | 25,000 km | Annual business mileage |
| Ownership period | 4 years | How long you plan to keep the car |
| Depreciation years | 4 years | Tax write-off period (2 years for EVs) |

### Tax Rates (Slovak Republic)

- **VAT:** 23%
- **Corporate tax:** 10% (income ≤ €100k) / 21% (income > €100k) — auto-selected, both configurable
- **Dividend tax:** 7%

### Reimbursement Rates

- **Km rate:** 0.313 EUR/km (Slovak standard)
- **Fuel reimbursement:** Actual consumption + 10% adjustment

## Calculation Logic

### Private Car Scenario

When you buy a car personally and use it for business:

**Annual Cash Flow:**
```
1. Company pays you reimbursements:
   - Km reimbursement = km/year × 0.313 EUR
   - Fuel reimbursement = (km/year ÷ 100) × consumption × fuel price × 1.10

2. Company taxes:
   Taxable profit = Income - Reimbursements
   Corporate tax = Taxable profit × 10%/21% (based on income tier)
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

### Company Car Scenario (100% and Paušál share one engine)

Both company-based options use the same calculation, parameterised by two deductibility rates — `vatPercent` (share of input VAT recoverable) and `taxPercent` (share of costs deductible from income tax):

| Scenario | vatPercent | taxPercent |
|----------|-----------|-----------|
| Firemné 100% | 100% | 100% |
| Paušál 50/80 | 50% | 80% |

**VAT and Depreciation:**
```
Car price (no VAT) = Car price ÷ 1.23
VAT amount = Car price - Car price (no VAT)
VAT reclaim = VAT amount × vatPercent

Write-off base = (Car price - VAT reclaim) ÷ Depreciation years   (non-recovered VAT is capitalised)
Annual write-off = Write-off base × taxPercent
Total write-off = Annual write-off × min(Ownership years, Depreciation years)
```

Running costs follow the same pattern: VAT is recovered at `vatPercent`, and the cost borne is deductible at `taxPercent`. At 100%/100% this reduces exactly to recovering all VAT and deducting the net amount (the original company-car math).

**Annual Cash Flow (per year):**
```
Deductible costs:
- Depreciation (if within depreciation period)
- Insurance (no VAT recovery - exempt)
- Maintenance (VAT recovered)
- Fuel (VAT recovered)

Taxable profit = Income - Deductible costs
Corporate tax = Taxable profit × 10%/21% (based on income tier)
After-tax profit = Taxable profit - Corporate tax
Dividend tax = After-tax profit × 7%
Dividends = After-tax profit - Dividend tax
```

**Multi-Year Calculation:**
```
Total dividends = Sum of yearly dividends (varies based on depreciation period)

Sale calculations:
- Sale price (based on depreciation curve)
- Sale VAT = Sale price - (Sale price ÷ 1.23)
- Sale price after VAT = Sale price - Sale VAT
- Sale tax = Sale price after VAT × 10%/21%
- Net sale income = Sale price after VAT - Sale tax
- After dividend tax = Net sale income × (1 - 7%)

§54 VAT refund (Paušál only) = VAT amount × (1 - vatPercent) × max(0, 5 - Ownership years) ÷ 5
(On sale within the 5-year adjustment window, the undeducted half of the purchase VAT is
 reclaimed pro-rata; this is 0 for the 100% scenario.)

Non-deductible cost = (Car price - VAT reclaim - Total write-off)
                    + Σ_years(running cost borne × (1 - taxPercent))
(Both terms are 0 at 100%/100%.)

NET TO OWNER = Total dividends + Sale income after taxes + §54 VAT refund - Non-deductible cost
```

**Key point:** The company recovers VAT (except on insurance) and deducts costs from taxable income; the Paušál option does so at the reduced 50%/80% rates but recovers part of the unclaimed purchase VAT on sale.

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

## Paušál Scenario (paušalizácia výdavkov, 50/80)

The Paušál column models a company car used **also for private purposes without a logbook**. Two
distinct statutory flat rates apply:

- **VAT: 50% deductible** on the purchase and all running costs — §49 ods. 5 / §85n zákona o DPH
  (new from 1.1.2026 under an EU derogation, valid until 30.6.2028).
- **Income tax: 80% deductible** on depreciation and running costs — §19 ods. 2 písm. t) + l)
  zákona 595/2003 Z.z.

Choosing the full **Firemné 100%** column instead requires keeping detailed electronic records
proving exclusive business use. On sale within 5 years, the Paušál option additionally reclaims the
undeducted half of the purchase VAT pro-rata (§54 oprava odpočítanej dane).

## When Each Option Wins

### Private Car Wins When:
- High annual mileage (more reimbursements)
- Lower car price
- Short ownership period

### Firemné 100% Wins When:
- Lower annual mileage
- Expensive car (VAT recovery matters more)
- Longer ownership period
- Electric vehicle (2-year depreciation)
- A logbook proving exclusive business use is maintained

### Paušál 50/80 Wins When:
- A logbook is impractical but the car is still mostly business-used
- It sits between private and full-company: less VAT/deduction up front than 100%, but no logbook burden and a partial VAT clawback on sale

## Features

- **Real-time calculations** - All values update instantly as you adjust inputs
- **Three-way comparison** - Side-by-side breakdown of private, company 100%, and paušál 50/80
- **Cumulative chart** - Visual comparison of net cash over time across all three
- **Depreciation chart** - Interactive curve for car residual value
- **Advanced settings** - Configure tax rates, fuel prices, consumption
- **Shareable URLs** - All settings encoded in URL hash (`#income=80000&car=35000&...`), defaults omitted for clean links
- **Share button** - One-click copy of current calculation URL to clipboard
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
│   ├── useCalculator.js      # Core calculation logic; company-scenario factory drives both 100% and paušál
│   └── useUrlSync.js         # Bidirectional URL hash ↔ reactive refs sync
├── components/
│   ├── IncomeInput.vue       # Annual income slider
│   ├── CarPriceInput.vue     # Car price slider
│   ├── KmSlider.vue          # Km/year slider
│   ├── YearsInput.vue        # Ownership period slider
│   ├── DepreciationChart.vue # Interactive depreciation curve
│   ├── ResultsSummary.vue    # Three-way comparison (private card + two company-style cards)
│   ├── CompanyStyleCard.vue  # Reusable card for a company-based scenario (100% or paušál)
│   ├── CostChart.vue         # Cumulative net cash chart (3 series)
│   └── AdvancedSettings.vue  # Configurable tax/cost parameters
└── App.vue                   # Main layout
```

Calculation logic is covered by unit tests (`src/composables/useCalculator.test.js`, run with `npm test`).

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

# Run calculation unit tests
npm test
```

## Deployment

The app is deployed to GitHub Pages. Build output goes to `dist/` folder.

## License

MIT
