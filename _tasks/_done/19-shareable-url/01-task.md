# Shareable URL with Settings

**Status:** ✅ Complete

## Problem

Users couldn't share their calculator configuration with others. When someone set up a specific scenario, they had no way to send a link that reproduces that exact configuration.

## Requirements

~~Encode key input parameters in the URL hash fragment so the page state is shareable and bookmarkable.~~

### Parameters encoded

| Parameter | Hash key | Example | Source ref in useCalculator.js |
|-----------|----------|---------|-------------------------------|
| Yearly income | `income` | `#income=36000` | `annualIncome` |
| Car price | `car` | `#car=40000` | `carPrice` |
| Business usage (1.0 or 0.5) | `usage` | `#usage=0.5` | `businessUsagePercent` |
| Km per year | `km` | `#km=20000` | `kmPerYear` |

### Format

- Hash fragment (`#`), not query string — avoids server round-trips on GitHub Pages
- Multiple params separated by `&`: `#income=36000&car=40000&usage=0.5&km=20000`
- Partial params supported — only overrides what's in the URL, keeps defaults for the rest

### Behavior (implemented)

1. **On page load:** Parse hash, apply matching values to reactive refs
2. **On input change:** Update hash via `replaceState` (no history pollution)
3. **Omit defaults:** Default values omitted from hash for clean URLs
4. **Invalid values:** Non-numeric values ignored, falls back to defaults

### Share button (implemented)

- Text: "Zdieľať výpočet" with share icon (SVG)
- Position: Top-right corner of the header
- Copies current URL to clipboard, shows "Skopirované!" confirmation for 2s
- Responsive: stacks below title on mobile

## Implementation

- `src/composables/useUrlSync.js` — new composable for bidirectional hash sync
- `src/App.vue` — share button in header, `useUrlSync` wired to calculator refs

### Out of scope

- Encoding advanced settings (tax rates, depreciation curve, fuel params)
- Browser history entries per change
