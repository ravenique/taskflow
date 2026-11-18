import type { ActivityLogDto } from "#/shared/schemas/project.schema";

export interface FormattedActivityItem {
	readonly id: string;
	readonly title: string;
	readonly detail: string;
	readonly actorName: string;
	readonly actorEmail: string;
	readonly createdAtLabel: string;
}

const ACTION_LABELS: Record<string, string> = {
	"project.created": "สร้างโปรเจกต์ใหม่",
	"project.updated": "แก้ไขรายละเอียดโปรเจกต์",
	"project.archived": "เก็บถาวรโปรเจกต์",
	"project.restored": "กู้คืนโปรเจกต์กลับมาใช้งาน",
	"project.member_added": "เพิ่มสมาชิกเข้าโปรเจกต์",
	"project.member_role_changed": "เปลี่ยนบทบาทของสมาชิก",
	"project.member_removed": "นำสมาชิกออกจากโปรเจกต์",
	"task.created": "สร้างงานใหม่",
	"task.updated": "แก้ไขรายละเอียดงาน",
	"task.status_changed": "เปลี่ยนสถานะงาน",
	"task.assigned": "อัปเดตผู้รับผิดชอบงาน",
	"task.deleted": "ลบงาน",
	"task.comment_added": "แสดงความคิดเห็นบนงาน",
	"task.comment_deleted": "ลบความคิดเห็นบนงาน",
};

const TASK_STATUS_DISPLAY_LABELS: Record<string, string> = {
	todo: "ต้องทำ",
	in_progress: "เริ่มดำเนินการ",
	in_review: "รอตรวจสอบ",
	done: "เสร็จสิ้น",
	cancelled: "ยกเลิก",
};

function formatTaskStatusLabel(rawStatus: string): string {
	return TASK_STATUS_DISPLAY_LABELS[rawStatus] ?? rawStatus;
}

function formatActivityDetail(log: ActivityLogDto): string {
	const metadata = log.metadata;

	if (
		log.action === "task.status_changed" &&
		typeof metadata.code === "string" &&
		typeof metadata.previousStatus === "string" &&
		typeof metadata.nextStatus === "string"
	) {
		return `${metadata.code}: ${formatTaskStatusLabel(metadata.previousStatus)} -> ${formatTaskStatusLabel(metadata.nextStatus)}`;
	}

	if (log.action === "task.assigned" && typeof metadata.code === "string") {
		return metadata.nextAssigneeId === null
			? `${metadata.code}: ถอดผู้รับผิดชอบ`
			: `${metadata.code}: มอบหมายผู้รับผิดชอบใหม่`;
	}

	if (
		(log.action === "task.created" ||
			log.action === "task.updated" ||
			log.action === "task.deleted") &&
		typeof metadata.code === "string" &&
		typeof metadata.title === "string"
	) {
		return `${metadata.code} — ${metadata.title}`;
	}

	if (
		(log.action === "task.comment_added" ||
			log.action === "task.comment_deleted") &&
		typeof metadata.code === "string"
	) {
		return `บน Task ${metadata.code}`;
	}

	if (
		log.action === "project.member_added" &&
		typeof metadata.roleName === "string"
	) {
		return `มอบบทบาท ${metadata.roleName}`;
	}
	if (
		log.action === "project.member_role_changed" &&
		typeof metadata.previousRoleSlug === "string" &&
		typeof metadata.nextRoleName === "string"
	) {
		return `เปลี่ยนจาก ${metadata.previousRoleSlug} เป็น ${metadata.nextRoleName}`;
	}
	if (
		log.action === "project.member_removed" &&
		typeof metadata.removedRoleSlug === "string"
	) {
		return `บทบาทเดิม ${metadata.removedRoleSlug}`;
	}
	if (typeof metadata.name === "string") {
		return `โปรเจกต์ ${metadata.name}`;
	}
	if (typeof metadata.key === "string") {
		return `รหัส ${metadata.key}`;
	}
	return log.action;
}

export function formatActivityLogItem(
	log: ActivityLogDto,
): FormattedActivityItem {
	return {
		id: log.id,
		title: ACTION_LABELS[log.action] ?? log.action,
		detail: formatActivityDetail(log),
		actorName: log.actorName,
		actorEmail: log.actorEmail,
		createdAtLabel: new Date(log.createdAt).toLocaleString(),
	};
}
