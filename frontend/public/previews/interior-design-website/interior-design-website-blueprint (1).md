# The Atelier Blueprint
### A Reusable Premium Website System for Interior Design Studios

Prepared as creative direction + front-end documentation. Nine phases, from research to build handoff. No code — this is the thinking a senior frontend team (or an agentic builder like Antigravity) needs before a single component is built.

**How this template stays reusable across many clients:** everything below is built on a fixed *structural system* (grid, spacing, type scale, motion rules, component anatomy) plus a *swappable identity layer* (one of four accent themes, a radius mood, and client photography). Rebuilding for a new studio should mean swapping tokens and imagery — never re-deriving the system from scratch. This reusability model is explained fully in Phase 3.

---

## Table of Contents
1. Industry Research & Pattern Analysis
2. User Psychology
3. Design System
4. Site Architecture
5. Page-by-Page Breakdown
6. Premium UI Details
7. Performance, Accessibility & SEO Strategy
8. Component Library
9. Implementation Roadmap (for Antigravity)

---

## PHASE 1 — Industry Research & Pattern Analysis

### 1.1 What was studied
Rather than invent patterns, this blueprint is triangulated from the working conventions of the studios and platforms that currently define "premium" in this category: **Studio Ashby, Kelly Wearstler, Commune Design, Roman and Williams Guild, ASH NYC, Rose Uniacke, Beata Heuman, NICOLEHOLLIS, Retrouvius, Faye Toogood**, plus the broader Awwwards/FWA architecture-and-interiors showcase (studios like Pelizzari, Smeulders Interieurgroep, and House of Honey rank consistently in 2026 site-of-the-day honors). The pattern below is what repeats across nearly all of them — which is exactly what makes it safe to templatize.

### 1.2 Navigation structure
- **Minimal top nav**, 4–6 items max: Studio/About, Services, Portfolio/Projects, Journal (optional), Contact. Logo left or center, primary CTA ("Enquire" / "Start a Project") right, treated as a button — not a nav link.
- Nav background starts **transparent over the hero image**, then solidifies (blur or solid fill) on scroll — a near-universal pattern that lets the hero photography breathe.
- No mega-menus in this category — the catalog is too small (services are usually 3–6 offerings). A simple dropdown or an inline "Services" sub-list is enough. Mega-menus read as e-commerce/SaaS, which undercuts the boutique feel.
- Mobile: full-screen takeover menu, large serif nav links, generous line-height, secondary utility links (contact, social) anchored to the bottom.

### 1.3 Hero layout
Three dominant hero patterns, in order of premium-market frequency:
1. **Full-bleed single image/video** with a short, restrained headline (4–8 words) bottom-left or centered, minimal subcopy, one CTA. This is the category default because the work *is* the pitch.
2. **Split hero** — 55/45 image-to-text, used by studios that lead with philosophy/positioning before showing work (Rose Uniacke, NICOLEHOLLIS).
3. **Editorial/maximalist hero** — oversized display type overlapping or interacting with imagery, used by studios positioning as more art-led (Studio Ashby). Higher risk, higher memorability.
- Headlines are almost never claims ("The Best Interior Designers in X") — they're **point-of-view statements** ("Interiors that feel like they were always there.").

### 1.4 Typography patterns
- Nearly universal: **one high-contrast display serif + one clean grotesk/sans**, used with a lot of restraint (2–3 sizes, not a dozen).
- Large type is used as a *layout device*, not just for headlines — oversized numerals, section labels, and pull-quotes carry visual weight that would otherwise need imagery.
- Body copy stays small and quiet (15–17px), always secondary to photography.

### 1.5 Color psychology
- Palettes are drawn from **material references, not brand theory**: plaster, limewash, travertine, linen, walnut, bronze/patina, ink. This is what separates the category from generic corporate sites — the palette should look like it was pulled from a moodboard, not a color wheel.
- Near-white or stone neutrals dominate (70–80% of the interface) so photography — which is usually warm, textured, and detailed — reads as the "color" of the page.
- One accent color, used sparingly (links, CTA fills, focus states, small dividers) — never as large background fills, which flattens the luxury feel.
- Very high value contrast (near-black ink text on near-white) reads as confident and editorial; soft grey-on-grey reads as timid and is a common mistake.

### 1.6 Visual hierarchy
- Photography > headline > body copy > UI chrome, in that order, on every page.
- One dominant focal element per section — premium sites rarely ask the eye to do more than one thing per screen.
- Hierarchy is built with **scale and spacing**, not color or boxes/borders. Cards and containers are used far less than in SaaS design.

### 1.7 CTA placement
- A single, consistent CTA verb across the whole site ("Enquire," "Start a Conversation," "Book a Consultation") — repetition builds recognition and lowers decision friction.
- CTAs appear: in the nav (persistent), at the end of the hero, after the portfolio teaser, after testimonials/trust section, and in the footer — never mid-paragraph, never more than one visually competing CTA per screen.
- Primary CTA styling is deliberately understated (thin border or quiet solid fill) — a loud, gradient, shadow-heavy button reads as e-commerce and breaks trust in this category.

### 1.8 Trust-building sections
Ranked by how consistently top studios use them:
1. **Press/"as seen in"** logo strip (Architectural Digest, Elle Decor, Dwell, House & Garden) — the single strongest trust signal in this industry.
2. **Portfolio depth** — number and quality of real, finished projects outweighs any written claim.
3. **Named, credentialed team** with real photos — anonymity reads as risk in a category where clients invite strangers into their homes.
4. **Process transparency** — a visible, step-by-step "how we work" section, because the client's biggest fear is an unpredictable renovation, not bad taste.
5. **Testimonials attributed to real (or realistically detailed) clients**, ideally paired with the project they reference.
6. **Awards/affiliations** (ASID, IIDA, industry press) as small, quiet marks — not badges.

### 1.9 Conversion flow
The category converts on **trust accumulation, not urgency**. The flow is: Hero (credibility signal) → Portfolio proof → Philosophy/process (reduces perceived risk) → Team (humanizes) → Social proof → Low-friction contact. There is no "buy now" moment — the funnel ends in a **qualifying enquiry form**, often with a short project-type/budget question set, which pre-filters unqualified leads for the studio.

### 1.10 Animation
- Restrained, physical, editorial: slow fades and vertical reveals on scroll (300–600ms), image parallax at low intensity, cursor-following image previews on portfolio lists (hover a project title → thumbnail follows cursor). This last pattern is the single most "premium-feeling" micro-interaction in the category and appears on the majority of award-winning studio sites.
- Page transitions are often custom (cross-fade or wipe) rather than a hard reload — signals craft.
- Nothing bounces, spins, or uses easing that feels playful/toy-like; everything eases like weighted material settling into place.

### 1.11 Card layouts
- Portfolio/project cards: image-dominant, minimal caption (project name + location or room type), no borders, no shadow — separation comes from whitespace.
- Service cards: usually text-led with a small supporting image or icon, arranged in a simple 2–3 column grid, generous internal padding.
- Team cards: portrait + name + role, hover reveals a one-line bio or Instagram link.

