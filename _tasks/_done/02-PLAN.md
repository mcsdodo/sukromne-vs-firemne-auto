# Car Cost Calculator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static Vue 3 calculator comparing private vs company car costs for a company owner.

**Architecture:** Vue 3 + Vite SPA with reactive state. All calculations in a composable (`useCalculator`). Chart.js for visualization. No backend - purely client-side.

**Tech Stack:** Vue 3, Vite, Chart.js, GitHub Pages

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/App.vue`

**Step 1: Initialize npm project**

Run:
```bash
npm init -y
```

**Step 2: Install dependencies**

Run:
```bash
npm install vue@3 chart.js vue-chartjs
npm install -D vite @vitejs/plugin-vue
```

**Step 3: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './'
})
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sukromne vs Firemne Auto</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 5: Create src/main.js**

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

**Step 6: Create src/App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>
    <p>Calculator coming soon...</p>
  </div>
</template>

<script setup>
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
```

**Step 7: Update package.json scripts**

Add to package.json:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 8: Verify setup**

Run:
```bash
npm run dev
```

Expected: Dev server starts, browser shows "Sukromne vs Firemne Auto" heading.

**Step 9: Commit**

```bash
git add .
git commit -m "chore: initial Vue 3 + Vite project setup"
```

---

## Task 2: Calculator Logic (useCalculator composable)

**Files:**
- Create: `src/composables/useCalculator.js`

**Step 1: Create the composable with default values**

```javascript
import { ref, computed } from 'vue'

export function useCalculator() {
  // Primary inputs
  const kmPerYear = ref(25000)
  const years = ref(4)

  // Reimbursement rates
  const kmRate = ref(0.256)
  const fuelPrice = ref(1.5)

  // Car costs (all with VAT)
  const carPrice = ref(50000)
  const insurance = ref(1500)
  const maintenance = ref(400)
  const fuelConsumption = ref(5.1)
  const consumptionAdjustment = ref(0.10)

  // Tax rates
  const vatRate = ref(0.23)
  const companyTax = ref(0.10)
  const dividendTax = ref(0.07)
  const depreciationRate = ref(0.25)

  // Helper: remove VAT
  const withoutVat = (amount) => amount / (1 + vatRate.value)

  // Private car annual cost
  const privateAnnualCost = computed(() => {
    const kmReimbursement = kmPerYear.value * kmRate.value
    const adjustedConsumption = fuelConsumption.value * (1 + consumptionAdjustment.value)
    const litersUsed = (kmPerYear.value / 100) * adjustedConsumption
    const fuelReimbursement = litersUsed * fuelPrice.value

    const grossCost = kmReimbursement + fuelReimbursement
    const afterCompanyTax = grossCost * (1 - companyTax.value)
    const dividendEquivalent = afterCompanyTax / (1 - dividendTax.value)

    return dividendEquivalent
  })

  // Company car annual cost (for a given year number)
  const companyAnnualCost = (yearNumber) => {
    const carPriceNoVat = withoutVat(carPrice.value)
    const depreciation = yearNumber <= 4 ? carPriceNoVat * depreciationRate.value : 0

    const insuranceNoVat = withoutVat(insurance.value)
    const maintenanceNoVat = withoutVat(maintenance.value)

    const adjustedConsumption = fuelConsumption.value * (1 + consumptionAdjustment.value)
    const litersUsed = (kmPerYear.value / 100) * adjustedConsumption
    const fuelNoVat = withoutVat(litersUsed * fuelPrice.value)

    const grossCost = depreciation + insuranceNoVat + maintenanceNoVat + fuelNoVat
    const afterCompanyTax = grossCost * (1 - companyTax.value)
    const dividendEquivalent = afterCompanyTax / (1 - dividendTax.value)

    return dividendEquivalent
  }

  // Multi-year calculations
  const yearlyData = computed(() => {
    const data = []
    let privateCumulative = 0
    let companyCumulative = 0

    for (let y = 1; y <= years.value; y++) {
      privateCumulative += privateAnnualCost.value
      companyCumulative += companyAnnualCost(y)

      data.push({
        year: y,
        privateAnnual: privateAnnualCost.value,
        companyAnnual: companyAnnualCost(y),
        privateCumulative,
        companyCumulative
      })
    }

    return data
  })

  // Summary
  const totalPrivate = computed(() => {
    const last = yearlyData.value[yearlyData.value.length - 1]
    return last ? last.privateCumulative : 0
  })

  const totalCompany = computed(() => {
    const last = yearlyData.value[yearlyData.value.length - 1]
    return last ? last.companyCumulative : 0
  })

  const savings = computed(() => totalPrivate.value - totalCompany.value)
  const cheaperOption = computed(() => savings.value > 0 ? 'company' : 'private')

  return {
    // Inputs
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
    // Outputs
    yearlyData,
    totalPrivate,
    totalCompany,
    savings,
    cheaperOption
  }
}
```

