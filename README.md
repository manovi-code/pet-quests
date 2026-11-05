# Pet Quests

A phone-first practice game for a 5th grader: short daily quests with a pet that grows as she plays.

## What it is

- **Warmup** addition and subtraction
- **One** short pet-themed reading passage with a few comprehension questions (optional read-aloud)
- **Times tables** practice (1–12), weighted toward facts she misses

Progress, pet nickname, and settings stay in **this device’s browser storage only**. There is no sign-in, no account, no ads, and no analytics.

## How to open locally

From this folder:

```bash
cd /workspace/pet-quests
python3 -m http.server 8765
```

Then open `http://localhost:8765/` on the phone (same Wi‑Fi) or in a desktop browser.  
You can also open `index.html` directly as a file in many browsers; a tiny local server is more reliable for “Add to Home Screen.”

On iPhone Safari: Share → **Add to Home Screen**.

A published phone link will come later. This README does not claim a live public URL.

## Parent notes

- Sound can be toggled on the home screen / header.
- **Settings → Reset all progress** clears everything saved for Pet Quests on that device.
- Weekly goal default: finish **5 daily quests** this week (Monday–Sunday, device local time). Missing a day is okay — there is no punishing streak break.

## Tests

```bash
node test/test.js
```

No npm install required.
