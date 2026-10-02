import { describe, it, expect } from 'vitest'
import { useCalculator } from './useCalculator'

const EXPECTED_COMPANY_NET = 304726

// Helper: build a calculator with deterministic inputs
function setup() {
  const c = useCalculator()
  c.annualIncome.value = 100000
  c.carPrice.value = 50000
  c.kmPerYear.value = 25000
  c.years.value = 4
  return c
}

describe('pausalScenario', () => {
  it('is exposed and is an object with netToOwner', () => {
    const c = setup()
    expect(typeof c.pausalScenario.value.netToOwner).toBe('number')
  })

  it('recovers 50% of purchase VAT (vs 100% for company)', () => {
    const c = setup()
    const vatAmount = 50000 - 50000 / 1.23
    expect(c.companyScenario.value.vatReclaim).toBeCloseTo(vatAmount, 2)
    expect(c.pausalScenario.value.vatReclaim).toBeCloseTo(vatAmount * 0.5, 2)
  })

  it('applies 80% of the write-off base on the price without VAT (§ 52zzzk: undeducted VAT is not in daňová vstupná cena)', () => {
    const c = setup()
    expect(c.pausalScenario.value.annualWriteOff).toBeCloseTo(50000 / 1.23 / 4 * 0.8, 2)
  })

  it('deducts 80% of running costs without VAT; the undeducted VAT is a cost but not a tax expense (§ 52zzzk)', () => {
    const c = setup()
    const p = c.pausalScenario.value
    const fuelGross = (25000 / 100) * 5.1 * 1.1 * 1.5
    expect(p.annualCostBreakdown.insurance).toBeCloseTo(1500 * 0.8, 6)       // no VAT on insurance
    expect(p.annualCostBreakdown.maintenance).toBeCloseTo(600 / 1.23 * 0.8, 6)
    expect(p.annualCostBreakdown.fuel).toBeCloseTo(fuelGross / 1.23 * 0.8, 6)
    // Borne = gross - 50% of VAT; non-deductible = borne - deducted
    const borne = (g) => g - (g - g / 1.23) * 0.5
    const expected = (1500 * 0.2 + (borne(600) - 600 / 1.23 * 0.8) + (borne(fuelGross) - fuelGross / 1.23 * 0.8)) * 4
    expect(p.nonDeductibleRunning).toBeCloseTo(expected, 6)
  })

  it('adds a §54 sale VAT refund of vat × 0.5 × (5−years)/5 when sold within 5 years', () => {
    const c = setup() // years = 4
    const vatAmount = 50000 - 50000 / 1.23
    expect(c.pausalScenario.value.saleVatRefund).toBeCloseTo(vatAmount * 0.5 * (1 / 5), 2)
  })

  it('gives zero sale VAT refund when held 5+ years', () => {
    const c = setup()
    c.years.value = 5
    expect(c.pausalScenario.value.saleVatRefund).toBeCloseTo(0, 6)
  })
})

