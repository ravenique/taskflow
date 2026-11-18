import { UserCog } from "lucide-react";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/client/shared/shadcn/components/ui/table";
import { useUsersTable } from "../hooks/use-users-table";

export function UsersTable() {
	const {
		table,
		columnCount,
		isPending,
		canAssignRoles,
		openAssignRolesDialog,
	} = useUsersTable();

	if (isPending) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	const rows = table.getRowModel().rows;

	return (
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
							className="h-24 text-center text-muted-foreground"
						>
							ไม่พบบัญชีผู้ใช้งานที่ตรงกับเงื่อนไข
						</TableCell>
					</TableRow>
				) : (
					rows.map((row) => (
						<TableRow key={row.id}>
							{row.getAllCells().map((cell) => {
								if (cell.column.id === "systemRoles") {
									return (
										<TableCell key={cell.id}>
											<div className="flex flex-wrap gap-1">
												{row.original.systemRoles.length > 0 ? (
													row.original.systemRoles.map((role) => (
														<Badge key={role.id} variant="secondary">
															{role.name}
														</Badge>
													))
												) : (
													<span className="text-xs text-muted-foreground">
														ไม่มีบทบาทระดับระบบ
													</span>
												)}
											</div>
										</TableCell>
									);
								}

								if (cell.column.id === "createdAt") {
									return (
										<TableCell
											key={cell.id}
											className="text-xs text-muted-foreground"
										>
											{new Date(row.original.createdAt).toLocaleDateString()}
										</TableCell>
									);
								}

								if (cell.column.id === "actions") {
									return (
										<TableCell key={cell.id}>
											{canAssignRoles ? (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => openAssignRolesDialog(row.original)}
												>
													<UserCog aria-hidden="true" />
													<span>กำหนดบทบาท</span>
												</Button>
											) : (
												<span className="text-xs text-muted-foreground">
													อ่านอย่างเดียว
												</span>
											)}
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
	);
}
