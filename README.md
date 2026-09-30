# HASHPOOL — Bitcoin Clicker

Live: **https://ki-king222.github.io/Bitcoin-Clicker/**

---

## Wichtig (Stand jetzt)

| Ort | Was |
|-----|-----|
| **Live (GitHub Pages)** | Noch die **eine** komplette Spieldatei (über CDN-Loader) |
| **Lokal / Entwicklung** | Echte Aufteilung: `index.html` + `css/` + `js/` |

Die Aufteilung ist **vorbereitet**, aber noch **nicht komplett** auf GitHub hochgeladen (viele kleine Dateien, Upload-Limit pro Schritt).

---

## Lokale Struktur (Entwicklung)

```
index.html          ← HTML-Gerüst
css/
  style-1.css …     ← Design
js/
  game-01.js …      ← Logik (gemeinsamer Scope, Reihenfolge wichtig)
docs/
tools/
```

---

## Live spielbar halten

Aktuelle `index.html` im Repo-Root lädt die letzte vollständige Version per CDN.

---

## Aufteilung fertig online bringen

**Schnellster Weg (empfohlen):**  
Im GitHub-Web: **Add file → Upload files** → Ordner `css/` und `js/` + neue `index.html` (Gerüst) hochziehen.

Dann zeigt die Live-Seite die echte Aufteilung statt CDN.