describe('pausalTaxedScenario', () => {
  it('is exposed and is an object with netToOwner', () => {
    const c = setup()
    expect(typeof c.pausalTaxedScenario.value.netToOwner).toBe('number')
  })

  it('gets 100% tax deductibility (bought back by taxing the 1% benefit) but still 50% VAT', () => {
    const c = setup()
    const vatAmount = 50000 - 50000 / 1.23
    expect(c.pausalTaxedScenario.value.taxPercent).toBe(1.0)
    expect(c.pausalTaxedScenario.value.vatReclaim).toBeCloseTo(vatAmount * 0.5, 2)
    expect(c.pausalTaxedScenario.value.vatReclaim).toBeCloseTo(c.pausalScenario.value.vatReclaim, 2)
  })

  it('year-1 nepeňažný príjem is 12% (1% × 12 months) of the full carPrice', () => {
    const c = setup()
    expect(c.pausalTaxedScenario.value.yearlyBreakdown[0].nepenaznyPrijem).toBeCloseTo(50000 * 0.12, 2)
  })

  it('year-2 base is reduced 12.5%', () => {
    const c = setup()
    expect(c.pausalTaxedScenario.value.yearlyBreakdown[1].nepenaznyPrijem).toBeCloseTo(50000 * 0.875 * 0.12, 2)
  })

  it('year-1 owner personal tax is the benefit × personalIncomeTaxRate (default 19%)', () => {
    const c = setup()
    const b = c.pausalTaxedScenario.value
    expect(b.ownerPersonalTaxYear1).toBeCloseTo(b.yearlyBreakdown[0].nepenaznyPrijem * 0.19, 2)
  })

  it('nets less than the 80%-capped pausal scenario at app defaults (the personal tax outweighs the extra 20% deduction)', () => {
    // The extra 20% deductibility (fuel excluded) is worth only ~16.3% of its value (corpTax + dividendTax
    // shield), a small gain on a small base (running costs + write-off) — while the personal
    // tax hits a much larger base (12%/year of the full car price). At any realistic personal
    // income tax rate (SK's minimum bracket is 19%), the trade is a net loss. See 02-research.md.
    const c = setup()
    expect(c.pausalTaxedScenario.value.netToOwner).toBeLessThan(c.pausalScenario.value.netToOwner)
  })

  it('keeps fuel at the 80% PHL paušál even though other costs are 100% (FS FAQ 523850, otázka č. 5)', () => {
    const c = setup()
    const t = c.pausalTaxedScenario.value
    expect(t.fuelTaxPercent).toBe(0.8)
    expect(t.annualCostBreakdown.fuel).toBeCloseTo(c.pausalScenario.value.annualCostBreakdown.fuel, 6)
    expect(t.annualCostBreakdown.maintenance).toBeGreaterThan(c.pausalScenario.value.annualCostBreakdown.maintenance)
    // Non-deductible: the undeducted 50% VAT on maintenance and fuel, plus 20% of fuel without VAT
    const fuelGross = (25000 / 100) * 5.1 * 1.1 * 1.5
    const vat = (g) => g - g / 1.23
    const expected = (vat(600) * 0.5 + vat(fuelGross) * 0.5 + fuelGross / 1.23 * 0.2) * 4
    expect(t.nonDeductibleRunning).toBeCloseTo(expected, 6)
    expect(t.annualCostBreakdown.maintenance).toBeCloseTo(600 / 1.23, 6)
  })
})

describe('company 100% regression — unchanged by the refactor', () => {
  it('company netToOwner is unchanged and has zero §54 refund', () => {
    const c = setup()
    expect(c.companyScenario.value.saleVatRefund).toBeCloseTo(0, 6)
    expect(Math.round(c.companyScenario.value.netToOwner)).toBe(EXPECTED_COMPANY_NET)
  })
})

describe('3-way comparison', () => {
  it('bestOption is one of the four scenarios', () => {
    const c = setup()
    expect(['private', 'company', 'pausal', 'pausalTaxed']).toContain(c.bestOption.value)
  })

  it('savings equals the gap between the winner and the runner-up', () => {
    const c = setup()
    const nets = Object.values(c.scenarioNets.value).sort((a, b) => b - a)
    expect(c.savings.value).toBeCloseTo(nets[0] - nets[1], 6)
  })
})

describe('yearlyData chart accumulation', () => {
  // Guards the chart distribution: the final cumulative point of each series must
  // equal that scenario's netToOwner (rounded), regardless of how costs are spread.
  it('final-year cumulative matches each scenario netToOwner', () => {
    const c = setup()
    const last = c.yearlyData.value[c.yearlyData.value.length - 1]
    expect(last.privateNet).toBe(Math.round(c.privateScenario.value.netToOwner))
    expect(last.companyNet).toBe(Math.round(c.companyScenario.value.netToOwner))
    expect(last.pausalNet).toBe(Math.round(c.pausalScenario.value.netToOwner))
    expect(last.pausalTaxedNet).toBe(Math.round(c.pausalTaxedScenario.value.netToOwner))
  })
})
