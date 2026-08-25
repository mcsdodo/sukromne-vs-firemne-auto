# Nepeňažný príjem (1% pravidlo) for the paušál (50/80) scenario

**Status:** 📋 Planning

## Problem

The calculator's `pausalScenario` ([useCalculator.js](../../src/composables/useCalculator.js))
models "paušalizácia výdavkov" — a company car used **also for private purposes**, no logbook,
50% VAT / 80% income-tax deduction on the company side (see
[_done/23-pausal-scenario](../_done/23-pausal-scenario/)).

That task only modeled the **company's** side of mixed use (VAT recovery, depreciation
deductibility). It did **not** model the **owner's personal** side: Slovak tax law treats
private use of a company car as a taxable non-cash benefit (**nepeňažný príjem**) to the
person who gets to drive it — 1% of the car's entry price per month, added to their personal
taxable income and (in some cases) subject to odvody.

**Confirmed: the app currently accounts for none of this.** `netToOwner` for `pausalScenario`
already assumes the owner personally captures the full benefit of mixed use with no offsetting
personal tax cost. This overstates how attractive the paušál column looks relative to the
100%-logbook column (which legally requires *no* private use, so no benefit-in-kind arises
there) and relative to the private-car column (no benefit-in-kind concept applies to a
privately owned car at all).

## Why this matters specifically for the 50% (paušál) case

- **Firemné 100%** — logbook proves exclusive business use → no private use conceded → no
  nepeňažný príjem.
- **Paušál 50/80** — explicitly admits mixed use, no logbook → this is exactly the fact pattern
  the 1% rule taxes.
- **Súkromné** — privately owned car, not a company asset → rule doesn't apply.

So the gap is isolated to one of the three columns.

## Scope

1. ✅ Research the Slovak legal rules precisely (rate, base, how the base changes over time, who
   owes it, income tax vs. odvody treatment) — see [02-research.md](./02-research.md).
2. ✅ Quantify the actual euro cost for the app's default scenario (50 000 EUR car, 4 years) —
   see [02-research.md](./02-research.md) worked example.
3. Design + plan how to fold this into `pausalScenario`'s `netToOwner` and per-year breakdown
   (not yet started — next: `03-design.md`, `04-plan.md`).

## Non-goals (this task)

- Electric vehicles (0.5% rate) — the app has no vehicle-type input; out of scope.
- Modeling a full payroll subsystem (regular konateľ salary, PAYE withholding mechanics) — the
  app has never modeled owner salary; see design doc for how this is kept simple.

**Source:** user request, 2026-08-24.
