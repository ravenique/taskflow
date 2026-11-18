---
title: Usability Rules
description: Core usability heuristics, interaction guidelines, touch ergonomics, and feedback rules using Tailwind CSS, Raw CSS, and semantic HTML.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [usability, heuristics, interactions, ergonomics, navigation, modals, inputs]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Usability and Interactive Ergonomics

> **Scope:** Apply these rules to interactive behaviors, touch-friendly design, navigation visibility, input ergonomics, modal safety, and system state feedback.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## USAB-01 — Input Fields Must Always Have Visible Persistent Labels

**Principle:** Users must recognize every input's purpose immediately and remain able to verify what they are filling in even after typing begins.

### Requirements

- **MUST** render a clear, always-visible label for every form input control.
- **MUST** link labels programmatically to their inputs via matching `for` and `id` attributes.
- **MUST** ensure clicking or tapping a label reliably moves keyboard focus into its associated input.
- **MUST NOT** depend solely on visual proximity without programmatic label-to-input association.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Label and input group | `flex flex-col gap-1.5 min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` |
| **Raw CSS** | Label layout and spacing | `display: block; margin-bottom: 0.375rem; min-height: 2.75rem;` |
| **HTML & A11y** | Bound `<label>` and `<input>` | `<label for="full-name">Full name</label><input id="full-name">` |

**Verification:** Clicking or tapping the label text immediately places keyboard focus inside the input control.

---

## USAB-02 — Keep System Status Clearly Visible

**Principle:** Users should always know the active system state, especially when filters or custom view selections narrow results away from defaults.

### Requirements

- **MUST** signal unmistakably when a list or dataset is filtered — such as showing an active filter count.
- **MUST** update filter counts and status indicators synchronously with real state whenever filters are added or cleared.
- **SHOULD** display explicit copy (e.g., `Filters (3 active)`) rather than relying solely on colored indicator dots.
- **SHOULD** provide a prominent, one-click control to clear all active filters.
- **MUST NOT** let filtered result views look indistinguishable from complete unfiltered lists.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Descriptive status badge | `inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary` |
| **Raw CSS** | Indicator badge | `display: inline-flex; align-items: center; gap: 0.5rem; border-radius: 9999px;` |

**Verification:** Applying filters surfaces the active count clearly alongside a direct reset/clear action.

---

## USAB-03 — Make Interactive Affordances Unmistakable

**Principle:** Users must know at first glance which screen elements are interactive and which are static before hovering or tapping.

### Requirements

- **MUST** style buttons, links, checkboxes, toggles, and upload triggers with unmistakable interactive cues.
- **SHOULD** underline inline links embedded within prose copy rather than relying exclusively on color differences.
- **MUST** display distinct hover states and visible keyboard focus outlines across every interactive control.
- **MUST NOT** style non-interactive static labels like clickable buttons or apply pointer cursors to unclickable elements.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Clear affordance + focus state | `underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` |
| **Raw CSS** | Decoration & pointer feedback | `text-decoration: underline; text-underline-offset: 4px; cursor: pointer;` |

**Verification:** Scanning the screen immediately separates clickable controls from non-interactive text.

---

## USAB-04 — Make Menu Rows Descriptive with Full-Row Click Targets

**Principle:** Menu options benefit from concise supporting descriptions when clarity helps, and the entire row container should be clickable rather than just small text spans.

### Requirements

- **SHOULD** supply clear titles per menu row alongside brief helper subtitles when helpful for distinction.
- **MUST** make the entire menu row container interactive — encompassing icon, title, subtitle, and row padding.
- **MUST** show hover and keyboard focus states framing the full interactive row bounds.
- **AVOID** sprinkling repetitive or meaningless decorative icons across every menu item.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Full-row interactive hit target | `flex items-start gap-3 rounded-lg p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` |
| **Raw CSS** | Full-row clickable block | `display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 0.5rem;` |

**Verification:** Hovering or tapping anywhere within a menu row activates feedback and triggers navigation cleanly.

