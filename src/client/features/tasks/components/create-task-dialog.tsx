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
import { useCreateTaskForm } from "../hooks/use-create-task-form";

export function CreateTaskDialog() {
	const {
		isOpen,
		canAssignTask,
		priorityOptions,
		assigneeOptions,
		handleOpenChange,
		form,
	} = useCreateTaskForm();

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>สร้างงานใหม่</DialogTitle>
					<DialogDescription>
						ระบบจะสร้างรหัสงานอัตโนมัติ (เช่น TSK-1) และกำหนดสถานะเริ่มต้นเป็น "ต้องทำ"
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
							<form.AppField name="title">
								{(field) => (
									<field.TextField
										label="หัวข้อ"
										placeholder="เช่น ออกแบบระบบยืนยันตัวตน"
									/>
								)}
							</form.AppField>

							<form.AppField name="description">
								{(field) => (
									<field.TextareaField
										label="รายละเอียด"
										placeholder="อธิบายขอบเขตงานและเกณฑ์ความสำเร็จ"
									/>
								)}
							</form.AppField>

							<form.AppField name="priority">
								{(field) => (
									<field.SelectField
										label="ระดับความสำคัญ"
										options={priorityOptions}
									/>
								)}
							</form.AppField>

							{canAssignTask ? (
								<form.AppField name="assigneeId">
									{(field) => (
										<field.SelectField
											label="ผู้รับผิดชอบ"
											options={assigneeOptions}
										/>
									)}
								</form.AppField>
							) : null}

							<form.AppField name="dueDate">
								{(field) => (
									<field.TextField type="date" label="วันครบกำหนด (ไม่บังคับ)" />
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
								<form.SubmitButton loadingLabel="กำลังสร้างงาน...">
									สร้างงาน
								</form.SubmitButton>
							</DialogFooter>
						</FieldGroup>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
}
