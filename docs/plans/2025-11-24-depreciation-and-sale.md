# Depreciation & Car Sale Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add realistic depreciation options (2/4 year dropdown) and car sale income/tax calculations at end of ownership.

**Architecture:** Modify useCalculator to compute residual value and sale taxes, update AdvancedSettings with depreciation dropdown, extend ResultsSummary with sale sections for both scenarios.

**Tech Stack:** Vue 3, Composition API, existing useCalculator composable

---

### Task 1: Add Residual Value and Sale Calculations to useCalculator

**Files:**
- Modify: `src/composables/useCalculator.js`

**Step 1: Add residual value helper function**

After line 28 (after `withoutVat` helper), add:

```javascript
// Helper: calculate residual value (linear interpolation)
// Anchors: 2y=80%, 4y=60%, 6y=40% -> -10% per year
const residualValuePercent = computed(() => {
  const percent = 1.0 - (years.value * 0.10)
  return Math.max(0.20, Math.min(0.90, percent))  // clamp 20%-90%
})

const salePrice = computed(() => carPrice.value * residualValuePercent.value)
```

**Step 2: Add sale calculations to privateScenario**

In privateScenario computed (around line 61), before the return statement, add:

```javascript
// Sale income (private owner gets full amount, no corporate taxes)
const saleIncome = salePrice.value

// Net to owner now includes sale income
const netToOwner = totalCashOverYears - personalCarPurchase - personalRunningCosts + saleIncome
```

Update the return object to include sale data:

```javascript
return {
  // ... existing fields ...
  // Sale data
  salePrice: salePrice.value,
  saleIncome,
  // Update netToOwner (already modified above)
  netToOwner,
  // ... rest of existing fields ...
}
```

**Step 3: Add sale calculations to companyScenario**

In companyScenario computed (around line 165), before the return statement, add:

```javascript
// Sale calculations (tax on full sale price)
const companySalePrice = salePrice.value
const saleTax = companySalePrice * companyTax.value
const netSaleIncome = companySalePrice - saleTax
const saleIncomeAfterDividendTax = netSaleIncome * (1 - dividendTax.value)

// Update net to owner to include sale income
const netToOwnerWithSale = totalDividends + saleIncomeAfterDividendTax
```

Update the return object:

```javascript
return {
  // ... existing fields ...
  netToOwner: netToOwnerWithSale,
  // Sale data
  salePrice: companySalePrice,
  saleTax,
  netSaleIncome,
  saleIncomeAfterDividendTax,
  // ... rest of existing fields ...
}
```

**Step 4: Update yearlyData to include sale in final year**

In the yearlyData computed, update the loop to add sale income in the final year:

```javascript
for (let y = 1; y <= years.value; y++) {
  // Private: accumulate cash, subtract car cost in year 1, subtract running costs each year
  privateCumulative += privateAnnual - privateRunningPerYear
  if (y === 1) privateCumulative -= privateCarCost
  // Add sale income in final year
  if (y === years.value) privateCumulative += privateScenario.value.saleIncome

  // Company: accumulate dividends
  const companyYear = companyScenario.value.yearlyBreakdown[y - 1]
  companyCumulative += companyYear.dividends
  // Add sale income in final year
  if (y === years.value) companyCumulative += companyScenario.value.saleIncomeAfterDividendTax

  data.push({
    year: y,
    privateNet: privateCumulative,
    companyNet: companyCumulative
  })
}
```

**Step 5: Verify in browser**

Run: Open http://localhost:5173 and check console for errors
Expected: No errors, app loads normally

**Step 6: Commit**

```bash
git add src/composables/useCalculator.js
git commit -m "feat: add car sale calculations to useCalculator"
```

---

### Task 2: Move Depreciation to AdvancedSettings as Dropdown

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/AdvancedSettings.vue`

**Step 1: Remove DepreciationInput from App.vue**

In `src/App.vue`, remove line 8:
```html
<DepreciationInput v-model="depreciationYears" />
```

Remove import on line 44:
```javascript
import DepreciationInput from './components/DepreciationInput.vue'
```

**Step 2: Add depreciationYears prop to AdvancedSettings in App.vue**

Update the AdvancedSettings component (around line 24-36) to include:
```html
<AdvancedSettings
  v-model:annualIncome="annualIncome"
  v-model:kmRate="kmRate"
  v-model:fuelPrice="fuelPrice"
  v-model:carPrice="carPrice"
  v-model:insurance="insurance"
  v-model:maintenance="maintenance"
  v-model:fuelConsumption="fuelConsumption"
  v-model:consumptionAdjustment="consumptionAdjustment"
  v-model:vatRate="vatRate"
  v-model:companyTax="companyTax"
  v-model:dividendTax="dividendTax"
  v-model:depreciationYears="depreciationYears"
/>
```

**Step 3: Add depreciation dropdown to AdvancedSettings.vue**

In `src/components/AdvancedSettings.vue`, in the "Dane" section (after line 65, after dividend tax input), add:

```html
<div class="setting">
  <label>Odpisy (roky)</label>
  <select :value="depreciationYears" @change="emit('update:depreciationYears', Number($event.target.value))">
    <option :value="2">2 roky (EV)</option>
    <option :value="4">4 roky (ICE)</option>
  </select>
