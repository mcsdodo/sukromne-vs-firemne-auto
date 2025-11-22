<template>
  <div class="km-slider">
    <label>
      <span class="label-text">Kilometre za rok</span>
      <span class="value">{{ modelValue.toLocaleString('sk-SK') }} km</span>
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
      <span>{{ min.toLocaleString('sk-SK') }}</span>
      <span>{{ max.toLocaleString('sk-SK') }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 5000 },
  max: { type: Number, default: 60000 },
  step: { type: Number, default: 1000 }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.km-slider {
  margin-bottom: 24px;
}

.km-slider label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.km-slider .value {
  font-weight: 700;
  color: #2563eb;
}

.km-slider input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.km-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
</style>
