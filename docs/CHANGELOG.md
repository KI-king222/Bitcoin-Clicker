# Changelog

## 2026-10-03 — SFX-Katalog für Videos
- `docs/SFX_CATALOG.md`: Name ↔ beep.js-Funktion ↔ Einsatz
- `sfx/generate_sfx.py`: erzeugt click, crit, buy, install, halving (+ Aliase)
- Regel: neuer Sound im Code → Generator/Katalog aktualisieren
- Video-Sync: Event-Zeitstempel + `sfx/*.wav` 1:1 mixen

## 2026-10-01 — Text-Flicker-Fix
- Balance/USD/Hashrate: Cache in JS statt DOM-Vergleich (weniger Flackern)
- Mine-Klick: nur leichte UI-Update statt volles `render()`
- Passive-Tick: Shop-`disabled` nur bei echter Änderung setzen
- `fmtSats`: stabile Formatierung ohne `compact`-Sprünge

## 2026-09-30 — Modul-Aufteilung
- CSS nach Funktion: base, account, build, shop, modals, minigames
- JS nach Funktion (benannte Module), schrittweiser Upload
- Account-System, Boot entfernt, Humanish-Bot, PC-Bau 3D

## Früher
- Three.js PC-Bau, Paste/BIOS-Minispiele, Halving, i18n DE/EN
