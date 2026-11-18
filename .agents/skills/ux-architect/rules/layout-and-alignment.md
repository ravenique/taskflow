---
title: Layout and Alignment Rules
description: Rules for layout structure, alignment, spacing, grouping, and visual scanning flow using Tailwind CSS, Raw CSS, and semantic HTML.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope:
  [layout, alignment, spacing, grouping, dialogs, tables, forms, responsive]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Layout and Alignment

> **Scope:** Apply these rules when designing, building, reviewing, or refactoring page layout structure, alignment, spacing, information grouping, dialogs, tables, forms, and content composition.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## LAY-01 — Aligning Text Inside Accordions

**Principle:** Align accordion headers and expanded body text along the exact same starting reading edge so the eye scans straight down effortlessly.

### Requirements

- **SHOULD** align the first character of the accordion trigger text with the first character of the expanded content below, rather than only aligning outer box borders.
- **SHOULD** apply matching horizontal padding to header and body panels, or place both in the same text column when leading icons are present.
- **SHOULD** position expand/collapse chevrons at the trailing edge so they do not indent header text away from body text alignment.
- **AVOID** indented headers or shifted content blocks that break alignment without an explicit hierarchical purpose.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | `text-start` with matching horizontal padding | `px-4 text-start`; Header uses `flex items-center justify-between gap-3` |
| **Raw CSS** | Matching text starting edge | `text-align: start; padding-inline: 1rem; display: flex; justify-content: space-between; gap: .75rem;` |
| **HTML & A11y** | Semantic disclosure elements | Use `<details>` and `<summary>` for simple disclosures, or an accessible accordion pattern with proper ARIA states |

**Verification:** Toggle accordions open and closed on mobile and desktop viewports to confirm header and body starting characters align vertically.

---

## LAY-02 — Fixed Desktop Sidebar Width

**Principle:** Prevent side navigation bars from consuming excessive horizontal space and squeezing the primary content area.

### Requirements

- **SHOULD** assign a sensible fixed desktop sidebar width (such as `240px` to `280px`) rather than using a percentage of viewport width.
- **SHOULD** let main content flex to absorb all remaining horizontal space while allowing shrinking via `min-w-0` to prevent horizontal overflow.
- **SHOULD** adapt navigation into a collapsible drawer, overlay menu, or compact pattern on small viewports instead of locking desktop sidebar widths.
- **AVOID** applying `width: 30%` or `w-1/3` to standard navigation sidebars when menu items fit comfortably in a compact fixed width.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Fixed sidebar width + flexible main region | Shell: `flex`; Sidebar: `hidden md:block md:w-60 md:shrink-0`; Main: `min-w-0 flex-1` |
| **Raw CSS** | Explicit `flex-basis` sizing | `.sidebar { flex: 0 0 15rem; } .main { flex: 1; min-width: 0; }` |
| **HTML & A11y** | Semantic navigation landmarks | Pair `<aside>` or `<nav aria-label="...">` alongside `<main>` |

**Verification:** Navigation labels fit cleanly without truncation or wrapping, and main workspace width stays generous across desktop resolutions.

---

## LAY-03 — Grouping Related Data Attributes

**Principle:** Reduce visual scanning fatigue across long property lists by organizing related attributes into clear, scannable semantic groups.

### Requirements

- **SHOULD** group properties by real semantic domain (e.g., Processor, Memory, Display) rather than splitting arbitrarily by row counts.
- **SHOULD** give each group a short subheading and make gaps between groups noticeably larger than spacing within a group.
- **MUST** pair labels and values both visually and semantically.
- **AVOID** dumping dozens of unrelated attributes into a single unbroken vertical stack without grouping boundaries.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Hierarchical group spacing | Group wrapper: `flex flex-col gap-6` or `grid gap-6`; Inner rows: `grid grid-cols-2 gap-x-4 gap-y-2`; Group title: `font-semibold text-foreground` |
| **Raw CSS** | Differentiated grid/flex gaps | `.groups { display: grid; gap: 1.5rem; } .attribute-rows { display: grid; gap: .5rem 1rem; }` |
| **HTML & A11y** | Semantic description lists | Wrap groups in `<section>` with headings or use `<dl>` containing `<dt>` and `<dd>` pairs |

