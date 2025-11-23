import { ref, computed } from 'vue'

export function useCalculator() {
  // Primary inputs
  const annualIncome = ref(100000)
  const kmPerYear = ref(25000)
  const years = ref(4)

  // Reimbursement rates
  const kmRate = ref(0.256)
  const fuelPrice = ref(1.5)

  // Car costs (with VAT where applicable)
  const carPrice = ref(50000)
  const insurance = ref(1500)  // NO VAT on insurance
  const maintenance = ref(600)  // with VAT
  const fuelConsumption = ref(5.1)
  const consumptionAdjustment = ref(0.10)

  // Tax rates
  const vatRate = ref(0.23)
  const companyTax = ref(0.10)
  const dividendTax = ref(0.07)
  const depreciationYears = ref(4)

  // Helper: remove VAT
  const withoutVat = (amount) => amount / (1 + vatRate.value)

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
    // Proportional car cost based on ownership vs depreciation period
    const ownershipRatio = Math.min(years.value, depreciationYears.value) / depreciationYears.value
    const personalCarPurchase = carPrice.value * ownershipRatio  // with VAT, proportional
    const personalInsurance = insurance.value * years.value  // no VAT on insurance
    const personalMaintenance = maintenance.value * years.value  // with VAT
    const personalFuel = fuelCost.value * years.value  // with VAT
    const personalRunningCosts = personalInsurance + personalMaintenance + personalFuel

    // Multi-year totals
    const totalCashOverYears = annualCash * years.value
    const netToOwner = totalCashOverYears - personalCarPurchase - personalRunningCosts

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
      // Cost breakdown (for display)
      costBreakdown: {
        depreciation: personalCarPurchase,
        insurance: personalInsurance,
        maintenance: personalMaintenance,
        fuel: personalFuel
      }
    }
  })

  // ============ COMPANY CAR SCENARIO ============
  const companyScenario = computed(() => {
    // Calculate annual costs for company (first year with depreciation)
    const carPriceNoVat = withoutVat(carPrice.value)
    const annualDepreciation = carPriceNoVat / depreciationYears.value
    const insuranceCost = insurance.value  // NO VAT recovery on insurance
    const maintenanceCost = withoutVat(maintenance.value)  // VAT recovered
    const fuelCostNoVat = withoutVat(fuelCost.value)  // VAT recovered

    // Annual deductions (year 1-4 includes depreciation)
    const annualDeductionsWithDep = annualDepreciation + insuranceCost + maintenanceCost + fuelCostNoVat
    const annualDeductionsNoDep = insuranceCost + maintenanceCost + fuelCostNoVat

    // Calculate dividends for each year and sum
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
      yearlyBreakdown.push({
        year: y,
        deductions,
        taxableProfit,
        companyTaxAmount,
        afterTaxProfit,
        dividendTaxAmount,
        dividends
      })
    }

    // Use year 1 values for annual display
    const year1 = yearlyBreakdown[0]

    // Total costs over ownership period (for breakdown display)
    const depreciationYearsUsed = Math.min(years.value, depreciationYears.value)
    const totalDepreciation = annualDepreciation * depreciationYearsUsed
    const totalInsurance = insuranceCost * years.value
    const totalMaintenance = maintenanceCost * years.value
    const totalFuel = fuelCostNoVat * years.value

    return {
      // Annual breakdown (year 1 representative)
      carCosts: annualDeductionsWithDep,
      taxableProfit: year1.taxableProfit,
      companyTaxAmount: year1.companyTaxAmount,
      afterTaxProfit: year1.afterTaxProfit,
      dividendTaxAmount: year1.dividendTaxAmount,
      dividends: year1.dividends,
      annualCash: year1.dividends,
      // Multi-year
      totalCashOverYears: totalDividends,
      personalCosts: 0,
      netToOwner: totalDividends,
      // Detailed
      yearlyBreakdown,
      // Cost breakdown (for display) - totals over period
      costBreakdown: {
        depreciation: totalDepreciation,
        insurance: totalInsurance,
        maintenance: totalMaintenance,
        fuel: totalFuel
      },
      // Annual cost breakdown (for year 1 display)
      annualCostBreakdown: {
        depreciation: annualDepreciation,
        insurance: insuranceCost,
        maintenance: maintenanceCost,
        fuel: fuelCostNoVat
      }
    }
  })

  // Summary comparisons
  const savings = computed(() => companyScenario.value.netToOwner - privateScenario.value.netToOwner)
  const cheaperOption = computed(() => savings.value > 0 ? 'company' : 'private')

  // Chart data
  const yearlyData = computed(() => {
    const data = []
    let privateCumulative = 0
    let companyCumulative = 0

    const privateAnnual = privateScenario.value.annualCash
    const privateCarCost = privateScenario.value.personalCarPurchase
    const privateRunningPerYear = privateScenario.value.personalRunningCosts / years.value

    for (let y = 1; y <= years.value; y++) {
      // Private: accumulate cash, subtract car cost in year 1, subtract running costs each year
      privateCumulative += privateAnnual - privateRunningPerYear
      if (y === 1) privateCumulative -= privateCarCost

      // Company: accumulate dividends
      const companyYear = companyScenario.value.yearlyBreakdown[y - 1]
      companyCumulative += companyYear.dividends

      data.push({
        year: y,
        privateNet: privateCumulative,
        companyNet: companyCumulative
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
    companyTax,
    dividendTax,
    depreciationYears,
    // Scenario outputs
    privateScenario,
    companyScenario,
    // Summary
    savings,
    cheaperOption,
    yearlyData
  }
}
