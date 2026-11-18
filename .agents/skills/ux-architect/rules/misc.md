---
title: Miscellaneous UI and UX Rules
description: Practical interaction, rating systems, media optimization, empty states, and feedback rules using Tailwind CSS and Raw CSS.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [misc, ratings, otp, animation, images, terms, empty-states, errors]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Miscellaneous Interactions and Edge Cases

> **Scope:** Apply these rules to publication dates, review ratings, verification codes, animations, images, maps, consent flows, recovery vs. confirmation, loading expectations, nested radii, empty states, error pages, and subtle micro-interactions.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## MISC-01 — Display Publication and Updated Dates

**Principle:** Visible dates help users judge content freshness and trustworthiness, especially for technical guides or rapidly evolving information.

### Requirements

- **MUST** display dates that establish article currency in a clearly visible location.
- **SHOULD** display both the original publication date and last updated date when they differ meaningfully.
- **MUST NOT** fabricate dates or mark content as updated without substantive edits.
- **MUST** use the semantic `<time>` element with a machine-readable standard `datetime` attribute.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **HTML & A11y** | Semantic time element | `<time datetime="2026-10-09">October 9, 2026</time>` |
| **Tailwind CSS** | Metadata row styling | `flex items-center gap-2 text-sm text-muted-foreground` |
| **Raw CSS** | Metadata styling | `display: flex; gap: 0.5rem; font-size: 0.875rem; color: #64748b;` |

**Verification:** Readers unambiguously distinguish publication dates from last-updated timestamps.

---

## MISC-02 — Upgrade Review and Rating Summaries

**Principle:** Average star ratings alone lack context; showing total review counts alongside score distribution histograms builds earned trust.

### Requirements

- **MUST** display the total number of reviewers alongside the average rating.
- **SHOULD** present a distribution breakdown from 5 stars down to 1 star showing counts or percentages per tier.
- **SHOULD** allow users to click individual rating tiers to filter reviews matching that score.
- **MUST** compute rating summaries and bar proportions directly from real data rather than decorative placeholder graphics.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Rating distribution bar | Track: `h-2 rounded-full bg-muted overflow-hidden`; Fill: `h-full bg-amber-500` |
| **Raw CSS** | Progress bar styling | `height: 0.5rem; border-radius: 9999px; background-color: #e2e8f0;` |

**Verification:** Clicking any rating tier filters matching reviews, and screen readers announce numeric totals accurately.

---

## MISC-03 — Front-Load Numeric Verification Codes in Notifications

**Principle:** Users should read one-time verification codes directly inside mobile lock-screen or banner notification previews without opening the full message.

### Requirements

- **MUST** place the verification code near the beginning of notification or SMS copy.
- **SHOULD** keep copy concise, name the action being authorized, and avoid burying codes behind lengthy introductory text.
- **SHOULD** support web autofill via `autocomplete="one-time-code"`.

### Implementation Guidance

| Pattern | Example Message |
| :--- | :--- |
| **Clear front-loaded copy** | `123456 is your verification code to sign in.` |
| **Copy to avoid** | `Welcome to our service! Thank you for logging in today... your verification code is 123456` |

**Verification:** Users immediately read the complete code from the compact notification preview without switching apps.

---

## MISC-04 — Tune Animation Durations Appropriately

**Principle:** Overly fast animations blink past notice, whereas overly sluggish transitions make the interface feel unresponsive.

### Requirements

- **SHOULD** use `100ms` to `200ms` for subtle micro-transitions such as hover states, button feedback, or compact menu toggles.
- **SHOULD** use `200ms` to `300ms` for larger spatial transitions such as dialogs or slide-out drawers.
- **MUST** disable or tone down animations when the user enables reduced motion preferences.
- **SHOULD** animate GPU-friendly properties (`transform` and `opacity`) for smooth rendering performance.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Responsive reduced-motion transition | `transition duration-150 ease-out motion-reduce:transition-none` |
| **Raw CSS** | Transition with media query | `transition: transform 150ms ease-out;` paired with `@media (prefers-reduced-motion: reduce)` |

**Verification:** Transitions feel snappy without dragging workflows and disappear cleanly when reduced motion is enabled.

---

## MISC-05 — Serve Modern Image Formats with Intrinsic Sizing

**Principle:** Modern image codecs dramatically shrink payloads while retaining sharp detail, accelerating page loads without layout shifts.

