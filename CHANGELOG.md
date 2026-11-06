# HASHPOOL — Changelog / Projekt-Protokoll

**Regel:** Bei neuen Loader-Patches **nie** ältere Patches entfernen (additive only).

---

## 2026-11-02 — NEXT: Shop-Simulator (nur unter /next/)

### Neu (alles unter `next/`, öffentliche Version unverändert)
- `js/parts3d/shopScene.js` — 3D-Laden-Overlay mit Kunden (eigenes Aussehen) als Vorstufe
- `next/world.js` — Erste-Person-Laden: Laden vorne, Hinterraum (Bestell-Computer, Regal, Bautisch, Farm-Tür), Texturen, Schaufenster, Poster, Podest, Joystick/Wischen, Auto-Lauf über Türen (Raumgraph), Erweiterungs-API `Parts3D.nextWorld.S` (rects/obst/ticks/G/invShow/err)
- `next/env.js` — begehbare Straße: Bürgersteig, fahrende Autos (halten vor dem Spieler), Passanten, Bäume, Laternen, Bänke, Häuser gegenüber, Nachbarn, Hof mit Zaun, Sternenhimmel. Kill-Switch `?noenv=1`
- `next/logistics.js` — Lieferung statt Sofort-Lager: Teile im Teile-Shop bestellen → nach ~25 s im Abholladen (Gebäude rechts neben dem Laden) → abholen (tragen, max. 12) → am Regal im Hinterraum einräumen (erst dann in `state.partInv`). Ledger `localStorage hashpool-next-logi-v1`. Kill-Switch `?nologi=1`
- `next/clicker.js` — Buzzer-Tisch (löst `#mine-btn` aus), Wand-Bildschirm, Upgrade-Tablet mit den **Original-Upgrades 1:1** (Kaufen klickt die echten Shop-Zeilen), jedes Upgrade sichtbar: Klick-Upgrades am Tisch, Miner im Wandregal, Container-Farm + Solarpark im Hof
- `next/clickfix.js` — Buzzer-Tippen dreht die Kamera nicht mehr
- `next/next.js` — lädt alles lokal (kein jsDelivr-Pin mehr); Kill-Switches `?noworld ?noenv ?nologi ?noclicker`
- `next/extras.js` — Ziel-Anzeige mit Pfeil, Minikarte, synthetischer Ton (Knopf 🔊/🔇), Qualität Auto/Hoch/Niedrig, Tag/Nacht-Zyklus (12 min), Position wird gemerkt. Kill-Switch `?noextras=1`
- `next/world.js` — Buzzer-Tisch/Bildschirm fest im Kern, Tempo erhöht, Modulstatus unten rechts, dauerhafte Fehlerzeile; `next/clicker.js` — mehr Upgrade-Grafiken
- NEXT Grafik-Update: abgerundete Kanten (Extrude-Fase) für alle kleinen Quader, feinere Zylinder/Kugeln, Luefter mit Fluegeln, Kabel (Tube), Wanduhr, Rohre/Lueftung, Schreibtisch- und Theken-Details, detailreichere Fassaden/Daecher, Autos mit Reifen/Felgen/Spiegeln, Baeume, Laternen, Fahrrad, Ampel, Briefkasten, Pflanzkuebel; Buzzer als Kuppel, Spitzhacken mit gebogenem Kopf. Niedrig-Qualitaet (Neustart) nutzt wieder glatte Quader
- NEXT Ton: Schritte neu (Tiefton + dumpfes Schleifen), Kunden-"Blabla" (Silbenton je 2 Buchstaben, eigene Stimme), Dialogtext wird getippt (Antippen ueberspringt), Kunde nickt beim Reden; Minikarte entfernt
- NEXT Simulator: Warteschlange (bis 3 Kunden, Platz je nach Ruf), Geduld (😠 nach 60 s, genervt = -8 ⭐), Ruf ⭐ 0-100 (+6 Auftrag angenommen, +10 geliefert; hoeher = mehr Kundschaft), Statistik-Tafel an der Trennwand (Besucher/Auftraege/geliefert/veraergert), alles in localStorage
- NEXT sim.js: Regen (zufaellig, Nebel dichter, mehr Kundschaft), Lieferwagen faehrt am Abholladen vor wenn eine Bestellung abholbereit wird, Zufalls-Ereignisse (Stammkunde, Zeitung, Express-Zustellung). Statistik-Tafel auf freie linke Wand verschoben (hing vor den Postern). Kill-Switch ?nosim
- NEXT sim2.js: Chef-Büro-Terminal im Laden (rechts bei der Theke): Lagerhilfe (Figur hinter der Kasse, räumt abholbereite Lieferungen automatisch ein), Einrichtung (Teppich, LED-Band, Neon, Pflanzen, je +4 ⭐), Werbung (15 Min mehr Kundschaft). Einmalkosten vom echten Kontostand, keine laufenden Kosten. Kill-Switch ?nosim2
- NEXT Lade-Fix (wichtigste Ursache fuer "kein Ton / Dreh-Bug / Tisch fehlt"): Das Spiel schreibt sein Dokument asynchron neu; danach zeigten relative Pfade "next/xyz.js" auf /next/next/ (404) und die Module nach world.js/env.js wurden still nicht geladen. next.js nutzt jetzt einen festen Basis-Pfad, wartet bis das Spiel steht und haengt verlorene Skript-Tags neu an.
- NEXT: Statistik-Tafel an die rechte Wand (links verdeckten Miner-Racks sie), LAGER-Schild ueber das Regal (Regalbrett verdeckte es), Regal-Label darueber.
- NEXT: Tagesziele im Chef-Buero (3 Auftraege annehmen, 1 ausliefern, 8 Besucher ohne Aergerei; Belohnung 2000/3000/2500 sats, taeglich neu), 8 statt 3 Passanten auf der Strasse.
- NEXT factory.js: Montagehalle (neuer Raum, Tuer in der rechten Wand des Hinterraums, Terminal "Fabrik"): 5 Ausbaustufen (Fliessband+Presse, Roboterarm, Teststation, zweites Band, KI-Leitstand), Arbeiter, produziert sats/min (auch offline bis 2 h), Abholung am Terminal. Kosten 8K/25K/80K/250K/800K, Ertrag 600/2.4K/8K/25K/80K pro Minute. Kill-Switch ?nofactory.
- NEXT farmhall.js: echte Server-Farm-Halle (Tuer in der Rueckwand des Hinterraums, ersetzt die "Farm-Theke"): Racks mit Server-Fronten/Luefterrueckseiten, Kabeltrassen, Lueftungsrohre, Klimageraete mit Luefter, Leitstand mit Live-Anzeige + Wandbildschirm; Rackzahl waechst mit den Minern; Station "Farm" oeffnet die Farm-Ansicht. Kill-Switch ?nofarmhall.
- NEXT polish.js: weiche Kontaktschatten unter Moebeln + Boden-AO an Waenden (gemergte Geometrie, 2 Draw-Calls), runde Haengelampen (Lathe) und Wandlampen. Kill-Switch ?nopolish.
- NEXT Performance: Server-Halle und Montagehalle sind eigene Gruppen und werden ausgeblendet, wenn man nicht im Hinterraum/der Halle ist (~400 Draw-Calls weniger im Laden). tools/render: Screenshot-Harness.
- NEXT: Theke mit runden Enden, Fuellungen, Sockel und Messingleisten; Sockel-, Stuck- und Handlaufleisten in allen Raeumen (polish.js).
- NEXT furniture.js: Regal mit runden Staendern, Lochblech-Rueckwand, Diagonalstreben, orangen Vorderkanten + Beschriftungen; Bautisch mit Zarge, Schubladen (Messingknoepfe), Ablage unten, abgerundeter Platte, Schraubstock (Vorschau im Three.js-Viewer-Connector). ?nofurniture
- Einstieg: Code `OPEN-SHOP` (farmFix v5) oder direkt `/next/`

