# Calculator v2 - Income-Based Model Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the calculator to show net cash to owner using income-based model with full breakdown.

**Architecture:** Rewrite useCalculator composable with new calculation logic. Update ResultsSummary to show detailed breakdown tables. Add annual income input.

**Tech Stack:** Vue 3, Vite (existing)

---

## Task 1: Update useCalculator with Income-Based Model

**Files:**
- Modify: `C:\_dev\sukromne-vs-firemne\src\composables\useCalculator.js`

**Step 1: Replace entire useCalculator.js with new implementation**

```javascript
import { ref, computed } from 'vue'

export function useCalculator() {
  // Primary inputs
  const annualIncome = ref(100000)
  const kmPerYear = ref(25000)
  const years = ref(4)

  // Reimbursement rates
  const kmRate = ref(0.256)
  const fuelPrice = ref(1.5)

  // Car costs (with VAT where applicable)
  const carPrice = ref(50000)
  const insurance = ref(1500)  // NO VAT on insurance
  const maintenance = ref(400)  // with VAT
  const fuelConsumption = ref(5.1)
  const consumptionAdjustment = ref(0.10)

  // Tax rates
  const vatRate = ref(0.23)
  const companyTax = ref(0.10)
  const dividendTax = ref(0.07)
  const depreciationRate = ref(0.25)

  // Helper: remove VAT
  const withoutVat = (amount) => amount / (1 + vatRate.value)

  // Helper: calculate fuel cost
  const fuelCost = computed(() => {
    const adjustedConsumption = fuelConsumption.value * (1 + consumptionAdjustment.value)
    const litersUsed = (kmPerYear.value / 100) * adjustedConsumption
    return litersUsed * fuelPrice.value
  })

  // ============ PRIVATE CAR SCENARIO ============
  const privateScenario = computed(() => {
    // Annual reimbursements from company
    const kmReimbursement = kmPerYear.value * kmRate.value
    const fuelReimbursement = fuelCost.value
    const totalReimbursements = kmReimbursement + fuelReimbursement

    // Company financials (annual)
    const taxableProfit = annualIncome.value - totalReimbursements
    const companyTaxAmount = taxableProfit * companyTax.value
    const afterTaxProfit = taxableProfit - companyTaxAmount
    const dividendTaxAmount = afterTaxProfit * dividendTax.value
    const dividends = afterTaxProfit - dividendTaxAmount
    const annualCash = dividends + totalReimbursements

    // Personal car costs (paid from dividends, over full period)
    const personalCarPurchase = carPrice.value  // with VAT
    const personalInsurance = insurance.value * years.value  // no VAT on insurance
    const personalMaintenance = maintenance.value * years.value  // with VAT
    const personalFuel = fuelCost.value * years.value  // with VAT
    const personalRunningCosts = personalInsurance + personalMaintenance + personalFuel

    // Multi-year totals
    const totalCashOverYears = annualCash * years.value
    const netToOwner = totalCashOverYears - personalCarPurchase - personalRunningCosts

    return {
      // Annual breakdown
      reimbursements: totalReimbursements,
      taxableProfit,
      companyTaxAmount,
      afterTaxProfit,
      dividendTaxAmount,
      dividends,
      annualCash,
      // Multi-year
      totalCashOverYears,
      personalCarPurchase,
      personalRunningCosts,
      netToOwner
    }
  })

  // ============ COMPANY CAR SCENARIO ============
  const companyScenario = computed(() => {
    // Calculate annual costs for company (first year with depreciation)
    const carPriceNoVat = withoutVat(carPrice.value)
    const annualDepreciation = carPriceNoVat * depreciationRate.value
    const insuranceCost = insurance.value  // NO VAT recovery on insurance
    const maintenanceCost = withoutVat(maintenance.value)  // VAT recovered
    const fuelCostNoVat = withoutVat(fuelCost.value)  // VAT recovered

    // Annual deductions (year 1-4 includes depreciation)
    const annualDeductionsWithDep = annualDepreciation + insuranceCost + maintenanceCost + fuelCostNoVat
    const annualDeductionsNoDep = insuranceCost + maintenanceCost + fuelCostNoVat

    // Calculate dividends for each year and sum
    let totalDividends = 0
    const yearlyBreakdown = []

    for (let y = 1; y <= years.value; y++) {
      const deductions = y <= 4 ? annualDeductionsWithDep : annualDeductionsNoDep
      const taxableProfit = annualIncome.value - deductions
      const companyTaxAmount = taxableProfit * companyTax.value
      const afterTaxProfit = taxableProfit - companyTaxAmount
      const dividendTaxAmount = afterTaxProfit * dividendTax.value
      const dividends = afterTaxProfit - dividendTaxAmount

      totalDividends += dividends
      yearlyBreakdown.push({
        year: y,
        deductions,
        taxableProfit,
        companyTaxAmount,
        afterTaxProfit,
        dividendTaxAmount,
        dividends
      })
    }

    // Use year 1 values for annual display
    const year1 = yearlyBreakdown[0]

    return {
      // Annual breakdown (year 1 representative)
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
      netToOwner: totalDividends,
      // Detailed
      yearlyBreakdown
    }
  })

  // Summary comparisons
  const savings = computed(() => companyScenario.value.netToOwner - privateScenario.value.netToOwner)
  const cheaperOption = computed(() => savings.value > 0 ? 'company' : 'private')

  // Chart data
  const yearlyData = computed(() => {
    const data = []
    let privateCumulative = 0
    let companyCumulative = 0

    const privateAnnual = privateScenario.value.annualCash
    const privateCarCost = privateScenario.value.personalCarPurchase
    const privateRunningPerYear = privateScenario.value.personalRunningCosts / years.value

    for (let y = 1; y <= years.value; y++) {
      // Private: accumulate cash, subtract car cost in year 1, subtract running costs each year
      privateCumulative += privateAnnual - privateRunningPerYear
      if (y === 1) privateCumulative -= privateCarCost

      // Company: accumulate dividends
      const companyYear = companyScenario.value.yearlyBreakdown[y - 1]
      companyCumulative += companyYear.dividends

      data.push({
        year: y,
        privateNet: privateCumulative,
        companyNet: companyCumulative
      })
    }

    return data
  })

  return {
    // Inputs
    annualIncome,
    kmPerYear,
    years,
    kmRate,
    fuelPrice,
    carPrice,
    insurance,
    maintenance,
    fuelConsumption,
    consumptionAdjustment,
    vatRate,
    companyTax,
    dividendTax,
    depreciationRate,
    // Scenario outputs
    privateScenario,
    companyScenario,
    // Summary
    savings,
    cheaperOption,
    yearlyData
  }
}
```

