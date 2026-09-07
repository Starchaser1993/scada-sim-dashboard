import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ControlProvider } from './context/ControlContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ControlProvider>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ControlProvider>
    </AuthProvider>
  );
};

export default App;
