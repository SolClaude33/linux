# Repository Guidelines

## Project Structure

This project is a Vite-powered vanilla JavaScript desktop experience. Application code lives in `src/`: `main.js` owns the desktop shell, window manager, guide, settings, local Unicorn scene lifecycle, and terminal simulator; `styles.css` contains the visual system and responsive states; `config.js` validates optional public `VITE_*` values. Production media and scene JSON belong in `public/assets/`; the seven downloadable gallery files live in `public/assets/memes/`; the pinned Unicorn Studio SDK belongs in `public/vendor/`. Keep supplied files unchanged. Originals and working source material stay in `sources/` and must never be imported by the site. The matching personal project note is `Projects/Linux.md`.

## Development Commands

Run commands from the repository root with the configured local pnpm runtime:

- `pnpm install` installs Vite and Lucide locally.
- `pnpm dev` starts the local server on `127.0.0.1:5173`.
- `pnpm build` creates the production bundle in `dist/`.
- `pnpm preview` serves the production bundle locally for final inspection.

## Conventions

Use ES modules, two-space indentation, semicolons, and descriptive camelCase names. Keep visible product copy in English. Use semantic HTML controls and Lucide icons for actions. Validate optional public values in `src/config.js`; missing or invalid values must remove related actions rather than expose placeholders. Treat window behavior as shared infrastructure and app contents as isolated render functions. Yellow and Graphite share the one local Unicorn canvas; Good boy pauses it. Initialize Unicorn through `addScene` with the local scene file only, pause it with both motion settings, and destroy it during HMR. Preserve keyboard access, visible focus, 44px touch targets, reduced-motion behavior, and the single-active-panel mobile model.

## Validation

Before handoff, run `pnpm build` and exercise the desktop at mobile and desktop widths. Check single-click launch, window focus, drag boundaries, maximize/restore, minimize/reopen, close/reopen, Activities search, Escape behavior, terminal commands and history, settings persistence, local downloads, keyboard navigation, and console/network errors.

## Security Boundaries

The terminal is a fixed local command dispatcher. Never use `eval`, dynamic code execution, runtime remote scripts, or unsanitized HTML for command output. Treat all `VITE_*` values as public and never place credentials, private keys, analytics secrets, or confidential data there. Keep the approved Unicorn SDK and scene local. Push only when the user explicitly requests the exact existing repository; do not create a remote or deploy. Deployment remains user-managed.
