# HASHPOOL — Bitcoin Clicker

Live: **https://ki-king222.github.io/Bitcoin-Clicker/**

---

## Ordner-Struktur (so sollst du dich orientieren)

```
Bitcoin-Clicker/
│
├── index.html          ← DAS SPIEL (einzige Datei, die die Website braucht)
├── README.md           ← diese Übersicht
│
├── docs/               ← Dokumentation (zum Lesen, nicht fürs Spiel)
│   ├── CHANGELOG.md    ← was wann geändert wurde
│   └── TEST_PLAN.md    ← Test-Checkliste
│
├── tools/              ← Hilfs-Seiten (optional)
│   └── tester.html     ← Bot-Tester
│
└── deploy/             ← nur Technik-Notizen (Chunks etc.)
    └── README.md
```

**Root (oberste Ebene) = nur Spiel + Übersicht.**  
Alles andere steckt in Ordnern.

---

## Was gehört wohin?

| Ort | Inhalt | Musst du anfassen? |
|-----|--------|---------------------|
| `index.html` | Komplettes Spiel | Ja, bei Updates |
| `docs/` | Changelog, Tests | Zum Nachlesen |
| `tools/` | Tester | Optional |
| `deploy/` | Erklärung zu Chunks | Meist ignorieren |

---

## Spiel aktualisieren

1. Neue `index.html` hochladen (Root ersetzen)
2. Commit
3. Hard-Refresh: https://ki-king222.github.io/Bitcoin-Clicker/

Optional Changelog: `docs/CHANGELOG.md` ergänzen.

---

## Links

| Was | URL |
|-----|-----|
| Spiel | https://ki-king222.github.io/Bitcoin-Clicker/ |
| Bot-Tester | https://ki-king222.github.io/Bitcoin-Clicker/tools/tester.html |
| Changelog | https://github.com/KI-king222/Bitcoin-Clicker/blob/main/docs/CHANGELOG.md |

---

## Hinweis zu alten Dateien

Früher lagen im Root viele unnötige Dateien (`*_d.ts`, `c0.b64` …).  
Die werden aufgeräumt. **Fürs Spiel zählt nur `index.html`.**
