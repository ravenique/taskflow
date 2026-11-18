import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface TaskDetailContextValue {
	isDeleteDialogOpen: boolean;
	openDeleteDialog: () => void;
	closeDeleteDialog: () => void;
}

const TaskDetailContext = createContext<TaskDetailContextValue | null>(null);

export function TaskDetailProvider({ children }: { children: ReactNode }) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const value: TaskDetailContextValue = {
		isDeleteDialogOpen,
		openDeleteDialog: () => setIsDeleteDialogOpen(true),
		closeDeleteDialog: () => setIsDeleteDialogOpen(false),
	};

	return (
		<TaskDetailContext.Provider value={value}>
			{children}
		</TaskDetailContext.Provider>
	);
}

export function useTaskDetailContext(): TaskDetailContextValue {
	const ctx = useContext(TaskDetailContext);
	if (!ctx) {
		throw new Error(
			"useTaskDetailContext must be used inside <TaskDetailProvider>",
		);
	}
	return ctx;
}