---

## USAB-05 — Provide a Clear Button Inside Populated Search Inputs

**Principle:** Once users enter a search query, they should be able to clear the entire query and reset search state in a single click or keypress.

### Requirements

- **MUST** display a clear (`×`) button whenever the search field contains text.
- **MUST** ensure clicking Clear empties the input value and resets live search/filter results consistently.
- **MUST** assign an explicit accessible name such as `Clear search` to the clear button.
- **SHOULD** return keyboard focus immediately to the search input after clearing so users can type a new query seamlessly.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Right-pinned clear button | Wrapper: `relative`; Input: `pr-10`; Clear button: `absolute right-2 top-1/2 -translate-y-1/2 size-8` |
| **JavaScript** | Clear value & restore focus | `clearBtn.addEventListener('click', () => { input.value = ''; input.focus(); });` |

**Verification:** Typing populates the clear control; activating it resets input text and results while placing focus right back inside the search bar.

---

## USAB-06 — Keep Slider Values Visible Above Finger Placement

**Principle:** On touchscreens, users' fingers cover horizontal range thumbs; positioning live value readouts above the slider track preserves uninterrupted visibility while dragging.

### Requirements

- **MUST** display the current slider value where fingers cannot obscure it — directly above the slider thumb/track is safest.
- **SHOULD** pair sliders with a direct numeric text input whenever exact value precision matters.
- **MUST NOT** place live slider value readouts underneath the track or directly beneath the draggable thumb.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Value readout above track | `flex flex-col gap-2 relative` with live value label positioned cleanly above `<input type="range">` |
| **Raw CSS** | Relative positioning | Render numeric readout container above `<input type="range">` |

**Verification:** Dragging a slider by touch on a phone keeps changing numeric values fully visible throughout movement.

---

## USAB-07 — Expose Small Option Sets Directly Instead of Hiding in Dropdowns

**Principle:** When choosing among roughly two to five options, showing visible radio cards, segmented buttons, or checkboxes cuts decision and interaction time compared to nested dropdowns.

### Requirements

- **SHOULD** display compact option sets (`2–5` items) directly on screen as radio cards, toggle buttons, or inline checkboxes.
- **MUST** match control semantics properly: radios for single choice, checkboxes for multi-selection.
- **MUST** make active selection state visually bold and unmistakable versus unselected options.
- **MUST NOT** flatten large option lists containing dozens of items directly onto the screen unnecessarily.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Visible choice cards grid | `grid grid-cols-2 gap-3 sm:grid-cols-3` paired with `peer-checked:border-primary peer-checked:bg-primary/5` |
| **Raw CSS** | Interactive label card | Wrap `<input type="radio">` inside card-styled `<label>` elements |

**Verification:** Small option sets appear immediately readable and selectable with one tap, zero dropdown clicks required.

---

## USAB-08 — Enlarge Touch Hit Targets Comfortably

**Principle:** Compact controls — such as checkboxes, switches, and icon buttons — need generous interactive hit targets so touch users tap accurately without frustration.

### Requirements

- **MUST** ensure clickable/tappable hit regions are generously sized, especially on touchscreen devices.
- **MUST** ensure tapping an option's text label or surrounding row toggles its checkbox or radio button.
- **SHOULD** enforce a minimum touch target area of roughly `44 x 44 px` on mobile controls.
- **MUST** separate neighboring interactive targets with sufficient spacing to avoid accidental mistaps.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Enforce minimum hit dimensions | `min-h-11 min-w-11 inline-flex items-center justify-center p-2` |
| **Raw CSS** | Minimum touch dimensions | `min-height: 44px; min-width: 44px; display: inline-flex; align-items: center;` |

**Verification:** Interactive controls tap accurately on small mobile displays without triggering adjacent targets.

---

## USAB-09 — Surface One-Click Presets for Frequent Input Values

**Principle:** Providing shortcut chips for popular values — such as time slots, common amounts, or standard dates — saves typing effort and prevents entry errors.

