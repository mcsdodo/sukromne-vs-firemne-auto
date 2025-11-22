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
