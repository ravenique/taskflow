# Refactoring Catalog & Performance Lens

Self-contained decision map linking structural code smells (`SM-*`) and refactoring techniques (`RT-*`) in `./references/` to performance refactoring workflows.

Use stable IDs as shorthand during analysis and planning, then read **only** the targeted `./references/` pages required for the selected Top Priority. A structural smell is an indicator—not justification to refactor unless it blocks optimization or directly causes runtime, memory, I/O, or bundle overhead.

## Foundational Guides & Indexes

- [What Is Refactoring](./references/what-is-refactoring.md) — clean-code traits and debt reduction goals.
- [When to Refactor](./references/when-to-refactor.md) — Rule of Three and timing boundaries.
- [How to Refactor](./references/how-to-refactor.md) — small behavior-preserving steps and test safety.
- [Technical Debt](./references/technical-debt.md) — structural causes of slowdowns and brittle hot paths.
- [Code Smell Index](./references/code-smell/index.md) — full directory of all 23 smells (`SM-*`).
- [Refactoring Techniques Index](./references/techniques/index.md) — full directory of all 66 techniques (`RT-*`).

## Paradigm Translation Rule

The reference pages use object-oriented examples (`class`, `method`, `inheritance`). Always adapt the underlying structural mechanism to the target repository's paradigm and architectural boundaries:

- **Class / Field / Method** → cohesive module, struct, service, React component/hook, query repository, or pure function + state.
- **Extract Class / Move Method** → extract cohesive module, separate I/O boundary from pure logic, or colocate data transformation with its data owner.
- **Polymorphism / Strategy** → lookup map, dispatch table, discriminated union, interface/trait, or function composition when simpler than a class hierarchy.
- **Guard Clauses / Early Exit** → validate preconditions and skip expensive work before loops, allocations, serialization, or database/network calls.

## Performance Lens

### 1. Direct Performance Levers & Overhead Reducers

| ID           | Pattern / Smell                                                                                                                | Performance mechanism on hot paths                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `RT-COM-009` | [Substitute Algorithm](./references/techniques/composing-methods/substitute-algorithm.md)                                      | Replace slow complexity (e.g., nested $O(n^2)$ scans) or heavy custom logic with optimal structures. |
| `RT-CON-005` | [Guard Clauses](./references/techniques/simplifying-conditional-expressions/replace-nested-conditional-with-guard-clauses.md)    | Fail fast or return early before allocating buffers, serializing payloads, or triggering I/O.        |
| `RT-COM-002` | [Inline Method](./references/techniques/composing-methods/inline-method.md)                                                    | Remove trivial call-wrapper indirection inside tight loops when abstraction hides no real boundary.  |
| `RT-MOV-004` | [Inline Class](./references/techniques/moving-features-between-objects/inline-class.md)                                        | Collapse near-empty wrapper allocations on high-frequency object creation paths.                     |
| `RT-MOV-006` | [Remove Middle Man](./references/techniques/moving-features-between-objects/remove-middle-man.md)                              | Bypass pass-through delegation layers adding redundant hops, wrappers, or allocations.               |
| `RT-DAT-015` | [Replace Subclass with Fields](./references/techniques/organizing-data/replace-subclass-with-fields.md)                        | Flatten tiny constant-only hierarchies into direct field/enum data.                                    |
| `RT-GEN-009` | [Collapse Hierarchy](./references/techniques/dealing-with-generalization/collapse-hierarchy.md)                                | Merge redundant inheritance layers that inflate bundle size or dynamic dispatch.                     |
| `RT-DAT-003` | [Change Value to Reference](./references/techniques/organizing-data/change-value-to-reference.md)                              | Share canonical immutable instances instead of allocating repeated identical copies.                 |
| `SM-DIS-004` | [Dead Code](./references/code-smell/dispensables/dead-code.md)                                                                 | Strip unreachable branches, stale listeners, unused imports, or unreferenced assets/bundles.         |
| `SM-DIS-005` / `SM-DIS-006` | [Lazy Class](./references/code-smell/dispensables/lazy-class.md) / [Speculative Generality](./references/code-smell/dispensables/speculative-generality.md) | Remove over-abstracted wrappers, unused hooks, or speculative layers inflating runtime or bundle. |

