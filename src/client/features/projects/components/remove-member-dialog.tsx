import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import { useRemoveMemberDialog } from "../hooks/use-remove-member-dialog";

export function RemoveMemberDialog() {
	const { removingMember, isRemoving, handleOpenChange, handleConfirmRemove } =
		useRemoveMemberDialog();

	return (
		<Dialog open={Boolean(removingMember)} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ยืนยันการนำสมาชิกออก</DialogTitle>
					<DialogDescription>
						คุณต้องการนำ {removingMember?.userName} ({removingMember?.roleName})
						ออกจากโครงการนี้ใช่หรือไม่?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isRemoving}
						onClick={() => handleOpenChange(false)}
					>
						ยกเลิก
					</Button>
					<Button
						type="button"
						variant="destructive"
						disabled={isRemoving}
						onClick={() => void handleConfirmRemove()}
					>
						{isRemoving ? "กำลังนำออก..." : "ยืนยันนำออก"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
