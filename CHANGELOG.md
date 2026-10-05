# HASHPOOL — Changelog

Kurzprotokoll der Spiel-Änderungen. Wird bei jedem größeren Update ergänzt.

Format: `YYYY-MM-DD` · Thema · Stichpunkte

---

## 2026-10-05 (Tutorial + Build-Auswahl + Zoom)

### Regel
- Bei **jeder** Änderung (Feature, Bugfix, Deploy, Video-Flow): Eintrag in `CHANGELOG.md` ergänzen

### Tutorial (`js/tutorial.js`)
- Startet **erst nach** dem Starter-Modal (+12 Sats), nicht beim Laden
- Danach Abfrage: „Kurze Einführung?“ → Starten / Nein danke
- Schritte: Mine-Button, Balance, Teile-Shop, PC bauen, Klick-Power, Passive Hardware
- Markierung: Outline **direkt am echten DOM-Element** (kein schwebender Rahmen)
- Leichter Overlay-Hintergrund; `tutorialDone` in Save (`saveApi.js`)

### Build-Menü / Inventar
- Nach PC-Verkauf: `buildPick` + Kategorie-Flags leeren (`partShop.js` / `partShopFix.js`)
- Stale-Auswahl im Picker entfernt, wenn Teile nicht mehr im Inventar

### Mobile Zoom
- `NoZoomViewport` im Loader wieder aktiv: `user-scalable=no`, `touch-action: manipulation`, Gesture-Blocker

### Dateien
- `js/tutorial.js`, `js/partShop.js`, `js/partShopFix.js`, `js/saveApi.js`, `index.html` (Loader)

---

## 2026-10-03 (SFX-Katalog für Videos)

### Sounds
- Kanonische Samples unter `sfx/`: click, crit, buy, install, halving (+ Aliase mine_click, crit_damage, pc_build_install)
- Dokumentation: `docs/SFX_CATALOG.md` — Name ↔ `beep.js`-Funktion ↔ Einsatz
- Regel: neuer Sound im Code → WAV speichern + Katalog-Zeile
- Video-Sync: Event-Zeitstempel + passende `sfx/*.wav` 1:1 mixen (kein OBS nötig)

## 2026-09-30 (Boot weg + Humanish-Bot)

### Boot / BIOS
- BIOS-Flash und Boot-Animation aus dem Power-on-Flow entfernt
- Nach Paste (optional) gilt der Rig als an → verkaufbar

### Bot
- `runBot` als regelbasierter „humanish“ Agent: Klick-Bursts, Puffer vor Kauf, Impulskäufe, Grind bis Ziel, frühes Aufhören bei guter Passive
- Kein externes LLM — eigene Logik an `window.HASHPOOL`

---

## 2026-09-30 (Bot / Tester)

### Script-Bot (keine echte KI)
- `window.HASHPOOL` API im Spiel: `getState`, `mine`, `buyUpgrade`, `buyClick`, `runBot`, `resetSoft`
- Auto-Report: `index.html?bot=1`
- UI-Runner: `tester.html` (iframe + Report)
- `runBot` prüft Mine/Balance/Käufe/Passive und gibt `funEstimate` 1–10 + Issues

### Deploy-Hinweis
- Live-Loader brauchte vollständige Chunks; volle `index.html` lokal in artifacts aktuell halten

---
