import { z } from "zod";
import { signUpInputSchema } from "#/shared/schemas/auth.schema";

export const signUpFormSchema = signUpInputSchema
	.extend({
		confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
		path: ["confirmPassword"],
	});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
