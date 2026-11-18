import { Lock, ShieldAlert, UserCheck } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useTaskAssigneeForm } from "../hooks/use-task-assignee-form";

export function TaskAssigneeCard() {
	const { task, canAssignTask, isArchived, assigneeOptions, form } =
		useTaskAssigneeForm();

	if (!task) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<UserCheck className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>ผู้รับผิดชอบ</CardTitle>
				</div>
				<CardDescription>
					มอบหมายงานได้เฉพาะผู้ใช้งานที่เป็นสมาชิกในโครงการนี้เท่านั้น
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent>
				{!canAssignTask ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
						<span>ต้องมีสิทธิ์มอบหมายงานจึงจะกำหนดผู้รับผิดชอบได้</span>
					</div>
				) : isArchived ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Lock className="size-4 shrink-0" aria-hidden="true" />
						<span>ไม่สามารถเปลี่ยนผู้รับผิดชอบในโครงการที่ถูกเก็บถาวรแล้ว</span>
					</div>
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
								<form.AppField name="assigneeId">
									{(field) => (
										<field.SelectField
											label="สมาชิกในโครงการ"
											options={assigneeOptions}
										/>
									)}
								</form.AppField>

								<form.SubmitButton
									className="w-full"
									loadingLabel="กำลังอัปเดต..."
								>
									อัปเดตผู้รับผิดชอบ
								</form.SubmitButton>
							</FieldGroup>
						</form.AppForm>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
