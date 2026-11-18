import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import { useTaskDeleteDialog } from "../hooks/use-task-delete-dialog";

export function TaskDeleteDialog() {
	const { task, isOpen, isDeleting, handleOpenChange, handleConfirmDelete } =
		useTaskDeleteDialog();

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ยืนยันการลบงานถาวร</DialogTitle>
					<DialogDescription>
						คุณต้องการลบงาน {task?.code} (&ldquo;{task?.title}&rdquo;) ใช่หรือไม่?
						ความคิดเห็นทั้งหมดภายใต้งานนี้จะถูกลบถาวร
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
						{isDeleting ? "กำลังลบ..." : "ยืนยันลบงาน"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
