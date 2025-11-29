<template>
  <div class="results-summary">
    <div class="cards">
      <!-- Private Car Card -->
      <div class="card" :class="{ winner: cheaperOption === 'private' }">
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
          <span>{{ formatCurrency(privateScenario.netToOwner) }}</span>
        </div>
      </div>

      <!-- Company Car Card -->
      <div class="card" :class="{ winner: cheaperOption === 'company' }">
        <h3>Firemné auto</h3>
        <div class="annual-section">
          <div class="breakdown">
            <div class="row">
              <span>Príjem firmy</span>
              <span>{{ formatCurrency(annualIncome) }}</span>
            </div>
            <div class="row deduction">
              <span>- Náklady auta</span>
              <span>- {{ formatCurrency(companyScenario.carCosts) }}</span>
            </div>
            <div class="cost-breakdown">
              <span v-if="is50Percent">odpisy ({{ formatCurrency(carPrice) }} − DPH) ÷ {{ Math.min(years, 4) }}r × 50% = {{ formatCurrency(annualWriteOff) }}</span>
              <span v-else>odpisy ({{ formatCurrency(carPrice) }} − DPH) ÷ {{ Math.min(years, 4) }}r = {{ formatCurrency(annualWriteOff) }}</span>
            </div>
            <div class="cost-breakdown">
              <span>poistenie {{ formatCurrency(companyScenario.annualCostBreakdown.insurance) }}</span>
              <span>údržba {{ formatCurrency(companyScenario.annualCostBreakdown.maintenance) }}</span>
              <span>palivo {{ formatCurrency(companyScenario.annualCostBreakdown.fuel) }}</span>
            </div>
            <div class="cost-breakdown net-note">
              <em>pozn.: čistá cena auta po DPH a odpisoch: {{ formatCurrency(netCarCost) }}</em>
            </div>
            <div class="row subtotal">
              <span>= Zdaniteľný zisk</span>
              <span>{{ formatCurrency(companyScenario.taxableProfit) }}</span>
            </div>
            <div class="row deduction">
              <span>- Daň z príjmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
              <span>- {{ formatCurrency(companyScenario.companyTaxAmount) }}</span>
            </div>
            <div class="row subtotal">
              <span>= Zisk po dani</span>
              <span>{{ formatCurrency(companyScenario.afterTaxProfit) }}</span>
            </div>
            <div class="row deduction">
              <span>- Daň z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
              <span>- {{ formatCurrency(companyScenario.dividendTaxAmount) }}</span>
            </div>
            <div class="row subtotal">
              <span>= Dividendy</span>
              <span>{{ formatCurrency(companyScenario.annualCash) }}</span>
            </div>
            <div class="row addition placeholder">
              <span>+ Náhrady</span>
              <span>+ 0 €</span>
            </div>
            <div class="cost-breakdown placeholder">
              <span>km 0 €</span>
              <span>palivo 0 €</span>
            </div>
          </div>

        </div>

        <div class="row highlight">
          <span>= Ročne v čistom</span>
          <span>{{ formatCurrency(companyScenario.annualCash) }}</span>
        </div>

        <div class="multi-year">
          <div class="row">
            <span>Za {{ years }} {{ yearsLabel }}</span>
            <span>{{ formatCurrency(companyScenario.totalCashOverYears) }}</span>
          </div>
          <div class="row deduction placeholder">
            <span>- Náklady na auto</span>
            <span>- 0 €</span>
          </div>
          <div class="cost-breakdown placeholder">
            <span>cena auta 0 €</span>
            <span>poistenie 0 €</span>
            <span>údržba 0 €</span>
            <span>palivo 0 €</span>
          </div>
        </div>

        <div class="sale-section">
          <div class="row addition">
            <span>+ Predaj auta</span>
            <span>+ {{ formatCurrency(companyScenario.salePrice) }}</span>
          </div>
          <div class="row deduction">
            <span>- Daň z predaja ({{ Math.round(companyTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(companyScenario.saleTax) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Čistý príjem z predaja</span>
            <span>{{ formatCurrency(companyScenario.netSaleIncome) }}</span>
          </div>
          <div class="row deduction">
            <span>- Daň z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
            <span>- {{ formatCurrency(companyScenario.netSaleIncome * dividendTaxRate) }}</span>
          </div>
          <div class="row subtotal">
            <span>= Príjem majiteľa z predaja</span>
            <span>{{ formatCurrency(companyScenario.saleIncomeAfterDividendTax) }}</span>
          </div>
        </div>

        <div class="total">
          <span>ČISTÝ VÝNOS</span>
          <span>{{ formatCurrency(companyScenario.netToOwner) }}</span>
        </div>
      </div>
    </div>

    <div class="verdict">
      <template v-if="savings > 0">
        <strong>Firemné auto</strong> ušetrí
        <strong>{{ formatCurrency(savings) }}</strong>
        za {{ years }} {{ yearsLabel }}
      </template>
      <template v-else-if="savings < 0">
        <strong>Súkromné auto</strong> ušetrí
        <strong>{{ formatCurrency(Math.abs(savings)) }}</strong>
        za {{ years }} {{ yearsLabel }}
      </template>
      <template v-else>
        Obe možnosti stoja rovnako
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
  companyTaxRate: { type: Number, required: true },
  dividendTaxRate: { type: Number, required: true },
  businessUsagePercent: { type: Number, required: true },
  carPrice: { type: Number, required: true },
  vatAmount: { type: Number, required: true },
  vatReclaim: { type: Number, required: true },
  annualWriteOffBase: { type: Number, required: true },
  annualWriteOff: { type: Number, required: true },
  totalWriteOff: { type: Number, required: true },
  netCarCost: { type: Number, required: true }
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

const is50Percent = computed(() => props.businessUsagePercent === 0.5)
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
  align-items: start;
}

@media (max-width: 800px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .placeholder {
    display: none !important;
  }
}

.card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.spacer {
  flex: 1;
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

.annual-section {
  display: flex;
  flex-direction: column;
}


.placeholder {
  visibility: hidden;
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
  margin: 0 -8px 12px;
  padding: 8px;
  border-radius: 4px;
}

.multi-year {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.sale-section {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 12px;
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

.row.subtle {
  color: #94a3b8;
  font-size: 13px;
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
