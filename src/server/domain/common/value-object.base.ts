function isPlainObject(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		!(value instanceof Date) &&
		!Array.isArray(value)
	);
}

function areValuesEqual(left: unknown, right: unknown): boolean {
	if (Object.is(left, right)) {
		return true;
	}

	if (left instanceof Date && right instanceof Date) {
		return left.getTime() === right.getTime();
	}

	if (Array.isArray(left) && Array.isArray(right)) {
		if (left.length !== right.length) {
			return false;
		}
		return left.every((item, index) => areValuesEqual(item, right[index]));
	}

	if (isPlainObject(left) && isPlainObject(right)) {
		const leftKeys = Object.keys(left);
		const rightKeys = Object.keys(right);
		if (leftKeys.length !== rightKeys.length) {
			return false;
		}
		return leftKeys.every(
			(key) =>
				Object.hasOwn(right, key) && areValuesEqual(left[key], right[key]),
		);
	}

	return false;
}

export abstract class ValueObject<TProps extends object> {
	protected readonly props: Readonly<TProps>;

	protected constructor(props: TProps) {
		this.props = Object.freeze({ ...props });
	}

	equals(other?: ValueObject<TProps>): boolean {
		if (!other) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (other.constructor !== this.constructor) {
			return false;
		}
		return areValuesEqual(this.props, other.props);
	}
}
