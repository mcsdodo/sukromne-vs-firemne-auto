# Configurable Depreciation Curve Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hard-coded linear depreciation formula with an interactive draggable chart for customizing car value depreciation per year.

**Architecture:** Add depreciationCurve ref array to useCalculator, create DepreciationChart component using Chart.js with chartjs-plugin-dragdata for draggable points, enforce decreasing value constraint on drag.

**Tech Stack:** Vue 3, Chart.js 4.x, chartjs-plugin-dragdata, vue-chartjs

---

### Task 1: Install chartjs-plugin-dragdata

**Files:**
- Modify: `package.json`

**Step 1: Install the plugin**

Run:
```bash
npm install chartjs-plugin-dragdata
```

**Step 2: Verify installation**

Run: `cat package.json | grep dragdata`
Expected: `"chartjs-plugin-dragdata": "^2.x.x"`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add chartjs-plugin-dragdata dependency"
```

---

### Task 2: Update useCalculator with depreciationCurve

**Files:**
- Modify: `src/composables/useCalculator.js`

**Step 1: Replace residualValuePercent with depreciationCurve array**

Replace lines 29-36:
```javascript
// Helper: calculate residual value (linear interpolation)
// Anchors: 2y=80%, 4y=60%, 6y=40% -> -10% per year
const residualValuePercent = computed(() => {
  const percent = 1.0 - (years.value * 0.10)
  return Math.max(0.20, Math.min(0.90, percent))  // clamp 20%-90%
})

const salePrice = computed(() => carPrice.value * residualValuePercent.value)
```

With:
```javascript
// Configurable depreciation curve (realistic defaults: steeper early, slower later)
const depreciationCurve = ref([
  0.80,  // Year 1: 80%
  0.65,  // Year 2: 65%
  0.55,  // Year 3: 55%
  0.48,  // Year 4: 48%
  0.42,  // Year 5: 42%
  0.37,  // Year 6: 37%
  0.33,  // Year 7: 33%
  0.30   // Year 8: 30%
])

// Sale price uses curve value for selected year
const salePrice = computed(() => {
  const yearIndex = years.value - 1  // 0-indexed
  const residualPercent = depreciationCurve.value[yearIndex] || 0.20
  return carPrice.value * residualPercent
})
```

**Step 2: Export depreciationCurve in return statement**

Add to return object (around line 251):
```javascript
depreciationCurve,
```

**Step 3: Verify in browser**

Run: Open http://localhost:5173
Expected: App loads without errors, calculations still work (using new default values)

**Step 4: Commit**

```bash
git add src/composables/useCalculator.js
git commit -m "feat: replace linear depreciation with configurable curve array"
```

---

### Task 3: Create DepreciationChart component

**Files:**
- Create: `src/components/DepreciationChart.vue`

**Step 1: Create the component file**

Create `src/components/DepreciationChart.vue`:

```vue
<template>
  <div class="depreciation-chart">
    <label class="chart-label">Zostatková hodnota auta</label>
    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
        ref="chartRef"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import ChartJSDragDataPlugin from 'chartjs-plugin-dragdata'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartJSDragDataPlugin
)

const props = defineProps({
  modelValue: { type: Array, required: true },
  years: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const chartRef = ref(null)

const chartData = computed(() => ({
  labels: Array.from({ length: props.years }, (_, i) => `Rok ${i + 1}`),
  datasets: [{
    label: 'Zostatková hodnota',
    data: props.modelValue.slice(0, props.years).map(v => v * 100),
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
    pointRadius: 8,
    pointHoverRadius: 12,
    pointBackgroundColor: '#2563eb',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    tension: 0.3,
    fill: false
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 100,
      title: {
        display: true,
        text: '%'
      },
      ticks: {
        callback: (value) => `${value}%`
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => `${Math.round(context.raw)}%`
      }
    },
    dragData: {
      round: 1,
      showTooltip: true,
      onDragStart: (e, datasetIndex, index, value) => {
        return true
      },
      onDrag: (e, datasetIndex, index, value) => {
        const curve = props.modelValue
        const prevValue = index > 0 ? curve[index - 1] * 100 : 100
        const nextValue = index < curve.length - 1 ? curve[index + 1] * 100 : 0

        // Enforce decreasing constraint
        const clamped = Math.min(prevValue - 1, Math.max(nextValue + 1, value))
        return clamped
      },
      onDragEnd: (e, datasetIndex, index, value) => {
        const newCurve = [...props.modelValue]
        newCurve[index] = value / 100
        emit('update:modelValue', newCurve)
      }
    }
  },
  interaction: {
    intersect: true,
    mode: 'point'
  },
  onHover: (event, elements) => {
    event.native.target.style.cursor = elements.length ? 'grab' : 'default'
  }
}))
</script>

<style scoped>
.depreciation-chart {
  margin-bottom: 24px;
}

.chart-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
}

.chart-container {
  height: 200px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}
</style>
```

**Step 2: Verify file created**

Run: `ls src/components/DepreciationChart.vue`
Expected: File exists

**Step 3: Commit**

```bash
git add src/components/DepreciationChart.vue
git commit -m "feat: add DepreciationChart component with drag support"
```

---

### Task 4: Integrate DepreciationChart into App.vue

**Files:**
- Modify: `src/App.vue`

**Step 1: Import and add component to template**

Add import after line 47:
```javascript
import DepreciationChart from './components/DepreciationChart.vue'
```

Add component to template after YearsInput (after line 9):
```html
<DepreciationChart v-model="depreciationCurve" :years="years" />
```

**Step 2: Add depreciationCurve to destructured values**

Add to the destructured return from useCalculator (around line 63):
```javascript
depreciationCurve,
```

**Step 3: Verify in browser**

Run: Open http://localhost:5173
Expected:
- Depreciation chart appears below Years slider
- Chart shows points that can be dragged
- Dragging updates calculations in real-time
- Points cannot be dragged above previous point

**Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: integrate DepreciationChart into main page"
```

---

### Task 5: Final Testing and Polish

**Files:**
- Possibly modify: `src/components/DepreciationChart.vue`

**Step 1: Test drag constraints**

Verify in browser:
- Drag Year 1 point: can go down but not above 100%
- Drag Year 4 point: can't go above Year 3 value, can't go below Year 5 value
- Drag Year 8 point: can go down to near 0% but not above Year 7

**Step 2: Test calculation updates**

Verify:
- Change Year 4 to 70%
- Check ResultsSummary "Predaj auta" shows updated sale price
- Check chart data reflects new depreciation

**Step 3: Test years synchronization**

Verify:
- Change "Years" slider from 4 to 6
- Depreciation chart should now show 6 points instead of 4
- Change back to 4, chart shows 4 points

**Step 4: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: polish depreciation chart behavior"
```

---

## Verification Checklist

- [ ] chartjs-plugin-dragdata installed
- [ ] depreciationCurve array in useCalculator with realistic defaults
- [ ] DepreciationChart component renders on main page
- [ ] Points are draggable vertically
- [ ] Constraint enforced: each year must be less than previous
- [ ] Calculations update in real-time when dragging
- [ ] Chart shows correct number of points based on years selection
- [ ] Sale price in ResultsSummary reflects curve values
