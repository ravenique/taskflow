import { ArrowRight, Loader2, Lock, ShieldAlert } from "lucide-react";
import {
	TASK_STATUS_BADGE_VARIANTS,
	TASK_STATUS_LABELS,
} from "#/client/shared/helpers/task-display";
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
import { useTaskStatusActions } from "../hooks/use-task-status-actions";
import { TASK_STATUS_TRANSITION_LABELS } from "../models/task-ui";

export function TaskStatusActionsCard() {
	const {
		currentStatus,
		allowedTransitions,
		canUpdateTask,
		isArchived,
		isTransitioning,
		pendingStatus,
		handleTransition,
	} = useTaskStatusActions();

	if (!currentStatus) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle>เปลี่ยนสถานะงาน</CardTitle>
					<Badge variant={TASK_STATUS_BADGE_VARIANTS[currentStatus]}>
						{TASK_STATUS_LABELS[currentStatus]}
					</Badge>
				</div>
				<CardDescription>
					แสดงเฉพาะสถานะถัดไปที่สามารถเปลี่ยนได้ตามขั้นตอนการทำงาน
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{!canUpdateTask ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
						<span>ต้องมีสิทธิ์แก้ไขงานจึงจะเปลี่ยนสถานะงานได้</span>
					</div>
				) : isArchived ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Lock className="size-4 shrink-0" aria-hidden="true" />
						<span>ไม่สามารถเปลี่ยนสถานะในโครงการที่ถูกเก็บถาวรแล้ว</span>
					</div>
				) : allowedTransitions.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						ไม่มีสถานะถัดไปสำหรับสถานะนี้
					</p>
				) : (
					allowedTransitions.map((nextStatus) => {
						const isLoadingThis =
							isTransitioning && pendingStatus === nextStatus;

						return (
							<Button
								key={nextStatus}
								type="button"
								variant={nextStatus === "cancelled" ? "outline" : "secondary"}
								className="justify-between"
								disabled={isTransitioning}
								onClick={() => void handleTransition(nextStatus)}
							>
								<span>{TASK_STATUS_TRANSITION_LABELS[nextStatus]}</span>
								{isLoadingThis ? (
									<Loader2 className="size-4 animate-spin" aria-hidden="true" />
								) : (
									<ArrowRight className="size-4" aria-hidden="true" />
								)}
							</Button>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
