import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { adminUsersQueryOptions } from "#/client/caches/users/queries/users.query";
import { useSession } from "#/client/features/auth/hooks/use-session";
import type { AdminUserDto } from "#/shared/schemas/user.schema";
import { useUsersAdminContext } from "../contexts/users-admin.context";

const userTableFeatures = tableFeatures({});
const userColumnHelper = createColumnHelper<
	typeof userTableFeatures,
	AdminUserDto
>();

const userTableColumns = userColumnHelper.columns([
	userColumnHelper.accessor("name", {
		header: "ชื่อผู้ใช้งาน",
	}),
	userColumnHelper.accessor("email", {
		header: "อีเมล",
	}),
	userColumnHelper.accessor("systemRoles", {
		header: "System Roles",
	}),
	userColumnHelper.accessor("createdAt", {
		header: "วันที่สร้างบัญชี",
	}),
	userColumnHelper.display({
		id: "actions",
		header: "จัดการสิทธิ์",
	}),
]);

export function useUsersTable() {
	const { session } = useSession();
	const { debouncedSearch, openAssignRolesDialog } = useUsersAdminContext();
	const { data: users = [], isPending } = useQuery(
		adminUsersQueryOptions(debouncedSearch),
	);

	const canAssignRoles =
		session?.user.systemPermissions.includes("user:assign_role") ?? false;

	const table = useTable({
		features: userTableFeatures,
		columns: userTableColumns,
		data: users,
		getRowId: (row) => row.id,
	});

	return {
		table,
		columnCount: userTableColumns.length,
		isPending,
		canAssignRoles,
		openAssignRolesDialog,
	};
}
