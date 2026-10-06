# HASHPOOL — Changelog / Projekt-Protokoll

Kurzprotokoll der Spiel-Änderungen. **Bei jeder Änderung ergänzen.**

Format: `YYYY-MM-DD` · Thema · Stichpunkte

Dieses Dokument ist die **einzige kanonische Quelle** für Changelog, Modul-Übersicht und Sound-Katalog.  
`docs/MODULES.md` und `docs/SFX_CATALOG.md` sind nur Kurzlinks hierher.

---

## 2026-10-06 (Klick-Anzeige fix + Shop-SFX im Katalog)

### UI
- Klick-Gewinn (`+1,08` etc.) erscheint **immer mittig** über dem Mine-Button (nicht mehr zufällig seitlich)

### Sound-Katalog
- Neu dokumentiert: `select` (Teile wählen), `shop_buy` (Teile-Shop kaufen) aus `partCheat.js`
- Samples: `sfx/select.wav`, `sfx/shop_buy.wav`

### Dateien
- `index.html` (FixedFloat), `CHANGELOG.md`, `sfx/select.wav`, `sfx/shop_buy.wav`

---

## 2026-10-06 (Mine-Button volle Breite + Katalog vereint)

### UI
- Tap-to-Mine-Button: volle Breite (100 % der Content-Breite), mobil und Desktop

### Dokumentation
- Ein zentrales Protokoll: `CHANGELOG.md` (Changelog + Module + SFX)

---

## 2026-10-06 (Nachkommastellen + Economy + Build-Auswahl)

### Anzeige
- `fmtSats` mit Nachkommastellen

### Economy
- Langsamere Progression (Mults, Soft-Caps, Crit)

### Build
- Auswahl nach Verkauf/Overlay-Close leeren

---

## 2026-10-05 (Tutorial + Zoom)

- Tutorial nach +12-Sats-Modal; Outline am echten Element; NoZoomViewport

---

## Modul-Übersicht (Arbeitskopie)

| Bereich | Dateien |
|---------|--------|
| Shop/Bau | `partCatalog.js`, `partShop.js`, `partShopFix.js`, `partCheat.js` |
| Save/Tutorial | `saveApi.js`, `tutorial.js` |
| 3D | `parts3d/*` |
| SFX | `beep.js`, `sfx/*.wav` |

---

## Sound-Katalog (SFX)

| Datei / Name | Funktion | Einsatz | Parameter |
|--------------|----------|---------|-----------|
| `click.wav` / `mine_click.wav` | `sfxClick()` | Mine-Button | 520 Hz sine |
| `crit.wav` / `crit_damage.wav` | `sfxCrit()` | Kritischer Treffer | 880→1320 Hz triangle |
| `buy.wav` | `sfxBuy()` | Upgrade-Kauf | 320→480 Hz square |
| `install.wav` / `pc_build_install.wav` | `sfxInstall()` | PC-Teil einbauen | 4× square |
| `halving.wav` | `sfxHalving()` | Halving | 300–900 Hz triangle |
| `select.wav` | `PartShop.sfxSelect()` | Teil im Shop/Picker wählen | 440 Hz triangle, 0,04 s, vol 0,10 |
| `shop_buy.wav` | `PartShop.sfxBuy()` | Kauf im Teile-Shop | 660→880 Hz sine |

**Regel:** Neuer Sound im Code → Eintrag hier + optional WAV in `sfx/`.

---
