# Shotgun Surgery

> Shotgun Surgery resembles [Divergent Change](./divergent-change.md) but is actually the opposite smell. Divergent Change is when many changes are made to a single class. Shotgun Surgery refers to when a single change is made to multiple classes simultaneously.

## Signs and Symptoms

Making any modifications requires that you make many small changes to many different classes.

## Reasons for the Problem

A single responsibility has been split up among a large number of classes. This can happen after overzealous application of [Divergent Change](./divergent-change.md).

Treatment

- Use [Move Method](../../techniques/moving-features-between-objects/move-method.md) and [Move Field](../../techniques/moving-features-between-objects/move-field.md) to move existing class behaviors into a single class. If there’s no class appropriate for this, create a new one.
- If moving code to the same class leaves the original classes almost empty, try to get rid of these now-redundant classes via [Inline Class](../../techniques/moving-features-between-objects/inline-class.md).

## Payoff

- Better organization.
- Less code duplication.
- Easier maintenance.
