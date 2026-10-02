# Sukromne vs Firemne Auto

Car cost comparison calculator for Slovak company owners comparing private vs company car ownership.

**Live demo:** https://mcsdodo.github.io/sukromne-vs-firemne-auto/

## Overview

This calculator helps Slovak company owners (VAT payers) determine which of four options is most financially beneficial:

1. **Súkromné auto (private)** — buy a car privately and receive reimbursements from the company for business use
2. **Firemné auto 100% (company, full)** — buy through the company with full VAT recovery and full cost deduction (requires a logbook proving exclusive business use)
3. **Paušál 50/80** — buy through the company under *paušalizácia výdavkov*: **50% VAT** deductible and **80%** income-tax deductible on all expenses, with no logbook required
4. **Paušál 50/100 + 1%** — the same 50% VAT, but the owner is personally taxed on private use (**nepeňažný príjem**, 1% rule) in exchange for **100%** income-tax deductibility instead of the 80% cap

The calculator computes the **net cash to owner** over a configurable ownership period (2-8 years) for all four at once, accounting for taxes, VAT recovery, depreciation, running costs, and eventual car sale.

## Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| Annual company income | 100,000 EUR | Gross revenue before any deductions |
| Car price (with VAT) | 50,000 EUR | Purchase price including 23% VAT |
| Km per year | 25,000 km | Annual business mileage |
| Ownership period | 4 years | How long you plan to keep the car |
| Depreciation years | 4 years | Tax write-off period (2 years for EVs) |
| Personal income tax (nepeňažný príjem) | 19% | Owner's personal tax rate on the paušál 50/100+1% benefit |

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

### Company Car Scenario (all three company-based options share one engine)

All three company-based options use the same calculation, parameterised by two deductibility rates — `vatPercent` (share of input VAT recoverable) and `taxPercent` (share of costs deductible from income tax):

| Scenario | vatPercent | taxPercent |
|----------|-----------|-----------|
| Firemné 100% | 100% | 100% |
| Paušál 50/80 | 50% | 80% |
| Paušál 50/100 + 1% | 50% | 100% |

