# Design Pattern Decision Map

Self-contained architectural decision map linking all 22 design patterns (`DP-*`) in `./references/` to pragmatic feature engineering.

Consult this map **only when complexity, variation pressure, or architectural boundaries warrant structural design judgment**. Read a full pattern page only after identifying the problem and confirming that a simpler direct design is insufficient.

## Foundational Overview & Index

- [Criticism of Patterns](./references/overview/criticism-of-patterns.md) — anti-overengineering guardrails ("when all you have is a hammer").
- [What Is a Design Pattern](./references/overview/what-is-a-design-pattern.md) — blueprints vs. copy-pasted code.
- [Why Learn Patterns](./references/overview/why-learn-patterns.md) — shared architectural vocabulary.
- [History of Patterns](./references/overview/history-of-pattern.md) — background and GoF origins.
- [Full Design Patterns Index](./references/catalog/index.md) — canonical summaries of all 22 patterns.

## Paradigm Translation Rule

The catalog and conceptual `./references/catalog/<group>/examples/<slug>.md` pages use OOP/TypeScript examples (`class`, `interface`, `inheritance`). Always translate the underlying structural mechanism to fit the target repository's paradigm:

- **Strategy / Command / Factory Method** → higher-order functions, typed handler maps, factory functions, or module-level closures when lighter than classes.
- **State / Visitor** → discriminated unions / tagged enums / pattern matching over explicit state machines before introducing class hierarchies.
- **Template Method** → callback parameters, hooks, middleware pipelines, or functional composition over inheritance.
- **Decorator / Proxy** → higher-order wrappers, middleware, interceptors, or explicit boundary facades.
- **Examples policy** → treat `examples/` strictly as conceptual structure; never copy-paste external snippets without reconciling with repository conventions, versions, and security/lifecycle constraints.

## Creational Patterns

| ID           | Pattern                                                                                | Use as a candidate when                                                            | Simpler Idiomatic Alternative & Watch-Out                                                    |
| ------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `DP-CRE-001` | [Factory Method](./references/catalog/creational-patterns/factory-method.md)           | Creation varies behind a stable contract across variants or providers              | Prefer a plain factory function or registry map; avoid subclassing solely for creation       |
| `DP-CRE-002` | [Abstract Factory](./references/catalog/creational-patterns/abstract-factory.md)       | A family of mutually compatible implementations must be instantiated together        | Plain provider/bundle object passing dependencies; watch out for premature multi-family boilerplate |
| `DP-CRE-003` | [Builder](./references/catalog/creational-patterns/builder.md)                         | Construction requires ordered steps, validation stages, or distinct representations| Options/config object with defaults & schema validation; watch out for verbose fluent ceremony |
| `DP-CRE-004` | [Prototype](./references/catalog/creational-patterns/prototype.md)                     | Cloning a pre-configured template value is safer/cheaper than rebuilding from scratch| Explicit clone/factory helper; watch out for shallow-copy aliasing bugs on nested mutable state|
| `DP-CRE-005` | [Singleton](./references/catalog/creational-patterns/singleton.md)                     | A truly process-wide, stateless, or lifecycle-managed shared resource is required  | Explicit dependency injection from composition root; **red flag** in SSR, concurrent tests, and hidden mutable global state |

## Structural Patterns

| ID           | Pattern                                                                       | Use as a candidate when                                                                   | Simpler Idiomatic Alternative & Watch-Out                                                    |
| ------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `DP-STR-001` | [Adapter](./references/catalog/structural-patterns/adapter.md)                | An external, legacy, or provider contract mismatches the local domain/application boundary| Thin pure mapper/translator module; avoid wrapping stable internal interfaces unnecessarily  |
| `DP-STR-002` | [Bridge](./references/catalog/structural-patterns/bridge.md)                  | Two independent variation axes would otherwise cause a Cartesian explosion of variants    | Direct composition of two parameters/dependencies; avoid upfront when only one axis varies   |
| `DP-STR-003` | [Composite](./references/catalog/structural-patterns/composite.md)            | Tree-shaped parts and containers must obey one uniform consumer contract                  | Recursive algebraic data type + traversal function; watch out for over-generalizing flat lists|
| `DP-STR-004` | [Decorator](./references/catalog/structural-patterns/decorator.md)            | Cross-cutting behavior wraps a stable contract dynamically without altering its core       | Middleware chain or explicit wrapper function; watch out for deep stacked-wrapper debugging overhead |
| `DP-STR-005` | [Facade](./references/catalog/structural-patterns/facade.md)                  | Callers need one narrow entrypoint over a complex or chatty subsystem                     | Focused module entrypoint; watch out for letting the facade grow into a coupled god module   |
| `DP-STR-006` | [Flyweight](./references/catalog/structural-patterns/flyweight.md)            | Many objects duplicate large immutable state and memory pressure is verified              | Plain shared constant/lookup table; avoid premature memory-sharing complexity without evidence|
| `DP-STR-007` | [Proxy](./references/catalog/structural-patterns/proxy.md)                    | Access control, lazy loading, remote dispatch, or caching must sit transparently around a service | Explicit service boundary/middleware; watch out for hidden network/I/O cost behind normal-looking calls |

