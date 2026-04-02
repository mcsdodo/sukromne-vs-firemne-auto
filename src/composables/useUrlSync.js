import { watch } from 'vue'

const PARAMS = [
  { key: 'income', ref: 'annualIncome', default: 100000 },
  { key: 'car', ref: 'carPrice', default: 50000 },
  { key: 'usage', ref: 'businessUsagePercent', default: 1.0 },
  { key: 'km', ref: 'kmPerYear', default: 25000 },
  { key: 'years', ref: 'years', default: 4 },
  { key: 'kmrate', ref: 'kmRate', default: 0.313 },
  { key: 'fuel', ref: 'fuelPrice', default: 1.5 },
  { key: 'ins', ref: 'insurance', default: 1500 },
  { key: 'maint', ref: 'maintenance', default: 600 },
  { key: 'cons', ref: 'fuelConsumption', default: 5.1 },
  { key: 'consadj', ref: 'consumptionAdjustment', default: 0.10 },
  { key: 'vat', ref: 'vatRate', default: 0.23 },
  { key: 'taxlow', ref: 'companyTaxLow', default: 0.10 },
  { key: 'taxhigh', ref: 'companyTaxHigh', default: 0.21 },
  { key: 'divtax', ref: 'dividendTax', default: 0.07 },
  { key: 'depyrs', ref: 'depreciationYears', default: 4 }
]

function parseHash() {
  const hash = window.location.hash.slice(1)
  if (!hash) return {}
  const params = {}
  for (const part of hash.split('&')) {
    const [k, v] = part.split('=')
    if (k && v) {
      const num = Number(v)
      if (!isNaN(num)) params[k] = num
    }
  }
  return params
}

function buildHash(refs) {
  const parts = []
  for (const { key, ref, default: def } of PARAMS) {
    const val = refs[ref].value
    if (val !== def) parts.push(`${key}=${val}`)
  }
  return parts.length ? '#' + parts.join('&') : ''
}

export function useUrlSync(refs) {
  // Apply hash params on load
  const params = parseHash()
  for (const { key, ref } of PARAMS) {
    if (key in params) refs[ref].value = params[key]
  }

  // Update hash when refs change
  watch(
    () => PARAMS.map(p => refs[p.ref].value),
    () => {
      const hash = buildHash(refs)
      history.replaceState(null, '', hash || window.location.pathname + window.location.search)
    }
  )
}