The 50/100+1% scenario additionally subtracts the owner's personal tax on the nepeňažný
príjem (1% rule) from dividends — see [Nepeňažný Príjem (1%) Scenario](#nepeňažný-príjem-1-scenario-paušál-50100--1) below.

**VAT and Depreciation:**
```
Car price (no VAT) = Car price ÷ 1.23
VAT amount = Car price - Car price (no VAT)
VAT reclaim = VAT amount × vatPercent

Write-off base = Car price (no VAT) ÷ Depreciation years   (§ 52zzzk: undeducted VAT is not in the daňová vstupná cena)
Annual write-off = Write-off base × taxPercent
Non-deductible cost = Car price - VAT reclaim - Total write-off   (includes the undeducted VAT)
Total write-off = Annual write-off × min(Ownership years, Depreciation years)
```

Running costs follow the same pattern: VAT is recovered at `vatPercent`, and the price without VAT is deductible at `taxPercent`. The VAT that is not recovered is a cost, but not a tax expense. At 100%/100% this reduces exactly to recovering all VAT and deducting the net amount (the original company-car math).

**§ 52zzzk ZDP (from 1.1.2026):** VAT that the company cannot deduct under § 85n DPH is not a tax
expense, and for a car it is not part of the daňová vstupná cena. Source: financnasprava
[45/DZPaU/2025/MU](https://www.financnasprava.sk/_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Dane/Metodicke_usmernenia/Priame_dane/2025/2025.12.19_45_DZPaU_2025_MU.pdf),
príklad č. 1 (car) and č. 3 (fuel). This applies to the two paušál columns. It does not change
Firemné 100%, which recovers all VAT.

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

## Nepeňažný Príjem (1%) Scenario (Paušál 50/100 + 1%)

Slovak income-tax law taxes private use of a company car separately from the VAT/deduction
mechanics above: **§5 ods. 3 písm. a) zákona č. 595/2003 Z.z.** treats it as a non-cash
benefit (**nepeňažný príjem**) to whoever drives it privately — **1% of the car's full
VAT-inclusive price per started calendar month**, with the base shrinking **12.5% every 1
January for 8 years**, then dropping to zero.

The key finding (confirmed by financnasprava's own FAQ on §19 ods. 2 písm. t)): **taxing this
benefit and the 80% flat-rate deduction cap are mutually exclusive, not additive.** If the
owner is personally taxed on the benefit, the company may deduct **100%** of depreciation,
insurance and maintenance instead of the 80% cap used by the Paušál 50/80 column. **Fuel is the
exception:** it stays at the 80% PHL paušál (§19 ods. 2 písm. l)) also under the 1% regime, per
financnasprava FAQ 523850, otázka č. 5. The app assumes private use <= 20% for both columns. This app models that
choice as a 4th scenario rather than folding it into the existing Paušál column.

**Scope: zero-salary owner only** (dividends only — the persona this app has always modeled).
In that case the cost is personal income tax only, self-assessed via the owner's annual tax
return at `personalIncomeTaxRate` (default 19%, the lowest 2026 Slovak PIT bracket) — **no
odvody**, because a konateľ with no right to regular income isn't a "zamestnanec" for sociálne
poistenie purposes. If the owner *also* draws a regular salary elsewhere, both employee-side
(~14.4%) and employer-side (~36.2%, flowing through as reduced dividends) odvody would apply
instead — not modeled here, since the app has no salary/payroll concept for its owner persona.

**Verified result, at this app's own defaults (50k car, 4 years):** this alternative nets
**~2,121 EUR less** than the Paušál 50/80 column, not more. The extra 20% deductibility it
unlocks (fuel excluded, without VAT) is worth only ~1,584 EUR (roughly corpTax + dividendTax ≈ 16.3% of the marginal
deduction — this app's dividend accounting model doesn't pass the full deduction through to
cash), while the personal tax on the benefit costs ~3,705 EUR at 19%. The trade only breaks
even below a ~8.1% personal tax rate, which is below Slovakia's lowest PIT bracket — so it's
a net loss in every realistic case, not just at these specific numbers. See
[_tasks/_done/24-nepenazny-prijem-pausal/02-research.md](_tasks/_done/24-nepenazny-prijem-pausal/02-research.md)
for full sourcing and the worked example.

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

### Paušál 50/100 + 1% Rarely Wins:
- The extra 20% deductibility it unlocks (over the 80% cap) is only worth its corporate-tax +
  dividend-tax shield (~16.3% of the marginal amount), while the personal tax on the 1%
  benefit hits a much larger base (12%/year of the full car price)
- Breaks even only below a ~8.1% personal income tax rate — below Slovakia's lowest PIT
  bracket (19%), so it loses to the 80% column in every realistic case for this app's
  zero-salary-owner model
- Shown anyway, for completeness and because the losing margin itself is useful information

## Features

- **Real-time calculations** - All values update instantly as you adjust inputs
- **Four-way comparison** - Side-by-side breakdown of private, company 100%, paušál 50/80, and paušál 50/100+1%, sorted by net result (most economical on the left); each other card's ČISTÝ VÝNOS shows its gap to the best one (the baseline), over the chosen period and per year
- **Cumulative chart** - Visual comparison of net cash over time across all four
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
│   ├── useCalculator.js      # Core calculation logic; company-scenario factory drives 100%, paušál, and paušál+1%
│   └── useUrlSync.js         # Bidirectional URL hash ↔ reactive refs sync
├── components/
│   ├── IncomeInput.vue       # Annual income slider
│   ├── CarPriceInput.vue     # Car price slider
│   ├── KmSlider.vue          # Km/year slider
│   ├── YearsInput.vue        # Ownership period slider
│   ├── DepreciationChart.vue # Interactive depreciation curve
│   ├── ResultsSummary.vue    # Four-way comparison (private card + three company-style cards)
│   ├── CompanyStyleCard.vue  # Reusable card for a company-based scenario (100%, paušál, or paušál+1%)
│   ├── CostChart.vue         # Cumulative net cash chart (4 series)
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
