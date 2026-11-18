import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { ProjectMemberDto } from "#/shared/schemas/project.schema";

interface ProjectMembersContextValue {
	changingMember: ProjectMemberDto | null;
	removingMember: ProjectMemberDto | null;
	openChangeRoleDialog: (member: ProjectMemberDto) => void;
	closeChangeRoleDialog: () => void;
	openRemoveDialog: (member: ProjectMemberDto) => void;
	closeRemoveDialog: () => void;
}

const ProjectMembersContext = createContext<ProjectMembersContextValue | null>(
	null,
);

export function ProjectMembersProvider({ children }: { children: ReactNode }) {
	const [changingMember, setChangingMember] = useState<ProjectMemberDto | null>(
		null,
	);
	const [removingMember, setRemovingMember] = useState<ProjectMemberDto | null>(
		null,
	);

	const value: ProjectMembersContextValue = {
		changingMember,
		removingMember,
		openChangeRoleDialog: (member) => setChangingMember(member),
		closeChangeRoleDialog: () => setChangingMember(null),
		openRemoveDialog: (member) => setRemovingMember(member),
		closeRemoveDialog: () => setRemovingMember(null),
	};

	return (
		<ProjectMembersContext.Provider value={value}>
			{children}
		</ProjectMembersContext.Provider>
	);
}

export function useProjectMembersContext(): ProjectMembersContextValue {
	const ctx = useContext(ProjectMembersContext);
	if (!ctx) {
		throw new Error(
			"useProjectMembersContext must be used inside <ProjectMembersProvider>",
		);
	}
	return ctx;
}
