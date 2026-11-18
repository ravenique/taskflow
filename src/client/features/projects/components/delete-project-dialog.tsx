import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import { useDeleteProjectDialog } from "../hooks/use-delete-project-dialog";

export function DeleteProjectDialog() {
	const { project, isOpen, isDeleting, handleOpenChange, handleConfirmDelete } =
		useDeleteProjectDialog();

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>ยืนยันการลบโครงการถาวร</DialogTitle>
					<DialogDescription>
						โครงการ &ldquo;{project?.name}&rdquo; ({project?.key}) รวมถึงสมาชิก
						งาน และประวัติกิจกรรมทั้งหมดจะถูกลบถาวรและไม่สามารถกู้คืนได้
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
						{isDeleting ? "กำลังลบ..." : "ยืนยันลบถาวร"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
