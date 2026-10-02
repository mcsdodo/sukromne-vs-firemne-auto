<template>
  <div class="results-summary">
    <div class="cards">
      <!-- Private Car Card -->
      <div class="card" :class="{ winner: bestOption === 'private' }" :style="{ order: rank.private }">
        <h3>Súkromné auto</h3>
        <div class="annual-section">
          <div class="breakdown">
            <div class="row">
              <span>Príjem firmy</span>
              <span>{{ formatCurrency(annualIncome) }}</span>
            </div>
            <div class="row deduction">
              <span>- Náhrady</span>
              <span>- {{ formatCurrency(privateScenario.reimbursements) }}</span>
            </div>
            <div class="cost-breakdown">
              <span>km {{ formatCurrency(privateScenario.kmReimbursement) }}</span>
              <span>palivo {{ formatCurrency(privateScenario.fuelReimbursement) }}</span>
            </div>
            <div class="cost-breakdown placeholder">
              <span>poistenie 0 €</span>
              <span>údržba 0 €</span>
              <span>palivo 0 €</span>
            </div>
            <div class="cost-breakdown net-note placeholder">
              <em>pozn.: placeholder</em>
            </div>
            <div class="row subtotal">
              <span>= Zdaniteľný zisk</span>
              <span>{{ formatCurrency(privateScenario.taxableProfit) }}</span>
            </div>
            <div class="row deduction">
              <span>- Daň z príjmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
              <span>- {{ formatCurrency(privateScenario.companyTaxAmount) }}</span>
            </div>
            <div class="row subtotal">
              <span>= Zisk po dani</span>
              <span>{{ formatCurrency(privateScenario.afterTaxProfit) }}</span>
            </div>
            <div class="row deduction">
              <span>- Daň z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
              <span>- {{ formatCurrency(privateScenario.dividendTaxAmount) }}</span>
            </div>
            <div class="row subtotal">
              <span>= Dividendy</span>
              <span>{{ formatCurrency(privateScenario.dividends) }}</span>
            </div>
            <div class="row addition">
              <span>+ Náhrady</span>
              <span>+ {{ formatCurrency(privateScenario.reimbursements) }}</span>
            </div>
            <div class="cost-breakdown">
              <span>km {{ formatCurrency(privateScenario.kmReimbursement) }}</span>
              <span>palivo {{ formatCurrency(privateScenario.fuelReimbursement) }}</span>
            </div>
          </div>
        </div>

        <div class="row highlight">
          <span>= Ročne v čistom</span>
          <span>{{ formatCurrency(privateScenario.annualCash) }}</span>
        </div>

        <div class="multi-year">
          <div class="row">
            <span>Za {{ years }} {{ yearsLabel }}</span>
            <span>{{ formatCurrency(privateScenario.totalCashOverYears) }}</span>
          </div>
          <div class="row deduction">
            <span>- Náklady na auto</span>
            <span>- {{ formatCurrency(privateScenario.personalCarPurchase + privateScenario.personalRunningCosts) }}</span>
          </div>
          <div class="cost-breakdown">
            <span>cena auta {{ formatCurrency(privateScenario.costBreakdown.depreciation) }}</span>
            <span>poistenie {{ formatCurrency(privateScenario.costBreakdown.insurance) }}</span>
            <span>údržba {{ formatCurrency(privateScenario.costBreakdown.maintenance) }}</span>
            <span>palivo {{ formatCurrency(privateScenario.costBreakdown.fuel) }}</span>
          </div>
        </div>

        <div class="sale-section">
          <div class="row addition">
            <span>+ Predaj auta</span>
            <span>+ {{ formatCurrency(privateScenario.salePrice) }}</span>
          </div>
          <div class="row deduction placeholder">
            <span>- Daň z predaja</span>
            <span>- 0 €</span>
          </div>
          <div class="row subtotal placeholder">
            <span>= Čistý príjem z predaja</span>
            <span>0 €</span>
          </div>
          <div class="row deduction placeholder">
            <span>- Daň z dividend</span>
            <span>- 0 €</span>
          </div>
          <div class="row subtotal placeholder">
            <span>= Príjem majiteľa z predaja</span>
            <span>0 €</span>
          </div>
        </div>

        <div class="total">
          <span>ČISTÝ VÝNOS</span>
          <span class="total-value">
            {{ formatCurrency(privateScenario.netToOwner) }}
            <span class="delta" :class="{ negative: delta.private < 0 }">{{ formatDelta(delta.private) }}</span>
          </span>
        </div>
      </div>

      <!-- Company Car Card (100%) -->
      <CompanyStyleCard
        title="Firemné auto (100%)"
        :scenario="companyScenario"
        :winner="bestOption === 'company'"
        :style="{ order: rank.company }"
        :delta="delta.company"
        :annualIncome="annualIncome"
        :years="years"
        :companyTaxRate="companyTaxRate"
        :dividendTaxRate="dividendTaxRate"
        :vatRate="vatRate"
        :carPrice="carPrice"
      />

      <!-- Paušál Card (50/80) -->
      <CompanyStyleCard
        title="Paušál (50% DPH / 80% daň)"
        :scenario="pausalScenario"
        :winner="bestOption === 'pausal'"
        :style="{ order: rank.pausal }"
        :delta="delta.pausal"
        :annualIncome="annualIncome"
        :years="years"
        :companyTaxRate="companyTaxRate"
        :dividendTaxRate="dividendTaxRate"
        :vatRate="vatRate"
        :carPrice="carPrice"
      />

      <!-- Paušál Card (50/100 + 1% zdanené) -->
      <CompanyStyleCard
        title="Paušál (50% DPH / 100% daň + 1%)"
        :scenario="pausalTaxedScenario"
        :winner="bestOption === 'pausalTaxed'"
        :style="{ order: rank.pausalTaxed }"
        :delta="delta.pausalTaxed"
        :annualIncome="annualIncome"
        :years="years"
        :companyTaxRate="companyTaxRate"
        :dividendTaxRate="dividendTaxRate"
        :vatRate="vatRate"
        :carPrice="carPrice"
      />
    </div>

    <div class="verdict">
      <strong>{{ bestLabel }}</strong> je najvýhodnejšie — o
      <strong>{{ formatCurrency(savings) }}</strong>
      oproti druhej najlepšej možnosti za {{ years }} {{ yearsLabel }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CompanyStyleCard from './CompanyStyleCard.vue'

const props = defineProps({
  annualIncome: { type: Number, required: true },
  privateScenario: { type: Object, required: true },
  companyScenario: { type: Object, required: true },
  pausalScenario: { type: Object, required: true },
  pausalTaxedScenario: { type: Object, required: true },
  savings: { type: Number, required: true },
  bestOption: { type: String, required: true },
  years: { type: Number, required: true },
  companyTaxRate: { type: Number, required: true },
  dividendTaxRate: { type: Number, required: true },
  carPrice: { type: Number, required: true },
  vatRate: { type: Number, required: true }
})

const formatCurrency = (value) => {
  return value.toLocaleString('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const yearsLabel = computed(() => {
  if (props.years === 1) return 'rok'
  if (props.years >= 2 && props.years <= 4) return 'roky'
  return 'rokov'
})

const nets = computed(() => ({
  private: props.privateScenario.netToOwner,
  company: props.companyScenario.netToOwner,
  pausal: props.pausalScenario.netToOwner,
  pausalTaxed: props.pausalTaxedScenario.netToOwner
}))
const sortedKeys = computed(() => Object.keys(nets.value).sort((a, b) => nets.value[b] - nets.value[a]))

// Visual position of each card: most economical (highest netToOwner) first, left to right
const rank = computed(() => Object.fromEntries(sortedKeys.value.map((key, i) => [key, i])))

// ČISTÝ VÝNOS delta: best card shows its lead over the 2nd, the others their gap to the best
const delta = computed(() => {
  const [best, second] = sortedKeys.value
  return Object.fromEntries(sortedKeys.value.map(key => [key,
    key === best ? nets.value[best] - nets.value[second] : nets.value[key] - nets.value[best]]))
})

const formatDelta = (value) => (value < 0 ? '-' : '+') + formatCurrency(Math.abs(value))

const bestLabel = computed(() => {
  if (props.bestOption === 'private') return 'Súkromné auto'
  if (props.bestOption === 'company') return 'Firemné auto (100%)'
  if (props.bestOption === 'pausal') return 'Paušál (50/80)'
  return 'Paušál (50/100+1%)'
})
</script>

<style scoped>
.results-summary {
  margin: 32px 0;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  align-items: start;
}

@media (max-width: 1300px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .placeholder {
    display: none !important;
  }
}

.card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 20px;
}

