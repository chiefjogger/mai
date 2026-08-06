# m.ai · v19

Interactive prototype of **Mai**, a Vietnamese family assistant. A single-screen phone demo covering twelve end-to-end flows, three community channels, a household document vault, and a conversational surface that answers from a local intent engine.

**Live:** https://chiefjogger.github.io/mai/

## What changed in v19

**Mai answers locally.** v18 posted to `api.anthropic.com` with no credentials, which failed on CORS from a browser and fell back to a canned "network is flaky" line. That call is gone. `brain.js` holds **123 scripted intents** matched by an ASCII-folding scorer, so every question answers instantly, offline, and identically on every run.

**Nothing dead-ends.** Every reply carries follow-up chips, and every chip is verified to match a real intent — the test that guards this is described below. Most replies also carry a button that opens the relevant wizard, and when a wizard finishes, Mai returns to the chat to report the result. You can walk the entire demo without typing a character.

**The illustrations are drawn, not typed.** Fourteen SVG scenes replace the emoji-on-gradient thumbnails, plus a drawn wordmark, generated avatars, and data-viz for the numbers that matter (payment progress, countdown to the deadline, inspection-centre queue by hour).

## How the intent engine works

```
"Đăng kiểm xe khi nào?"  →  fold  →  "dang kiem xe khi nao"  →  score  →  dangkiem_when
```

`fold()` lowercases, maps `đ→d`, strips combining diacritics via NFD, and reduces punctuation to spaces, because Vietnamese users routinely type without diacritics. Matching is on word boundaries, so `gio` never matches inside `giong`. Longer phrases score quadratically higher than short ones, `must` and `not` arrays gate a match, and `w` weights it. Bare confirmations (`ừ`, `ok`, `làm đi`) resolve against the previous turn.

An intent looks like this:

```js
{
  id: "pay_swim_amount",
  k: ["hoc boi bao nhieu", "hoc phi boi", "tien hoc boi"],
  must: ["boi"],
  reply: "Học bơi của Bin 850.000đ, hạn 17:00 chiều nay...",
  src: "Vy chuyển tiếp",          // provenance pill under the reply
  flow: "pay",                     // opens the 7-step payment wizard
  cta: "Trả 850.000đ",
  chips: ["Biên lai gửi cho ai?", "Trả xong còn lại bao nhiêu?"],
}
```

Unmatched input rotates through six fallbacks, each of which still offers somewhere to go.

## Verifying the corpus

Chips are the primary tap path, so a chip that falls through to a fallback is the worst bug this demo can have. Paste this into the browser console on the live page:

```js
const m = await import('./brain.js');
const bad = [];
for (const it of m.MAI_INTENTS) for (const c of it.chips || []) if (!m.matchMai(c, {last:null})) bad.push(it.id + " :: " + c);
for (const f of m.FALLBACKS) for (const c of f.chips || []) if (!m.matchMai(c, {last:null})) bad.push("fallback :: " + c);
for (const c of m.GREETING_CHIPS) if (!m.matchMai(c, {last:null})) bad.push("greeting :: " + c);
console.log(bad.length ? bad : "all chips resolve");
```

It currently prints `all chips resolve`. It found 25 broken chips on the first run, which is why it exists.

## Design notes

The visual language is warm paper, terracotta accent, serif numerals. Deliberately not a purple-gradient AI app. Specific borrowings:

| From | Applied to |
| --- | --- |
| Material 3 Expressive | Three spring motion tokens via CSS `linear()` — one for taps, one for surfaces, one for celebration. Press is fast and linear, release is springy, so the finger feels the contact point. |
| Apple HIG | 44pt touch targets via negative-padding hit areas rather than larger art; 16px input font so iOS stops auto-zooming, which let `maximum-scale=1` be removed (it violated WCAG 1.4.4). |
| Linear, Things 3 | Confetti removed. The achievement here is avoiding a 6.000.000đ fine and not being named in front of 32 parents. That is relief, not a party, so success is one warm bloom and a stroked check. |
| Stripe, Monzo | Serif tabular numerals for money. One odometer, on the payment receipt, rolling the WinMoney balance from 2.480.000đ down to 1.630.000đ, units digit first. Used exactly once on purpose. |
| Rauno Freiberg | The reply reveal animates presentation, not content: the full sentence is handed to layout once, then words fade in via CSS. Two renders per reply instead of one per word. |

## Running it

No build step. React, three.js, and lucide-react load from esm.sh via an import map; `app.jsx` is transpiled in the browser by Babel Standalone; `brain.js` is plain ES module JavaScript the browser parses directly.

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, import map, Babel Standalone loader |
| `app.jsx` | UI — components, SVG scenes, data-viz, twelve wizard flows |
| `brain.js` | 123 intents, six fallbacks, the fold-and-score matcher |
| `.nojekyll` | Serve the directory as-is on GitHub Pages |

## Known limits

- Babel transpiles ~180 KB of JSX on load, so first paint takes about a second. A bundler would remove that; the tradeoff buys a zero-install repo.
- Built for a phone viewport. Wider screens get the phone frame centred on a dark field.
- The intro animation is skipped when `prefers-reduced-motion` is set.