### Requirements

- **SHOULD** offer shortcut chips/buttons for common inputs (e.g., `Morning`, `Afternoon`, `Evening` or amounts like `$10`, `$50`, `$100`).
- **MUST** populate the chosen preset into the visible field and allow free user modification afterward.
- **MUST NOT** fire irreversible submissions the instant a preset chip is tapped unless clearly designed as an instant filter.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Quick preset chip row | `flex flex-wrap gap-2` with chips `rounded-full border border-border px-3 py-1 text-sm hover:bg-muted` |
| **Raw CSS** | Quick choice chips | `display: flex; flex-wrap: wrap; gap: 0.5rem;` |

**Verification:** Selecting a preset fills the target field reliably while leaving full manual editability intact.

---

## USAB-10 — Match Input Type and `inputmode` to Expected Data

**Principle:** Selecting native semantic input types lets browsers expose domain-tailored mobile keypads and intelligent autocomplete suggestions automatically.

### Requirements

- **MUST** specify exact input types matching expected content (`email`, `tel`, `password`, `search`, `date`).
- **SHOULD** set `inputmode="numeric"` for numeric codes lacking arithmetic meaning — such as national IDs or one-time verification codes.
- **MUST NOT** apply `type="number"` to identifiers that preserve leading zeros — such as postal codes or phone numbers.

### Data Type & Attribute Table

| Data Type | Recommended Attributes |
| :--- | :--- |
| **Email address** | `type="email"` |
| **Phone number** | `type="tel"` |
| **Password** | `type="password"` |
| **Numeric ID / Verification code** | `type="text" inputmode="numeric"` |
| **Date and time** | `type="datetime-local"` |

**Verification:** Focusing each control on a mobile device surfaces the best-matched keyboard layout automatically.

---

## USAB-11 — Position Password Visibility Toggles Outside the Input Box Boundary

**Principle:** Floating eye buttons inside `<input>` right edges via `position: absolute` collide directly with browser password-manager icons and browser autofill badges.

### Requirements

- **MUST NOT** float password visibility buttons directly inside the `<input>` text area via absolute overlay positioning.
- **MUST** render the visibility toggle as an adjacent sibling button sitting side-by-side inside a shared visual field border.
- **MUST** implement the control using `<button type="button">` with clear accessible labels reflecting state (`Show password` / `Hide password`).
- **MUST** mask passwords by default and preserve typed input intact when toggling visibility.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Flexbox composite wrapper | Wrapper: `flex rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring focus-within:outline-hidden`; Input: `flex-1 border-0 bg-transparent`; Button: `px-3 border-l border-input` |
| **Raw CSS** | Composite password group | `.password-group { display: flex; border: 1px solid #cbd5e1; border-radius: 0.5rem; }` |

**Verification:** Browser credential icons never collide with the reveal button, and keyboard/screen-reader toggling works seamlessly.

---

## USAB-12 — Expand Drag-Handle Hit Targets Without Bloating Icons

**Principle:** Resize and reorder drag handles must be effortless to grab via touch or mouse without oversizing visible grip icons into visual clutter.

### Requirements

- **MUST** make resize or drag reorder handles straightforward to grab and drag smoothly.
- **SHOULD** expand invisible hit padding around the handle rather than blowing up icon graphics visually.
- **MUST** bind drag event listeners directly to that full enlarged interactive container rather than the tiny SVG glyph alone.
- **MUST** provide full keyboard reorder/resize alternatives for users unable to perform pointer dragging.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Expanded invisible hit padding | `relative p-3 min-h-11 min-w-11 inline-flex items-center justify-center` |
| **Raw CSS** | Hit area wrapper | `display: inline-flex; padding: 0.75rem; min-width: 44px; min-height: 44px;` |

**Verification:** Users initiate drags reliably near the grip without pixel-hunting, and keyboard alternatives operate cleanly.

---

## USAB-13 — Expose Desktop Navigation Links Directly

