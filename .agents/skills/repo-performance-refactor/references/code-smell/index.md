# Code Smells

- What? How can code "smell"??
- Well it doesn't have a nose... but it definitely can stink!

## Bloaters

Bloaters are code, methods and classes that have increased to such gargantuan proportions that they are hard to work with. Usually these smells do not crop up right away, rather they accumulate over time as the program evolves (and especially when nobody makes an effort to eradicate them).

| ID  | Title                                                    | Signs and Symptoms                                                                                                                                                                          |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SM-BLO-001` | [Long Method](./bloaters/long-method.md)                 | A method contains too many lines of code. Generally, any method longer than ten lines should make you start asking questions.                                                        |
| `SM-BLO-002` | [Large Class](./bloaters/large-class.md)                 | A class contains many fields/methods/lines of code.                                                                                                                                  |
| `SM-BLO-003` | [Primitive Obsession](./bloaters/primitive-obsession.md) | Use of primitives instead of small objects for simple tasks (such as currency, ranges, special strings for phone numbers, etc.)                                                      |
|     |                                                          | Use of constants for coding information (such as a constant `USER_ADMIN_ROLE = 1` for referring to users with administrator rights.)                                                 |
|     |                                                          | Use of string constants as field names for use in data arrays.                                                                                                                       |
| `SM-BLO-004` | [Long Parameter List](./bloaters/long-parameter-list.md) | More than three or four parameters for a method.                                                                                                                                     |
| `SM-BLO-005` | [Data Clumps](./bloaters/data-clumps.md)                 | Sometimes different parts of the code contain identical groups of variables (such as parameters for connecting to a database). These clumps should be turned into their own classes. |

## Object-Orientation Abusers

All these smells are incomplete or incorrect application of object-oriented programming principles.

| ID  | Title                                                                                                                          | Signs and Symptoms                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SM-OOA-001` | [Alternative Classes with Different Interfaces](./object-orientation-abusers/alternative-classes-with-different-interfaces.md) | Two classes perform identical functions but have different method names.                                                                                                                               |
| `SM-OOA-002` | [Refused Bequest](./object-orientation-abusers/refused-bequest.md)                                                             | If a subclass uses only some of the methods and properties inherited from its parents, the hierarchy is off-kilter. The unneeded methods may simply go unused or be redefined and give off exceptions. |
| `SM-OOA-003` | [Switch Statements](./object-orientation-abusers/switch-statements.md)                                                         | You have a complex switch operator or sequence of if statements.                                                                                                                                       |
| `SM-OOA-004` | [Temporary Field](./object-orientation-abusers/temporary-field.md)                                                             | Temporary fields get their values (and thus are needed by objects) only under certain circumstances. Outside of these circumstances, they’re empty.                                                    |

## Change Preventers

These smells mean that if you need to change something in one place in your code, you have to make many changes in other places too. Program development becomes much more complicated and expensive as a result.

| ID  | Title                                                                                       | Signs and Symptoms                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SM-CHG-001` | [Divergent Change](./change-preventers/divergent-change.md)                                 | You find yourself having to change many unrelated methods when you make changes to a class. For example, when adding a new product type you have to change the methods for finding, displaying, and ordering products. |
| `SM-CHG-002` | [Parallel Inheritance Hierarchies](./change-preventers/parallel-inheritance-hierarchies.md) | Whenever you create a subclass for a class, you find yourself needing to create a subclass for another class.                                                                                                          |
| `SM-CHG-003` | [Shotgun Surgery](./change-preventers/shotgun-surgery.md)                                   | Making any modifications requires that you make many small changes to many different classes.                                                                                                                          |

## Dispensables

A dispensable is something pointless and unneeded whose absence would make the code cleaner, more efficient and easier to understand.

| ID  | Title                                                              | Signs and Symptoms                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SM-DIS-001` | [Comments](./dispensables/comments.md)                             | A method is filled with explanatory comments.                                                                                                                                                                                                                                                        |
| `SM-DIS-002` | [Duplicate Code](./dispensables/duplicate-code.md)                 | Two code fragments look almost identical.                                                                                                                                                                                                                                                            |
| `SM-DIS-003` | [Data Class](./dispensables/data-class.md)                         | A data class refers to a class that contains only fields and crude methods for accessing them (getters and setters). These are simply containers for data used by other classes. These classes don’t contain any additional functionality and can’t independently operate on the data that they own. |
| `SM-DIS-004` | [Dead Code](./dispensables/dead-code.md)                           | A variable, parameter, field, method or class is no longer used (usually because it’s obsolete).                                                                                                                                                                                                     |
| `SM-DIS-005` | [Lazy Class](./dispensables/lazy-class.md)                         | Understanding and maintaining classes always costs time and money. So if a class doesn’t do enough to earn your attention, it should be deleted.                                                                                                                                                     |
| `SM-DIS-006` | [Speculative Generality](./dispensables/speculative-generality.md) | There’s an unused class, method, field or parameter.                                                                                                                                                                                                                                                 |

## Couplers

All the smells in this group contribute to excessive coupling between classes or show what happens if coupling is replaced by excessive delegation.

| ID  | Title                                                           | Signs and Symptoms                                                                                                                                                   |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SM-CPL-001` | [Feature Envy](./couplers/feature-envy.md)                      | A method accesses the data of another object more than its own data.                                                                                          |
| `SM-CPL-002` | [Inappropriate Intimacy](./couplers/inappropriate-intimacy.md)  | One class uses the internal fields and methods of another class.                                                                                              |
| `SM-OTH-001` | [Incomplete Library Class](./other/incomplete-library-class.md) | Sooner or later, libraries stop meeting user needs. The only solution to the problem—changing the library—is often impossible since the library is read-only. |
| `SM-CPL-003` | [Message Chains](./couplers/message-chains.md)                  | In code you see a series of calls resembling `$a->b()->c()->d()`                                                                                              |
| `SM-CPL-004` | [Middle Man](./couplers/middle-man.md)                          | If a class performs only one action, delegating work to another class, why does it exist at all?                                                              |
