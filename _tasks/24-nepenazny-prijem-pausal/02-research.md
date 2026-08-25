# Research: 1% nepeňažný príjem for private use of a company car

**For:** [01-task.md](./01-task.md)

## TL;DR

Slovak income-tax law taxes private use of a company car as a non-cash employment-type
benefit ("nepeňažný príjem zo závislej činnosti"), independent of and unaffected by the 2026
VAT changes researched in [_done/23-pausal-scenario/02-research.md](../_done/23-pausal-scenario/02-research.md).
It is **1% of the car's full VAT-inclusive entry price per started calendar month**, for up to
**8 years**, with the base **shrinking 12.5%/year**. It applies to employees **and** to a
company executive (konateľ) who uses the car privately, even one who draws no salary at all —
but in that no-salary case only **personal income tax** is confirmed owed; **sociálne
poistenie is confirmed NOT owed**; **zdravotné poistenie is genuinely ambiguous** in the
sources found (flagged below, not resolved).

## Legal basis

**§ 5 ods. 3 písm. a) zákona č. 595/2003 Z.z. o dani z príjmov.** Providing a motor vehicle to
an employee (or a konateľ acting in the employee-equivalent capacity under §5) for both
business and private use creates a non-cash income for that person. This is completely
separate from, and unaffected by, the 2026 §49/§85n VAT changes — multiple sources confirm
"zmeny v odpočte DPH neovplyvňujú doteraz uplatňovaný prístup v zdaňovaní použitia automobilu
na súkromné účely z pohľadu dane z príjmov" (the DPH changes do not affect the income-tax
treatment of private car use).

## How the monthly amount is calculated

- **Rate:** 1% of the vehicle's **vstupná cena** (entry price) per **started** calendar month
  the car is available for private use. (0.5% applies only to depreciation-category-0 vehicles
  — BEV/PHEV; not relevant to this app, which has no vehicle-type input.)
- **Vstupná cena** = full acquisition price **including VAT**, "bez ohľadu na výšku
  odpočítanej DPH" (regardless of how much input VAT was actually recovered) — i.e. the 50%
  paušál VAT restriction does **not** reduce this base. Use the app's `carPrice` (gross, with
  VAT) unmodified.
- **The base shrinks over time, on a schedule independent of the app's own depreciation
  curve:** reduced by **12.5% on 1 January of each year**, for **8 consecutive years** from the
  year the car enters service (inclusive). From the 9th year onward, no non-cash income arises
  at all.
  - Year 1 base: 100% of vstupná cena
  - Year 2 base: 87.5%
  - Year 3 base: 75%
  - Year 4 base: 62.5%
  - Year 5: 50%, Year 6: 37.5%, Year 7: 25%, Year 8: 12.5%, Year 9+: 0
