import { Archive, ListTodo, Pencil, RotateCcw, Users } from "lucide-react";
import { AppDataTable } from "#/client/shared/components/app-data-table";
import { AppButtonLink } from "#/client/shared/components/app-link";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import { useProjectsTable } from "../hooks/use-projects-table";

export function ProjectsTable() {
	const {
		table,
		columnCount,
		isPending,
		openEditDialog,
		requestArchiveToggle,
	} = useProjectsTable();

	return (
		<AppDataTable
			table={table}
			columnCount={columnCount}
			isLoading={isPending}
			emptyMessage="ไม่พบโครงการที่ตรงกับเงื่อนไขหรือยังไม่มีโครงการในระบบ"
			renderCell={(cell) => {
				const project = cell.row.original;

				if (cell.column.id === "key") {
					return <Badge variant="outline">{project.key}</Badge>;
				}

				if (cell.column.id === "name") {
					return (
						<div className="flex max-w-xs flex-col gap-0.5">
							<AppButtonLink
								to="/projects/$projectId"
								params={{ projectId: project.id }}
								variant="link"
								size="sm"
								className="h-auto justify-start p-0 text-left font-medium"
							>
								<span className="truncate">{project.name}</span>
							</AppButtonLink>
							{project.description ? (
								<span className="truncate text-xs text-muted-foreground">
									{project.description}
								</span>
							) : null}
						</div>
					);
				}

				if (cell.column.id === "status") {
					return (
						<Badge
							variant={project.status === "active" ? "default" : "secondary"}
						>
							{project.status === "active" ? "ใช้งานอยู่" : "เก็บถาวร"}
						</Badge>
					);
				}

				if (cell.column.id === "memberCount") {
					return (
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<Users className="size-3.5" aria-hidden="true" />
							<span>{project.memberCount}</span>
						</div>
					);
				}

				if (cell.column.id === "taskCount") {
					return (
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<ListTodo className="size-3.5" aria-hidden="true" />
							<span>{project.taskCount}</span>
						</div>
					);
				}

				if (cell.column.id === "myRoleName") {
					return project.myRoleName ? (
						<Badge variant="secondary">{project.myRoleName}</Badge>
					) : (
						<span className="text-xs text-muted-foreground">
							สิทธิ์อ่านทั้งหมดระดับระบบ
						</span>
					);
				}

				if (cell.column.id === "updatedAt") {
					return (
						<span className="text-xs text-muted-foreground">
							{new Date(project.updatedAt).toLocaleString()}
						</span>
					);
				}

				if (cell.column.id === "actions") {
					if (!project.canUpdate) {
						return (
							<span className="text-xs text-muted-foreground">อ่านอย่างเดียว</span>
						);
					}

					const isArchived = project.status === "archived";

					return (
						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isArchived}
								onClick={() => openEditDialog(project)}
							>
								<Pencil aria-hidden="true" />
								<span>แก้ไข</span>
							</Button>
							{isArchived ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => requestArchiveToggle(project, "restore")}
								>
									<RotateCcw aria-hidden="true" />
									<span>กู้คืน</span>
								</Button>
							) : (
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => requestArchiveToggle(project, "archive")}
								>
									<Archive aria-hidden="true" />
									<span>เก็บถาวร</span>
								</Button>
							)}
						</div>
					);
				}

				return <table.FlexRender cell={cell} />;
			}}
		/>
	);
}