### 2. Preparatory Structural Enablers (Untangle Before Optimizing)

| ID           | Smell                                                                               | Why it blocks optimization & how to unblock                                                       |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `SM-BLO-001` | [Long Method](./references/code-smell/bloaters/long-method.md)                      | Isolates slow computation or repeated I/O via `RT-COM-001` / `RT-CON-001` before optimizing it.   |
| `SM-BLO-002` | [Large Class](./references/code-smell/bloaters/large-class.md)                      | Splits hot-path responsibilities via `RT-MOV-003` so caching, pooling, or batching stays scoped.  |
| `SM-CPL-001` | [Feature Envy](./references/code-smell/couplers/feature-envy.md)                    | Moves repeated data processing next to its collection/query owner via `RT-MOV-001` to enable batching. |
| `SM-CPL-003` | [Message Chains](./references/code-smell/couplers/message-chains.md)                | Replaces chatty deep traversal with a single boundary facade/aggregated fetch (`RT-MOV-005`).     |
| `SM-CHG-001` | [Divergent Change](./references/code-smell/change-preventers/divergent-change.md)   | Separates unrelated hot/cold paths so critical paths can be tuned independently.                  |
| `SM-CHG-003` | [Shotgun Surgery](./references/code-smell/change-preventers/shotgun-surgery.md)     | Consolidates scattered query, caching, or serialization steps into one optimizable boundary.      |

### 3. Hot-Path Caution Traps (Read Before Applying on Performance-Critical Paths)

| ID           | Technique                                                                                      | Risk on hot paths (documented in `./references/`)                                                   |
| ------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `RT-COM-005` | [Replace Temp with Query](./references/techniques/composing-methods/replace-temp-with-query.md)| Turns a cached local result into repeated function/query calls; avoid around expensive computations.|
| `RT-COM-003` | [Extract Variable](./references/techniques/composing-methods/extract-variable.md)              | Breaks short-circuit evaluation (`a() \|\| b()`), executing heavyweight branches unconditionally.    |
| `RT-COM-004` | [Inline Temp](./references/techniques/composing-methods/inline-temp.md)                        | Eliminates a temp caching an expensive reused computation, causing repeated recalculation.          |
| `RT-DAT-010` | [Encapsulate Field](./references/techniques/organizing-data/encapsulate-field.md)              | Can add accessor/allocation overhead inside ultra-tight numeric or rendering loops; measure first.  |
| `RT-CAL-008` | [Replace Parameter with Method Call](./references/techniques/simplifying-method-calls/replace-parameter-with-method-call.md) | May trigger hidden repeated queries or I/O if the callee calls an uncached lookup per iteration. |

## Complete Smell-to-Technique Routing (All 23 Smells)