**Step 2: Verify composable loads**

Update `src/App.vue` temporarily:

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>
    <p>Private total: {{ totalPrivate.toFixed(2) }} EUR</p>
    <p>Company total: {{ totalCompany.toFixed(2) }} EUR</p>
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'

const { totalPrivate, totalCompany } = useCalculator()
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
```

Run:
```bash
npm run dev
```

Expected: Page shows calculated totals for default values.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add useCalculator composable with all cost calculations"
```

---

## Task 3: Kilometers Slider Component

**Files:**
- Create: `src/components/KmSlider.vue`
- Modify: `src/App.vue`

**Step 1: Create KmSlider.vue**

```vue
<template>
  <div class="km-slider">
    <label>
      <span class="label-text">Kilometre za rok</span>
      <span class="value">{{ modelValue.toLocaleString('sk-SK') }} km</span>
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
      <span>{{ min.toLocaleString('sk-SK') }}</span>
      <span>{{ max.toLocaleString('sk-SK') }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 5000 },
  max: { type: Number, default: 60000 },
  step: { type: Number, default: 1000 }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.km-slider {
  margin-bottom: 24px;
}

.km-slider label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.km-slider .value {
  font-weight: 700;
  color: #2563eb;
}

.km-slider input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.km-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
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

**Step 2: Update App.vue to use KmSlider**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>

    <KmSlider v-model="kmPerYear" />

    <p>Private total: {{ totalPrivate.toFixed(2) }} EUR</p>
    <p>Company total: {{ totalCompany.toFixed(2) }} EUR</p>
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import KmSlider from './components/KmSlider.vue'

const { kmPerYear, totalPrivate, totalCompany } = useCalculator()
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
```

**Step 3: Verify slider works**

Run:
```bash
npm run dev
```

Expected: Slider changes km value, totals update in real-time.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add KmSlider component with live updates"
```

---

## Task 4: Years Input Component

**Files:**
- Create: `src/components/YearsInput.vue`
- Modify: `src/App.vue`

**Step 1: Create YearsInput.vue**

```vue
<template>
  <div class="years-input">
    <label>
      <span class="label-text">Pocet rokov</span>
      <span class="value">{{ modelValue }}</span>
    </label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="1"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div class="range-labels">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 10 }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.years-input {
  margin-bottom: 24px;
}

.years-input label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.years-input .value {
  font-weight: 700;
  color: #2563eb;
}

.years-input input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.years-input input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
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

**Step 2: Update App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>

    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />

    <p>Private total: {{ totalPrivate.toFixed(2) }} EUR</p>
    <p>Company total: {{ totalCompany.toFixed(2) }} EUR</p>
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'

const { kmPerYear, years, totalPrivate, totalCompany } = useCalculator()
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
```

**Step 3: Verify years input works**

Run:
```bash
npm run dev
```

Expected: Both sliders work, totals update based on km and years.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add YearsInput component"
```

---

## Task 5: Results Summary Component

**Files:**
- Create: `src/components/ResultsSummary.vue`
- Modify: `src/App.vue`

**Step 1: Create ResultsSummary.vue**

