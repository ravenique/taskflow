export type DomainErrorCode =
	| "DOMAIN_VALIDATION_ERROR"
	| "NOT_FOUND"
	| "CONFLICT"
	| "FORBIDDEN"
	| "INVALID_STATE_TRANSITION";

export abstract class DomainError extends Error {
	readonly code: DomainErrorCode;

	protected constructor(message: string, code: DomainErrorCode) {
		super(message);
		this.name = new.target.name;
		this.code = code;
	}
}

export class ValidationDomainError extends DomainError {
	constructor(message: string) {
		super(message, "DOMAIN_VALIDATION_ERROR");
	}
}

export class NotFoundDomainError extends DomainError {
	constructor(message: string) {
		super(message, "NOT_FOUND");
	}
}

export class ConflictDomainError extends DomainError {
	constructor(message: string) {
		super(message, "CONFLICT");
	}
}

export class ForbiddenDomainError extends DomainError {
	constructor(message: string) {
		super(message, "FORBIDDEN");
	}
}

export class InvalidStateTransitionError extends DomainError {
	constructor(message: string) {
		super(message, "INVALID_STATE_TRANSITION");
	}
}
