import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '../auth/auth-context';

interface ColumnDefinition<T> {
  header: string;
  accessorKey: keyof T | string;
  permission?: string;
  cell?: (item: T) => ReactNode;
}

interface PermissionAwareTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
}

/**
 * A table component that respects column-level permissions
 * Usage:
 * <PermissionAwareTable
 *   data={users}
 *   columns={[
 *     { header: 'Name', accessorKey: 'name' },
 *     { header: 'Email', accessorKey: 'email', permission: 'users.view_email' },
 *     { header: 'Phone', accessorKey: 'phone', permission: 'users.view_phone' },
 *   ]}
 * />
 */
export function PermissionAwareTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  className = '',
}: PermissionAwareTableProps<T>) {
  const { hasSpecificPermission } = useAuth();

  // Filter columns based on permissions
  const visibleColumns = columns.filter(column => 
    !column.permission || hasSpecificPermission(column.permission)
  );

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow 
              key={rowIndex} 
              className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {visibleColumns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.cell ? column.cell(item) : 
                    // Support nested properties using dot notation
                    typeof column.accessorKey === 'string' && column.accessorKey.includes('.') ?
                    column.accessorKey.split('.').reduce((obj, key) => obj && obj[key], item) :
                    item[column.accessorKey as keyof T]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default PermissionAwareTable;
