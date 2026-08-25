<template>
  <div class="card" :class="{ winner: winner }">
    <h3>{{ title }}</h3>
    <div class="annual-section">
      <div class="breakdown">
        <div class="row">
          <span>Príjem firmy</span>
          <span>{{ formatCurrency(annualIncome) }}</span>
        </div>
        <div class="row deduction">
          <span>- Náklady auta</span>
          <span>- {{ formatCurrency(scenario.carCosts) }}</span>
        </div>
        <div class="cost-breakdown">
          <span v-if="scenario.taxPercent < 1">
            odpisy (({{ formatCurrency(carPrice) }} − {{ Math.round(scenario.vatPercent*100) }}% odpočet DPH) ÷ {{ Math.min(years, 4) }}r) × {{ Math.round(scenario.taxPercent*100) }}% = {{ formatCurrency(scenario.annualWriteOff) }}
          </span>
          <span v-else>odpisy ({{ formatCurrency(carPrice) }} − DPH) ÷ {{ Math.min(years, 4) }}r = {{ formatCurrency(scenario.annualWriteOff) }}</span>
        </div>
        <div class="cost-breakdown">
          <span>poistenie {{ formatCurrency(scenario.annualCostBreakdown.insurance) }}</span>
          <span>údržba {{ formatCurrency(scenario.annualCostBreakdown.maintenance) }}</span>
          <span>palivo {{ formatCurrency(scenario.annualCostBreakdown.fuel) }}</span>
        </div>
        <div class="cost-breakdown net-note">
          <em>pozn.: čistá cena auta po DPH a odpisoch: {{ formatCurrency(scenario.netCarCost) }}</em>
        </div>
        <div class="row subtotal">
          <span>= Zdaniteľný zisk</span>
          <span>{{ formatCurrency(scenario.taxableProfit) }}</span>
        </div>
        <div class="row deduction">
          <span>- Daň z príjmu ({{ Math.round(companyTaxRate * 100) }}%)</span>
          <span>- {{ formatCurrency(scenario.companyTaxAmount) }}</span>
        </div>
        <div class="row subtotal">
          <span>= Zisk po dani</span>
          <span>{{ formatCurrency(scenario.afterTaxProfit) }}</span>
        </div>
        <div class="row deduction">
          <span>- Daň z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
          <span>- {{ formatCurrency(scenario.dividendTaxAmount) }}</span>
        </div>
        <div class="row subtotal">
          <span>= Dividendy</span>
          <span>{{ formatCurrency(scenario.dividends) }}</span>
        </div>
        <div class="row deduction" v-if="scenario.ownerPersonalTaxYear1">
          <span>- Nepeňažný príjem 1% (daň {{ Math.round(scenario.personalIncomeTaxRate * 100) }}%)</span>
          <span>- {{ formatCurrency(scenario.ownerPersonalTaxYear1) }}</span>
        </div>
        <div class="cost-breakdown net-note" v-if="scenario.ownerPersonalTaxYear1">
          <em>pozn.: predpoklad = žiadna mzda, len dividendy (inak by pribudli odvody, cca 14-36%)</em>
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
      <span>{{ formatCurrency(scenario.annualCash) }}</span>
    </div>

    <div class="multi-year">
      <div class="row">
        <span>Za {{ years }} {{ yearsLabel }}</span>
        <span>{{ formatCurrency(scenario.totalCashOverYears) }}</span>
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
        <span>+ {{ formatCurrency(scenario.salePrice) }}</span>
      </div>
      <div class="row deduction">
        <span>- DPH z predaja ({{ Math.round(vatRate * 100) }}%)</span>
        <span>- {{ formatCurrency(scenario.saleVat) }}</span>
      </div>
      <div class="row subtotal">
        <span>= Príjem bez DPH</span>
        <span>{{ formatCurrency(scenario.salePriceAfterVat) }}</span>
      </div>
      <div class="row deduction">
        <span>- Daň z predaja ({{ Math.round(companyTaxRate * 100) }}%)</span>
        <span>- {{ formatCurrency(scenario.saleTax) }}</span>
      </div>
      <div class="row subtotal">
        <span>= Čistý príjem z predaja</span>
        <span>{{ formatCurrency(scenario.netSaleIncome) }}</span>
      </div>
      <div class="row deduction">
        <span>- Daň z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
        <span>- {{ formatCurrency(scenario.netSaleIncome * dividendTaxRate) }}</span>
      </div>
      <div class="row subtotal">
        <span>= Príjem majiteľa z predaja</span>
        <span>{{ formatCurrency(scenario.saleIncomeAfterDividendTax) }}</span>
      </div>
      <div class="row addition" v-if="scenario.saleVatRefund > 0">
        <span>+ Vratka DPH (§54)</span>
        <span>+ {{ formatCurrency(scenario.saleVatRefund) }}</span>
      </div>
    </div>

    <div class="total">
      <span>ČISTÝ VÝNOS</span>
      <span>{{ formatCurrency(scenario.netToOwner) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scenario: { type: Object, required: true },
  title: { type: String, required: true },
  winner: { type: Boolean, required: true },
  annualIncome: { type: Number, required: true },
  years: { type: Number, required: true },
  companyTaxRate: { type: Number, required: true },
  dividendTaxRate: { type: Number, required: true },
  vatRate: { type: Number, required: true },
  carPrice: { type: Number, required: true }
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
</script>

<style scoped>
.placeholder {
  visibility: hidden;
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
