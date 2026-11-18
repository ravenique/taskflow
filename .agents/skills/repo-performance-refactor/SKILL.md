---
name: repo-performance-refactor
description: Systematically audit, benchmark, prioritize, and optimize repository performance—from read-only bottleneck analysis and structural hot-path assessment to user-approved refactoring, execution, validation, and before/after reporting. Use when the user asks to investigate performance, find bottlenecks, optimize compute/memory/queries/assets/network paths, or execute performance-safe structural refactoring on hot paths in any codebase.
---

# Repo Performance Refactor

Analyze any repository, isolate evidence-backed performance bottlenecks, plan the minimal high-impact fix, obtain explicit user approval, implement safely, and verify results without changing business behavior.

> Analyze broadly, execute narrowly. Preserve behavior, follow repository boundaries, and never optimize on intuition alone.

## Language & Communication Rule

- Write and maintain this skill in English, while **responding to the user and phrasing the Approval Gate question in the user's conversation language** (e.g., Thai if the user writes in Thai, English if English).
- Recognize unambiguous approval intent in any language (e.g., `"approved"`, `"proceed"`, `"go ahead"`, `"yes, implement it"`, or clear equivalents in the user's language).

## Core Operating Principle & Scope Modes

Follow this strict state machine:

**Discover & Analyze → Assess & Prioritize → Plan → User Approval Gate → Execute → Validate → Report**

1. **Mandatory User Approval Gate**: Perform read-only investigation only until the user explicitly approves the latest plan. Never modify source code, tests, configuration, dependencies, or persistent state prior to approval.
2. **One Top Priority per Cycle**: Target the single highest-value bottleneck per execution cycle unless multiple issues are technically inseparable on the same hot path.
3. **Scope-Aware Adaptation**:
   - **Repo-Wide Audit**: Inspect cross-cutting flows, score all 5 categories (`1–10` or `N/A`), rank issues in the Criticality Matrix, select 1 Top Priority, and propose a Refactoring Plan.
   - **Targeted Hot Path / File Request**: Focus Phase 1–3 narrowly on the specified path, its callers/callees, data/I/O flow, and structural blockers, then present the Refactoring Plan and Approval Gate without ceremonial repo-wide scanning.
   - **Audit-Only (Read-Only) Request**: Deliver the Performance Audit, Scorecard, and Criticality Matrix with ranked recommendations, and stop cleanly without proposing code edits unless requested.

## Phase-Bound Reference Usage (Progressive Disclosure)

This skill bundles a refactoring catalog and 95 offline reference pages. Load them **on demand**—never bulk-read unrelated files:

- **During Analysis & Planning (Phase 1–5)**: Read [./refactoring-catalog.md](./refactoring-catalog.md) to check the **Performance Lens** (Direct Levers, Preparatory Enablers, and Hot-Path Caution Traps), tag structural blockers with stable `SM-*` IDs, and select candidate `RT-*` techniques. Consult [Code Smell Index](./references/code-smell/index.md) or [Techniques Index](./references/techniques/index.md) only when mapping issues beyond the main table.
- **Before Finalizing Plan & Executing (Phase 5–6)**: Open **only** the targeted `./references/code-smell/<group>/<slug>.md` and `./references/techniques/<group>/<slug>.md` pages chosen for the Top Priority to verify `How to Refactor`, `When to Ignore`, `Drawbacks`, and `Performance` caveats.
- **During Execution (Phase 6)**: Follow the **Safe-Refactoring Protocol** in [./refactoring-catalog.md](./refactoring-catalog.md) and [How to Refactor](./references/how-to-refactor.md) (small incremental steps, tests green, no mixed feature work).
- **Paradigm Translation**: Translate OOP examples in `./references/` idiomatically to the target repository's paradigm (functions, modules, hooks, structs, traits, interfaces, or queries) without forcing unnecessary classes.

---

## Workflow

### Phase 1 — Repository Discovery & Analysis (Read-Only)

Before diagnosing bottlenecks, establish repository context dynamically—never assume stack, framework, package manager, or architecture:

1. **Governance & Boundaries**: Inspect repository rules and conventions first (`AGENTS.md`, `CLAUDE.md`, `.agents/rules/`, architecture/contributing docs) so proposed refactorings never violate local layer boundaries or style constraints.
2. **Stack & Tooling Detection**: Identify runtime, language, frameworks, dependencies, and available test, typecheck, lint, build, benchmark, query-plan, and profiling commands from manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `Makefile`, CI configs, etc.).
3. **Execution & Resource Mapping**: Trace main execution flows, hot paths, data/database access, network/API boundaries, serialization/allocations, and existing tests or observability within the requested scope.

