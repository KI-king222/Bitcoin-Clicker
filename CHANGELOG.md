# HASHPOOL — Changelog

Kurzprotokoll der Spiel-Änderungen. Wird bei jedem größeren Update ergänzt.

Format: `YYYY-MM-DD` · Thema · Stichpunkte

**Regel:** Bei jeder Änderung (Feature, Bugfix, Deploy, Video) diesen Changelog aktualisieren.

---

## 2026-10-06 (Nachkommastellen + Economy + Build-Auswahl)

### Anzeige
- `fmtSats` wieder mit Nachkommastellen (bis 4 Stellen bei sehr kleinen Werten)

### Economy (langsamer)
- Klick-Mults gesenkt (pick 1.08, cool 1.12, …), Basiskosten höher
- Passive hr stark reduziert, Soft-Cap ab wenigen Käufen
- Bulk-Kosten `1.32^n`, Halving-Bonus 0.05, Crit seltener/schwächer
- `currentPerClick` liefert wieder Dezimalwerte

### Build-Auswahl-Bug
- Nach Verkauf und beim Schließen des Bau-Overlays: `buildPick` + Flags leeren
- `partShopFix.js` beobachtet Overlay-Close

### Dateien
- `index.html`, `js/partShopFix.js`, `CHANGELOG.md`

---

## 2026-10-05 (Tutorial + Build-Auswahl + Zoom)

### Tutorial (`js/tutorial.js`)
- Startet erst nach dem Starter-Modal (+12 Sats)
- Abfrage: Kurze Einführung? → Starten / Nein danke
- Outline direkt am echten DOM-Element

### Build / Zoom
- `buildPick` nach Verkauf leeren; `NoZoomViewport` im Loader

---

## 2026-10-03 (SFX-Katalog für Videos)

### Sounds
- Kanonische Samples unter `sfx/`; Doku `docs/SFX_CATALOG.md`
- Video-Sync: Event-Zeitstempel + `sfx/*.wav` 1:1 mixen

---

## 2026-09-30 (Boot / Bot)

- BIOS/Boot-Flow vereinfacht; `window.HASHPOOL` Script-Bot / tester.html

---
