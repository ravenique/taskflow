import { Crown, UserCog, UserMinus, Users } from "lucide-react";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/client/shared/shadcn/components/ui/table";
import { useProjectMembersTable } from "../hooks/use-project-members-table";

export function ProjectMembersTable() {
	const {
		table,
		columnCount,
		memberCount,
		isPending,
		canManageMembers,
		isArchived,
		openChangeRoleDialog,
		openRemoveDialog,
	} = useProjectMembersTable();

	const rows = table.getRowModel().rows;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Users className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>สมาชิกภายในโครงการ ({memberCount})</CardTitle>
				</div>
				<CardDescription>
					รายชื่อสมาชิกและบทบาทเฉพาะโครงการนี้ (ป้องกันการลบเจ้าของคนสุดท้าย)
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent>
				{isPending ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : (
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : (
												<table.FlexRender header={header} />
											)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{rows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={columnCount}
										className="h-20 text-center text-muted-foreground"
									>
										ยังไม่มีสมาชิกในโครงการ
									</TableCell>
								</TableRow>
							) : (
								rows.map((row) => (
									<TableRow key={row.id}>
										{row.getAllCells().map((cell) => {
											const member = row.original;

											if (cell.column.id === "userName") {
												return (
													<TableCell key={cell.id}>
														<div className="flex flex-col">
															<span className="font-medium">
																{member.userName}
															</span>
															<span className="text-xs text-muted-foreground">
																{member.userEmail}
															</span>
														</div>
													</TableCell>
												);
											}

											if (cell.column.id === "roleName") {
												return (
													<TableCell key={cell.id}>
														<Badge
															variant={
																member.isOwnerRole ? "default" : "secondary"
															}
														>
															{member.isOwnerRole ? (
																<Crown aria-hidden="true" />
															) : null}
															<span>{member.roleName}</span>
														</Badge>
													</TableCell>
												);
											}

											if (cell.column.id === "joinedAt") {
												return (
													<TableCell
														key={cell.id}
														className="text-xs text-muted-foreground"
													>
														{new Date(member.joinedAt).toLocaleDateString()}
													</TableCell>
												);
											}

											if (cell.column.id === "actions") {
												if (!canManageMembers || isArchived) {
													return (
														<TableCell
															key={cell.id}
															className="text-xs text-muted-foreground"
														>
															{isArchived ? "ล็อก (เก็บถาวร)" : "อ่านอย่างเดียว"}
														</TableCell>
													);
												}

												return (
													<TableCell key={cell.id}>
														<div className="flex items-center gap-1.5">
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => openChangeRoleDialog(member)}
															>
																<UserCog aria-hidden="true" />
																<span>เปลี่ยนบทบาท</span>
															</Button>
															<Button
																type="button"
																variant="destructive"
																size="sm"
																onClick={() => openRemoveDialog(member)}
															>
																<UserMinus aria-hidden="true" />
																<span>นำออก</span>
															</Button>
														</div>
													</TableCell>
												);
											}

											return (
												<TableCell key={cell.id}>
													<table.FlexRender cell={cell} />
												</TableCell>
											);
										})}
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
