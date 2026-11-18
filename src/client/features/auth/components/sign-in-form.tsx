import { LogIn } from "lucide-react";
import { AppButtonLink } from "#/client/shared/components/app-link";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useSignInForm } from "../hooks/use-sign-in-form";

export function SignInForm() {
	const { form } = useSignInForm();

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center gap-2">
					<LogIn className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>เข้าสู่ระบบ TaskFlow</CardTitle>
				</div>
				<CardDescription>
					กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานพื้นที่ทำงานของคุณ
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.AppForm>
						<FieldGroup>
							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="อีเมล"
										type="email"
										placeholder="admin@taskflow.local"
										autoComplete="email"
									/>
								)}
							</form.AppField>

							<form.AppField name="password">
								{(field) => (
									<field.TextField
										label="รหัสผ่าน"
										type="password"
										placeholder="กรอกรหัสผ่านของคุณ"
										autoComplete="current-password"
									/>
								)}
							</form.AppField>

							<form.SubmitButton
								className="w-full"
								loadingLabel="กำลังตรวจสอบสิทธิ์..."
							>
								เข้าสู่ระบบ
							</form.SubmitButton>
						</FieldGroup>
					</form.AppForm>
				</form>
			</CardContent>
			<Separator />
			<CardFooter className="justify-center text-sm text-muted-foreground">
				<span>ยังไม่มีบัญชีผู้ใช้งาน?</span>
				<AppButtonLink to="/sign-up" className="ml-1.5">
					สมัครสมาชิกใหม่
				</AppButtonLink>
			</CardFooter>
		</Card>
	);
}
