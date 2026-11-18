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
import { useProjectActivity } from "../hooks/use-project-activity";

export function ProjectActivityFeedCard() {
	const { items, isPending } = useProjectActivity();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Activity className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>ประวัติกิจกรรมของโครงการ</CardTitle>
				</div>
				<CardDescription>
					บันทึกเหตุการณ์สำคัญทั้งหมดที่เกิดขึ้นภายในโครงการ
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isPending ? (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-14 w-full" />
						<Skeleton className="h-14 w-full" />
					</div>
				) : items.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						ยังไม่มีประวัติกิจกรรมในโครงการนี้
					</p>
				) : (
					items.map((item, index) => (
						<div key={item.id} className="flex flex-col gap-3">
							<div className="flex flex-wrap items-start justify-between gap-2 text-sm">
								<div className="flex flex-col gap-0.5">
									<span className="font-medium text-foreground">
										{item.title}
									</span>
									<span className="text-xs text-muted-foreground">
										{item.detail} &mdash; โดย {item.actorName} (
										{item.actorEmail})
									</span>
								</div>
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Clock className="size-3.5" aria-hidden="true" />
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
