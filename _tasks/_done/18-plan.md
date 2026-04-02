# Implementation Plan: 50% Business Usage Toggle

## Task 1: Add businessUsagePercent to useCalculator.js

**File**: `src/composables/useCalculator.js`

1. Add new ref:
   ```javascript
   const businessUsagePercent = ref(1.0)  // 1.0 = 100%, 0.5 = 50%
   ```

2. Add new computed values for breakdown display:
   ```javascript
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
   ```

3. Update companyScenario to use businessUsagePercent:
   - Replace `annualDepreciation` calculation with `annualWriteOff.value`
   - Account for reduced VAT reclaim in overall calculation

4. Export new values from composable

## Task 2: Add Toggle UI to App.vue

**File**: `src/App.vue`

1. Import `businessUsagePercent` from useCalculator
2. Add toggle buttons after car price input:
   ```vue
   <div class="usage-toggle">
     <span class="toggle-label">Podnikateľské využitie:</span>
     <div class="toggle-buttons">
       <button :class="{ active: businessUsagePercent === 1.0 }" @click="businessUsagePercent = 1.0">100%</button>
       <button :class="{ active: businessUsagePercent === 0.5 }" @click="businessUsagePercent = 0.5">50%</button>
     </div>
   </div>
   ```
3. Add CSS styling for toggle

## Task 3: Add Per-Year Breakdown to ResultsSummary.vue

**File**: `src/components/ResultsSummary.vue`

1. Accept new props: `annualWriteOffBase`, `annualWriteOff`, `businessUsagePercent`
2. Add per-year breakdown line in company car section:
   - When 100%: "Ročný odpis: 10 162 €"
   - When 50%: "Ročný odpis: 10 162 € × 50% = 5 081 €"

## Task 4: Add Total Breakdown to ResultsSummary.vue

**File**: `src/components/ResultsSummary.vue`

1. Accept new props: `vatAmount`, `vatReclaim`, `totalWriteOff`, `netCarCost`
2. Add total breakdown section above "Za X roky":
   - VAT reclaim line (with × 50% when applicable)
   - Total write-off line (with × 50% when applicable)
   - Net car cost line

## Verification

1. Test 100% mode - numbers should match current behavior
2. Test 50% mode - verify calculations match design examples
3. Toggle between modes - verify UI updates correctly