### Requirements

- **SHOULD** serve WebP or AVIF formats with browser-compatible fallbacks.
- **MUST** declare explicit `width` and `height` attributes (or aspect containers) to prevent cumulative layout shift while loading.
- **MUST NOT** select formats based purely on byte size without inspecting sharp detail and alpha transparency preservation.

### Implementation Guidance

```html
<picture>
  <source srcset="/images/hero.avif" type="image/avif">
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="Descriptive image text" width="1200" height="675" loading="lazy" class="w-full h-auto">
</picture>
```

**Verification:** Images load rapidly, render crisply, and never shift surrounding content when decoding completes.

---

## MISC-06 — Match Map Detail to Task Intent

**Principle:** When the goal is showing general location context, lightweight static previews load vastly faster than heavy interactive map embeds.

### Requirements

- **SHOULD** render static map previews or simplified location views when users only need general neighborhood orientation.
- **MUST NOT** strip essential street labels or landmarks when turn-by-turn or detailed local navigation is genuinely required.
- **SHOULD** avoid embedding resource-heavy interactive maps when they are peripheral to the page's primary purpose.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Static map preview** | Aspect-constrained lightweight image | `<img src="/map-preview.webp" alt="Branch location map" class="w-full aspect-video rounded-lg object-cover">` |
| **Native map handoff** | Direct link to external maps app | `<a href="https://maps.google.com/..." class="...">Open in maps app</a>` |

**Verification:** Pages load fast while users can launch full interactive directions on demand.

---

## MISC-07 — Use Empty `alt=""` for Decorative Images

**Principle:** Setting `alt=""` signals screen readers to skip purely decorative imagery cleanly, whereas omitting the `alt` attribute altogether causes screen readers to read raw filenames aloud.

### Requirements

- **MUST** set `alt=""` on purely decorative visuals that convey zero additional content.
- **MUST** write meaningful `alt` descriptions for informative images or image-based action controls.
- **MUST NOT** omit the `alt` attribute entirely, which causes assistive technology to announce unintelligible filenames.

### Implementation Guidance

| Image Role | Accessible HTML |
| :--- | :--- |
| **Decorative background pattern** | `<img src="/pattern.svg" alt="" aria-hidden="true">` |
| **Informative content image** | `<img src="/chart.webp" alt="Annual revenue trend chart">` |

**Verification:** Screen readers bypass decorative flourishes silently and read accurate descriptions for informative imagery.

---

## MISC-08 — Streamline Terms Acceptance When Legally Permitted

**Principle:** Where privacy laws and compliance policies allow, stating that clicking the action button constitutes agreement eliminates unnecessary checkbox friction.

### Requirements

- **MAY** replace explicit terms checkboxes with clear action notice only when verified to satisfy applicable legal requirements.
- **MUST** position clear agreement language directly adjacent to the confirmation button with live clickable links to full terms.
- **MUST NOT** remove checkboxes where explicit affirmative consent is legally required.
- **MUST NOT** bundle marketing opt-ins together with mandatory Terms of Service acceptance without clear separation.

### Implementation Guidance

```html
<div class="mt-4 text-sm text-muted-foreground">
  By creating an account, you agree to the
  <a href="/terms" class="underline underline-offset-2 text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xs">Terms of Service</a>
  and
  <a href="/privacy" class="underline underline-offset-2 text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xs">Privacy Policy</a>.
</div>
```

**Verification:** Users understand the legal effect of clicking submit and can read linked policies easily beforehand.

---

## MISC-09 — Offer Quick Preset Options for Common Picks

**Principle:** Surfacing popular preset swatches or quantities directly eliminates the tedium of opening full picker widgets for routine selections.

### Requirements

- **SHOULD** expose frequent presets as one-click buttons or swatches right inline.
- **MUST** make preset options fully keyboard navigable and operable.
- **MUST** highlight the active selection clearly without relying on color differences alone.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Color/value preset row | `flex items-center gap-2` with unmistakable ring/check state on the active button |
| **A11y** | Human-readable color/value labels | Assign explicit `aria-label="Blue"` (and `aria-pressed` or radio semantics) per swatch button |

**Verification:** Users pick common values in one click or keypress and clearly observe which preset is active.

---

## MISC-10 — Keep Truncated Long Content Expandable Everywhere

