import { ref, computed } from 'vue'

export function useCalculator() {
  // Primary inputs
  const kmPerYear = ref(25000)
  const years = ref(4)

  // Reimbursement rates
  const kmRate = ref(0.256)
  const fuelPrice = ref(1.5)

  // Car costs (all with VAT)
  const carPrice = ref(50000)
  const insurance = ref(1500)
  const maintenance = ref(400)
  const fuelConsumption = ref(5.1)
  const consumptionAdjustment = ref(0.10)

  // Tax rates
  const vatRate = ref(0.23)
  const companyTax = ref(0.10)
  const dividendTax = ref(0.07)
  const depreciationRate = ref(0.25)

  // Helper: remove VAT
  const withoutVat = (amount) => amount / (1 + vatRate.value)

  // Private car annual cost
  const privateAnnualCost = computed(() => {
    const kmReimbursement = kmPerYear.value * kmRate.value
    const adjustedConsumption = fuelConsumption.value * (1 + consumptionAdjustment.value)
    const litersUsed = (kmPerYear.value / 100) * adjustedConsumption
    const fuelReimbursement = litersUsed * fuelPrice.value

    const grossCost = kmReimbursement + fuelReimbursement
    const afterCompanyTax = grossCost * (1 - companyTax.value)
    const dividendEquivalent = afterCompanyTax / (1 - dividendTax.value)

    return dividendEquivalent
  })

  // Company car annual cost (for a given year number)
  const companyAnnualCost = (yearNumber) => {
    const carPriceNoVat = withoutVat(carPrice.value)
    const depreciation = yearNumber <= 4 ? carPriceNoVat * depreciationRate.value : 0

    const insuranceNoVat = withoutVat(insurance.value)
    const maintenanceNoVat = withoutVat(maintenance.value)

    const adjustedConsumption = fuelConsumption.value * (1 + consumptionAdjustment.value)
    const litersUsed = (kmPerYear.value / 100) * adjustedConsumption
    const fuelNoVat = withoutVat(litersUsed * fuelPrice.value)

    const grossCost = depreciation + insuranceNoVat + maintenanceNoVat + fuelNoVat
    const afterCompanyTax = grossCost * (1 - companyTax.value)
    const dividendEquivalent = afterCompanyTax / (1 - dividendTax.value)

    return dividendEquivalent
  }

  // Multi-year calculations
  const yearlyData = computed(() => {
    const data = []
    let privateCumulative = 0
    let companyCumulative = 0

    for (let y = 1; y <= years.value; y++) {
      privateCumulative += privateAnnualCost.value
      companyCumulative += companyAnnualCost(y)

      data.push({
        year: y,
        privateAnnual: privateAnnualCost.value,
        companyAnnual: companyAnnualCost(y),
        privateCumulative,
        companyCumulative
      })
    }

    return data
  })

  // Summary
  const totalPrivate = computed(() => {
    const last = yearlyData.value[yearlyData.value.length - 1]
    return last ? last.privateCumulative : 0
  })

  const totalCompany = computed(() => {
    const last = yearlyData.value[yearlyData.value.length - 1]
    return last ? last.companyCumulative : 0
  })

  const savings = computed(() => totalPrivate.value - totalCompany.value)
  const cheaperOption = computed(() => savings.value > 0 ? 'company' : 'private')

  return {
    // Inputs
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
    depreciationRate,
    // Outputs
    yearlyData,
    totalPrivate,
    totalCompany,
    savings,
    cheaperOption
  }
}
