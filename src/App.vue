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
