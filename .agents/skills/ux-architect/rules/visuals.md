---
title: Visual Design Rules
description: Visual UI decisions, contrast requirements, image overlays, shadows, cards, and charts implementation using Tailwind CSS and Raw CSS.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [visuals, contrast, images, avatars, shadows, buttons, charts, cards]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Visual Design and Styling

> **Scope:** Apply these rules to color selection, contrast ratios, text over imagery, image framing, logo sets, cards, option tags, avatars, elevation shadows, dialog actions, and charts.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## VIS-01 — Text Color Contrast Ratios

**Principle:** Every tier of text — including secondary metadata, timestamps, usernames, and helper details — must remain easily legible against its background.

### Requirements

- **MUST** verify color contrast ratios for all text types, especially muted secondary text that is frequently over-dimmed.
- **MUST** meet WCAG minimum contrast ratios of at least `4.5:1` for normal text and `3:1` for large text.
- **SHOULD** evaluate font size and font weight alongside color values.
- **AVOID** placing light gray text on white backgrounds for information users need to read.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Contrast-compliant text tokens | Primary text: `text-foreground bg-background`; Secondary text: `text-muted-foreground` |
| **Raw CSS** | Explicit readable color pair | Primary text: `color: #0f172a;`; Secondary text: `color: #475569;` |

**Verification:** Check actual foreground and background pairs with a contrast analyzer and confirm clear legibility across display brightness levels.

---

## VIS-02 — Text Placed Over Images

**Principle:** Text layered over imagery must stay comfortably readable even when underlying images are bright, colorful, or user-uploaded.

### Requirements

- **MUST** test text legibility across bright, dark, and busy high-detail photographs.
- **SHOULD** apply dark scrim overlays, gradient backdrops, solid text containers, or text shadows to separate copy from the image.
- **MUST** evaluate contrast against the composited overlay plus photo rather than assuming readability from text color alone.
- **AVOID** placing light text directly on bright areas or dark text directly on dark areas without protective contrast treatment.

### Implementation Guidance

```html
<section class="relative isolate overflow-hidden rounded-xl">
  <img src="/cover.jpg" alt="" class="absolute inset-0 h-full w-full object-cover" />
  <!-- Dark scrim preserves text readability across varied imagery -->
  <div aria-hidden="true" class="absolute inset-0 bg-black/60"></div>
  <div class="relative z-10 p-8 text-white">
    <h2 class="text-2xl font-bold">Article headline</h2>
    <p class="mt-2 text-white/80">Clear, readable supporting description</p>
  </div>
</section>
```

**Verification:** Swapping background imagery with bright or high-contrast photos preserves effortless text legibility.

---

## VIS-03 — Never Obscure Key Image Subjects

**Principle:** Overlaying UI text or cropping controls must never cover essential photo subjects such as faces, key products, or primary focal points.

### Requirements

- **MUST** inspect the primary focal subject of imagery before choosing overlay coordinates or crop ratios.
- **SHOULD** place text inside calm negative space, or split image and copy into separate columns when safe overlay space does not exist.
- **SHOULD** set image focal positioning directly on the important subject instead of blindly defaulting to centered crops.
- **MUST** inspect image framing separately across mobile and desktop viewports.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Focal-point crop positioning | `object-cover object-[70%_50%] md:object-center` |
| **Raw CSS** | Object position rule | `object-fit: cover; object-position: 70% center;` |

**Verification:** Important subjects remain completely visible across every viewport width without text covering faces or key items.

---

## VIS-04 — Harmony and Visual Balance of Logo Grids

**Principle:** Customer or partner logo groups should feel visually balanced and cohesive without overpowering primary page messaging.

### Requirements

- **SHOULD** normalize heights while preserving aspect ratios across all logos.
- **SHOULD** render multi-brand logo groups in monochrome or grayscale when varied brand colors distract from main content, unless brand guidelines prohibit recoloring.
- **AVOID** forcing fixed widths and heights simultaneously in ways that stretch or distort logo proportions.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Height-normalized muted logos | `h-8 max-w-32 object-contain grayscale opacity-70` |
| **Raw CSS** | Aspect-safe fit and filter | `height: 2rem; max-width: 8rem; object-fit: contain; filter: grayscale(1); opacity: 0.7;` |

