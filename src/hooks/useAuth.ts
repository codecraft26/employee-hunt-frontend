// hooks/useAuth.ts
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from './redux';
import { logout } from '../store/authSlice';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated, token } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      // Clear the token cookie
      Cookies.remove('token');
      
      // Clear any other local storage items (if you have any)
      localStorage.removeItem('deviceToken');
      sessionStorage.clear();
      
      // Dispatch logout action to clear Redux state
      dispatch(logout());
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if there's an error
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';

  return {
    user,
    token,
    isLoading,
    error,
    isAdmin,
    isUser,
    isAuthenticated,
    logout: handleLogout,
  };
};