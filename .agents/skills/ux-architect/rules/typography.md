---
title: Typography Rules
description: Enforce readable, scannable, accessible typography in UI implementations using Tailwind CSS, Raw CSS, and semantic HTML.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [typography, readability, alignment, line-length, line-height, numerals, hierarchy]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Typography and Text Hierarchy

> **Scope:** Apply these rules to typography, body text, UI copy, components, and all content formats across the system.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## TYPO-01 — Avoid Center-Aligning Long-Form Copy

**Principle:** Start-aligned text establishes a consistent visual anchor for the left margin (in LTR scripts), making scanning and reading markedly faster than centered lines.

### Requirements

- **SHOULD** align long text blocks, body paragraphs, multi-line descriptions, field labels, and detailed content to the starting reading edge (`left` in LTR, `start` directionally).
- **MAY** center-align only short headings, one-to-two-line notifications, or focal hero banners.
- **MUST NOT** center-align multi-line body paragraphs solely for decorative symmetry.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Logical start alignment | `text-start` or `text-left` |
| **Raw CSS** | Direction-aware alignment | `text-align: start;` |

**Verification:** Every line across multi-line paragraphs begins cleanly along one consistent starting axis.

---

## TYPO-02 — Avoid Full Justification (`justify`) for Body Copy

**Principle:** Forcing text flush against both edges simultaneously introduces uneven gaps between words that disrupt natural reading rhythm.

### Requirements

- **MUST NOT** apply full text justification (`text-justify`) as a default for general web copy.
- **SHOULD** use left or logical start alignment by default.
- **Exception:** Full justification is permitted only in specialized editorial layouts with strict design specs where word spacing and hyphenation have been carefully tuned and reviewed.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Avoid `text-justify` | Use `text-start` instead |
| **Raw CSS** | Avoid `text-align: justify;` | Use `text-align: start;` instead |

**Verification:** Word spacing stays even and predictable from start to end of every line.

---

## TYPO-03 — Prevent Visual "Rivers" of Whitespace in Paragraphs

**Principle:** Vertical or diagonal channels of whitespace formed when inter-word gaps align across consecutive lines distract readers and break visual cohesion.

### Requirements

- **MUST** eliminate full justification first whenever uneven gaps appear.
- **SHOULD** tune container line measure and word-wrapping balance.
- **MAY** enable automatic hyphenation for supported languages.
- **Script & Non-Space-Delimited Language Note:** For Thai and other scripts without inter-word spaces, verify dictionary-based/locale-aware line breaking (`lang` attribute) rather than relying on English hyphenation assumptions.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Language-aware hyphenation | Set explicit `lang` attribute paired with `text-start hyphens-auto` |
| **Raw CSS** | Hyphenation property | `text-align: start; hyphens: auto;` paired with accurate HTML `lang` attributes |

**Verification:** Paragraphs read smoothly with no jagged vertical whitespace channels cutting through text blocks.

---

## TYPO-04 — Control Line Length for Comfortable Reading

**Principle:** Overly wide lines exhaust eyes returning to the next row, while overly narrow lines chop rhythm with constant line breaks.

### Requirements

- **SHOULD** target a comfortable measure of `50` to `75` characters per line for Latin scripts as a baseline.
- **MUST NOT** let long body paragraphs stretch edge-to-edge across wide desktop monitors.
- **Script & Tall/Narrow Glyph Note:** Because `ch` measures the width of the Latin `0` glyph, visually verify rendered paragraph widths for Thai or CJK scripts and cap container width appropriately so lines never span full wide screens.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Constrain paragraph measure | `max-w-[70ch]` or `max-w-prose` |
| **Raw CSS** | Set explicit max-width | `max-width: 70ch; width: 100%;` |

**Verification:** Body prose never stretches unbounded across ultra-wide viewports.

---

## TYPO-05 — Smooth Out Harsh Ragged Line Endings

**Principle:** Severely uneven trailing line edges cause jerky eye transitions during scanning.

### Requirements

- **SHOULD** leverage modern CSS text-wrapping controls to balance line lengths naturally.
- **MUST** treat proper container width sizing as the primary control, using text wrapping utilities as progressive enhancement.
- **MUST NOT** apply expensive `balance` wrapping blindly across lengthy long-form articles; reserve `balance` for short headings and concise callouts.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Balance headings, refine body copy | Headings: `text-balance`; Paragraphs: `text-pretty` |
| **Raw CSS** | Text-wrap properties | Headings: `text-wrap: balance;`; Paragraphs: `text-wrap: pretty;` |

**Verification:** Headings avoid lonely single-word orphan lines and paragraph endings break naturally.

---

## TYPO-06 — Tune Line Height Proportionally to Text Role

**Principle:** Leading must stay proportional to font size and line width so eyes distinguish adjacent rows effortlessly without colliding accents or descenders.

