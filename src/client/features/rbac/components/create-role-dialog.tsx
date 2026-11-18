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
import {
	ROLE_SCOPE_OPTIONS,
	useCreateRoleForm,
} from "../hooks/use-create-role-form";

export function CreateRoleDialog() {
	const { isOpen, handleOpenChange, form } = useCreateRoleForm();

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>สร้างบทบาทใหม่</DialogTitle>
					<DialogDescription>
						กำหนดชื่อ รหัสอ้างอิง และขอบเขตของบทบาท จากนั้นสามารถเลือกสิทธิ์บนตารางสิทธิ์ได้ทันที
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
									<field.TextField
										label="ชื่อบทบาท"
										placeholder="เช่น ผู้ตรวจสอบความปลอดภัย"
									/>
								)}
							</form.AppField>

							<form.AppField name="slug">
								{(field) => (
									<field.TextField
										label="รหัสอ้างอิง"
										placeholder="เช่น security_auditor"
										description="ตัวอักษรพิมพ์เล็ก a-z, ตัวเลข 0-9 หรือ _"
									/>
								)}
							</form.AppField>

							<form.AppField name="scope">
								{(field) => (
									<field.SelectField
										label="ระดับสิทธิ์"
										options={ROLE_SCOPE_OPTIONS}
									/>
								)}
							</form.AppField>

							<form.AppField name="description">
								{(field) => (
									<field.TextareaField
										label="คำอธิบาย"
										placeholder="อธิบายบทบาทหน้าที่ของบทบาทนี้"
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
								<form.SubmitButton loadingLabel="กำลังสร้างบทบาท...">
									สร้างบทบาท
								</form.SubmitButton>
							</DialogFooter>
						</FieldGroup>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
}
