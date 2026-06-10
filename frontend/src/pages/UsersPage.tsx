import React, { useState, useCallback } from 'react';
import { LayoutGrid, List, Search, UserPlus } from 'lucide-react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import UserCard from '@/components/users/UserCard';
import UserTable from '@/components/users/UserTable';
import DeleteUserModal from '@/components/users/DeleteUserModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { setUserActive } from '@/services/firebase/users';
import { useNavigate } from 'react-router-dom';
import type { AppUser } from '@/types';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'table';

const UsersPage: React.FC = () => {
  const { users, isLoading } = useAttendanceContext();
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState<ViewMode>('table');
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name        ?? '').toLowerCase().includes(q) ||
      (u.cardUID     ?? '').toLowerCase().includes(q) ||
      (u.employeeId  ?? '').toLowerCase().includes(q) ||
      (u.department  ?? '').toLowerCase().includes(q)
    );
  });

  const handleToggleActive = useCallback(async (user: AppUser) => {
    try {
      await setUserActive(user.cardUID, !user.isActive);
      toast.success(`${user.name} marked as ${!user.isActive ? 'active' : 'inactive'}`);
    } catch {
      toast.error('Failed to update user status');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48">
          <Input
            id="users-search"
            placeholder="Search by name, UID, ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftAddon={<Search className="h-3.5 w-3.5" />}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
            aria-label="Table view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="h-4 w-4" />}
          onClick={() => navigate('/enrollment')}
        >
          Enroll Card
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        {filteredUsers.length} of {users.length} users
      </p>

      {/* Content */}
      {viewMode === 'table' ? (
        <UserTable
          users={filteredUsers}
          onDelete={setDeleteTarget}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.cardUID}
              user={user}
              onDelete={setDeleteTarget}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <DeleteUserModal
        user={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UsersPage;
