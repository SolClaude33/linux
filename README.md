# Linux Desktop

A local GNOME-inspired desktop experience for Linux: a Solana memecoin with Linux energy, Inu personality, root access, and excellent manners.

## Run locally

```powershell
pnpm install
pnpm dev
```

Open `http://127.0.0.1:5173`. Build with `pnpm build` and inspect the production bundle with `pnpm preview`.

## Content and assets

Application behavior is implemented in `src/main.js`, presentation in `src/styles.css`, and validated public environment configuration in `src/config.js`. Production files live at:

- `public/assets/wallpaper-desktop.webp`
- `public/assets/character.webp`
- `public/assets/logo.webp`
- `public/assets/mascot-guide.webp`
- `public/assets/unicorn-yellow.json`
- `public/assets/memes/meme1.webp` through `meme7.webp`
- `public/vendor/unicornStudio.umd.js`

The UI provides CSS fallbacks if an asset cannot load. Do not import files from `sources/`; that directory holds originals only.

The Yellow and Graphite wallpapers share one fully local Unicorn Studio scene from project `qPVvnWEWLLiJgYtSkKyB`; Graphite applies a dark grayscale treatment to that canvas, while Good boy uses the supplied static photo. The production JSON contains the local dark-yellow palette with random dither and grain removed for smooth motion, and the original scene remains preserved in `sources/`. Runtime code loads the pinned local SDK v1.4.29 and local scene JSON. Interface motion and the operating-system reduced-motion preference pause the scene.

The confirmed Solana network always appears in the token note. Optional actions and token details render only when their corresponding public environment values are valid.

## Public environment configuration

Copy `.env.example` to `.env.local` for local development and fill only verified public values:

| Variable | Purpose |
| --- | --- |
| `VITE_X_URL` | Shows “Follow on X” in README. Must be an HTTPS URL. |
| `VITE_TOKEN_CA` | Shows the contract address and copy control in `token.txt`. |
| `VITE_BUY_URL` | Shows the verified exchange action. Must be an HTTPS URL. |
| `VITE_TOKEN_TICKER` | Shows the verified ticker in `token.txt`. |

Blank, malformed, and non-HTTPS URL values are ignored. Vite embeds every `VITE_*` value in the client bundle, so these variables are public and must never contain secrets.

## Vercel handoff

`vercel.json` declares the Vite framework, `pnpm build`, and `dist` output. Keep pnpm installation on Vercel's automatic lockfile detection; do not add an `installCommand` override. Add the four optional variables in Vercel Project Settings → Environment Variables. Because Vite reads them at build time, create a new deployment after any value changes. Deployment remains user-managed.

## Validation

The previous shell browser review covered 1440px, 1024px, 768px, 390px, and 320px layouts; window controls and drag boundaries; Activities search and keyboard focus; terminal commands/history; gallery downloads; settings persistence; and the clock. Real captures are in `verification/`. Recheck conditional environment actions after changing public configuration and rebuild before handoff.
