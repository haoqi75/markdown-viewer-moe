# AGENTS.md

## Commands

```bash
pnpm install            # install deps (pnpm 11+, Node 24+)
pnpm build              # gulp build → dist/index.html
pnpm dev                # build + http-server on :8520
pnpm build:release      # build + node script/release.js → dist/index.release.html
node script/release.js  # standalone: dist/index.html → dist/index.release.html
```

## Architecture

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

## Release workflow (`.github/workflows/release.yml`)

- Triggered automatically on `push tags: ['v*']` or manually via `workflow_dispatch`
- Runs `pnpm build:release` → uploads `dist/index.release.html` to GitHub Releases
- Release body auto-generated from tag annotation

## Image handling interactions

- Relative URL fix runs first (rewrites `src` before anything else reads it)
- `img.closest('a')` check prevents preview on linked images
- Error and loading mascots (`error.png`, `loading.png`) are converted to data URIs by gulp and injected into `__CONFIG__`
