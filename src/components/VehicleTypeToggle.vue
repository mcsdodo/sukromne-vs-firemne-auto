<template>
  <div class="vehicle-type">
    <div class="toggle-row">
      <span class="label-text">Typ pohonu</span>
      <div class="segmented">
        <button :class="{ active: !isEv }" @click="emit('update:isEv', 0)">Spaľovací</button>
        <button :class="{ active: isEv }" @click="emit('update:isEv', 1)">Elektromobil</button>
      </div>
    </div>

    <div v-if="isEv" class="ev-inputs">
      <div class="field">
        <label>Spotreba (kWh/100km)</label>
        <input type="number" step="0.1" :value="evConsumption" @input="emit('update:evConsumption', Number($event.target.value))" />
      </div>
      <div class="field">
        <label>Domáce nabíjanie (EUR/kWh)</label>
        <input type="number" step="0.01" :value="homeChargePrice" @input="emit('update:homeChargePrice', Number($event.target.value))" />
      </div>
      <div class="field">
        <label>Verejné nabíjanie (EUR/kWh)</label>
        <input type="number" step="0.01" :value="publicChargePrice" @input="emit('update:publicChargePrice', Number($event.target.value))" />
      </div>
      <div class="field">
        <label>Podiel domáceho nabíjania (%)</label>
        <input type="number" step="5" min="0" max="100" :value="Math.round(homeChargeShare * 100)" @input="emit('update:homeChargeShare', Number($event.target.value) / 100)" />
      </div>
      <p class="note">
        Spotreba z osvedčenia o evidencii (+{{ Math.round(consumptionAdjustment * 100) }}% podľa § 7 ods. 6 písm. e) zákona o cestovných náhradách).
        Ceny s DPH. Odpisy 2 roky (odpisová skupina 0), nepeňažný príjem 0,5%.
        Firma si DPH z domáceho nabíjania neodpočíta (faktúra nie je na firmu).
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isEv: { type: Number, required: true },
  evConsumption: { type: Number, required: true },
  homeChargePrice: { type: Number, required: true },
  publicChargePrice: { type: Number, required: true },
  homeChargeShare: { type: Number, required: true },
  consumptionAdjustment: { type: Number, required: true }
})

const emit = defineEmits([
  'update:isEv',
  'update:evConsumption',
  'update:homeChargePrice',
  'update:publicChargePrice',
  'update:homeChargeShare'
])
</script>

<style scoped>
.vehicle-type {
  margin-bottom: 24px;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.label-text {
  font-weight: 500;
  color: #cbd5e1;
}

.segmented {
  display: inline-flex;
  border: 1px solid #374151;
  border-radius: 8px;
  overflow: hidden;
}

.segmented button {
  background: #1f2937;
  color: #94a3b8;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.segmented button + button {
  border-left: 1px solid #374151;
}

.segmented button.active {
  background: #3b82f6;
  color: #fff;
}

.ev-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px 16px;
  margin-top: 12px;
  padding: 16px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
}

.field label {
  display: block;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.field input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #374151;
  border-radius: 6px;
  font-size: 14px;
  background: #111827;
  color: #f9fafb;
}

.field input:focus {
  outline: none;
  border-color: #3b82f6;
}

.note {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}
</style>
