# The Catalog of Design Patterns

## Creational patterns

These patterns provide various object creation mechanisms, which increase flexibility and reuse of existing code.

| ID  | Title                                                         | Description                                                                                                                                                           |
| --- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DP-CRE-001` | [Factory Method](./creational-patterns/factory-method.md)     | Provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.                                  |
| `DP-CRE-002` | [Abstract Factory](./creational-patterns/abstract-factory.md) | Lets you produce families of related objects without specifying their concrete classes.                                                                               |
| `DP-CRE-003` | [Builder](./creational-patterns/builder.md)                   | Lets you construct complex objects step by step. The pattern allows you to produce different types and representations of an object using the same construction code. |
| `DP-CRE-004` | [Prototype](./creational-patterns/prototype.md)               | Lets you copy existing objects without making your code dependent on their classes.                                                                                   |
| `DP-CRE-005` | [Singleton](./creational-patterns/singleton.md)               | Lets you ensure that a class has only one instance, while providing a global access point to this instance.                                                           |

## Structural patterns

These patterns explain how to assemble objects and classes into larger structures while keeping these structures flexible and efficient.

| ID  | Title                                           | Description                                                                                                                                                                                                                |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DP-STR-001` | [Adapter](./structural-patterns/adapter.md)     | Allows objects with incompatible interfaces to collaborate.                                                                                                                                                                |
| `DP-STR-002` | [Bridge](./structural-patterns/bridge.md)       | Lets you split a large class or a set of closely related classes into two separate hierarchies—abstraction and implementation—which can be developed independently of each other.                                          |
| `DP-STR-003` | [Composite](./structural-patterns/composite.md) | Lets you compose objects into tree structures and then work with these structures as if they were individual objects.                                                                                                      |
| `DP-STR-004` | [Decorator](./structural-patterns/decorator.md) | Lets you attach new behaviors to objects by placing these objects inside special wrapper objects that contain the behaviors.                                                                                               |
| `DP-STR-005` | [Facade](./structural-patterns/facade.md)       | Provides a simplified interface to a library, a framework, or any other complex set of classes.                                                                                                                            |
| `DP-STR-006` | [Flyweight](./structural-patterns/flyweight.md) | Lets you fit more objects into the available amount of RAM by sharing common parts of state between multiple objects instead of keeping all of the data in each object.                                                    |
| `DP-STR-007` | [Proxy](./structural-patterns/proxy.md)         | Lets you provide a substitute or placeholder for another object. A proxy controls access to the original object, allowing you to perform something either before or after the request gets through to the original object. |

## Behavioral patterns

These patterns are concerned with algorithms and the assignment of responsibilities between objects.

| ID  | Title                                                                       | Description                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DP-BEH-001` | [Chain of Responsibility](./behavioral-patterns/chain-of-responsibility.md) | Lets you pass requests along a chain of handlers. Upon receiving a request, each handler decides either to process the request or to pass it to the next handler in the chain.                                                      |
| `DP-BEH-002` | [Command](./behavioral-patterns/command.md)                                 | Turns a request into a stand-alone object that contains all information about the request. This transformation lets you pass requests as a method arguments, delay or queue a request's execution, and support undoable operations. |
| `DP-BEH-003` | [Iterator](./behavioral-patterns/iterator.md)                               | Lets you traverse elements of a collection without exposing its underlying representation (list, stack, tree, etc.).                                                                                                                |
| `DP-BEH-004` | [Mediator](./behavioral-patterns/mediator.md)                               | Lets you reduce chaotic dependencies between objects. The pattern restricts direct communications between the objects and forces them to collaborate only via a mediator object.                                                    |
| `DP-BEH-005` | [Memento](./behavioral-patterns/memento.md)                                 | Lets you save and restore the previous state of an object without revealing the details of its implementation.                                                                                                                      |
| `DP-BEH-006` | [Observer](./behavioral-patterns/observer.md)                               | Lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they're observing.                                                                                                   |
| `DP-BEH-007` | [State](./behavioral-patterns/state.md)                                     | Lets an object alter its behavior when its internal state changes. It appears as if the object changed its class.                                                                                                                   |
| `DP-BEH-008` | [Strategy](./behavioral-patterns/strategy.md)                               | Lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.                                                                                                             |
| `DP-BEH-009` | [Template Method](./behavioral-patterns/template-method.md)                 | Defines the skeleton of an algorithm in the superclass but lets subclasses override specific steps of the algorithm without changing its structure.                                                                                 |
| `DP-BEH-010` | [Visitor](./behavioral-patterns/visitor.md)                                 | Lets you separate algorithms from the objects on which they operate.                                                                                                                                                                |