**Principle:** Lengthy descriptions inside cards or tables should show clean previews with an explicit, touch-friendly way to inspect full content without losing data permanently.

### Requirements

- **SHOULD** clamp verbose entries in list/table views while offering a clear "Read more" control to reveal the full text.
- **MUST** ensure touch-device users can access complete truncated content reliably without hovering tooltips.
- **MUST NOT** truncate mission-critical values where omission alters meaning — such as monetary amounts or legal caveats.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Two-line clamp with expand trigger | `line-clamp-2` paired with an accessible toggle button |
| **JavaScript** | State-driven expansion | Toggle clamp class or swap between clamped preview and full text on activation |

**Verification:** Touch-screen users tap cleanly to view truncated content in full.

---

## MISC-11 — Choose Undo Recovery vs. Explicit Confirmation

**Principle:** Low-risk reversible operations flow fastest with instant execution plus an Undo action, whereas destructive irreversible operations require careful confirmation dialogs.

### Requirements

- **SHOULD** execute low-risk actions immediately (e.g., archiving a draft) accompanied by a clear toast/banner containing an active Undo action.
- **MUST** require deliberate confirmation dialogs for severe irreversible actions — such as permanent account or database deletion.
- **MUST** guarantee Undo controls actually restore full prior state reliably rather than displaying fake UI feedback.

### Risk-Appropriate Response Table

| Risk Tier | Correct Interaction Pattern |
| :--- | :--- |
| **Low Risk (Reversible)** | Act immediately with a visible notification banner and functional Undo button |
| **High Risk (Irreversible)** | Open a confirmation dialog explaining impact, optionally requiring typed confirmation |

**Verification:** Clicking Undo reliably restores the prior state completely with zero missing attributes.

---

## MISC-12 — Choose Infinite Scroll vs. Pagination Intentionally

**Principle:** Infinite scrolling fits passive feed discovery, whereas explicit pagination serves goal-directed lookups, data tables, and workflows needing footer access or bookmarkable state.

### Requirements

- **SHOULD** use explicit pagination for search results, tabular datasets, commerce catalogs, or views where users return to specific pages.
- **SHOULD** reserve infinite scroll or incremental loading for discovery streams and casual feeds.
- **MUST NOT** attach infinite auto-loading on pages where users routinely reach footer links or legal disclosures.

### Pattern Selection Table

| Context | Recommended Pattern |
| :--- | :--- |
| **Data tables / Catalogs / Search results** | Explicit numbered pagination with clear page controls |
| **Passive discovery / Social feeds** | Incremental or continuous feed loading |

**Verification:** Paginated views preserve shareable/bookmarkable URLs cleanly and never trap footer links out of reach.

---

## MISC-13 — Manage Expectations During Loading States

**Principle:** Empty frozen screens make waits feel longer; transparent loading feedback lowers frustration during processing delays.

### Requirements

- **MUST** render a clear loading indicator immediately whenever operations exceed `400ms`.
- **SHOULD** update status messaging dynamically during unusually long operations (e.g., `"Finalizing report..."`).
- **MUST NOT** animate deceptive fake progress percentages unrelated to actual progress.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Skeleton loading placeholder | `animate-pulse bg-muted rounded-md` |
| **A11y** | Assistive busy announcements | Declare `role="status"` or `aria-busy="true"` during active fetches |

**Verification:** Progress feedback appears promptly on slow operations, and failures display clear retry actions.

---

## MISC-14 — Match Nested Border Radii Proportionally

**Principle:** When nesting a rounded child element inside a padded rounded container, reduce the inner radius by the outer padding width so corner margins stay visually concentric.

### Requirements

- **SHOULD** compute inner container border radius by subtracting container padding from the outer border radius (`inner = outer - padding`).
- **AVOID** reusing identical large `border-radius` values on both parent and nested child boxes, which creates pinched corners and uneven spacing.

### Optical Formula

```text
Inner Radius = Outer Radius - Inner Padding
```

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Stepped concentric radii | Outer card: `rounded-2xl p-4`; Inner box: `rounded-lg` |
| **Raw CSS** | Exact radius subtraction | Outer uses `border-radius: 16px; padding: 8px;`; Inner uses `border-radius: 8px;` |

**Verification:** The padding gap between outer and inner edges traces an even curve around every corner.

---

## MISC-15 — Design Actionable Empty States

