import { Lock, Plus, Shield, Trash2 } from "lucide-react";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useRolesList } from "../hooks/use-roles-list";

export function RolesListCard() {
	const {
		roles,
		selectedRoleId,
		isPending,
		canManageRoles,
		selectRole,
		openCreateDialog,
		requestDeleteRole,
	} = useRolesList();

	return (
		<Card className="h-fit">
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Shield className="size-4 text-primary" aria-hidden="true" />
						<CardTitle>รายการบทบาท</CardTitle>
					</div>
					{canManageRoles ? (
						<Button type="button" size="sm" onClick={openCreateDialog}>
							<Plus aria-hidden="true" />
							<span>สร้างบทบาท</span>
						</Button>
					) : null}
				</div>
				<CardDescription>เลือกบทบาทเพื่อดูและกำหนดสิทธิ์ประจำบทบาท</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-1.5">
				{isPending ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : (
					roles.map((role) => {
						const isSelected = role.id === selectedRoleId;

						return (
							<div key={role.id} className="flex items-center gap-1">
								<Button
									type="button"
									variant={isSelected ? "secondary" : "ghost"}
									className="h-auto min-w-0 flex-1 flex-col items-start gap-1 px-3 py-2.5 text-left"
									onClick={() => selectRole(role.id)}
								>
									<div className="flex w-full items-center justify-between gap-2">
										<span className="truncate font-medium">{role.name}</span>
										<Badge
											variant={role.scope === "system" ? "default" : "outline"}
										>
											{role.scope}
										</Badge>
									</div>
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<span>{role.slug}</span>
										<span>({role.permissionIds.length} สิทธิ์)</span>
										{role.isSystem ? (
											<Lock className="size-3" aria-hidden="true" />
										) : null}
									</div>
								</Button>
								{canManageRoles && !role.isSystem ? (
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										aria-label={`ลบบทบาท ${role.name}`}
										onClick={() => requestDeleteRole(role)}
									>
										<Trash2
											className="size-4 text-destructive"
											aria-hidden="true"
										/>
									</Button>
								) : null}
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
