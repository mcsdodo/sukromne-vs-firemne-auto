<template>
  <div class="results-summary">
    <div class="cards">
      <div class="card" :class="{ winner: cheaperOption === 'private' }">
        <h3>Sukromne auto</h3>
        <p class="amount">{{ formatCurrency(totalPrivate) }}</p>
        <p class="period">za {{ years }} {{ yearsLabel }}</p>
      </div>
      <div class="card" :class="{ winner: cheaperOption === 'company' }">
        <h3>Firemne auto</h3>
        <p class="amount">{{ formatCurrency(totalCompany) }}</p>
        <p class="period">za {{ years }} {{ yearsLabel }}</p>
      </div>
    </div>
    <div class="verdict">
      <template v-if="savings > 0">
        <strong>Firemne auto</strong> usetri
        <strong>{{ formatCurrency(savings) }}</strong>
      </template>
      <template v-else-if="savings < 0">
        <strong>Sukromne auto</strong> usetri
        <strong>{{ formatCurrency(Math.abs(savings)) }}</strong>
      </template>
      <template v-else>
        Obe moznosti stoja rovnako
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalPrivate: { type: Number, required: true },
  totalCompany: { type: Number, required: true },
  savings: { type: Number, required: true },
  cheaperOption: { type: String, required: true },
  years: { type: Number, required: true }
})

const yearsLabel = computed(() => {
  if (props.years === 1) return 'rok'
  if (props.years >= 2 && props.years <= 4) return 'roky'
  return 'rokov'
})

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
.results-summary {
  margin: 32px 0;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.card.winner {
  background: #ecfdf5;
  border-color: #10b981;
}

.card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #64748b;
}

.card .amount {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card .period {
  font-size: 14px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.verdict {
  text-align: center;
  font-size: 18px;
  color: #1e293b;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 8px;
}

.verdict strong {
  color: #10b981;
}
</style>