```vue
<template>
  <div class="results-summary">
    <div class="cards">
      <div class="card" :class="{ winner: cheaperOption === 'private' }">
        <h3>Sukromne auto</h3>
        <p class="amount">{{ formatCurrency(totalPrivate) }}</p>
        <p class="period">za {{ years }} {{ yearsLabel }}</p>
      </div>
      <div class="card" :class="{ winner: cheaperOption === 'company' }">
        <h3>Firemne auto</h3>
        <p class="amount">{{ formatCurrency(totalCompany) }}</p>
        <p class="period">za {{ years }} {{ yearsLabel }}</p>
      </div>
    </div>
    <div class="verdict">
      <template v-if="savings > 0">
        <strong>Firemne auto</strong> usetri
        <strong>{{ formatCurrency(savings) }}</strong>
      </template>
      <template v-else-if="savings < 0">
        <strong>Sukromne auto</strong> usetri
        <strong>{{ formatCurrency(Math.abs(savings)) }}</strong>
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
  totalPrivate: { type: Number, required: true },
  totalCompany: { type: Number, required: true },
  savings: { type: Number, required: true },
  cheaperOption: { type: String, required: true },
  years: { type: Number, required: true }
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

.card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.card.winner {
  background: #ecfdf5;
  border-color: #10b981;
}

.card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #64748b;
}

.card .amount {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card .period {
  font-size: 14px;
  color: #94a3b8;
  margin: 4px 0 0 0;
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

**Step 2: Update App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>

    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />

    <ResultsSummary
      :totalPrivate="totalPrivate"
      :totalCompany="totalCompany"
      :savings="savings"
      :cheaperOption="cheaperOption"
      :years="years"
    />
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'

const {
  kmPerYear,
  years,
  totalPrivate,
  totalCompany,
  savings,
  cheaperOption
} = useCalculator()
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 32px;
}
</style>
```

**Step 3: Verify summary displays correctly**

Run:
```bash
npm run dev
```

Expected: Two cards show totals, winner highlighted, verdict shows savings.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add ResultsSummary component with comparison cards"
```

---

## Task 6: Cost Chart Component

**Files:**
- Create: `src/components/CostChart.vue`
- Modify: `src/App.vue`

**Step 1: Create CostChart.vue**

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
      data: props.yearlyData.map(d => d.privateCumulative),
      backgroundColor: '#94a3b8'
    },
    {
      label: 'Firemne auto',
      data: props.yearlyData.map(d => d.companyCumulative),
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

**Step 2: Update App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>

    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />

    <ResultsSummary
      :totalPrivate="totalPrivate"
      :totalCompany="totalCompany"
      :savings="savings"
      :cheaperOption="cheaperOption"
      :years="years"
    />

    <CostChart :yearlyData="yearlyData" />
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import CostChart from './components/CostChart.vue'

const {
  kmPerYear,
  years,
  totalPrivate,
  totalCompany,
  savings,
  cheaperOption,
  yearlyData
} = useCalculator()
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 32px;
}
</style>
```

**Step 3: Verify chart displays**

Run:
```bash
npm run dev
```

Expected: Bar chart shows cumulative costs per year, updates with slider changes.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add CostChart component with Chart.js bar chart"
```

---

## Task 7: Advanced Settings Component

**Files:**
- Create: `src/components/AdvancedSettings.vue`
- Modify: `src/App.vue`

**Step 1: Create AdvancedSettings.vue**

```vue
<template>
  <div class="advanced-settings">
    <button class="toggle" @click="isOpen = !isOpen">
      {{ isOpen ? '▼' : '▶' }} Pokrocile nastavenia
    </button>

    <div v-if="isOpen" class="settings-panel">
      <div class="settings-group">
        <h4>Nahrady</h4>
        <div class="setting">
          <label>Sadzba za km (EUR)</label>
          <input type="number" step="0.001" :value="kmRate" @input="emit('update:kmRate', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Cena paliva (EUR/L)</label>
          <input type="number" step="0.01" :value="fuelPrice" @input="emit('update:fuelPrice', Number($event.target.value))" />
        </div>
      </div>

      <div class="settings-group">
        <h4>Naklady na auto</h4>
        <div class="setting">
          <label>Cena auta s DPH (EUR)</label>
          <input type="number" step="100" :value="carPrice" @input="emit('update:carPrice', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Poistenie s DPH (EUR/rok)</label>
          <input type="number" step="10" :value="insurance" @input="emit('update:insurance', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Udrzba s DPH (EUR/rok)</label>
          <input type="number" step="10" :value="maintenance" @input="emit('update:maintenance', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Spotreba (L/100km)</label>
          <input type="number" step="0.1" :value="fuelConsumption" @input="emit('update:fuelConsumption', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Uprava spotreby (%)</label>
          <input type="number" step="1" :value="consumptionAdjustment * 100" @input="emit('update:consumptionAdjustment', Number($event.target.value) / 100)" />
        </div>
      </div>

      <div class="settings-group">
        <h4>Dane</h4>
        <div class="setting">
          <label>DPH (%)</label>
          <input type="number" step="1" :value="vatRate * 100" @input="emit('update:vatRate', Number($event.target.value) / 100)" />
        </div>
        <div class="setting">
          <label>Dan z prijmu firmy (%)</label>
          <input type="number" step="1" :value="companyTax * 100" @input="emit('update:companyTax', Number($event.target.value) / 100)" />
        </div>
        <div class="setting">
          <label>Dan z dividend (%)</label>
          <input type="number" step="1" :value="dividendTax * 100" @input="emit('update:dividendTax', Number($event.target.value) / 100)" />
        </div>
        <div class="setting">
          <label>Odpisy (%/rok)</label>
          <input type="number" step="1" :value="depreciationRate * 100" @input="emit('update:depreciationRate', Number($event.target.value) / 100)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

