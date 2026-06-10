import React from 'react';
import { format } from 'date-fns';
import { ToggleLeft, ToggleRight, Trash2, Mail, Hash, Building2 } from 'lucide-react';
import type { AppUser } from '@/types';
import { Badge } from '@/components/ui/Badge';

const ROLE_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'purple' | 'neutral'> = {
  student: 'info',
  staff:   'success',
  admin:   'warning',
  guest:   'neutral',
};

interface UserCardProps {
  user: AppUser;
  onDelete: (user: AppUser) => void;
  onToggleActive: (user: AppUser) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onDelete, onToggleActive }) => {
  const enrolledDate = user.enrolledAt ? format(new Date(user.enrolledAt), 'MMM d, yyyy') : null;

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-card transition-all hover:shadow-elevated ${
        user.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-brand-700">
              {(user.name ?? '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name ?? <span className="italic text-slate-400">Unnamed</span>}</p>
            <p className="uid-text text-slate-400">{user.cardUID}</p>
          </div>
        </div>
        <Badge variant={ROLE_VARIANTS[user.role ?? ''] ?? 'neutral'}>
          {user.role ?? '—'}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Hash className="h-3 w-3 flex-shrink-0" />
          <span>{user.employeeId ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Building2 className="h-3 w-3 flex-shrink-0" />
          <span>{user.department ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span>{enrolledDate ? `Enrolled ${enrolledDate} by ${user.enrolledBy ?? 'ESP32'}` : 'Enrolled via RFID scan'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onToggleActive(user)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            user.isActive
              ? 'text-emerald-600 hover:bg-emerald-50'
              : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          {user.isActive ? (
            <ToggleRight className="h-4 w-4" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
          {user.isActive ? 'Active' : 'Inactive'}
        </button>
        <button
          onClick={() => onDelete(user)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCard;
