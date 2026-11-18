import type { Cell, ReactTable, RowData } from "@tanstack/react-table";
import {
	createColumnHelper,
	rowPaginationFeature,
	rowSortingFeature,
	tableFeatures,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import type { ReactNode } from "react";
import {
	DEFAULT_PAGE_SIZE,
	PAGE_SIZE_OPTIONS,
} from "#/shared/schemas/pagination.schema";
import { Button } from "../shadcn/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../shadcn/components/ui/select";
import { Skeleton } from "../shadcn/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../shadcn/components/ui/table";

export const serverTableFeatures = tableFeatures({
	rowPaginationFeature,
	rowSortingFeature,
});

export function createServerColumnHelper<TData extends RowData>() {
	return createColumnHelper<typeof serverTableFeatures, TData>();
}

interface AppDataTableProps<TData extends RowData> {
	table: ReactTable<typeof serverTableFeatures, TData>;
	columnCount: number;
	isLoading?: boolean;
	emptyMessage?: string;
	pageSizeOptions?: readonly number[];
	renderCell?: (
		cell: Cell<typeof serverTableFeatures, TData, unknown>,
	) => ReactNode;
}

export function AppDataTable<TData extends RowData>({
	table,
	columnCount,
	isLoading = false,
	emptyMessage = "ไม่พบข้อมูล",
	pageSizeOptions = PAGE_SIZE_OPTIONS,
	renderCell,
}: AppDataTableProps<TData>) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	const rows = table.getRowModel().rows;
	const { pageIndex, pageSize } = table.state.pagination;
	const pageCount = Math.max(1, table.getPageCount());
	const totalRows = table.getRowCount();
	const currentPageSize = pageSize || DEFAULT_PAGE_SIZE;

	const pageSizeItems = pageSizeOptions.map((size) => ({
		label: `${size} / หน้า`,
		value: String(size),
	}));

	return (
		<div className="flex flex-col gap-4">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								if (header.isPlaceholder) {
									return <TableHead key={header.id} />;
								}

								const canSort = header.column.getCanSort();
								const sortedState = header.column.getIsSorted();

								return (
									<TableHead key={header.id}>
										{canSort ? (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="-ml-2 h-8 px-2 font-medium"
												onClick={header.column.getToggleSortingHandler()}
											>
												<table.FlexRender header={header} />
												{sortedState === "asc" ? (
													<ArrowUp className="size-3.5" aria-hidden="true" />
												) : sortedState === "desc" ? (
													<ArrowDown className="size-3.5" aria-hidden="true" />
												) : (
													<ArrowUpDown
														className="size-3.5 text-muted-foreground"
														aria-hidden="true"
													/>
												)}
											</Button>
										) : (
											<table.FlexRender header={header} />
										)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{rows.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columnCount}
								className="h-24 text-center text-muted-foreground"
							>
								{emptyMessage}
							</TableCell>
						</TableRow>
					) : (
						rows.map((row) => (
							<TableRow key={row.id}>
								{row.getAllCells().map((cell) => (
									<TableCell key={cell.id}>
										{renderCell ? (
											renderCell(cell)
										) : (
											<table.FlexRender cell={cell} />
										)}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="flex flex-wrap items-center justify-between gap-3 text-sm">
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>ทั้งหมด {totalRows} รายการ</span>
					<Select
						items={pageSizeItems}
						value={String(currentPageSize)}
						onValueChange={(nextValue) => {
							if (nextValue) {
								table.setPageSize(Number(nextValue));
							}
						}}
					>
						<SelectTrigger size="sm" aria-label="จำนวนรายการต่อหน้า">
							<SelectValue />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger={false} align="end">
							{pageSizeItems.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-1.5">
					<span className="mr-2 text-xs text-muted-foreground">
						หน้า {pageIndex + 1} จาก {pageCount}
					</span>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						aria-label="หน้าแรก"
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.firstPage()}
					>
						<ChevronsLeft aria-hidden="true" />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						aria-label="หน้าก่อนหน้า"
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.previousPage()}
					>
						<ChevronLeft aria-hidden="true" />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						aria-label="หน้าถัดไป"
						disabled={!table.getCanNextPage()}
						onClick={() => table.nextPage()}
					>
						<ChevronRight aria-hidden="true" />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						aria-label="หน้าสุดท้าย"
						disabled={!table.getCanNextPage()}
						onClick={() => table.lastPage()}
					>
						<ChevronsRight aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	);
}
