import type { TaskStatus } from "#/shared/schemas/task.schema";

export const UNASSIGNED_ASSIGNEE_VALUE = "__unassigned__";

export const TASK_STATUS_TRANSITION_LABELS: Record<TaskStatus, string> = {
	todo: "ย้ายกลับไปต้องทำ",
	in_progress: "เริ่มดำเนินการ",
	in_review: "ส่งตรวจงาน",
	done: "ปิดงานเสร็จสิ้น",
	cancelled: "ยกเลิกงาน",
};

export const TASK_PRIORITY_OPTIONS = [
	{ label: "ต่ำ", value: "low" },
	{ label: "กลาง", value: "medium" },
	{ label: "สูง", value: "high" },
	{ label: "เร่งด่วน", value: "urgent" },
] as const;

export function toDateInputValue(isoDate: string | null): string {
	return isoDate ? isoDate.slice(0, 10) : "";
}
