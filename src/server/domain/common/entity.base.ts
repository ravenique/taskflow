export abstract class Entity<TProps, TId = string> {
	protected readonly _id: TId;
	protected props: TProps;

	protected constructor(id: TId, props: TProps) {
		this._id = id;
		this.props = props;
	}

	get id(): TId {
		return this._id;
	}

	equals(other?: Entity<TProps, TId>): boolean {
		if (!other) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (other.constructor !== this.constructor) {
			return false;
		}
		return this._id === other._id;
	}
}
