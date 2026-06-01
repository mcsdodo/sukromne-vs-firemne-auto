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

  it('applies 80% of the write-off base (on the VAT-adjusted purchase price)', () => {
    const c = setup()
    const vatAmount = 50000 - 50000 / 1.23
    const pausalBase = (50000 - vatAmount * 0.5) / 4
    expect(c.pausalScenario.value.annualWriteOff).toBeCloseTo(pausalBase * 0.8, 2)
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

describe('company 100% regression — unchanged by the refactor', () => {
  it('company netToOwner is unchanged and has zero §54 refund', () => {
    const c = setup()
    expect(c.companyScenario.value.saleVatRefund).toBeCloseTo(0, 6)
    expect(Math.round(c.companyScenario.value.netToOwner)).toBe(EXPECTED_COMPANY_NET)
  })
})

describe('3-way comparison', () => {
  it('bestOption is one of the three scenarios', () => {
    const c = setup()
    expect(['private', 'company', 'pausal']).toContain(c.bestOption.value)
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
  })
})
