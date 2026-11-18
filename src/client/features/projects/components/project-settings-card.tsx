import { Archive, RotateCcw, Settings, Trash2 } from "lucide-react";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useProjectSettingsForm } from "../hooks/use-project-settings-form";

export function ProjectSettingsCard() {
	const {
		project,
		isArchived,
		canUpdate,
		canDelete,
		isTogglingStatus,
		form,
		handleToggleStatus,
		openDeleteDialog,
	} = useProjectSettingsForm();

	if (!project) {
		return null;
	}

	return (
		<Card className="h-fit">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Settings className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>ตั้งค่าโครงการ</CardTitle>
				</div>
				<CardDescription>
					{canUpdate
						? "แก้ไขข้อมูลโครงการ เปลี่ยนสถานะเก็บถาวร หรือกู้คืน"
						: "โหมดอ่านอย่างเดียว (ต้องมีสิทธิ์แก้ไขโครงการ)"}
				</CardDescription>
				<Separator />
			</CardHeader>

			<form
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.AppForm>
					<CardContent className="flex flex-col gap-4">
						{isArchived && canUpdate ? (
							<p className="text-xs text-muted-foreground">
								โครงการนี้ถูกเก็บถาวรอยู่ กรุณากู้คืนเป็นใช้งานอยู่ ก่อนจึงจะแก้ไขชื่อและคำอธิบายได้
							</p>
						) : null}

						<FieldGroup>
							<form.AppField name="name">
								{(field) => (
									<field.TextField
										label="ชื่อโครงการ"
										disabled={!canUpdate || isArchived}
									/>
								)}
							</form.AppField>

							<form.AppField name="description">
								{(field) => (
									<field.TextareaField
										label="คำอธิบาย"
										disabled={!canUpdate || isArchived}
									/>
								)}
							</form.AppField>
						</FieldGroup>
					</CardContent>

					{canUpdate || canDelete ? (
						<>
							<Separator className="mt-6" />
							<CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-6">
								{canUpdate ? (
									<div className="flex flex-wrap items-center gap-2">
										<form.SubmitButton
											disabled={isArchived}
											loadingLabel="กำลังบันทึก..."
										>
											บันทึกการแก้ไข
										</form.SubmitButton>

										<Button
											type="button"
											variant={isArchived ? "outline" : "secondary"}
											disabled={isTogglingStatus}
											onClick={() => void handleToggleStatus()}
										>
											{isArchived ? (
												<>
													<RotateCcw aria-hidden="true" />
													<span>กู้คืน</span>
												</>
											) : (
												<>
													<Archive aria-hidden="true" />
													<span>เก็บถาวร</span>
												</>
											)}
										</Button>
									</div>
								) : (
									<span />
								)}

								{canDelete ? (
									<Button
										type="button"
										variant="destructive"
										onClick={openDeleteDialog}
									>
										<Trash2 aria-hidden="true" />
										<span>ลบโครงการ</span>
									</Button>
								) : null}
							</CardFooter>
						</>
					) : null}
				</form.AppForm>
			</form>
		</Card>
	);
}
