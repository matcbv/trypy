import { createContext } from 'react';
import type { AuthContextType } from '../../types/contexts';

export const AuthContext = createContext<AuthContextType | null>(null);

AuthContext.displayName = 'AuthContext';
