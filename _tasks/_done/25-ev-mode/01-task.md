# EV mode (BEV) and the "Zdôvodnenie a zdroje" section

**Status:** ✅ Complete

## Problem

The calculator modeled only a combustion car: fuel in L/100km and EUR/L. A battery electric
car (BEV) changes the energy cost and several tax rules. The user also asked for a section at
the bottom of the page that explains each column, with links to the laws and FS guidance.

## Decisions (agreed with the user, 2026-10-02)

- **Full EV mode:** one switch "Typ pohonu: Spaľovací / Elektromobil" changes all EV rules
  together. The four columns stay.
- **BEV only.** PHEV is out of scope (it needs fuel and electricity with an electric share).
- **Home/public charging mix:** four inputs, shown under the switch in EV mode.

| Input | Ref | URL key | Default | Basis |
|---|---|---|---|---|
| Typ pohonu | `isEv` (0/1) | `ev` | 0 | 0/1, because the URL sync stores numbers only |
| Spotreba (kWh/100km) | `evConsumption` | `evcons` | 17 | Vehicle document consumption, § 7 ods. 6 písm. e) 283/2002 |
| Domáce nabíjanie (EUR/kWh) | `homeChargePrice` | `homep` | 0.17 | ŠÚ SR reference price 0.173 (Jan to Mar 2026) |
| Verejné nabíjanie (EUR/kWh) | `publicChargePrice` | `pubp` | 0.55 | ŠÚ SR weekly prices: AC 0.41, DC 0.55 to 0.69 |
| Podiel domáceho nabíjania | `homeChargeShare` | `homesh` | 0.7 | Assumption, editable |

## Rules in EV mode

All sources and verbatim quotes are in [02-research.md](./02-research.md).

| Rule | Implementation |
|---|---|
| Energy | `kWh = km / 100 x kWh/100km x (1 + consumptionAdjustment)`. The +10% comes from § 7 ods. 6 písm. e) |
| Private column | Reimbursement = 0.313 EUR/km + energy cost (the same as fuel). The owner pays the energy cost |
| Company VAT on energy | Public charging: VAT recovered at the column's `vatPercent`. Home charging: no VAT recovery, because the bill is not addressed to the company (§ 51 ods. 1 písm. a) DPH). The gross home amount is the cost |
| Company deduction on energy | (public without VAT + home gross) x `fuelTaxPercent`. Electricity is a pohonná látka (FS 13/PO/2022/IM), so the 80% PHL paušál applies in both paušál columns |
| Depreciation | The switch sets `depreciationYears` to 2 (odpisová skupina 0), and back to 4 for ICE. The user can change it afterwards. The switch handler does this, not a watcher, so a shared URL keeps its own value |
| Nepeňažný príjem | 0.5% instead of 1% (`nepenaznyPrijemRate`) |

Code: `energyCost` in [useCalculator.js](../../../src/composables/useCalculator.js) returns
`{ vatable, home }`. For ICE, `home` is 0 and `vatable` is the fuel cost, so the ICE numbers do
not change. `fuelCost` stays the total.

## Known limits (not modeled)

- **Price of home electricity with or without VAT:** the source does not say if the ŠÚ 0.173
  includes VAT. The app treats all prices as gross.
- **§ 19 ods. 2 písm. l) bod 3 for electricity:** no FS example applies the 80% PHL paušál to an
  EV directly (confidence "partial"). One adviser says bod 4 (home charging at the ŠÚ price)
  cannot be combined with bod 3 (80% paušál). The app applies 80% to all electricity.
- **Private charging on the company's cost** is a nepeňažný príjem on top of the 0.5%
  (FS 13/PO/2022/IM). The app assumes the energy cost covers business km only, as for fuel.
- **Residual value curve:** EVs may lose value faster. The curve stays user-editable; no EV
  default.
- **Daň z motorových vozidiel:** 0 EUR for a BEV, but the app does not model road tax for any car.
- **§ 17 ods. 34 (48 000 EUR):** applies to EVs too, but only when the tax base is low.

## "Zdôvodnenie a zdroje" section

[SourcesSection.vue](../../../src/components/SourcesSection.vue), at the bottom of the page.
One block per column and one block for the common assumptions. Each line links the law
(slov-lex) or the FS guidance. The EV lines (skupina 0, 0.5%, home charging VAT, electricity
as PHL) show only in EV mode.

Law sections checked against the 2026 ZDP text during this task:
- § 5 ods. 5 písm. a): travel reimbursement is not taxable ("nie je predmetom dane ani a) cestovná náhrada ...").
- § 19 ods. 2 písm. d): travel reimbursements are a tax expense ("d) cestovné náhrady do výšky, na ktorú vzniká nárok podľa osobitných predpisov").
- Príloha č. 1: skupina 0 item 0-1 (BEV, PHEV), skupina 1 item 1-24 ("Osobné automobily okrem" BEV/PHEV).

## Also in this change

- Top sliders in a 2 x 2 grid on wide screens (one column below 800px).
- The card label "odpisy (... ÷ Nr)" shows `depreciationYears`. Before, it showed `min(years, 4)`, which was wrong for a 2-year depreciation.
