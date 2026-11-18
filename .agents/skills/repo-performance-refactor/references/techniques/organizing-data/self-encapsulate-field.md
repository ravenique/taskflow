# Self Encapsulate Field

Self-encapsulation is distinct from ordinary [Encapsulate Field](./encapsulate-field.md): the refactoring technique given here is performed on a private field.

## Problem

You use direct access to private fields inside a class.

```ts
class Range {
  private low: number;
  private high: number;
  includes(arg: number): boolean {
    return arg >= low && arg <= high;
  }
}
```

## Solution

Create a getter and setter for the field, and use only them for accessing the field.

```ts
class Range {
  private low: number;
  private high: number;
  includes(arg: number): boolean {
    return arg >= getLow() && arg <= getHigh();
  }
  getLow(): number {
    return low;
  }
  getHigh(): number {
    return high;
  }
}
```

## Why Refactor

Sometimes directly accessing a private field inside a class just isn’t flexible enough. You want to be able to initiate a field value when the first query is made or perform certain operations on new values of the field when they’re assigned, or maybe do all this in various ways in subclasses.

## Benefits

- _Indirect access_ to fields is when a field is acted on via access methods (getters and setters). This approach is much more flexible than _direct access to fields_.
  - First, you can perform complex operations when data in the field is set or received. _Lazy initialization and validation of field_ values are easily implemented inside field getters and setters.
  - Second and more crucially, you can redefine getters and setters in subclasses.
- You have the option of not implementing a setter for a field at all. The field value will be specified only in the constructor, thus making the field unchangeable throughout the entire object lifespan.

## Drawbacks

When _direct access to fields_ is used, code looks simpler and more presentable, although flexibility is diminished.

## How to Refactor

1. Create a getter (and optional setter) for the field. They should be either `protected` or `public`.
2. Find all direct invocations of the field and replace them with getter and setter calls.
