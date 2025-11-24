<template>
  <div class="depreciation-chart">
    <label class="chart-label">Zostatková hodnota auta</label>
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
        const curve = props.modelValue
        const prevValue = index > 0 ? curve[index - 1] * 100 : 100
        const nextValue = index < curve.length - 1 ? curve[index + 1] * 100 : 0

        // Enforce decreasing constraint (same as onDrag)
        const clamped = Math.min(prevValue - 1, Math.max(nextValue + 1, value))

        const newCurve = [...props.modelValue]
        newCurve[index] = clamped / 100
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
