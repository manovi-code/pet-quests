# Pet Quests

A phone-first practice game: short daily quests with a pet, and a town that starts at her house and grows as she plays.

## What it is

- **Warmup** addition and subtraction, sized to an adventure rank (Scout is the gentlest; Explorer is the usual start, within 20)
- **One** pet story with a few comprehension questions. Stories get longer at higher ranks. A tricky word is shown before the story. Read-aloud is optional and never starts by itself.
- **Times tables** for the tables a parent leaves on, spread across the week
- A **coin bank** and a **general store**. Coins are gifts for playing. A wrong answer never takes coins away. The store opens after a quest. Buying means making the price with coins or answering a short money problem. Nothing costs real money.
- **Short games** in places she has opened: baking, garden rows, pond numbers, market counting, ice cream orders, and more. They are extra, not a longer school day.
- A **town** that begins with only her house. New places and things to place appear as she finishes quests and visits. Anything she has not earned stays hidden. Extra places are for exploring, not a longer school day.
- A **daily gift**, a sticker for days she visits, and a weekly gift after 5 quests. A quiet day is okay. Nothing is taken away.

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
- **Settings** chooses an adventure rank (Scout, Explorer, Ranger, Keeper, or Champion), a lesson focus (addition, subtraction, multiplication, reading, or a mix), which parts of the daily quest are on, and which times tables to practice. A smaller rank is always okay. The rank does not jump up by itself. Lesson focus changes what today’s quest practices while keeping it about one short session.
- The bank, stickers, decorations, and pet stay on this device with the rest of her progress. There is no account and no real-money shop.
- If today’s quest has not been started, those choices update it now. A quest already started stays as it is until tomorrow.
- **Settings → Reset all progress** clears everything saved for Pet Quests on that device.
- Weekly goal default: finish **5 daily quests** this week (Monday–Sunday, device local time). Missing a day is okay — there is no punishing streak break.

## Tests

```bash
node test/test.js
```

No npm install required.

The game is plain files. GitHub Pages serves the repository root. There is no build step. A service worker (`sw.js`) caches those same files so a home-screen icon can open the game offline after it has been loaded once.
