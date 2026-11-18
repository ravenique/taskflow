# Divergent Change

> Divergent Change resembles [Shotgun Surgery](./shotgun-surgery.md) but is actually the opposite smell. Divergent Change is when many changes are made to a single class. _Shotgun Surgery_ refers to when a single change is made to multiple classes simultaneously.

## Signs and Symptoms
You find yourself having to change many unrelated methods when you make changes to a class. For example, when adding a new product type you have to change the methods for finding, displaying, and ordering products.

## Reasons for the Problem

Often these divergent modifications are due to poor program structure or "copypasta programming”.

## Treatment

- Split up the behavior of the class via [Extract Class](../../techniques/moving-features-between-objects/extract-class.md).
- If different classes have the same behavior, you may want to combine the classes through inheritance ([Extract Superclass](../../techniques/dealing-with-generalization/extract-superclass.md) and [Extract Subclass](../../techniques/dealing-with-generalization/extract-subclass.md)).

## Payoff

- Improves code organization.
- Reduces code duplication.
- Simplifies support.
