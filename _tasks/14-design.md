# Configurable Car Depreciation Curve Design

## Overview

Replace the hard-coded linear depreciation formula with a configurable depreciation curve that users can adjust by dragging points on an interactive chart.

## Requirements

- Draggable points on a line chart
- X-axis: Years (1-8, matches years input)
- Y-axis: Residual value (0-100%)
- Constraint: Values must decrease (each year < previous year)
- Real-time calculation updates

## Data Model

**Replace computed formula with configurable array in useCalculator.js:**

```javascript
// Realistic defaults: steeper early depreciation
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
  const residualPercent = depreciationCurve.value[yearIndex]
  return carPrice.value * residualPercent
})
```

## UI Component: DepreciationChart.vue

**Placement:** Main page after YearsInput, before ResultsSummary

**Technology:** Chart.js + chartjs-plugin-dragdata

**Visual design:**
- Chart height: ~200px
- Line chart with draggable point markers
- Highlighted point for current ownership year
- Y-axis labels: 0%, 25%, 50%, 75%, 100%
- X-axis labels: Rok 1, Rok 2, ... Rok 8

**Interaction:**
- Points can be dragged vertically
- Cursor changes to grab/grabbing on hover/drag
- Point size increases on hover
- Tooltip shows current percentage while dragging

## Drag Constraint Enforcement

```javascript
onDrag: (e, datasetIndex, index, value) => {
  const prevValue = index > 0 ? curve[index - 1] : 1.0
  const nextValue = index < curve.length - 1 ? curve[index + 1] : 0

  // Clamp: must be less than previous, more than next
  const clamped = Math.min(prevValue - 0.01, Math.max(nextValue + 0.01, value))
  return clamped
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/composables/useCalculator.js` | Replace residualValuePercent formula with depreciationCurve array |
| `src/App.vue` | Add DepreciationChart component to template |
| `src/components/DepreciationChart.vue` | New component with interactive chart |
| `package.json` | Add chartjs-plugin-dragdata dependency |

## Default Values

Realistic depreciation curve (steeper early, slower later):

| Year | Residual Value |
|------|----------------|
| 1 | 80% |
| 2 | 65% |
| 3 | 55% |
| 4 | 48% |
| 5 | 42% |
| 6 | 37% |
| 7 | 33% |
| 8 | 30% |
