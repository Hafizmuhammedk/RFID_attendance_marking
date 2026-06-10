import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { AppUser } from '@/types';
import { deleteUser } from '@/services/firebase/users';
import toast from 'react-hot-toast';

interface DeleteUserModalProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ user, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await deleteUser(user.cardUID);
      toast.success(`${user.name} removed successfully`);
      onClose();
    } catch {
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p className="text-sm text-slate-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">{user?.name}</span>?
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Card UID: <span className="uid-text">{user?.cardUID}</span>
          </p>
          <p className="mt-3 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            This action cannot be undone. Existing attendance records for this card
            will remain but will no longer show a name.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