**Step 2: Verify it compiles**

Run:
```bash
cd "C:\_dev\sukromne-vs-firemne" && npm run dev
```

Expected: Dev server starts (page may show errors until UI is updated).

**Step 3: Commit**

```bash
git add src/composables/useCalculator.js
git commit -m "feat: rewrite calculator with income-based model"
```

---

## Task 2: Create IncomeInput Component

**Files:**
- Create: `C:\_dev\sukromne-vs-firemne\src\components\IncomeInput.vue`

**Step 1: Create the component**

```vue
<template>
  <div class="income-input">
    <label>
      <span class="label-text">Rocny prijem firmy</span>
      <span class="value">{{ formatCurrency(modelValue) }}</span>
    </label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div class="range-labels">
      <span>{{ formatCurrency(min) }}</span>
      <span>{{ formatCurrency(max) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 20000 },
  max: { type: Number, default: 500000 },
  step: { type: Number, default: 10000 }
})

defineEmits(['update:modelValue'])

const formatCurrency = (value) => {
  return value.toLocaleString('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}
</script>

<style scoped>
.income-input {
  margin-bottom: 24px;
}

.income-input label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.income-input .value {
  font-weight: 700;
  color: #2563eb;
}

.income-input input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.income-input input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
}

.income-input input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: none;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
</style>
```

**Step 2: Commit**

```bash
git add src/components/IncomeInput.vue
git commit -m "feat: add IncomeInput component"
```

---

## Task 3: Update ResultsSummary with Detailed Breakdown

**Files:**
- Modify: `C:\_dev\sukromne-vs-firemne\src\components\ResultsSummary.vue`

**Step 1: Replace entire ResultsSummary.vue**

