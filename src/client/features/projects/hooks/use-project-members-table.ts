import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { projectMembersQueryOptions } from "#/client/caches/projects/queries/project-members.query";
import type { ProjectMemberDto } from "#/shared/schemas/project.schema";
import { useProjectMembersContext } from "../contexts/project-members.context";
import { useProjectDetail } from "./use-project-detail";

const membersTableFeatures = tableFeatures({});
const memberColumnHelper = createColumnHelper<
	typeof membersTableFeatures,
	ProjectMemberDto
>();

const memberTableColumns = memberColumnHelper.columns([
	memberColumnHelper.accessor("userName", {
		header: "สมาชิก",
	}),
	memberColumnHelper.accessor("roleName", {
		header: "Project Role",
	}),
	memberColumnHelper.accessor("joinedAt", {
		header: "วันที่เข้าร่วม",
	}),
	memberColumnHelper.display({
		id: "actions",
		header: "จัดการ",
	}),
]);

export function useProjectMembersTable() {
	const { projectId, isArchived, can } = useProjectDetail();
	const { openChangeRoleDialog, openRemoveDialog } = useProjectMembersContext();
	const { data, isPending } = useQuery({
		...projectMembersQueryOptions(projectId),
		enabled: Boolean(projectId),
	});

	const canManageMembers = can("project:manage_members");
	const members = data?.members ?? [];

	const table = useTable({
		features: membersTableFeatures,
		columns: memberTableColumns,
		data: members,
		getRowId: (row) => row.id,
	});

	return {
		table,
		columnCount: memberTableColumns.length,
		memberCount: members.length,
		isPending,
		canManageMembers,
		isArchived,
		openChangeRoleDialog,
		openRemoveDialog,
	};
}