## Behavioral Patterns

| ID           | Pattern                                                                                  | Use as a candidate when                                                              | Simpler Idiomatic Alternative & Watch-Out                                                    |
| ------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `DP-BEH-001` | [Chain of Responsibility](./references/catalog/behavioral-patterns/chain-of-responsibility.md) | Ordered handlers inspect, transform, short-circuit, or forward a request          | Array of validator/middleware functions; watch out for silent dropped requests at chain end  |
| `DP-BEH-002` | [Command](./references/catalog/behavioral-patterns/command.md)                           | Operations need explicit serialization, queueing, retry, audit log, or undo history  | Direct function call or typed payload + handler; avoid wrapping one-off synchronous calls    |
| `DP-BEH-003` | [Iterator](./references/catalog/behavioral-patterns/iterator.md)                         | Custom/lazy traversal must decouple callers from collection internals                | Native language iterators, generators, or streams; avoid custom cursor classes when standard iteration fits |
| `DP-BEH-004` | [Mediator](./references/catalog/behavioral-patterns/mediator.md)                         | Peer components form a tangled many-to-many dependency graph needing one coordinator | Shared state container or explicit parent orchestrator; watch out for turning mediator into a god object |
| `DP-BEH-005` | [Memento](./references/catalog/behavioral-patterns/memento.md)                           | Snapshots must save/restore state without leaking internal representation            | Immutable state snapshots/deep copies; watch out for unbounded snapshot memory retention     |
| `DP-BEH-006` | [Observer](./references/catalog/behavioral-patterns/observer.md)                         | Subscribers need decoupled reaction to state changes or domain events                | Direct callback, event emitter, or explicit store; **watch out** for memory leaks, ordering surprises, and missing unsubscribe cleanup |
| `DP-BEH-007` | [State](./references/catalog/behavioral-patterns/state.md)                               | Allowed transitions and behavior depend strictly on explicit lifecycle states        | Discriminated union + transition table/switch; avoid extra classes for 2–3 simple states     |
| `DP-BEH-008` | [Strategy](./references/catalog/behavioral-patterns/strategy.md)                         | Interchangeable policies or algorithms vary independently and must swap cleanly      | First-class function parameter or dispatch map; avoid strategy classes for a tiny static branch |
| `DP-BEH-009` | [Template Method](./references/catalog/behavioral-patterns/template-method.md)           | An algorithm has a fixed skeleton with controlled variable steps                     | Higher-order function / injected step callbacks (composition is usually clearer than inheritance) |
| `DP-BEH-010` | [Visitor](./references/catalog/behavioral-patterns/visitor.md)                           | Many independent operations run over a stable, fixed node/AST structure              | Pattern matching / tagged switch on union types; watch out when new element types are added frequently |

## Selection Rules

1. **Always include "No Pattern" first.** Choose the smallest direct design that makes ownership and change pressure clear.
2. **Evidence before abstraction.** Introduce a `DP-*` pattern only when existing code or the current requirement demonstrates real variation, decoupling, lifecycle, or boundary pressure—never speculatively.
3. **Prefer idiomatic language constructs.** Functions, modules, composition, typed registries, and discriminated unions beat ceremonial class hierarchies whenever equally clear.
4. **Guard global/shared state.** Never use `Singleton` (`DP-CRE-005`) to bypass dependency injection, hide missing composition roots, or share mutable request/test state.
5. **Avoid polymorphism theater.** Never add `Strategy`, `State`, or `Visitor` just to eliminate a short, stable conditional.
6. **Name cross-boundary lifecycles.** When a pattern crosses an architectural boundary (e.g., process, worker, persistence, network, or UI/server boundary), state ownership, initialization, and cleanup explicitly.
