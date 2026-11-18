export const usersKeys = {
	all: ["users"] as const,
	list: (search: string) => [...usersKeys.all, "list", search] as const,
};
