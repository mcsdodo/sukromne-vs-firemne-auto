# Add All Settings to URL Hash

**Status:** 🟡 In Progress

## Problem

Only 4 parameters (income, car, usage, km) are synced to the URL hash. Advanced settings changes are lost when sharing links.

## Requirements

Add all remaining settings (except depreciation graph) to URL hash sync. Default values are omitted from URL to keep links clean.

### New parameters

| Parameter | Hash key | Default |
|-----------|----------|---------|
| Years | `years` | 4 |
| Km rate | `kmrate` | 0.313 |
| Fuel price | `fuel` | 1.5 |
| Insurance | `ins` | 1500 |
| Maintenance | `maint` | 600 |
| Fuel consumption | `cons` | 5.1 |
| Consumption adjustment | `consadj` | 0.10 |
| VAT rate | `vat` | 0.23 |
| Company tax low | `taxlow` | 0.10 |
| Company tax high | `taxhigh` | 0.21 |
| Dividend tax | `divtax` | 0.07 |
| Depreciation years | `depyrs` | 4 |

### Existing parameters (unchanged)

| Parameter | Hash key | Default |
|-----------|----------|---------|
| Yearly income | `income` | 100000 |
| Car price | `car` | 50000 |
| Business usage | `usage` | 1.0 |
| Km per year | `km` | 25000 |

### Out of scope

- Depreciation curve (graph values)
