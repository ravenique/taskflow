import type {
	PermissionCode,
	RoleScope,
	SystemPermissionCode,
} from "#/shared/schemas/rbac.schema";
import { AggregateRoot } from "../common/aggregate-root.base";
import { ValidationDomainError } from "../common/errors";
import type { Permission } from "./permission.entity";
import { SYSTEM_PERMISSIONS } from "./permission-codes";
import {
	PermissionScopeMismatchError,
	SystemRoleImmutableError,
} from "./rbac.errors";

const ROLE_SLUG_PATTERN = /^[a-z][a-z0-9_]*$/;
const SUPER_ADMIN_SLUG = "super_admin";
const PROTECTED_SUPER_ADMIN_PERMISSIONS: readonly SystemPermissionCode[] = [
	SYSTEM_PERMISSIONS.ROLE_READ,
	SYSTEM_PERMISSIONS.ROLE_MANAGE,
	SYSTEM_PERMISSIONS.USER_READ,
	SYSTEM_PERMISSIONS.USER_ASSIGN_ROLE,
];

export interface RoleProps {
	readonly name: string;
	readonly slug: string;
	readonly scope: RoleScope;
	readonly description: string;
	readonly isSystem: boolean;
	readonly permissions: readonly Permission[];
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface CreateRoleParams {
	readonly name: string;
	readonly slug: string;
	readonly scope: RoleScope;
	readonly description: string;
	readonly permissions: readonly Permission[];
}

export class Role extends AggregateRoot<RoleProps> {
	private constructor(id: string, props: RoleProps) {
		super(id, props);
	}

	static create(params: CreateRoleParams): Role {
		const trimmedName = params.name.trim();
		const normalizedSlug = params.slug.trim().toLowerCase();
		const trimmedDescription = params.description.trim();

		if (trimmedName.length < 2 || trimmedName.length > 100) {
			throw new ValidationDomainError("ชื่อบทบาทต้องมีความยาวระหว่าง 2-100 ตัวอักษร");
		}
		if (!ROLE_SLUG_PATTERN.test(normalizedSlug)) {
			throw new ValidationDomainError(
				"Slug ต้องขึ้นต้นด้วยตัวอักษรพิมพ์เล็ก a-z และใช้ได้เฉพาะ a-z, 0-9 หรือ _",
			);
		}

		const validatedPermissions = Role.validatePermissionsForScope(
			params.scope,
			params.permissions,
		);

		const now = new Date();
		return new Role(crypto.randomUUID(), {
			name: trimmedName,
			slug: normalizedSlug,
			scope: params.scope,
			description: trimmedDescription,
			isSystem: false,
			permissions: validatedPermissions,
			createdAt: now,
			updatedAt: now,
		});
	}

	static reconstitute(id: string, props: RoleProps): Role {
		return new Role(id, props);
	}

	get name(): string {
		return this.props.name;
	}

	get slug(): string {
		return this.props.slug;
	}

	get scope(): RoleScope {
		return this.props.scope;
	}

	get description(): string {
		return this.props.description;
	}

	get isSystem(): boolean {
		return this.props.isSystem;
	}

	get permissions(): readonly Permission[] {
		return this.props.permissions;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	hasPermission(code: PermissionCode): boolean {
		return this.props.permissions.some(
			(permission) => permission.code === code,
		);
	}

	replacePermissions(nextPermissions: readonly Permission[]): void {
		const validatedPermissions = Role.validatePermissionsForScope(
			this.props.scope,
			nextPermissions,
		);

		if (this.props.slug === SUPER_ADMIN_SLUG) {
			const grantedCodes = new Set(
				validatedPermissions.map((permission) => permission.code),
			);
			const missingProtected = PROTECTED_SUPER_ADMIN_PERMISSIONS.some(
				(code) => !grantedCodes.has(code),
			);
			if (missingProtected) {
				throw new SystemRoleImmutableError(
					"ไม่สามารถถอดสิทธิ์หลักของ Super Admin ออกได้ (ป้องกันการล็อกตัวเองออกจากระบบ)",
				);
			}
		}

		this.props = {
			...this.props,
			permissions: validatedPermissions,
			updatedAt: new Date(),
		};
	}

	ensureDeletable(): void {
		if (this.props.isSystem) {
			throw new SystemRoleImmutableError(
				`ไม่สามารถลบ System Role ตั้งต้น '${this.props.name}' ได้`,
			);
		}
	}

	private static validatePermissionsForScope(
		scope: RoleScope,
		permissions: readonly Permission[],
	): Permission[] {
		const uniqueById = new Map<string, Permission>();

		for (const permission of permissions) {
			if (!permission.belongsToScope(scope)) {
				throw new PermissionScopeMismatchError(permission.code, scope);
			}
			uniqueById.set(permission.id, permission);
		}

		return [...uniqueById.values()];
	}
}
