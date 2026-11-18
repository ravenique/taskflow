import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import { useDeleteRoleDialog } from "../hooks/use-delete-role-dialog";

export function DeleteRoleDialog() {
	const { deletingRole, isDeleting, handleOpenChange, handleConfirmDelete } =
		useDeleteRoleDialog();

	return (
		<Dialog open={Boolean(deletingRole)} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ยืนยันการลบบทบาท</DialogTitle>
					<DialogDescription>
						คุณต้องการลบบทบาท &ldquo;{deletingRole?.name}&rdquo; (
						{deletingRole?.slug}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isDeleting}
						onClick={() => handleOpenChange(false)}
					>
						ยกเลิก
					</Button>
					<Button
						type="button"
						variant="destructive"
						disabled={isDeleting}
						onClick={() => void handleConfirmDelete()}
					>
						{isDeleting ? "กำลังลบ..." : "ยืนยันลบบทบาท"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
