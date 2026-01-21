import { HTMLAttributes } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ className = '', children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHeader({ className = '', children, ...props }: TableHeaderProps) {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableBody({ className = '', children, ...props }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-gray-200 bg-white ${className}`} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export function TableRow({ className = '', children, clickable, onClick, ...props }: TableRowProps) {
  return (
    <tr
      className={`${clickable ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableHead({ className = '', children, ...props }: TableHeadProps) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({ className = '', children, ...props }: TableCellProps) {
  return (
    <td className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 ${className}`} {...props}>
      {children}
    </td>
  );
}