**Verification:** Users immediately scan straight to the attribute category they want without reading top-to-bottom line by line.

---

## LAY-04 — Button Ordering Inside Confirmation Dialogs

**Principle:** Position dialog buttons and keyboard focus traversal to match platform conventions and natural task continuation.

### Requirements

- **SHOULD** follow established platform and design system conventions: in standard confirmation dialogs without typed confirmation inputs, cancel typically sits on the left and confirm on the right.
- **SHOULD** when requiring the user to type a confirmation string for high-risk or irreversible actions, consider placing the submit button immediately adjacent to the text input in both visual flow and DOM/keyboard focus order.
- **MUST** communicate irreversible consequences clearly and visually differentiate destructive delete/remove actions from standard buttons.
- **MUST NOT** use CSS `order` to flip visual button positions against natural keyboard Tab order.
- **MUST** manage modal focus trapping, `Escape` dismissal, and restoring focus back to the triggering control upon close.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Flow-matched footer alignment | Standard confirmation: `flex justify-end gap-3`; Inline input confirmation: `flex justify-start gap-3` |
| **Raw CSS** | Flex button positioning | `display: flex; gap: .75rem; justify-content: flex-end;` |
| **HTML & A11y** | Accessible modal form | Use native `<dialog>` or an accessible dialog primitive with descriptive button labels naming the exact action |

**Verification:** Keyboard Tab flow traverses inputs and buttons naturally, and confirm versus cancel buttons appear unmistakably distinct.

---

## LAY-05 — Reading Flow and Action Hierarchy in Dialogs

**Principle:** Preserve natural reading flow and establish unmistakable hierarchy among dialog actions.

### Requirements

- **SHOULD** left-align (or start-align) multi-line descriptive copy inside dialogs for effortless reading.
- **SHOULD** emphasize one clear primary button while keeping secondary actions visually subdued.
- **SHOULD** right-align standard web dialog footer action bars.
- **AVOID** center-aligning multi-line body paragraphs inside dialogs.
- **AVOID** placing two equally bright, saturated solid buttons side by side competing for attention.
- **AVOID** centering dialog action buttons in standard web interfaces without strong rationale.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Start-aligned body + clear primary button | Body: `text-start`; Footer bar: `flex justify-end gap-3`; Primary: `bg-primary text-primary-foreground hover:bg-primary/90`; Secondary: `border border-border text-foreground hover:bg-muted` |
| **Raw CSS** | Distinct alignment & action contrast | `text-align: start; display: flex; justify-content: flex-end; gap: .75rem;` paired with distinct primary/secondary button styles |

**Verification:** Users immediately spot the primary action at a glance and read dialog explanations smoothly along a consistent starting edge.

---

## LAY-06 — Label-and-Value Pairs Display

**Principle:** Emphasize the data values users are looking for while maintaining clear context from accompanying labels.

### Requirements

- **SHOULD** align labels and values in stable, consistent columns — or stack pairs vertically on narrow mobile viewports.
- **SHOULD** give data values stronger visual weight than their labels (e.g., bolder weight or higher-contrast foreground ink).
- **MUST** allow long values to wrap cleanly without overlapping labels or breaking container edges.
- **AVOID** rendering labels and values in identical font weight and color so they blend together.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Two-column responsive grid + tonal hierarchy | Row: `grid grid-cols-1 gap-1 sm:grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)] sm:gap-4`; Label: `text-muted-foreground`; Value: `font-medium text-foreground` |
| **Raw CSS** | Responsive key-value grid | `display: grid; grid-template-columns: minmax(8rem, 1fr) minmax(0, 2fr); gap: 1rem;` collapsing to 1 column on mobile |
| **HTML & A11y** | Semantic key-value elements | Wrap `<dt>` (label) and `<dd>` (value) pairs cleanly inside `<dl>` |

