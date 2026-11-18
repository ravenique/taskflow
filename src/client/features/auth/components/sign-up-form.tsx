import { UserRoundPlus } from "lucide-react";
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
import { useSignUpForm } from "../hooks/use-sign-up-form";

export function SignUpForm() {
	const { form } = useSignUpForm();

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center gap-2">
					<UserRoundPlus className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>สมัครสมาชิก TaskFlow</CardTitle>
				</div>
				<CardDescription>
					สร้างบัญชีใหม่เพื่อเริ่มจัดการโครงการและงานร่วมกับทีม
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
							<form.AppField name="name">
								{(field) => (
									<field.TextField
										label="ชื่อที่แสดง"
										type="text"
										placeholder="เช่น สมชาย ใจดี"
										autoComplete="name"
									/>
								)}
							</form.AppField>

							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="อีเมล"
										type="email"
										placeholder="member@taskflow.local"
										autoComplete="email"
									/>
								)}
							</form.AppField>

							<form.AppField name="password">
								{(field) => (
									<field.TextField
										label="รหัสผ่าน"
										type="password"
										placeholder="อย่างน้อย 8 ตัวอักษร"
										autoComplete="new-password"
									/>
								)}
							</form.AppField>

							<form.AppField name="confirmPassword">
								{(field) => (
									<field.TextField
										label="ยืนยันรหัสผ่าน"
										type="password"
										placeholder="กรอกรหัสผ่านอีกครั้ง"
										autoComplete="new-password"
									/>
								)}
							</form.AppField>

							<form.SubmitButton
								className="w-full"
								loadingLabel="กำลังสร้างบัญชี..."
							>
								สมัครสมาชิก
							</form.SubmitButton>
						</FieldGroup>
					</form.AppForm>
				</form>
			</CardContent>
			<Separator />
			<CardFooter className="justify-center text-sm text-muted-foreground">
				<span>มีบัญชีผู้ใช้งานอยู่แล้ว?</span>
				<AppButtonLink to="/sign-in" className="ml-1.5">
					เข้าสู่ระบบ
				</AppButtonLink>
			</CardFooter>
		</Card>
	);
}
