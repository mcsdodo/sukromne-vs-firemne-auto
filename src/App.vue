<template>
  <div class="app">
    <h1>Sukromne vs Firemne Auto</h1>
    <p class="subtitle">Porovnanie nakladov na auto z pohladu majitela firmy</p>

    <IncomeInput v-model="annualIncome" />
    <KmSlider v-model="kmPerYear" />
    <DepreciationInput v-model="depreciationYears" />
    <YearsInput v-model="years" />

    <ResultsSummary
      :annualIncome="annualIncome"
      :privateScenario="privateScenario"
      :companyScenario="companyScenario"
      :savings="savings"
      :cheaperOption="cheaperOption"
      :years="years"
      :depreciationYears="depreciationYears"
      :carPrice="carPrice"
      :companyTaxRate="companyTax"
      :dividendTaxRate="dividendTax"
    />

    <CostChart :yearlyData="yearlyData" />

    <AdvancedSettings
      v-model:annualIncome="annualIncome"
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
    />
  </div>
</template>

<script setup>
import { useCalculator } from './composables/useCalculator'
import IncomeInput from './components/IncomeInput.vue'
import KmSlider from './components/KmSlider.vue'
import DepreciationInput from './components/DepreciationInput.vue'
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
  depreciationYears,
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
