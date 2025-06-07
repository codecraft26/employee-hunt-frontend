'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { getProfile } from '../store/authSlice';
import Cookies from 'js-cookie';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if token exists in cookies and fetch user profile
    const token = Cookies.get('token');
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return <>{children}</>;
}