```vue
<template>
  <div class="results-summary">
    <div class="cards">
      <!-- Private Car Card -->
      <div class="card" :class="{ winner: cheaperOption === 'private' }">
        <h3>Sukromne auto</h3>
        <div class="breakdown">
          <div class="row">
            <span>Prijem firmy</span>
            <span>{{ formatCurrency(annualIncome) }}</span>
          </div>
          <div class="row deduction">
            <span>- Nahrady</span>
            <span>- {{ formatCurrency(privateScenario.reimbursements) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zdanitelny zisk</span>
            <span>{{ formatCurrency(privateScenario.taxableProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z prijmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(privateScenario.companyTaxAmount) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zisk po dani</span>
            <span>{{ formatCurrency(privateScenario.afterTaxProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(privateScenario.dividendTaxAmount) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Dividendy</span>
            <span>{{ formatCurrency(privateScenario.dividends) }}</span>
          </div>
          <div class="row addition">
            <span>+ Nahrady</span>
            <span>+ {{ formatCurrency(privateScenario.reimbursements) }}</span>
          </div>
          <div class="row highlight">
            <span>= Rocne v hotovosti</span>
            <span>{{ formatCurrency(privateScenario.annualCash) }}</span>
          </div>
        </div>

        <div class="multi-year">
          <div class="row">
            <span>Za {{ years }} {{ yearsLabel }}</span>
            <span>{{ formatCurrency(privateScenario.totalCashOverYears) }}</span>
          </div>
          <div class="row deduction">
            <span>- Kupa auta</span>
            <span>- {{ formatCurrency(privateScenario.personalCarPurchase) }}</span>
          </div>
          <div class="row deduction">
            <span>- Prevadzkove naklady</span>
            <span>- {{ formatCurrency(privateScenario.personalRunningCosts) }}</span>
          </div>
        </div>

        <div class="total">
          <span>CISTY VYNOS</span>
          <span>{{ formatCurrency(privateScenario.netToOwner) }}</span>
        </div>
      </div>

      <!-- Company Car Card -->
      <div class="card" :class="{ winner: cheaperOption === 'company' }">
        <h3>Firemne auto</h3>
        <div class="breakdown">
          <div class="row">
            <span>Prijem firmy</span>
            <span>{{ formatCurrency(annualIncome) }}</span>
          </div>
          <div class="row deduction">
            <span>- Naklady auta</span>
            <span>- {{ formatCurrency(companyScenario.carCosts) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zdanitelny zisk</span>
            <span>{{ formatCurrency(companyScenario.taxableProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z prijmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(companyScenario.companyTaxAmount) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zisk po dani</span>
            <span>{{ formatCurrency(companyScenario.afterTaxProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(companyScenario.dividendTaxAmount) }}</span>
          </div>
          <div class="row highlight">
            <span>= Rocne v hotovosti</span>
            <span>{{ formatCurrency(companyScenario.annualCash) }}</span>
          </div>
        </div>

        <div class="multi-year">
          <div class="row">
            <span>Za {{ years }} {{ yearsLabel }}</span>
            <span>{{ formatCurrency(companyScenario.totalCashOverYears) }}</span>
          </div>
          <div class="row">
            <span>- Osobne naklady</span>
            <span>{{ formatCurrency(0) }}</span>
          </div>
        </div>

        <div class="total">
          <span>CISTY VYNOS</span>
          <span>{{ formatCurrency(companyScenario.netToOwner) }}</span>
        </div>
      </div>
    </div>

    <div class="verdict">
      <template v-if="savings > 0">
        <strong>Firemne auto</strong> usetri
        <strong>{{ formatCurrency(savings) }}</strong>
        za {{ years }} {{ yearsLabel }}
      </template>
      <template v-else-if="savings < 0">
        <strong>Sukromne auto</strong> usetri
        <strong>{{ formatCurrency(Math.abs(savings)) }}</strong>
        za {{ years }} {{ yearsLabel }}
      </template>
      <template v-else>
        Obe moznosti stoja rovnako
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  annualIncome: { type: Number, required: true },
  privateScenario: { type: Object, required: true },
  companyScenario: { type: Object, required: true },
  savings: { type: Number, required: true },
  cheaperOption: { type: String, required: true },
  years: { type: Number, required: true },
  companyTaxRate: { type: Number, required: true },
  dividendTaxRate: { type: Number, required: true }
})

const yearsLabel = computed(() => {
  if (props.years === 1) return 'rok'
  if (props.years >= 2 && props.years <= 4) return 'roky'
  return 'rokov'
})

const formatCurrency = (value) => {
  return value.toLocaleString('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}
</script>

<style scoped>
.results-summary {
  margin: 32px 0;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 800px) {
  .cards {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.card.winner {
  background: #ecfdf5;
  border-color: #10b981;
}

.card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #1e293b;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.breakdown {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
  color: #475569;
}

.row.deduction {
  color: #dc2626;
}

.row.addition {
  color: #16a34a;
}

.row.subtotal {
  font-weight: 500;
  color: #1e293b;
}

.row.highlight {
  font-weight: 600;
  color: #1e293b;
  background: #e2e8f0;
  margin: 8px -8px 0;
  padding: 8px;
  border-radius: 4px;
}

.multi-year {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  padding: 8px;
  background: #e2e8f0;
  border-radius: 6px;
}

.card.winner .total {
  background: #10b981;
  color: white;
}

.verdict {
  text-align: center;
  font-size: 18px;
  color: #1e293b;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 8px;
}

.verdict strong {
  color: #10b981;
}
</style>
```

**Step 2: Commit**

```bash
git add src/components/ResultsSummary.vue
git commit -m "feat: update ResultsSummary with detailed breakdown"
```

---

## Task 4: Update CostChart for Net Cash Display

**Files:**
- Modify: `C:\_dev\sukromne-vs-firemne\src\components\CostChart.vue`

**Step 1: Update chart to show net cash**

