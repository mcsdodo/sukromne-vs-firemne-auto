# Third Scenario: Paušalizácia výdavkov — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 100%/50% business-usage toggle with three always-visible columns — Firemné 100%, Paušál (50% VAT / 80% tax), and Súkromné — driven by a parameterised company-scenario factory.

**Architecture:** Refactor [useCalculator.js](../../src/composables/useCalculator.js) so the company computation is a factory `makeCompanyScenario(vatPercent, taxPercent)`. Instantiate it twice — `(1.0, 1.0)` → `companyScenario`, `(0.5, 0.8)` → `pausalScenario`. The factory bundles its own VAT/write-off/display fields so components read everything off the scenario object (no more top-level `businessUsagePercent`, `vatReclaim`, `annualWriteOff`, `netCarCost` props). The private scenario is unchanged. A 3-way `bestOption`/`savings` replaces the 2-way comparison.

**Tech Stack:** Vue 3 composition API, Vite, vue-chartjs/Chart.js. Tests via Vitest (introduced in Task 1 — the calculation core is pure enough to unit-test, and the §54 math is error-prone enough to warrant it).

**Background:** See [01-task.md](./01-task.md) (scope) and [02-research.md](./02-research.md) (Slovak tax-law basis for the 50/80 rates and the §54 sale refund).

---

## Modeling decisions (read before coding)

These resolve the accounting subtleties so all tasks stay consistent. At `(1.0, 1.0)` every formula below reduces to today's company-scenario math exactly — so the **Firemné 100% column must produce numerically identical results to the current company card**. That equivalence is the regression guardrail.