**Verification:** Eyes scan down the column of values effortlessly while instantly mapping each value back to its label.

---

## LAY-07 — Vertical Rhythm Between Page Sections

**Principle:** Separate independent sections with generous vertical whitespace so viewers immediately recognize distinct content boundaries.

### Requirements

- **SHOULD** maintain a systematic vertical spacing rhythm across sibling page sections.
- **SHOULD** make spacing between separate sections unmistakably larger than spacing inside any single section.
- **SHOULD** rely on whitespace as the primary separator, treating divider lines or alternating surface tints as optional support.
- **AVOID** compressing inter-section gaps down to the size of normal paragraph margins.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Responsive generous vertical padding | `py-16 md:py-24` per section, or `flex flex-col gap-20` across section stacks |
| **Raw CSS** | Breakpoint-scaled block padding | `.page-section { padding-block: 4rem; } @media (min-width: 768px) { .page-section { padding-block: 6rem; } }` |

**Verification:** Rapidly scrolling down the page reveals where every major section begins and ends without needing heavy divider borders.

---

## LAY-08 — Full-Section Surface Framing Around Grouped Content

**Principle:** Visually bind emphasized headers and their supporting content together inside one unified background surface rather than stranding headings alone.

### Requirements

- **SHOULD** extend background fills across the entire group (heading plus all subordinate cards/copy) rather than applying a narrow background stripe behind heading text alone.
- **SHOULD** apply background color to an outer container such as `<section>` while constraining inner content max-width separately.
- **AVOID** styling headings with narrow background bars that visually detach them from paragraphs or cards beneath them.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Outer surface container + inner max-width | Outer section: `bg-muted py-16`; Inner wrapper: `mx-auto max-w-6xl px-4` enclosing both heading and body |
| **Raw CSS** | Full-bleed wrapper with centered inner box | `.highlighted-section { background: #f1f5f9; padding-block: 4rem; } .highlighted-section__inner { max-width: 72rem; margin-inline: auto; padding-inline: 1rem; }` |

**Verification:** Viewers perceive the heading, cards, and supporting visuals as one cohesive section framed by a shared background.

---

## LAY-09 — Breathing Room Between Unrelated Content Blocks

**Principle:** Prevent cramped, suffocating layouts by expanding whitespace between unrelated content blocks instead of adding decorative borders or busy color boxes.

### Requirements

- **SHOULD** try expanding whitespace before reaching for extra borders, boxed cards, divider rules, or color fills.
- **SHOULD** make gaps between large content blocks substantially wider than spacing between text lines and controls inside each block.
- **SHOULD** scale spacing cleanly across breakpoints.
- **AVOID** squeezing every margin down equally just to cram more content above the fold.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Scaled macro vs. micro spacing | Between major blocks: `flex flex-col gap-12 md:gap-16`; Within a block: `flex flex-col gap-3 md:gap-4` |
| **Raw CSS** | Responsive generous vertical stacks | `.feature-stack { display: grid; gap: 3rem; } @media (min-width: 768px) { .feature-stack { gap: 4rem; } }` |

**Verification:** Individual blocks breathe cleanly and read as independent chunks while inner elements stay tightly associated.

---

## LAY-10 — Handling Whitespace in Grouped Tables

**Principle:** Avoid awkward towering empty cells created when category labels span tall multi-row groups via `rowspan`.

### Requirements

- **SHOULD** watch out for tall merged cells (`rowspan`) where the category heading scrolls out of view for lower rows.
- **SHOULD** consider splitting dense groups into distinct sub-tables with clear group headings, or using sticky group headers instead of tall vertical label columns.
- **MUST** preserve accurate accessible programmatic relationships between column headers, group labels, and data cells.
- **AVOID** spanning massive multi-row columns just to print a short group title once alongside vast empty left-hand space.
- **Exception:** Keep rows combined inside a single table when the user's primary workflow requires sorting across all groups simultaneously.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Separate group tables or sticky headers | Table stack: `flex flex-col gap-8`; Table wrapper: `w-full overflow-x-auto`; Header: `sticky top-0 bg-background` |
| **Raw CSS** | Modular grouped tables | `.table-groups { display: grid; gap: 2rem; } .table-scroll { overflow-x: auto; }` |
| **HTML & A11y** | Semantic table structure | Use `<caption>` or dedicated group heading per table plus complete `<th scope="col">` headers |

