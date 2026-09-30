# HASHPOOL — Bitcoin Clicker

Live: **https://ki-king222.github.io/Bitcoin-Clicker/**

---

## Struktur

```
Bitcoin-Clicker/
├── index.html          ← HTML-Gerüst (lädt CSS + JS)
├── css/
│   ├── style-1.css … style-5.css   ← Design
├── js/
│   ├── game-01.js … game-33.js    ← Spiel-Logik (gemeinsamer Scope)
├── docs/
│   ├── CHANGELOG.md
│   └── TEST_PLAN.md
├── tools/
│   └── tester.html
└── deploy/
    └── README.md
```

### Warum so viele `game-XX.js`?

Der Code war eine große Datei (~130 KB). Aufgeteilt in kleine Stücke, damit:
1. man besser navigieren kann
2. automatische Uploads nicht an Größenlimits scheitern

**Reihenfolge ist wichtig:** `game-01.js` → `game-33.js` (nacheinander laden).

Später können wir logisch umbenennen (`shop.js`, `build3d.js`, …) — funktioniert genauso.

---

## Spiel aktualisieren

- HTML/CSS/JS einzeln committen, oder
- ganze Ordner `css/` und `js/` ersetzen

## Links

| Was | URL |
|-----|-----|
| Spiel | https://ki-king222.github.io/Bitcoin-Clicker/ |
| Tester | https://ki-king222.github.io/Bitcoin-Clicker/tools/tester.html |
