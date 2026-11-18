export const rbacKeys = {
	all: ["rbac"] as const,
	roles: () => [...rbacKeys.all, "roles"] as const,
	assignableRoles: () => [...rbacKeys.all, "assignable-roles"] as const,
	myPermissions: () => [...rbacKeys.all, "my-permissions"] as const,
};