**Evidence Discipline**:
- Never conclude a bottleneck from code style or a smell alone when deeper evidence is obtainable.
- Support findings with runtime measurements, benchmarks, profiling, query plans (`EXPLAIN`), logs, bundle stats, or static complexity/call-path analysis.
- Label every finding explicitly as **Confirmed issue**, **Strong indication**, or **Hypothesis requiring measurement**.
- Never fabricate benchmark numbers or performance metrics.

### Phase 2 — Performance Assessment

Evaluate relevant dimensions on a `1–10` scale with evidence; mark categories not present in the repository as **`N/A`** (with brief reason):

1. **Compute / Runtime Efficiency**: Algorithmic complexity, repeated computation, CPU-heavy loops, synchronous blocking on async/event loops, missed concurrency, redundant serialization/deserialization.
2. **Memory & Resource Management**: High-frequency allocations, retention/leaks, unbounded in-memory structures, missing/ineffective caching, connection/worker pools, unclosed resources.
3. **Database / Data Access**: N+1 queries, missing/unusable indexes, unindexed scans/expensive joins, excessive round trips, over-fetching, missing batching, oversized transaction boundaries, offset vs. cursor pagination.
4. **Network & Asset Delivery**: Oversized payloads, chatty sequential requests that can parallelize, missing compression/caching headers, oversized bundles/assets, latency-sensitive call chains.
5. **Maintainability & Scalability**: Structural code smells (`SM-*`) blocking optimization—tangled hot paths (`SM-BLO-001/002`), misplaced data logic (`SM-CPL-001`), chatty traversal (`SM-CPL-003`), redundant layers (`SM-CPL-004`, `SM-DIS-005/006`), or shared mutable state.

Scores aid prioritization and communication; they never replace measurement.

### Phase 3 & 4 — Criticality Matrix & Top Priority Selection

Rank findings by **Impact × Confidence × Effort × Risk**:

- **P0 — Critical**: Severe runtime/memory/cost impact or clear operational/availability risk.
- **P1 — High**: Material performance impact on important paths; clear ROI to fix.
- **P2 — Improvement**: Meaningful optimization without immediate urgency.

Record for each issue: **Problem** (include `SM-*` if structural), **Evidence**, **Impact**, **Confidence**, **Estimated Effort**, **Regression Risk**, and **Priority**. Never assign high priority merely because a change is trivial.

Select **1 Top Priority** based on expected gain, severity, evidence confidence, regression risk, effort, and dependencies, and explain why it goes first.

### Phase 5 — Refactoring Plan

Build a concrete plan before modifying any file. Include:

- **Problem & Root Cause**: Technical mechanism (and any `SM-*` structural blocker).
- **Evidence**: Exact files/paths, call chains, queries, profiler/benchmark output, or static proof.
- **Objective & Success Metrics**: Target outcome and measurable criteria (latency, throughput, query count, allocations, execution time, memory, bundle size, requests)—or explicitly state measurement gaps instead of inventing baselines.
- **Files / Components Affected**: Expected touchpoints.
- **Implementation Steps**: Ordered steps citing `RT-*` techniques where used, plus Hot-Path Caution checks from `./refactoring-catalog.md`.
- **Verification & Coverage Gap Plan**: If the hot path lacks tests or benchmark coverage, propose adding a narrow characterization/contract test and/or reproducible timing script inside the approved scope (temporary diagnostic files must be removed before completion).
- **Behavior Preservation**: Business invariants and external contracts that must stay identical.
- **Risks / Edge Cases**: Regressions, race conditions, data consistency, cache invalidation, compatibility, failure modes, and operational impact.
- **Validation & Rollback Strategy**: Exact repo commands to run after edits and how to revert safely.

---

## User Approval Gate & Handling

After presenting the analysis and plan (unless the user explicitly requested Audit-Only), **stop before editing any file** and end with a clear approval question in the user's language (e.g., *"Should I proceed with this plan?"*).

### Case A — User Approves

If the user gives clear approval to execute the latest proposed plan:
- Enter **Phase 6 (Execution)** immediately.
- Do not ask for confirmation again or repeat the plan. Treat the latest approved plan as the execution contract.

### Case B — User Gives Feedback, Objects, Questions, or Proposes an Alternative

**Do not enter Execution.** Enter **Discussion & Plan Revision**:
1. Understand the proposal/concern accurately in the context of the target repository.
2. Evaluate objectively—explain **Pros**, **Cons**, **Risks / Trade-offs**, and compare against the current plan and viable alternatives.
3. Never reject a user idea merely because it differs, and never accept it blindly if it introduces material performance or regression trade-offs.
4. Provide a clear technical recommendation with rationale.
5. Update the Refactoring Plan if the recommendation changes and ask for approval again before editing.

---

