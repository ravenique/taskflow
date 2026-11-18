import { useRemoveProjectMemberMutation } from "#/client/caches/projects/mutates/remove-project-member.mutate";
import { useProjectMembersContext } from "../contexts/project-members.context";

export function useRemoveMemberDialog() {
	const { removingMember, closeRemoveDialog } = useProjectMembersContext();
	const removeMutation = useRemoveProjectMemberMutation();

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			closeRemoveDialog();
		}
	};

	const handleConfirmRemove = async () => {
		if (!removingMember) {
			return;
		}
		try {
			await removeMutation.mutateAsync({
				projectId: removingMember.projectId,
				memberId: removingMember.id,
			});
			closeRemoveDialog();
		} catch {
			// Error toast is centrally handled by MutationCache in client/caches/global.ts
			return;
		}
	};

	return {
		removingMember,
		isRemoving: removeMutation.isPending,
		handleOpenChange,
		handleConfirmRemove,
	};
}
