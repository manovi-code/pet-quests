# Pet Quests

A phone-first practice game for a 5th grader: short daily quests with a pet that grows as she plays.

## What it is

- **Warmup** addition and subtraction
- **One** short pet-themed reading passage with a few comprehension questions (optional read-aloud)
- **Times tables** practice (1–12), weighted toward facts she misses

Progress, pet nickname, and settings stay in **this device’s browser storage only**. There is no sign-in, no account, no ads, and no analytics.

## Phone link

Expected public URL:

https://manovi-code.github.io/pet-quests/

GitHub Pages is **not enabled** on this repository yet. A repository admin needs to set Pages to deploy from branch **main**, folder **/ (root)**. Until that deploy finishes, the link above will not serve the game. This README does not claim the site has finished deploying.

## How to open locally

From the repository root (the folder that contains `index.html`):

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765/` on the phone (same Wi‑Fi) or in a desktop browser.  
You can also open `index.html` directly as a file in many browsers; a tiny local server is more reliable for “Add to Home Screen.”

## Parent notes

- Progress, the pet nickname, and settings stay on this device only. Nothing is sent to an account or server.
- On iPhone Safari: Share → **Add to Home Screen**.
- Sound can be toggled on the home screen / header.
- **Settings → Reset all progress** clears everything saved for Pet Quests on that device.
- Weekly goal default: finish **5 daily quests** this week (Monday–Sunday, device local time). Missing a day is okay — there is no punishing streak break.

## Tests

```bash
node test/test.js
```

No npm install required.
