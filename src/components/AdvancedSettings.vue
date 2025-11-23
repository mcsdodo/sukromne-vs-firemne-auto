<template>
  <div class="advanced-settings">
    <button class="toggle" @click="isOpen = !isOpen">
      {{ isOpen ? '▼' : '▶' }} Pokročilé nastavenia
    </button>

    <div v-if="isOpen" class="settings-panel">
      <div class="settings-group">
        <h4>Príjem</h4>
        <div class="setting">
          <label>Ročný príjem firmy (EUR)</label>
          <input type="number" step="1000" :value="annualIncome" @input="emit('update:annualIncome', Number($event.target.value))" />
        </div>
      </div>

      <div class="settings-group">
        <h4>Náhrady</h4>
        <div class="setting">
          <label>Sadzba za km (EUR)</label>
          <input type="number" step="0.001" :value="kmRate" @input="emit('update:kmRate', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Cena paliva (EUR/L)</label>
          <input type="number" step="0.01" :value="fuelPrice" @input="emit('update:fuelPrice', Number($event.target.value))" />
        </div>
      </div>

      <div class="settings-group">
        <h4>Náklady na auto</h4>
        <div class="setting">
          <label>Cena auta s DPH (EUR)</label>
          <input type="number" step="100" :value="carPrice" @input="emit('update:carPrice', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Poistenie (EUR/rok)</label>
          <input type="number" step="10" :value="insurance" @input="emit('update:insurance', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Údržba s DPH (EUR/rok)</label>
          <input type="number" step="10" :value="maintenance" @input="emit('update:maintenance', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Spotreba (L/100km)</label>
          <input type="number" step="0.1" :value="fuelConsumption" @input="emit('update:fuelConsumption', Number($event.target.value))" />
        </div>
        <div class="setting">
          <label>Úprava spotreby (%)</label>
          <input type="number" step="1" :value="Math.round(consumptionAdjustment * 100)" @input="emit('update:consumptionAdjustment', Number($event.target.value) / 100)" />
        </div>
      </div>

      <div class="settings-group">
        <h4>Dane</h4>
        <div class="setting">
          <label>DPH (%)</label>
          <input type="number" step="1" :value="Math.round(vatRate * 100)" @input="emit('update:vatRate', Number($event.target.value) / 100)" />
        </div>
        <div class="setting">
          <label>Daň z príjmu firmy (%)</label>
          <input type="number" step="1" :value="Math.round(companyTax * 100)" @input="emit('update:companyTax', Number($event.target.value) / 100)" />
        </div>
        <div class="setting">
          <label>Daň z dividend (%)</label>
          <input type="number" step="1" :value="Math.round(dividendTax * 100)" @input="emit('update:dividendTax', Number($event.target.value) / 100)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

defineProps({
  annualIncome: Number,
  kmRate: Number,
  fuelPrice: Number,
  carPrice: Number,
  insurance: Number,
  maintenance: Number,
  fuelConsumption: Number,
  consumptionAdjustment: Number,
  vatRate: Number,
  companyTax: Number,
  dividendTax: Number
})

const emit = defineEmits([
  'update:annualIncome',
  'update:kmRate',
  'update:fuelPrice',
  'update:carPrice',
  'update:insurance',
  'update:maintenance',
  'update:fuelConsumption',
  'update:consumptionAdjustment',
  'update:vatRate',
  'update:companyTax',
  'update:dividendTax'
])
</script>

<style scoped>
.advanced-settings {
  margin-top: 32px;
}

.toggle {
  background: none;
  border: none;
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  padding: 8px 0;
}

.toggle:hover {
  color: #1e293b;
}

.settings-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.settings-group h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting {
  margin-bottom: 12px;
}

.setting label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.setting input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.setting input:focus {
  outline: none;
  border-color: #2563eb;
}
</style>
