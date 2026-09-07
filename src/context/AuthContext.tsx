import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';


interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  mockUsers: User[];
  loginAsMockUser: (username: string) => { success: boolean; error?: string };
}

// Predefined mock users as per requirements
export const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'sinuy123',
    name: 'Yunis Ramirez',
    role: 'admin',
    roleLabel: 'Administrador del Sistema',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'usr-2',
    username: 'operador1',
    password: 'sinuy123',
    name: 'Luis Tapia',
    role: 'operador',
    roleLabel: 'Operador Turno Mañana',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'usr-3',
    username: 'operador2',
    password: 'sinuy123',
    name: 'Matías Aguilera',
    role: 'operador',
    roleLabel: 'Operador Turno Tarde',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'usr-4',
    username: 'supervisor',
    password: 'sinuy123',
    name: 'Sebastian Torres',
    role: 'supervisor',
    roleLabel: 'Supervisor de Planta',
    avatarColor: 'from-amber-500 to-orange-600',
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'scada_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (username: string, password: string) => {
    const userMatch = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!userMatch) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (userMatch.password !== password) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    // Strip password from state
    const { password: _, ...userWithoutPass } = userMatch;
    setCurrentUser(userWithoutPass);
    return { success: true };
  };

  const loginAsMockUser = (username: string) => {
    const userMatch = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!userMatch) {
      return { success: false, error: 'Usuario no encontrado.' };
    }
    const { password: _, ...userWithoutPass } = userMatch;
    setCurrentUser(userWithoutPass);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const publicMockUsers = MOCK_USERS.map(({ password: _, ...u }) => u);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        mockUsers: publicMockUsers,
        loginAsMockUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
