"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import { Input } from "@/components/ui/input";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterableColumns?: string[]; // Array of column IDs that can be filtered
  searchPlaceholder?: string;
  searchColumn?: string; // Column ID to use for the main search functionality
}

// Helper function to get a friendly name for a column
const getColumnDisplayName = (columnId: string): string => {
  // Convert from camelCase or snake_case to Title Case with spaces
  const withSpaces = columnId.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterableColumns = [],
  searchPlaceholder,
  searchColumn = "company_name", // Default to "company_name" for backward compatibility
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        // Hide columns that have meta.isHidden = true
        ...columns.reduce((acc, column) => {
          if (column.meta && (column.meta as any).isHidden) {
            acc[column.id || ''] = false;
          }
          return acc;
        }, {} as Record<string, boolean>),
      },
    },
    state: {
      columnFilters,
      sorting,
    },
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search/Filter Section */}
      {(filterableColumns.length > 0 || searchPlaceholder) && (
        <div className="flex flex-wrap items-center gap-4 py-4 px-4 flex-none border-b">
          {searchPlaceholder && (
            <div className="flex-1">
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                onChange={(event) => 
                  table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                }
                className="max-w-xs"
              />
            </div>
          )}
          
          {filterableColumns.map((columnId) => {
            const column = table.getColumn(columnId);
            if (!column) return null;

            // Get a friendly display name for the column
            const displayName = (() => {
              // Predefined mapping for common columns
              const columnMapping: Record<string, string> = {
                company_name: "Company Name",
                mc_number: "MC Number",
                truck_type: "Truck Type",
                status: "Status",
                email_address: "Email",
                phone_number: "Phone",
                owner_name: "Owner",
              };

              if (columnMapping[columnId]) {
                return columnMapping[columnId];
              }

              return getColumnDisplayName(columnId);
            })();

            return (
              <div key={columnId} className="flex items-center gap-2">
                <Input
                  placeholder={`Filter ${displayName}...`}
                  value={(column.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    column.setFilterValue(event.target.value)
                  }
                  className="max-w-xs"
                  aria-label={`Filter by ${displayName}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Table with fixed header and scrollable body */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="overflow-auto w-full h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex items-center gap-1 cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          role="button"
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              const handler = header.column.getToggleSortingHandler();
                              if (handler) handler(event);
                            }
                          }}
                          aria-label={
                            header.column.getCanSort()
                              ? `Sort by ${header.column.id}`
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-background">
        <div className="flex items-center text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{" "}
          of {data.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm mx-2">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}