### Requirements

- **MUST** scale unitless line height appropriately to typography size and role.
- **MUST NOT** hardcode one fixed pixel `line-height` across disparate text sizes.
- **Diacritic & Tall Script Note:** Scripts with stacked tone marks and above/below vowels (such as Thai or Vietnamese) require slightly taller line-height ratios than plain Latin copy so diacritics never touch across lines.

### Recommended Baseline Ratios

| Text Role | Recommended Unitless Line-Height Range |
| :--- | :--- |
| **Large multi-line headings** | `1.1` to `1.25` |
| **Standard body copy** | `1.5` to `1.65` (stacked-diacritic scripts like Thai often require at least `1.6`) |
| **Wide line measures** | `1.65` to `1.8` |
| **Extra-small captions & metadata** | Slightly taller ratio relative to body text |

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Role-appropriate leading utilities | Headings: `leading-tight`; Body prose: `leading-relaxed` |
| **Raw CSS** | Unitless line-height ratio | `line-height: 1.6;` |

**Verification:** Stacked marks, ascenders, and descenders never collide between rows, and text reads comfortably.

---

## TYPO-07 — Build Clear Scannable Typographic Hierarchy

**Principle:** Users scan digital screens for landmarks before reading detail; clear typographic hierarchy minimizes search time.

### Requirements

- **MUST** use semantic heading and prose elements in order (`<h1>`–`<h6>`, `<p>`, `<ul>`).
- **SHOULD** differentiate primary headings, subheadings, body copy, and secondary metadata using combined size, weight, color, and spacing.
- **MUST NOT** fake headings with styled bold `<div>` elements without proper semantic tags.
- **MUST NOT** rely on color differences alone to communicate heading importance.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Size + weight + contrast hierarchy | Title: `text-2xl font-bold text-foreground`; Body: `text-base text-foreground/80`; Secondary: `text-sm text-muted-foreground` |
| **Raw CSS** | Role-specific CSS rules | Set distinct `font-size`, `font-weight`, `line-height`, and `color` per hierarchy tier |

**Verification:** Readers distinguish top-level titles, section subheadings, and secondary details immediately at first glance.

---

## TYPO-08 — Keep Headings Closer to Their Own Content

**Principle:** Every heading should visually lock onto the section it introduces; space above a heading must exceed the gap below it.

### Requirements

- **MUST** place headings closer to the content following them than to content belonging to the preceding section.
- **MUST NOT** apply symmetric top and bottom margins around headings when it obscures which block the heading owns.
- **SHOULD** account for parent stack/grid `gap` spacing so margins do not compound unpredictably.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Larger top margin than bottom margin | `mt-10 mb-2` or matching project spacing tokens |
| **Raw CSS** | Logical block margins | `margin-block-start: 2.5rem; margin-block-end: 0.5rem;` |

**Verification:** Eyes naturally attach every heading to the paragraphs or items directly beneath it.

---

## TYPO-09 — Use Soft, Eye-Friendly Contrast Colors

**Principle:** Pure `#000000` black on `#FFFFFF` white (or vice versa) can feel overly harsh and induce visual glare; soft near-black and near-white neutral inks stay comfortable while preserving crisp legibility.

### Requirements

- **SHOULD** use rich near-black charcoal on light surfaces and soft near-white off-white tones on dark surfaces.
- **MUST** always meet WCAG accessibility contrast minimums across foreground and background pairs.
- **MUST NOT** fade body or secondary ink so faint that readability suffers in the name of minimalism.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Neutral slate/zinc ink scale | Body: `text-foreground`; Secondary: `text-muted-foreground` |
| **Raw CSS** | Calibrated neutral colors | Body: `color: #1e293b;`; Secondary: `color: #475569;` |

**Verification:** Text reads smoothly without harsh contrast glare and maintains at least `4.5:1` contrast.

---

## TYPO-10 — Offset Link Underlines Cleanly from Descenders

**Principle:** Inline text links need unmistakable interactive cues, yet underlines slicing across letter descenders or lower diacritics degrade legibility.

### Requirements

- **MUST** render unmistakable link affordances — underlining remains the safest standard cue inside body paragraphs.
- **SHOULD** offset underlines slightly below character baselines and keep stroke thickness balanced.
- **MUST** display sharp visible keyboard focus outlines when tabbing to links.
- **MUST NOT** rely on color alone to distinguish inline links inside paragraphs.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Offset underline + focus ring | `underline underline-offset-4 decoration-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` |
| **Raw CSS** | Baseline underline offset | `text-decoration-line: underline; text-underline-offset: 0.2em;` |

**Verification:** Underlines clear lower vowel marks and Latin descenders (`g`, `y`, `p`, `q`) cleanly without obscuring characters.

