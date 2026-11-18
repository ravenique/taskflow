import { Activity, ArrowUpRight, Clock } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
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

export function WorkspaceRecentActivityCard() {
	const { recentActivities, isPending } = useWorkspaceOverview();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Activity className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>กิจกรรมล่าสุดในพื้นที่ทำงาน</CardTitle>
				</div>
				<CardDescription>
					เหตุการณ์ล่าสุด 10 รายการจากโครงการทั้งหมดที่คุณมีสิทธิ์เข้าดู
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isPending ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
					</div>
				) : recentActivities.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						ยังไม่มีประวัติกิจกรรมในพื้นที่ทำงาน
					</p>
				) : (
					recentActivities.map((item, index) => (
						<div key={item.id} className="flex flex-col gap-3">
							<div className="flex flex-wrap items-start justify-between gap-2 text-sm">
								<div className="flex flex-col gap-0.5">
									<span className="font-medium text-foreground">
										{item.title}
									</span>
									<span className="text-xs text-muted-foreground">
										{item.detail} &mdash; โดย {item.actorName}
									</span>
									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Clock className="size-3" aria-hidden="true" />
										<span>{item.createdAtLabel}</span>
									</div>
								</div>

								{item.taskId ? (
									<AppButtonLink
										to="/projects/$projectId/tasks/$taskId"
										params={{
											projectId: item.projectId,
											taskId: item.taskId,
										}}
										variant="ghost"
										size="sm"
									>
										<span>ดูงาน</span>
										<ArrowUpRight aria-hidden="true" />
									</AppButtonLink>
								) : (
									<AppButtonLink
										to="/projects/$projectId/activity"
										params={{ projectId: item.projectId }}
										variant="ghost"
										size="sm"
									>
										<span>ดูโครงการ</span>
										<ArrowUpRight aria-hidden="true" />
									</AppButtonLink>
								)}
							</div>
							{index < recentActivities.length - 1 ? <Separator /> : null}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
