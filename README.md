# m.ai · v18

Interactive prototype of **Mai**, a Vietnamese family assistant. Single-screen phone demo covering eight end-to-end flows (swimming-class payment, school pickup, field-trip form, WinMart+ basket, concert ticket, escrow ticket transfer, vehicle inspection, scam-call handling) plus channel posts, poster profiles, and the household document vault.

**Live:** https://chiefjogger.github.io/mai/

## Running it

No build step. The page loads React, three.js, and lucide-react from esm.sh via an import map, and transpiles `app.jsx` in the browser with Babel Standalone.

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, import map, Babel Standalone loader |
| `app.jsx` | The entire demo — one React component tree, ~2,150 lines |
| `.nojekyll` | Tells GitHub Pages to serve the directory as-is |

## Notes

- `askMai()` posts to `https://api.anthropic.com/v1/messages` with no credentials. That call was written for a sandbox that proxied it and will fail from a browser on CORS. The demo catches the failure and falls back to a canned reply, so the free-text chat box answers with "Mạng chập chờn…" rather than a live model response. Every scripted flow, which is the bulk of the demo, is unaffected.
- Babel transpiles 150 KB of JSX on load, so first paint takes roughly a second. Precompiling with a bundler would remove that.
- Designed for a phone viewport. It centers a fixed phone frame on wider screens.
