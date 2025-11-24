<template>
  <div class="depreciation-input">
    <label>
      <span class="label-text">Odpisy (roky)</span>
      <span class="value">{{ modelValue }}</span>
    </label>
    <input
      type="range"
      :min="2"
      :max="8"
      :step="1"
      :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
    <div class="range-labels">
      <span>2</span>
      <span>8</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.depreciation-input {
  margin-bottom: 24px;
}

.depreciation-input label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.depreciation-input .value {
  font-weight: 700;
  color: #2563eb;
}

.depreciation-input input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.depreciation-input input[type="range"]::-webkit-slider-thumb {
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