- **Annual amount** = 12 x (1% x that year's base) = **12% of that year's base**, if the car is
  available privately for the full year.

## Who owes it, and how it's settled

- Applies to ordinary employees **and** to a **konateľ** using the car privately, per
  financnasprava's own FAQ (Q5/Q7) and multiple independent secondary sources.
- **If the konateľ has no other cash income from the company that year** (no employment
  contract, no odmena za výkon funkcie — i.e. exactly this app's implicit owner persona,
  dividends only): there is nothing to withhold advance tax from, so **income tax is
  self-assessed** — either via ročné zúčtovanie (annual reconciliation) or the konateľ's own
  daňové priznanie (tax return). Confirmed by the financnasprava FAQ and independently by
  podnikajte.sk.

### Sociálne poistenie (social insurance) — confirmed NOT owed in the no-salary case

A konateľ is only treated as "zamestnanec" for **sociálne poistenie** purposes (comprehensive
nemocenské/starobné/invalidné/nezamestnanosť insurance) if their zmluva o výkone funkcie
establishes **"nárok na pravidelný mesačný príjem"** (a right to regular monthly income). Two
independent sources (dauc.sk, sroonline.sk) confirm that a konateľ with **no** cash odmena —
the app's default persona — pays **no sociálne poistenie** at all, on any income including this
benefit. This is a real, favorable simplification: **odvody-sociálne = 0** in the app's default
scenario.

### Zdravotné poistenie (health insurance) — NOT resolved, flagged as uncertain

Sources disagree / are silent on whether zdravotné poistenie specifically attaches to a
car-only non-cash benefit when the konateľ draws no other cash income. Some general
descriptions of the *salaried* case say the benefit "enters the vymeriavací základ for social
**and** health insurance" (implying yes, if you're already a poistenec via that relationship);
other sources on the **no-salary konateľ** case discuss only income-tax settlement and are
silent on zdravotné poistenie specifically for this benefit. Separately, every adult in
Slovakia must be a zdravotné poistenie payer in *some* category (employee, SZČO, samoplatiteľ,
or a state-covered category) regardless of this car benefit — but that obligation exists
independent of the car and isn't something the car creates. **No source found gives a clear,
citable answer for "konateľ, zero cash odmena, car benefit only."** Treated as an open question
— see [Design](./03-design.md) for how this is handled (not modeled by default in v1).

## 2026 rates (for whichever treatment is chosen)

**Personal income tax** (progressive, applies to §5 income; dividends are taxed separately at
7% and are unaffected):

| Bracket (annual) | Rate |
|---|---|
| up to €43 983.32 | 19% |
| €43 983.32 – €60 349.21 | 25% |
| €60 349.21 – €75 010.32 | 30% |
| above €75 010.32 | 35% |

(Thresholds = 154.8x / 212.4x / 264x the 2026 životné minimum of €284.13.) A nepeňažný príjem
of a few thousand EUR/year sits well inside the 19% bracket for a typical case, so **19% is
the correct default rate** unless the owner's other §5 income is already large.

**Odvody, if applicable** (i.e. if the owner *does* draw a regular konateľ odmena — see
Design doc):

| | Employee side | Employer side |
|---|---|---|
| Sociálne poistenie (combined) | 9.4% | 25.2% |
| Zdravotné poistenie (standard) | 5% | 11% |

## Worked example (app defaults: 50 000 EUR car, 4-year hold)

Vstupná cena = 50 000 EUR (full price incl. VAT — unaffected by the paušál 50% VAT recovery).

| Year | Base (vstupná cena x reduction) | Annual nepeňažný príjem (12% of base) | Income tax @ 19% |
|---|---|---|---|
| 1 | 50 000 (x 1.000) | 6 000.00 | 1 140.00 |
| 2 | 43 750 (x 0.875) | 5 250.00 | 997.50 |
| 3 | 37 500 (x 0.750) | 4 500.00 | 855.00 |
| 4 | 31 250 (x 0.625) | 3 750.00 | 712.50 |
| **Total (4y)** | | **19 500.00** | **3 705.00** |

So on the app's own default numbers, the paušál column's `netToOwner` is currently
**overstated by roughly 3 700 EUR over 4 years** (income tax only; +2 808 EUR more, ~6 500
EUR total, if odvody at the 14.4% employee rate are also added — see open question above on
whether that's actually owed in the app's default zero-salary persona).

## Sources

- [Mzdové centrum — Firemné auto na súkromné účely: nepeňažný príjem od 1.1.2026](https://www.mzdovecentrum.sk/aktuality/firemne-auto-na-sukromne-ucely-nepenazny-prijem-od-1-1-2026.htm)
- [financnasprava.sk — Poskytnutie vozidla (FAQ)](https://podpora.financnasprava.sk/573977-Poskytnutie-vozidla-)
- [Podnikajte.sk — Ak zamestnávateľ poskytne firemné auto zamestnancovi aj na súkromné účely, musí mu to zdaniť](https://www.podnikajte.sk/dan-z-prijmov/poskytnutie-firemneho-auta-zamestnancovi-od-1-1-2025)
- [Podnikajte.sk — Konateľ/spoločník a používanie majetku firmy z daňového hľadiska](https://www.podnikajte.sk/dan-z-prijmov/konatel-spolocnik-a-pouzivanie-majetku-firmy-z-danoveho-hladiska)
- [DAUC.sk — Sociálne poistenie a odmena konateľa a spoločníka](https://www.dauc.sk/clanky/5499/socialne-poistenie-a-odmena-konatela-a-spolocnika)
- [SroOnline.sk — Aké odvody platí konateľ a spoločník s.r.o. v roku 2026](https://www.sroonline.sk/ake-odvody-plati-konatel-a-spolocnik-s-r-o-do-socialnej-a-zdravotnej-poistovne)
- [Podnikajte.sk — Odvody zamestnanca a zamestnávateľa od 1.1.2026](https://www.podnikajte.sk/socialne-a-zdravotne-odvody/odvody-zamestnanca-zamestnavatela-od-2026)
- [Podnikajte.sk — Progresívne zdanenie príjmov fyzických osôb od roku 2026](https://www.podnikajte.sk/dan-z-prijmov/progresivne-zdanenie-prijmov-fyzickych-osob-od-2026)
- [Daňové centrum — Nepeňažný príjem konateľa – používanie firemného auta aj súkromne](https://www.danovecentrum.sk/priklad-z-praxe/nepenazny-prijem-konatela-pouzivanie-firemneho-auta-aj-sukromne.htm) (fetch blocked, HTTP 403 — title/topic only, not used as a factual source above)
