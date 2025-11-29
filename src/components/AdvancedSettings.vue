<template>
  <div class="advanced-settings">
    <button class="toggle" @click="isOpen = !isOpen">
      {{ isOpen ? '▼' : '▶' }} Pokročilé nastavenia
    </button>

    <div v-if="isOpen" class="settings-panel">
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
        <div class="setting">
          <label>Odpisy (roky)</label>
          <select :value="depreciationYears" @change="emit('update:depreciationYears', Number($event.target.value))">
            <option :value="2">2 roky (EV)</option>
            <option :value="4">4 roky (ICE)</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

defineProps({
  kmRate: Number,
  fuelPrice: Number,
  insurance: Number,
  maintenance: Number,
  fuelConsumption: Number,
  consumptionAdjustment: Number,
  vatRate: Number,
  companyTax: Number,
  dividendTax: Number,
  depreciationYears: Number
})

const emit = defineEmits([
  'update:kmRate',
  'update:fuelPrice',
  'update:insurance',
  'update:maintenance',
  'update:fuelConsumption',
  'update:consumptionAdjustment',
  'update:vatRate',
  'update:companyTax',
  'update:dividendTax',
  'update:depreciationYears'
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
  color: #94a3b8;
  cursor: pointer;
  padding: 8px 0;
}

.toggle:hover {
  color: #f1f5f9;
}

.settings-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 16px;
  padding: 24px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
}

.settings-group h4 {
  margin: 0 0 16px 0;
  color: #f1f5f9;
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
  color: #94a3b8;
  margin-bottom: 4px;
}

.setting input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 6px;
  font-size: 14px;
  background: #111827;
  color: #f9fafb;
}

.setting input:focus {
  outline: none;
  border-color: #3b82f6;
}

.setting select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 6px;
  font-size: 14px;
  background: #111827;
  color: #f9fafb;
  cursor: pointer;
}

.setting select:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>
