# 03 — Optimalizácia z hodinových dát

## Cieľ
Z **uloženého hodinového archívu** (nie z ručného ťukania) počítať pomery a trendy: plyn/vzduch, voda/para, výkon — a hľadať ako efektívniť prevádzku.

## Problém
Nikto nechce každý deň vypĺňať formulár. Dáta už niekde vznikajú (SCADA, zapisovač, export). Tool ich má **čítať** a premýšľať nad efektívnosťou.

## Cieľový používateľ
Operátor / energetik, ktorý chce vidieť „kde nám to žerie“ bez Excel tortúry.

## MVP
- Import CSV s hodinovými riadkami (pozri `sample-data/hourly-example.csv`)
- Prehľad: merná spotreba paliva, pomer para/napájacia voda, hrubý air/fuel proxy ak sú stĺpce
- Jednoduchý trend (48–168 h)
- Flag „mimo pásma“ oproti mediánu v sample (pásma označené ako príklad)

## Mimo scope (v1)
- Priame napojenie na PLC (neskôr)
- Autonómne riadenie horáka
- Ručný hodinový denník

## Očakávané stĺpce (príklad — upraviť podľa reality)
`timestamp, gas_nm3, air_flow, feedwater_th, steam_th, load_mw, flue_o2_pct, running`

- `feedwater_th` / `steam_th` = **prietok t/h** (nie teplota). Pomer para/napájacia voda má zmysel len z prietokov.
- `running` = 0/1 (odstav vs beh). Ak chýba, tool odhadne beh z load.
- Sample CSV je syntetický — **nebrať z neho pásma ako fakty**.
- Flag „vysoká merná“ počítať len v hodinách behu; nábeh/odstav mimo štatistiky.

Presné mená a jednotky potvrdí operátor pred ostrým nasadením.

## Technický návrh
Statický `index.html` načítajúci CSV (File API). Neskôr: dohodnutý priečinok exportu zo SCADA.

## Otvorené otázky
1. Odkiaľ viete dnes vytiahnuť hodinový export (systém, formát, kto má prístup)?
2. Aké veličiny reálne máte (plyn, vzduch, O₂, para, voda, výkon)?
3. Čo je pre vás „dobrá“ vs „zlá“ zmena — aspoň pocitovo?

## Acceptance v1
- Načíta sample CSV a ukáže aspoň 3 metriky + jednoduchý graf/trend.
- Žiadne povinné ručné hodinové polia.
