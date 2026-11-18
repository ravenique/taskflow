import { APIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import type { IAuthGateway } from "#/server/application/auth/auth-gateway.interface";
import {
	ConflictDomainError,
	ForbiddenDomainError,
	ValidationDomainError,
} from "#/server/domain/common/errors";
import { db } from "#/server/infrastructure/drizzle/db";
import {
	permissions,
	rolePermissions,
	roles,
	userRoles,
} from "#/server/infrastructure/drizzle/schema";
import type {
	AuthUserDto,
	CurrentSessionResultDto,
	SignInInput,
	SignUpInput,
} from "#/shared/schemas/auth.schema";
import { auth } from "./better-auth";

interface RawAuthUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string | null;
}

export class BetterAuthGateway implements IAuthGateway {
	async getSession(headers: Headers): Promise<CurrentSessionResultDto> {
		const result = await auth.api.getSession({ headers });
		if (!result) {
			return null;
		}

		const userDto = await this.buildAuthUserDto(result.user);

		return {
			user: userDto,
			session: {
				id: result.session.id,
				userId: result.session.userId,
				expiresAt: result.session.expiresAt.toISOString(),
			},
		};
	}

	async signInWithEmail(
		input: SignInInput,
		headers: Headers,
	): Promise<AuthUserDto> {
		try {
			const result = await auth.api.signInEmail({
				body: {
					email: input.email,
					password: input.password,
				},
				headers,
			});

			return this.buildAuthUserDto(result.user);
		} catch (error) {
			throw this.mapAuthError(error, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
		}
	}

	async signUpWithEmail(
		input: SignUpInput,
		headers: Headers,
	): Promise<AuthUserDto> {
		try {
			const result = await auth.api.signUpEmail({
				body: {
					name: input.name,
					email: input.email,
					password: input.password,
				},
				headers,
			});

			return this.buildAuthUserDto(result.user);
		} catch (error) {
			throw this.mapAuthError(error, "ไม่สามารถสร้างบัญชีผู้ใช้งานได้");
		}
	}

	async signOut(headers: Headers): Promise<void> {
		try {
			await auth.api.signOut({ headers });
		} catch (error) {
			throw this.mapAuthError(error, "ไม่สามารถออกจากระบบได้");
		}
	}

	async handleHttpRequest(request: Request): Promise<Response> {
		return auth.handler(request);
	}

	private async buildAuthUserDto(rawUser: RawAuthUser): Promise<AuthUserDto> {
		const { systemRoles, systemPermissions } = await this.loadUserSystemAccess(
			rawUser.id,
		);

		return {
			id: rawUser.id,
			name: rawUser.name,
			email: rawUser.email,
			emailVerified: rawUser.emailVerified,
			image: rawUser.image ?? null,
			systemRoles,
			systemPermissions,
		};
	}

	private async loadUserSystemAccess(userId: string): Promise<{
		systemRoles: string[];
		systemPermissions: string[];
	}> {
		const rows = await db
			.select({
				roleSlug: roles.slug,
				permissionCode: permissions.code,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
			.leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.where(and(eq(userRoles.userId, userId), eq(roles.scope, "system")));

		const roleSet = new Set<string>();
		const permissionSet = new Set<string>();

		for (const row of rows) {
			roleSet.add(row.roleSlug);
			if (row.permissionCode) {
				permissionSet.add(row.permissionCode);
			}
		}

		return {
			systemRoles: [...roleSet].sort(),
			systemPermissions: [...permissionSet].sort(),
		};
	}

	private mapAuthError(error: unknown, fallbackMessage: string): Error {
		if (error instanceof APIError) {
			if (error.statusCode === 401) {
				return new ForbiddenDomainError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
			}
			if (error.statusCode === 409 || error.statusCode === 422) {
				return new ConflictDomainError(
					error.message || "อีเมลนี้ถูกใช้งานในระบบแล้ว",
				);
			}
			return new ValidationDomainError(error.message || fallbackMessage);
		}

		if (error instanceof Error) {
			return error;
		}

		return new ValidationDomainError(fallbackMessage);
	}
}
