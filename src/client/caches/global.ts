import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "#/client/shared/shadcn/components/ui/toast";

declare module "@tanstack/react-query" {
	interface Register {
		mutationMeta: {
			successToast?: string | ((data: unknown) => string);
			errorToast?: string | ((error: Error) => string) | false;
		};
	}
}

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
			},
		},
		mutationCache: new MutationCache({
			onSuccess: (data, _variables, _context, mutation) => {
				const meta = mutation.meta;
				if (!meta?.successToast) return;

				const message =
					typeof meta.successToast === "function"
						? meta.successToast(data)
						: meta.successToast;

				toast.add({
					description: message,
					type: "success",
				});
			},
			onError: (error, _variables, _context, mutation) => {
				const meta = mutation.meta;
				if (meta?.errorToast === false) return;

				const message =
					typeof meta?.errorToast === "function"
						? meta.errorToast(error)
						: (meta?.errorToast ?? error.message);

				toast.add({
					description: message,
					type: "error",
				});
			},
		}),
	});
}