### Fix
- `next/clicker.js` im Repo war nur ein 31-Byte-Platzhalter (daher kein Tisch) → neu geschrieben

## 2026-11-01 — B1 Auftragssystem + farmFix v4

### Neu
- `js/parts3d/orders.js` — Button „📋 Aufträge (n/8)“; 8 Kundenaufträge (Budget, Watt, Temperatur, Score, Stabilität), 1 aktiv
- Ablauf: Annehmen → PC bauen → „In Farm stellen“ → im Auftragsfenster „Abgeben“ (Rig wird aus der Farm genommen)
- Belohnung = 25–35 % der Teilekosten, **zusätzlich** zum normalen Verkauf; nach allen 8 neue Runde mit bis zu +100 %
- Prüfung über `Parts3D.power.calc/score/verdict` (A2/A3) und `PART_CATALOG`-Kosten
- Speicherung: `state.orders`, `localStorage hashpool-orders-v1[:user]`, `HashpoolSave`-Payload; Kill-Switch `?noorders=1`
- Geladen vom Loader `farmRoom.js` (von `main`); `powerTemp.js` wird dort nach 6 s nachgeladen, falls `Parts3D.power` fehlt

### Fix
- `farmFix.js` v4: Loader holte eine alte gepinnte Version; jetzt immer `main`. Nach „In Farm stellen“ bzw. Verkauf wird die Teile-Auswahl verbraucht und das Bau-Menü versteckt (Hauptscreen nach dem Schließen der Farm)

