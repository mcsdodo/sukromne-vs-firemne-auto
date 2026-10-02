# Research: 1% nepeňažný príjem for private use of a company car

**For:** [01-task.md](./01-task.md)

## TL;DR

Slovak income-tax law taxes private use of a company car as a non-cash employment-type
benefit ("nepeňažný príjem zo závislej činnosti"), independent of and unaffected by the 2026
VAT changes researched in [_done/23-pausal-scenario/02-research.md](../23-pausal-scenario/02-research.md).
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

**This is a personal cost, not a missing cost on the existing paušál column** -- see
[03-design.md](./03-design.md): it only applies to the *alternative* regime (100% company
deduction, owner self-taxed), which the existing 80%-capped paušál column deliberately avoids
by design. On the app's own default numbers (verified against the actual implementation, see
[useCalculator.test.js](../../../src/composables/useCalculator.test.js)), that alternative regime
nets **2,121 EUR less** than the existing 80% paušál over 4 years. The extra 20%
deductibility it unlocks (on depreciation, insurance and maintenance -- not on fuel, see
below) is worth only ~1,584 EUR: the corporate-tax + dividend-tax "shield" on that marginal
deduction, roughly 16.3% of its value. This app's dividend-then-catch-up accounting model does
not pass the full deduction through to dividends. The 3,705 EUR personal-tax cost outweighs
the shield. This holds at any personal income tax rate above roughly 8.1% (the breakeven
point). Slovakia's lowest PIT bracket is 19%, so the trade is a net loss in every realistic
case, not just at these particular defaults.

(History: the first version of this scenario deducted fuel at 100% and showed -1,712 EUR,
shield ~1,993 EUR, breakeven ~10.2%. The 2026-10-02 review below corrected fuel to 80%
(-1,961 EUR, shield ~1,744 EUR, breakeven ~8.9%). The same day, the § 52zzzk fix (undeducted
VAT is not a tax expense, see
[23-pausal-scenario/02-research.md](../23-pausal-scenario/02-research.md)) gave the current
figures.)

## Review 2026-10-02: verification of a third-party summary

A third-party summary of the 1% rule was checked against the primary sources. Every claim in
it is correct. One claim (fuel) changed the calculation.

| Claim | Status | Source | Effect on the app |
|---|---|---|---|
| A konateľ who uses the company car also privately has a 1% nepeňažný príjem under § 5 ods. 3 písm. a) | Confirmed | FS 573977, otázka č. 5 and č. 7 | None. Already modeled. |
| With the 1% regime, § 19 ods. 2 písm. t) (80:20) does not apply, so costs are not cut | Confirmed | FS 523850, otázka č. 5 | None. Already modeled (100%). |
| Without the 1% regime, a car used also privately goes to 80:20 | Confirmed, and it is a choice of the company | podnikajte.sk 2023, FS 523850 otázka č. 7 | None. The Paušál 50/80 column. |
| Fuel (PHL) is a separate regime: private fuel is not automatically deductible, even with the 1% | Confirmed | FS 523850, otázka č. 5 | **Changed.** The 1% scenario now deducts fuel at 80%, not 100%. |
| 80% PHL paušál does not mean 20% private use | Confirmed | FS 523850, otázka č. 2 | None. |
| 1% for 8 years, the base drops 12.5% each year, 0.5% for odpisová skupina 0 | Confirmed | FS 573977 | None. EV stays a non-goal. |

### Fuel (PHL) under the 1% regime

FS 523850, otázka č. 5 (employer taxes the 1% benefit), verbatim:

> V tomto prípade daňovník nepostupuje podľa § 19 ods. 2 písm. t) zákona o dani z príjmov.
> Výdavky na spotrebované pohonné látky môže daňovník uplatňovať vo forme paušálnych výdavkov
> do výšky 80 % z celkového preukázaného nákupu PHL v závislosti od pomeru využívania vozidla
> na súkromné účely zamestnanca.

The same page lists fuel separately from the § 19 ods. 2 písm. t) regime:

> výdavky na spotrebované pohonné látky, ktoré sú daňovými výdavkami podľa § 19 ods. 2 písm. l) zákona o dani z príjmov,

Effect: depreciation, insurance and maintenance are 100% deductible, but fuel is at most
80%. The cap goes lower if private use is more than 20% (otázka č. 3: at 60% business use,
fuel is 60%). The app assumes private use <= 20%, the same as the Paušál 50/80 column.

