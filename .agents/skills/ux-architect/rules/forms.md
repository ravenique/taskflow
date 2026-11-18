---
title: Forms UX Rules
description: Actionable form design and implementation rules for UX Architect agents using semantic HTML, Tailwind CSS, Raw CSS, and JavaScript.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [forms, inputs, validation, layout, accessibility, error-handling]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Form Design and Implementation

> **Scope:** Apply these rules whenever designing, building, reviewing, or refactoring forms, input controls, validation flows, and submission feedback.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## FORM-01 — Spacing Between Input Field Groups

**Principle:** A field's label, input control, helper note, and validation message must sit noticeably tighter together than neighboring field groups so users never misread which label owns which input.

### Requirements

- **MUST** position each label closer to its own input control than to the preceding input group.
- **MUST** space distinct field groups far enough apart to reveal clear group boundaries.
- **MUST** keep helper text and validation errors visually enclosed within their own field group.
- **SHOULD** apply a consistent spacing token scale rather than arbitrary ad-hoc margins.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Stepped inner vs. outer spacing | Inside field group: `flex flex-col gap-2`; Between groups: `flex flex-col gap-6` |
| **Raw CSS** | Flexbox & Grid spacing scale | Inside field group: `display: flex; flex-direction: column; gap: 0.5rem;`; Between groups: `gap: 1.5rem;` |

**Verification:** Rapidly scanning down the form lets anyone pair every label cleanly with its own input at a glance.

---

## FORM-02 — Copy-to-Clipboard Controls

**Principle:** Frequently reused data — such as reference IDs, account numbers, API keys, or invite links — should include a reliable copy button right beside the value.

### Requirements

- **SHOULD** provide a copy control next to values users commonly copy and paste elsewhere.
- **MUST** assign an explicit accessible label to icon-only copy buttons.
- **MUST** copy the exact complete underlying string rather than visually truncated text.
- **MUST** announce success or failure strictly *after* the clipboard write completes, never optimistically before resolution.
- **SHOULD** provide a graceful manual fallback when browser permissions restrict automatic clipboard access.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Aligned inline copy button | `inline-flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden` |
| **Raw CSS** | Inline flex with focus indicator | `display: inline-flex; align-items: center; gap: 0.5rem;` |
| **JavaScript** | Clipboard API handling | Call `navigator.clipboard.writeText(value)` with error handling and live status updates |

**Verification:** Activating copy places the intact raw value into the clipboard and surfaces audible/visible status feedback.

---

## FORM-03 — Multi-Column Form Arrangement

**Principle:** Overall form flow should progress straight top-to-bottom in a single column; side-by-side fields belong only to inputs that inherently form one logical unit.

### Requirements

