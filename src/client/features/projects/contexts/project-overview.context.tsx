import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface ProjectOverviewContextValue {
	isDeleteDialogOpen: boolean;
	openDeleteDialog: () => void;
	closeDeleteDialog: () => void;
}

const ProjectOverviewContext =
	createContext<ProjectOverviewContextValue | null>(null);

export function ProjectOverviewProvider({ children }: { children: ReactNode }) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const value: ProjectOverviewContextValue = {
		isDeleteDialogOpen,
		openDeleteDialog: () => setIsDeleteDialogOpen(true),
		closeDeleteDialog: () => setIsDeleteDialogOpen(false),
	};

	return (
		<ProjectOverviewContext.Provider value={value}>
			{children}
		</ProjectOverviewContext.Provider>
	);
}

export function useProjectOverviewContext(): ProjectOverviewContextValue {
	const ctx = useContext(ProjectOverviewContext);
	if (!ctx) {
		throw new Error(
			"useProjectOverviewContext must be used inside <ProjectOverviewProvider>",
		);
	}
	return ctx;
}
