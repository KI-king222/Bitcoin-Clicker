# Render-Harness (Screenshots von /next/ mit echtem three.js)

Damit sich Claude (oder jeder andere) die 3D-Welt ansehen kann, ohne das Handy zu brauchen.

1. three r128 holen: `git clone --depth 1 --branch r128 https://github.com/mrdoob/three.js` (Pfad in `THREE_MIN`, Standard `/home/claude/mrdoob/three.js/build/three.min.js`).
2. `game.html` hier ablegen: der gepinnte Spiel-Stand, den das Spiel von jsDelivr laedt (`git show <commit>:index.html > tools/render/game.html`; Commit steht in den `cdn.jsdelivr.net/gh/...@<commit>/index.html`-Requests).
3. Repo statisch ausliefern: `python3 -m http.server 8123` im Repo-Root.
4. `REPO=$PWD PRE="$(cat tools/render/example-pre.js)" node tools/render/shot.cjs '[[x,z,yaw,pitch],...]'` → `v0.png, v1.png, ...`

Hinweise: Das Rendern wird bis zur Aufnahme angehalten (sonst bremst Software-GL die Lade-Kette aus). `yaw 0` blickt nach -z, `yaw 3.14` nach +z, `yaw -1.57` nach +x.
`PRE` ist JS, das vor den Aufnahmen im Spiel laeuft (z. B. Geld/Stufen setzen). Kein Ton, keine Touch-Eingabe, Software-Rendering langsamer als ein Handy.
