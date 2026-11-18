import { DeleteProjectDialog } from "../components/delete-project-dialog";
import { ProjectSettingsCard } from "../components/project-settings-card";
import { ProjectSummaryCard } from "../components/project-summary-card";
import { ProjectOverviewProvider } from "../contexts/project-overview.context";

export function ProjectOverviewScreen() {
	return (
		<ProjectOverviewProvider>
			<div className="grid gap-6 md:grid-cols-2">
				<ProjectSummaryCard />
				<ProjectSettingsCard />
			</div>
			<DeleteProjectDialog />
		</ProjectOverviewProvider>
	);
}
