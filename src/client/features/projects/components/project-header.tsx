import { Activity, ArrowLeft, ListTodo, Settings, Users } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useProjectLayout } from "../hooks/use-project-layout";

export function ProjectHeader() {
	const {
		projectId,
		project,
		isPending,
		isOverviewActive,
		isTasksActive,
		isMembersActive,
		isActivityActive,
	} = useProjectLayout();

	return (
		<Card>
			<CardHeader className="gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2.5">
						<AppButtonLink to="/projects" variant="ghost" size="sm">
							<ArrowLeft aria-hidden="true" />
							<span>โครงการทั้งหมด</span>
						</AppButtonLink>
						{isPending ? (
							<Skeleton className="h-6 w-48" />
						) : project ? (
							<>
								<Badge variant="outline">{project.key}</Badge>
								<CardTitle className="text-xl">{project.name}</CardTitle>
								<Badge
									variant={
										project.status === "active" ? "default" : "secondary"
									}
								>
									{project.status === "active" ? "ใช้งานอยู่" : "เก็บถาวร"}
								</Badge>
							</>
						) : null}
					</div>

					{project ? (
						<Badge variant="secondary">
							{project.myRole
								? `บทบาท: ${project.myRole.name}`
								: "สิทธิ์อ่านทั้งหมดระดับระบบ"}
						</Badge>
					) : null}
				</div>

				{project?.description ? (
					<CardDescription>{project.description}</CardDescription>
				) : null}

				<Separator />

				<div className="flex flex-wrap items-center gap-1.5">
					<AppButtonLink
						to="/projects/$projectId"
						params={{ projectId }}
						variant={isOverviewActive ? "secondary" : "ghost"}
						size="sm"
					>
						<Settings aria-hidden="true" />
						<span>ภาพรวม &amp; ตั้งค่า</span>
					</AppButtonLink>
					<AppButtonLink
						to="/projects/$projectId/members"
						params={{ projectId }}
						variant={isMembersActive ? "secondary" : "ghost"}
						size="sm"
					>
						<Users aria-hidden="true" />
						<span>สมาชิก{project ? ` (${project.memberCount})` : ""}</span>
					</AppButtonLink>
					<AppButtonLink
						to="/projects/$projectId/activity"
						params={{ projectId }}
						variant={isActivityActive ? "secondary" : "ghost"}
						size="sm"
					>
						<Activity aria-hidden="true" />
						<span>ประวัติกิจกรรม</span>
					</AppButtonLink>
					<AppButtonLink
						to="/projects/$projectId/tasks"
						params={{ projectId }}
						variant={isTasksActive ? "secondary" : "ghost"}
						size="sm"
					>
						<ListTodo aria-hidden="true" />
						<span>งานทั้งหมด {project ? ` (${project.taskCount})` : ""}</span>
					</AppButtonLink>
				</div>
			</CardHeader>
		</Card>
	);
}
