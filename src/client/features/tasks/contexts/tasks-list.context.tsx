import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface TasksListContextValue {
	isCreateDialogOpen: boolean;
	openCreateDialog: () => void;
	closeCreateDialog: () => void;
}

const TasksListContext = createContext<TasksListContextValue | null>(null);

export function TasksListProvider({ children }: { children: ReactNode }) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const value: TasksListContextValue = {
		isCreateDialogOpen,
		openCreateDialog: () => setIsCreateDialogOpen(true),
		closeCreateDialog: () => setIsCreateDialogOpen(false),
	};

	return (
		<TasksListContext.Provider value={value}>
			{children}
		</TasksListContext.Provider>
	);
}

export function useTasksListContext(): TasksListContextValue {
	const ctx = useContext(TasksListContext);
	if (!ctx) {
		throw new Error(
			"useTasksListContext must be used inside <TasksListProvider>",
		);
	}
	return ctx;
}
