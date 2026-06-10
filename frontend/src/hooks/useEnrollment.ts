import { useCallback, useEffect, useRef } from 'react';
import { useAttendanceContext } from '@/context/AttendanceContext';
import { startEnrollmentMode, stopEnrollmentMode } from '@/services/firebase/enrollment';
import { createUser, isCardRegistered } from '@/services/firebase/users';
import type { AppUser } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';


/**
 * Hook encapsulating all enrollment mode logic.
 * Handles start, cancel, timeout, and form submission.
 */
export function useEnrollment() {
  const { enrollmentStep, pendingCardUID, dispatch, timeoutAt } = useAttendanceContext();
  const { user } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout ref on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /**
   * Starts enrollment mode: writes enrollMode = true to RTDB,
   * transitions UI to 'waiting', and starts the 60-second timeout.
   */
  const startEnrollment = useCallback(async (): Promise<void> => {
    try {
      await startEnrollmentMode();
      dispatch({ type: 'SET_ENROLLMENT_STEP', payload: 'waiting' });
      // No auto-cancel timeout — stays active until card scanned or manually cancelled
    } catch (error) {
      toast.error('Failed to start enrollment mode');
      console.error('[Enrollment] startEnrollment error:', error);
    }
  }, [dispatch]);

  /**
   * Cancels enrollment at any stage: writes enrollMode = false,
   * clears pendingCardUID, and resets UI to 'idle'.
   */
  const cancelEnrollment = useCallback(async (): Promise<void> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    try {
      await stopEnrollmentMode();
    } catch (error) {
      console.error('[Enrollment] cancelEnrollment error:', error);
    }
    dispatch({ type: 'SET_ENROLLMENT_STEP', payload: 'idle' });
    dispatch({ type: 'SET_PENDING_UID', payload: '' });
    dispatch({ type: 'SET_TIMEOUT_AT', payload: null });
  }, [dispatch]);

  /**
   * Submits the enrollment form:
   *   1. Checks for duplicate UID
   *   2. Writes user to users/{cardUID}
   *   3. Clears pendingCardUID and sets enrollMode = false
   *   4. Shows success toast and transitions to 'success' step
   *
   * @param formData — user fields collected from EnrollmentForm
   * @returns Promise<boolean> — true on success, false on failure/duplicate
   */
  const submitEnrollment = useCallback(async (
    formData: Omit<AppUser, 'cardUID' | 'enrolledAt' | 'enrolledBy' | 'isActive'>
  ): Promise<boolean> => {
    if (!pendingCardUID || !user) return false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      // Check for duplicate
      const alreadyRegistered = await isCardRegistered(pendingCardUID);
      if (alreadyRegistered) {
        toast.error(`Card ${pendingCardUID} is already registered.`);
        return false;
      }

      const newUser: AppUser = {
        ...formData,
        cardUID: pendingCardUID,
        enrolledAt: Date.now(),
        enrolledBy: user.email ?? 'admin',
        isActive: true,
      };

      await createUser(newUser);
      await stopEnrollmentMode();

      dispatch({ type: 'SET_ENROLLMENT_STEP', payload: 'success' });
      dispatch({ type: 'SET_TIMEOUT_AT', payload: null });
      toast.success(
        `Card ${pendingCardUID} successfully enrolled for ${formData.name}`,
        { duration: 5000 }
      );
      return true;
    } catch (error) {
      toast.error('Failed to save enrollment. Please try again.');
      console.error('[Enrollment] submitEnrollment error:', error);
      return false;
    }
  }, [pendingCardUID, user, dispatch]);

  /**
   * Resets the enrollment flow back to 'idle' after the success screen.
   */
  const resetEnrollment = useCallback(() => {
    dispatch({ type: 'SET_ENROLLMENT_STEP', payload: 'idle' });
    dispatch({ type: 'SET_PENDING_UID', payload: '' });
    dispatch({ type: 'SET_TIMEOUT_AT', payload: null });
  }, [dispatch]);

  return {
    enrollmentStep,
    pendingCardUID,
    timeoutAt,
    startEnrollment,
    cancelEnrollment,
    submitEnrollment,
    resetEnrollment,
  };
}
