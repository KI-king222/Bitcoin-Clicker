# HASHPOOL — Changelog / Projekt-Protokoll

Kurzprotokoll der Spiel-Änderungen. **Bei jeder Änderung ergänzen.**

Format: `YYYY-MM-DD` · Thema · Stichpunkte

Dieses Dokument ist die **einzige kanonische Quelle** für Changelog, Modul-Übersicht und Sound-Katalog.  
`docs/MODULES.md` und `docs/SFX_CATALOG.md` sind nur Kurzlinks hierher.

---

## 2026-10-06 (Mine-Button volle Breite + Katalog vereint)

### UI
- Tap-to-Mine-Button: volle Breite (100 % der Content-Breite), mobil und Desktop

### Dokumentation
- Ein zentrales Protokoll: `CHANGELOG.md` (Changelog + Module + SFX)
- `docs/MODULES.md` und `docs/SFX_CATALOG.md` verweisen nur noch darauf

### Dateien
- `index.html` (MineBtnWide CSS), `CHANGELOG.md`, `docs/*`

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
- Kanonische Samples unter `sfx/`; Video-Sync per Zeitstempel

---

## 2026-09-30 (Boot / Bot)

- BIOS/Boot-Flow vereinfacht; `window.HASHPOOL` Script-Bot / tester.html

---

## Modul-Übersicht (Arbeitskopie)

Die Live-Seite lädt die stabile Vollversion per CDN.  
Dateien unter `css/` und `js/` sind die aufgeteilte Arbeitskopie.

### css/
| Datei | Aufgabe |
|-------|--------|
| `base.css` | Farben, Layout, Header |
| `account.css` | Login / Account |
| `shop.css` | Shop-Karten |
| `build.css` | PC-Bau Overlay |
| `minigames.css` | Paste / BIOS |
| `modals.css` | Dialoge |
| `partShop.css` | Teile-Shop |

### js/ (Kern)
| Datei | Aufgabe |
|-------|--------|
| `partCatalog.js` | PC-Teile Katalog |
| `partShop.js` | Shop + Build-Picker |
| `partShopFix.js` | Auswahl nach Verkauf leeren |
| `partCheat.js` | Cheats / SFX Shop |
| `saveApi.js` | Save/Export |
| `tutorial.js` | Erstes Tutorial |
| `parts3d/*` | 3D-Meshes |

---

## Sound-Katalog (SFX)

Jeder Spiel-Sound hat einen festen Namen und idealerweise eine WAV unter `sfx/`.

| Name | Einsatz |
|------|--------|
| `click` / `mine_click` | Mine-Button |
| `crit` / `crit_damage` | Kritischer Treffer |
| `buy` | Kauf Upgrade/Teil |
| `install` / `pc_build_install` | Teil einbauen |
| `halving` | Halving / großer Erfolg |

**Regel:** Neuer Sound im Code → Eintrag hier + optional WAV in `sfx/`.

---
