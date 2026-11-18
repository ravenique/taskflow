import type { TaskPriority, TaskStatus } from "#/shared/schemas/task.schema";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
	todo: "ต้องทำ",
	in_progress: "กำลังดำเนินการ",
	in_review: "รอตรวจสอบ",
	done: "เสร็จสิ้น",
	cancelled: "ยกเลิก",
};

export const TASK_STATUS_BADGE_VARIANTS: Record<
	TaskStatus,
	"outline" | "secondary" | "default" | "destructive"
> = {
	todo: "outline",
	in_progress: "default",
	in_review: "secondary",
	done: "secondary",
	cancelled: "destructive",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
	low: "ต่ำ",
	medium: "กลาง",
	high: "สูง",
	urgent: "เร่งด่วน",
};

export const TASK_PRIORITY_BADGE_VARIANTS: Record<
	TaskPriority,
	"outline" | "secondary" | "default" | "destructive"
> = {
	low: "outline",
	medium: "secondary",
	high: "default",
	urgent: "destructive",
};

export const TASK_STATUS_FILTER_OPTIONS = [
	{ label: "สถานะทั้งหมด", value: "all" },
	{ label: "ต้องทำ", value: "todo" },
	{ label: "กำลังดำเนินการ", value: "in_progress" },
	{ label: "รอตรวจสอบ", value: "in_review" },
	{ label: "เสร็จสิ้น", value: "done" },
	{ label: "ยกเลิก", value: "cancelled" },
] as const;

export const TASK_PRIORITY_FILTER_OPTIONS = [
	{ label: "ความสำคัญทั้งหมด", value: "all" },
	{ label: "ต่ำ", value: "low" },
	{ label: "กลาง", value: "medium" },
	{ label: "สูง", value: "high" },
	{ label: "เร่งด่วน", value: "urgent" },
] as const;

export function formatTaskDueDate(isoDate: string | null): string {
	if (!isoDate) {
		return "ไม่ระบุ";
	}
	return new Date(isoDate).toLocaleDateString("th-TH", {
		timeZone: "UTC",
		dateStyle: "medium",
	});
}