**Principle:** Desktop viewports offer generous space; hiding top-level navigation behind a hamburger drawer hides site structure and adds unnecessary interaction steps.

### Requirements

- **MUST NOT** conceal primary desktop navigation behind a hamburger menu whenever adequate screen width exists.
- **SHOULD** surface main navigation links immediately in a visible top bar or persistent desktop sidebar.
- **MAY** collapse navigation behind a menu button strictly at compact mobile breakpoints.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Viewport-adaptive navigation | Desktop links: `hidden md:flex items-center gap-6`; Mobile menu toggle: `md:hidden` |
| **Raw CSS** | Breakpoint visibility | Hide hamburger toggle and reveal full horizontal/vertical navigation links on desktop media queries |

**Verification:** Opening the interface on desktop immediately reveals primary links without an extra click.

---

## USAB-14 — Keep Complex Multi-Step Forms Out of Modals

**Principle:** Lengthy or multi-step forms sit uneasily inside modal dialogs, inviting cramped nested scrollbars and accidental backdrop clicks that discard user work.

### Requirements

- **SHOULD** host lengthy, multi-step, or mission-critical forms on dedicated full pages instead of modal overlays.
- **MUST** protect against accidental dismissal data loss whenever temporary forms do open in modals (unsaved-changes confirmation or draft persistence).
- **MAY** use modal dialogs only for brief, focused tasks involving one or two lightweight fields.

### Pattern Selection Table

| Task Complexity | Appropriate Presentation |
| :--- | :--- |
| **Long / multi-step / critical forms** | Dedicated route/page or full-screen workflow |
| **Quick confirmation / 1–2 simple fields** | Focused modal dialog |

**Verification:** High-stakes forms avoid nested scrolling traps and never vanish silently from an accidental stray click.

---

## USAB-15 — Never Stack Nested Modals on Top of Modals

**Principle:** Spawning dialogs on top of other open dialogs breaks spatial hierarchy, traps escape behavior unpredictably, and confuses keyboard focus management.

### Requirements

- **MUST NOT** open a second modal dialog layered on top of an already open modal during normal user flows.
- **SHOULD** step content dynamically inside the active dialog container, or cleanly close the first modal before presenting the next.
- **MUST** manage back-navigation and restore focus accurately to the original trigger upon final dismissal.

### Implementation Guidance

| Stack or Context | Recommended Pattern |
| :--- | :--- |
| **State Management** | Drive multi-step dialog views via a single step state variable inside one dialog container |
| **Accessibility** | Confine keyboard focus cleanly inside a single active modal layer at any given instant |

**Verification:** At most one active modal layer exists on screen at any point in time.

---

## USAB-16 — Order Frequent Choices First While Keeping DOM Order Aligned

**Principle:** Placing the most popular, recent, or contextually relevant options at the top of selection lists reduces scanning and scrolling time dramatically.

### Requirements

- **SHOULD** list top, recent, or contextually preferred options at the start of selection lists.
- **SHOULD** keep all remaining choices accessible further down rather than hiding or dropping them.
- **MUST** sort rendered DOM order to match visual order so screen readers track positions accurately.
- **MUST NOT** reorder items visually via CSS `order` in conflict with natural keyboard Tab sequence.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Data Ordering** | Sort backing array pre-render | Place popular/recent items at array head followed by alphabetical remainder |
| **Tailwind CSS** | Natural DOM list stack | `flex flex-col gap-2` rendered straight in DOM sequence |

**Verification:** Keyboard Tab traversal marches through options in exact top-to-bottom visual order.

---

## USAB-17 — Warn Users When Caps Lock Is Active on Password Fields

**Principle:** Entering a masked password with Caps Lock accidentally engaged causes repeated failed logins; live browser modifier detection prevents unnecessary lockouts.

### Requirements

