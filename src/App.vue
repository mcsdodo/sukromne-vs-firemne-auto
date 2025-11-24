<template>
  <div class="app">
    <h1>Súkromné vs Firemné Auto</h1>
    <p class="subtitle">Porovnanie nákladov na auto z pohľadu majiteľa firmy</p>

    <IncomeInput v-model="annualIncome" />
    <CarPriceInput v-model="carPrice" />
    <KmSlider v-model="kmPerYear" />
    <YearsInput v-model="years" />
    <DepreciationChart v-model="depreciationCurve" :years="years" />

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
      v-model:insurance="insurance"
      v-model:maintenance="maintenance"
      v-model:fuelConsumption="fuelConsumption"
      v-model:consumptionAdjustment="consumptionAdjustment"
      v-model:vatRate="vatRate"
      v-model:companyTax="companyTax"
      v-model:dividendTax="dividendTax"
      v-model:depreciationYears="depreciationYears"
    />
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import IncomeInput from './components/IncomeInput.vue'
import CarPriceInput from './components/CarPriceInput.vue'
import KmSlider from './components/KmSlider.vue'
import YearsInput from './components/YearsInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import CostChart from './components/CostChart.vue'
import AdvancedSettings from './components/AdvancedSettings.vue'
import DepreciationChart from './components/DepreciationChart.vue'

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
  depreciationYears,
  depreciationCurve,
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
