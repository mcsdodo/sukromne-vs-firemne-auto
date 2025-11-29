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

  // Business usage (1.0 = 100%, 0.5 = 50% for personal usage declaration)
  const businessUsagePercent = ref(1.0)

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

  // VAT and write-off breakdown (for display)
  const carPriceNoVat = computed(() => withoutVat(carPrice.value))
  const vatAmount = computed(() => carPrice.value - carPriceNoVat.value)
  const vatReclaim = computed(() => vatAmount.value * businessUsagePercent.value)
  const annualWriteOffBase = computed(() => carPriceNoVat.value / depreciationYears.value)
  const annualWriteOff = computed(() => annualWriteOffBase.value * businessUsagePercent.value)
  const totalWriteOff = computed(() => {
    const yearsUsed = Math.min(years.value, depreciationYears.value)
    return annualWriteOff.value * yearsUsed
  })
  const netCarCost = computed(() => {
    const taxSavings = totalWriteOff.value * companyTax.value
    return carPrice.value - vatReclaim.value - taxSavings
  })

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

  // ============ COMPANY CAR SCENARIO ============
  const companyScenario = computed(() => {
    // Calculate annual costs for company (first year with depreciation)
    // Use annualWriteOff which already accounts for businessUsagePercent
    const insuranceCost = insurance.value  // NO VAT recovery on insurance
    const maintenanceCost = withoutVat(maintenance.value)  // VAT recovered
    const fuelCostNoVat = withoutVat(fuelCost.value)  // VAT recovered

    // Annual deductions (year 1-4 includes depreciation)
    const annualDeductionsWithDep = annualWriteOff.value + insuranceCost + maintenanceCost + fuelCostNoVat
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
    const totalDepreciation = annualWriteOff.value * depreciationYearsUsed
    const totalInsurance = insuranceCost * years.value
    const totalMaintenance = maintenanceCost * years.value
    const totalFuel = fuelCostNoVat * years.value

    // Sale calculations (tax on full sale price)
    const companySalePrice = salePrice.value
    const saleTax = companySalePrice * companyTax.value
    const netSaleIncome = companySalePrice - saleTax
    const saleIncomeAfterDividendTax = netSaleIncome * (1 - dividendTax.value)

    // At less than 100% business usage:
    // - Company pays (carPrice - vatReclaim) for the car
    // - But only (totalWriteOff) is tax-deductible
    // - The difference is a non-deductible cost that reduces owner's net
    const netCarPurchase = carPrice.value - vatReclaim.value
    const nonDeductibleCost = netCarPurchase - totalWriteOff.value

    // Update net to owner: dividends + sale income - non-deductible car cost
    const netToOwnerWithSale = totalDividends + saleIncomeAfterDividendTax - nonDeductibleCost

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
      netToOwner: netToOwnerWithSale,
      // Sale data
      salePrice: companySalePrice,
      saleTax,
      netSaleIncome,
      saleIncomeAfterDividendTax,
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
        depreciation: annualWriteOff.value,
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
      // Add sale income in final year
      if (y === years.value) privateCumulative += privateScenario.value.saleIncome

      // Company: accumulate dividends
      const companyYear = companyScenario.value.yearlyBreakdown[y - 1]
      companyCumulative += companyYear.dividends
      // Subtract non-deductible car cost in year 1
      // (car purchase minus VAT reclaim minus total write-off that will be deducted)
      if (y === 1) {
        const netCarPurchase = carPrice.value - vatReclaim.value
        const nonDeductibleCost = netCarPurchase - totalWriteOff.value
        companyCumulative -= nonDeductibleCost
      }
      // Add sale income in final year
      if (y === years.value) companyCumulative += companyScenario.value.saleIncomeAfterDividendTax

      data.push({
        year: y,
        privateNet: Math.round(privateCumulative),
        companyNet: Math.round(companyCumulative)
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
    depreciationCurve,
    businessUsagePercent,
    // VAT and write-off breakdown
    vatAmount,
    vatReclaim,
    annualWriteOffBase,
    annualWriteOff,
    totalWriteOff,
    netCarCost,
    // Scenario outputs
    privateScenario,
    companyScenario,
    // Summary
    savings,
    cheaperOption,
    yearlyData
  }
}
