import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { AdminUserDto } from "#/shared/schemas/user.schema";

interface UsersAdminContextValue {
	searchInput: string;
	debouncedSearch: string;
	editingUser: AdminUserDto | null;
	setSearchInput: (value: string) => void;
	openAssignRolesDialog: (user: AdminUserDto) => void;
	closeAssignRolesDialog: () => void;
}

const UsersAdminContext = createContext<UsersAdminContextValue | null>(null);

export function UsersAdminProvider({ children }: { children: ReactNode }) {
	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput.trim());
		}, 250);

		return () => clearTimeout(timer);
	}, [searchInput]);

	const value: UsersAdminContextValue = {
		searchInput,
		debouncedSearch,
		editingUser,
		setSearchInput,
		openAssignRolesDialog: (user) => setEditingUser(user),
		closeAssignRolesDialog: () => setEditingUser(null),
	};

	return (
		<UsersAdminContext.Provider value={value}>
			{children}
		</UsersAdminContext.Provider>
	);
}

export function useUsersAdminContext(): UsersAdminContextValue {
	const ctx = useContext(UsersAdminContext);
	if (!ctx) {
		throw new Error(
			"useUsersAdminContext must be used inside <UsersAdminProvider>",
		);
	}
	return ctx;
}
