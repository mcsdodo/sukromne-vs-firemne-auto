<template>
  <div class="results-summary">
    <div class="cards">
      <!-- Private Car Card -->
      <div class="card" :class="{ winner: cheaperOption === 'private' }">
        <h3>Sukromne auto</h3>
        <div class="breakdown">
          <div class="row">
            <span>Prijem firmy</span>
            <span>{{ formatCurrency(annualIncome) }}</span>
          </div>
          <div class="row deduction">
            <span>- Nahrady</span>
            <span>- {{ formatCurrency(privateScenario.reimbursements) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zdanitelny zisk</span>
            <span>{{ formatCurrency(privateScenario.taxableProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z prijmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(privateScenario.companyTaxAmount) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zisk po dani</span>
            <span>{{ formatCurrency(privateScenario.afterTaxProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(privateScenario.dividendTaxAmount) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Dividendy</span>
            <span>{{ formatCurrency(privateScenario.dividends) }}</span>
          </div>
          <div class="row addition">
            <span>+ Nahrady</span>
            <span>+ {{ formatCurrency(privateScenario.reimbursements) }}</span>
          </div>
          <div class="row highlight">
            <span>= Rocne v hotovosti</span>
            <span>{{ formatCurrency(privateScenario.annualCash) }}</span>
          </div>
        </div>

        <div class="multi-year">
          <div class="row">
            <span>Za {{ years }} {{ yearsLabel }}</span>
            <span>{{ formatCurrency(privateScenario.totalCashOverYears) }}</span>
          </div>
          <div class="row deduction">
            <span>- Kupa auta <span v-if="isProportionalCost" class="note">{{ proportionalNote }}</span></span>
            <span>- {{ formatCurrency(privateScenario.personalCarPurchase) }}</span>
          </div>
          <div class="row deduction">
            <span>- Prevadzkove naklady</span>
            <span>- {{ formatCurrency(privateScenario.personalRunningCosts) }}</span>
          </div>
        </div>

        <div class="total">
          <span>CISTY VYNOS</span>
          <span>{{ formatCurrency(privateScenario.netToOwner) }}</span>
        </div>
      </div>

      <!-- Company Car Card -->
      <div class="card" :class="{ winner: cheaperOption === 'company' }">
        <h3>Firemne auto</h3>
        <div class="breakdown">
          <div class="row">
            <span>Prijem firmy</span>
            <span>{{ formatCurrency(annualIncome) }}</span>
          </div>
          <div class="row deduction">
            <span>- Naklady auta</span>
            <span>- {{ formatCurrency(companyScenario.carCosts) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zdanitelny zisk</span>
            <span>{{ formatCurrency(companyScenario.taxableProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z prijmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(companyScenario.companyTaxAmount) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Zisk po dani</span>
            <span>{{ formatCurrency(companyScenario.afterTaxProfit) }}</span>
          </div>
          <div class="row deduction">
            <span>- Dan z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(companyScenario.dividendTaxAmount) }}</span>
          </div>
          <div class="row highlight">
            <span>= Rocne v hotovosti</span>
            <span>{{ formatCurrency(companyScenario.annualCash) }}</span>
          </div>
        </div>

        <div class="multi-year">
          <div class="row">
            <span>Za {{ years }} {{ yearsLabel }}</span>
            <span>{{ formatCurrency(companyScenario.totalCashOverYears) }}</span>
          </div>
          <div class="row">
            <span>- Osobne naklady</span>
            <span>{{ formatCurrency(0) }}</span>
          </div>
        </div>

        <div class="total">
          <span>CISTY VYNOS</span>
          <span>{{ formatCurrency(companyScenario.netToOwner) }}</span>
        </div>
      </div>
    </div>

    <div class="verdict">
      <template v-if="savings > 0">
        <strong>Firemne auto</strong> usetri
        <strong>{{ formatCurrency(savings) }}</strong>
        za {{ years }} {{ yearsLabel }}
      </template>
      <template v-else-if="savings < 0">
        <strong>Sukromne auto</strong> usetri
        <strong>{{ formatCurrency(Math.abs(savings)) }}</strong>
        za {{ years }} {{ yearsLabel }}
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
  annualIncome: { type: Number, required: true },
  privateScenario: { type: Object, required: true },
  companyScenario: { type: Object, required: true },
  savings: { type: Number, required: true },
  cheaperOption: { type: String, required: true },
  years: { type: Number, required: true },
  depreciationYears: { type: Number, required: true },
  carPrice: { type: Number, required: true },
  companyTaxRate: { type: Number, required: true },
  dividendTaxRate: { type: Number, required: true }
})

const formatCurrency = (value) => {
  return value.toLocaleString('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const isProportionalCost = computed(() => props.years < props.depreciationYears)
const proportionalNote = computed(() => {
  if (!isProportionalCost.value) return ''
  return `(${props.years}/${props.depreciationYears} z ${formatCurrency(props.carPrice)})`
})

const yearsLabel = computed(() => {
  if (props.years === 1) return 'rok'
  if (props.years >= 2 && props.years <= 4) return 'roky'
  return 'rokov'
})
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

@media (max-width: 800px) {
  .cards {
    grid-template-columns: 1fr;
  }
}

.card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.card.winner {
  background: #ecfdf5;
  border-color: #10b981;
}

.card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #1e293b;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.breakdown {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
  color: #475569;
}

.row.deduction {
  color: #dc2626;
}

.row.addition {
  color: #16a34a;
}

.row.subtotal {
  font-weight: 500;
  color: #1e293b;
}

.row.highlight {
  font-weight: 600;
  color: #1e293b;
  background: #e2e8f0;
  margin: 8px -8px 0;
  padding: 8px;
  border-radius: 4px;
}

.multi-year {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  padding: 8px;
  background: #e2e8f0;
  border-radius: 6px;
}

.card.winner .total {
  background: #10b981;
  color: white;
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

.note {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
}
</style>
