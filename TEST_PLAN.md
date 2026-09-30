# HASHPOOL — Testplan & „Game Tester“

## Was ein Bot realistisch kann

| Art | Möglich? | Nutzen |
|-----|----------|--------|
| Smoke-Test (lädt Seite, keine JS-Fehler) | Ja | Brüche nach Deploy finden |
| Klick-Skript durch Menüs | Teilweise | UI-Flow prüfen |
| Balance-Metriken (Zeit bis 1. Miner, bis 1. Rig) | Ja, wenn Debug-API | „zu schnell / zu langsam“ |
| „Hat Spaß gemacht?“ (subjektiv) | Nur Mensch/KI-Review | Spaß, Frustration, Langeweile |

Ein klassischer Bot **spielt nicht mit Gefühl**. Spaß-Feedback kommt von:
1. **Dir** beim Spielen  
2. **Mir (Grok)** — ich kann die Live-Seite im Browser durchklicken und qualitativ bewerten  
3. Optional: kurze Checkliste nach jedem Build (unten)

Echte „KI spielt Cookie-Clicker-ähnlich“ bräuchte entweder eine freigegebene Debug-API im Spiel oder einen Browser-Agenten, der Screenshots + DOM nutzt. Beides ist machbar, aber Aufwand.

## Manuelle Checkliste (nach jedem Update)

- [ ] Seite lädt ohne Console-Fehler
- [ ] DE/EN Umschaltung ok
- [ ] Klick → Sats steigen
- [ ] Ersten USB-Miner kaufen möglich
- [ ] PC-Bau öffnen, Teile kaufen, Mainboard flach → CPU/RAM sitzen auf dem Board
- [ ] GPU im Slot (nicht flach auf dem Board)
- [ ] Paste (auch mobil wischbar) → BIOS (große Tasten) → Boot
- [ ] Rig verkaufen, Balance steigt, Build resettet
- [ ] Mobile: Zoom/Pan, Buttons erreichbar

## Wenn du mich als Tester willst

Schreib z. B.:

> „Spiel 5 Minuten als Tester und gib Feedback zu Tempo, Bugs, Spaß.“

Dann nutze ich die Live-URL, klicke durch und antworte mit:
- Bugs / Blocker  
- Balance (zu schnell/langsam)  
- UX (verwirrend / klar)  
- Spaß-Einschätzung (1–10) + warum  

## Changelog-Regel

Bei jeder Spieländerung:
1. Code in `index.html` (lokal/artifacts)
2. Eintrag oben in `CHANGELOG.md`
3. Commit auf GitHub (`CHANGELOG.md` immer; `index.html` manuell wenn Push zu groß)
