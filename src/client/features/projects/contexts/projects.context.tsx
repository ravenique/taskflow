import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { ProjectListItemDto } from "#/shared/schemas/project.schema";

export interface ArchiveDialogTarget {
	readonly project: ProjectListItemDto;
	readonly mode: "archive" | "restore";
}

interface ProjectsContextValue {
	isCreateDialogOpen: boolean;
	editingProject: ProjectListItemDto | null;
	archiveTarget: ArchiveDialogTarget | null;
	openCreateDialog: () => void;
	closeCreateDialog: () => void;
	openEditDialog: (project: ProjectListItemDto) => void;
	closeEditDialog: () => void;
	requestArchiveToggle: (
		project: ProjectListItemDto,
		mode: "archive" | "restore",
	) => void;
	closeArchiveDialog: () => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingProject, setEdittingProject] =
		useState<ProjectListItemDto | null>(null);
	const [archiveTarget, setArchiveTarget] =
		useState<ArchiveDialogTarget | null>(null);

	const value: ProjectsContextValue = {
		isCreateDialogOpen,
		editingProject,
		archiveTarget,
		openCreateDialog: () => setIsCreateDialogOpen(true),
		closeCreateDialog: () => setIsCreateDialogOpen(false),
		openEditDialog: (project) => setEdittingProject(project),
		closeEditDialog: () => setEdittingProject(null),
		requestArchiveToggle: (project, mode) =>
			setArchiveTarget({ project, mode }),
		closeArchiveDialog: () => setArchiveTarget(null),
	};

	return (
		<ProjectsContext.Provider value={value}>
			{children}
		</ProjectsContext.Provider>
	);
}

export function useProjectsContext(): ProjectsContextValue {
	const ctx = useContext(ProjectsContext);
	if (!ctx) {
		throw new Error(
			"useProjectsContext must be used inside <ProjectsProvider>",
		);
	}
	return ctx;
}
