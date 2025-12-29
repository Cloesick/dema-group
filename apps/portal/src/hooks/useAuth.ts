import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user;

  return {
    user: user ? {
      ...user,
      isAdmin: user.role === 'admin'
    } : null,
    isLoading,
    isAuthenticated: !!user
  };
}