**Verification:** Even when scrolled deep into rows, users immediately know which category each row belongs to without wasted vertical gaps.

---

## LAY-11 — Form Layouts That Minimize Zigzag Eye Scanning

**Principle:** Keep eye movement between form labels and inputs as short and linear as possible.

### Requirements

- **SHOULD** place labels directly above inputs (`top-aligned`) for general forms, and always on narrow mobile screens.
- **SHOULD** when horizontal side-by-side labels are truly needed on wide layouts, right-align labels tightly adjacent to inputs with a small, uniform column gutter.
- **MUST** maintain top-to-bottom reading and keyboard Tab flow naturally.
- **AVOID** left-aligning labels far along the left screen edge while input controls sit across a wide gap to the right.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Stacked or compact aligned grid | Top-aligned: `grid gap-2`; Compact horizontal: `grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-x-3 gap-y-4` |
| **Raw CSS** | Tight gutter label grid | `display: grid; grid-template-columns: 8rem minmax(0, 1fr); column-gap: .75rem; row-gap: 1rem;` |
| **HTML & A11y** | Explicit label-control link | Always match `<label for="field-id">` with `<input id="field-id">` |

**Verification:** Eyes glide straight down the form without bouncing back and forth horizontally across wide whitespace.

---

## LAY-12 — Simple Side-by-Side Image and Text Layouts

**Principle:** When tall illustrations stacked beneath lengthy copy make screens overly tall, arrange image and copy cleanly side by side on wide viewports.

### Requirements

- **SHOULD** switch overly tall stacked text-plus-illustration pairs into a simple two-column layout on wider viewports.
- **SHOULD** adjust structural layout proportions to fit real content instead of cropping meaningful illustration details away.
- **SHOULD** collapse cleanly back to a single column on mobile viewports in logical reading order.
- **AVOID** arbitrarily slicing image height or using brittle `position: absolute` text overlays over busy illustrations.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Responsive 2-column grid | `grid grid-cols-1 items-start gap-8 lg:grid-cols-2`; Image: `w-full h-auto object-contain` |
| **Raw CSS** | Responsive grid switch | `display: grid; grid-template-columns: 1fr; gap: 2rem;` switching to `repeat(2, minmax(0, 1fr))` at desktop breakpoints |

**Verification:** Illustrations and explanations fit comfortably within view together without awkward vertical scrolling on desktop or mobile.

---

## Pre-Delivery Checklist

- [ ] **LAY-01:** Accordion header starting characters align vertically with expanded content.
- [ ] **LAY-02:** Desktop sidebars use compact fixed widths while main content flexes smoothly.
- [ ] **LAY-03:** Long property lists are grouped meaningfully with clear subheadings and differentiated gaps.
- [ ] **LAY-04:** Confirmation dialog button ordering matches system conventions and DOM keyboard focus order.
- [ ] **LAY-05:** Dialog copy is start-aligned for readability and highlights one primary action clearly.
- [ ] **LAY-06:** Key-value rows align in stable columns and emphasize values over muted labels.
- [ ] **LAY-07:** Section padding exceeds internal block spacing consistently.
- [ ] **LAY-08:** Section background surfaces wrap both headings and related content together.
- [ ] **LAY-09:** Unrelated content blocks use clean whitespace separation rather than cluttering borders.
- [ ] **LAY-10:** Grouped tables avoid tall empty `rowspan` columns and remain scannable on scroll.
- [ ] **LAY-11:** Form labels sit directly near inputs to prevent zigzag scanning.
- [ ] **LAY-12:** Wide viewports place tall visuals beside explanations and stack cleanly on mobile.
- [ ] Zero unintended horizontal overflow across mobile, tablet, and desktop widths, tested with realistic long strings.
