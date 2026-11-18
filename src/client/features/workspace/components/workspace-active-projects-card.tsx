import { ArrowUpRight, FolderKanban, ListTodo, Users } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useWorkspaceOverview } from "../hooks/use-workspace-overview";

export function WorkspaceActiveProjectsCard() {
	const { activeProjects, isPending } = useWorkspaceOverview();

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<FolderKanban className="size-5 text-primary" aria-hidden="true" />
						<CardTitle>โครงการที่กำลังดำเนินการ</CardTitle>
					</div>
					<AppButtonLink to="/projects" variant="outline" size="sm">
						<span>ดูทั้งหมด</span>
						<ArrowUpRight aria-hidden="true" />
					</AppButtonLink>
				</div>
				<CardDescription>
					ทางลัดเข้าสู่โครงการล่าสุด 5 อันดับแรกที่คุณมีสิทธิ์เข้าถึง
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isPending ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
					</div>
				) : activeProjects.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						ยังไม่มีโครงการที่กำลังเปิดใช้งานในขณะนี้
					</p>
				) : (
					activeProjects.map((project, index) => (
						<div key={project.id} className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="flex min-w-0 flex-col gap-1">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant="outline">{project.key}</Badge>
										<AppButtonLink
											to="/projects/$projectId"
											params={{ projectId: project.id }}
											variant="link"
											size="sm"
											className="h-auto p-0 font-medium"
										>
											<span className="truncate">{project.name}</span>
										</AppButtonLink>
									</div>
									<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<ListTodo className="size-3.5" aria-hidden="true" />
											<span>งานค้าง {project.openTaskCount}</span>
										</span>
										<span className="flex items-center gap-1">
											<Users className="size-3.5" aria-hidden="true" />
											<span>สมาชิก {project.memberCount}</span>
										</span>
										<span>
											{project.myRoleName
												? `บทบาท: ${project.myRoleName}`
												: "System Read-All"}
										</span>
									</div>
								</div>

								<AppButtonLink
									to="/projects/$projectId/tasks"
									params={{ projectId: project.id }}
									variant="secondary"
									size="sm"
								>
									<ListTodo aria-hidden="true" />
									<span>เปิดดูงาน</span>
								</AppButtonLink>
							</div>
							{index < activeProjects.length - 1 ? <Separator /> : null}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
