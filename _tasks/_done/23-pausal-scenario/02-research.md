# Research: How paušalizácia výdavkov works in Slovak tax law

**For:** [01-task.md](./01-task.md) open question 2 (and confirming the 50/80 rates).

## TL;DR

The "50/80" is **two separate flat-rate regimes** that happen to be combined for a mixed-use
(business + private) passenger car:

| Side | Rate | Legal basis | In force |
|------|------|-------------|----------|
| **Income tax** deductibility of car costs | **80%** | §19 ods. 2 písm. t) (assets) + písm. l) (fuel), zákon 595/2003 Z.z. | long-standing |
| **VAT** input deduction | **50%** | §49 ods. 5 + §85n zákona o DPH (EU derogation) | **NEW from 1.1.2026**, valid until 30.6.2028 |

Both apply when the car is used **also** for private purposes and the payer does **not** keep
detailed records proving exclusive business use. No logbook required — that's the whole point
of the paušál. The alternative (100% column) requires a logbook / detailed electronic records
proving exclusive business use.

So the three columns are legally coherent:
- **Firemné 100%** — logbook kept, exclusive business use → full VAT + full deduction
- **Paušál 50/80** — no logbook, mixed use → 50% VAT, 80% tax deduction
- **Súkromné** — owner's private car, reimbursements

## The 80% income-tax side (confirmed)

§19 ods. 2 písm. t) lets the taxpayer deduct **80% of acquisition, technical improvement,
operation, repairs and maintenance** — **including depreciation (odpisy)** — *without proving
the actual business ratio*. The financnasprava FAQ is explicit: "depreciation is applied to
tax deductions only at 80% of the calculated annual amount, regardless of the actual private
use ratio."

**This confirms the calculator's design:** in the paušál column the write-off **and** running
costs are multiplied by **0.80**.

Nuances (acceptable to simplify, but worth noting):
- The 80%-on-assets rule (písm. t) technically **excludes fuel and motor vehicle tax**; fuel
  has its own 80% flat under písm. l), and motor-vehicle tax is fully (100%) deductible.
  Net effect for the calculator: fuel + maintenance + depreciation at 80% is correct; only
  road tax (not currently a separate input) would differ.
- Cars over €48,000 have an extra tax-base adjustment (§17 ods. 34) — out of scope.

## The 50% VAT side (new 2026 rule — confirmed)

From 1.1.2026, input VAT is deductible at a flat **50%** for M1/L1e/L3e vehicles used partly
privately, applied to **both the purchase and all related goods/services** (fuel, repairs,
maintenance, tyres, washing). Full 100% needs detailed electronic records of exclusive
business use + mandatory notification to the tax office.

**This confirms the calculator's design:** VAT recovery (purchase + running costs) × **0.50**.

## Sale handling — answer to open question 2

This is the important, non-obvious finding. When a car bought under the **50% VAT** regime is
**sold within 5 years**, two things happen:

1. **Output VAT:** the seller charges **full 23% VAT on the entire sale price** — same as the
   current company scenario. No reduction.
2. **§54 adjustment (oprava odpočítanej dane):** because the sale is a fully taxable supply,
   the seller may **additionally reclaim** the proportional part of the input VAT that was
   *not* deducted at purchase, for the remaining years of the 5-year adjustment period.

   **Official example:** car €20,000 + €4,600 VAT; 50% deducted at purchase = €2,300.
   Sold the following year → additional deductible VAT via §54 = **€1,840**
   ( = the undeducted €2,300 × 4/5, i.e. 4 remaining years of the 5-year period ).

### Implication for the model

The paušál column's headline disadvantage (only 50% VAT recovered up front) is **partially
clawed back on sale**. The undeducted half of the *purchase* VAT is refunded pro-rata:

```
adjustment = (vatAmount × 0.50) × (5 − yearsOwnedAtSale) / 5      // floor at 0; only if sold ≤ 5y
```

- Sold at end of depreciation (4 years): refund = undeducted-half × 1/5.
- Sold after 5+ years: no adjustment (period elapsed) — only full output VAT on sale.
- (The 50% restriction on *running-cost* VAT is not adjusted — only the capital asset is.)

So in [useCalculator.js](../../src/composables/useCalculator.js) the paušál sale needs the
**same full-23%-output-VAT** treatment as the company scenario **plus** this §54 input-VAT
refund term. The 100% column has no such adjustment (it already deducted everything).

## Open question 2 — RESOLVED

- Output VAT on sale: **full 23%**, identical to company scenario.
- Plus a §54 input-VAT refund of the undeducted purchase-VAT half, pro-rated over the
  remaining 5-year period. Model per the formula above.

