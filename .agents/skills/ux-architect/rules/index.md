---
title: UX Architect Rulebook Master Index
description: Complete 100-rule index mapping every Rule ID across all 8 UX domain files with exact line ranges for selective, low-token inspection.
scope: [index, rules, navigation, progressive-disclosure]
---

# UX Architect Rulebook Master Index (100 Rules)

Always read [global.md](./global.md) for the RFC 2119 contract, Decision Priority Hierarchy, and Engineering Guardrails. Use the line ranges below to open only the exact domain rules needed for your current task.

---

## Forms (`FORM-01` – `FORM-17`) — [forms.md](./forms.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `FORM-01` | `L16-L36` | Spacing between input field groups vs. tight label-to-input proximity |
| `FORM-02` | `L38-L60` | Copy-to-clipboard buttons copying raw values with post-action status feedback |
| `FORM-03` | `L62-L82` | Single-column primary form flow; pair only tightly coupled row units |
| `FORM-04` | `L84-L104` | Size input widths proportionally to expected value lengths |
| `FORM-05` | `L106-L127` | Honest positive validation feedback without implying typo-free verification |
| `FORM-06` | `L129-L151` | Place field errors adjacent to invalid inputs bound via `aria-describedby` |
| `FORM-07` | `L153-L173` | Keep essential field instructions visible by default without hover triggers |
| `FORM-08` | `L175-L196` | Persistent visible `<label>` controls instead of placeholder-only labels |
| `FORM-09` | `L198-L219` | Keep submit buttons enabled to guide users with validation errors on submit |
| `FORM-10` | `L221-L241` | Toggle switches for immediate settings vs. checkboxes for deferred form submission |
| `FORM-11` | `L243-L263` | Never truncate typed or pasted over-limit text silently |
| `FORM-12` | `L265-L286` | Real-time character counters and clear overage warnings for textareas |
| `FORM-13` | `L288-L308` | Progressive disclosure for advanced options while preserving entered state |
| `FORM-14` | `L310-L331` | Display password complexity requirements up front with live fulfillment state |
| `FORM-15` | `L333-L354` | Outcome-specific submit button labels stating exact results |
| `FORM-16` | `L356-L377` | Scroll to and focus the first invalid field automatically on submission error |
| `FORM-17` | `L379-L401` | Prevent mistakes with `type`, `autocomplete`, `inputmode`, and smart defaults |

*(Baseline HTML/Tailwind form examples & Pre-Delivery Checklist: `L403-L473`)*

---

## Visuals (`VIS-01` – `VIS-11`) — [visuals.md](./visuals.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `VIS-01` | `L16-L36` | WCAG minimum text contrast (`4.5:1` body, `3:1` large) including secondary copy |
| `VIS-02` | `L38-L65` | Contrast scrims, gradients, or backdrops keeping text over photos readable |
| `VIS-03` | `L67-L87` | Preserve focal subjects and faces when placing overlays or cropping images |
| `VIS-04` | `L89-L108` | Normalize partner/brand logo grid scale, aspect ratios, and visual weight |
| `VIS-05` | `L110-L129` | Avoid `100vh` false bottoms; expose continuation cues below the fold |
| `VIS-06` | `L131-L151` | Subtle card separation via surface contrast and light shadows over thick borders |
| `VIS-07` | `L153-L173` | Visually distinguish command action buttons from selectable filter chips/tags |
| `VIS-08` | `L175-L195` | Subtle ring outlines around stacked or background-matching avatars |
| `VIS-09` | `L197-L217` | Soft layered elevation shadows aligned with hierarchy tokens |
| `VIS-10` | `L219-L239` | Emphasize exactly one primary action inside confirmation dialogs |
| `VIS-11` | `L241-L261` | Fit chart Y-axis bounds to data intent while keeping zero baselines on bar charts |

*(Pre-Delivery Checklist: `L263-L275`)*

---