---

## 2026-10-31 — Lader wiederhergestellt (Fix: Shop/Einbau, Kommazahlen, Farm/Power/Benchmark)

### Problem
- `index.html` lud ein gepacktes Bundle (`hp_b64_0..5.txt`); dadurch: Shop und Einbau-Menü ließen sich nicht öffnen, Kommazahlen (Economy-Patches des Laders) fehlten, Farm/Power/Benchmark-Module blieben ohne Spiel-Scope wirkungslos

### Änderung
- `index.html`: wieder der Lader „Original-Spiel (jsDelivr, gepinnt) + Patch-Module“ inkl. aller Patches (EconomyNerf, PartShop-Hooks, Layout, AssembleHook …); Cache `?v=20261031a`
- `js/partShop.js`: schlanker Lader, der die Shop-Chunks `ps_c0..10.js` holt und im Spiel-Scope per `eval` ausführt (kein `window.state` nötig)
- `hp_b64_*.txt`, `farmFix.js` bleiben liegen, werden aber nicht mehr geladen (`farmFix` war nur fürs Bundle gedacht)

---

## 2026-10-30 — A3 Benchmark / Start-Test nach dem Bau

### Neu
- In `js/parts3d/powerTemp.js` (Loader unverändert): Nach Paste- und Software-Schritt läuft ein 12-Sekunden-Start-Test (Overlay `#bm-stage`)
- Lüfter-Animation (dreht schneller, wird bei Hitze rot), Balken für Last (W), CPU- und GPU-Temperatur, Fortschritt, **Überspringen**-Button, mobil nutzbar
- Ergebnis aus A2-Werten: **Stabil** / **Gedrosselt** (mit % und Tipps) / **Absturz** (Netzteil > 100 % oder CPU ≥ 105 °C, Test bricht bei ~55 % ab)
- „Test-Score“ aus Teile-Leistung × Drosselung; wird zusätzlich im Farm-PC-Fenster gezeigt
- Nur Anzeige: **keine** Änderung an Verkaufspreis, Einkommen, Economy; Ergebnis nur in `state.lastBench` (nicht gespeichert)
- Läuft nur beim ersten Start eines Rigs (`!state.pasteDone`), Hook wie `claudeUi` (`openPasteStage`)
- Kill-Switch `?nobench=1`; `Parts3D.power.bench/score/verdict` für B1/B2

---

## 2026-10-30 — A2 Power- & Temperatur-Regeln

