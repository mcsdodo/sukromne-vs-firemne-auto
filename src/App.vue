<template>
  <div class="app">
    <h1>Súkromné vs Firemné Auto</h1>
    <p class="subtitle">Porovnanie nákladov na auto z pohľadu majiteľa firmy</p>

    <IncomeInput v-model="annualIncome" />
    <CarPriceInput v-model="carPrice" />

    <div class="usage-toggle">
      <span class="toggle-label">Podnikateľské využitie:</span>
      <div class="toggle-buttons">
        <button :class="{ active: businessUsagePercent === 1.0 }" @click="businessUsagePercent = 1.0">100%</button>
        <button :class="{ active: businessUsagePercent === 0.5 }" @click="businessUsagePercent = 0.5">50%</button>
      </div>
    </div>

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
      :businessUsagePercent="businessUsagePercent"
      :carPrice="carPrice"
      :vatAmount="vatAmount"
      :vatReclaim="vatReclaim"
      :annualWriteOffBase="annualWriteOffBase"
      :annualWriteOff="annualWriteOff"
      :totalWriteOff="totalWriteOff"
      :netCarCost="netCarCost"
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
  businessUsagePercent,
  vatAmount,
  vatReclaim,
  annualWriteOffBase,
  annualWriteOff,
  totalWriteOff,
  netCarCost,
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
  background: #111827;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #94a3b8;
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

.usage-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1f2937;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #374151;
  margin-bottom: 16px;
}

.toggle-label {
  font-size: 14px;
  color: #cbd5e1;
  font-weight: 500;
}

.toggle-buttons {
  display: flex;
  gap: 4px;
  background: #111827;
  padding: 4px;
  border-radius: 8px;
}

.toggle-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-buttons button:hover {
  color: #f1f5f9;
}

.toggle-buttons button.active {
  background: #3b82f6;
  color: white;
}
</style>