**Principle:** Empty screens must never feel like dead ends; explain why the space is empty and give users an immediate next step.

### Requirements

- **MUST** tailor empty states to their root cause: initial setup (no data yet), zero filter matches, or load failure.
- **MUST** supply a clear primary action or recovery option — such as creating a first item or clearing active filters.
- **MUST NOT** recycle one generic empty illustration and message across completely different scenarios.

### Implementation Guidance

```html
<div class="flex flex-col items-center justify-center p-8 text-center">
  <div class="rounded-full bg-muted p-4 text-muted-foreground">
    <svg aria-hidden="true" class="size-8">...</svg>
  </div>
  <h3 class="mt-4 text-lg font-semibold text-foreground">No documents in this category yet</h3>
  <p class="mt-2 text-sm text-muted-foreground max-w-sm">
    Create your first document to keep your workflow organized cleanly.
  </p>
  <button type="button" class="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
    Create document
  </button>
</div>
```

**Verification:** Users immediately grasp why no data appears and see a clear button to advance or recover.

---

## MISC-16 — Error Pages Must Provide Clear Recovery Paths

**Principle:** When users hit broken links or system errors, always offer clear orientation and working recovery routes rather than stranding them.

### Requirements

- **MUST** explain what went wrong in plain human language rather than raw numeric codes alone.
- **MUST** display unmistakable navigation buttons back home or actions to retry safely.
- **SHOULD** surface search inputs or suggested destinations when helpful for recovery.

### Implementation Guidance

| Required Element | Example Implementation |
| :--- | :--- |
| **Plain-language explanation** | `We couldn't find the page you're looking for. It may have been moved or deleted.` |
| **Primary recovery action** | Prominent `Return to home` button or `Contact support` link |

**Verification:** Error views always present working paths back to healthy parts of the application.

---

## MISC-17 — Add Delightful Micro-Interactions Without Harming Core Usability

**Principle:** Subtle micro-interactions bring personality and responsiveness, provided they never block core function, legibility, or accessibility.

### Requirements

- **MAY** add tasteful micro-interactions strictly after core behavior, security, and performance are solid.
- **MUST** verify animations never obscure field labels, validation alerts, or critical copy.
- **MUST NOT** hide essential actions behind hover-only triggers unreachable on touch devices.
- **MUST** respect `prefers-reduced-motion` preferences by disabling decorative motion automatically.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Gentle motion-safe hover lift | `transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transform-none` |
| **Raw CSS** | Reduced-motion-safe hover transform | `transition: transform 150ms;` paired with `:hover { transform: translateY(-2px); }` guarded by reduced-motion media queries |

**Verification:** Disabling animations leaves every primary task intact without lag or obscured controls.

---

## Pre-Delivery Checklist

- [ ] **MISC-01:** Publication and updated timestamps use semantic `<time>` markup accurately.
- [ ] **MISC-02:** Review summaries include total counts and data-accurate rating distribution bars.
- [ ] **MISC-03:** Verification codes appear right at the beginning of notification copy.
- [ ] **MISC-04:** Animation durations fit scale (`100–300ms`) and honor reduced motion preferences.
- [ ] **MISC-05:** Modern image formats ship with explicit dimensions preventing layout shift.
- [ ] **MISC-06:** Static maps serve orientation views efficiently with links to full navigation.
- [ ] **MISC-07:** Decorative images carry `alt=""` while content visuals carry descriptive `alt` text.
- [ ] **MISC-08:** Agreement wording sits clearly beside action controls with live policy links.
- [ ] **MISC-09:** Common preset values offer keyboard-accessible one-click selection with clear active cues.
- [ ] **MISC-10:** Truncated long text provides touch-friendly expansion everywhere.
- [ ] **MISC-11:** Low-risk actions support functional Undo; destructive actions require confirmation.
- [ ] **MISC-12:** Lists match context with pagination vs. continuous feed loading appropriately.
- [ ] **MISC-13:** Operations exceeding `400ms` show honest progress indicators and retry paths.
- [ ] **MISC-14:** Nested rounded corners maintain concentric curvature (`outer - padding`).
- [ ] **MISC-15:** Empty states explain root cause and include actionable next steps.
- [ ] **MISC-16:** Error screens communicate clearly and link safely back to working paths.
- [ ] **MISC-17:** Micro-interactions stay subtle, accessible, and obey reduced-motion settings.
