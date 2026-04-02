# Shareable URL with Settings

**Status:** 📋 Planning

## Problem

Users cannot share their calculator configuration with others. When someone sets up a specific scenario (income, car price, usage, km/year), they have no way to send a link that reproduces that exact configuration.

## Requirements

Encode key input parameters in the URL hash fragment so the page state is shareable and bookmarkable.

### Parameters to encode

| Parameter | Hash key | Example | Source ref in useCalculator.js |
|-----------|----------|---------|-------------------------------|
| Yearly income | `income` | `#income=36000` | `annualIncome` |
| Car price | `car` | `#car=40000` | `carPrice` |
| Business usage (1.0 or 0.5) | `usage` | `#usage=0.5` | `businessUsagePercent` |
| Km per year | `km` | `#km=20000` | `annualKm` |

### Format

- Use hash fragment (`#`), not query string (`?`) — avoids server round-trips on GitHub Pages
- Multiple params separated by `&`: `#income=36000&car=40000&usage=0.5&km=20000`
- Partial params are fine — only override what's in the URL, keep defaults for the rest

### Behavior

1. **On page load:** Parse hash, apply matching values to reactive refs
2. **On input change:** Update hash to reflect current state (so copying URL at any point works)
3. **Omit defaults:** If a value matches the default, omit it from the hash to keep URLs short
4. **Invalid values:** Ignore non-numeric or out-of-range values, fall back to defaults

### Share button

A share button at the top of the page that copies the current URL (with hash params) to clipboard. Brief tooltip/toast confirmation on copy (e.g. "Skopirované!").

### Out of scope

- Encoding advanced settings (tax rates, depreciation curve, fuel params)
- Browser history entries per change (use `replaceState`, not `pushState`)
