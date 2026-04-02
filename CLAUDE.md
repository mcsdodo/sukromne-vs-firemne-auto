# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Slovak-language car cost comparison calculator for company owners (VAT payers). Compares buying a car privately (with business reimbursements) vs through the company (with VAT recovery and depreciation). Live at https://mcsdodo.github.io/sukromne-vs-firemne-auto/

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

No tests, no linter, no formatter configured.

## Architecture

**Vue 3 + Vite** single-page app. All state and calculation logic lives in one composable:

- `src/composables/useCalculator.js` — reactive refs for all inputs + computed properties for both scenarios (private car, company car), savings comparison, and chart data. This is the core of the app.
- `src/App.vue` — layout shell, wires composable state to components, contains global CSS (dark theme, Tailwind gray palette colors)
- `src/components/` — presentation components that receive props/v-model from App.vue

**Key domain concepts in useCalculator.js:**
- `privateScenario` — owner buys car personally, gets km + fuel reimbursements from company (tax-free), pays all costs with VAT
- `companyScenario` — company buys car, recovers VAT, deducts costs from taxable income, year-by-year dividend calculation (varies during vs after depreciation period)
- `businessUsagePercent` (1.0 or 0.5) — affects VAT recovery and write-off proportionally
- `depreciationCurve` — user-adjustable residual value percentages for years 1-8

**Styling:** Pure CSS with no framework. Dark theme using Tailwind-inspired gray palette (`#111827`, `#1f2937`, `#374151`, etc.). Component styles are scoped.

## Deployment

Pushes to `master` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`. Vite `base` path switches between `./` (local) and `/sukromne-vs-firemne-auto/` (GitHub Actions).

## Slovak Tax Parameters (defaults)

- VAT: 23%, Corporate tax: 10%, Dividend tax: 7%
- Km rate: 0.313 EUR/km, Fuel consumption adjustment: +10%

## Task Management

**IMPORTANT**: When working on tasks defined in `TASK.md` files:

1. **Keep task-related files with the task**: All planning documents, implementation notes, and task-specific markdown files should be stored in the same folder as `01-TASK.md`
2. **Separate task files from documentation**: Task planning files (like `XX-PLAN.md`, `XX-IMPLEMENTATION-STATUS.md`, etc.) are NOT documentation
3. **Documentation follows locality principle**: Code documentation follows the locality principle and should be stored alongside the code it documents, not in the task folder

## Markdown File Naming

**IMPORTANT**: When creating new files in `_tasks` directory and sub-directories, use XX-[FILE_NAME].md format (e.g. 01-TASK.md) for easy sorting. Increment XX as needed (per directory) to keep files organized.