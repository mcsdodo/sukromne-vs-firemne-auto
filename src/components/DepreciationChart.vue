<template>
  <div class="depreciation-chart">
    <div class="chart-header">
      <label class="chart-label">Zostatková hodnota auta</label>
      <button class="reset-btn" @click="resetToDefaults">Reset</button>
    </div>
    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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

const DEFAULT_CURVE = [0.80, 0.65, 0.55, 0.48, 0.42, 0.37, 0.33, 0.30]

const resetToDefaults = () => {
  emit('update:modelValue', [...DEFAULT_CURVE])
}

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
        stepSize: 20,
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
        const curve = props.modelValue
        const prevValue = index > 0 ? curve[index - 1] * 100 : 100
        const currentValue = curve[index] * 100

        // Enforce max constraint (can't go above previous year)
        const clamped = Math.min(prevValue - 1, Math.max(1, value))

        // Calculate the change amount
        const delta = clamped - currentValue

        const newCurve = [...props.modelValue]
        newCurve[index] = clamped / 100

        // If dragging down, cascade the change to all subsequent years
        if (delta < 0) {
          for (let i = index + 1; i < newCurve.length; i++) {
            const newVal = (newCurve[i] * 100 + delta) / 100
            // Ensure minimum of 1% and must be less than previous year
            newCurve[i] = Math.max(0.01, Math.min(newCurve[i - 1] - 0.01, newVal))
          }
        }

        emit('update:modelValue', newCurve)
      }
    }
  },
  interaction: {
    intersect: true,
    mode: 'point'
  },
  onHover: (event, elements) => {
    if (event.native?.target) {
      event.native.target.style.cursor = elements.length ? 'grab' : 'default'
    }
  }
}))
</script>

<style scoped>
.depreciation-chart {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-label {
  font-weight: 500;
}

.reset-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: #64748b;
  background: #e2e8f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #cbd5e1;
  color: #1e293b;
}

.chart-container {
  height: 200px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}
</style>