**Verification:** Every logo keeps natural proportions, looks uniform in visual weight, and stays subordinate to core headlines.

---

## VIS-05 — Prevent False Bottoms That Signal Page End

**Principle:** Prevent users from mistakenly assuming a page or scrollable list has ended when additional content still sits below the fold.

### Requirements

- **MUST** inspect potential visual cutoff traps — such as `100vh` hero banners, oversized whitespace gaps, or full-bleed horizontal dividers sitting near the fold.
- **SHOULD** allow a glimpse of the next section or partially visible next list item to peek into view as a scroll affordance.
- **AVOID** sizing above-the-fold sections strictly to `100%` viewport height with zero visual cue that scrollable content lies below.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Peek next list item inside scroll box | `max-h-64 overflow-y-auto pb-4` sized so the final visible row appears slightly clipped |
| **Raw CSS** | Scrollable container cue | `max-height: 16rem; overflow-y: auto;` framed so the trailing item hints at scroll continuation |

**Verification:** Viewing the screen across standard device sizes immediately reveals whether more content continues downward.

---

## VIS-06 — Subtle Separation of Cards from Background

**Principle:** Separate cards cleanly from the page surface without relying on heavy dark borders or harsh shadows that clutter the layout.

### Requirements

- **SHOULD** use a subtle tinted page background paired with clean card surfaces (or balanced surface elevation) to create effortless visual separation.
- **SHOULD** calibrate visual distinction smoothly between card containers and underlying canvas.
- **AVOID** heavy, thick high-contrast borders around every card that make interfaces look rigid and noisy.
- **AVOID** compensating for blending card backgrounds by adding dark, heavy drop shadows.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Layered surface + delicate shadow | Page canvas: `bg-background`; Card: `rounded-xl bg-card border border-border shadow-xs` |
| **Raw CSS** | Soft card contrast | `background: #fff; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);` |

**Verification:** Cards stand apart clearly from the background while preserving an airy, uncluttered aesthetic.

---

## VIS-07 — Distinguish Action Buttons from Selection Chips/Tags

**Principle:** Visually differentiate clickable command actions from toggleable filter tags or selection controls in both shape and interaction feedback.

### Requirements

- **MUST** create clear visual differentiation between action buttons and selectable tags/chips.
- **SHOULD** separate shapes distinctly — for example, rounded-rectangle action buttons versus pill-shaped filter tags.
- **MUST** make selected and unselected states of tags unmistakable without relying exclusively on color.
- **MUST** use accurate semantics: `<button>` for actions, and `<input type="checkbox">` or `<input type="radio">` (or proper ARIA roles) for option selection.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Action Button** | Standard rounded corner control | `rounded-lg px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90` |
| **Filter / Option Tag** | Pill shape with clear checked styling | `rounded-full px-3 py-1 text-sm border border-input peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary` |

**Verification:** Users immediately distinguish command buttons from filter/selection controls at a single glance.

---

## VIS-08 — User Avatar Ring Styling

**Principle:** Adding a thin light border ring around avatars cleanly separates portraits from varied backgrounds and adjacent faces in stacked avatar groups.

### Requirements

- **SHOULD** apply a thin subtle border ring around avatars whenever images stack together or sit over potentially matching backgrounds.
- **SHOULD** match ring color to the surrounding surface background (such as white or clean canvas background token).
- **MUST** preserve natural aspect ratios with `object-fit: cover` so faces never appear squashed or stretched.
- **AVOID** thick or overly bright decorative rings that pull undue visual attention.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Stacked avatar ring framing | Container: `flex items-center -space-x-2`; Avatar: `size-10 rounded-full object-cover ring-2 ring-background` |
| **Raw CSS** | Avatar styling | `width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover; border: 2px solid #fff;` |

