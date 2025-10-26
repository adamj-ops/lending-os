"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { DataTable } from "./data-table";

interface SimpleDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function SimpleDataTable<TData, TValue>({ columns, data }: SimpleDataTableProps<TData, TValue>) {
  const table = useDataTableInstance({ data, columns });

  return <DataTable table={table} columns={columns} />;
}

