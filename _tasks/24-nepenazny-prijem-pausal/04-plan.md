# Implementation Plan: Paušál 50/100 + 1% zdanené (4th scenario)

**For:** [03-design.md](./03-design.md)

## Task 1: Core calculation in useCalculator.js

**File:** [useCalculator.js](../../src/composables/useCalculator.js)

1. Add new input: `const personalIncomeTaxRate = ref(0.19)`
2. Add constant near `VAT_ADJUSTMENT_YEARS`: `const NEPENAZNY_PRIJEM_YEARS = 8`
3. Add helper functions:
   ```js
   const nepenaznyPrijemBase = (y) => y > NEPENAZNY_PRIJEM_YEARS ? 0 : carPrice.value * (1 - 0.125 * (y - 1))
   const nepenaznyPrijemAnnual = (y) => nepenaznyPrijemBase(y) * 0.12
   ```
4. Add `const pausalTaxedBase = makeCompanyScenario(0.5, 1.0)`
5. Add `pausalTaxedScenario` computed:
   - Read `b = pausalTaxedBase.value`
   - Map `b.yearlyBreakdown` to a new array: for each entry (year `y`), compute
     `nepenaznyPrijem = nepenaznyPrijemAnnual(y)`, `personalTax = nepenaznyPrijem * personalIncomeTaxRate.value`,
     and return `{ ...entry, nepenaznyPrijem, personalTax, dividends: entry.dividends - personalTax }`
   - `totalOwnerPersonalTax` = sum of `personalTax` across the mapped array
   - `totalNepenaznyPrijem` = sum of `nepenaznyPrijem` across the mapped array
   - Return `{ ...b, yearlyBreakdown: <mapped>, dividends: b.yearlyBreakdown[0].dividends /* gross, unchanged */, annualCash: mapped[0].dividends /* net */, ownerPersonalTaxYear1: mapped[0].personalTax, totalCashOverYears: sum(mapped[].dividends), netToOwner: b.netToOwner - totalOwnerPersonalTax, totalOwnerPersonalTax, totalNepenaznyPrijem, personalIncomeTaxRate: personalIncomeTaxRate.value }`
6. `scenarioNets`: add `pausalTaxed: pausalTaxedScenario.value.netToOwner`. (`bestOption`/`savings` are
   already generic over `Object.keys`/`Object.values` — no change needed there.)
7. `yearlyData`: add a 4th cumulative tracker `pausalTaxedCumulative`, mirroring the existing
   `pausalCumulative` block exactly but reading from `pausalTaxedScenario.value` (its
   `yearlyBreakdown[y-1].dividends` is already net of personal tax, so the existing
   nonDeductibleRunning/nonDeductibleCost/sale logic carries over unchanged). Push
   `pausalTaxedNet: Math.round(pausalTaxedCumulative)` into each year's data point.
8. Export `personalIncomeTaxRate` and `pausalTaxedScenario` from the composable's return object.

## Task 2: URL sync + Advanced Settings input

**Files:** [useUrlSync.js](../../src/composables/useUrlSync.js), [AdvancedSettings.vue](../../src/components/AdvancedSettings.vue), [App.vue](../../src/App.vue)

1. `useUrlSync.js`: add `{ key: 'pit', ref: 'personalIncomeTaxRate', default: 0.19 }` to `PARAMS`.
2. `App.vue`: destructure `personalIncomeTaxRate` and `pausalTaxedScenario` from `useCalculator()`;
   pass `personalIncomeTaxRate` into the `useUrlSync({...})` refs object; add
   `v-model:personalIncomeTaxRate="personalIncomeTaxRate"` to `<AdvancedSettings>`; pass
   `:pausalTaxedScenario="pausalTaxedScenario"` to `<ResultsSummary>`.
3. `AdvancedSettings.vue`: add a new `.setting` under the "Dane" group, same pattern as
   `dividendTax` (`Osobná daň z nepeňažného príjmu (%)`, step 1, `Math.round(x*100)` /
   `x/100` conversion); add `personalIncomeTaxRate` to `defineProps` and
   `update:personalIncomeTaxRate` to `defineEmits`.

## Task 3: 4th card in ResultsSummary.vue

**File:** [ResultsSummary.vue](../../src/components/ResultsSummary.vue)

1. Add prop `pausalTaxedScenario: { type: Object, required: true }`.
2. Add a 4th `<CompanyStyleCard>` after the paušál one:
   `title="Paušál (50% DPH / 100% daň + 1%)"`, `:scenario="pausalTaxedScenario"`,
   `:winner="bestOption === 'pausalTaxed'"`, same other props as the other two cards.
3. `bestLabel`: add a branch — `if (props.bestOption === 'pausalTaxed') return 'Paušál (50/100+1%)'`.
4. CSS: change `.cards { grid-template-columns: 1fr 1fr 1fr; }` to `1fr 1fr 1fr 1fr`. The
   existing `@media (max-width: 1000px)` collapse to 1 column already handles small screens —
   verify in-browser whether the 4-column desktop layout needs a wider breakpoint bump (e.g.
   `max-width: 1300px` collapsing to 2 columns as an intermediate step) once rendered.