### 1.12 White space usage
- Category-defining trait: **generous negative space** around every image and headline. Premium interior sites use 2–3x the whitespace of an average SaaS site. Cramped layouts read as budget/DIY.
- Section padding is large and consistent (120–160px desktop) so the site "breathes" the same way a well-designed room does.

### 1.13 Grid systems
- 12-column base grid, but content rarely fills it symmetrically — **asymmetric compositions** (image at 7 columns, text at 4, offset) are a signature move that avoids the "boxed template" feel.
- Full-bleed image breaks are used regularly to interrupt the grid and create rhythm.

### 1.14 Mobile UX
- Single column, image-first. Hero image crops to portrait/square rather than a shrunk landscape.
- Sticky, minimal bottom or top CTA bar on longer pages (especially case studies) so "Enquire" is always one tap away.
- Portfolio grids collapse to a single-column, swipeable story rather than a dense grid — mobile users browse one project at a time.

### 1.15 Premium interactions
- Cursor-follow image previews (desktop only).
- Before/after sliders on renovation-focused projects — extremely high engagement, industry-specific, and directly demonstrates value.
- Smooth scroll-linked image reveals (image mask wipes open as user scrolls).
- Custom cursor states (e.g., cursor becomes a small "View Project" pill over clickable images).

### 1.16 Footer structure
- Wide, calm, image-free (or one small closing photo). Sitemap links in 2–4 columns, studio address/hours (interior design is often local/regional — location builds trust), social links (Instagram is disproportionately important in this industry), newsletter signup, and a final restrained CTA repeat.
- Often includes a large closing brand moment — the studio wordmark set very large, quiet, as a signature close.

---

## PHASE 2 — User Psychology

### What makes clients trust an interior design business
Interior design is a **high-stakes, high-intimacy purchase** — clients are inviting someone into their home, spending tens of thousands of dollars, and betting on someone else's taste outlasting their own patience. Trust is built through:
- **Evidence over claims.** A portfolio of real, finished, well-photographed rooms does more persuasive work than any paragraph of copywriting.
- **Process visibility.** Fear of the unknown (timeline slippage, budget overruns, chaos during a renovation) is often a bigger barrier than taste-matching. Showing a clear process reduces this fear directly.
- **Specificity.** Named team members, real locations, real square footage, real budgets/ranges — vague "luxury" language reads as evasive.
- **Consistency of taste.** The portfolio itself should feel edited and coherent — a scattershot mix of styles undermines confidence more than almost any UI decision.
- **Social proof from recognizable, verifiable sources** (press, awards, named client testimonials).

### Emotions the site should create
- **Calm** — the opposite of the stress a renovation actually involves. The site itself should feel like a finished, well-designed room.
- **Aspiration without intimidation** — the client should picture *their own* home, not feel priced out or judged before they've even reached out.
- **Confidence in competence** — precision in layout and typography signals precision in project execution; sloppy UI subconsciously implies a sloppy renovation.
- **Warmth** — interior design is emotional and personal (it's someone's home), so the site should never feel corporate or transactional.

### Design mistakes to avoid
- Stock photography of generic staged rooms — instantly recognizable and trust-destroying in a portfolio-driven category.
- Overloading the homepage with every service, award, and credential at once — this is a taste business; restraint *is* the pitch.
- Heavy, generic SaaS UI patterns (bold gradients, big rounded shadowed cards, emoji, playful bounce animation) — these actively contradict "premium."
- Long, friction-heavy contact forms without a qualifying, conversational tone — clients want to feel like they're starting a relationship, not filing a request ticket.
- Carousels that auto-rotate testimonials or projects too fast to read — undermines the "unhurried" feeling the whole category depends on.
- Inconsistent image color grading across the portfolio — breaks the sense of a coherent, singular design point of view.

### Visual language of professionalism
Precision spacing, a disciplined and limited color palette, high-quality unedited-feeling photography, restrained typography with real hierarchy, and motion that feels weighted and deliberate rather than bouncy. Professionalism in this category is communicated by what the design **leaves out**, not what it adds.

---

## PHASE 3 — Design System

### 3.1 Direction & the reusability model
The system is named **"Quiet Materiality."** Instead of the generic AI-default combination of warm-cream background + terracotta accent + serif headline, the neutral shell here leans slightly cooler and stonier (plaster/limestone, not parchment), paired with an ink that's warmed toward charcoal-oak rather than pure black. The flagship accent is a deep bottle-green-and-brass "Verdigris" pairing — a patina reference, not a paint-chip default — with three additional swappable accent themes so the same structural system can be re-skinned per client without ever touching layout, spacing, or type scale.

**This is the core of the template's reusability:** neutrals, spacing, type scale, radius logic, and motion timing are the *fixed shell*. Only the accent theme and photography change per client. A rebrand for a new studio should be a token swap, not a redesign.

### 3.2 Color Palette

**Core neutrals (fixed across every client build):**

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--canvas` | Limestone | `#EFEEE9` | Primary background |
| `--canvas-deep` | Travertine | `#E6E2D8` | Alternating section background |
| `--paper` | Paper | `#FFFFFF` | Cards, forms, contrast surfaces |
| `--ink` | Wet Charcoal | `#201F1C` | Primary text, dark section backgrounds |
| `--ink-soft` | Stone Grey | `#6B6862` | Secondary/body text, captions |
| `--hairline` | Hairline | `#DAD6CC` | Borders, dividers, table rules |
| `--success` | Moss | `#4A5D45` | Form success states |
| `--error` | Clay Red | `#8C3B2E` | Form error states (paired with icon + text, never color alone) |

**Swappable accent themes (client identity layer — pick one per client):**

| Theme | Mood fit | Primary | Secondary |
|---|---|---|---|
| **Verdigris** *(flagship default)* | Old-money, botanical, quiet luxury | Bottle Green `#1F3327` | Aged Brass `#A98D5B` |
| **Roman Clay** | Warm, Mediterranean, sun-drenched | Burnt Sienna `#B5623A` | Ivory `#F6F0E4` |
| **Ink & Slate** | Architectural, monochrome, minimalist | Midnight Ink `#14181F` | Warm Silver `#B8B2A4` |
| **Oxblood** | Dramatic, maximalist, editorial | Deep Burgundy `#5C2A2A` | Antique Gold `#C9A24B` |

Primary accent drives CTAs, links, and focus states. Secondary accent drives dividers, hover underlines, and small decorative marks (never large fills).

### 3.3 Typography

**Practical pairing (default — free, license-friction-free, deployable per client at no extra cost):**
- Display: **Fraunces** (variable serif, high optical contrast, warm editorial character)
- Body/UI: **General Sans** (clean grotesk, excellent at small sizes)

**Premium upgrade path (for flagship/bespoke client budgets):**
- Display: **GT Sectra Display** or **Canela**
- Body/UI: **Neue Montreal**

**Type scale** (modular, ~1.333 ratio, desktop / mobile):

| Token | Role | Desktop | Mobile |
|---|---|---|---|
| `display-xl` | Hero headline | 96px / 1.0 | 44px / 1.05 |
| `display-l` | Section headline | 64px / 1.05 | 36px / 1.1 |
| `heading-1` | Page/subsection title | 44px / 1.1 | 28px / 1.15 |
| `heading-2` | Card/module title | 28px / 1.2 | 22px / 1.2 |
| `heading-3` | Minor heading | 20px / 1.3 | 18px / 1.3 |
| `body-l` | Intro/lede paragraphs | 19px / 1.6 | 17px / 1.6 |
| `body-m` | Default body | 16px / 1.6 | 15px / 1.6 |
| `caption` | Meta, labels, eyebrows | 13px / 1.4, tracked +0.08em, uppercase | same |

