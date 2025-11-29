<template>
  <div class="years-input">
    <label>
      <span class="label-text">Počet rokov</span>
      <span class="value">{{ modelValue }}</span>
    </label>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="1"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div class="range-labels">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 2 },
  max: { type: Number, default: 8 }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.years-input {
  margin-bottom: 24px;
}

.years-input label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
  color: #cbd5e1;
}

.years-input .value {
  font-weight: 700;
  color: #60a5fa;
}

.years-input input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #374151;
  outline: none;
  cursor: pointer;
}

.years-input input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}
</style>
