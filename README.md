# HASHPOOL — Bitcoin Clicker

Live: **https://ki-king222.github.io/Bitcoin-Clicker/**

Idle/Clicker-Spiel (HTML + JS), gehostet über **GitHub Pages**.

---

## Wichtige Dateien (das brauchst du wirklich)

| Datei | Bedeutung |
|--------|------------|
| **`index.html`** | Das **Spiel** (oder ein kleiner Loader, siehe unten) |
| **`tester.html`** | Bot-Tester-UI (`window.HASHPOOL`) |
| **`CHANGELOG.md`** | Was wann geändert wurde |
| **`TEST_PLAN.md`** | Test-Checkliste |

Alles andere ist Hilfs-/Altlast oder Deploy-Technik.

---

## Was sind die „Chunks“ (`c0.b64`, `c1.b64`, …)?

### Problem
Das fertige Spiel (`index.html`) ist **groß** (~150–160 KB).

Manche automatischen Uploads (z. B. über KI-Tools) können **nicht** so eine große Datei **in einem Rutsch** nach GitHub schieben — das Limit liegt oft bei wenigen Kilobyte pro Aufruf.

### Lösung (Workaround)
1. Spiel-HTML wird **komprimiert** (gzip) und als **Base64-Text** zerlegt.
2. Daraus werden viele kleine Dateien: `c0.b64`, `c1.b64`, `c2.b64`, …
3. Die **`index.html` im Repo** ist dann nur ein **Loader** (ca. 1 KB):
   - lädt der Reihe nach alle `c*.b64`
   - setzt sie zusammen
   - entpackt sie
   - schreibt das echte Spiel in die Seite

```
Browser öffnet index.html (Loader)
        │
        ├─ fetch c0.b64
        ├─ fetch c1.b64
        ├─ …
        └─ fetch c41.b64
                │
                ▼
        zusammen + gzip-entpacken
                │
                ▼
        echtes Spiel erscheint
```

### Wichtig
- **Chunks sind kein Spielinhalt zum Lesen** — nur Transportstücke.
- Fehlt **eine** Chunk-Datei → Loader zeigt Fehler (`Failed c12` o. ä.).
- **Besser für dich:** eine **vollständige** `index.html` (das ganze Spiel) per GitHub-Upload ersetzen. Dann brauchst du die `c*.b64` **nicht**.

---

## Empfohlene Struktur (klar)

```
Bitcoin-Clicker/
├── index.html          ← Spiel (ideal: eine komplette Datei)
├── tester.html         ← optionaler Bot-Tester
├── CHANGELOG.md
├── TEST_PLAN.md
└── README.md           ← diese Datei
```

Optional nur wenn der Chunk-Deploy läuft:

```
├── c0.b64 … c41.b64    ← nur Loader-Technik, kein manuelles Editieren
```

Alte / unnötige Dateien (z. B. `*_d.ts`, `hp_part*`) kannst du ignorieren oder löschen — sie gehören **nicht** zum Spielablauf.

---

## So aktualisierst du das Spiel (einfach)

1. Neue `index.html` (komplett) bereithalten
2. Im Repo: **Add file → Upload files** (oder bestehende `index.html` ersetzen)
3. Commit
4. Seite hart neu laden: https://ki-king222.github.io/Bitcoin-Clicker/

---

## Konten / Speichern

Fortschritt und Benutzerkonten liegen im **Browser** (`localStorage`), nicht auf GitHub.
GitHub speichert nur den **Code** der Website.

---

## Kurz

| Frage | Antwort |
|--------|----------|
| Muss ich Chunks verstehen? | Nein, außer der Loader sie nutzt. |
| Soll ich in `c3.b64` was ändern? | **Nein.** |
| Was ist die „echte“ Spieldatei? | Die große **`index.html`** mit dem ganzen HTML/JS. |
| Warum gibt es Chunks? | Nur weil große Uploads über manche Tools nicht auf einmal gehen. |
