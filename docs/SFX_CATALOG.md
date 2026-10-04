# HASHPOOL — Sound-Katalog (SFX)

**Zweck:** Jeder Spiel-Sound hat einen festen Namen und eine WAV-Datei unter `sfx/`.
Für Promo-Videos: Klick-Zeitstempel aus der Aufnahme + passende Datei aus diesem Katalog = 1:1 Sync.

**Code-Quelle:** `js/beep.js` (muss mit den Parametern unten übereinstimmen)
**Samples:** `sfx/*.wav` (44,1 kHz, mono, PCM)
**Stand:** 2026-10-03

---

## Regel für neue Sounds

1. Sound in `js/beep.js` als `sfxXxx()` anlegen (Parameter notieren).
2. WAV unter `sfx/<name>.wav` erzeugen (gleiche Frequenz / Dauer / Wellenform / Lautstärke).
3. **Diese Tabelle** hier um eine Zeile ergänzen.
4. Optional Alias-Dateiname (z. B. `mine_click.wav`) für klare Video-Scripts.

Wenn sich Parameter in `beep.js` ändern → Samples **neu generieren** und Katalog-Datum aktualisieren.

---

## Katalog

| Name (Datei) | Code-Funktion | Wann im Spiel | Parameter (wie im Code) |
|--------------|---------------|---------------|-------------------------|
| `click.wav` / `mine_click.wav` | `sfxClick()` | Mine-Button (normaler Klick) | 520 Hz, sine, 0,055 s, vol 0,16 |
| `crit.wav` / `crit_damage.wav` | `sfxCrit()` | Kritischer Treffer (~8 % Chance) | 880 Hz tri 0,055 s vol 0,20 → +40 ms 1320 Hz tri 0,10 s vol 0,18 |
| `buy.wav` | `sfxBuy()` | Upgrade / Kauf im Shop | 320 Hz square 0,055 s vol 0,12 → +45 ms 480 Hz square 0,09 s vol 0,12 |
| `install.wav` / `pc_build_install.wav` | `sfxInstall()` | Bauteil einbauen (PC-Bau) | 4× square: 720→600 Hz, je 0,035 s, Abstände 0/60/120/180 ms, vol 0,10 |
| `halving.wav` | `sfxHalving()` | Halving-Event | 300, 450, 650, 900 Hz triangle, je 0,14 s, Abstand 90 ms, vol 0,18 |

Gemeinsame Hüllkurve (wie WebAudio): `gain` startet bei `vol`, exponentiell auf ~0,001 über `dur`.

---

## Video-Pipeline (Kurz)

1. Gameplay aufnehmen, **jeden Klick / Event mit Zeitstempel** speichern (`t` in Sekunden ab Video-Start der Spielszene).
2. Stille-Spur in Video-Länge erzeugen.
3. Pro Event: `sfx/<name>.wav` an Position `t` mixen (nicht stretchen).
4. Mux mit Video **gleicher Dauer** → Sync 1:1.

Beispiel-Events:

| Event-ID | Datei |
|----------|--------|
| `mine` | `sfx/click.wav` |
| `crit` | `sfx/crit.wav` |
| `buy` | `sfx/buy.wav` |
| `install` | `sfx/install.wav` |
| `halving` | `sfx/halving.wav` |

---

## Dateien im Repo / Projektordner

```
sfx/
  click.wav
  mine_click.wav      # Alias
  crit.wav
  crit_damage.wav     # Alias
  buy.wav
  install.wav
  pc_build_install.wav # Alias
  halving.wav
  generate_sfx.py     # Samples neu erzeugen
docs/
  SFX_CATALOG.md      # diese Datei
js/
  beep.js             # kanonische Definition
```

---

## Regenerieren der WAVs

```bash
python3 sfx/generate_sfx.py
```

Bei Code-Änderung an SFX: Generator anpassen → alle betroffenen WAVs neu → Katalog-Zeile updaten.