| ID           | Smell & Reference                                                                                              | First Technique Candidates                                                                                                       | Do Not Do Automatically                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `SM-BLO-001` | [Long Method](./references/code-smell/bloaters/long-method.md)                                                 | `RT-COM-001` Extract Method, `RT-COM-003` Extract Variable, `RT-CON-001` Decompose Conditional, `RT-CON-005` Guard Clauses       | Split into helpers that only hide the same tangled responsibility or break short-circuiting |
| `SM-BLO-002` | [Large Class](./references/code-smell/bloaters/large-class.md)                                                 | `RT-MOV-003` Extract Class, `RT-GEN-006` Extract Subclass, `RT-GEN-008` Extract Interface, `RT-DAT-006` Duplicate Observed Data  | Move code without establishing clear data/lifecycle ownership                        |
| `SM-BLO-003` | [Primitive Obsession](./references/code-smell/bloaters/primitive-obsession.md)                                 | `RT-DAT-002` Replace Data Value with Object, `RT-DAT-012` Replace Type Code with Class, `RT-DAT-005` Replace Array with Object   | Allocate wrapper objects inside tight hot loops without an invariant benefit         |
| `SM-BLO-004` | [Long Parameter List](./references/code-smell/bloaters/long-parameter-list.md)                                 | `RT-CAL-008` Replace Parameter with Method Call, `RT-CAL-007` Preserve Whole Object, `RT-CAL-009` Introduce Parameter Object     | Wrap every argument in a generic parameter bag or trigger extra queries per call     |
| `SM-BLO-005` | [Data Clumps](./references/code-smell/bloaters/data-clumps.md)                                                 | `RT-MOV-003` Extract Class, `RT-CAL-009` Introduce Parameter Object, `RT-CAL-007` Preserve Whole Object                          | Create unowned data structs detached from operations                                 |
| `SM-OOA-001` | [Alternative Classes with Different Interfaces](./references/code-smell/object-orientation-abusers/alternative-classes-with-different-interfaces.md) | `RT-CAL-001` Rename Method, `RT-CAL-002` Add Parameter, `RT-MOV-001` Move Method, `RT-GEN-007` Extract Superclass    | Merge external adapters that wrap genuinely distinct external protocols              |
| `SM-OOA-002` | [Refused Bequest](./references/code-smell/object-orientation-abusers/refused-bequest.md)                       | `RT-GEN-011` Replace Inheritance with Delegation, `RT-GEN-007` Extract Superclass, `RT-GEN-004` / `RT-GEN-005` Push Down       | Break established public subtype contracts without checking callers                  |
| `SM-OOA-003` | [Switch Statements](./references/code-smell/object-orientation-abusers/switch-statements.md)                   | `RT-CON-006` Replace Conditional with Polymorphism, `RT-DAT-014` State/Strategy, `RT-CAL-006` Explicit Methods                   | Build a class hierarchy for a small, stable conditional or fast dispatch table       |
| `SM-OOA-004` | [Temporary Field](./references/code-smell/object-orientation-abusers/temporary-field.md)                       | `RT-MOV-003` Extract Class, `RT-COM-008` Replace Method with Method Object, `RT-CON-007` Introduce Null Object                   | Hide lifecycle bugs by silently masking invalid uninitialized state                  |
| `SM-CHG-001` | [Divergent Change](./references/code-smell/change-preventers/divergent-change.md)                              | `RT-MOV-003` Extract Class, `RT-GEN-007` Extract Superclass, `RT-GEN-006` Extract Subclass                                       | Split cohesive operations across excessive tiny files                                |
| `SM-CHG-002` | [Parallel Inheritance Hierarchies](./references/code-smell/change-preventers/parallel-inheritance-hierarchies.md) | `RT-MOV-001` Move Method, `RT-MOV-002` Move Field                                                                             | Collapse hierarchies that represent truly independent cross-boundary layers          |
| `SM-CHG-003` | [Shotgun Surgery](./references/code-smell/change-preventers/shotgun-surgery.md)                                | `RT-MOV-001` Move Method, `RT-MOV-002` Move Field, `RT-MOV-004` Inline Class                                                     | Centralize unrelated domain concerns into a god module                               |
| `SM-DIS-001` | [Comments](./references/code-smell/dispensables/comments.md)                                                   | `RT-COM-003` Extract Variable, `RT-COM-001` Extract Method, `RT-CAL-001` Rename Method, `RT-CON-008` Introduce Assertion         | Delete non-obvious "why" comments (e.g., performance invariants or concurrency notes)|
| `SM-DIS-002` | [Duplicate Code](./references/code-smell/dispensables/duplicate-code.md)                                       | `RT-COM-001` Extract Method, `RT-GEN-002` / `RT-GEN-003` / `RT-GEN-010` Pull Up / Template Method, `RT-COM-009` Substitute Algorithm, `RT-CON-002` / `RT-CON-003` | Create an ownerless generic utility dump (such as `utils/` or `helpers/`) or couple unrelated features |
| `SM-DIS-003` | [Data Class](./references/code-smell/dispensables/data-class.md)                                               | `RT-DAT-010` / `RT-DAT-011` Encapsulate Field/Collection, `RT-MOV-001` Move Method, `RT-COM-001` Extract Method, `RT-CAL-010` Remove Setter | Force behavior into pure wire DTOs, schema records, or boundary transfer models     |
| `SM-DIS-004` | [Dead Code](./references/code-smell/dispensables/dead-code.md)                                                 | Delete unused code/files, `RT-MOV-004` Inline Class, `RT-GEN-009` Collapse Hierarchy, `RT-CAL-003` Remove Parameter              | Delete exported, generated, reflection/DI-bound, or dynamically loaded code unchecked|
| `SM-DIS-005` | [Lazy Class](./references/code-smell/dispensables/lazy-class.md)                                               | `RT-MOV-004` Inline Class, `RT-GEN-009` Collapse Hierarchy                                                                       | Remove deliberate architectural boundaries or planned extension seams without check  |
| `SM-DIS-006` | [Speculative Generality](./references/code-smell/dispensables/speculative-generality.md)                       | `RT-GEN-009` Collapse Hierarchy, `RT-MOV-004` Inline Class, `RT-COM-002` Inline Method, `RT-CAL-003` Remove Parameter            | Remove extension points actively required by plugins, public APIs, or adapters       |
| `SM-CPL-001` | [Feature Envy](./references/code-smell/couplers/feature-envy.md)                                               | `RT-MOV-001` Move Method, `RT-COM-001` Extract Method                                                                            | Move domain policy across a trust, persistence, or architectural layer boundary      |
| `SM-CPL-002` | [Inappropriate Intimacy](./references/code-smell/couplers/inappropriate-intimacy.md)                           | `RT-MOV-001` Move Method, `RT-MOV-002` Move Field, `RT-DAT-008` Unidirectional Association, `RT-GEN-012` Delegation->Inheritance | Expose internal persistence or private state across module boundaries                 |
| `SM-CPL-003` | [Message Chains](./references/code-smell/couplers/message-chains.md)                                           | `RT-MOV-005` Hide Delegate, `RT-COM-001` Extract Method + `RT-MOV-001` Move Method                                               | Hide fluent builders or relationships intentionally exposed as a public contract     |
| `SM-CPL-004` | [Middle Man](./references/code-smell/couplers/middle-man.md)                                                   | `RT-MOV-006` Remove Middle Man, `RT-COM-002` Inline Method, `RT-GEN-012` Replace Delegation with Inheritance                     | Strip security, auth, caching, proxy, or repository boundaries merely for delegating |
| `SM-OTH-001` | [Incomplete Library Class](./references/code-smell/other/incomplete-library-class.md)                          | `RT-MOV-007` Introduce Foreign Method, `RT-MOV-008` Introduce Local Extension                                                    | Patch third-party dependencies directly or build heavy wrappers for one-off helpers  |

## Safe-Refactoring Protocol

Follow this sequence whenever structural refactoring is part of an approved optimization plan (see [How to Refactor](./references/how-to-refactor.md)):

1. **Record Invariants**: Document preconditions, edge cases, and behavioral invariants before editing.
2. **Guard Behavior**: Locate existing tests or add the narrowest approved characterization/contract test covering the hot path.
3. **Transform Incrementally**: Apply one small, coherent `RT-*` step at a time—never mix feature changes with refactoring.
4. **Verify Immediately**: Run the target project's focused test, typecheck, lint, build, or timing check after each logical step.
5. **Inspect Boundaries**: Review the diff for unintended coupling, layer violations, or Hot-Path Caution Traps.
6. **Stop on Uncertainty**: If behavior, ownership, or compatibility becomes uncertain, pause and surface the deviation before proceeding.
