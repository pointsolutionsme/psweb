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

## Architecture page (`architecture.html` + `architecture.js`)

Dedicated page (canonical `/architecture`, in `sitemap.xml`) showing how a
governed request moves through the platform. Scroll step-through
("scrollytelling") like 01 / Platform: sticky dark diagram panel (`.flow-main`)
+ 8 caption steps; the closest-to-center IntersectionObserver in
`architecture.js` activates exactly one step at a time (do not reintroduce
per-entry toggles — they allowed multiple active states).

- Layout: 3+3 "snake" grid, not a single row — six full-width nodes truncate
  at the 1200px container (verified in renders: labels collapsed to "I…",
  "U…"). Row 1 L→R: Identity (SSO) → User channel → AI Gateway; row 2 R→L:
  Model (directly under AI Gateway) → Tool Hub → Your systems, so the flow
  reads continuously without a jump-back. All six cards must stay equal size.
- `.flow-boundary` (dashed "YOUR BOUNDARY" container) wraps only Tool Hub +
  Your systems and has `padding: 0.375rem` — deliberately half the 0.75rem
  horizontal node gap (owner-specified ratio; mobile: 0.5rem of the 1rem gap).
- Two cross-cutting planes ("Security and policy", "Observability and cost")
  sit BELOW the flow as large side-by-side rectangles, activated on steps
  07/08 after all six nodes. They are planes, not flow stages — never insert
  them into the linear sequence.
- There is intentionally NO connecting flow line. Two iterations shipped and
  were rejected by the owner (fixed-percentage SVG path floated above the
  grid; JS-measured path worked but "serves no purpose and ruins display").
  Do not re-add one.
- Page icons reuse the homepage monochrome sprite (`icon-lock`, `icon-compass`,
  `icon-chip`, `icon-layers`, `icon-monitor`, `icon-shield`) plus two drawn for
  the page (`icon-user`, `icon-chart`) in the same 24px stroke style — teal
  default, chrome-100 when active. Emoji were tried and rejected (clash with
  the monochrome system).
- Homepage teaser: `02 / Architecture` section (`#architecture`) between
  Platform and Sovereignty — static 6-icon strip + primary button to
  `architecture.html`. Eyebrows after it are renumbered 03–07. Nav
  "Architecture" points to `#architecture` on the homepage and to
  `index.html#architecture` from the architecture page (not to
  `architecture.html`).

## Copy conventions (enforced site-wide)

- No Oxford comma, anywhere ("code, tickets, documents, CRM, ERP").
- American spelling only: organization, minimization.
- Framework function names are proper nouns: "Identify and Protect functions"
  (NIST CSF).
- No specific tech stack names in marketing copy — "modern infrastructure
  approaches", not Kubernetes/OpenShift (owner decision).
- Section headers use sentence-style casing ("Sovereignty Without the Hardware
  Bill", "Who Does the Work").

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
  On Linux: `/usr/bin/google-chrome` exists, and Playwright works via
  `NODE_PATH=~/.npm-global/lib/node_modules node script.js` with
  `require('@playwright/test')` (plain `require('playwright')` does not
  resolve). Playwright is the better tool for scroll-triggered reveals and
  per-element screenshots.

## Gotchas learned the hard way

- **Orphaned `reveal` elements (hit 3 times).** Anything with class `reveal`
  in HTML but missing from the IntersectionObserver selector list in
  `script.js` stays at `opacity: 0` forever — the element renders invisible
  with no console error. Bit the sovereignty header and later the
  architecture strip + CTA. Rule: whenever a new element gets `reveal`, add
  its class to the observer list, and verify visibility in a render.
- **Rewrites silently drop small fixes.** When a delegated agent rewrites a
  file wholesale, previously applied micro-fixes get lost (nav Home link
  dropped once; Oxford-comma copy fixes regressed multiple times despite
  "byte-identical" claims). After any rewrite, re-grep the known fix strings
  and re-check nav/breadcrumb/footer links before accepting the result.
- **Alignment bugs: measure, don't eyeball.** Use
  `getBoundingClientRect().left` in Playwright to prove headers share a left
  edge (caught the 1000px-vs-1200px centered-container offset on Sovereignty
  and About this way).
- **Truncation bugs only show in renders.** Six equal-width diagram nodes at
  1200px looked fine in code but rendered as "I…", "U…", "A…", "M…" — always
  screenshot UI layout claims before reporting them as done.
