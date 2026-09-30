# HASHPOOL — Changelog

Kurzprotokoll der Spiel-Änderungen. Wird bei jedem größeren Update ergänzt.

Format: `YYYY-MM-DD` · Thema · Stichpunkte

---

## 2026-09-30

### Balance & Tempo
- Progression verlangsamt (höhere Kosten-Multiplikatoren, mildere frühe Hashrates)
- Starter-Bonus reduziert
- PC-Bau-Kosten: erster Build günstiger, Skalierung ×1.55 pro verkauftem Rig

### PC-Bau 3D
- Schwebe-Bug: CPU/RAM/SSD sitzen lokal auf dem Mainboard (auch flach auf dem Tisch)
- Schrauben-Offset korrigiert (lagen zu hoch)
- Kühler sitzt auf der CPU (Local-Z an IHS angepasst)
- GPU-Orientierung: steckt in den PCIe-Slot (senkrecht zum Board), nicht parallel
- GPU-Lüfter-Achse und RGB-Streifen korrigiert/sichtbar
- Grafik-Upgrades: CPU, RAM (aufrecht), SSD, Mainboard (VRM, Slots, Header), PSU, Kühler
- Kamera: Pan mit Shift / rechte Maustaste / Zwei-Finger; Zoom wie bisher

### Interaktion (nicht nur Klicken)
- Wärmeleitpaste-Minispiel vor dem Boot (Qualität beeinflusst Verkaufspreis)
- BIOS-Flash-Sequenz (Tastenreihenfolge + Timer; Qualität beeinflusst Verkauf)
- Mobile: größere BIOS-Tasten, `pointerdown`, längerer Timer, Paste-Canvas touch-freundlich

### Teilermarkt
- Budget/Standard/Premium-Modelle **wieder entfernt** (zu komplex für den Flow)

### Technik / Produktion
- `CHANGELOG.md` eingeführt (dieses File)
- GitHub Pages: große `index.html` ggf. manuell hochladen (Tool-Limit bei sehr großen Pushes)

---

## Vorlage für künftige Einträge

```
## YYYY-MM-DD
### Kurz-Titel
- Was geändert wurde
- Warum (optional)
- Bekannte offene Punkte
```