## Task 4: Extend CompanyStyleCard.vue for the new fields

**File:** [CompanyStyleCard.vue](../../src/components/CompanyStyleCard.vue)

1. Change the `= Dividendy` row's value binding from `scenario.annualCash` to
   `scenario.dividends` (no-op for the two existing scenarios where the fields are identical;
   correctly shows the *gross* company payout for the new scenario).
2. Immediately after that row, add a new conditional block:
   ```vue
   <div class="row deduction" v-if="scenario.ownerPersonalTaxYear1">
     <span>- Nepeňažný príjem 1% (daň {{ Math.round(scenario.personalIncomeTaxRate * 100) }}%)</span>
     <span>- {{ formatCurrency(scenario.ownerPersonalTaxYear1) }}</span>
   </div>
   <div class="cost-breakdown net-note" v-if="scenario.ownerPersonalTaxYear1">
     <em>pozn.: predpoklad = žiadna mzda, len dividendy (inak by pribudli odvody, cca 14-36%)</em>
   </div>
   ```
   (Leave the existing `highlight` row as-is — it already binds `scenario.annualCash`, which is
   now the net figure for this scenario.)
3. No prop changes needed — the new fields ride on the `scenario` object already passed in.

## Task 5: Chart series in CostChart.vue

**File:** [CostChart.vue](../../src/components/CostChart.vue)

1. Add a 4th dataset to `chartData`:
   ```js
   {
     label: 'Paušál (50/100+1%)',
     data: props.yearlyData.map(d => d.pausalTaxedNet),
     backgroundColor: '#8b5cf6'
   }
   ```

## Task 6: Tests

**File:** [useCalculator.test.js](../../src/composables/useCalculator.test.js)

Add a `describe('pausalTaxedScenario', ...)` block mirroring the existing `pausalScenario`
block:
1. Exposes `netToOwner` as a number.
2. `taxPercent` is `1.0` (full deduction — confirms the mutual-exclusivity design choice), and
   `vatReclaim` matches the paušál 50% figure (same as `pausalScenario`).
3. Year-1 nepeňažný príjem = `carPrice × 0.12` (1% × 12 months on the full un-reduced price);
   year-2 = `carPrice × 0.875 × 0.12`.
4. Year-1 owner personal tax = year-1 nepeňažný príjem × `personalIncomeTaxRate` (default 0.19).
5. `netToOwner` equals `pausalTaxedBase`-equivalent minus `totalOwnerPersonalTax` — practically,
   assert `pausalTaxedScenario.value.netToOwner` is *greater* than `pausalScenario.value.netToOwner`
   for the default 50k/4-year setup (the concrete finding from research — confirms the new
   scenario is genuinely more advantageous at these defaults, not a regression).
6. Extend the `yearlyData chart accumulation` test to also check
   `last.pausalTaxedNet === Math.round(c.pausalTaxedScenario.value.netToOwner)`.
7. Extend the `bestOption` test's allowed set to include `'pausalTaxed'`.

## Task 7: README.md

1. Update the intro's option list (three → four) and the "Key Parameters"/scenario table to add
   the `personalIncomeTaxRate` (19%) parameter.
2. New section (after the existing "## Paušál Scenario" section): explain the mutual-exclusivity
   finding (§5 ods. 3 vs §19 ods. 2 t), cite financnasprava's FAQ), the formula, the zero-salary
   assumption and why odvody = 0 in that case, and the quantified "if also employed" caveat.
3. Update "## Features" (three-way → four-way comparison, 3 → 4 chart series).
4. Update "## Project Structure" description of `useCalculator.js` / `ResultsSummary.vue` /
   `CostChart.vue` to mention 4 scenarios / 4 series.
5. Add a "### Paušál 50/100+1% Wins When" subsection under "## When Each Option Wins".

## Verification

1. `npm test` — all existing + new tests pass.
2. `npm run dev` — visually confirm: 4 cards render, numbers match the worked example in
   [02-research.md](./02-research.md) (year-1 nepeňažný príjem 6,000 EUR, tax 1,140 EUR at
   19%, on defaults), chart shows 4 bars/series per year, URL hash round-trips `pit=`.
3. Confirm `Firemné 100%` and `Paušál 50/80` numbers are byte-for-byte unchanged from before
   (regression check — nothing about the existing 3 scenarios should move).
4. Toggle `personalIncomeTaxRate` in Advanced Settings and confirm the 4th column updates.

## Completion

1. Commit planning docs (this + 01/02/03) before touching code — already done once these three
   files exist; commit again if anything changed during implementation review.
2. After implementation + verification: move `_tasks/24-nepenazny-prijem-pausal/` to
   `_tasks/_done/`, update [index.md](../index.md), commit.
