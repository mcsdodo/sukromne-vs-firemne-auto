<template>
  <div class="cost-chart">
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" :key="chartKey" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
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

// Force chart re-render on window resize to fix Chart.js not growing issue
const chartKey = ref(0)
let resizeTimeout = null

const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    chartKey.value++
  }, 100)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(resizeTimeout)
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

.chart-container {
  position: relative;
  width: 100%;
}
</style>
