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

  // EV mode (BEV, odpisová skupina 0). 0/1 instead of boolean: the URL sync stores numbers only.
  const isEv = ref(0)
  const evConsumption = ref(17)        // kWh/100km from the vehicle document (§ 7 ods. 6 písm. e) 283/2002)
  const homeChargePrice = ref(0.17)    // EUR/kWh, ŠÚ SR home charging reference price (0.173, Q1 2026)
  const publicChargePrice = ref(0.55)  // EUR/kWh, ŠÚ SR public charging prices (AC 0.41 to DC 0.69)
  const homeChargeShare = ref(0.7)     // share of kWh charged at home

  // Tax rates
  const vatRate = ref(0.23)
  const companyTaxLow = ref(0.10)
  const companyTaxHigh = ref(0.21)
  const companyTax = computed(() => annualIncome.value > 100000 ? companyTaxHigh.value : companyTaxLow.value)
  const dividendTax = ref(0.07)
  const depreciationYears = ref(4)
  const personalIncomeTaxRate = ref(0.19)  // owner's personal income tax on nepeňažný príjem

  const VAT_ADJUSTMENT_YEARS = 5  // statutory §54 VAT-adjustment window
  const NEPENAZNY_PRIJEM_YEARS = 8  // §5 ods. 3 písm. a): benefit runs 8 years, base -12.5%/yr

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

  // Annual energy cost (fuel or electricity), split by VAT treatment for the company:
  // - vatable: bought on a company invoice (fuel, public charging), input VAT recoverable
  // - home: EV charged at the owner's home and reimbursed; the bill is not addressed to the
  //   company, so no VAT deduction (§ 51 ods. 1 písm. a) DPH), the gross amount is the cost
  const energyCost = computed(() => {
    if (isEv.value) {
      const kwh = (kmPerYear.value / 100) * evConsumption.value * (1 + consumptionAdjustment.value)
      return {
        vatable: kwh * (1 - homeChargeShare.value) * publicChargePrice.value,
        home: kwh * homeChargeShare.value * homeChargePrice.value
      }
    }
    const litersUsed = (kmPerYear.value / 100) * fuelConsumption.value * (1 + consumptionAdjustment.value)
    return { vatable: litersUsed * fuelPrice.value, home: 0 }
  })
  const fuelCost = computed(() => energyCost.value.vatable + energyCost.value.home)

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
  // fuelTaxPercent: share of fuel deductible (defaults to taxPercent; see pausalTaxedBase)
  function makeCompanyScenario(vatPercent, taxPercent, fuelTaxPercent = taxPercent) {
    return computed(() => {
      // --- Purchase: VAT recovery + write-off ---
      // § 52zzzk ZDP (from 2026): VAT not deductible under § 85n DPH is not part of the
      // daňová vstupná cena, so tax depreciation starts from the price without VAT
      // (FS 45/DZPaU/2025/MU, príklad č. 1). The undeducted VAT stays a non-deductible cost.
      const vatReclaim = vatAmount.value * vatPercent
      const writeOffBase = carPriceNoVat.value / depreciationYears.value
      const annualWriteOff = writeOffBase * taxPercent
      const depreciationYearsUsed = Math.min(years.value, depreciationYears.value)
      const totalWriteOff = annualWriteOff * depreciationYearsUsed

      // --- Running costs: recover VAT at vatPercent, deduct the price without VAT at
      // taxPercent (§ 52zzzk: the undeducted VAT is not a tax expense, FS 45/DZPaU/2025/MU
      // príklad č. 3) ---
      const costBorne = (gross, hasVat) => {
        const recovered = hasVat ? (gross - withoutVat(gross)) * vatPercent : 0
        return gross - recovered
      }
      const insuranceBorne = costBorne(insurance.value, false)   // no VAT on insurance
      const maintenanceBorne = costBorne(maintenance.value, true)
      const fuelBorne = costBorne(energyCost.value.vatable, true) + energyCost.value.home

      const insuranceDeduct = insurance.value * taxPercent
      const maintenanceDeduct = withoutVat(maintenance.value) * taxPercent
      const fuelDeduct = (withoutVat(energyCost.value.vatable) + energyCost.value.home) * fuelTaxPercent

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
      const nonDeductibleRunning = ((insuranceBorne + maintenanceBorne + fuelBorne) - (insuranceDeduct + maintenanceDeduct + fuelDeduct)) * years.value
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
        nonDeductibleRunning,
        vatPercent,
        taxPercent,
        fuelTaxPercent,
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

  // ============ PAUŠÁL 50/100 + 1% (owner personally taxed on private use) ============
  // §5 ods. 3 písm. a) and §19 ods. 2 písm. t) are mutually exclusive: taxing the owner's
  // 1% non-cash benefit buys back full (100%) income-tax deductibility instead of the 80%
  // cap. VAT stays at the paušál 50% rate either way (unrelated statutory mechanism).
  // Fuel is the exception: it stays at the §19 ods. 2 písm. l) 80% PHL paušál even when the
  // 1% benefit is taxed (financnasprava FAQ 523850, otázka č. 5). Assumes private use <= 20%.
  // Monthly rate: 1%, or 0.5% for odpisová skupina 0 (BEV/PHEV) per § 5 ods. 3 písm. a)
  const nepenaznyPrijemRate = computed(() => isEv.value ? 0.005 : 0.01)
  const nepenaznyPrijemBase = (y) => y > NEPENAZNY_PRIJEM_YEARS ? 0 : carPrice.value * (1 - 0.125 * (y - 1))
  const nepenaznyPrijemAnnual = (y) => nepenaznyPrijemBase(y) * nepenaznyPrijemRate.value * 12

  const pausalTaxedBase = makeCompanyScenario(0.5, 1.0, 0.8)
  const pausalTaxedScenario = computed(() => {
    const b = pausalTaxedBase.value

    let totalOwnerPersonalTax = 0
    let totalNepenaznyPrijem = 0
    const yearlyBreakdown = b.yearlyBreakdown.map((entry, idx) => {
      const y = idx + 1
      const nepenaznyPrijem = nepenaznyPrijemAnnual(y)
      const ownerPersonalTax = nepenaznyPrijem * personalIncomeTaxRate.value
      totalOwnerPersonalTax += ownerPersonalTax
      totalNepenaznyPrijem += nepenaznyPrijem
      return { ...entry, nepenaznyPrijem, ownerPersonalTax, dividends: entry.dividends - ownerPersonalTax }
    })

    return {
      ...b,
      yearlyBreakdown,
      dividends: b.yearlyBreakdown[0].dividends,       // gross company payout (unchanged)
      annualCash: yearlyBreakdown[0].dividends,          // net, after owner's personal tax
      ownerPersonalTaxYear1: yearlyBreakdown[0].ownerPersonalTax,
      totalCashOverYears: yearlyBreakdown.reduce((sum, e) => sum + e.dividends, 0),
      netToOwner: b.netToOwner - totalOwnerPersonalTax,
      totalOwnerPersonalTax,
      totalNepenaznyPrijem,
      nepenaznyPrijemRate: nepenaznyPrijemRate.value,
      personalIncomeTaxRate: personalIncomeTaxRate.value
    }
  })

  // Summary comparisons
  const scenarioNets = computed(() => ({
    private: privateScenario.value.netToOwner,
    company: companyScenario.value.netToOwner,
    pausal: pausalScenario.value.netToOwner,
    pausalTaxed: pausalTaxedScenario.value.netToOwner
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
    let pausalTaxedCumulative = 0

    const privateAnnual = privateScenario.value.annualCash
    const privateCarCost = privateScenario.value.personalCarPurchase
    const privateRunningPerYear = privateScenario.value.personalRunningCosts / years.value

    for (let y = 1; y <= years.value; y++) {
      // Private: accumulate cash, subtract car cost in year 1, subtract running costs each year
      privateCumulative += privateAnnual - privateRunningPerYear
      if (y === 1) privateCumulative -= privateCarCost
      // Add sale income in final year
      if (y === years.value) privateCumulative += privateScenario.value.saleIncome

      // Company: accumulate dividends. Spread the non-deductible running portion per
      // year and keep only the one-off purchase shortfall in year 1 (running portion is
      // 0 for the 100% case, so this matches the original company curve exactly).
      const companyScn = companyScenario.value
      companyCumulative += companyScn.yearlyBreakdown[y - 1].dividends
      companyCumulative -= companyScn.nonDeductibleRunning / years.value
      if (y === 1) companyCumulative -= (companyScn.nonDeductibleCost - companyScn.nonDeductibleRunning)
      // Add sale income (+ §54 refund, 0 for company) in final year
      if (y === years.value) companyCumulative += companyScn.saleIncomeAfterDividendTax + companyScn.saleVatRefund

      // Pausal: mirror company logic
      const pausalScn = pausalScenario.value
      pausalCumulative += pausalScn.yearlyBreakdown[y - 1].dividends
      pausalCumulative -= pausalScn.nonDeductibleRunning / years.value
      if (y === 1) pausalCumulative -= (pausalScn.nonDeductibleCost - pausalScn.nonDeductibleRunning)
      if (y === years.value) pausalCumulative += pausalScn.saleIncomeAfterDividendTax + pausalScn.saleVatRefund

      // Paušál + 1%: mirrors pausal logic; yearlyBreakdown dividends are already net of
      // the owner's personal tax on the nepeňažný príjem.
      const pausalTaxedScn = pausalTaxedScenario.value
      pausalTaxedCumulative += pausalTaxedScn.yearlyBreakdown[y - 1].dividends
      pausalTaxedCumulative -= pausalTaxedScn.nonDeductibleRunning / years.value
      if (y === 1) pausalTaxedCumulative -= (pausalTaxedScn.nonDeductibleCost - pausalTaxedScn.nonDeductibleRunning)
      if (y === years.value) pausalTaxedCumulative += pausalTaxedScn.saleIncomeAfterDividendTax + pausalTaxedScn.saleVatRefund

      data.push({
        year: y,
        privateNet: Math.round(privateCumulative),
        companyNet: Math.round(companyCumulative),
        pausalNet: Math.round(pausalCumulative),
        pausalTaxedNet: Math.round(pausalTaxedCumulative)
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
    isEv,
    evConsumption,
    homeChargePrice,
    publicChargePrice,
    homeChargeShare,
    fuelCost,
    vatRate,
    companyTaxLow,
    companyTaxHigh,
    companyTax,
    dividendTax,
    depreciationYears,
    depreciationCurve,
    personalIncomeTaxRate,
    // VAT breakdown
    vatAmount,
    // Scenario outputs
    privateScenario,
    companyScenario,
    pausalScenario,
    pausalTaxedScenario,
    // Summary
    savings,
    bestOption,
    scenarioNets,
    yearlyData
  }
}
