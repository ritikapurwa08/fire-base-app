import { useAuthContext } from "@/components/auth-provider";

export const useAuth = () => {
  const { user, loading } = useAuthContext();
  return { user, loading };
};