1. **Depreciation base capitalises non-recovered VAT.** `writeOffBase = (carPrice − vatReclaim) / depreciationYears`, where `vatReclaim = vatAmount × vatPercent`. Then `annualWriteOff = writeOffBase × taxPercent`.
   - `(1.0,1.0)`: `(carPrice − vatAmount)/dep × 1 = carPriceNoVat/dep` ✓ (matches today's `annualWriteOffBase`).
   - `(0.5,0.8)`: `(carPrice − 0.5·vat)/dep × 0.8`.

2. **Running-cost VAT recovered at `vatPercent`; deduction at `taxPercent`.** For a gross amount: `recovered = hasVat ? (gross − withoutVat(gross)) × vatPercent : 0`; `costBorne = gross − recovered`; `deductible = costBorne × taxPercent`.
   - `(1.0,1.0)`, maintenance: `recovered = vatPortion`, `costBorne = net`, `deductible = net` ✓ (matches today's `withoutVat(maintenance)`).
   - Insurance has no VAT → `costBorne = insurance`, `deductible = insurance × taxPercent`.

3. **Non-deductible cost generalised.** `nonDeductibleCost = (carPrice − vatReclaim − totalWriteOff) + Σ_years(runningCostBorne × (1 − taxPercent))`. At `(1.0,1.0)` both terms are 0 (when years ≥ depYears) ✓ — identical to today.

4. **§54 sale VAT refund (paušál only, falls out of the formula for 100%).** On sale, output VAT is still the **full 23%** (unchanged). Additionally refund the undeducted purchase VAT pro-rata over the remaining 5-year period:
   `saleVatRefund = vatAmount × (1 − vatPercent) × max(0, 5 − years) / 5`.
   - `(1.0,1.0)`: `(1−1)=0` → 0 ✓. `(0.5,0.8)`, years=4: `vat × 0.5 × 1/5`.
   - Added to `netToOwner` and to the final-year chart cumulative as a cash inflow (a VAT refund is not taxable income).

5. **5-year period is a constant** (`VAT_ADJUSTMENT_YEARS = 5`), not a user input — matches the statutory adjustment window.

---

## Task 1: Add Vitest and write the failing calculation tests

**Files:**
- Modify: `package.json` (devDependencies + `test` script)
- Create: `src/composables/useCalculator.test.js`

**Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: `vitest` appears in `package.json` devDependencies, exits 0.

**Step 2: Add the test script**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

**Step 3: Write the failing tests**

`useCalculator` only uses `ref`/`computed` (no lifecycle hooks), so it can be called directly in a test. Create `src/composables/useCalculator.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { useCalculator } from './useCalculator'

// Helper: build a calculator with deterministic inputs
function setup() {
  const c = useCalculator()
  c.annualIncome.value = 100000
  c.carPrice.value = 50000
  c.kmPerYear.value = 25000
  c.years.value = 4
  return c
}

describe('pausalScenario', () => {
  it('is exposed and is an object with netToOwner', () => {
    const c = setup()
    expect(typeof c.pausalScenario.value.netToOwner).toBe('number')
  })

  it('recovers 50% of purchase VAT (vs 100% for company)', () => {
    const c = setup()
    // vatAmount = 50000 - 50000/1.23
    const vatAmount = 50000 - 50000 / 1.23
    expect(c.companyScenario.value.vatReclaim).toBeCloseTo(vatAmount, 2)
    expect(c.pausalScenario.value.vatReclaim).toBeCloseTo(vatAmount * 0.5, 2)
  })

  it('applies 80% of the write-off base (on the VAT-adjusted purchase price)', () => {
    const c = setup()
    const vatAmount = 50000 - 50000 / 1.23
    const pausalBase = (50000 - vatAmount * 0.5) / 4
    expect(c.pausalScenario.value.annualWriteOff).toBeCloseTo(pausalBase * 0.8, 2)
  })

  it('adds a §54 sale VAT refund of vat × 0.5 × (5−years)/5 when sold within 5 years', () => {
    const c = setup() // years = 4
    const vatAmount = 50000 - 50000 / 1.23
    expect(c.pausalScenario.value.saleVatRefund).toBeCloseTo(vatAmount * 0.5 * (1 / 5), 2)
  })

  it('gives zero sale VAT refund when held 5+ years', () => {
    const c = setup()
    c.years.value = 5
    expect(c.pausalScenario.value.saleVatRefund).toBeCloseTo(0, 6)
  })
})

describe('company 100% regression — unchanged by the refactor', () => {
  it('company netToOwner is unchanged and has zero §54 refund', () => {
    const c = setup()
    expect(c.companyScenario.value.saleVatRefund).toBeCloseTo(0, 6)
    // Snapshot the headline number so the refactor cannot silently move it.
    // (Fill in the exact value observed BEFORE refactoring — see Step 4.)
    expect(Math.round(c.companyScenario.value.netToOwner)).toBe(EXPECTED_COMPANY_NET)
  })
})

describe('3-way comparison', () => {
  it('bestOption is one of the three scenarios', () => {
    const c = setup()
    expect(['private', 'company', 'pausal']).toContain(c.bestOption.value)
  })
})
```

**Step 4: Capture the pre-refactor baseline**

Before changing `useCalculator.js`, run the current code to read today's company `netToOwner` at the inputs above and replace `EXPECTED_COMPANY_NET` with that integer. Quick way: temporarily `console.log(Math.round(c.companyScenario.value.netToOwner))` in the test (the existing `companyScenario` already exists), run, copy the number, restore. This locks the 100% regression.

**Step 5: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `pausalScenario`, `bestOption`, `vatReclaim`/`saleVatRefund` on scenarios are undefined.

**Step 6: Commit**

```bash
git add package.json package-lock.json src/composables/useCalculator.test.js
git commit -m "test: add failing tests for pausal scenario and 100% regression"
```

---

## Task 2: Refactor useCalculator.js — scenario factory + pausal + remove toggle

**Files:**
- Modify: [src/composables/useCalculator.js](../../src/composables/useCalculator.js)

**Step 1: Remove the toggle ref and the top-level per-scenario derived values**

Delete:
- Line 29: `const businessUsagePercent = ref(1.0)`
- Lines 56, 58: the `vatReclaim` and `annualWriteOff` computed (they move into the factory)
- Lines 59–66: `totalWriteOff` and `netCarCost` computed (move into factory)

Keep `carPriceNoVat`, `vatAmount`, `annualWriteOffBase` only if still referenced elsewhere; `vatAmount` is still needed (factory + display), `carPriceNoVat` feeds `vatAmount`. Remove `annualWriteOffBase` (superseded by the factory's own base).

Add near the rate refs:
```js
const VAT_ADJUSTMENT_YEARS = 5  // statutory §54 VAT-adjustment window
```

**Step 2: Add the factory (replaces the old `companyScenario`, lines 136–237)**

```js
// ============ COMPANY-STYLE SCENARIO FACTORY ============
// vatPercent: share of input VAT recoverable (1.0 = full / logbook, 0.5 = paušál)
// taxPercent: share of costs deductible from income tax (1.0 = full, 0.8 = paušál)
function makeCompanyScenario(vatPercent, taxPercent) {
  return computed(() => {
    // --- Purchase: VAT recovery + write-off (non-recovered VAT is capitalised) ---
    const vatReclaim = vatAmount.value * vatPercent
    const writeOffBase = (carPrice.value - vatReclaim) / depreciationYears.value
    const annualWriteOff = writeOffBase * taxPercent
    const depreciationYearsUsed = Math.min(years.value, depreciationYears.value)
    const totalWriteOff = annualWriteOff * depreciationYearsUsed

    // --- Running costs: recover VAT at vatPercent, deduct at taxPercent ---
    const costBorne = (gross, hasVat) => {
      const recovered = hasVat ? (gross - withoutVat(gross)) * vatPercent : 0
      return gross - recovered
    }
    const insuranceBorne = costBorne(insurance.value, false)   // no VAT on insurance
    const maintenanceBorne = costBorne(maintenance.value, true)
    const fuelBorne = costBorne(fuelCost.value, true)

    const insuranceDeduct = insuranceBorne * taxPercent
    const maintenanceDeduct = maintenanceBorne * taxPercent
    const fuelDeduct = fuelBorne * taxPercent

    const annualDeductionsWithDep = annualWriteOff + insuranceDeduct + maintenanceDeduct + fuelDeduct
    const annualDeductionsNoDep = insuranceDeduct + maintenanceDeduct + fuelDeduct

    // --- Year-by-year dividends ---
    let totalDividends = 0
    const yearlyBreakdown = []
    for (let y = 1; y <= years.value; y++) {
      const deductions = y <= depreciationYears.value ? annualDeductionsWithDep : annualDeductionsNoDep
      const taxableProfit = annualIncome.value - deductions
      const companyTaxAmount = taxableProfit * companyTax.value
      const afterTaxProfit = taxableProfit - companyTaxAmount
      const dividendTaxAmount = afterTaxProfit * dividendTax.value
      const dividends = afterTaxProfit - dividendTaxAmount
      totalDividends += dividends
      yearlyBreakdown.push({ year: y, deductions, taxableProfit, companyTaxAmount, afterTaxProfit, dividendTaxAmount, dividends })
    }
    const year1 = yearlyBreakdown[0]

    // --- Period totals (for breakdown display) ---
    const totalDepreciation = annualWriteOff * depreciationYearsUsed
    const totalInsurance = insuranceDeduct * years.value
    const totalMaintenance = maintenanceDeduct * years.value
    const totalFuel = fuelDeduct * years.value

    // --- Sale: full 23% output VAT, corporate + dividend tax (unchanged) ---
    const companySalePrice = salePrice.value
    const saleVat = companySalePrice - withoutVat(companySalePrice)
    const salePriceAfterVat = companySalePrice - saleVat
    const saleTax = salePriceAfterVat * companyTax.value
    const netSaleIncome = salePriceAfterVat - saleTax
    const saleIncomeAfterDividendTax = netSaleIncome * (1 - dividendTax.value)

    // --- §54 input-VAT refund on the undeducted purchase VAT (0 for 100%) ---
    const saleVatRefund = years.value < VAT_ADJUSTMENT_YEARS
      ? vatAmount.value * (1 - vatPercent) * (VAT_ADJUSTMENT_YEARS - years.value) / VAT_ADJUSTMENT_YEARS
      : 0

    // --- Non-deductible cost: undeducted purchase + non-deductible running portion ---
    const netCarPurchase = carPrice.value - vatReclaim
    const nonDeductibleRunning = (insuranceBorne + maintenanceBorne + fuelBorne) * (1 - taxPercent) * years.value
    const nonDeductibleCost = (netCarPurchase - totalWriteOff) + nonDeductibleRunning

    // Display: net cost of the car after VAT recovery & tax savings on write-off
    const netCarCost = netCarPurchase - totalWriteOff * companyTax.value

    const netToOwner = totalDividends + saleIncomeAfterDividendTax + saleVatRefund - nonDeductibleCost

    return {
      // Annual (year 1 representative)
      carCosts: annualDeductionsWithDep,
      taxableProfit: year1.taxableProfit,
      companyTaxAmount: year1.companyTaxAmount,
      afterTaxProfit: year1.afterTaxProfit,
      dividendTaxAmount: year1.dividendTaxAmount,
      dividends: year1.dividends,
      annualCash: year1.dividends,
      // Multi-year
      totalCashOverYears: totalDividends,
      personalCosts: 0,
      netToOwner,
      // Display fields (previously top-level props)
      vatReclaim,
      annualWriteOff,
      totalWriteOff,
      netCarCost,
      vatPercent,
      taxPercent,
      // Sale data
      salePrice: companySalePrice,
      saleVat,
      salePriceAfterVat,
      saleTax,
      netSaleIncome,
      saleIncomeAfterDividendTax,
      saleVatRefund,
      // Detailed
      yearlyBreakdown,
      costBreakdown: { depreciation: totalDepreciation, insurance: totalInsurance, maintenance: totalMaintenance, fuel: totalFuel },
      annualCostBreakdown: { depreciation: annualWriteOff, insurance: insuranceDeduct, maintenance: maintenanceDeduct, fuel: fuelDeduct }
    }
  })
}

const companyScenario = makeCompanyScenario(1.0, 1.0)
const pausalScenario = makeCompanyScenario(0.5, 0.8)
```

**Step 3: Update the comparison + chart**

Replace `savings`/`cheaperOption` (lines 239–241) with a 3-way comparison:
```js
const scenarioNets = computed(() => ({
  private: privateScenario.value.netToOwner,
  company: companyScenario.value.netToOwner,
  pausal: pausalScenario.value.netToOwner
}))
const bestOption = computed(() => {
  const n = scenarioNets.value
  return Object.keys(n).reduce((best, k) => n[k] > n[best] ? k : best, 'private')
})
// Gap between the winner and the runner-up
const savings = computed(() => {
  const sorted = Object.values(scenarioNets.value).sort((a, b) => b - a)
  return sorted[0] - sorted[1]
})
```

In `yearlyData` (lines 244–281): add a `pausalCumulative` accumulator mirroring `companyCumulative` but reading `pausalScenario`. Add its year-1 non-deductible-cost subtraction and final-year `saleIncomeAfterDividendTax + saleVatRefund`. Also add `saleVatRefund` to the company final year. Push `pausalNet: Math.round(pausalCumulative)` into each data point.

> Note: the year-1 non-deductible subtraction in `yearlyData` currently recomputes `nonDeductibleCost` inline. Refactor it to read `scenario.value` fields where possible, or replicate the factory's `nonDeductibleCost`. Keep the chart's final `*Net` consistent with each scenario's `netToOwner`.

**Step 4: Update the return object**

Remove `businessUsagePercent`, `vatReclaim`, `annualWriteOffBase`, `annualWriteOff`, `totalWriteOff`, `netCarCost`, `cheaperOption` from the returned object. Add `pausalScenario`, `bestOption`, `scenarioNets`. Keep `vatAmount` (used for display).

**Step 5: Run tests**

Run: `npm test`
Expected: PASS — all Task 1 tests green, including the `EXPECTED_COMPANY_NET` regression.

**Step 6: Commit**

```bash
git add src/composables/useCalculator.js
git commit -m "feat: parameterise company scenario, add pausal (50/80) scenario"
```

---

## Task 3: Update URL sync — drop the `usage` key

**Files:**
- Modify: [src/composables/useUrlSync.js](../../src/composables/useUrlSync.js)

**Step 1: Remove the toggle param**

Delete line 6: `{ key: 'usage', ref: 'businessUsagePercent', default: 1.0 },`

No replacement key is needed — all three columns are always shown (per [01-task.md](./01-task.md) decision).

**Step 2: Verify build still loads a shared URL**

Run: `npm run build`
Expected: build succeeds. (Old links containing `usage=0.5` now harmlessly ignore that key.)

**Step 3: Commit**

```bash
git add src/composables/useUrlSync.js
git commit -m "feat: remove business-usage toggle from URL hash"
```

---

## Task 4: ResultsSummary.vue — three cards, drop toggle props

**Files:**
- Modify: [src/components/ResultsSummary.vue](../../src/components/ResultsSummary.vue)

**Step 1: Simplify props**

Remove props that were per-scenario top-level values: `businessUsagePercent`, `carPrice`, `vatAmount`, `vatReclaim`, `annualWriteOffBase`, `annualWriteOff`, `totalWriteOff`, `netCarCost`. Replace `cheaperOption` with `bestOption`. Add `pausalScenario` (Object). Keep `annualIncome`, `privateScenario`, `companyScenario`, `savings`, `years`, `companyTaxRate`, `dividendTaxRate`, `vatRate`. Delete the `is50Percent` computed (line 284).

**Step 2: Add a reusable company-style card**

The company and paušál cards share identical structure. Extract the company-card markup (lines 112–225) into a small local sub-template rendered for both scenarios. Simplest low-risk approach: define an inline component in `<script setup>` or duplicate the block twice with a `:scenario` and `:title` and `:winner` binding. The write-off note line (was lines 125–126) becomes data-driven:
```html
<span v-if="scenario.taxPercent < 1">
  odpisy (({{ formatCurrency(carPriceProp) }} − {{ Math.round(scenario.vatPercent*100) }}% DPH) ÷ {{ Math.min(years, 4) }}r) × {{ Math.round(scenario.taxPercent*100) }}% = {{ formatCurrency(scenario.annualWriteOff) }}
</span>
<span v-else>odpisy ({{ formatCurrency(carPriceProp) }} − DPH) ÷ {{ Math.min(years, 4) }}r = {{ formatCurrency(scenario.annualWriteOff) }}</span>
```
Read `scenario.annualCostBreakdown.*`, `scenario.netCarCost`, `scenario.vatReclaim` off the scenario object instead of top-level props. (carPrice is still needed for the label — pass it as a prop OR read from scenario; simplest: add `carPrice` back as one prop used only for display.)

**Step 3: Add the §54 refund row to the sale section**

In the company-style card's sale section, after the existing dividend-tax sale row, add:
```html
<div class="row addition" v-if="scenario.saleVatRefund > 0">
  <span>+ Vratka DPH (§54)</span>
  <span>+ {{ formatCurrency(scenario.saleVatRefund) }}</span>
</div>
```
Wrap in `v-if` so it shows only for paušál (the 100% card's refund is 0).

**Step 4: Titles + winner highlighting**

- Private card: `winner: bestOption === 'private'`
- Company card: title `Firemné auto (100%)`, `winner: bestOption === 'company'`
- Paušál card: title `Paušál (50% DPH / 80% daň)`, `winner: bestOption === 'pausal'`, `:scenario="pausalScenario"`

**Step 5: 3-way verdict**

Replace the verdict block (lines 228–242):
```html
<div class="verdict">
  <strong>{{ bestLabel }}</strong> je najvýhodnejšie — o
  <strong>{{ formatCurrency(savings) }}</strong>
  oproti druhej najlepšej možnosti za {{ years }} {{ yearsLabel }}
</div>
```
with `bestLabel` computed mapping `bestOption` → `'Súkromné auto' | 'Firemné auto (100%)' | 'Paušál (50/80)'`.

**Step 6: 3-column grid**

Update `.cards` grid (line 294): `grid-template-columns: 1fr 1fr 1fr;`. Add a mid breakpoint so it doesn't crush on tablet:
```css
@media (max-width: 1000px) { .cards { grid-template-columns: 1fr; } }
```
(Keep the existing `max-width: 800px` single-column rule or fold into the 1000px one.) Verify the app's `.app { max-width: 900px }` in [App.vue](../../src/App.vue:137) — three cards at 900px will be tight; widen to e.g. `1200px` (decide in Task 5).

**Step 7: Build + eyeball**

Run: `npm run build` then `npm run preview`
Expected: three cards render, paušál shows the §54 refund row, winner border on the highest net.

**Step 8: Commit**

```bash
git add src/components/ResultsSummary.vue
git commit -m "feat: render three scenario cards with pausal column"
```

---

## Task 5: App.vue — remove toggle, wire third scenario, widen layout

**Files:**
- Modify: [App.vue](../../src/App.vue)

**Step 1: Delete the toggle markup** — lines 15–21 (`.usage-toggle` block).

**Step 2: Delete the toggle CSS** — lines 199–243 (`.usage-toggle`, `.toggle-*`).

**Step 3: Update the destructure + ResultsSummary props**

In `<script setup>`: remove `businessUsagePercent`, `vatReclaim`, `annualWriteOffBase`, `annualWriteOff`, `totalWriteOff`, `netCarCost`, `cheaperOption` from the `useCalculator()` destructure; add `pausalScenario`, `bestOption`. Update the `<ResultsSummary>` bindings (lines 27–45) to the trimmed prop set from Task 4, adding `:pausalScenario` and `:bestOption`, removing the deleted ones.

**Step 4: Remove `businessUsagePercent` from `useUrlSync` call** — line 112.

**Step 5: Widen the container** — `.app { max-width: 1200px }` (line 137) so three cards fit.

**Step 6: Build**

Run: `npm run build`
Expected: no unresolved references, build succeeds.

**Step 7: Commit**

```bash
git add src/App.vue
git commit -m "feat: remove 50% toggle, wire three-way comparison in App"
```

---

## Task 6: CostChart.vue — add the paušál series

**Files:**
- Modify: [src/components/CostChart.vue](../../src/components/CostChart.vue)

**Step 1: Add the third dataset**

In `chartData` (lines 50–61) add after the company dataset:
```js
{
  label: 'Paušál (50/80)',
  data: props.yearlyData.map(d => d.pausalNet),
  backgroundColor: '#f59e0b'
}
```
(Company stays `#10b981`, private `#94a3b8`; amber distinguishes paušál.)

**Step 2: Build + eyeball**

Run: `npm run build` then `npm run preview`
Expected: three bars per year, legend shows all three.

**Step 3: Commit**

```bash
git add src/components/CostChart.vue
git commit -m "feat: add pausal series to cost chart"
```

---

## Task 7: README + task close-out

**Files:**
- Modify: [README.md](../../README.md)
- Move: `_tasks/23-pausal-scenario/` → `_tasks/_done/23-pausal-scenario/`
- Modify: [_tasks/index.md](../index.md)

**Step 1: Update README** — replace any description of the 100%/50% toggle with the three-scenario model; document the 50/80 paušál rates and the §54 sale refund (cite [02-research.md](./02-research.md) basis briefly).

**Step 2: Run the full test + build gate**

Run: `npm test && npm run build`
Expected: tests PASS, build succeeds.

**Step 3: Move task to done and update the index**

Move the task folder to `_tasks/_done/23-pausal-scenario/`. In [index.md](../index.md): remove row 23 from Active Tasks, add to Completed Tasks: `| 23 | Third scenario: paušalizácia výdavkov | [task](_done/23-pausal-scenario/01-task.md), [research](_done/23-pausal-scenario/02-research.md), [plan](_done/23-pausal-scenario/03-plan.md) |`.

**Step 4: Commit**

```bash
git add README.md _tasks/
git commit -m "docs: document pausal scenario, close task 23"
```

---

## Verification checklist (before claiming done)

- [ ] `npm test` passes, including the `EXPECTED_COMPANY_NET` 100%-regression assertion.
- [ ] `npm run build` succeeds with no unresolved-reference warnings.
- [ ] In `npm run preview`: three cards render; the **Firemné 100%** numbers match the pre-change company card (spot-check net výnos at default inputs).
- [ ] Paušál card shows lower VAT reclaim, the §54 refund row (years < 5), and the winner border lands on the genuine max.
- [ ] Set years = 5 → §54 refund row disappears; years = 4 → refund = vatAmount × 0.5 × 0.2.
- [ ] Chart shows three series; an old shared URL with `usage=0.5` still loads without error.
- [ ] No dangling references to `businessUsagePercent` / `is50Percent` anywhere: `grep -r businessUsagePercent src` returns nothing.
