import { FolderKanban } from "lucide-react";
import { AppShellMain } from "#/client/shared/components/app-shell";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/client/shared/shadcn/components/ui/card";
import { Separator } from "#/client/shared/shadcn/components/ui/separator";
import { ArchiveProjectDialog } from "../components/archive-project-dialog";
import { CreateProjectDialog } from "../components/create-project-dialog";
import { EditProjectDialog } from "../components/edit-project-dialog";
import { ProjectsTable } from "../components/projects-table";
import { ProjectsToolbar } from "../components/projects-toolbar";
import { ProjectsProvider } from "../contexts/projects.context";

export function ProjectsScreen() {
	return (
		<ProjectsProvider>
			<AppShellMain className="mx-auto max-w-6xl py-8">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<FolderKanban
								className="size-5 text-primary"
								aria-hidden="true"
							/>
							<CardTitle>รายการโครงการทั้งหมด</CardTitle>
						</div>
						<CardDescription>
							รายการโครงการทั้งหมดที่คุณมีสิทธิ์เข้าถึง (รองรับการค้นหา การเรียงลำดับ
							และแบ่งหน้า)
						</CardDescription>
						<Separator />
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<ProjectsToolbar />
						<ProjectsTable />
					</CardContent>
				</Card>

				<CreateProjectDialog />
				<EditProjectDialog />
				<ArchiveProjectDialog />
			</AppShellMain>
		</ProjectsProvider>
	);
}