### Neu
- `js/parts3d/powerTemp.js` — Last (Summe Teile-Watt) gegen Netzteil × 0.9, CPU-/GPU-Temperatur aus Last, Kühler-Kapazität und Gehäuse-Airflow
- Anzeige: Leiste im Teile-Picker („⚡ Netzteil 420 / 650 W“, Temp-Balken, Warntexte) und im Farm-PC-Fenster
- Warnung/Drossel nur als Anzeige („Leistung nach Drosselung: x %“) — **keine** Änderung an Economy/Clicker
- `Parts3D.power.calc(ids)` für spätere Features (A3 Benchmark, B1 Aufträge)
- Spielwerte aus Teilestufe/Typ (Catalog hat kein tdp/heat); Netzteil-Watt und Kühlertyp aus `Parts3D.partFacts`
- Kill-Switch `?nopower=1`; Loader in `sceneLayout.js` lädt jetzt `farmRoom` und `powerTemp`

---

## 2026-10-30 — A1 Farm-Raum 3D

### Neu
- `js/parts3d/farmRoom.js` — Button „🏭 Meine Farm (n/6)“ neben dem Teile-Shop; Overlay mit 3D-Raum (Boden, Wand, Licht, 1 Rack, 6 Plätze)
- Orbit/Zoom/Pan wie im Bau-Modus (1 Finger drehen, 2 Finger zoomen/verschieben), PC antippen → Teileliste + grobe Werte (Leistung/Effizienz/Preis-Leistung, Teilewert)
- Nach dem Verkauf eines Rigs: „In Farm stellen?“ (Verkauf/Belohnung unverändert); Farm voll → Hinweis; Rig entfernen mit Doppel-Tipp-Bestätigung
- Leere Plätze: „Beispiel-Rig hier abstellen“
- `state.farmSlots = [{ id, name, partIds, placedAt, pos }]`; Speicherung in `localStorage` (`hashpool-farm-v1[:user]`) bei jedem `save()` und im `HashpoolSave`-Payload
- DE/EN über `state.lang`; Kill-Switch `?nofarm=1`
- Geladen per kleinem Loader am Ende von `sceneLayout.js` (direktes `eval` im Spiel-Scope)

### Nicht in A1
- Strom/Temperatur-Simulation, Multiplayer, Kabel zwischen Racks

### Sonstiges (2026-10-29)
- `registry.js` enthält zusätzlich `claudeUi` (Kompatibilitätsregeln, Auswahlreihenfolge Mainboard zuerst, Kauf-Hinweise, Seitenwand bei Gehäusen ohne Glas, GPU-Beschriftung, Software-Install-Stage)

---

## 2026-10-27 — Claude-Zusammenbau im Spiel

### Runtime
- `ports.js` + `assemble.js` — Kompatibilität, Port-API, buildAssembledPC
- `assembleSync.js` — CABLES-Endpunkte an LAYOUT (24-Pin, CPU, GPU, Fan)
- `claudeBridge.js` — wraps `recomputeCables`, soft-Warnung beim Teile-Pick
- AssembleHook — hard-Block bei inkompatiblem Build-Start
- Demo: `Parts3D.applyDemoPick()` setzt kompatibles Set in buildPick/partInv
- Cache `?v=20261027c`

### Referenz
- Claude-Meshes: `web3d-connector/projects/Claude` (nächste Mesh-Stufe)
- `js/parts3d/claude/README.md`

---

## Frühere Einträge
Siehe Git-Historie / docs/CHANGELOG.md

- env: rundere Baumkronen (16x12 Segmente, Blätterbüschel), Autos mit Radkästen und Fensterholmen.
- farmhall: LED-Deckenpanels und hellere Beleuchtung (vorher zu dunkel).
- factory: graue Ostwand mit Rippen und Warnbaendern, Oberlichter, Deckentraeger.
- furniture: Regal-Beschriftungsschilder entfernt (Teile werden nicht nach Typ sortiert).
- shopdeco.js (neu, ?noshopdeco): Podest mit Glaskuppel + PC, Wanduhr (echte Zeit), rotierender Deckenventilator, Fussmatte.
- clicker: Container-Farm mit Eckpfosten, Dachrippen, Tuerriegeln, Standfuessen; Solarpanels mit Alu-Rahmen.
- Schrift: alle Schild-Texturen 3x aufgeloest, Anisotropie 8, Text passt sich automatisch ins Schild ein; Auto-Qualitaet senkt Aufloesung nur noch auf 1.5x (statt 1x = verschwommen).
