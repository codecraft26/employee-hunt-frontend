'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getProfile } from '../store/authSlice';
import Cookies from 'js-cookie';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isInitializing } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if token exists and user is not already loaded
    const token = Cookies.get('token');
    if (token && isInitializing && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, user, isInitializing]);

  return <>{children}</>;
}