## Layout & Alignment (`LAY-01` – `LAY-12`) — [layout-and-alignment.md](./layout-and-alignment.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `LAY-01` | `L17-L38` | Align accordion trigger starting characters cleanly with expanded content |
| `LAY-02` | `L40-L61` | Fixed desktop sidebar widths (`240–280px`) with `min-w-0 flex-1` main panels |
| `LAY-03` | `L63-L84` | Group long attribute lists semantically with headers and differentiated gaps |
| `LAY-04` | `L86-L108` | Dialog button ordering matched to platform flow and keyboard Tab focus |
| `LAY-05` | `L110-L132` | Left/start-align multi-line dialog body text and emphasize one primary button |
| `LAY-06` | `L134-L155` | Align label-value columns cleanly and emphasize data values over muted labels |
| `LAY-07` | `L157-L177` | Generous vertical section rhythm noticeably larger than intra-section spacing |
| `LAY-08` | `L179-L198` | Extend section background fills across both headings and grouped content |
| `LAY-09` | `L200-L220` | Prefer extra whitespace over cluttering borders to separate unrelated blocks |
| `LAY-10` | `L222-L244` | Avoid tall empty `rowspan` table columns; split tables or use sticky headers |
| `LAY-11` | `L246-L267` | Top-aligned or tight-gutter labels eliminating horizontal zigzag scanning |
| `LAY-12` | `L269-L289` | Place tall illustrations beside lengthy text on wide viewports; stack on mobile |

*(Pre-Delivery Checklist: `L291-L305`)*

---

## Typography (`TYPO-01` – `TYPO-12`) — [typography.md](./typography.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `TYPO-01` | `L16-L35` | Avoid center-aligning multi-line body paragraphs |
| `TYPO-02` | `L37-L56` | Avoid full text justification (`text-justify`) on general web prose |
| `TYPO-03` | `L58-L78` | Eliminate whitespace rivers and verify locale/dictionary wrapping |
| `TYPO-04` | `L80-L99` | Constrain readable line measure (`50–75` Latin characters / responsive width) |
| `TYPO-05` | `L101-L120` | Smooth ragged endings (`text-balance` on short headings, `text-pretty` on prose) |
| `TYPO-06` | `L122-L150` | Scale line height to text role and script needs (`>= 1.6` for tall diacritic scripts) |
| `TYPO-07` | `L152-L172` | Build scannable hierarchy using semantic tags (`h1`–`h6`) + size, weight, tone |
| `TYPO-08` | `L174-L193` | Keep top heading margin larger than bottom margin to bind headings to content |
| `TYPO-09` | `L195-L214` | Use comfortable near-black/near-white neutral inks meeting WCAG contrast |
| `TYPO-10` | `L216-L236` | Offset inline link underlines cleanly below descenders and lower diacritics |
| `TYPO-11` | `L238-L258` | Restrain text emphasis (`strong`/`em`) rather than stacking conflicting highlights |
| `TYPO-12` | `L260-L279` | Use `tabular-nums` in tables/timers/prices and `proportional-nums` in prose |

*(Reference Implementations & Pre-Delivery Checklist: `L281-L364`)*

---

## Usability (`USAB-01` – `USAB-17`) — [usability.md](./usability.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `USAB-01` | `L16-L37` | Persistent visible labels bound cleanly via `for`/`id` to click-focus inputs |
| `USAB-02` | `L39-L60` | Surface visible system/filter status counts with an accessible reset action |
| `USAB-03` | `L62-L82` | Clear interactive affordances, underlined prose links, hover and focus states |
| `USAB-04` | `L84-L104` | Descriptive menu rows with full-row clickable/focusable hit targets |
| `USAB-05` | `L106-L126` | Clear (`×`) button on populated search inputs restoring focus when activated |
| `USAB-06` | `L128-L147` | Keep slider value readouts positioned above tracks where fingers cannot block |
| `USAB-07` | `L149-L169` | Expose small option sets (`2–5` choices) directly instead of nesting dropdowns |
| `USAB-08` | `L171-L191` | Enforce comfortable touch hit targets (`>= 44 x 44 px`) and safe gaps |
| `USAB-09` | `L193-L212` | Provide editable one-click preset chips for common input values |
| `USAB-10` | `L214-L236` | Match input `type` and `inputmode` to data (never `type="number"` for IDs/ZIPs) |
| `USAB-11` | `L238-L258` | Position password reveal toggles outside `<input>` box bounds via flex container |
| `USAB-12` | `L260-L280` | Expand drag-handle hit padding without oversizing icons + keyboard fallback |
| `USAB-13` | `L282-L301` | Keep primary desktop navigation exposed directly instead of hamburger menus |
| `USAB-14` | `L303-L322` | Host complex or multi-step forms on dedicated pages instead of modal overlays |
| `USAB-15` | `L324-L343` | Never stack nested modal dialogs on top of open modals |
| `USAB-16` | `L345-L365` | Order frequent options first while keeping DOM order matched to keyboard Tab |
| `USAB-17` | `L367-L387` | Show live Caps Lock warnings beside password fields via `getModifierState` |