FS 523850, otázka č. 2, verbatim:

> Ak daňovník uplatňuje výdavky na spotrebu PHL vo výške 80 % z celkového preukázaného nákupu PHL, nie je tým deklarované, že vozidlo využíva aj na súkromné účely.

### Is the 1% regime mandatory or a choice?

podnikajte.sk (6.6.2023) describes it as a choice of the company, verbatim:

> Pokiaľ konateľ/spoločník spoločnosti využíva firemné vozidlo aj na súkromné účely, spoločnosť (zamestnávateľ) môže postupovať v súlade s § 5 ods. 3 zákona o dani z príjmov

> V prípade, že spoločnosť nezohľadní užívanie vozidla na súkromné účely konateľovi/spoločníkovi formou zdanenia nepeňažného príjmu, bude uplatňovať postup krátenia výdavkov

So the app keeps both columns as alternatives. FS 573977 otázka č. 5 is phrased more
strictly ("nepeňažným príjmom ... konateľa ... je aj suma vo výške 1 %"). If an advisor
reads it as mandatory, the Paušál 50/80 column is not available for a konateľ who uses the car
privately. The app does not decide this; it shows both.

### Year 9 and later

FS 523850, otázka č. 7: from the 9th year the 1% stops and § 19 ods. 2 písm. t) applies again
("je povinný postupovať v súlade s § 19 ods. 2 písm. t)"). The app's years input stops at 8,
so this case never occurs in the app.

### Calendar year, not ownership year

FS 573977 states the 12.5% cut happens "k prvému dňu príslušného kalendárneho roka", and year 1
is the calendar year of zaradenie do užívania. The app uses the ownership year (year 1 = first
12 months). The two are equal only for a car bought in January. For a car bought later in the
year, the app slightly overstates the benefit.

## Sources

- [Mzdové centrum — Firemné auto na súkromné účely: nepeňažný príjem od 1.1.2026](https://www.mzdovecentrum.sk/aktuality/firemne-auto-na-sukromne-ucely-nepenazny-prijem-od-1-1-2026.htm)
- [financnasprava.sk — Poskytnutie vozidla (FAQ)](https://podpora.financnasprava.sk/573977-Poskytnutie-vozidla-) ("FS 573977")
- [financnasprava.sk — Uplatňovanie paušálnych výdavkov na majetok osobnej potreby (FAQ)](https://podpora.financnasprava.sk/523850-Uplat%C5%88ovanie-pau%C5%A1%C3%A1lnych-v%C3%BDdavkov-na-majetok-osobnej-potreby) ("FS 523850")
- [Podnikajte.sk — Ak zamestnávateľ poskytne firemné auto zamestnancovi aj na súkromné účely, musí mu to zdaniť](https://www.podnikajte.sk/dan-z-prijmov/poskytnutie-firemneho-auta-zamestnancovi-od-1-1-2025)
- [Podnikajte.sk — Konateľ/spoločník a používanie majetku firmy z daňového hľadiska](https://www.podnikajte.sk/dan-z-prijmov/konatel-spolocnik-a-pouzivanie-majetku-firmy-z-danoveho-hladiska)
- [DAUC.sk — Sociálne poistenie a odmena konateľa a spoločníka](https://www.dauc.sk/clanky/5499/socialne-poistenie-a-odmena-konatela-a-spolocnika)
- [SroOnline.sk — Aké odvody platí konateľ a spoločník s.r.o. v roku 2026](https://www.sroonline.sk/ake-odvody-plati-konatel-a-spolocnik-s-r-o-do-socialnej-a-zdravotnej-poistovne)
- [Podnikajte.sk — Odvody zamestnanca a zamestnávateľa od 1.1.2026](https://www.podnikajte.sk/socialne-a-zdravotne-odvody/odvody-zamestnanca-zamestnavatela-od-2026)
- [Podnikajte.sk — Progresívne zdanenie príjmov fyzických osôb od roku 2026](https://www.podnikajte.sk/dan-z-prijmov/progresivne-zdanenie-prijmov-fyzickych-osob-od-2026)
- [Daňové centrum — Nepeňažný príjem konateľa – používanie firemného auta aj súkromne](https://www.danovecentrum.sk/priklad-z-praxe/nepenazny-prijem-konatela-pouzivanie-firemneho-auta-aj-sukromne.htm) (fetch blocked, HTTP 403 — title/topic only, not used as a factual source above)
