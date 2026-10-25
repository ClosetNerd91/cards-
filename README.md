# Yu-Gi-Oh! Binder (phone / installable version)

This folder is a complete static web app (PWA). You don't need a server-side backend, a build step or an account. Upload the **whole folder** to any static host that serves HTTPS, then open the URL on your phone.

```
index.html            the app (same code as the single-file version)
manifest.webmanifest  name, colours, icons → makes it installable
sw.js                 service worker: offline app shell + card-art cache
icons/                192/512 icons, maskable icons, apple-touch-icon (180)
```

## Install on your phone
- **iPhone (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** tap **Install** in the bottom hint, or use the ⋯ menu, then **Install app**.

After the first visit it works fully offline.

## Your data
Your cards are stored **on the device** in the browser's IndexedDB, and each phone or computer has its own copy. To move or back up your collection, use ⋯ → **Backup (JSON)**. On phones this opens the share sheet. Then use ⋯ → **Restore backup** on the other device.

## Updating
If you replace `index.html`, also replace `sw.js`, or bump its `VERSION`. Open copies of the app then show an **Update** button. `build/build.py` regenerates everything automatically.

## Try it locally
`python3 -m http.server 8000` in this folder, then open http://localhost:8000. To test on a phone over Wi-Fi, use your computer's IP address. Installing and offline mode need HTTPS on anything other than localhost.