- **MUST** preserve a single-column vertical flow for primary form progression.
- **MAY** pair two or three tightly coupled fields on one row — such as first + last name, date components, or city / state / postal code.
- **MUST NOT** split unrelated fields into two columns merely to shorten vertical page height.
- **SHOULD** collapse paired horizontal rows cleanly to a single vertical column on mobile screens.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Vertical form stack + grouped row grid | Main form: `flex flex-col gap-6`; Coupled row: `grid grid-cols-1 gap-4 sm:grid-cols-2` |
| **Raw CSS** | Vertical stack with responsive row grid | Coupled row: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;` collapsing to 1 column on mobile |

**Verification:** Eyes scan continuously downward without darting left and right across unrelated field pairs.

---

## FORM-04 — Proportion Input Widths to Expected Data

**Principle:** Input field width should hint visually at the length and type of expected content so users anticipate what to type before focusing.

### Requirements

- **SHOULD** size short-value inputs noticeably narrower than long-value inputs — such as postal codes, security CVC codes, or expiry fields.
- **SHOULD** ensure email, name, street address, and general text inputs stay wide enough for users to review typed text comfortably.
- **MUST** constrain widths responsively on narrow mobile screens to avoid horizontal overflow.
- **MUST NOT** stretch short numeric fields across full wide containers merely because extra horizontal space is available.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Content-aware `max-width` | Standard fields: `w-full max-w-md`; Short codes: `w-full max-w-32` |
| **Raw CSS** | Bounded responsive width | `width: 100%; max-width: 8rem; box-sizing: border-box;` |

**Verification:** Field widths reflect realistic value lengths without clipping typed entries or stretching unnecessarily.

---

## FORM-05 — Honest Positive Validation Feedback Without False Assurance

**Principle:** Green checkmarks can lull users into assuming entered text is completely error-free when the app only validated syntactic formatting.

### Requirements

- **MUST NOT** imply an email address or phone number is typo-free merely because it passes regex syntax rules.
- **SHOULD** surface positive validation only for checks the system can genuinely verify — such as `"Username is available"` or `"All password requirements met"`.
- **MUST** state precisely what check succeeded instead of displaying vague `"Valid"` messages.
- **MUST** represent asynchronous validation states distinctly — checking, verified available, invalid format, or verification unavailable.
- **MUST NOT** signal state solely via green borders or checkmark icons without descriptive text.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Semantic state color + descriptive status | `text-emerald-600 dark:text-emerald-400 border-emerald-500` paired with explicit status copy |
| **Raw CSS** | State attribute selector | `[data-state="verified"]` paired with an explicit status message element |

**Verification:** Status copy states accurately what was verified without overpromising accuracy the system cannot check.

---

## FORM-06 — Place Error Messages Directly Adjacent to Inputs

**Principle:** Users fix mistakes right where they occur; placing error messages adjacent to the invalid field eliminates working-memory strain.

### Requirements

- **MUST** show field-level error messages directly beside or beneath the specific invalid field rather than isolating them exclusively in a top or bottom summary banner.
- **MUST** phrase errors constructively to explain clearly how to resolve the issue.
- **MUST** link inputs programmatically to their error text using `aria-describedby` and mark `aria-invalid="true"`.
- **MUST NOT** communicate errors solely with red borders.
- **SHOULD** preserve the user's entered input on failure rather than wiping the field clean.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | ARIA-driven error styling | `aria-invalid:border-destructive text-sm text-destructive` |
| **Raw CSS** | Invalid attribute selector | `input[aria-invalid="true"] { border-color: #e11d48; }` |
| **HTML & A11y** | Accessible error binding | `<input aria-describedby="email-error" aria-invalid="true">` |

**Verification:** Errors tell users clearly what to fix, and screen readers announce the bound error immediately upon focusing the input.

---

## FORM-07 — Never Hide Essential Input Instructions

**Principle:** Critical constraints required to fill out a field correctly must stay visible by default — users should never hunt inside `?` tooltips or hover hints.

### Requirements

- **MUST** render mandatory entry hints visibly by default directly below the field label or input control.
- **MUST NOT** bury essential requirements inside hover-only triggers inaccessible on touchscreens.
- **MUST** keep instructions perceivable for keyboard navigation and screen readers.
- **MAY** tuck only optional deep background explanations inside expandable disclosures for advanced users.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Always-visible helper note | `<p id="hint" class="text-sm text-muted-foreground">...</p>` |
| **Raw CSS** | Helper typography style | `.field-hint { display: block; font-size: 0.875rem; color: #475569; }` |

**Verification:** All essential formatting instructions are readable immediately without hovering, clicking icons, or switching devices.

---

## FORM-08 — Never Use Placeholder Text as a Field Label

**Principle:** Placeholder text vanishes the instant typing starts, robbing users of context and making pre-submit review error-prone.

### Requirements

- **MUST** provide a persistent, visible label for every input field.
- **MUST** link labels programmatically to inputs via matching `for` and `id` attributes.
- **MUST NOT** replace visible `<label>` elements with `placeholder` text or hide labels purely for visual minimalism.
- **MAY** use placeholders strictly for optional short format examples, never for critical instructions.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **HTML & A11y** | Semantic label-control association | `<label for="username">Username</label><input id="username" name="username">` |
| **Tailwind CSS** | Persistent top label spacing | `block text-sm font-medium text-foreground mb-1.5` |
| **Raw CSS** | Block label styling | `.field-label { display: block; margin-bottom: 0.375rem; font-weight: 500; }` |

**Verification:** Typing inside any control keeps its descriptive label clearly visible above or beside the input.

---

## FORM-09 — Avoid Disabling Submit Buttons Purely for Incomplete Fields

**Principle:** Silently disabling the submit button leaves users guessing what is missing; keeping submission enabled lets validation highlight exact gaps immediately.

### Requirements

- **SHOULD** keep submit controls active so submitting incomplete forms surfaces exact inline errors on missing fields.
- **MUST** display unambiguous inline feedback whenever an incomplete form is submitted.
- **MUST NOT** gray out submit buttons silently without explaining unmet prerequisites.
- **MAY** disable submission temporarily only for compact single-step typed confirmations (e.g., typing a project name to delete).
- **MAY** disable the button during active async submission (`loading`) to prevent duplicate requests.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Active ready submit button | `bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` |
| **Raw CSS** | Primary submit control | Style button as interactive by default; reserve `:disabled` strictly for in-flight request states |

**Verification:** Submitting an incomplete form reliably pinpoints every missing or invalid field for immediate correction.

---

## FORM-10 — Toggle Switches vs. Checkboxes

**Principle:** Switches signal settings that take effect immediately upon toggle, whereas checkboxes select form choices committed when the user submits.

### Requirements

- **MUST** use toggle switches for preferences applied instantaneously on interaction.
- **MUST** use checkboxes for options or consent items saved only upon submitting a form.
- **MUST NOT** embed switches inside deferred forms that require clicking a bottom Save button to apply changes.
- **MUST** handle loading and failure rollback states cleanly for instant-effect switches.

### Control Selection Table

| Behavior Timing | Correct Component | Semantic Role |
| :--- | :--- | :--- |
| **Takes effect immediately** | Toggle switch | `<button role="switch" aria-checked="true">` or accessible switch primitive |
| **Saved on form submission** | Checkbox | `<input type="checkbox">` paired with explicit `<label>` |

**Verification:** Control mechanics match exact persistence timing (`instant` vs. `deferred submit`).

---

## FORM-11 — Never Truncate Typed or Pasted Text Silently

**Principle:** Abruptly blocking input or silently clipping pasted text frustrates users and risks corrupting important submitted information.

### Requirements

- **MUST NOT** trim overflowing pasted text silently without notifying the user.
- **SHOULD** accept excess text cleanly and warn clearly how many characters exceed the limit alongside how to trim it.
- **MUST** surface maximum character limits up front before or during entry.
- **MUST** retain all entered content so users can edit and condense it themselves intentionally.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Overflow validation state | Warning copy: `text-destructive text-sm`; Control: `aria-invalid:border-destructive` |
| **JavaScript** | Soft character check | Validate length and display excess count rather than letting `maxlength` clip pasted text silently |

**Verification:** Pasting over-length text preserves every word intact and tells the user the exact excess character count to remove.

---

## FORM-12 — Handle Character Overages Cleanly in Textareas

**Principle:** When multi-line input exceeds length rules, display how much overage remains and let users edit freely before submitting.

### Requirements

- **MUST** alert users unambiguously when text surpasses the allowed character limit.
- **SHOULD** show a live remaining or exceeded character counter updating as users type.
- **MUST** place the counter in an unobstructed spot, such as immediately below the textarea.
- **MUST NOT** communicate limits exclusively via color bars or red borders without explicit numeric counts.
- **MUST** leave user text untouched so they control edits directly.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Helper + counter footer | `<div class="flex justify-between text-sm text-muted-foreground mt-1"><span>Guidelines</span><span>120/100</span></div>` |
| **JavaScript** | Live counter update | Track character count and update live status text dynamically |

**Verification:** Character counts update live as characters change and alert clearly when crossing limits.

---

## FORM-13 — Progressive Disclosure for Advanced Form Options

**Principle:** Present essential fields first and tuck rarely used advanced settings behind explicit toggles to reduce initial visual clutter.

### Requirements

- **SHOULD** collapse optional or specialized configuration sections by default.
- **MUST** offer a clearly labeled disclosure control such as `"Additional options"` or `"Advanced settings"`.
- **MUST** preserve values already entered inside collapsed sections if closed and reopened, unless the user explicitly resets them.
- **MUST** communicate expansion state accurately via `aria-expanded` on toggle controls.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **HTML & A11y** | Native disclosure or expanded trigger | `<details><summary>Additional options</summary>...</details>` or `<button aria-expanded="false">` |
| **Tailwind CSS** | State visibility control | Manage collapsed panels cleanly via conditional rendering or `hidden` |

**Verification:** Keyboard Tab skips collapsed optional controls cleanly until expanded, and existing values persist.

---

## FORM-14 — Display Password Requirements Up Front and Live

**Principle:** Communicate password security requirements clearly before users start typing and provide real-time fulfillment progress as they type.

### Requirements

- **MUST** list password criteria visibly next to the password input prior to submission.
- **MUST** update rule fulfillment feedback dynamically while the user types.
- **MUST** indicate satisfied vs. pending checks using both text/icons and state, never red or green colors alone.
- **MUST NOT** wait until submit failure to reveal hidden password policies.
- **SHOULD** ensure UI rules match server-side security validation identically.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Live requirement checklist with icons | Met: `text-emerald-600 dark:text-emerald-400`; Unmet: `text-muted-foreground` paired with distinct state icons |
| **Raw CSS** | Data-attribute rule styling | `.password-rule[data-met="true"] { color: #047857; }` |

**Verification:** Typing characters updates satisfied checklist rules live with zero discrepancies against backend validation.

---

## FORM-15 — Use Outcome-Specific Submit Button Labels

**Principle:** Submit buttons should declare the concrete result of clicking them instead of vague technical verbs.

### Requirements

- **MUST** name submit buttons after specific actions — such as `"Create account"`, `"Save changes"`, `"Send invite"`, or `"Pay $45.00"`.
- **SHOULD** incorporate critical decision context like exact payment totals inside final action labels to bolster confidence.
- **MUST NOT** fall back on generic labels like `"OK"`, `"Proceed"`, or `"Submit"` whenever a concrete outcome applies.
- **MUST** ensure label wording reflects exact runtime consequences truthfully.

### Microcopy Comparison Table

| Avoid | Recommended |
| :--- | :--- |
| `OK` / `Submit` | `Create user account` |
| `Proceed` / `Continue` | `Save personal details` |
| `Send` | `Place order ($120.00)` |

**Verification:** Button text makes the exact submission outcome self-evident before clicking.

---

## FORM-16 — Scroll and Focus the First Invalid Input on Failure

**Principle:** On long forms, validation errors may lie scrolled out of view; automatically bringing the first invalid input into view and focus enables immediate correction.

### Requirements

- **MUST** scroll the viewport to the first invalid control whenever form submission validation fails.
- **MUST** move keyboard focus cleanly onto that first invalid input control.
- **SHOULD** use smooth scrolling for directional orientation while falling back to instant jump when `prefers-reduced-motion` is enabled.
- **MUST** automatically expand collapsed disclosures containing an invalid field before scrolling to it.

### Implementation Guidance

| Stack or Context | Recommended Pattern | Example Classes, Code, or Structure |
| :--- | :--- | :--- |
| **Tailwind CSS** | Sticky header clearance offset | `scroll-mt-24` on form fields |
| **Raw CSS** | Scroll top offset | `scroll-margin-top: 6rem;` |
| **JavaScript** | Coordinated focus and scroll | `firstInvalid.focus({ preventScroll: true }); firstInvalid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });` |

**Verification:** Submitting an invalid multi-section form reliably scrolls directly to and focuses the earliest invalid field.

---

## FORM-17 — Help Users Succeed on Their First Pass

**Principle:** Preventing input errors up front creates a markedly smoother experience than flagging mistakes after submission.

### Requirements

- **SHOULD** trim non-essential optional fields to lower form friction.
- **SHOULD** pre-fill known defaults cleanly while allowing users to review and edit them.
- **SHOULD** specify accurate `type`, `autocomplete`, and `inputmode` attributes so mobile devices launch tailored keyboards and autofill suggestions.
- **MUST** always let users inspect and override automatically inferred values.

### Attribute Reference Table

| Input Data Type | Recommended Attributes |
| :--- | :--- |
| **Email address** | `type="email" autocomplete="email"` |
| **Phone number** | `type="tel" autocomplete="tel"` |
| **Numeric verification code** | `inputmode="numeric" autocomplete="one-time-code"` |
| **Postal code** | `autocomplete="postal-code"` |

**Verification:** Mobile touch keyboards display domain-tailored keypads (e.g., numeric keypad for codes/phones) automatically.

---

## Reference Form Baseline Implementations

### Semantic HTML & Accessibility Baseline

```html
<form class="form-container">
  <div class="form-field">
    <label for="user-email" class="field-label">Email</label>
    <input
      id="user-email"
      name="email"
      type="email"
      autocomplete="email"
      aria-describedby="email-hint email-error"
      aria-invalid="false"
      class="field-input"
    />
    <p id="email-hint" class="field-hint">We will send your receipt to this email address.</p>
    <p id="email-error" class="field-error" hidden></p>
  </div>
  <button type="submit" class="submit-button">
    Save details
  </button>
</form>
```

### Tailwind CSS Baseline Example

```html
<form class="flex w-full max-w-xl flex-col gap-6">
  <div class="flex flex-col gap-2">
    <label for="postal-code" class="text-sm font-medium text-foreground">
      Postal code
    </label>
    <input
      id="postal-code"
      name="postalCode"
      autocomplete="postal-code"
      class="w-full max-w-36 rounded-lg border border-input px-3 py-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive"
    />
    <p class="text-sm text-muted-foreground">Enter the postal code for your shipping address.</p>
  </div>
  <button
    type="submit"
    class="self-start rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    Save shipping address
  </button>
</form>
```

---

## Pre-Delivery Checklist

- [ ] **FORM-01:** Field spacing tightens within groups and separates clearly between groups.
- [ ] **FORM-02:** Copy buttons copy complete raw values and announce completion accurately.
- [ ] **FORM-03:** Main form progression stays single-column, pairing only truly unified inputs.
- [ ] **FORM-04:** Input widths reflect realistic expected value lengths.
- [ ] **FORM-05:** Positive feedback strictly confirms verified checks without promising typo-free accuracy.
- [ ] **FORM-06:** Validation errors appear adjacent to invalid fields and bind via ARIA attributes.
- [ ] **FORM-07:** Mandatory input instructions remain visible without hovering.
- [ ] **FORM-08:** Persistent visible `<label>` controls accompany every input rather than placeholder substitutes.
- [ ] **FORM-09:** Submit actions stay enabled to guide incomplete submissions unless awaiting async completion.
- [ ] **FORM-10:** Toggle switches reflect immediate persistence while checkboxes handle deferred submission.
- [ ] **FORM-11:** Oversized typed or pasted values stay intact with clear overage feedback.
- [ ] **FORM-12:** Textarea character limits display real-time counts and excess alerts visibly.
- [ ] **FORM-13:** Progressive disclosures hide advanced options without losing entered values.
- [ ] **FORM-14:** Password complexity checklists stay visible up front and update live.
- [ ] **FORM-15:** Submit button labels announce clear concrete outcomes.
- [ ] **FORM-16:** Invalid submissions automatically scroll and focus the earliest offending field.
- [ ] **FORM-17:** Semantic `type`, `autocomplete`, and `inputmode` attributes aid mobile input accuracy.
