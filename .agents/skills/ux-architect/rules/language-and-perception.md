---
title: Language and Perception Rules
description: Content clarity, descriptive labeling, transparent link behavior, and readable numeric formatting using semantic HTML, Tailwind CSS, and Raw CSS.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [language, copy, perception, links, checkboxes, formatting, sorting]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# UX Rules for Language and User Perception

> **Scope:** Apply these rules to status messages, error alerts, action buttons, navigation links, checkboxes, numeric displays, and sorting controls.
> **Global Contract:** Follow RFC 2119 obligation levels, decision priorities, and workflow steps defined in [global.md](./global.md).

---

## LANG-01 — Alert Messages and Action Buttons Must Communicate Clearly

**Principle:** Communicate in natural language that users understand immediately, explain actionable next steps, and name buttons after specific outcomes.

### Requirements

- **MUST** write alert messages, progress statuses, and error notices in natural human language understandable by everyday users.
- **MUST NOT** display raw technical codes alone (such as `500` or `System Error`) without human-readable explanation.
- **MUST** provide actionable next steps when an error occurs — such as checking input, retrying later, or returning home.
- **MUST** label buttons using specific verbs and outcomes (such as `Add Task`, `Place Order`, or `View Details`) instead of vague labels.
- **SHOULD** explain system state straightforwardly without blaming the user.

### Microcopy Comparison Table

| Avoid | Recommended |
| :--- | :--- |
| `500 Internal Server Error` | `We couldn't save your changes right now. Please try again in a moment.` |
| `404 Not Found` | `We couldn't find that page. Check the web address or return to the home page.` |
| `Field cannot be empty` | `Please enter your email address.` |
| `OK` button | `Save profile changes` button |
| `Please wait...` | `Converting your video file...` |

**Verification:** Reading any alert or button label immediately tells the user what happened, what they can do next, and what clicking the button will accomplish.

---

## LANG-02 — Link Labels Must Clearly State Their Destination

**Principle:** Link text should clearly indicate its destination or resulting content even when read out of context from surrounding paragraphs.

### Requirements

- **MUST** write self-explanatory link labels that specify the topic, content, or destination directly.
- **MUST NOT** use generic standalone labels such as `Click here`, `Here`, `Read more`, or `Learn more` without context explaining where they lead.
- **SHOULD** place key distinguishing keywords near the front of the link label to enable rapid scanning.
- **SHOULD** keep visible link text aligned with what screen readers announce.

### Microcopy Comparison Table

| Avoid | Recommended |
| :--- | :--- |
| `Click here to view your account balance` | `View your account balance` |
| `Read more` | `Read the full registration steps` |
| `Click here to manage data` | `Manage your account settings` |
| `Learn more` | `Read details about our security protections` |

**Verification:** Extracting every link into an isolated list still lets a reader understand exactly where each link navigates.

---

## LANG-03 — Indicate Links That Open in a New Tab

**Principle:** Warn users in advance when activating a link opens a new browser tab or window so sudden context shifts do not disorient them.

### Requirements

- **MUST** display a clear visual indicator (such as a diagonal arrow icon) whenever a link is configured to open in a new tab.
- **MUST** apply this convention consistently to both internal and external links if they open in a new tab.
- **MUST NOT** display new-tab indicators on links that navigate within the same window.
- **SHOULD** expose the new-tab behavior to screen readers via assistive text.

### Implementation Guidance

```html
<!-- Tailwind CSS: Visible diagonal indicator plus screen-reader announcement -->
<a
  href="https://example.com/guide"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xs"
>
  Read the system user guide
  <span aria-hidden="true">↗</span>
  <span class="sr-only">(opens in a new tab)</span>
</a>
```

**Verification:** Links opening in new tabs are immediately recognizable visually and announced accurately by assistive technology, matching actual navigation behavior.

---

## LANG-04 — Checkbox Labels Must Use Positive Declarative Statements

