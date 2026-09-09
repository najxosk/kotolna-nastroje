# 02 — Alarm decision tree

## Cieľ
Pri alarme/symptome rýchla vetva: čo skontrolovať prvých 30 s → potom → kedy volať. Hlavne pre **nováčikov**, aby sa zorientovali.

## Problém
Manuál je hrubý; pod stresom treba 3–5 kontrol v poradí, nie teóriu.

## Cieľový používateľ
Nový operátor; zaskakujúci kolega; ty keď chceš zjednotiť „ako to u nás robíme“.

## MVP
- Zoznam alarmov/symptómov + vyhľadávanie
- Pre každý: strom ÁNO/NIE kontrol
- Na konci: pravdepodobná príčina + čo zapísať do hlásenia
- Offline HTML

## Mimo scope (v1)
- Napojenie na reálny alarmový systém
- Automatická diagnostika z PLC

## Príklady v `demo.html` (PLACEHOLDER — nie vaše alarmy)
1. Plameň zhasol / strata plameňa
2. Nízky tlak pary
3. Vysoká hladina v bubne

**Bezpečnosť:** demo nie je postup ani náhrada predpisu (lockouty, permissives, kto smie reštart). Nováčik to nesmie brať ako ostré. Ostré stromy až po textoch z vášho panelu + potvrdení od operátora.

## Technický návrh
Statický `demo.html` (hotový stub) → neskôr `data/alarms.json` generovaný z obsahu od operátora.

## Otvorené otázky
1. Top 10 alarmov čo vás najviac žerú (presné texty z panelu)?
2. Čo *ty* robíš ako prvé pri každom z nich?
3. Kedy je povinné volať majstra / pohotovosť?

## Acceptance v1
- Nováčik prejde 1 strom za < 2 min bez vysvetľovania.
- Každý list stromu má „čo zapísať“.
