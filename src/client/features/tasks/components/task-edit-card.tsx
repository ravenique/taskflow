import { Lock, Pencil, ShieldAlert } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useTaskEditForm } from "../hooks/use-task-edit-form";

export function TaskEditCard() {
	const { task, canUpdateTask, isArchived, priorityOptions, form } =
		useTaskEditForm();

	if (!task) {
		return null;
	}

	const isReadOnly = !canUpdateTask || isArchived;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Pencil className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>รายละเอียดและแก้ไขงาน</CardTitle>
				</div>
				<CardDescription>
					ปรับปรุงหัวข้อ คำอธิบาย ระดับความสำคัญ และวันครบกำหนดของงาน
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{!canUpdateTask ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
						<span>คุณอยู่ในโหมดอ่านอย่างเดียว (ต้องมีสิทธิ์แก้ไขงาน)</span>
					</div>
				) : isArchived ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Lock className="size-4 shrink-0" aria-hidden="true" />
						<span>โครงการถูกเก็บถาวรแล้ว ไม่สามารถแก้ไขรายละเอียดได้</span>
					</div>
				) : null}

				{isReadOnly ? (
					<div className="flex flex-col gap-3 text-sm">
						<div>
							<p className="text-xs font-medium text-muted-foreground">
								รายละเอียดงาน
							</p>
							<p className="mt-1 whitespace-pre-wrap text-foreground">
								{task.description || "ไม่มีรายละเอียดเพิ่มเติม"}
							</p>
						</div>
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
								<form.AppField name="title">
									{(field) => (
										<field.TextField label="หัวข้องาน" placeholder="ระบุหัวข้องาน" />
									)}
								</form.AppField>

								<form.AppField name="description">
									{(field) => (
										<field.TextareaField
											label="รายละเอียด"
											rows={5}
											placeholder="รายละเอียดของงาน..."
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

								<form.AppField name="dueDate">
									{(field) => (
										<field.TextField
											type="date"
											label="วันครบกำหนด (เว้นว่างหากไม่มี)"
										/>
									)}
								</form.AppField>

								<div className="flex justify-end">
									<form.SubmitButton loadingLabel="กำลังบันทึก...">
										บันทึกการแก้ไข
									</form.SubmitButton>
								</div>
							</FieldGroup>
						</form.AppForm>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