---

## TYPO-11 — Restrain Text Emphasis to What Truly Matters

**Principle:** When everything shouts for attention, nothing stands out; use text emphasis sparingly and purposefully.

### Requirements

- **SHOULD** emphasize words using at most one or two restrained mechanisms, such as semibold weight or subtle tonal shift.
- **AVOID** piling bold, italics, uppercase, bright color, underline, and background highlight onto one span simultaneously.
- **MUST NOT** sprinkle emphasis across too many fragments in a paragraph, turning copy noisy.
- **MUST** use semantic `<strong>` or `<em>` tags when conveying genuine structural emphasis.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Measured weight emphasis | `font-semibold text-foreground` |
| **Raw CSS** | Semantic tag + calibrated weight | `strong { font-weight: 600; color: #0f172a; }` |

**Verification:** Key phrases catch the eye cleanly without fatiguing paragraph scanning.

---

## TYPO-12 — Match Numeral Style to Context (`tabular-nums` vs `proportional-nums`)

**Principle:** Tabular figures keep columns aligned and stop live-updating counters from jittering horizontally, whereas proportional figures harmonize naturally inside prose.

### Requirements

- **SHOULD** apply tabular numerals for tables, metric dashboards, pricing columns, invoices, and live countdowns.
- **SHOULD** apply proportional numerals inside regular prose paragraphs.
- **MUST NOT** assume every font family ships OpenType tabular/lining figures — test rendered glyphs directly.

### Numeric Variant Reference

| Context | Tailwind CSS | Raw CSS |
| :--- | :--- | :--- |
| **Tables, prices, dashboards, timers** | `tabular-nums lining-nums` | `font-variant-numeric: tabular-nums lining-nums;` |
| **Body prose paragraphs** | `proportional-nums lining-nums` | `font-variant-numeric: proportional-nums lining-nums;` |

**Verification:** Columns of prices and numbers align vertically by digit, and updating counters never bounce in width.

---

## Complete Reference Implementation Examples

### Tailwind CSS Example

```html
<article class="mx-auto w-full max-w-prose px-6 text-start text-base leading-relaxed text-foreground">
  <h1 class="text-3xl font-bold text-foreground leading-tight">
    Structuring Content for Effortless Reading
  </h1>
  <p class="mt-4 text-pretty">
    Thoughtful typographic hierarchy helps readers scan key milestones and digest details naturally.
    <a href="/guides" class="underline underline-offset-4 decoration-1 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      Read the complete guide
    </a>
  </p>
  <h2 class="mt-8 mb-2 text-xl font-semibold text-foreground leading-snug">
    Usage Metrics
  </h2>
  <p class="text-sm text-muted-foreground">
    Records updated:
    <span class="font-semibold text-foreground tabular-nums">12,450</span> items
  </p>
</article>
```

### Raw CSS Example

```css
.article-content {
  width: 100%;
  max-width: 70ch;
  margin-inline: auto;
  padding-inline: 1.5rem;
  text-align: start;
  font-size: 1rem;
  line-height: 1.65;
  color: #1e293b;
}

.article-content h1 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #0f172a;
}

.article-content h2 {
  margin-block-start: 2rem;
  margin-block-end: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  color: #0f172a;
}

.article-content a {
  text-decoration: underline;
  text-underline-offset: 0.2em;
  color: inherit;
}

.article-content a:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.article-content .numeric-value {
  font-variant-numeric: tabular-nums lining-nums;
  font-weight: 600;
}
```

---

## Pre-Delivery Checklist

- [ ] **TYPO-01:** Multi-line paragraphs remain start-aligned with zero decorative centering.
- [ ] **TYPO-02:** Full justification (`text-justify`) is avoided on general web prose.
- [ ] **TYPO-03:** Paragraphs show even spacing with zero whitespace rivers, respecting locale line breaking.
- [ ] **TYPO-04:** Line lengths remain bounded comfortably rather than spanning full wide displays.
- [ ] **TYPO-05:** Heading wrapping avoids lonely single-word orphans and trailing edges look balanced.
- [ ] **TYPO-06:** Line-height matches text role cleanly without colliding diacritics or descenders.
- [ ] **TYPO-07:** Heading levels and prose structure use accurate semantic tags and clear visual contrast.
- [ ] **TYPO-08:** Headings sit visibly closer to their own section content than preceding sections.
- [ ] **TYPO-09:** Text colors stay comfortable on the eyes while passing WCAG `4.5:1` contrast.
- [ ] **TYPO-10:** Inline link underlines clear descenders cleanly and display strong focus outlines.
- [ ] **TYPO-11:** Text emphasis is restrained to key terms using semantic markup.
- [ ] **TYPO-12:** Tabular numerals align vertically inside tables, pricing, and live counters.