.card.winner {
  background: #1f2937;
  border: 2px solid #10b981;
}

.card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #f1f5f9;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.annual-section {
  display: flex;
  flex-direction: column;
}


.placeholder {
  visibility: hidden;
}

.breakdown {
  border-bottom: 1px solid #374151;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
  color: #94a3b8;
}

.row.deduction {
  color: #f87171;
}

.row.addition {
  color: #4ade80;
}

.row.subtotal {
  font-weight: 500;
  color: #e2e8f0;
}

.row.highlight {
  font-weight: 600;
  color: #f9fafb;
  background: #374151;
  margin: 0 -8px 12px;
  padding: 8px;
  border-radius: 4px;
}

.multi-year {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #374151;
}

.sale-section {
  padding: 12px 0;
  border-bottom: 1px solid #374151;
  margin-bottom: 12px;
}

.total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: #f9fafb;
  padding: 8px;
  background: #374151;
  border-radius: 6px;
}

.card.winner .total {
  background: #10b981;
  color: white;
}

.total-value {
  text-align: right;
}

.delta {
  display: block;
  font-size: 12px;
  font-weight: 500;
}

.delta.negative {
  color: #f87171;
}

.verdict {
  text-align: center;
  font-size: 18px;
  color: #e5e7eb;
  padding: 16px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
}

.verdict strong {
  color: #4ade80;
}

.cost-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0 8px 0;
  font-size: 11px;
  color: #94a3b8;
}

.cost-breakdown span {
  white-space: nowrap;
}

.cost-breakdown.net-note {
  padding-top: 4px;
  margin-top: 4px;
  border-top: 1px dashed #e2e8f0;
}
</style>
