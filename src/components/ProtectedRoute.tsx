import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Login } from './Login';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
};
