# Point Solutions website (psweb)

Static marketing site for Point Solutions (corporate AI adoption / governance /
security consultancy, run by Valery Levchenko). No build step, no framework —
plain `index.html` + `styles.css` + `script.js`, deployed as-is (see `CNAME`).

## Design system — "SGI Workstation"

Defined at the top of `styles.css` (`:root`). Key tokens:

- Palette: `--sgi-violet` (#5F259F) and `--sgi-teal` (#00848C) as the two brand
  accents, used in gradients and as hover-state colors against each other.
  Neutral scale is the `--chrome-*` series; semantic text/bg/border tokens
  (`--text-primary`, `--bg-secondary`, `--border-light`, etc.) are derived
  from it — prefer these semantic tokens over raw chrome/sgi values in new CSS.
- `--radius-sharp: 0px` — the whole site is intentionally sharp-cornered
  (instrument-panel look). Don't add rounded corners without a reason.
- Fonts: `--font-display` (Space Grotesk) for headings/numbers,
  `--font-body` (Inter) for body copy.
- Recurring visual language: hairline borders (`--border-light`), a
  violet→teal gradient accent bar/underline on hover, card lift
  (`translateY(-4px)`) + shadow on hover, thin colored corner/edge accents on
  cards (see `.service-card::before`, `.cert-badge::before`).

## Icon system

All icons are hand-built inline SVG, not an icon font or library — kept
dependency-free like the rest of the site. Defined once as a sprite of
`<symbol>` elements inside a hidden `<svg class="icon-sprite">` right after
`<body>` in `index.html`, then instantiated elsewhere via
`<svg class="icon" aria-hidden="true"><use href="#icon-NAME"></use></svg>`.

Conventions for any new icon added to the sprite:

- `viewBox="0 0 24 24"`, geometric line-art (rects/lines/simple paths, no
  curves unless the shape truly needs one) — square stroke caps, miter joins,
  matching `--radius-sharp: 0`. See the `.icon` base rule in `styles.css` for
  the shared `stroke-width`/`stroke-linecap`/`stroke-linejoin`.
- Don't set `fill`/`stroke` on individual shapes inside a `<symbol>` — let
  them inherit `stroke: currentColor; fill: none` from the `.icon` class so
  color is controlled entirely by CSS on the container (cert-icon tiles are
  violet by default → teal on hover, service-icon tiles are teal/violet by
  card type). **Exception**: the `icon-logo` symbol (real vector hexagon+"P"
  mark, shared with `favicon.svg`) has genuine multi-color fills and must set
  `stroke="none"` explicitly on its shapes — otherwise it inherits the
  `.icon` class's `stroke: currentColor` and picks up an unwanted outline,
  since SVG presentation attributes only override *inherited* values when
  actually set on that element.
- Every icon instance gets `aria-hidden="true"` — they're all decorative,
  paired with adjacent visible text (`cert-name`, `h3`, button label) that
  already carries the meaning.
- Icons sit inside a bordered square "tile" (`.cert-icon`, `.service-icon`:
  fixed width/height, `border: 1px solid var(--border-light)`,
  `background: var(--bg-secondary)`), not bare — this was a deliberate change
  from an earlier bare-icon version, to match the site's hairline-border
  card language instead of floating as a separate decoration layer.

### Gotcha: hiding the sprite

The `<svg class="icon-sprite">` wrapper must be hidden explicitly
(`.icon-sprite { position: absolute; width: 0; height: 0; overflow: hidden; }`
in `styles.css`). Without it, the browser renders the sprite at its SVG
default size (300×150) and it shows up as blank whitespace at the top of the
page — this actually happened once during development and had to be fixed as
a follow-up.

### Icon inventory (as of the SVG icon system commit)

`icon-logo` (hexagon+P brand mark, shared with favicon), `icon-lock` (ISO
27001), `icon-chip` (ISO 42001/AI), `icon-clipboard` (SOC 2), `icon-compass`
(NIST CSF), `icon-eu` (GDPR — flag rect + star, deliberately simplified from
an earlier 8-dot "EU stars" version that read as too busy at small size),
`icon-card` (PCI DSS), `icon-shield` (NIS2), `icon-scale` (EU AI Act),
`icon-scan` (Assess — magnifier with a check; an earlier horizontal line
inside the lens read as "zoom out"), `icon-layers` (Build — stacked planes,
echoing the Five Layers section; replaced a gear that read as a sun/virus at
tile size), `icon-monitor` (Operate), `icon-calendar` / `icon-mail` (contact
buttons).

Always judge icons at real rendered size, not from the path data — both
failures above were only visible in a screenshot.

### Mobile

Under 600px, `.cert-badge` switches to a compact grid row (icon tile left,
name + description right) instead of stacking the tile above the title —
halves the height of the 8-card compliance section on phones.

Platform layers (01 / Platform): on desktop the `.platform-stack` list is
sticky and highlights as you scroll the descriptions. Under 960px it can't
be sticky, so it's hidden entirely and each `.platform-step` becomes its own
layer card that takes the active styling itself (teal left edge, white bg).
Otherwise the highlight animates on a list that has already scrolled off
screen, and the list just duplicates the step headings.

Emoji were the original state of all these icons (🔒🤖📋🧭🇪🇺💳🛡️⚖️🔍⚙️📊📅📧)
and were replaced because they render inconsistently across platforms/fonts
and clashed with the site's deliberate geometric design system.

## Workflow notes

- Feature branches follow the `claude/<kebab-description>` naming convention
  used throughout this repo's history (see `git branch -a`). Push to origin
  and open a PR against `master` rather than committing directly to `master`.
- Verifying UI changes: no Chrome extension, but headless Chrome works:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new
  --force-device-scale-factor=2 --window-size=1400,8000 --virtual-time-budget=4000
  --screenshot=out.png file://$PWD/index.html`, then crop with
  `sips -c H W --cropOffset Y X` (use offset ≥1 — `0 0` means "centered").
  For mobile, headless ignores narrow window widths; load the page in a
  390px-wide `<iframe>` from a wrapper HTML page instead
  (`--allow-file-access-from-files`). No PIL available.
