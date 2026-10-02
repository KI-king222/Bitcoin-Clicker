# HASHPOOL — Modul-Übersicht

Die Live-Seite lädt aktuell die stabile Vollversion per CDN.
Die Dateien unter `css/` und `js/` sind die aufgeteilte Arbeitskopie zum Bearbeiten.

## css/ — Styles

| Datei | Aufgabe | Wo im Spiel |
|-------|---------|-------------|
| `base.css` | Farben, Schrift, Layout-Grundgerüst, Header | überall |
| `account.css` | Login, Register, Logout, Account-Zeile | oben unter dem Logo |
| `shop.css` | Shop-Karten, Qty-Buttons, Item-Layout | Click Power & Hardware |
| `build.css` | PC-Bau Overlay, 3D-Ansicht, Parts-Tray | Build & Sell |
| `minigames.css` | Wärmeleitpaste, BIOS-Tasten, Boot | nach Power-On im PC-Bau |
| `modals.css` | Bestätigen, Welcome-Back, Dialoge | Popups |

## js/ — Logik (nach Funktion)

### Kern & Daten
| Datei | Aufgabe |
|-------|---------|
| `KEY.js` | Speicher-Keys (`hashpool-save-v2`, Accounts) |
| `PARTS-1.js` / `PARTS-2.js` | PC-Teile-Liste + 3D-Builder für Mainboard/CPU |
| `data-1.js` | Zusätzliche Daten/State-Helfer (auf GitHub) |

### Account
| Datei | Aufgabe |
|-------|---------|
| `acctLogin-1.js` … `acctLogin-3.js` | Login, Register, Logout, I18N-Texte |

### 3D PC-Bau
| Datei | Aufgabe |
|-------|---------|
| `buildSsd.js` | 3D-Modell SSD |
| `buildGpu.js` | 3D-Modell GPU (seitlich, RGB, Lüfter) |
| `BUILDERS.js` | Map: Teil-ID → Builder-Funktion |
| `buildTable-1.js` … `3.js` | Tisch, Kamera, Zoom/Pan, Drag |
| `spawnScrews.js` | Schrauben-Animation beim Einbau |

### Audio & Multiplikatoren
| Datei | Aufgabe |
|-------|---------|
| `beep.js` | Sound-Helfer |
| `audio.js` | Mute / SFX (auf GitHub) |
| `globalMult.js` | globale Verstärker (Halving, Events) |

### UI & Mining
| Datei | Aufgabe |
|-------|---------|
| `_staticSig-1.js` / `2.js` | Text-Signaturen, `render()` |
| `buildPartCost-1.js` / `2.js` | Teil-Kosten, Drag starten |
| `mineBtn.js` | Mine-Button (Click + Flicker-Fix) |
| `shop.js` / `ui.js` | Shop-Render, leichte UI-Updates (GitHub) |
| `cheatMsgEl.js` | Cheat-Codes, Export/Import |

### PC-Bau Ablauf (Minispiele)
| Datei | Aufgabe |
|-------|---------|
| `moveGhost-1.js` … `3.js` | Drag-Ghost, Overlay-Stages, Paste→BIOS→Sell |
| `pasteScoreFromCoverage.js` | Wärmeleitpaste-Qualität |
| `openBiosStage.js` | BIOS-Tasten (auch Mobile) |
| `playBootSequence.js` | Boot-Text (optional) |

### Expansion / Events / Bot
| Datei | Aufgabe |
|-------|---------|
| `exActive-1.js` / `2.js` | aktives Event-System |
| `exSigs-1.js` … `3.js` | Event-Signaturen, Panel |
| `exApplyStyle-1.js` / `2.js` | Event-Styles |
| `exScheduleEvent-1.js` … `4.js` | Event-Timer + interner Test-Bot |

## Namensregel
- Dateiname = **Funktion** (was der Code tut)
- `-1`, `-2` = Fortsetzung derselben Funktion (Datei zu groß für einen Push)
- Erste Zeile = Kurzkommentar: Modul + Aufgabe

## Live vs. Module
- **Live:** `index.html` lädt die stabile CDN-Vollversion (Original-Style).
- **Bearbeiten:** Module in `js/` / `css/`; Änderungen müssen später wieder in die Live-Version.
