import React from 'react';

type BadgeStatus =
  | 'Free'
  | 'Occupied'
  | 'Reserved'
  | 'Merged'
  | 'In Stock'
  | 'Low Stock'
  | 'Out of Stock'
  | 'Paid'
  | 'Unpaid'
  | 'Pending'
  | 'Ready'
  | 'Active'
  | 'Cancelled'
  | 'Draft'
  | 'Sent';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getColors = (s: string) => {
    switch (s) {
      case 'Free':
      case 'In Stock':
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Occupied':
      case 'Low Stock':
      case 'Pending':
      case 'Active':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Reserved':
      case 'Merged':
      case 'Sent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Out of Stock':
      case 'Unpaid':
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Ready':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClass} ${getColors(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {status}
    </span>
  );
};
