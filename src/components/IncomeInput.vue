<template>
  <div class="income-input">
    <label>
      <span class="label-text">Ročný príjem firmy</span>
      <span class="value">{{ formatCurrency(modelValue) }}</span>
    </label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div class="range-labels">
      <span>{{ formatCurrency(min) }}</span>
      <span>{{ formatCurrency(max) }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 20000 },
  max: { type: Number, default: 500000 },
  step: { type: Number, default: 5000 }
})

defineEmits(['update:modelValue'])

const formatCurrency = (value) => {
  return value.toLocaleString('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}
</script>

<style scoped>
.income-input {
  margin-bottom: 24px;
}

.income-input label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
  color: #cbd5e1;
}

.income-input .value {
  font-weight: 700;
  color: #60a5fa;
}

.income-input input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #374151;
  outline: none;
  cursor: pointer;
}

.income-input input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.income-input input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}
</style>
