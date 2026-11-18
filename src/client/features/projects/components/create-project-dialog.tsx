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
import { useCreateProjectForm } from "../hooks/use-create-project-form";

export function CreateProjectDialog() {
	const { isOpen, handleOpenChange, form } = useCreateProjectForm();

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>สร้างโครงการใหม่</DialogTitle>
					<DialogDescription>
						คุณจะได้รับบทบาทเจ้าของโครงการนี้โดยอัตโนมัติ
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
							<form.AppField name="key">
								{(field) => (
									<field.TextField
										label="รหัสโครงการ"
										placeholder="เช่น TSK"
										description="ตัวอักษรภาษาอังกฤษ A-Z และ 0-9 ยาว 2–10 ตัว (แก้ไขภายหลังไม่ได้)"
									/>
								)}
							</form.AppField>

							<form.AppField name="name">
								{(field) => (
									<field.TextField
										label="ชื่อโครงการ"
										placeholder="เช่น ระบบจัดการงานหลัก TaskFlow"
									/>
								)}
							</form.AppField>

							<form.AppField name="description">
								{(field) => (
									<field.TextareaField
										label="คำอธิบาย"
										placeholder="รายละเอียดเป้าหมายและขอบเขตของโครงการ"
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
								<form.SubmitButton loadingLabel="กำลังสร้างโครงการ...">
									สร้างโครงการ
								</form.SubmitButton>
							</DialogFooter>
						</FieldGroup>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
}
