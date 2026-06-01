import { ref, computed } from 'vue'

export function useCalculator() {
  // Primary inputs
  const annualIncome = ref(100000)
  const kmPerYear = ref(25000)
  const years = ref(4)

  // Reimbursement rates
  const kmRate = ref(0.313)
  const fuelPrice = ref(1.5)

  // Car costs (with VAT where applicable)
  const carPrice = ref(50000)
  const insurance = ref(1500)  // NO VAT on insurance
  const maintenance = ref(600)  // with VAT
  const fuelConsumption = ref(5.1)
  const consumptionAdjustment = ref(0.10)

  // Tax rates
  const vatRate = ref(0.23)
  const companyTaxLow = ref(0.10)
  const companyTaxHigh = ref(0.21)
  const companyTax = computed(() => annualIncome.value > 100000 ? companyTaxHigh.value : companyTaxLow.value)
  const dividendTax = ref(0.07)
  const depreciationYears = ref(4)

  const VAT_ADJUSTMENT_YEARS = 5  // statutory §54 VAT-adjustment window

  // Helper: remove VAT
  const withoutVat = (amount) => amount / (1 + vatRate.value)

  // Configurable depreciation curve (realistic defaults: steeper early, slower later)
  const depreciationCurve = ref([
    0.80,  // Year 1: 80%
    0.65,  // Year 2: 65%
    0.55,  // Year 3: 55%
    0.48,  // Year 4: 48%
    0.42,  // Year 5: 42%
    0.37,  // Year 6: 37%
    0.33,  // Year 7: 33%
    0.30   // Year 8: 30%
  ])

  // Sale price uses curve value for selected year
  const salePrice = computed(() => {
    const yearIndex = years.value - 1  // 0-indexed
    const residualPercent = depreciationCurve.value[yearIndex] || 0.20
    return carPrice.value * residualPercent
  })

  // VAT breakdown (for display)
  const carPriceNoVat = computed(() => withoutVat(carPrice.value))
  const vatAmount = computed(() => carPrice.value - carPriceNoVat.value)

  // Helper: calculate fuel cost
  const fuelCost = computed(() => {
    const adjustedConsumption = fuelConsumption.value * (1 + consumptionAdjustment.value)
    const litersUsed = (kmPerYear.value / 100) * adjustedConsumption
    return litersUsed * fuelPrice.value
  })

  // ============ PRIVATE CAR SCENARIO ============
  const privateScenario = computed(() => {
    // Annual reimbursements from company
    const kmReimbursement = kmPerYear.value * kmRate.value
    const fuelReimbursement = fuelCost.value
    const totalReimbursements = kmReimbursement + fuelReimbursement

    // Company financials (annual)
    const taxableProfit = annualIncome.value - totalReimbursements
    const companyTaxAmount = taxableProfit * companyTax.value
    const afterTaxProfit = taxableProfit - companyTaxAmount
    const dividendTaxAmount = afterTaxProfit * dividendTax.value
    const dividends = afterTaxProfit - dividendTaxAmount
    const annualCash = dividends + totalReimbursements

    // Personal car costs (paid from dividends, over full period)
    // Full car price - depreciation is a tax concept, doesn't apply to private ownership
    const personalCarPurchase = carPrice.value
    const personalInsurance = insurance.value * years.value  // no VAT on insurance
    const personalMaintenance = maintenance.value * years.value  // with VAT
    const personalFuel = fuelCost.value * years.value  // with VAT
    const personalRunningCosts = personalInsurance + personalMaintenance + personalFuel

    // Multi-year totals
    const totalCashOverYears = annualCash * years.value

    // Sale income (private owner gets full amount, no corporate taxes)
    const saleIncome = salePrice.value

    // Net to owner now includes sale income
    const netToOwner = totalCashOverYears - personalCarPurchase - personalRunningCosts + saleIncome

    return {
      // Annual breakdown
      reimbursements: totalReimbursements,
      kmReimbursement,
      fuelReimbursement,
      taxableProfit,
      companyTaxAmount,
      afterTaxProfit,
      dividendTaxAmount,
      dividends,
      annualCash,
      // Multi-year
      totalCashOverYears,
      personalCarPurchase,
      personalRunningCosts,
      netToOwner,
      // Sale data
      salePrice: salePrice.value,
      saleIncome,
      // Cost breakdown (for display)
      costBreakdown: {
        depreciation: personalCarPurchase,
        insurance: personalInsurance,
        maintenance: personalMaintenance,
        fuel: personalFuel
      }
    }
  })

  // ============ COMPANY-STYLE SCENARIO FACTORY ============
  // vatPercent: share of input VAT recoverable (1.0 = full / logbook, 0.5 = paušál)
  // taxPercent: share of costs deductible from income tax (1.0 = full, 0.8 = paušál)
  function makeCompanyScenario(vatPercent, taxPercent) {
    return computed(() => {
      // --- Purchase: VAT recovery + write-off (non-recovered VAT is capitalised) ---
      const vatReclaim = vatAmount.value * vatPercent
      const writeOffBase = (carPrice.value - vatReclaim) / depreciationYears.value
      const annualWriteOff = writeOffBase * taxPercent
      const depreciationYearsUsed = Math.min(years.value, depreciationYears.value)
      const totalWriteOff = annualWriteOff * depreciationYearsUsed

      // --- Running costs: recover VAT at vatPercent, deduct at taxPercent ---
      const costBorne = (gross, hasVat) => {
        const recovered = hasVat ? (gross - withoutVat(gross)) * vatPercent : 0
        return gross - recovered
      }
      const insuranceBorne = costBorne(insurance.value, false)   // no VAT on insurance
      const maintenanceBorne = costBorne(maintenance.value, true)
      const fuelBorne = costBorne(fuelCost.value, true)

      const insuranceDeduct = insuranceBorne * taxPercent
      const maintenanceDeduct = maintenanceBorne * taxPercent
      const fuelDeduct = fuelBorne * taxPercent

      const annualDeductionsWithDep = annualWriteOff + insuranceDeduct + maintenanceDeduct + fuelDeduct
      const annualDeductionsNoDep = insuranceDeduct + maintenanceDeduct + fuelDeduct

      // --- Year-by-year dividends ---
      let totalDividends = 0
      const yearlyBreakdown = []
      for (let y = 1; y <= years.value; y++) {
        const deductions = y <= depreciationYears.value ? annualDeductionsWithDep : annualDeductionsNoDep
        const taxableProfit = annualIncome.value - deductions
        const companyTaxAmount = taxableProfit * companyTax.value
        const afterTaxProfit = taxableProfit - companyTaxAmount
        const dividendTaxAmount = afterTaxProfit * dividendTax.value
        const dividends = afterTaxProfit - dividendTaxAmount
        totalDividends += dividends
        yearlyBreakdown.push({ year: y, deductions, taxableProfit, companyTaxAmount, afterTaxProfit, dividendTaxAmount, dividends })
      }
      const year1 = yearlyBreakdown[0]

      // --- Period totals (for breakdown display) ---
      const totalDepreciation = annualWriteOff * depreciationYearsUsed
      const totalInsurance = insuranceDeduct * years.value
      const totalMaintenance = maintenanceDeduct * years.value
      const totalFuel = fuelDeduct * years.value

      // --- Sale: full 23% output VAT, corporate + dividend tax (unchanged) ---
      const companySalePrice = salePrice.value
      const saleVat = companySalePrice - withoutVat(companySalePrice)
      const salePriceAfterVat = companySalePrice - saleVat
      const saleTax = salePriceAfterVat * companyTax.value
      const netSaleIncome = salePriceAfterVat - saleTax
      const saleIncomeAfterDividendTax = netSaleIncome * (1 - dividendTax.value)

      // --- §54 input-VAT refund on the undeducted purchase VAT (0 for 100%) ---
      const saleVatRefund = years.value < VAT_ADJUSTMENT_YEARS
        ? vatAmount.value * (1 - vatPercent) * (VAT_ADJUSTMENT_YEARS - years.value) / VAT_ADJUSTMENT_YEARS
        : 0

      // --- Non-deductible cost: undeducted purchase + non-deductible running portion ---
      const netCarPurchase = carPrice.value - vatReclaim
      const nonDeductibleRunning = (insuranceBorne + maintenanceBorne + fuelBorne) * (1 - taxPercent) * years.value
      const nonDeductibleCost = (netCarPurchase - totalWriteOff) + nonDeductibleRunning

      // Display: net cost of the car after VAT recovery & tax savings on write-off
      const netCarCost = netCarPurchase - totalWriteOff * companyTax.value

      const netToOwner = totalDividends + saleIncomeAfterDividendTax + saleVatRefund - nonDeductibleCost

      return {
        carCosts: annualDeductionsWithDep,
        taxableProfit: year1.taxableProfit,
        companyTaxAmount: year1.companyTaxAmount,
        afterTaxProfit: year1.afterTaxProfit,
        dividendTaxAmount: year1.dividendTaxAmount,
        dividends: year1.dividends,
        annualCash: year1.dividends,
        totalCashOverYears: totalDividends,
        personalCosts: 0,
        netToOwner,
        vatReclaim,
        annualWriteOff,
        totalWriteOff,
        netCarCost,
        nonDeductibleCost,
        vatPercent,
        taxPercent,
        salePrice: companySalePrice,
        saleVat,
        salePriceAfterVat,
        saleTax,
        netSaleIncome,
        saleIncomeAfterDividendTax,
        saleVatRefund,
        yearlyBreakdown,
        costBreakdown: { depreciation: totalDepreciation, insurance: totalInsurance, maintenance: totalMaintenance, fuel: totalFuel },
        annualCostBreakdown: { depreciation: annualWriteOff, insurance: insuranceDeduct, maintenance: maintenanceDeduct, fuel: fuelDeduct }
      }
    })
  }

  const companyScenario = makeCompanyScenario(1.0, 1.0)
  const pausalScenario = makeCompanyScenario(0.5, 0.8)

  // Summary comparisons
  const scenarioNets = computed(() => ({
    private: privateScenario.value.netToOwner,
    company: companyScenario.value.netToOwner,
    pausal: pausalScenario.value.netToOwner
  }))
  const bestOption = computed(() => {
    const n = scenarioNets.value
    return Object.keys(n).reduce((best, k) => n[k] > n[best] ? k : best, 'private')
  })
  const savings = computed(() => {
    const sorted = Object.values(scenarioNets.value).sort((a, b) => b - a)
    return sorted[0] - sorted[1]
  })

  // Chart data
  const yearlyData = computed(() => {
    const data = []
    let privateCumulative = 0
    let companyCumulative = 0
    let pausalCumulative = 0

    const privateAnnual = privateScenario.value.annualCash
    const privateCarCost = privateScenario.value.personalCarPurchase
    const privateRunningPerYear = privateScenario.value.personalRunningCosts / years.value

    for (let y = 1; y <= years.value; y++) {
      // Private: accumulate cash, subtract car cost in year 1, subtract running costs each year
      privateCumulative += privateAnnual - privateRunningPerYear
      if (y === 1) privateCumulative -= privateCarCost
      // Add sale income in final year
      if (y === years.value) privateCumulative += privateScenario.value.saleIncome

      // Company: accumulate dividends
      const companyYear = companyScenario.value.yearlyBreakdown[y - 1]
      companyCumulative += companyYear.dividends
      // Subtract non-deductible car+running cost in year 1
      if (y === 1) companyCumulative -= companyScenario.value.nonDeductibleCost
      // Add sale income (+ §54 refund, 0 for company) in final year
      if (y === years.value) companyCumulative += companyScenario.value.saleIncomeAfterDividendTax + companyScenario.value.saleVatRefund

      // Pausal: mirror company logic
      const pausalYear = pausalScenario.value.yearlyBreakdown[y - 1]
      pausalCumulative += pausalYear.dividends
      if (y === 1) pausalCumulative -= pausalScenario.value.nonDeductibleCost
      if (y === years.value) pausalCumulative += pausalScenario.value.saleIncomeAfterDividendTax + pausalScenario.value.saleVatRefund

      data.push({
        year: y,
        privateNet: Math.round(privateCumulative),
        companyNet: Math.round(companyCumulative),
        pausalNet: Math.round(pausalCumulative)
      })
    }

    return data
  })

  return {
    // Inputs
    annualIncome,
    kmPerYear,
    years,
    kmRate,
    fuelPrice,
    carPrice,
    insurance,
    maintenance,
    fuelConsumption,
    consumptionAdjustment,
    vatRate,
    companyTaxLow,
    companyTaxHigh,
    companyTax,
    dividendTax,
    depreciationYears,
    depreciationCurve,
    // VAT breakdown
    vatAmount,
    // Scenario outputs
    privateScenario,
    companyScenario,
    pausalScenario,
    // Summary
    savings,
    bestOption,
    scenarioNets,
    yearlyData
  }
}
