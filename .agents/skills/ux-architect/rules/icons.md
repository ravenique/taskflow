---
title: Icons UX Rules
description: Enforce icon clarity, optical balance, visual consistency, and accessibility in UI implementations using Tailwind CSS, Raw CSS, and SVG.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [icons, optical-balance, svg, visual-weight, containers, metaphors, accessibility]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Icon Usage and Alignment

> **Scope:** Apply these rules to icons across navigation systems, toolbars, buttons, menus, lists, status indicators, and alert messages.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## ICON-01 — Optical Balance of Icons

**Principle:** Geometric centering inside a bounding box can make asymmetric icon shapes look off-center; adjust placement according to visual center of gravity.

### Requirements

- **MUST** center the button or icon container using standard layout rules first, such as CSS Grid or Flexbox centering.
- **SHOULD** visually inspect whether the icon actually appears centered inside its frame, especially for triangles or asymmetric glyphs.
- **MAY** apply a subtle 1–2 px optical offset strictly to the inner glyph to achieve balance without shifting the interactive touch target.
- **MUST NOT** apply blanket optical offsets to every icon in the system regardless of shape.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Centered container with targeted optical offset | Button container: `grid size-12 place-items-center rounded-full bg-primary text-primary-foreground`; Icon: `translate-x-0.5` |
| **Raw CSS** | Grid centering with transform | `display: grid; place-items: center;` and icon uses `transform: translateX(1px);` |

**Verification:** Asymmetric icons (such as a video play triangle) appear naturally centered inside circular or square containers.

---

## ICON-02 — Visual Weight of Icons

**Principle:** Solid filled icons can appear heavy and overpower adjacent text; tune icon visual weight to harmonize with accompanying labels.

### Requirements

- **SHOULD** prevent accompanying icons from stealing attention from primary text, especially inside menu lists.
- **SHOULD** adjust icon color contrast first before shrinking icon dimensions.
- **MUST** preserve unmistakable visibility for icons conveying critical state — such as errors, warnings, or active selection.
- **MUST NOT** wash icons out so faintly that they blend into the background.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Muted icon supporting primary label | Icon: `size-5 text-muted-foreground`; Label: `text-sm font-medium text-foreground` |
| **Raw CSS** | Semantic color separation | Icon uses medium neutral such as `#64748b`, while label text uses high-contrast dark ink such as `#0f172a` |

**Verification:** Scanning a menu row shows text labels leading visual attention while icons quietly clarify meaning.

---

## ICON-03 — Place Icons Inside Fixed-Size Containers for Alignment

**Principle:** Placing icons inside uniform fixed-dimension containers eliminates alignment jitter caused by varying intrinsic icon widths, keeping vertical lists crisp.

### Requirements

- **SHOULD** assign a uniform container box for icons in vertically aligned lists such as menus or feature cards.
- **MUST** center each glyph within its container using consistent alignment rules.
- **SHOULD** ensure accompanying labels start on the exact same vertical column edge across all rows even when individual glyph bounds vary slightly.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Fixed-size icon box | Icon container: `grid size-10 place-items-center rounded-lg bg-muted text-foreground` |
| **Raw CSS** | Fixed container dimensions | `width: 2.5rem; height: 2.5rem; display: grid; place-items: center;` |

**Verification:** Label text across every row begins cleanly along one consistent vertical axis.

---

## ICON-04 — Consistent Stroke Style and Icon Sizing

**Principle:** An icon set should share a unified visual style — such as uniform stroke weight or consistent solid fill — without clashing styles on the same screen.

### Requirements

- **MUST** use an icon set with cohesive styling throughout the interface (either consistent outlined stroke or solid style).
- **SHOULD** maintain consistent stroke width across outlined icons.
- **MUST NOT** mix conflicting icon styles arbitrarily within the same screen without clear functional reason.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Unified size and stroke width | Consistently apply `size-5 stroke-[1.75]` across UI controls |
| **SVG Properties** | Shared root attributes | `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"` |

**Verification:** Every icon across the screen visibly belongs to the same coherent visual family.

---

## ICON-05 — Choose Semantically Familiar Icon Metaphors

**Principle:** Icons should clearly represent the actual action users expect based on established conventions, preventing guesswork or misinterpretation.

### Requirements

- **MUST** select widely recognized, conventional symbols that match user expectations.
- **MUST NOT** invent novel or abstract metaphors for common actions that force users to guess functionality.
- **SHOULD** omit icons from long menus rather than inserting confusing or forced metaphors when clear icons do not exist for every item.

### Standard Metaphor Reference

