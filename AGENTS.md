# AGENTS.md

## Commands

```bash
pnpm install            # install deps (pnpm 11+, Node 24+). Run at repo root — workspace installs tools/ too
pnpm build              # gulp build → dist/index.html
pnpm dev                # clean + build + browser-sync watch on :8520 (NOT http-server)
pnpm build:release      # build + node script/release.js → dist/index.release.html
node script/release.js  # standalone: dist/index.html → dist/index.release.html

# tools/ workspace (moe-json-editor, React/Vite/TS config editor)
pnpm build:tools        # tools vite build → single tools.html, then copy to dist/tools.html
pnpm build:tools --release   # names output dist/tools-<tools-version>.html (from tools/package.json)
pnpm dev:tools          # vite dev on :3000
pnpm --filter moe-json-editor lint   # tsc --noEmit (only typecheck in the repo; there is no test suite)
```

There are NO tests, no linter for the root package, and no formatter. `tsc --noEmit` in `tools/` is the only static check.

## Repo layout (pnpm workspace)

Two independent apps in one workspace (`pnpm-workspace.yaml` → `packages: ['tools']`):
- root = single-file Markdown viewer (vanilla JS + gulp)
- `tools/` = `moe-json-editor`, a React 19 + Vite 6 + Tailwind 4 SPA that generates `src/config.json`

## Architecture (root viewer)

Single-file Markdown viewer. `src/` → gulp → `dist/index.html` (all assets inlined as data URIs).

| File | Role |
|------|------|
| `src/index.html` | HTML template with placeholders (`<config-placeholder>`, `logo-placeholder`, `mascot-placeholder`) |
| `src/script.js` | All app logic: TOC, renderer, scroll spy, image preview, routing |
| `src/style.css` | Moe pink/purple theme |
| `src/config.json` | User-configurable defaults (optional — gulpfile has DEFAULTS fallback) |
| `script/release.js` | Creates `dist/index.release.html` with editable JSON block at top |

## Build pipeline (gulpfile.js)

1. Read `config.json` (missing/corrupt → use `DEFAULTS` constant, not fail)
2. Deep-merge each field: config value → DEFAULTS value
3. Images: config path → DEFAULTS path → **fail build** if default also missing
4. Read & minify `style.css` (clean-css) + `script.js` (uglify-js)
5. Replace placeholders in `index.html` → inject minified CSS/JS → htmlmin → `dist/index.html`
6. Extra config fields injected into `__CONFIG__`: `errorMascot`, `loadingMascot`

## Config resolution order

1. `config.json` fields
2. `DEFAULTS` in gulpfile (per-field fallback, deep merge)
3. At runtime: `<script id="release-config">` block overrides `defaultUrl` and `aliases` (release builds only)

## URL routing (script.js)

- `?md=URL` — direct Markdown URL (highest priority)
- `?p=alias` — lookup in `CONFIG.aliases` (case-insensitive)
- Hash (`#heading`) — reserved for anchor navigation, NOT alias routing
- Relative image/link URLs resolved against markdown document URL via `new URL(relative, docUrl)`

## Key rendering sequence (in `Renderer.load()`)

Order matters — don't reorder:

1. Fix relative image/link `src`/`href`
2. Broken image detection → `replaceBrokenImg()` (replaces `<img>` with `<span class="img-error">`)
3. `Prism.highlightAll()`
4. `TOC.generate()` — assigns heading IDs (slug from text, no `heading-` prefix)
5. `interceptAnchors()` — internal `#heading` links use smooth scroll + `pushState`
6. `setupImagePreview()` — skips images inside `<a>` and error placeholders
7. Hash scroll: wait for all images, decodeURIComponent, then scroll + highlight

## Scroll & hash gotchas

- `history.scrollRestoration = 'manual'` at top of script.js
- Scroll spy (`IntersectionObserver`) suppressed for 2s after activation to avoid overwriting init hash
- `breaks: false` in `marked.parse()` — matches GitHub README rendering (single LF = space, not `<br>`)

## tools/ build pipeline (`tools/gulpfile.js`)

- `build:html` (gulp) runs `vite build`, then inlines all `/assets/*.css` and `/assets/*.js` into one `dist/index.html`, inlines `public/icon.png` as base64, and replaces `__APP_VERSION__` with `tools/package.json` version → `tools/dist/tools.html`
- `script/copy-tools.js` then copies it to root `dist/tools.html` (or `dist/tools-<version>.html` with `--release`) and injects favicon `<link>` tags from `src/config.json`

## CI workflows (mirrored in `.github/` and `.forgejo/`)

Both dirs contain identical `release.yml` + `static.yml`. Keep them in sync when editing either.

- `release.yml`: on `push tags: ['v*']` or `workflow_dispatch` → `build:release` + `build:tools --release` → uploads `dist/index.release.html` and `dist/tools-v*.html` to Releases. Body from tag annotation.
- `static.yml`: on `push` to `main` → `build` + `build:tools` → deploys `dist/` to GitHub Pages.

## Image handling interactions

- Relative URL fix runs first (rewrites `src` before anything else reads it)
- `img.closest('a')` check prevents preview on linked images
- Error and loading mascots (`error.png`, `loading.png`) are converted to data URIs by gulp and injected into `__CONFIG__`
