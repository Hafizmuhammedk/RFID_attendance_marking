import React from 'react';
import { format } from 'date-fns';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import type { AppUser } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

const ROLE_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'purple' | 'neutral'> = {
  student: 'info',
  staff:   'success',
  admin:   'warning',
  guest:   'neutral',
};

interface UserTableProps {
  users: AppUser[];
  onDelete: (user: AppUser) => void;
  onToggleActive: (user: AppUser) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete, onToggleActive }) => {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users registered"
        description="Use the Enrollment page to register RFID cards to users."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            {['Name', 'Card UID', 'ID', 'Department', 'Role', 'Enrolled', 'Status', ''].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user, index) => (
            <tr
              key={user.cardUID}
              className={`transition-colors hover:bg-slate-50 ${
                !user.isActive ? 'opacity-50' : ''
              } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-700">
                      {(user.name ?? '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{user.name ?? <span className="italic text-slate-400">Unnamed</span>}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="uid-text text-slate-600">{user.cardUID}</span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{user.employeeId ?? '—'}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{user.department ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge variant={ROLE_VARIANTS[user.role ?? ''] ?? 'neutral'}>{user.role ?? '—'}</Badge>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                {user.enrolledAt ? format(new Date(user.enrolledAt), 'MMM d, yyyy') : '—'}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleActive(user)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    user.isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {user.isActive ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                  {user.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete(user)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label={`Delete ${user.name ?? user.cardUID}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