| Action | Standard Symbol |
| :--- | :--- |
| **Search** | Magnifying glass |
| **Settings** | Gear / cog |
| **Delete** | Trash can |
| **Edit** | Pencil |

**Verification:** Everyday users correctly predict each icon's function without needing lengthy prose instructions.

---

## ICON-06 — Pair Icons with Visible Text Labels

**Principle:** Standalone icons can carry ambiguous meaning; visible text labels eliminate confusion and maximize recognition speed.

### Requirements

- **SHOULD** display visible text alongside icons whenever practical, especially for important or infrequent actions.
- **MUST** provide a descriptive accessible name via `aria-label` whenever an icon-only button is unavoidable.
- **MUST** support full keyboard operability and show clear focus indicators on standalone icon buttons.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Icon paired with label | `<button class="inline-flex items-center gap-2 px-3 py-2"><svg ...><span class="text-sm">Export file</span></button>` |
| **Icon-Only Button** | Explicit accessible name | `<button type="button" aria-label="Search records" class="size-10 grid place-items-center">...</button>` |

**Verification:** Standalone icon buttons expose accurate names to screen readers, and users identify every icon control immediately.

---

## ICON-07 — Status Icons Must Include Descriptive Text

**Principle:** Never communicate success, warning, or error status using an icon or color alone; always accompany status indicators with clear explanatory text.

### Requirements

- **MUST** pair status icons with visible descriptive text to support users with color-vision deficiencies.
- **MUST** hide decorative or redundant status icons from screen readers using `aria-hidden="true"` when descriptive text is present so assistive technology does not announce duplicates.
- **MUST** programmatically associate status messages with the relevant input field or UI region.

### Implementation Guidance

```html
<!-- Error alert message paired with decorative icon -->
<div class="flex items-center gap-2 text-destructive text-sm mt-1" role="alert">
  <svg aria-hidden="true" class="size-4 shrink-0 fill-current">...</svg>
  <span>Password must be at least 8 characters.</span>
</div>
```

**Verification:** Even with color or icons hidden, the status message conveys the complete meaning unambiguously.

---

## ICON-08 — Interactive Hit Area and States for Icon Buttons

**Principle:** Icon buttons need touch targets large enough for comfortable finger selection and clear hover and keyboard focus feedback.

### Requirements

- **MUST** ensure touch-target area of at least `44 x 44 px` on touch interfaces even when the visible glyph inside measures only `20 px`.
- **MUST** render hover and keyboard focus indicators covering the entire interactive button surface.
- **MUST** reflect active toggle state programmatically using `aria-pressed` on toggle icon buttons.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Standard hit area with states | `size-11 grid place-items-center rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` |
| **Raw CSS** | Minimum touch target | `min-width: 44px; min-height: 44px; display: grid; place-items: center; border-radius: 0.5rem;` |

**Verification:** Icon buttons tap reliably on touch screens and display unmistakable focus outlines during keyboard navigation.

---

## Default Icon Size & Token Reference

| Role | Icon Dimensions | Tailwind CSS | Raw CSS |
| :--- | :--- | :--- | :--- |
| **Small inline helper icon** | `16 x 16 px` | `size-4` | `width: 16px; height: 16px;` |
| **Standard menu & button icon** | `20 x 20 px` | `size-5` | `width: 20px; height: 20px;` |
| **Large section heading icon** | `24 x 24 px` | `size-6` | `width: 24px; height: 24px;` |
| **Standard icon box wrapper** | `40 x 40 px` | `grid size-10 place-items-center` | `width: 40px; height: 40px; display: grid;` |
| **Minimum touch button target** | `44 x 44 px` | `min-h-11 min-w-11` | `min-width: 44px; min-height: 44px;` |

---

## Pre-Delivery Checklist

- [ ] **ICON-01:** Asymmetric icons appear optically centered inside their frames.
- [ ] **ICON-02:** Icon visual weight supports labels without stealing focus from primary text.
- [ ] **ICON-03:** Vertically aligned list icons sit inside fixed-size containers.
- [ ] **ICON-04:** Stroke weights, dimensions, and visual styles remain uniform across the screen.
- [ ] **ICON-05:** Symbols match familiar user conventions and intended actions.
- [ ] **ICON-06:** Visible text labels appear alongside icons, or explicit `aria-label` names protect icon-only buttons.
- [ ] **ICON-07:** Status icons always accompany descriptive text and carry `aria-hidden="true"`.
- [ ] **ICON-08:** Icon buttons enforce at least a `44 x 44 px` touch target with clear focus states.
