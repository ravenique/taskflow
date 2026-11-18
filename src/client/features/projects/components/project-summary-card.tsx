import { KeyRound, ShieldAlert } from "lucide-react";
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
import { useProjectDetail } from "../hooks/use-project-detail";

export function ProjectSummaryCard() {
	const { project, isPending, myRole, myPermissions } = useProjectDetail();

	if (isPending || !project) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-40" />
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-fit">
			<CardHeader>
				<div className="flex items-center gap-2">
					<KeyRound className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>ข้อมูลโครงการและสิทธิ์ของคุณ</CardTitle>
				</div>
				<CardDescription>
					สิทธิ์ที่มีผลซึ่งคำนวณจากบทบาทของคุณภายในโครงการนี้
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-4 text-sm">
				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">ผู้สร้างโครงการ</span>
						<span className="font-medium">{project.createdByName}</span>
					</div>
					<div className="flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">สมาชิก / งาน</span>
						<span className="font-medium">
							{project.memberCount} คน / {project.taskCount} งาน
						</span>
					</div>
					<div className="flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">
							บทบาทในโครงการนี้
						</span>
						<div>
							<Badge variant="secondary">
								{myRole
									? `${myRole.name} (${myRole.slug})`
									: "สิทธิ์อ่านทั้งหมดระดับระบบ"}
							</Badge>
						</div>
					</div>
					<div className="flex flex-col gap-0.5">
						<span className="text-xs text-muted-foreground">ลำดับงานล่าสุด</span>
						<span className="font-medium">
							{project.key}-{project.taskSequence}
						</span>
					</div>
				</div>

				<Separator />

				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium text-muted-foreground">
						สิทธิ์ระดับโครงการที่มีผล ({myPermissions.length})
					</span>
					{myPermissions.length > 0 ? (
						<div className="flex flex-wrap gap-1.5">
							{myPermissions.map((code) => (
								<Badge key={code} variant="outline">
									{code}
								</Badge>
							))}
						</div>
					) : (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<ShieldAlert className="size-4" aria-hidden="true" />
							<span>เข้าดูในโหมดอ่านอย่างเดียวผ่านสิทธิ์อ่านโครงการทั้งหมดระดับระบบ</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