```vue
<template>
  <div class="cost-chart">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  yearlyData: { type: Array, required: true }
})

const chartData = computed(() => ({
  labels: props.yearlyData.map(d => `Rok ${d.year}`),
  datasets: [
    {
      label: 'Sukromne auto',
      data: props.yearlyData.map(d => d.privateNet),
      backgroundColor: '#94a3b8'
    },
    {
      label: 'Firemne auto',
      data: props.yearlyData.map(d => d.companyNet),
      backgroundColor: '#10b981'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'Kumulativny cisty vynos'
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw.toLocaleString('sk-SK', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
          })
          return `${context.dataset.label}: ${value}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => {
          return value.toLocaleString('sk-SK') + ' €'
        }
      }
    }
  }
}
</script>

<style scoped>
.cost-chart {
  margin: 32px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}
</style>
```

**Step 2: Commit**

```bash
git add src/components/CostChart.vue
git commit -m "feat: update chart to show cumulative net cash"
```

---

## Task 5: Update App.vue to Wire Everything Together

**Files:**
- Modify: `C:\_dev\sukromne-vs-firemne\src\App.vue`

**Step 1: Replace App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>
    <p class="subtitle">Porovnanie nakladov na auto z pohladu majitela firmy</p>

    <IncomeInput v-model="annualIncome" />
    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />

    <ResultsSummary
      :annualIncome="annualIncome"
      :privateScenario="privateScenario"
      :companyScenario="companyScenario"
      :savings="savings"
      :cheaperOption="cheaperOption"
      :years="years"
      :companyTaxRate="companyTax"
      :dividendTaxRate="dividendTax"
    />

    <CostChart :yearlyData="yearlyData" />

    <AdvancedSettings
      v-model:kmRate="kmRate"
      v-model:fuelPrice="fuelPrice"
      v-model:carPrice="carPrice"
      v-model:insurance="insurance"
      v-model:maintenance="maintenance"
      v-model:fuelConsumption="fuelConsumption"
      v-model:consumptionAdjustment="consumptionAdjustment"
      v-model:vatRate="vatRate"
      v-model:companyTax="companyTax"
      v-model:dividendTax="dividendTax"
      v-model:depreciationRate="depreciationRate"
    />
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import IncomeInput from './components/IncomeInput.vue'
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import CostChart from './components/CostChart.vue'
import AdvancedSettings from './components/AdvancedSettings.vue'

const {
  annualIncome,
  kmPerYear,
  years,
  kmRate,
  fuelPrice,
  carPrice,
  insurance,
  maintenance,
  fuelConsumption,
  consumptionAdjustment,
  vatRate,
  companyTax,
  dividendTax,
  depreciationRate,
  privateScenario,
  companyScenario,
  savings,
  cheaperOption,
  yearlyData
} = useCalculator()
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f1f5f9;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 32px;
}

@media (max-width: 600px) {
  .app {
    padding: 16px;
  }

  h1 {
    font-size: 24px;
  }
}
</style>
```

**Step 2: Verify everything works**

Run:
```bash
cd "C:\_dev\sukromne-vs-firemne" && npm run dev
```

Expected: App displays with income slider, detailed breakdown cards, and updated chart.

**Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: wire up v2 calculator with income-based model"
```

---

## Task 6: Add Income to Advanced Settings

**Files:**
- Modify: `C:\_dev\sukromne-vs-firemne\src\components\AdvancedSettings.vue`

**Step 1: Add income field to AdvancedSettings**

Add a new settings group at the beginning of the settings-panel. Find the line:
```vue
<div v-if="isOpen" class="settings-panel">
```

And add after it:
```vue
      <div class="settings-group">
        <h4>Prijem</h4>
        <div class="setting">
          <label>Rocny prijem firmy (EUR)</label>
          <input type="number" step="10000" :value="annualIncome" @input="emit('update:annualIncome', Number($event.target.value))" />
        </div>
      </div>
```

Add `annualIncome` to props:
```javascript
defineProps({
  annualIncome: Number,
  kmRate: Number,
  // ... rest unchanged
})
```

Add emit:
```javascript
const emit = defineEmits([
  'update:annualIncome',
  'update:kmRate',
  // ... rest unchanged
])
```

**Step 2: Update App.vue to pass annualIncome**

Add to AdvancedSettings in App.vue:
```vue
v-model:annualIncome="annualIncome"
```

**Step 3: Commit**

```bash
git add src/components/AdvancedSettings.vue src/App.vue
git commit -m "feat: add income to advanced settings"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Rewrite useCalculator with income-based model |
| 2 | Create IncomeInput component |
| 3 | Update ResultsSummary with detailed breakdown |
| 4 | Update CostChart for net cash display |
| 5 | Wire everything together in App.vue |
| 6 | Add income to Advanced Settings |