*(Reference Component Examples & Pre-Delivery Checklist: `L389-L470`)*

---

## Icons (`ICON-01` – `ICON-08`) — [icons.md](./icons.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `ICON-01` | `L16-L36` | Apply targeted optical alignment offsets only to asymmetric icon shapes |
| `ICON-02` | `L38-L58` | Balance icon color contrast so icons support rather than overpower adjacent text |
| `ICON-03` | `L60-L79` | Place list icons inside fixed-dimension containers for crisp label alignment |
| `ICON-04` | `L81-L100` | Maintain cohesive stroke weight, style, and sizing across the icon family |
| `ICON-05` | `L102-L123` | Choose familiar, conventional icon metaphors rather than invented symbols |
| `ICON-06` | `L125-L144` | Pair icons with visible labels, or supply `aria-label` on icon-only controls |
| `ICON-07` | `L146-L168` | Pair status icons with explanatory text and hide decorative glyphs (`aria-hidden`) |
| `ICON-08` | `L170-L189` | Provide `>= 44 x 44 px` touch hit targets, focus rings, and `aria-pressed` states |

*(Default Icon Size Token Table & Pre-Delivery Checklist: `L191-L214`)*

---

## Language & Perception (`LANG-01` – `LANG-06`) — [language-and-perception.md](./language-and-perception.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `LANG-01` | `L16-L40` | Write human-language alerts with next steps and specific verb-outcome buttons |
| `LANG-02` | `L42-L64` | Write self-explanatory link labels telling destinations clearly out of context |
| `LANG-03` | `L66-L95` | Add visible icons and screen-reader notices to links opening in new tabs |
| `LANG-04` | `L97-L118` | Phrase checkbox labels as positive affirmative statements without double negatives |
| `LANG-05` | `L120-L143` | Group long numbers readably while preserving exact full values when needed |
| `LANG-06` | `L145-L167` | Name sort controls after user-friendly outcomes instead of database terminology |

*(Pre-Delivery Checklist: `L169-L178`)*

---

## Miscellaneous & Edge Cases (`MISC-01` – `MISC-17`) — [misc.md](./misc.md)

| Rule ID | Line Range | Focus |
| :--- | :--- | :--- |
| `MISC-01` | `L16-L37` | Surface publication/updated dates honestly using semantic `<time>` tags |
| `MISC-02` | `L39-L59` | Show review totals and filterable rating distribution bars from real data |
| `MISC-03` | `L61-L80` | Front-load verification OTP codes in SMS/notifications + `one-time-code` autofill |
| `MISC-04` | `L82-L102` | Tune transition durations (`100–300ms`), animate `transform`/`opacity`, honor reduce |
| `MISC-05` | `L104-L126` | Serve modern WebP/AVIF formats with explicit `width`/`height` preventing CLS |
| `MISC-06` | `L128-L147` | Use static map previews for orientation with links to native interactive maps |
| `MISC-07` | `L149-L168` | Mark decorative images `alt=""` and informative images with descriptive `alt` text |
| `MISC-08` | `L170-L194` | Streamline action-implied terms acceptance where legally verified without dark patterns |
| `MISC-09` | `L196-L215` | Offer keyboard-accessible preset swatches/values with non-color active states |
| `MISC-10` | `L217-L236` | Keep truncated list copy expandable on touch screens; never clip critical numbers |
| `MISC-11` | `L238-L257` | Instant execution + real Undo for low-risk actions; careful confirmation for irreversible |
| `MISC-12` | `L259-L278` | Match pagination to lookup tables/catalogs vs. continuous scroll to passive feeds |
| `MISC-13` | `L280-L299` | Surface progress indicators when waits exceed `400ms` without fake percentage lies |
| `MISC-14` | `L301-L325` | Size nested radii concentrically (`innerRadius = outerRadius - padding`) |
| `MISC-15` | `L327-L356` | Design context-specific empty states explaining causes plus immediate next actions |
| `MISC-16` | `L358-L377` | Give error pages plain explanations and unmistakable navigation paths back home |
| `MISC-17` | `L379-L399` | Add playful micro-interactions only after core UX is solid and obey reduced motion |

*(Pre-Delivery Checklist: `L401-L420`)*

