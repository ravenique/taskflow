import { Entity } from "./entity.base";

export interface DomainEvent {
	readonly eventName: string;
	readonly occurredAt: Date;
}

export abstract class AggregateRoot<TProps, TId = string> extends Entity<
	TProps,
	TId
> {
	private readonly _domainEvents: DomainEvent[] = [];

	protected addDomainEvent(event: DomainEvent): void {
		this._domainEvents.push(event);
	}

	pullDomainEvents(): readonly DomainEvent[] {
		const events = [...this._domainEvents];
		this._domainEvents.length = 0;
		return events;
	}
}
