import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Checkbox } from "#/client/shared/shadcn/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { usePermissionMatrixForm } from "../hooks/use-permission-matrix-form";

export function PermissionMatrixCard() {
	const {
		isPending,
		selectedRole,
		scopedPermissions,
		canManageRoles,
		form,
		togglePermissionId,
	} = usePermissionMatrixForm();

	if (isPending) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-72" />
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!selectedRole) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>ตารางสิทธิ์</CardTitle>
					<CardDescription>
						เลือกบทบาทจากรายการด้านซ้ายเพื่อดูหรือแก้ไขสิทธิ์
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<KeyRound className="size-5 text-primary" aria-hidden="true" />
						<CardTitle>{selectedRole.name}</CardTitle>
					</div>
					<div className="flex items-center gap-1.5">
						<Badge
							variant={selectedRole.scope === "system" ? "default" : "outline"}
						>
							ขอบเขต: {selectedRole.scope}
						</Badge>
						{selectedRole.isSystem ? (
							<Badge variant="secondary">
								<Lock aria-hidden="true" />
								<span>บทบาทระบบ</span>
							</Badge>
						) : null}
					</div>
				</div>
				<CardDescription>
					{selectedRole.description || `รหัสอ้างอิง: ${selectedRole.slug}`}
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
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<ShieldCheck className="size-4 text-primary" aria-hidden="true" />
							<span>
								แสดงเฉพาะสิทธิ์ระดับ {selectedRole.scope} เพื่อแยกขอบเขตสิทธิ์อย่างชัดเจน
							</span>
						</div>

						<form.AppField name="permissionIds">
							{(field) => {
								const selectedIds = field.state.value;

								return (
									<FieldGroup className="gap-3">
										{scopedPermissions.map((permission) => {
											const isChecked = selectedIds.includes(permission.id);
											const checkboxId = `perm-${selectedRole.id}-${permission.id}`;

											return (
												<Field
													key={permission.id}
													orientation="horizontal"
													className="items-start"
												>
													<Checkbox
														id={checkboxId}
														checked={isChecked}
														disabled={!canManageRoles}
														onCheckedChange={(checked) => {
															field.handleChange(
																togglePermissionId(
																	selectedIds,
																	permission.id,
																	checked,
																),
															);
														}}
													/>
													<FieldContent>
														<FieldLabel htmlFor={checkboxId}>
															{permission.code}
														</FieldLabel>
														<FieldDescription>
															{permission.description}
														</FieldDescription>
													</FieldContent>
												</Field>
											);
										})}
									</FieldGroup>
								);
							}}
						</form.AppField>
					</CardContent>

					<Separator className="mt-6" />

					<CardFooter className="flex items-center justify-between gap-2 pt-6">
						<span className="text-xs text-muted-foreground">
							{canManageRoles
								? "การเปลี่ยนแปลงสิทธิ์จะมีผลกับผู้ใช้งานที่ถือบทบาทนี้ทันที"
								: "โหมดอ่านอย่างเดียว (ต้องมีสิทธิ์จัดการบทบาทเพื่อบันทึก)"}
						</span>
						{canManageRoles ? (
							<form.SubmitButton loadingLabel="กำลังบันทึกสิทธิ์...">
								บันทึกสิทธิ์
							</form.SubmitButton>
						) : null}
					</CardFooter>
				</form.AppForm>
			</form>
		</Card>
	);
}
