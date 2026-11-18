import { Lock, ShieldAlert, UserPlus } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useAddProjectMemberForm } from "../hooks/use-add-project-member-form";

export function AddProjectMemberCard() {
	const {
		canManageMembers,
		isArchived,
		userOptions,
		roleOptions,
		hasInvitableUsers,
		form,
	} = useAddProjectMemberForm();

	return (
		<Card className="h-fit">
			<CardHeader>
				<div className="flex items-center gap-2">
					<UserPlus className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>เพิ่มสมาชิกเข้าโครงการ</CardTitle>
				</div>
				<CardDescription>
					กำหนดบทบาทระดับโครงการให้ผู้ใช้งานเฉพาะภายในโครงการนี้
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent>
				{!canManageMembers ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
						<span>คุณอยู่ในโหมดอ่านอย่างเดียว (ต้องมีสิทธิ์จัดการสมาชิกโครงการ)</span>
					</div>
				) : isArchived ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Lock className="size-4 shrink-0" aria-hidden="true" />
						<span>โครงการนี้ถูกเก็บถาวรแล้ว ไม่สามารถเพิ่มหรือแก้ไขสมาชิกได้</span>
					</div>
				) : !hasInvitableUsers ? (
					<p className="text-sm text-muted-foreground">
						ผู้ใช้งานทั้งหมดในระบบเป็นสมาชิกของโครงการนี้เรียบร้อยแล้ว
					</p>
				) : (
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
								<form.AppField name="userId">
									{(field) => (
										<field.SelectField
											label="ผู้ใช้งาน"
											placeholder="เลือกผู้ใช้งานที่ต้องการเชิญ..."
											options={userOptions}
										/>
									)}
								</form.AppField>

								<form.AppField name="roleId">
									{(field) => (
										<field.SelectField
											label="บทบาทในโครงการ"
											placeholder="เลือกบทบาทในโครงการ..."
											options={roleOptions}
										/>
									)}
								</form.AppField>

								<form.SubmitButton
									className="w-full"
									loadingLabel="กำลังเพิ่มสมาชิก..."
								>
									เพิ่มสมาชิก
								</form.SubmitButton>
							</FieldGroup>
						</form.AppForm>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
