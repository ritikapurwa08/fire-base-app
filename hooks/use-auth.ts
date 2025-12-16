import { useAuthContext } from '@/components/auth-provider';

export const useAuth = () => {
  const { user, loading, refreshUser } = useAuthContext();
  return { user, loading, refreshUser };
};
