---
title: Global UX Architect Directives and Foundations
description: Core operating contract, RFC 2119 obligation levels, decision hierarchies, cross-cutting engineering guardrails, and review workflows for all UX rules.
source: WCAG 2.2, WAI-ARIA, and Practical UI/UX Engineering Standards
scope: [ux, global, accessibility, styling, semantics, workflow]
applies_to: [tailwind-css, raw-css, html, accessibility]
---

# Global Directives and Foundations for UX Architect

> **Scope:** Shared operating contract, obligation levels, decision hierarchy, engineering guardrails, and execution workflow across every UX rule category.
> **Purpose:** Establish a consistent, accessible, performant, and trustworthy UI/UX standard for both agents and engineers.

---

## 1. Contract and RFC 2119 Obligation Levels

Apply every UX rule according to these standardized requirement levels:

- **MUST / MUST NOT**: Absolute mandates that must always be respected — such as semantic correctness, keyboard accessibility order, and state completeness. Never omit them unless an explicit technical or security constraint is documented with clear justification.
- **SHOULD / SHOULD NOT**: Standard default practices that ought to be followed. Deviations due to specific task requirements or legacy constraints require clear reasoning.
- **MAY**: Optional context-dependent choices that can be adopted when appropriate for the task.
- **AVOID**: Anti-patterns that create usability friction or harm user experience; inspect for these actively and remediate whenever encountered.

---

## 2. Decision Priority Hierarchy

Whenever aesthetic goals conflict with functional or accessibility requirements, strictly resolve trade-offs in this order:

1. **Accessibility & Semantic Correctness**
   - Keyboard operability, screen reader support, compliant color contrast ratios, and valid document structure hold the highest priority.
2. **Real Usability & Data Integrity**
   - System states, clear error communication, protection against accidental user data loss, and end-to-end task completion.
3. **Consistency with Existing Project Design System**
   - Respecting existing color tokens, spacing scales, border radii, component primitives, and interaction patterns already established in the repository.
4. **Visual Polish & Aesthetics**
   - Refinement of styling, elevation shadows, borders, or visual effects must never compromise any of the preceding levels.

---

## 3. Cross-Cutting Engineering Guardrails

### Semantics Always Come Before Styling

- Utility classes or CSS rules can never replace semantic HTML elements such as `<button>`, `<a>`, `<label>`, `<input>`, `<dialog>`, `<fieldset>`, `<legend>`, or `<main>`.
- Never use plain `<div>` or `<span>` elements as interactive buttons or navigation links without proper semantic elements, roles, keyboard handlers, and accessibility states.
- Every form control label must be programmatically associated with its control via matching `for` and `id` attributes (or explicit wrapping/ARIA labeling where standard).

### Parity Between Tailwind CSS and Raw CSS

- When writing or converting between Tailwind CSS and Raw CSS, both approaches must deliver equivalent layout, semantic structure, visual hierarchy, and interactive responsiveness.
- Never mask missing behavioral logic or state management solely with decorative CSS classes.
- *Stack & Version Note:* Tailwind examples across `./rules/` reflect Tailwind v4 and semantic design token conventions (such as `outline-hidden`, `shadow-xs`, `bg-primary`, `ring-ring`). Before implementing code, inspect the target repository's CSS version (e.g., Tailwind v3 vs. v4, CSS Modules, Sass, raw CSS) and translate utilities/tokens faithfully to match the codebase.

### Respect Existing Design Tokens

- Search for and reuse existing project tokens before inventing custom values — including color variables, spacing scales, radii, and typography scales.
- Pixel values, rem numbers, or sample utility classes in rulebooks serve as practical starting baselines, not rigid values meant to override an existing design system.

### Design for All Viewports and Real Content

- Verify layouts across compact mobile screens, tablet breakpoints, and desktop viewports.
- Test against realistic, variable-length content — including long strings, verbose languages, multi-line wrapping, and empty data states — to prevent horizontal overflow or overlapping elements.

### Accessibility and Reduced Motion Support

- Every interactive element must exhibit a clearly visible keyboard focus indicator (`focus-visible`).
- Always respect `prefers-reduced-motion` preferences by disabling or minimizing non-essential motion when requested by the user's system.
- Never rely on color alone to convey status, errors, or success; always pair color with descriptive text or unmistakable icons.

### Clear Separation of Concerns

- **Structure & Semantics:** Responsibility of HTML.
- **Layout & Visual Presentation:** Responsibility of CSS or styling utilities.
- **State, Business Logic & Side Effects:** Responsibility of JavaScript/application state or backend systems.

---

## 4. Agent Execution Workflow

Whenever assigned to design, build, refactor, or audit UI, follow these steps:

1. **Survey & Identify Issues:**
   - Inspect components, screens, or code against the relevant UX rule categories.
2. **Diagnose Real Context:**
   - Inspect existing component structure, active design tokens, and interactive behavior rather than judging solely by surface appearance.
3. **Establish Semantic Structure First:**
   - Choose proper HTML elements and DOM hierarchy before styling.
4. **Style & Handle Complete States:**
   - Apply design tokens and styles while covering every required interactive and edge state: default, hover, focus, active/selected, loading, empty, error, and disabled.
5. **Verify End-to-End Quality:**
   - Verify keyboard navigation, mobile and desktop breakpoints, color contrast, and reduced-motion behavior.
6. **Report Findings Clearly:**
   - Summarize changes or audit findings citing applicable Rule IDs alongside exact modified files/locations and verification steps.

---

## 5. Standard Audit Report Format

When presenting structured audit findings or concrete UI improvements, adapt this concise format into the user's conversation language:

```text
Rule ID: [e.g., FORM-08, VIS-01, LAY-04] (+ Primary UX Law)
Severity: [Blocker / Major / Polish]
Location: [Component, file path, or screen]
Finding: [Clear explanation of the defect and user impact]
Before: [Current code or observed behavior]
After: [Proposed code or corrected behavior]
Verification: [Concrete test or acceptance check]
```
