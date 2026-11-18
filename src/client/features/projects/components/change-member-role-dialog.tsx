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
import { useChangeMemberRoleForm } from "../hooks/use-change-member-role-form";

export function ChangeMemberRoleDialog() {
	const { changingMember, roleOptions, handleOpenChange, form } =
		useChangeMemberRoleForm();

	return (
		<Dialog open={Boolean(changingMember)} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>เปลี่ยนบทบาทของสมาชิก</DialogTitle>
					<DialogDescription>
						เลือกบทบาทใหม่สำหรับ {changingMember?.userName} (
						{changingMember?.userEmail})
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
							<form.AppField name="roleId">
								{(field) => (
									<field.SelectField
										label="บทบาทใหม่ในโครงการ"
										placeholder="เลือกบทบาทในโครงการ..."
										options={roleOptions}
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
									บันทึกบทบาท
								</form.SubmitButton>
							</DialogFooter>
						</FieldGroup>
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	);
}