**Verification:** Overlapping portraits remain cleanly separated and sharply distinguishable in dense avatar rows.

---

## VIS-09 — Soft, Layered Elevation Shadows

**Principle:** Elevation shadows communicate hierarchy and depth; effective shadows remain soft and subtle without making components look muddy or heavy.

### Requirements

- **SHOULD** apply a systematic, consistent elevation scale aligned with component hierarchy.
- **SHOULD** favor diffused, soft, low-opacity shadows.
- **AVOID** opaque black, sharp-edged, or heavy drop shadows that make components feel clunky.
- **AVOID** inventing arbitrary one-off shadow values outside the design token scale.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Standard shadow tokens | Subtle: `shadow-xs`; Medium: `shadow-md`; Floating overlay: `shadow-lg` |
| **Raw CSS** | Dual-layer soft shadow | `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);` |

**Verification:** Shadows appear natural and smooth, communicating depth cleanly without harsh visual clutter.

---

## VIS-10 — Highlight One Primary Action Per Dialog

**Principle:** Dialogs should showcase one clear primary call to action so users decide confidently without competing visual weight.

### Requirements

- **MUST** enforce exactly one visually prominent primary button inside confirmation dialogs.
- **MUST** style secondary actions (such as Cancel) with lower visual weight, such as an outlined or ghost/transparent variant.
- **MUST** pair destructive or irreversible actions with appropriate warning/destructive styling and unambiguous confirmation labels.
- **AVOID** rendering two equally saturated solid buttons side by side competing for attention.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Prominent primary, calm secondary | Primary: `bg-primary text-primary-foreground hover:bg-primary/90`; Secondary: `border border-border text-foreground bg-background hover:bg-muted` |
| **Raw CSS** | Hierarchy styling | Primary action uses solid high-contrast fill; secondary uses subtle outline/transparent surface |

**Verification:** Users distinguish the confirm action from cancel/dismiss options effortlessly at first glance.

---

## VIS-11 — Fit Chart Axis Scales to Data Intent

**Principle:** Vertical chart axis bounds should align honestly with dataset intent — avoiding excessive empty vertical space caused by arbitrary static ceilings without distorting values.

### Requirements

- **MUST** align chart axis scales with actual underlying values and analytical purpose before rendering.
- **SHOULD** tighten maximum axis ceilings appropriately near actual data peaks when visualizing trends so meaningful variations stay clearly readable.
- **MUST** retain `0–100%` bounds when charting percentage completion or proportional totals.
- **MUST** start bar charts measuring quantitative magnitudes at zero baseline so bar lengths accurately preserve proportional ratios.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Chart Layout** | Responsive aspect ratio | `w-full aspect-16/10 min-w-0` |
| **Axis Configuration** | Library scale options | Configure `suggestedMax` or exact `domain` bounds in your charting library |

**Verification:** Charts waste neither top vertical space nor mislead viewers through distorted axis baselines.

---

## Pre-Delivery Checklist

- [ ] **VIS-01:** All text levels (including muted secondary copy) meet WCAG contrast minimums.
- [ ] **VIS-02:** Text over imagery remains comfortably readable across light, dark, and busy photos.
- [ ] **VIS-03:** Image framing and overlays never cover faces or key focal subjects.
- [ ] **VIS-04:** Partner/brand logo sets balance evenly in size and visual weight.
- [ ] **VIS-05:** Layout avoids false bottoms; continuation cues show when content scrolls further.
- [ ] **VIS-06:** Cards separate softly from backgrounds without heavy borders or harsh shadows.
- [ ] **VIS-07:** Command buttons and filter/selection chips look and behave distinctly.
- [ ] **VIS-08:** Stacked or background-blending avatars use clean border rings and preserve aspect ratios.
- [ ] **VIS-09:** Shadows stay soft, diffused, and consistent with system elevation tokens.
- [ ] **VIS-10:** Dialogs emphasize one clear primary action over calmer secondary options.
- [ ] **VIS-11:** Chart axes fit data realistically while respecting zero baselines and percentage scales.
