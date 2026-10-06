# HASHPOOL — Changelog / Projekt-Protokoll

**Regel:** Bei neuen Loader-Patches **nie** ältere Patches entfernen (additive only).

---

## 2026-10-06 (Header 2-Zeilen + Spielzeit + Farm-Laufzeit)

### UI Header
- Zeile 1: **HASHPOOL** mittig
- Zeile 2: links BTC/USD, rechts Spielzeit-Uhr + DE/EN + Mute

### Spielzeit
- Gesamt-Spielzeit (`totalPlayMs`) gespeichert, oben als ⏱

### Farm
- `placedAt` beim Stellen in die Farm
- Laufzeit pro Rig sichtbar
- Verkaufen: Wert sinkt mit Farm-Zeit
  - Formel: `cost × (0.12 + 0.43 × 0.5^(h/8)) × (1 − dust/200)`
  - ~55 % frisch → ~34 % / 8 h → ~17 % / 24 h → Boden ~12 %

### Dateien
- `index.html` (HeaderFarmPlay)

---

## 2026-10-06 (Header stabil)

- BTC/USD feste Breite, DE/EN/Mute springen nicht

---

## 2026-10-06 (Float + Mine-Button + Economy + Tutorial …)

- FixedFloat, MineBtnWide, EconomyNerf, fmtSats, Tutorial, NoZoom

---

## Sound-Katalog (SFX)

| Name | Einsatz |
|------|--------|
| click | Mine |
| crit | Crit |
| buy | Upgrade |
| install | PC-Bau |
| select / shop_buy | Teile-Shop |
| halving | Halving |

---
