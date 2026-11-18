import { Button } from "#/client/shared/shadcn/components/ui/button";
import { Checkbox } from "#/client/shared/shadcn/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/client/shared/shadcn/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "#/client/shared/shadcn/components/ui/field";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useAssignUserRolesForm } from "../hooks/use-assign-user-roles-form";

export function AssignUserRolesDialog() {
	const {
		editingUser,
		systemRoles,
		isLoadingRoles,
		handleOpenChange,
		form,
		toggleRoleId,
	} = useAssignUserRolesForm();

	return (
		<Dialog open={Boolean(editingUser)} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>กำหนดบทบาทระดับระบบ</DialogTitle>
					<DialogDescription>
						เลือกบทบาทระดับระบบสำหรับบัญชี {editingUser?.name} ({editingUser?.email})
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
							{isLoadingRoles ? (
								<div className="flex flex-col gap-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							) : (
								<form.AppField name="roleIds">
									{(field) => {
										const selectedRoleIds = field.state.value;

										return (
											<FieldGroup className="gap-3">
												{systemRoles.map((role) => {
													const checkboxId = `assign-role-${role.id}`;
													const isChecked = selectedRoleIds.includes(role.id);

													return (
														<Field
															key={role.id}
															orientation="horizontal"
															className="items-start"
														>
															<Checkbox
																id={checkboxId}
																checked={isChecked}
																onCheckedChange={(checked) => {
																	field.handleChange(
																		toggleRoleId(
																			selectedRoleIds,
																			role.id,
																			checked,
																		),
																	);
																}}
															/>
															<FieldContent>
																<FieldLabel htmlFor={checkboxId}>
																	{role.name} ({role.slug})
																</FieldLabel>
																<FieldDescription>
																	{role.description ||
																		`${role.permissionIds.length} สิทธิ์`}
																</FieldDescription>
															</FieldContent>
														</Field>
													);
												})}
											</FieldGroup>
										);
									}}
								</form.AppField>
							)}

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
