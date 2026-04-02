# Car Sale / Ownership Period Analysis

**Status:** 📋 Planning

## Analysis

### Selling vs. not selling

The sale affects the two scenarios **very differently**:

**Private sale:** Owner gets 100% of the sale price. No tax — it's a private asset sale in Slovakia.

**Company sale:** Triple-taxed. From e.g. a €24,000 sale:
1. VAT to state: -€4,488 (23%)
2. Corporate tax: -€1,951 (10% of remainder)
3. Dividend tax: -€1,229 (7% of remainder)
4. Owner actually receives: **€16,332** (~68% of sale price)

So selling strongly favors the private scenario — the owner keeps 100% vs ~68%. The higher the residual value, the bigger this gap.

**If you don't sell:** Private is hurt more, because the owner ate the full VAT on purchase and never recovers any of it. The company at least recovered VAT on purchase and got tax deductions from depreciation. Not selling effectively eliminates the private scenario's biggest advantage.

### Ownership period dynamics

**Company car front-loads its benefits:**
- Years 1-4 (during depreciation): huge deductions → much lower taxable profit → big advantage
- Years 5+: depreciation gone, only running costs deductible → advantage per year drops sharply

**Private car is steady:**
- Same reimbursements every year, same costs — relatively flat annual benefit

So the company car "earns" most of its advantage in the first 4 years, then coasts. Extending ownership dilutes the company's average annual advantage while the private car's remains constant.

### What the calculator gets wrong (or simplifies)

The current model **forces the same ownership period for both** and **always assumes a sale**. In reality:

1. **Company cars are often replaced at the end of depreciation** (4 years) — because after that the tax advantage drops. A company owner might buy a new car every 4 years.

2. **Private cars are often kept longer** (6-8 years) — because there's no tax incentive to replace them.

3. **Not selling is a real scenario** — especially for the company car that's fully depreciated and kept as a runabout.

4. **The comparison period should arguably be the same calendar span but with different strategies** — e.g., "over 8 years: private buys 1 car, company buys 2" or "company car kept 4 years then sold, private car kept 4 years then sold."

### Where this shifts the winner

| Scenario | Favors |
|----------|--------|
| Short hold, high residual, sell | Private (100% sale vs ~68%) |
| Long hold, low residual, sell | Company (accumulated tax savings dominate) |
| Don't sell at all | Company (no private sale advantage to offset tax benefits) |
| Expensive car | Company (VAT recovery on €11,500 VAT matters) |
| High mileage | Private (bigger reimbursement deductions) |

### What could be improved in the calculator

The most impactful change would be allowing **"don't sell" as an option** (currently there's no way to model this). This would show a meaningfully different comparison.

Separate ownership periods per scenario would be more realistic but adds complexity — might confuse more than it helps.