- **SHOULD** display a clear inline warning beside password inputs whenever Caps Lock state is detected as active.
- **MUST** combine explicit text messaging with an indicator icon rather than relying solely on warning colors.
- **MUST** clear the warning automatically as soon as Caps Lock toggles off or focus leaves the password field.
- **MUST NOT** guess Caps Lock state from uppercase letters; query real browser keyboard modifier state directly.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Inline status alert | `<p id="caps-warning" role="status" class="text-sm text-amber-600 dark:text-amber-400 mt-1">...</p>` |
| **JavaScript** | Live modifier state detection | `input.addEventListener('keyup', (e) => { warning.textContent = e.getModifierState('CapsLock') ? 'Caps Lock is currently on' : ''; });` |

**Verification:** Typing in a password input with Caps Lock engaged reveals the warning immediately and clears cleanly when turned off.

---

## Reference Usability Component Examples

### Large-Target Checkbox Example for `USAB-01` and `USAB-08`

```html
<!-- Tailwind CSS -->
<label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
  <input type="checkbox" name="notifications" class="size-4 rounded text-primary focus-visible:ring-ring" />
  <span class="text-sm font-medium text-foreground">Receive email newsletter updates</span>
</label>
```

```html
<!-- Raw CSS -->
<label class="choice-container">
  <input type="checkbox" name="notifications" />
  <span>Receive email newsletter updates</span>
</label>
```

```css
.choice-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.choice-container:hover {
  background-color: #f1f5f9;
}

.choice-container:focus-within {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Independent Password Visibility Toggle Example for `USAB-11`

```html
<div class="password-field-group">
  <label for="user-password" class="block text-sm font-medium text-foreground mb-1">Password</label>
  <div class="flex overflow-hidden rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring">
    <input
      id="user-password"
      type="password"
      autocomplete="current-password"
      class="min-w-0 flex-1 px-3 py-2 outline-hidden border-0 bg-transparent text-foreground placeholder:text-muted-foreground"
    />
    <button
      type="button"
      id="toggle-password"
      aria-label="Show password"
      class="min-h-11 shrink-0 border-l border-input px-4 bg-muted hover:bg-muted/80 text-sm font-medium text-foreground"
    >
      Show
    </button>
  </div>
  <p id="caps-warning" role="status" class="text-sm text-amber-600 dark:text-amber-400 mt-1" hidden></p>
</div>
```

---

## Pre-Delivery Checklist

- [ ] **USAB-01:** Every input displays a visible persistent label that moves focus when clicked.
- [ ] **USAB-02:** Filtered states indicate exact active counts and offer an accessible reset control.
- [ ] **USAB-03:** Interactive controls carry clear click cues, hover feedback, and visible focus rings.
- [ ] **USAB-04:** Menu rows expose descriptive titles with full-row click/tap targets.
- [ ] **USAB-05:** Search fields surface functional Clear buttons with focus return once populated.
- [ ] **USAB-06:** Range slider values sit cleanly above touch tracks rather than beneath fingers.
- [ ] **USAB-07:** Small option sets (`2–5` choices) display visibly rather than inside dropdowns.
- [ ] **USAB-08:** Touch hit targets enforce at least `44 x 44 px` on mobile interfaces.
- [ ] **USAB-09:** Common input presets populate editable controls smoothly.
- [ ] **USAB-10:** Semantic input `type` and `inputmode` trigger optimal mobile keypads.
- [ ] **USAB-11:** Password reveal buttons sit as sibling controls outside the input text box.
- [ ] **USAB-12:** Drag handles expand invisible hit padding and offer keyboard fallback controls.
- [ ] **USAB-13:** Primary desktop navigation displays immediately without desktop hamburger menus.
- [ ] **USAB-14:** Complex multi-step forms live on dedicated pages rather than cramped modals.
- [ ] **USAB-15:** Stacked nested modal dialogs never appear simultaneously.
- [ ] **USAB-16:** Popular choices lead lists cleanly while keeping DOM order matched to keyboard Tab order.
- [ ] **USAB-17:** Caps Lock warnings surface live beside password fields and clear when toggled off.