</div>
```

**Step 4: Add depreciationYears to props**

In AdvancedSettings.vue script, add to defineProps (around line 77):
```javascript
defineProps({
  annualIncome: Number,
  kmRate: Number,
  fuelPrice: Number,
  carPrice: Number,
  insurance: Number,
  maintenance: Number,
  fuelConsumption: Number,
  consumptionAdjustment: Number,
  vatRate: Number,
  companyTax: Number,
  dividendTax: Number,
  depreciationYears: Number
})
```

**Step 5: Add emit for depreciationYears**

In AdvancedSettings.vue script, add to defineEmits (around line 90):
```javascript
const emit = defineEmits([
  'update:annualIncome',
  'update:kmRate',
  'update:fuelPrice',
  'update:carPrice',
  'update:insurance',
  'update:maintenance',
  'update:fuelConsumption',
  'update:consumptionAdjustment',
  'update:vatRate',
  'update:companyTax',
  'update:dividendTax',
  'update:depreciationYears'
])
```

**Step 6: Add select styling**

In AdvancedSettings.vue style section, add after `.setting input:focus` (around line 163):

```css
.setting select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.setting select:focus {
  outline: none;
  border-color: #2563eb;
}
```

**Step 7: Verify in browser**

Run: Open http://localhost:5173
Expected: Depreciation slider gone from main page, dropdown appears in Advanced Settings under "Dane"

**Step 8: Commit**

```bash
git add src/App.vue src/components/AdvancedSettings.vue
git commit -m "feat: move depreciation to dropdown in Advanced Settings"
```

---

### Task 3: Add Sale Section to ResultsSummary

**Files:**
- Modify: `src/components/ResultsSummary.vue`

**Step 1: Add sale section to private car card**

In ResultsSummary.vue, after the multi-year section (after line 72), add:

```html
<div class="sale-section">
  <div class="row addition">
    <span>+ Predaj auta</span>
    <span>+ {{ formatCurrency(privateScenario.salePrice) }}</span>
  </div>
</div>
```

**Step 2: Add sale section to company car card**

After the company multi-year section (after line 139), add:

```html
<div class="sale-section">
  <div class="row addition">
    <span>+ Predaj auta</span>
    <span>+ {{ formatCurrency(companyScenario.salePrice) }}</span>
  </div>
  <div class="row deduction">
    <span>- Daň z predaja ({{ Math.round(companyTaxRate * 100) }}%)</span>
    <span>- {{ formatCurrency(companyScenario.saleTax) }}</span>
  </div>
  <div class="row subtotal">
    <span>= Čistý príjem z predaja</span>
    <span>{{ formatCurrency(companyScenario.netSaleIncome) }}</span>
  </div>
  <div class="row deduction">
    <span>- Daň z dividend ({{ Math.round(dividendTaxRate * 100) }}%)</span>
    <span>- {{ formatCurrency(companyScenario.netSaleIncome * dividendTaxRate) }}</span>
  </div>
  <div class="row subtotal">
    <span>= Príjem majiteľa z predaja</span>
    <span>{{ formatCurrency(companyScenario.saleIncomeAfterDividendTax) }}</span>
  </div>
</div>
```

**Step 3: Add sale-section styling**

In the style section, add:

```css
.sale-section {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 12px;
}
```

**Step 4: Verify in browser**

Run: Open http://localhost:5173
Expected: Both cards show sale sections with correct calculations

**Step 5: Commit**

```bash
git add src/components/ResultsSummary.vue
git commit -m "feat: add car sale sections to ResultsSummary"
```

---

### Task 4: Clean Up and Final Testing

**Files:**
- Delete: `src/components/DepreciationInput.vue` (optional, no longer used)

**Step 1: Test different scenarios**

Verify calculations manually:
- 4-year ownership, €50,000 car: residual = 60% = €30,000
- Private: sale income = €30,000
- Company: sale = €30,000, tax = €3,000, net = €27,000, after div tax = €25,110

**Step 2: Test edge cases**

- 2-year ownership: residual = 80%
- 6-year ownership: residual = 40%
- 8-year ownership: residual = 20% (clamped)

**Step 3: Verify chart updates**

Check that chart shows jump in final year when sale income is added.

**Step 4: Delete unused DepreciationInput component (optional)**

```bash
rm src/components/DepreciationInput.vue
```

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: remove unused DepreciationInput component"
```

---

## Verification Checklist

- [ ] Depreciation dropdown appears in Advanced Settings under "Dane"
- [ ] Options are "2 roky (EV)" and "4 roky (ICE)"
- [ ] Private car card shows sale price in sale section
- [ ] Company car card shows sale price, tax, and net income
- [ ] Final totals (CISTY VYNOS) include sale income
- [ ] Chart shows sale income in final year
- [ ] Residual values: 2y=80%, 4y=60%, 6y=40%, clamped at 20%-90%
