import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import { useArchiveProjectDialog } from "../hooks/use-archive-project-dialog";

export function ArchiveProjectDialog() {
	const { archiveTarget, isSubmitting, handleOpenChange, handleConfirm } =
		useArchiveProjectDialog();

	const isArchiveMode = archiveTarget?.mode === "archive";

	return (
		<Dialog open={Boolean(archiveTarget)} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isArchiveMode ? "ยืนยันการเก็บถาวรโครงการ" : "ยืนยันการกู้คืนโครงการ"}
					</DialogTitle>
					<DialogDescription>
						{isArchiveMode
							? `โครงการ "${archiveTarget?.project.name}" (${archiveTarget?.project.key}) จะถูกเก็บถาวรและไม่สามารถแก้ไขรายละเอียดหรือสร้างงานใหม่ได้จนกว่าจะกู้คืน`
							: `ต้องการเปิดใช้งานโครงการ "${archiveTarget?.project.name}" (${archiveTarget?.project.key}) กลับมาใช้งานอีกครั้งหรือไม่?`}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting}
						onClick={() => handleOpenChange(false)}
					>
						ยกเลิก
					</Button>
					<Button
						type="button"
						variant={isArchiveMode ? "destructive" : "default"}
						disabled={isSubmitting}
						onClick={() => void handleConfirm()}
					>
						{isSubmitting
							? "กำลังดำเนินการ..."
							: isArchiveMode
								? "ยืนยันเก็บถาวร"
								: "ยืนยันกู้คืน"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
