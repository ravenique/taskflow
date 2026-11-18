import { CheckCircle2, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "#/client/shared/shadcn/components/ui/badge";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useWorkspaceSession } from "../hooks/use-workspace-session";

export function WorkspaceSessionCard() {
	const {
		user,
		sessionExpiresAt,
		authCheckResult,
		isCheckingAuth,
		handleVerifyAuthCheck,
	} = useWorkspaceSession();

	if (!user) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<ShieldCheck className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>เซสชันที่ยืนยันตัวตนแล้วและสิทธิ์ระดับระบบ</CardTitle>
				</div>
				<CardDescription>ข้อมูลผู้ใช้งานและสิทธิ์ระดับระบบ</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-1 text-sm">
					<div className="flex items-center gap-2 font-medium text-foreground">
						<UserRound
							className="size-4 text-muted-foreground"
							aria-hidden="true"
						/>
						<span>{user.name}</span>
					</div>
					<span className="text-muted-foreground">{user.email}</span>
					{sessionExpiresAt ? (
						<span className="text-xs text-muted-foreground">
							เซสชันหมดอายุ: {new Date(sessionExpiresAt).toLocaleString()}
						</span>
					) : null}
				</div>
				<Separator />
				<div className="flex flex-col gap-2">
					<span className="text-xs font-medium text-muted-foreground">
						บทบาทระดับระบบ
					</span>
					<div className="flex flex-wrap gap-1.5">
						{user.systemRoles.length > 0 ? (
							user.systemRoles.map((roleSlug) => (
								<Badge key={roleSlug} variant="secondary">
									{roleSlug}
								</Badge>
							))
						) : (
							<span className="text-xs text-muted-foreground">
								ไม่มีบทบาทระดับระบบ
							</span>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
						<KeyRound className="size-3.5" aria-hidden="true" />
						<span>สิทธิ์ระดับระบบ</span>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{user.systemPermissions.length > 0 ? (
							user.systemPermissions.map((permissionCode) => (
								<Badge key={permissionCode} variant="outline">
									{permissionCode}
								</Badge>
							))
						) : (
							<span className="text-xs text-muted-foreground">
								ไม่มีสิทธิ์ระดับระบบ
							</span>
						)}
					</div>
				</div>
			</CardContent>

			<Separator />

			<CardFooter className="flex flex-wrap items-center justify-between gap-3">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={isCheckingAuth}
					onClick={() => void handleVerifyAuthCheck()}
				>
					{isCheckingAuth ? "กำลังตรวจสอบสิทธิ์..." : "ทดสอบการตรวจสอบสิทธิ์"}
				</Button>
				{authCheckResult ? (
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
						<span>
							ตรวจสอบสิทธิ์สำเร็จ: {authCheckResult.email} (
							{authCheckResult.systemPermissions.length} สิทธิ์)
						</span>
					</div>
				) : null}
			</CardFooter>
		</Card>
	);
}