## Review 2026-10-02: undeducted VAT is not a tax expense (§ 52zzzk ZDP)

The first implementation put the undeducted 50% VAT into the depreciation base, and deducted
the undeducted VAT on running costs at 80%. From 1.1.2026 this is not correct.
FS 45/DZPaU/2025/MU, verbatim:

> Daň z pridanej hodnoty sa podľa § 52zzzk zákona o dani z príjmov nepovažuje za daňový výdavok, ak na jej odpočítanie nemá platiteľ dane z pridanej hodnoty nárok, pričom ak ide o daň z pridanej hodnoty vzťahujúcu sa na hmotný majetok vymedzený v § 85n zákona o dani z pridanej hodnoty, táto nie je súčasťou daňovej vstupnej ceny.

Príklad č. 1 (car for 24 600 EUR incl. 4 600 EUR VAT, 50% deducted):

> Daňovník pri výpočte daňových odpisov podľa § 19 ods. 3 písm. a) zákona o dani z príjmov vychádza z daňovej vstupnej ceny vo výške 20 000 eur.

Príklad č. 3 (fuel for 12 300 EUR incl. 2 300 EUR VAT, no logbook, 80% PHL paušál):

> Daňovník si uplatní daňové výdavky spôsobom podľa § 19 ods. 2 písm. l) tretí bod zákona o dani z príjmov a do daňových výdavkov zahrnie sumu 8 000 eur (80 % zo sumy 10 000 eur).

The rule covers cars bought from 01.01.2026 to 30.06.2028 ("ak daňovník obstará v období od
01.01.2026 do 30.06.2028 hmotný majetok podľa § 85n ods. 1"). For fuel, it also covers cars
bought before 2026.

Fix in the app: depreciation = price without VAT x taxPercent, running cost deduction = price
without VAT x taxPercent. The undeducted VAT stays a cost (`nonDeductibleCost`,
`nonDeductibleRunning`) but is not deducted.

The 1% nepeňažný príjem base does not change: FS 573977 otázka č. 1 says "Akýkoľvek nepeňažný
príjem zamestnanca (suma vo výške 1%, ...) sa vyčísľuje vždy s DPH."

Effect at the app defaults (50k car, 4 years): Paušál 50/80 298,909 -> 298,167 EUR,
Paušál 50/100 + 1% 296,948 -> 296,047 EUR. Firemné 100% does not change. Súkromné
(298,459) now beats Paušál 50/80.

## Sources

- [financnasprava.sk — Metodické usmernenie 45/DZPaU/2025/MU (§ 52zzzk, DPH podľa § 85n)](https://www.financnasprava.sk/_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Dane/Metodicke_usmernenia/Priame_dane/2025/2025.12.19_45_DZPaU_2025_MU.pdf)

- [financnasprava.sk — Uplatňovanie paušálnych výdavkov na majetok osobnej potreby (80%, incl. depreciation)](https://podpora.financnasprava.sk/523850-Uplat%C5%88ovanie-pau%C5%A1%C3%A1lnych-v%C3%BDdavkov-na-majetok-osobnej-potreby)
- [financnasprava.sk — PHL/spotreba (80% fuel, §19 ods 2 písm. l)](https://podpora.financnasprava.sk/481195-Spotreba-pohonn%C3%BDch-l%C3%A1tok-u-motorov%C3%A9ho-vozidla-zahrnut%C3%A9ho-do-obchodn%C3%A9ho-majetku)
- [RSM SK — Paušálny odpočet DPH pri osobných vozidlách: kedy 50 % a kedy 100 %](https://rsmsk.sk/blog/pausalny-odpocet-dph-pri-osobnych-vozidlach-kedy-50-a-kedy-100)
- [Podnikajte.sk — Od 1.1.2026 sa zásadne mení odpočet DPH na firemné autá (incl. §54 sale example)](https://www.podnikajte.sk/dan-z-pridanej-hodnoty/obmedzenie-odpoctu-dph-na-auta-od-2026)
- [finlex.sk — Auto v podnikaní od 1.1.2026: 50 % DPH a nové pravidlá evidencie](https://www.finlex.sk/auto-v-podnikani-od-1-1-2026-50-dph-a-nove-pravidla-evidencie/)
- [Finančné riaditeľstvo SR — Metodické usmernenie 3/DPH/2025/MU (PDF)](https://www.financnasprava.sk/_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Dane/Metodicke_usmernenia/Nepriame_dane/2025/2025.12.19_003_DPH_2025_MU_OMV.pdf)