Eyebrow labels (small tracked caps above headings) are used only where they encode real structure (a category label, a step number in an actual sequence) — never as pure decoration.

### 3.4 Spacing System
8px base unit.

`space-1: 4px` · `space-2: 8px` · `space-3: 12px` · `space-4: 16px` · `space-5: 24px` · `space-6: 32px` · `space-7: 48px` · `space-8: 64px` · `space-9: 96px` · `space-10: 128px` · `space-11: 160px`

Section vertical rhythm: **64px mobile / 96px tablet / 140–160px desktop** between major sections. Component-internal spacing stays in the 8–32px range. This large jump between micro and macro spacing is what produces the "expensive whitespace" feeling identified in Phase 1.

### 3.5 Border Radius
Two selectable "moods," chosen once per client and applied globally:

| Mood | Buttons/Inputs | Cards | Images | Fits |
|---|---|---|---|---|
| **Architectural** *(default)* | 4px | 2px | 0px (sharp) | Minimalist, monochrome, editorial studios |
| **Boutique** | 10px | 16px | 8px | Warmer, softer, residential-first studios |

Never mix radius moods within one build — consistency here reads as intentional craft.

### 3.6 Shadows / Elevation
Elevation is used sparingly; hairline borders and whitespace do most of the separation work.

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(32,31,28,.04)` | Inputs on focus |
| `shadow-sm` | `0 2px 8px rgba(32,31,28,.06)` | Sticky nav after scroll |
| `shadow-md` | `0 8px 24px rgba(32,31,28,.08)` | Dropdowns, tooltips |
| `shadow-lg` | `0 24px 64px rgba(32,31,28,.14)` | Modals, lightbox, mobile menu overlay |

### 3.7 Icons
Thin line icons, 1.5px stroke, 24px grid (Phosphor Light or Lucide as base sets). Icons are **functional only** — navigation, form states, filters, social links — never decorative next to headlines or stat numbers, which cheapens the editorial tone this category depends on.

### 3.8 Buttons

| Variant | Look | Hover | Use |
|---|---|---|---|
| **Primary** | Solid accent-primary fill, paper text, generous 16/32px padding | Fill darkens 8%, no shadow pop | Main conversion actions ("Start a Conversation") |
| **Secondary** | 1px accent-primary border, transparent fill | Fills solid on hover | Secondary actions ("View Portfolio") |
| **Tertiary/Link** | Text only, accent-primary color | Underline draws in from left, 250ms | In-content, low-emphasis actions |
| **Ghost** (on photography) | Paper text, 1px paper border at 40% opacity | Fills solid paper, text flips to ink | CTAs sitting on top of hero images |

Labels: sentence case, +0.01em tracking — never uppercase-block buttons, which reads corporate/e-commerce rather than editorial.

### 3.9 Form Styles
Underline-style inputs by default (transparent background, single bottom hairline, label floats above on focus/fill) — matches the editorial system better than boxed Material-style inputs. 48px minimum touch target. 24–32px vertical gap between fields. Inline validation pairs an icon *and* text (never color alone). Multi-step, conversational framing for the main enquiry form (see Phase 5, Contact).

### 3.10 Cards
No borders, no shadow by default — separation via whitespace and consistent image aspect ratios (4:5 portrait for portfolio, 3:2 for editorial/blog). A 1px hairline only appears on dense, text-only cards (FAQ, pricing tiers) where whitespace alone can't carry the separation.

### 3.11 Hover States
Images: subtle 4–6% scale-up on a 4–6s ease, contained by an overflow-hidden wrapper (never the whole card scaling, which shifts layout). Links/text: underline draws in, doesn't just appear. Buttons: fill/opacity shift only, no vertical "lift" bounce. Cursor-follow preview for portfolio list hovers (desktop only, see 6.9).

### 3.12 Inputs
See 3.9. Placeholder text is muted (`--ink-soft` at 60%), never used as a label substitute (accessibility requirement — every input keeps a persistent visible label).

### 3.13 Navigation
Transparent-over-hero → solid-on-scroll (with `shadow-sm`) pattern, 80px height desktop / 64px mobile. Logo left, links center or right-aligned, primary CTA always a button, never a plain link.

### 3.14 Section Spacing
See 3.4. Section backgrounds alternate `--canvas` / `--canvas-deep` / full-bleed image / `--ink` (for a dark closing or testimonial section) to create visual pacing across a long page without needing many other UI devices.

### 3.15 Container Widths
Outer container: 1440px max. Content max-width: 1320px. Editorial/reading content (blog body, long-form about copy): 720px max for line-length comfort. Margins: 80px desktop, 40px tablet, 24px mobile.

### 3.16 Grid System
12-column, 24px gutter desktop / 16px mobile. Asymmetric compositions are intentional and encouraged (e.g., a 7/5 image-text split, a 4-4-4 with one column offset) rather than always-centered, always-symmetric blocks — this is what keeps the template from feeling like a generic boxed layout (see Phase 1.13).

---

## PHASE 4 — Site Architecture

Pages are tagged by tier so the template scales down for smaller studio budgets and up for flagship builds.

```
Homepage                              [CORE]
├── About / The Studio                [CORE]
├── Process (How We Work)             [RECOMMENDED — high trust value]
├── Services                          [CORE]
│   └── Service Detail (×N)           [CORE]
├── Portfolio / Projects              [CORE]
│   └── Project / Case Study Detail   [CORE]
├── Team                              [RECOMMENDED]
├── Press / As Seen In                [RECOMMENDED]
├── Testimonials                      [RECOMMENDED — often folded into homepage instead]
├── Pricing / Investment              [OPTIONAL — many studios use a qualifying form instead of public pricing]
├── Journal / Blog                    [OPTIONAL — SEO play]
│   └── Article Detail                [OPTIONAL]
├── Trade Resources / Shop            [OPTIONAL — e-commerce add-on for studios with product lines]
├── FAQ                               [RECOMMENDED]
├── Careers                           [OPTIONAL]
├── Contact                           [CORE]
├── Thank You (post-submit)           [CORE]
├── 404                               [CORE]
├── Privacy Policy                    [CORE]
├── Terms of Service                  [CORE]
└── Accessibility Statement           [RECOMMENDED]
```

**Minimum viable build (small studio):** Homepage, About, Services, Portfolio + Project Detail, Contact, Thank You, 404, Privacy/Terms.
**Flagship build:** all pages above, including Journal for SEO and Trade Resources for retail revenue.

---

## PHASE 5 — Page-by-Page Breakdown

Full 12-point breakdowns are given for the seven pages that carry the core conversion journey and the most design nuance: **Homepage, About, Services, Service Detail, Portfolio, Case Study Detail, Contact.** The remaining pages follow in a tighter but complete format — every field is still addressed, just without repeating structural rules already established above.

---

### 5.1 Homepage — Full Breakdown

**Purpose:** Establish taste and credibility within one scroll; route visitors to Portfolio or Contact.

**Layout (Desktop):** Full-bleed hero image/video, restrained headline bottom-left, ghost CTA. Followed by: 3-project portfolio teaser (asymmetric grid), a philosophy/positioning statement in a 55/45 split with a supporting image, a process-preview strip (3–4 steps, numbered — a real sequence, so numbering is earned), press logo strip, testimonial spotlight (single quote, large serif type, not a card), closing full-bleed CTA section on `--ink` background.

**Content Hierarchy:** Hero image → headline → portfolio proof → philosophy → process → trust marks → testimonial → CTA. Never more than one h1 (hero) and one CTA style dominating any single viewport.

**Imagery:** One hero-defining image or slow-motion video loop (must be real project photography, graded consistently); 3 curated portfolio images for the teaser, chosen for tonal/style consistency, not recency.

**Animation:** Hero image slow ambient zoom (60–90s loop, barely perceptible); section content fades/rises 24px on scroll into view; portfolio teaser images get the cursor-follow preview treatment on hover.

**CTA Placement:** Nav (persistent), hero (ghost button), after portfolio teaser ("View Full Portfolio"), closing dark section (primary "Start a Conversation").

**Spacing:** 160px between major sections desktop, alternating `--canvas`/`--canvas-deep`/full-bleed/`--ink` backgrounds for rhythm.

**Tablet Layout:** Hero and philosophy split collapse to stacked (image above text); portfolio teaser drops to 2-column.

**Mobile Layout:** Everything single column; hero crops to portrait 4:5; process steps become a vertical stack with connecting hairline instead of horizontal strip; sticky bottom CTA bar appears after hero scroll-past.

**Accessibility:** Hero video/animation respects `prefers-reduced-motion` (falls back to static image); all images have descriptive alt text referencing room/project, not just filenames; heading order stays strictly h1→h2→h3.

**SEO:** Single h1 with studio name + core service + location (e.g., "Interior Design Studio — [City]"); meta description leads with differentiator, not generic claims; hero image uses a compressed, properly-dimensioned WebP/AVIF with LCP-optimized loading (see Phase 7).

---

### 5.2 About / The Studio — Full Breakdown

**Purpose:** Convert taste-alignment into trust; humanize the studio behind the portfolio.

**Layout:** Opens with a founder/studio portrait (not a stock lifestyle shot) beside a short origin/philosophy statement, 55/45 split. Followed by a set of "principles" or values presented as large numbered or lettered statements (only if there's a genuine short list — 3 to 5 max). Studio-in-progress/behind-the-scenes imagery breaks up the text-heavy sections. Closes with a team teaser linking to the full Team page.

**Content Hierarchy:** Portrait/founder story → philosophy statement → principles → behind-the-scenes proof → team teaser → CTA.

**Imagery:** Genuine studio/team photography, materials/moodboard flat-lays, in-progress site photography — signals authenticity more than any finished-room shot could here.

**Animation:** Same scroll-reveal language as homepage; a horizontal-scroll strip for behind-the-scenes images is an appropriate signature moment on this page specifically (low risk, high texture).

**CTA Placement:** One at the end, low-pressure ("Meet the Team" or "Get in Touch") — this page's job is trust-building, not conversion pressure.

**Spacing:** Same 140–160px section rhythm; slightly tighter (96px) around the principles list to keep it feeling like one connected thought.

**Tablet Layout:** Portrait/text split stacks; principles list drops from a row to a 2-column grid.

**Mobile Layout:** Single column throughout; behind-the-scenes strip becomes a swipeable horizontal scroller (native touch scroll, no custom JS needed).

**Accessibility:** Founder/team names and roles always in real text (not baked into images) so they're screen-reader accessible and indexable.

**SEO:** Targets studio name + "about"/"founder" + location queries; structured data (`Organization` / `Person` schema) for founder and studio for potential knowledge-panel eligibility.

---

### 5.3 Services (Hub) — Full Breakdown

**Purpose:** Clarify what's offered and route each visitor to the right service detail page.

**Layout:** Short intro statement, then a list (not a grid of boxy cards) of 3–6 services — each row full-width, alternating text-left/image-right and text-right/image-left, large service name in display type, one-line description, "Learn More" link. This list format outperforms card grids here because each service usually deserves real weight, not equal-sized-box treatment.

**Content Hierarchy:** Intro → service rows in priority order (studio's most representative/profitable service first) → cross-link to Process page → CTA.

**Imagery:** One representative project image per service row, cropped consistently (same aspect ratio across all rows for rhythm).

**Animation:** Each row's image does a subtle reveal/mask-wipe as it enters viewport; alternating layout direction already creates visual movement without needing extra motion.

**CTA Placement:** Each row links to its Service Detail page (primary interaction); one closing CTA for "not sure which service fits" → Contact.

**Spacing:** 120px between service rows desktop, generous enough that each reads as its own moment.

**Tablet Layout:** Rows stack image-above-text regardless of original left/right orientation for consistency.

**Mobile Layout:** Full stack, single column, image first then text — matches the "image is the pitch" priority from Phase 1.

**Accessibility:** Each service row is a real semantic block (`<article>` or `<section>` with its own heading) so screen readers can navigate service-by-service via heading list.

**SEO:** Each service gets its own h2 here (feeding into its own page's h1); this hub page is a strong candidate for `Service` schema markup listing all offerings.

---

### 5.4 Service Detail (Template) — Full Breakdown

**Purpose:** Deep-dive one service, build category-specific trust, and convert into an enquiry pre-qualified for that service type.

**Layout:** Hero specific to this service (not the homepage hero) with service name + one-line positioning. "What's included" section (short scannable list — not paragraphs). "What to expect" mini-process specific to this service. Relevant portfolio filter (auto-pulled projects tagged with this service). FAQ specific to this service (3–5 Qs — pricing range, timeline, minimum project size). Closing CTA pre-filled to mention the service in the enquiry form.

**Content Hierarchy:** Positioning → inclusions → process → proof (filtered portfolio) → service-specific FAQ → CTA.

**Imagery:** 3–5 images from real projects representing this exact service, ideally a mix of wide room shots and detail/material shots.

**Animation:** Portfolio filter results fade/reflow when filtered (see component library, 8.4); otherwise same reveal language as other pages.

**CTA Placement:** After inclusions (early conversion opportunity for a ready visitor), and again at page end.

**Spacing:** Standard 140px rhythm; FAQ accordion section uses tighter 64px internal spacing since it's a dense, scan-heavy module.

**Tablet Layout:** Two-column inclusion list drops to one column; portfolio filter grid drops from 3 to 2 columns.

**Mobile Layout:** FAQ accordion becomes the primary way to consume the dense inclusions/pricing detail (collapsed by default, reduces scroll fatigue).

**Accessibility:** Accordion FAQ uses proper `aria-expanded`/`aria-controls` semantics; filtered portfolio grid announces result count changes via an `aria-live` region for screen reader users.

**SEO:** Own h1 (service + location, e.g., "Full-Service Interior Design — [City]"); this is the page most likely to rank for high-intent local search, so unique meta title/description per service is essential (never a templated duplicate across services).

---

### 5.5 Portfolio / Projects Index — Full Breakdown

**Purpose:** Be the primary evidence engine of the whole site; this page (and case studies behind it) does more conversion work than any other.

**Layout:** Filter bar (by service type, room type, or style — 3–5 filters max) above an asymmetric masonry-style grid of project thumbnails. No pagination if the catalog is under ~30 projects — infinite/load-more scroll keeps the "keep browsing" momentum.

**Content Hierarchy:** Filter controls → project grid (image-first, project name + location/room type as the only visible caption) → optional closing CTA.

**Imagery:** This page lives or dies on photography consistency — same color grade, similar crop logic (mostly 4:5 portrait) across every thumbnail.

**Animation:** Cursor-follow preview on hover (desktop) — hovering a project title shows a floating thumbnail that tracks the cursor; grid re-flows with a stagger-fade when filters change.

**CTA Placement:** No hard CTA needed mid-grid (would break browsing flow); one quiet CTA at the very end for visitors who've browsed everything.

**Spacing:** Tighter than other pages — 16–24px grid gutters — since density here reads as "prolific," not "cramped," given the equal image sizing.

**Tablet Layout:** Masonry drops to a clean 2-column grid.

**Mobile Layout:** Single column, one project per "screen" essentially, swipe/scroll to browse — filter bar becomes a horizontal scroll chip row or a bottom-sheet filter modal.

**Accessibility:** Filter changes update an `aria-live` results count; each project thumbnail's alt text names the project and room type, not just "interior photo."

**SEO:** This index page should be crawlable and linkable (not JS-only infinite scroll with no fallback) — use progressive loading with real paginated URLs underneath so search engines can index individual projects.

---

### 5.6 Project / Case Study Detail — Full Breakdown

**Purpose:** The single highest-trust page on the site — prove the studio's process and result on one real project in depth.

**Layout:** Full-bleed hero image, project meta bar (location, room type, size, timeline, service used) as a clean horizontal data strip below the hero, then a long-form scroll: brief/challenge → approach → **before/after slider** (if renovation) → image gallery (large, full-bleed, generously spaced) → a client quote specific to this project → related projects strip at the end.

**Content Hierarchy:** Hero image → meta data → narrative (brief → approach → result) → visual proof gallery → testimonial → related work → CTA.

**Imagery:** The largest, highest-quality images on the entire site belong here — this page should feel like flipping through a beautifully printed portfolio book.

**Animation:** Before/after slider (drag or click-to-reveal) is the signature interaction of this template for the interior design vertical — it directly demonstrates transformation, the core value proposition of the industry. Gallery images do a mask-reveal on scroll; meta bar can be sticky/condensed on scroll for long pages.

**CTA Placement:** End of page only ("Enquire About a Similar Project") plus the related-projects strip functioning as a soft secondary CTA (keep browsing).

**Spacing:** Generous, editorial — 96–140px between narrative beats; gallery images can run edge-to-edge with minimal gaps (8–16px) to feel like a continuous visual story.

**Tablet Layout:** Meta bar wraps to two rows; gallery drops from a mixed 2/3-column layout to a clean single or 2-column.

**Mobile Layout:** Before/after slider becomes tap-to-toggle if drag interaction is unreliable on smaller touch targets; sticky bottom CTA bar appears (this page has the highest intent-to-convert of any page, so friction here matters most).

**Accessibility:** Before/after slider must be operable via keyboard (arrow keys) and expose current state to screen readers (e.g., "Showing after image" announced on toggle); all gallery images carry specific alt text (not "gallery image 1").

**SEO:** Each project page targets long-tail queries ("[room type] renovation, [city]"); `ImageObject`/`CreativeWork` schema strengthens image-search visibility, which is a meaningful traffic channel in this industry.

---

### 5.7 Contact — Full Breakdown

**Purpose:** Convert qualified interest into a booked consultation with minimum friction and maximum pre-qualification.

**Layout:** Two-column split — left side a short, warm framing statement + studio contact details (address, phone, email, hours, map if physically located) + social links; right side a **short, conversational multi-step form** (project type → rough budget range → timeline → contact details) rather than one long flat form.

**Content Hierarchy:** Framing statement → form (primary focus) → studio details/map (secondary) → FAQ link for common pre-contact questions.

**Imagery:** Minimal — this page should feel calm and functional, not another portfolio moment. At most one small supporting image or none at all (a plain, quiet background is appropriate here).

**Animation:** Multi-step form advances with a gentle horizontal slide/fade between steps; a subtle progress indicator (not a percentage bar — a simple step counter, "Step 2 of 3," fits the tone better).

**CTA Placement:** The form submit button *is* the CTA — no competing CTAs on this page.

**Spacing:** Tighter than editorial pages (form usability > atmosphere here) — 24–32px between form sections, 64–96px page-level padding.

**Tablet Layout:** Two-column split narrows but stays side-by-side down to ~900px, then stacks (details above, form below).

**Mobile Layout:** Single column, form first (after a one-line framing statement) since intent is highest here — don't make mobile users scroll past atmosphere to reach the form.

**Accessibility:** Every field has a persistent visible label (never placeholder-only); multi-step form announces step changes via `aria-live`; sufficient touch target size (48px min) on all interactive elements; clear, specific error messaging (icon + text, not color alone).

**SEO:** `LocalBusiness` schema with NAP (name/address/phone) consistency for local search; page targets "[service] consultation [city]" style intent queries.

---

### 5.8 Remaining Pages (Condensed, Complete)

**Process (How We Work)**
Purpose: neutralize the client's biggest fear — an unpredictable renovation — by making the engagement legible end-to-end. Layout: a vertical or horizontal numbered timeline (Discovery → Design → Sourcing → Install → Reveal), each step with a short description and a representative image. Imagery: behind-the-scenes/in-progress shots, distinct from the polished portfolio. Animation: steps reveal sequentially as the user scrolls, with a connecting line that "draws" itself — an earned use of a progress metaphor since the content is a genuine sequence. CTA: one, at the end. Desktop: horizontal stepper with alternating image position; Tablet: 2-column step grid; Mobile: vertical stack with a simple connecting hairline. Accessibility: steps are a real ordered list (`<ol>`) in the DOM regardless of visual layout. SEO: strong internal-linking hub — link out to relevant Service pages from each step.

**Team**
Purpose: humanize the studio, support the "who am I inviting into my home" trust question. Layout: grid of team cards (portrait, name, role), 3–4 columns desktop. Imagery: consistent, real portraits — same lighting/background treatment across the team for cohesion. Animation: portrait hover reveals a one-line bio or social link via a soft cross-fade. CTA: none required — this is a trust page, not a conversion page. Desktop: 4-col grid; Tablet: 2–3 col; Mobile: single column, larger portraits. Accessibility: name/role/bio always real text, alt text on portraits includes name. SEO: `Person` schema per team member, supports individual name-search discoverability (useful when senior designers have their own following).

**Press / As Seen In**
Purpose: fastest, lowest-effort trust signal on the site. Layout: quiet logo strip (grayscale, evenly sized) near the top, optionally followed by 2–3 short excerpted press mentions below (link out to full articles rather than reproducing text). Imagery: publication logos only. Animation: none needed — this section should read as immediately, statically credible. CTA: none. Desktop/Tablet/Mobile: logo strip reflows from single row to a wrapped 2–3 row grid on smaller screens. Accessibility: logos need real alt text (publication name). SEO: outbound links to original press pieces support natural backlink-adjacent credibility signals (not a ranking factor directly, but supports brand entity recognition).

**Pricing / Investment**
Purpose: pre-qualify visitors on budget fit without a hard-sell price list (most premium studios use ranges, not fixed prices). Layout: a small number of investment "tiers" or ranges described qualitatively (scope-based, not itemized like a SaaS pricing table) alongside what's included at each level. Imagery: minimal. Animation: none needed. CTA: each tier links to Contact, pre-tagged with that tier. Desktop: 3-column tier layout; Tablet: stacked with dividers; Mobile: accordion-style so the page doesn't feel like a wall of numbers. Accessibility: tiers structured as a real list/table, not purely visual columns. SEO: targets "how much does interior design cost [city]" query intent — a very high-value, high-search-volume query in this category.

**Testimonials**
Purpose: reinforce trust with concentrated social proof (many studios also distribute testimonials across other pages rather than needing a standalone one). Layout: large, editorial single-quote spotlights (not small review-card grids, which feel more like a SaaS pattern) with attribution and, where possible, a link to the relevant project. Imagery: optional small client or project thumbnail beside each quote. Animation: gentle auto-advance is acceptable here only if slow (8s+) and pausable — testimonials are one of the few carousel-appropriate contexts, but never auto-advance faster than a comfortable read. CTA: end-of-page only. Desktop: one large quote at a time with manual/auto advance; Tablet/Mobile: same, full width. Accessibility: carousel must be pausable and keyboard-navigable; auto-advance respects `prefers-reduced-motion`. SEO: `Review`/`AggregateRating` schema if genuine structured reviews exist.

**Journal / Blog (Index + Article)**
Purpose: SEO acquisition + secondary trust/expertise signal. Layout (index): editorial grid, 2–3 columns, image-led cards with category/date. Layout (article): 720px-max reading column, large lead image, generous line-height. Imagery: original project photography or genuine editorial photography — never generic stock. Animation: standard scroll-reveal only; nothing elaborate (this content should read as calm, authoritative). CTA: soft, contextual (related articles, or a single mid/end-of-article studio CTA) — never an aggressive pop-up. Desktop/Tablet/Mobile: grid reflows 3→2→1 columns; article column stays comfortable-width at every size (never full-bleed text). Accessibility: proper heading hierarchy within articles, real `<time>` elements for dates. SEO: this is the page type most directly built for organic search — target long-tail, locally-flavored queries ("how to choose a rug size," "[city] renovation permit basics"), with `Article`/`BlogPosting` schema.

**FAQ**
Purpose: resolve pre-contact objections (pricing, timeline, minimum project size, geographic reach) before they become drop-off points. Layout: accordion, grouped by topic if the list is long (General / Pricing / Process). Imagery: none. Animation: accordion expand/collapse only. CTA: one, at the end ("Still have questions? Get in touch"). Desktop/Tablet/Mobile: single-column accordion at every size — this pattern is already mobile-native. Accessibility: full `aria-expanded`/`aria-controls` semantics, keyboard operable. SEO: strong candidate for `FAQPage` schema and can capture featured-snippet search real estate for common category questions.

**Careers**
Purpose: attract design talent; secondary trust signal (a studio worth working *for* implies quality). Layout: short culture statement, open roles list (or "no open roles, but we always want to hear from great designers" state), team/studio-life imagery. Imagery: candid studio/team photography, distinct from client-facing portfolio tone. Animation: standard reveal only. CTA: apply link per role, or a general "introduce yourself" contact route if no roles are open. Desktop/Tablet/Mobile: standard single-column stack, roles list becomes an accordion if long. Accessibility: role listings are real structured content (heading + list), not image-based flyers. SEO: `JobPosting` schema per open role for job-board aggregator visibility.

**Thank You (post-submit)**
Purpose: confirm receipt, set expectations, reduce anxiety about what happens next. Layout: centered, calm, minimal — confirmation message, a clear "what happens next" 2–3 step expectation-setter (e.g., "We'll respond within 2 business days"), optional soft redirect to Portfolio or Journal for continued browsing. Imagery: optional single calm image. Animation: a single gentle confirmation fade-in; nothing celebratory/confetti (mismatched tone for this category). CTA: soft, optional (browse portfolio while you wait) — no hard sell. Desktop/Tablet/Mobile: centered single-column at every size. Accessibility: page title and h1 clearly state success ("Thank You — We've Received Your Enquiry") for screen reader users navigating post-submit. SEO: `noindex` this page (it shouldn't rank; it's a state, not content), but ensure the URL is stable for form-tool redirect configuration and analytics goal tracking.

**404**
Purpose: recover a lost visitor gracefully without breaking the premium tone. Layout: brand-consistent (not a generic error graphic), short human-toned message, search or clear links back to Homepage/Portfolio. Imagery: optional single quiet brand image. Animation: none needed. CTA: 2 links max (Homepage, Portfolio). Desktop/Tablet/Mobile: centered, single column at every size. Accessibility: correct `404` HTTP status code returned (not just a styled page at a 200 status) so it doesn't get indexed as real content. SEO: ensure real 404 status; add this page to internal redirect monitoring.

**Privacy Policy / Terms of Service**
Purpose: legal compliance, secondary trust signal. Layout: simple, readable single-column legal document layout, 720px max width, clear heading structure for scanability, table of contents/anchor links if long. Imagery: none. Animation: none. CTA: none needed. Desktop/Tablet/Mobile: identical single-column layout at every size — no special responsive handling needed beyond the standard container. Accessibility: strict semantic heading order, sufficient text contrast, no dense unbroken paragraphs. SEO: `noindex` is optional here (studios may want these indexed for compliance/trust reasons); ensure fast load since this is often checked as a trust signal before a sensitive form submission.

**Accessibility Statement**
Purpose: compliance + trust signal for an increasingly-relevant visitor concern. Layout: short, plain-language statement of commitment, contact route for accessibility issues. Same pattern as Privacy/Terms. SEO/Accessibility: identical treatment.

---

## PHASE 6 — Premium UI Details

- **Glassmorphism:** No. Frosted-glass panels read as tech/SaaS, not editorial/material. The one acceptable use is a subtle blur on the nav bar once it solidifies on scroll — that's functional, not decorative glassmorphism.
- **Gradients:** No decorative gradients. The one acceptable use is a very subtle dark-to-transparent overlay gradient at the bottom of hero images to ensure text legibility over photography — functional, invisible as "a gradient," not a visible brand device.
- **Luxury vs. Minimal:** Minimal-luxury ("quiet luxury"), not maximalist-luxury. Confidence is communicated through restraint, whitespace, and material-grounded color rather than ornamentation, gold-foil textures, or dense pattern. (The Oxblood/editorial accent theme is the one permitted lever toward a more maximalist client who explicitly wants that — see 3.2.)
- **Photography style:** Natural light, minimal staging, slightly warm color grade, consistent crop/aspect logic across the whole site. Wide establishing shots paired with detail/material macro shots in every gallery — variety of scale keeps long scrolls interesting.
- **Illustration style:** Avoid illustration almost entirely — photography carries the brand. If any is needed (e.g., a simple floor-plan diagram on a case study), keep it as thin single-weight line art matching the icon system, never a full illustrated scene.
- **Icon style:** See 3.7 — thin line, functional only.
- **Button style:** See 3.8 — quiet solid/outline/text, sentence case, no shadow-pop or bounce.
- **Hover animations:** Image scale (4–6%), underline draws, fill/opacity shifts. Nothing that moves an element's position abruptly (no "lift and shadow" card hover — too SaaS-coded for this category).
- **Scroll animations:** Fade + 24px rise on section entry; mask-reveal wipes for hero and gallery images; parallax kept subtle (10–15% max offset) so it reads as depth, not gimmick.
- **Micro-interactions:** Cursor-follow portfolio preview, before/after slider, multi-step form transitions, accordion expand/collapse, filter re-flow stagger.
- **Loading states:** Skeleton screens using the neutral palette (soft shimmer over `--canvas-deep` blocks matching final content shape) — never a generic spinner, which breaks the material feeling. Images use a blurred low-res placeholder (LQIP) that resolves to full quality.
- **Empty states:** Framed as an invitation, matching the site's calm voice — e.g., an empty filtered-portfolio result reads "No projects match yet — try a different filter" plus a one-tap "Clear filters" action, not a bare "No results found."

---

## PHASE 7 — Performance, Accessibility & SEO Strategy

**Image optimization:** WebP/AVIF with JPEG fallback, responsive `srcset`/`sizes` for every image (this site is image-heaviest of nearly any template category, so this single decision has the largest performance impact), consistent pre-defined aspect ratios to prevent layout shift, CDN-served with automatic compression.

**Lazy loading:** Native `loading="lazy"` for all below-the-fold images; hero and above-the-fold LCP image loads eagerly with `fetchpriority="high"`; portfolio grids paginate/load-more rather than loading the entire catalog at once.

**Accessibility:** WCAG 2.2 AA as the floor. Minimum 4.5:1 text contrast (verify the neutral palette pairings, especially `--ink-soft` on `--canvas`), full keyboard operability for all custom interactions (before/after slider, filters, accordions, multi-step form, mobile menu), visible focus states using the accent color as an outline (never `outline: none` without a replacement), `prefers-reduced-motion` respected across every animated pattern in Phase 6, alt text written for every meaningful image (not just filenames), correct landmark/heading structure site-wide.

**SEO:** Unique, hand-written title/meta description per page (never templated duplicates, especially across Service Detail and Project Detail pages), structured data per page type (`Organization`, `LocalBusiness`, `Service`, `CreativeWork`/`ImageObject`, `Article`, `FAQPage`, `JobPosting`, `Person` as covered per-page above), clean semantic URL structure (`/portfolio/project-name`, `/services/service-name`), XML sitemap, and an internal linking strategy that routes Journal content back to relevant Service and Project pages.

**Core Web Vitals targets:** LCP < 2.5s (biggest lever: hero image optimization + eager/priority loading), INP < 200ms (keep scroll-triggered animation logic lightweight, avoid layout-thrashing JS), CLS < 0.1 (reserve space for every image/video via aspect-ratio boxes before load).

**Semantic HTML:** Real `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` landmarks; heading hierarchy never skips a level; forms use real `<label>`/`<fieldset>` structures rather than div-based fake inputs.

**Responsive strategy:** Mobile-first CSS with breakpoints at ~480px / 768px / 1024px / 1440px; content and hierarchy are re-composed per breakpoint (per Phase 5's Desktop/Tablet/Mobile notes) rather than just scaled down uniformly.

**Dark mode strategy:** Not a primary requirement for this category (portfolio photography needs a bright, neutral stage to read accurately) — but the `--ink` background is already used intentionally for select sections (hero overlays, closing CTA, testimonial spotlight), so a full dark theme is achievable later by inverting the neutral token pairs if a client specifically requests it. Not recommended as a user-toggleable feature for a photography-first site.

---

## PHASE 8 — Component Library

Every component below is theme-aware (reads from the swappable accent tokens in Phase 3) and responsive by default.

| Component | Anatomy | Key Variants | States |
|---|---|---|---|
| **Navbar** | Logo, 4–6 links, primary CTA button | Transparent-on-hero / Solid-on-scroll | Default, scrolled, mobile-open |
| **Mega Menu (light version)** | Simple dropdown, service list + one supporting image | Services dropdown only (this category rarely needs a true mega menu) | Default, open, hover |
| **Hero** | Full-bleed media, headline, subcopy, CTA | Full-bleed / Split / Editorial-oversized-type | Static, video-loop, image-carousel (use sparingly) |
| **Buttons** | See 3.8 | Primary / Secondary / Tertiary / Ghost | Default, hover, focus, disabled, loading |
| **Feature/Service Card** | Image, title, one-line description, link | Grid card / Full-width row | Default, hover |
| **Stats Block** | Large numeral + label | Only used where numbers are real and earned (years in business, projects completed) | Static, count-up on scroll-into-view (subtle, once) |
| **Testimonial** | Large quote, attribution, optional project link | Single spotlight / Slow auto-advance carousel | Default, paused-on-hover, keyboard-navigable |
| **Timeline/Process Stepper** | Numbered steps, description, image | Horizontal (desktop) / Vertical (mobile) | Default, active-step-highlight on scroll |
| **Gallery / Masonry Grid** | Image grid with filter bar | Portfolio index / In-article gallery | Default, filtered, loading, empty |
| **Before/After Slider** | Two stacked images, drag handle | Drag / Click-to-toggle (mobile fallback) | Default, dragging, keyboard-focused |
| **Lightbox** | Full-screen image viewer | Single image / Gallery sequence with next/prev | Open, closing, loading |
| **Pricing/Investment Tier** | Tier name, qualitative range, inclusion list, CTA | Column layout / Accordion (mobile) | Default, hover, selected (if interactive) |
| **FAQ Accordion** | Question row, expandable answer | Grouped-by-topic / Flat list | Collapsed, expanded, focused |
| **CTA Banner** | Headline, one CTA, on `--ink` or full-bleed image background | Mid-page / Closing / Sticky mobile bar | Default, sticky-appeared |
| **Newsletter Signup** | Short label, email input, submit | Footer-embedded / Standalone | Default, submitting, success, error |
| **Footer** | Sitemap columns, contact/address, social, newsletter, closing brand mark | Full / Condensed (legal pages) | Default |
| **Multi-Step Form** | Progress indicator, step fields, back/next | Contact enquiry (3-step) | Step 1/2/3, submitting, success, error |
| **Modal** | Overlay, close control, content slot | Confirmation / Filter (mobile bottom-sheet) | Opening, open, closing |
| **Breadcrumbs** | Text trail with separators | Service Detail / Project Detail / Blog Article | Default (no hover state needed beyond link underline) |
| **Data Table** | Used sparingly (e.g., material specs on a case study) | Simple bordered rows | Default, hover-row-highlight |
| **Tabs** | Horizontal label row + content panel | Service Detail inclusions ("What's Included" / "Timeline" / "FAQ") | Default, active, focused |
| **Team Card** | Portrait, name, role, hover bio reveal | Grid card | Default, hover/focus-reveal |
| **Blog/Journal Card** | Image, category label, title, date | Index grid card | Default, hover |
| **Filter Bar** | Chip or dropdown filters | Horizontal chips (desktop) / Bottom-sheet (mobile) | Default, active-filter-highlight |
| **Skeleton Loader** | Shape-matched shimmer blocks | Per-component (card, gallery, form) | Loading only |
| **404/Empty State** | Icon-free message + 1–2 recovery links | Page-level / In-component (empty filter result) | Static |

---

## PHASE 9 — Implementation Roadmap (for Antigravity)

Antigravity works best when given self-contained, verifiable tasks it can execute and check via its browser-in-the-loop workflow (build → run → screenshot → verify against a stated acceptance criterion). Each phase below is scoped to be independently buildable and independently verifiable — hand these to the agent one at a time, in order, reviewing the artifact/screenshot output at the end of each before starting the next.

**Phase 0 — Foundation**
Build: design tokens file (colors incl. all 4 accent themes, type scale, spacing scale, radius moods, shadow scale) as CSS custom properties or a Tailwind config; base typography setup (Fraunces + General Sans loaded, fallback stack); global reset/base styles.
Acceptance criteria: a token-preview page renders every color swatch, type scale step, spacing unit, and radius mood correctly labeled. No page content yet.

**Phase 1 — Layout Shell**
Build: Navbar (transparent→solid-on-scroll behavior), mobile menu takeover, Footer (full version).
Acceptance criteria: shell renders correctly at 375px/768px/1440px; nav transitions on scroll; mobile menu opens/closes and traps focus correctly.

**Phase 2 — Homepage Hero + Core Sections**
Build: Hero (full-bleed variant), portfolio teaser grid, philosophy split section, CTA banner.
Acceptance criteria: hero LCP image loads with priority; sections match the Phase 3/5 spacing and grid rules; responsive behavior matches Phase 5.1 tablet/mobile notes.

**Phase 3 — Homepage Remaining Sections**
Build: Process-preview strip, press logo strip, testimonial spotlight, closing CTA on `--ink` background.
Acceptance criteria: full homepage scroll matches the section-alternation rhythm (canvas/canvas-deep/full-bleed/ink) defined in 3.14.

**Phase 4 — Services Hub + Service Detail Template**
Build: Services index (alternating row layout), Service Detail template (hero, inclusions, mini-process, filtered-portfolio embed, service-specific FAQ, CTA).
Acceptance criteria: Service Detail template renders correctly with placeholder content for at least 3 different services; FAQ accordion is keyboard-operable.

**Phase 5 — Portfolio Index + Filter Bar**
Build: Masonry/grid portfolio index, filter bar (chips desktop / bottom-sheet mobile), cursor-follow hover preview (desktop only).
Acceptance criteria: filtering re-flows the grid correctly and updates an `aria-live` result count; empty-filter state renders correctly; mobile filter bottom-sheet opens/closes correctly.

**Phase 6 — Project / Case Study Detail Template**
Build: hero, meta data strip, narrative sections, **before/after slider component**, full gallery, project testimonial, related-projects strip.
Acceptance criteria: before/after slider is operable via drag, click, and keyboard arrows, and announces state changes to screen readers; gallery images lazy-load correctly below the fold.

**Phase 7 — About, Process, Team, Press Pages**
Build: all four pages per Phase 5 breakdowns.
Acceptance criteria: each renders correctly at all three breakpoints; Team page portrait-hover-reveal works via both hover and keyboard focus.

**Phase 8 — Contact + Multi-Step Form**
Build: Contact page layout, multi-step enquiry form component, Thank You page.
Acceptance criteria: form advances through steps with correct validation at each step, announces step changes via `aria-live`, successfully redirects to a working Thank You page on submit; all fields keyboard-accessible with visible labels.

**Phase 9 — Testimonials, Pricing, FAQ Pages**
Build: standalone Testimonials page (if used), Pricing/Investment page, sitewide FAQ page.
Acceptance criteria: testimonial carousel (if used) is pausable and keyboard-navigable; pricing tier accordion works correctly on mobile; FAQ accordion matches the Service Detail FAQ pattern for consistency.

**Phase 10 — Journal / Blog (Index + Article Template)**
Build: blog index grid, article template with 720px reading column.
Acceptance criteria: article template renders correctly with real heading hierarchy; index grid reflows 3→2→1 columns across breakpoints.

**Phase 11 — Utility Pages**
Build: Careers, 404, Privacy Policy, Terms of Service, Accessibility Statement.
Acceptance criteria: 404 page returns a true 404 HTTP status; legal pages render with correct heading structure and 720px reading width.

**Phase 12 — Component Consolidation Pass**
Build: audit every component built in Phases 1–11 against the Phase 8 component library table; fix any inconsistency in variant/state coverage (hover, focus, disabled, loading, empty).
Acceptance criteria: a single component-showcase page demonstrates every component from Phase 8 in all its documented states — this becomes the living style guide for future client rebuilds.

**Phase 13 — Accessibility Pass**
Build: run automated audit (axe or equivalent) across every page; manually verify keyboard-only navigation through the entire primary conversion path (Home → Portfolio → Project → Contact → Thank You); verify `prefers-reduced-motion` is respected across every animated component from Phase 6.
Acceptance criteria: zero critical/serious automated violations; full keyboard traversal of the conversion path confirmed via screenshot/recording.

**Phase 14 — Performance Pass**
Build: verify responsive image pipeline (srcset/sizes, WebP/AVIF, lazy-loading) is applied consistently; verify aspect-ratio boxes prevent layout shift; run Lighthouse/PageSpeed against Phase 7 Core Web Vitals targets.
Acceptance criteria: LCP < 2.5s, INP < 200ms, CLS < 0.1 on Homepage, Portfolio Index, and Project Detail (the three heaviest pages).

**Phase 15 — SEO Pass**
Build: unique title/meta per page, structured data per page type (per Phase 7), XML sitemap, semantic URL structure verification.
Acceptance criteria: every indexable page has a unique title/description (automated duplicate check); structured data validates with no errors; Thank You page confirmed `noindex`.

**Phase 16 — Client Theming Pass (Reusability Validation)**
Build: swap the full site from the Verdigris flagship theme to a second accent theme (e.g., Roman Clay) using only token changes — no component code edits.
Acceptance criteria: a full re-theme is achievable by changing only the token file and photography set; this validates the template's core reusability promise from the top of this document.

**Phase 17 — QA & Launch Prep**
Build: cross-browser check (Chrome, Safari, Firefox, mobile Safari/Chrome), broken-link audit, form submission end-to-end test (including error states), analytics/goal tracking setup on Thank You page.
Acceptance criteria: clean pass across all listed browsers/devices; test form submission successfully triggers both the studio notification and the Thank You redirect.

**Phase 18 — Launch**
Build: final content swap-in (real photography, real copy replacing placeholders), DNS/hosting cutover, post-launch monitoring setup (Core Web Vitals field data, 404 monitoring).
Acceptance criteria: live site matches staging QA state exactly; monitoring dashboards confirmed receiving data within 24 hours of launch.
