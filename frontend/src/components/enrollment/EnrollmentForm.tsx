import React, { useState } from 'react';
import { User, Hash, Briefcase, Building2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useEnrollment } from '@/hooks/useEnrollment';
import { isValidName, isValidEmployeeId, isValidDepartment } from '@/services/validation';
import type { UserRole } from '@/types';

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Student',       value: 'student' },
  { label: 'Staff / Faculty', value: 'staff' },
  { label: 'Administrator', value: 'admin' },
  { label: 'Guest',         value: 'guest' },
];

const EnrollmentForm: React.FC = () => {
  const { pendingCardUID, cancelEnrollment, submitEnrollment } = useEnrollment();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    role: 'student' as UserRole,
    department: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = (): boolean => {
    const newErrors: Partial<typeof form> = {};
    if (!isValidName(form.name)) newErrors.name = 'Full name must be 2–100 characters';
    if (!isValidEmployeeId(form.employeeId)) newErrors.employeeId = 'ID must be 3–30 alphanumeric characters';
    if (!isValidDepartment(form.department)) newErrors.department = 'Department must be 2–100 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    const success = await submitEnrollment(form);
    if (!success) setIsLoading(false);
  };

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      {/* Detected card banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-600 text-sm">✓</span>
        </div>
        <div>
          <p className="text-xs text-emerald-600 font-medium">Card detected</p>
          <p className="uid-text text-sm font-bold text-emerald-800">{pendingCardUID}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name */}
        <Input
          id="enroll-name"
          label="Full Name"
          placeholder="e.g. Hafis Muhammed"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          leftAddon={<User className="h-3.5 w-3.5" />}
          required
        />

        {/* Employee / Student ID */}
        <Input
          id="enroll-employee-id"
          label="Employee / Student ID"
          placeholder="e.g. CSA2022001"
          value={form.employeeId}
          onChange={set('employeeId')}
          error={errors.employeeId}
          leftAddon={<Hash className="h-3.5 w-3.5" />}
          required
        />

        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="enroll-role" className="text-sm font-medium text-slate-700">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              id="enroll-role"
              value={form.role}
              onChange={set('role')}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Department */}
        <Input
          id="enroll-department"
          label="Department"
          placeholder="e.g. Computer Applications"
          value={form.department}
          onChange={set('department')}
          error={errors.department}
          leftAddon={<Building2 className="h-3.5 w-3.5" />}
          required
        />

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="enroll-notes" className="text-sm font-medium text-slate-700 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            Notes
            <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="enroll-notes"
            value={form.notes}
            onChange={set('notes')}
            rows={2}
            placeholder="Any additional notes..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={cancelEnrollment}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="flex-1"
          >
            Enroll Card
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;
