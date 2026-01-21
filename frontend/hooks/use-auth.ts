import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { LoginRequest } from '@/types';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      setAuth(response.user, response.token);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
}
