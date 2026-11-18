import { cn } from "cn";
import type { ComponentProps } from "react";

export function AppShellRoot({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex min-h-svh flex-col items-center justify-center p-4",
				className,
			)}
			{...props}
		/>
	);
}

export function AppShellHeader({
	className,
	...props
}: ComponentProps<"header">) {
	return (
		<header
			className={cn(
				"flex min-h-12 w-full items-center justify-center py-2",
				className,
			)}
			{...props}
		/>
	);
}

export function AppShellMain({ className, ...props }: ComponentProps<"main">) {
	return (
		<main
			className={cn("flex w-full flex-1 flex-col gap-4", className)}
			{...props}
		/>
	);
}

export function AppShellFooter({
	className,
	...props
}: ComponentProps<"footer">) {
	return (
		<footer
			className={cn("flex items-center justify-between text-xs", className)}
			{...props}
		/>
	);
}
