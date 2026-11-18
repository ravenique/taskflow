import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../shadcn/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "../shadcn/components/ui/field";
import { Input } from "../shadcn/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../shadcn/components/ui/select";
import { Textarea } from "../shadcn/components/ui/textarea";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

interface AppFormTextFieldProps {
	label: string;
	type?: "text" | "email" | "password" | "date";
	placeholder?: string;
	autoComplete?: string;
	description?: string;
	disabled?: boolean;
}

function normalizeFieldErrors(
	errors: ReadonlyArray<unknown>,
): Array<{ message?: string } | undefined> {
	return errors.map((error) => {
		if (typeof error === "string") {
			return {
				message: error,
			};
		}
		if (
			typeof error === "object" &&
			error !== null &&
			"message" in error &&
			typeof error.message === "string"
		) {
			return { message: error.message };
		}
		return undefined;
	});
}

export function AppFormTextField({
	label,
	type = "text",
	placeholder,
	autoComplete,
	description,
	disabled,
}: AppFormTextFieldProps) {
	const field = useFieldContext<string>();
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const normalizedErrors = normalizeFieldErrors(field.state.meta.errors);

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				name={field.name}
				type={type}
				value={field.state.value}
				placeholder={placeholder}
				autoComplete={autoComplete}
				disabled={disabled}
				aria-invalid={isInvalid}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
			/>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			{isInvalid ? <FieldError errors={normalizedErrors} /> : null}
		</Field>
	);
}

interface AppFormSubmitButtonProps {
	children: ReactNode;
	loadingLabel?: string;
	className?: string;
	disabled?: boolean;
}

export function AppFormSubmitButton({
	children,
	loadingLabel,
	className,
	disabled = false,
}: AppFormSubmitButtonProps) {
	const form = useFormContext();

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					type="submit"
					className={className}
					disabled={disabled || isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							<span>{loadingLabel ?? children}</span>
						</>
					) : (
						children
					)}
				</Button>
			)}
		</form.Subscribe>
	);
}

interface AppFormTextareaFieldProps {
	label: string;
	placeholder?: string;
	description?: string;
	disabled?: boolean;
	rows?: number;
}

export function AppFormTextareaField({
	label,
	placeholder,
	description,
	disabled,
	rows = 3,
}: AppFormTextareaFieldProps) {
	const field = useFieldContext<string>();
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const normalizedErrors = normalizeFieldErrors(field.state.meta.errors);

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Textarea
				id={field.name}
				name={field.name}
				rows={rows}
				value={field.state.value}
				placeholder={placeholder}
				disabled={disabled}
				aria-invalid={isInvalid}
				onBlur={field.handleBlur}
				onChange={(event) => field.handleChange(event.target.value)}
			/>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			{isInvalid ? <FieldError errors={normalizedErrors} /> : null}
		</Field>
	);
}

export interface AppFormSelectOption {
	label: string;
	value: string;
}

interface AppFormSelectFieldProps {
	label: string;
	options: readonly AppFormSelectOption[];
	placeholder?: string;
	description?: string;
	disabled?: boolean;
}

export function AppFormSelectField({
	label,
	options,
	placeholder,
	description,
	disabled,
}: AppFormSelectFieldProps) {
	const field = useFieldContext<string>();
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;
	const normalizedErrors = normalizeFieldErrors(field.state.meta.errors);

	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Select
				items={options}
				value={field.state.value || null}
				disabled={disabled}
				onValueChange={(nextValue) => {
					if (nextValue) {
						field.handleChange(nextValue);
					}
				}}
			>
				<SelectTrigger
					id={field.name}
					className="w-full"
					aria-invalid={isInvalid}
					onBlur={field.handleBlur}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent alignItemWithTrigger={false}>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{description ? <FieldDescription>{description}</FieldDescription> : null}
			{isInvalid ? <FieldError errors={normalizedErrors} /> : null}
		</Field>
	);
}

export const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField: AppFormTextField,
		TextareaField: AppFormTextareaField,
		SelectField: AppFormSelectField,
	},
	formComponents: {
		SubmitButton: AppFormSubmitButton,
	},
});