## Phase 6 — Execution & Material Plan Deviation

Before editing:
1. Check working tree state (`git status` / `git diff` when git is available) and preserve any existing uncommitted user changes.
2. Confirm internally that planned edits match the approved plan and repository conventions.

During execution:
- Edit only within approved scope; avoid unrelated refactors, speculative optimization, or over-engineering.
- Follow the **Safe-Refactoring Protocol** ([./refactoring-catalog.md](./refactoring-catalog.md)) when restructuring hot paths.
- Keep behavior identical; add abstractions only when technically justified.
- Remove any temporary diagnostic or benchmark scripts created solely for measurement before completing.

### Material Plan Deviation

If implementation reveals new facts requiring a material change—architecture change, public API break, schema/database migration, significant new dependency, major scope expansion, invalid root cause, or higher regression risk—**pause unexecuted parts**, explain findings, present revised options (`Pros / Cons / Risk / Effort / Recommendation`), and wait for approval before continuing. Minor local implementation details that preserve approved intent do not require pausing.

---

## Phase 7 — Validation Loop

After implementation, run the strongest relevant checks supported by the target repository:
1. Characterization / unit / integration / regression tests
2. Type checking, linting, and build / compilation
3. Benchmarks, profiling, query-count / `EXPLAIN` plan analysis, or bundle size checks

If validation fails because of your changes: diagnose root cause, fix, and re-run until passing or a concrete blocker is identified.

**Honesty Constraint**: Never claim performance improved without observed evidence. If runtime benchmarks cannot be executed in the environment, report improvements explicitly as *expected gains from static analysis* requiring runtime verification.

---

## Phase 8 — Completion Report & Safety Guardrails

Deliver the Completion Report summarizing changes, validation results, before/after metrics (only real observed values), remaining risks, and the suggested next priority—**never auto-execute the next priority**.

### Safety and Repository Integrity

**NEVER**:
- Discard or overwrite uncommitted user changes, reset the working tree, or force checkout.
- Commit, push, deploy, or run production database migrations unless explicitly instructed.
- Add heavy dependencies for minor optimizations or refactor unrelated code during a performance fix.

---

## Output Structures

Adapt prose, tables, and the final approval question to the user's conversation language while keeping sections crisp and complete.

### 1. Initial Analysis / Performance Audit

```markdown
# Performance Audit

## Executive Summary
...

## Performance Scorecard
| Category | Score | Key Findings |
| --- | ---: | --- |
| Compute / Runtime | X/10 or N/A | ... |
| Memory / Resources | X/10 or N/A | ... |
| Database / Data Access | X/10 or N/A | ... |
| Network / Assets | X/10 or N/A | ... |
| Maintainability / Scalability | X/10 or N/A | ... |

## Criticality Matrix
| Priority | Issue | Evidence & Confidence | Impact | Effort | Risk |
| --- | --- | --- | --- | --- | --- |
| P0/P1/P2 | ... (`SM-*` if applicable) | Confirmed / Strong / Hypothesis | ... | ... | ... |

## Top Priority
**[Selected Issue]** — *Why this first:* ...

## Refactoring Plan
- **Problem & Root Cause:** ...
- **Evidence:** ...
- **Objective & Success Metrics:** ...
- **Files / Components:** ...
- **Implementation Steps:** (cite `RT-*` techniques & caution checks where applicable)
- **Behavior Preservation:** ...
- **Risks / Edge Cases:** ...
- **Validation & Rollback:** ...

[Approval Gate question in user's language]
```
*(Omit Top Priority Implementation Plan and Approval Gate when the user explicitly requests a read-only Audit-Only report; for narrow Targeted Hot-Path requests, omit unrelated scorecard categories or mark out-of-scope categories `N/A`.)*

### 2. Discussion / Objection

```markdown
## Your Proposal
[Concise interpretation]

## Analysis & Comparison
| Approach | Pros | Cons | Risk | Effort |
| --- | --- | --- | --- | --- |
| Current Plan | ... | ... | ... | ... |
| User Proposal | ... | ... | ... | ... |
| Alternative (if applicable) | ... | ... | ... | ... |

## Recommendation
[Recommended path + rationale]

## Updated Plan
[Updated sections if changed]

[Approval Gate question in user's language]
```

### 3. Completion Report

```markdown
# Refactoring Complete

## Implemented
[What changed and the exact performance mechanism]

## Changed Files
- `path/to/file`

## Validation
- Tests: ...
- Typecheck / Lint / Build: ...
- Benchmark / Profiling / Query Plan: ...

## Before vs After
| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| ... | ... | ... | ... |

## Remaining Risks & Gaps
...

## Next Priority
[Candidate next bottleneck — do not execute automatically]
```
