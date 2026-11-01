# Yu-Gi-Oh! Binder (phone / installable version)

This folder is a complete static web app (PWA). You don't need a server-side backend, a build step or an account. Upload the **whole folder** to any static host that serves HTTPS, then open the URL on your phone.

```
index.html            the app (same code as the single-file version)
manifest.webmanifest  name, colours, icons → makes it installable
sw.js                 service worker: offline app shell + card-art cache + text-reader (OCR) cache
ygo-cards.json        built-in card index (every Yu-Gi-Oh! card + every set code, ~0.4 MB gzipped) used to fill card types & art
icons/                192/512 icons, maskable icons, apple-touch-icon (180)
```

## Card art & types
After an import (and whenever the binder opens with cards that have no art) the binder fills each card's type, subtype and
artwork by itself. It matches names and set codes against `ygo-cards.json` on the device, so a 3,500-card Collectr export
takes about a second and doesn't send one request per card to YGOPRODeck. Collectr-style names such as
"Summoned Skull (Starlight Rare)", "Live Twin Lil-la Treat" or "Maliss [C] GWC-06" match, and a renamed card is found by its set
code. Only cards newer than the index are looked up online, in small throttled batches. The bar under the toolbar shows progress,
and "N without art · Retry" lists anything still missing (sealed product and tokens get a placeholder). The art itself is linked
from images.ygoprodeck.com, so it needs internet the first time a card is shown; the browser keeps it after that.
`build/build.py` refreshes the index from one bulk YGOPRODeck download (at most every 3 days).

## The binder
The binder opens on its cover (← from the first page, or Home). Drag a page or use ← → to turn it: two pages at a time on
wide screens, one on phones. Foil rarities shimmer when you move the mouse over them (and every so often on phones).
Grid and List views are still there for searching and sorting. With *reduce motion* turned on, pages switch without animation.

## Install on your phone
- **iPhone (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** tap **Install** in the bottom hint, or use the ⋯ menu, then **Install app**.

After the first visit it works fully offline.

## Scanning binder pages
**Import → Scan binder page** photographs a 9-pocket page (or 12-pocket, 2 × 2, a single card). The app reads each card's set
code and name, looks up the exact printing on db.ygoprodeck.com and shows a review screen. Nothing is added until you tap
**Add**. The first scan downloads the text reader (~7 MB, Tesseract.js from cdn.jsdelivr.net). The service worker caches it,
so later scans only need internet for the card lookups.

## Your data
Your cards are stored **on the device** in the browser's IndexedDB, and each phone or computer has its own copy. To move or back up your collection, use ⋯ → **Backup (JSON)**. On phones this opens the share sheet. Then use ⋯ → **Restore backup** on the other device.

## Updating
If you replace `index.html`, also replace `sw.js`, or bump its `VERSION`. Open copies of the app then show an **Update** button. `build/build.py` regenerates everything automatically.

## Try it locally
`python3 -m http.server 8000` in this folder, then open http://localhost:8000. To test on a phone over Wi-Fi, use your computer's IP address. Installing and offline mode need HTTPS on anything other than localhost.
