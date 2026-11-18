import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { useEditProjectForm } from "../hooks/use-edit-project-form";

export function EditProjectDialog() {
	const { editingProject, handleOpenChange, form } = useEditProjectForm();

	return (
		<Dialog open={Boolean(editingProject)} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<div className="flex items-center gap-2">
						<DialogTitle>แก้ไขโครงการ</DialogTitle>
						{editingProject ? (
							<Badge variant="outline">{editingProject.key}</Badge>
						) : null}
					</div>
					<DialogDescription>
						ปรับปรุงชื่อและคำอธิบายโครงการ (รหัสโครงการไม่สามารถเปลี่ยนแปลงได้)
					</DialogDescription>
				</DialogHeader>

				<form
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.AppForm>
						<FieldGroup>
							<form.AppField name="name">
								{(field) => (
									<field.TextField label="ชื่อโครงการ" placeholder="ชื่อโครงการ" />
								)}
							</form.AppField>

							<form.AppField name="description">
								{(field) => (
									<field.TextareaField
										label="คำอธิบาย"
										placeholder="รายละเอียดโครงการ"
									/>
								)}
							</form.AppField>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => handleOpenChange(false)}
								>
									ยกเลิก
								</Button>
								<form.SubmitButton loadingLabel="กำลังบันทึก...">
									บันทึกการแก้ไข
								</form.SubmitButton>
							</DialogFooter>
						</FieldGroup>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
}
