import { Search, X } from "lucide-react";
import { Button } from "#/client/shared/shadcn/components/ui/button";
import { Input } from "#/client/shared/shadcn/components/ui/input";
import { useUsersToolbar } from "../hooks/use-users-toolbar";

export function UsersToolbar() {
	const {
		searchInput,
		totalCount,
		isFetching,
		handleSearchChange,
		handleClearSearch,
	} = useUsersToolbar();

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex w-full max-w-sm items-center gap-2">
				<Search
					className="size-4 shrink-0 text-muted-foreground"
					aria-hidden="true"
				/>
				<Input
					type="search"
					value={searchInput}
					placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
					aria-label="ค้นหาผู้ใช้งาน"
					onChange={(event) => handleSearchChange(event.target.value)}
				/>
				{searchInput ? (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="ล้างคำค้นหา"
						onClick={handleClearSearch}
					>
						<X aria-hidden="true" />
					</Button>
				) : null}
			</div>

			<span className="text-xs text-muted-foreground">
				{isFetching ? "กำลังโหลดข้อมูล..." : `ทั้งหมด ${totalCount} บัญชี`}
			</span>
		</div>
	);
}
