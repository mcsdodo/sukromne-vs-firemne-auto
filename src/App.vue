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
