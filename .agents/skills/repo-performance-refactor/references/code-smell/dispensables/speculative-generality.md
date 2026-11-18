# Speculative Generality

## Signs and Symptoms

There’s an unused class, method, field or parameter.

## Reasons for the Problem

Sometimes code is created “just in case” to support anticipated future features that never get implemented. As a result, code becomes hard to understand and support.

## Treatment

- For removing unused abstract classes, try [Collapse Hierarchy](../../techniques/dealing-with-generalization/collapse-hierarchy.md).
- Unnecessary delegation of functionality to another class can be eliminated via [Inline Class](../../techniques/moving-features-between-objects/inline-class.md).
- Unused methods? Use [Inline Method](../../techniques/composing-methods/inline-method.md) to get rid of them.
- Methods with unused parameters should be given a look with the help of [Remove Parameter](../../techniques/simplifying-method-calls/remove-parameter.md).
- Unused fields can be simply deleted.

## Payoff

- Slimmer code.
- Easier support.

## When to Ignore

- If you’re working on a framework, it’s eminently reasonable to create functionality not used in the framework itself, as long as the functionality is needed by the frameworks’s users.
- Before deleting elements, make sure that they aren’t used in unit tests. This happens if tests need a way to get certain internal information from a class or perform special testing-related actions.
