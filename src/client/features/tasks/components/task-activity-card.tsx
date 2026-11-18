import { Activity, Clock } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { Skeleton } from "#/client/shared/shadcn/components/ui/skeleton";
import { useTaskActivity } from "../hooks/use-task-activity";

export function TaskActivityCard() {
	const { items, isPending } = useTaskActivity();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Activity className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>ประวัติกิจกรรมของงาน</CardTitle>
				</div>
				<CardDescription>รายการเหตุการณ์ทั้งหมดที่เกิดขึ้นเฉพาะกับงานนี้</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isPending ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : items.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						ยังไม่มีประวัติกิจกรรมบนงานนี้
					</p>
				) : (
					items.map((item, index) => (
						<div key={item.id} className="flex flex-col gap-3">
							<div className="flex flex-col gap-1 text-sm">
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
							{index < items.length - 1 ? <Separator /> : null}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
