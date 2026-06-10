import { useAuthContext } from '@/context/AuthContext';

/**
 * Convenience hook to access auth context values.
 * @returns { user, isLoading, login, logout }
 */
export function useAuth() {
  return useAuthContext();
}
