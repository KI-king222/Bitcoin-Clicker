# HASHPOOL — Changelog / Projekt-Protokoll

**Regel:** Bei neuen Loader-Patches **nie** ältere Patches entfernen (additive only).

---

## 2026-10-27 — Port-Montage, Kompatibilität, System-Kabel

### 3D Zusammenbau (Claude-Mechanik + Kabel)
- `js/parts3d/ports.js`: Port-Mathe (mate/place/mountPart) aus Web3D-Projekt Claude
- `js/parts3d/assemble.js`:
  - `Parts3D.compat(spec)` — Ausschlussregeln (Sockel, DDR, Formfaktor Case↔Board, AIO-Radiator, M.2/SATA)
  - `Parts3D.buildAssembledPC(spec)` — baut PC aus buildPick + LAYOUT
  - `Parts3D.addSystemCables()` — 24-Pin, CPU-8-Pin, PCIe-GPU, SATA
- Loader lädt `ports` + `assemble` vor `patch`
- AssembleHook: Klick auf Build prüft Kompatibilität und zeigt Fehler
- Cache-Bust `?v=20261027a`

### Hinweis
- Mesh-Qualität der Einzelteile bleibt vorerst bei bestehenden `parts3d/*`-Buildern
- Claude-Meshes (`projects/Claude` in web3d-connector) = Referenz für nächste Mesh-Stufe

---

## 2026-10-06 (Header 2-Zeilen + Spielzeit + Farm-Laufzeit)

### UI Header
- Zeile 1: **HASHPOOL** mittig
- Zeile 2: links BTC/USD, rechts Spielzeit-Uhr + DE/EN + Mute

### Spielzeit
- Gesamt-Spielzeit (`totalPlayMs`) gespeichert, oben als ⏱

### Farm
- `placedAt`
