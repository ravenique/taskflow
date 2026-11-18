import { AddProjectMemberCard } from "../components/add-project-member-card";
import { ChangeMemberRoleDialog } from "../components/change-member-role-dialog";
import { ProjectMembersTable } from "../components/project-members-table";
import { RemoveMemberDialog } from "../components/remove-member-dialog";
import { ProjectMembersProvider } from "../contexts/project-members.context";

export function ProjectMembersScreen() {
	return (
		<ProjectMembersProvider>
			<div className="grid gap-6 lg:grid-cols-[340px_1fr]">
				<AddProjectMemberCard />
				<ProjectMembersTable />
			</div>
			<ChangeMemberRoleDialog />
			<RemoveMemberDialog />
		</ProjectMembersProvider>
	);
}
