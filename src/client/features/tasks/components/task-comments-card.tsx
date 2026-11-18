import {
	Loader2,
	Lock,
	MessageSquare,
	ShieldAlert,
	Trash2,
} from "lucide-react";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { FieldGroup } from "#/client/shared/shadcn/components/ui/field";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { useTaskComments } from "../hooks/use-task-comments";

export function TaskCommentsCard() {
	const {
		comments,
		canCreateComment,
		isArchived,
		deletingCommentId,
		handleDeleteComment,
		form,
	} = useTaskComments();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<MessageSquare className="size-5 text-primary" aria-hidden="true" />
					<CardTitle>ความคิดเห็น ({comments.length})</CardTitle>
				</div>
				<CardDescription>
					แลกเปลี่ยนความคืบหน้าและข้อมูลเพิ่มเติมกับสมาชิกในโครงการ
				</CardDescription>
				<Separator />
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{comments.length === 0 ? (
					<p className="text-sm text-muted-foreground">ยังไม่มีความคิดเห็นบนงานนี้</p>
				) : (
					<div className="flex flex-col gap-3">
						{comments.map((comment, index) => {
							const isDeletingThis = deletingCommentId === comment.id;

							return (
								<div key={comment.id} className="flex flex-col gap-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex flex-col gap-1">
											<div className="flex flex-wrap items-center gap-2 text-xs">
												<span className="font-medium text-foreground">
													{comment.authorName}
												</span>
												<span className="text-muted-foreground">
													({comment.authorEmail})
												</span>
												<span className="text-muted-foreground">
													&middot; {comment.createdAtLabel}
												</span>
											</div>
											<p className="text-sm whitespace-pre-wrap text-foreground">
												{comment.body}
											</p>
										</div>

										{comment.canDelete ? (
											<Button
												type="button"
												variant="ghost"
												size="icon-sm"
												aria-label="ลบความคิดเห็น"
												disabled={isDeletingThis}
												onClick={() => void handleDeleteComment(comment.id)}
											>
												{isDeletingThis ? (
													<Loader2
														className="size-4 animate-spin"
														aria-hidden="true"
													/>
												) : (
													<Trash2
														className="size-4 text-destructive"
														aria-hidden="true"
													/>
												)}
											</Button>
										) : null}
									</div>
									{index < comments.length - 1 ? <Separator /> : null}
								</div>
							);
						})}
					</div>
				)}

				<Separator />

				{!canCreateComment ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
						<span>ต้องมีสิทธิ์แสดงความคิดเห็นจึงจะเพิ่มความคิดเห็นได้</span>
					</div>
				) : isArchived ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Lock className="size-4 shrink-0" aria-hidden="true" />
						<span>ไม่สามารถเพิ่มหรือลบความคิดเห็นในโครงการที่ถูกเก็บถาวรแล้ว</span>
					</div>
				) : (
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
								<form.AppField name="body">
									{(field) => (
										<field.TextareaField
											label="เพิ่มความคิดเห็นใหม่"
											rows={3}
											placeholder="พิมพ์ข้อความความคิดเห็นของคุณ..."
										/>
									)}
								</form.AppField>

								<div className="flex justify-end">
									<form.SubmitButton loadingLabel="กำลังส่ง...">
										ส่งความคิดเห็น
									</form.SubmitButton>
								</div>
							</FieldGroup>
						</form.AppForm>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
