import type { PermissionCode, RoleScope } from "#/shared/schemas/rbac.schema";
import { Entity } from "../common/entity.base";

export interface PermissionProps {
	readonly code: PermissionCode;
	readonly scope: RoleScope;
	readonly description: string;
	readonly createdAt: Date;
}

export class Permission extends Entity<PermissionProps> {
	private constructor(id: string, props: PermissionProps) {
		super(id, props);
	}

	static reconstitute(id: string, props: PermissionProps): Permission {
		return new Permission(id, props);
	}

	get code(): PermissionCode {
		return this.props.code;
	}

	get scope(): RoleScope {
		return this.props.scope;
	}

	get description(): string {
		return this.props.description;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	belongsToScope(scope: RoleScope): boolean {
		return this.props.scope === scope;
	}
}