**Principle:** Checking a box should affirm what the user wants to happen clearly, avoiding double-negative wording that causes confusion.

### Requirements

- **MUST** phrase checkbox labels as positive, affirmative statements describing the state enabled when checked.
- **MUST NOT** use negative phrasing such as `Do not send...` or `Opt out of...` that forces users to reverse-interpret checked vs. unchecked states.
- **MUST** ensure checkbox semantics match the actual boolean value persisted by the system.
- **SHOULD** describe consent choices specifically, such as receiving email newsletters or promotional alerts.

### Microcopy Comparison Table

| Avoid | Recommended |
| :--- | :--- |
| `Do not send me the newsletter` | `Send me email newsletters` |
| `I do not want special offers` | `Receive special offers and member benefits` |
| `Disable system notifications` | `Enable system notifications` |

**Verification:** Looking at a checked checkbox makes it unmistakable what the system will do without parsing negative logic.

---

## LANG-05 — Format Long Numbers into Readable Groups

**Principle:** Multi-digit numbers should be visually grouped according to data type to improve readability and prevent transcription or verification errors.

### Requirements

- **MUST** group multi-digit strings with spacing or separators whenever contiguous digits impair reading or verification.
- **MUST** choose grouping conventions appropriate to the data domain — such as card numbers, phone numbers, reference IDs, or currency totals.
- **SHOULD** display large aggregate statistics in abbreviated compact notation (e.g., `74.8K`) when exact per-digit precision is unnecessary in overview views.
- **MUST** provide a way to inspect the full exact value whenever precision is required.
- **MUST NOT** abbreviate or round values requiring strict accuracy, such as payment amounts or parcel tracking codes.

### Formatting Comparison Table

| Raw Value | Readable Display | Data Type |
| :--- | :--- | :--- |
| `123456789123` | `1234 5678 9123` | Reference ID |
| `4012888888881881` | `4012 8888 8888 1881` | Payment card number |
| `5552345678` | `555 234 5678` | Phone number |
| `74853` | `74.8K` (reveal exact value on click/inspect) | Follower count |

**Verification:** Long numbers scan and verify quickly without losing or altering underlying system values.

---

## LANG-06 — Sorting Labels Must Use User-Friendly Outcomes

**Principle:** Describe the resulting order in plain user terms instead of exposing raw database column names or technical ascending/descending jargon.

### Requirements

- **MUST** label sorting options after concrete user outcomes — such as `Most popular`, `Lowest price first`, `Highest price first`, or `Highest rated`.
- **SHOULD NOT** display raw phrasing like `Ascending`, `Descending`, or uncontextualized database abbreviations.
- **SHOULD** render small sets of sorting options directly as buttons or segmented controls rather than hiding them inside a dropdown.
- **MUST** ensure actual sort behavior matches every displayed label accurately.

### Microcopy Comparison Table

| Avoid | Recommended |
| :--- | :--- |
| `Price (ascending)` | `Lowest price first` |
| `Price (descending)` | `Highest price first` |
| `Review score high to low` | `Highest rated first` |
| `Sort options tucked inside a dropdown` | Direct buttons/tabs: `Popular · Price: Low to High · Price: High to Low · Newest` |

**Verification:** Users immediately predict how list items will reorder upon selection, and runtime sorting matches the label.

---

## Pre-Delivery Checklist

- [ ] **LANG-01:** Error and status messages use natural language with actionable next steps, and button labels state specific outcomes.
- [ ] **LANG-02:** Link labels describe their destination clearly out of context, with no vague standalone phrases.
- [ ] **LANG-03:** Links opening new tabs include visible icons and screen-reader notices matching real behavior.
- [ ] **LANG-04:** Checkboxes use positive affirmative wording with zero double negatives.
- [ ] **LANG-05:** Long numbers are formatted into readable groups while preserving access to exact values.
- [ ] **LANG-06:** Sorting labels describe intuitive user outcomes and match actual sort behavior.