defineProps({
  kmRate: Number,
  fuelPrice: Number,
  carPrice: Number,
  insurance: Number,
  maintenance: Number,
  fuelConsumption: Number,
  consumptionAdjustment: Number,
  vatRate: Number,
  companyTax: Number,
  dividendTax: Number,
  depreciationRate: Number
})

const emit = defineEmits([
  'update:kmRate',
  'update:fuelPrice',
  'update:carPrice',
  'update:insurance',
  'update:maintenance',
  'update:fuelConsumption',
  'update:consumptionAdjustment',
  'update:vatRate',
  'update:companyTax',
  'update:dividendTax',
  'update:depreciationRate'
])
</script>

<style scoped>
.advanced-settings {
  margin-top: 32px;
}

.toggle {
  background: none;
  border: none;
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  padding: 8px 0;
}

.toggle:hover {
  color: #1e293b;
}

.settings-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.settings-group h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting {
  margin-bottom: 12px;
}

.setting label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.setting input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.setting input:focus {
  outline: none;
  border-color: #2563eb;
}
</style>
```

**Step 2: Update App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>

    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />

    <ResultsSummary
      :totalPrivate="totalPrivate"
      :totalCompany="totalCompany"
      :savings="savings"
      :cheaperOption="cheaperOption"
      :years="years"
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
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import CostChart from './components/CostChart.vue'
import AdvancedSettings from './components/AdvancedSettings.vue'

const {
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
  totalPrivate,
  totalCompany,
  savings,
  cheaperOption,
  yearlyData
} = useCalculator()
</script>

<style>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 32px;
}
</style>
```

**Step 3: Verify advanced settings work**

Run:
```bash
npm run dev
```

Expected: Collapsible panel opens, changing values updates calculations.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add AdvancedSettings component with all configurable parameters"
```

---

## Task 8: Final Polish and Build

**Files:**
- Modify: `src/App.vue` (minor styling)
- Modify: `vite.config.js` (if needed for GitHub Pages)

**Step 1: Add responsive styles to App.vue**

```vue
<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>
    <p class="subtitle">Porovnanie nakladov na auto z pohladu majitela firmy</p>

    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />

    <ResultsSummary
      :totalPrivate="totalPrivate"
      :totalCompany="totalCompany"
      :savings="savings"
      :cheaperOption="cheaperOption"
      :years="years"
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
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import CostChart from './components/CostChart.vue'
import AdvancedSettings from './components/AdvancedSettings.vue'

const {
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
  totalPrivate,
  totalCompany,
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

**Step 2: Build the project**

Run:
```bash
npm run build
```

Expected: Build succeeds, `/dist` folder created.

**Step 3: Preview the build**

Run:
```bash
npm run preview
```

Expected: Production build works correctly.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: final polish with responsive styles and subtitle"
```

---

## Task 9: GitHub Pages Deployment Setup

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create GitHub Actions workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Step 2: Commit**

```bash
git add .
git commit -m "ci: add GitHub Actions workflow for Pages deployment"
```

**Step 3: Enable GitHub Pages**

Manual step: In GitHub repo settings, enable Pages with "GitHub Actions" as source.

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Project setup (Vue 3 + Vite) |
| 2 | Calculator logic (useCalculator composable) |
| 3 | Kilometers slider component |
| 4 | Years input component |
| 5 | Results summary component |
| 6 | Cost chart component (Chart.js) |
| 7 | Advanced settings component |
| 8 | Final polish and build |
| 9 | GitHub Pages deployment |
