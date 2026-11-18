# Pull Up Constructor Body

## Problem

Your subclasses have constructors with code that’s mostly identical.

```ts
class Employee {
  protected name: string;
  protected id: string;
}

class Manager extends Employee {
  private grade: number;

  constructor(name: string, id: string, grade: number) {
    super();
    this.name = name;
    this.id = id;
    this.grade = grade;
  }
}
```

## Solution

Create a superclass constructor and move the code that’s the same in the subclasses to it. Call the superclass constructor in the subclass constructors.

```ts
class Employee {
  protected name: string;
  protected id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class Manager extends Employee {
  private grade: number;

  constructor(name: string, id: string, grade: number) {
    super(name, id);
    this.grade = grade;
  }
}
```

## Why Refactor

This technique is a specialized version of [Pull Up Method](./pull-up-method.md) for constructors, which cannot be inherited or overridden like ordinary methods in most object-oriented languages. Duplicated initialization logic across subclass constructors increases maintenance risk when shared invariants or setup steps change.

## Benefits

- Eliminates duplicated initialization code across subclasses.
- Centralizes shared constructor invariants and validation in the superclass.

## How to Refactor

1. Create a constructor in the superclass if one does not already exist.
2. Identify the shared initialization statements at the start of the subclass constructors and extract them into the superclass constructor.
3. Call the superclass constructor (`super(...)`) at the beginning of each subclass constructor, passing the required arguments.
4. Remove the duplicated initialization code from the subclasses and verify that shared fields can remain private or protected appropriately.
