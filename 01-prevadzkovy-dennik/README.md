# 01 — Prevádzkový denník

## Cieľ
Hrubý prehľad toho, čo sa na kotli dialo: kedy nabehol, kedy a prečo sa odstavil, kedy znovu nabehol, plus občasný mesačný stav. **Nie** checklist krokov štartu.

## Problém
V teplárni chýba jednoduchý spoločný zápis udalostí. Papier/Excel sa stráca alebo nie je jednotný — nie je všeobecný timeline jednotky.

## Cieľový používateľ
Operátor na zmene, majster pri spätnom pohľade, nováčik „čo sa tu dialo tento mesiac“.

## MVP
- Tabuľka (HTML alebo `.xlsx` šablóna) so stĺpcami:
  - dátum/čas
  - typ udalosti: `NÁBEH` | `ODSTAVENIE` | `OPÄTOVNÝ NÁBEH` | `MESAČNÝ STAV` | `POZNÁMKA`
  - kotol / jednotka (ak ich je viac)
  - príčina odstavenia (pri odstavení)
  - kľúčové hodnoty (voliteľné: tlak, teplota, výkon — podľa toho čo meriate)
  - kto zapísal
- Filtrovanie podľa mesiaca
- Export CSV / tlač

## Mimo scope (v1)
- Automatické napojenie na SCADA
- Detailný postup nábehu po krokoch
- Schvaľovací workflow

## Dátové vstupy
Ručný zápis pri udalosti (zriedka) + 1× mesačne stav. Nie hodinový log.

## UI (textová skica)
Horný riadok: [+ Nábeh] [+ Odstavenie] [+ Mesačný stav]  
Pod tým tabuľka chronologicky (najnovšie hore). Klik na riadok = detail/poznámka.

## Technický návrh
Jeden `index.html` **alebo** Excel šablóna `dennik-sablona.xlsx` na zdieľanom disku zmeny.

**Ukladanie (dôležité):** čistý `localStorage` nestačí na spoločný zápis — po vyčistení prehliadača / inom PC zmizne. v1 musí mať povinný **export/import CSV** (a ideálne súbor na share). `localStorage` len ako dočasná cache medzi exportmi. Bez servera.

## Otvorené otázky pre operátora
1. Koľko kotlov/jednotiek treba rozlišovať a ako sa volajú?
2. Aké 3–5 hodnôt chcete pri mesačnom stave?
3. Zoznam typických príčin odstavenia (dropdown)?

## Acceptance v1
- Vieš za 30 s zapísať odstavenie s príčinou.
- Za mesiac vidíš timeline všetkých nábehov/odstavení.
- Ide to otvoriť v prehliadači bez inštalácie.
