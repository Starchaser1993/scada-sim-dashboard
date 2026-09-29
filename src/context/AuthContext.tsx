import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';


interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  mockUsers: User[];
  loginAsMockUser: (username: string) => { success: boolean; error?: string };
}

// SHA-256 hash of the default mock password
const MOCK_PASSWORD_HASH = '9594509de51c24a5853f4a2e30e64cae0431dad7c92f823bf2582775f8c69afe';

const hashPassword = async (text: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Predefined mock users with hashed passwords
export const MOCK_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-1',
    username: 'admin',
    passwordHash: MOCK_PASSWORD_HASH,
    name: 'Yunis Ramirez',
    role: 'admin',
    roleLabel: 'Administrador del Sistema',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'usr-2',
    username: 'operador1',
    passwordHash: MOCK_PASSWORD_HASH,
    name: 'Luis Tapia',
    role: 'operador',
    roleLabel: 'Operador Turno Mañana',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'usr-3',
    username: 'operador2',
    passwordHash: MOCK_PASSWORD_HASH,
    name: 'Matías Aguilera',
    role: 'operador',
    roleLabel: 'Operador Turno Tarde',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'usr-4',
    username: 'supervisor',
    passwordHash: MOCK_PASSWORD_HASH,
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

  const login = async (username: string, password: string) => {
    const userMatch = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!userMatch) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const inputHash = await hashPassword(password);
    if (inputHash !== userMatch.passwordHash) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    // Strip passwordHash from state
    const { passwordHash: _, ...userWithoutPass } = userMatch;
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
    const { passwordHash: _, ...userWithoutPass } = userMatch;
    setCurrentUser(userWithoutPass);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const publicMockUsers = MOCK_USERS.map(({ passwordHash: _, ...u }) => u);

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
