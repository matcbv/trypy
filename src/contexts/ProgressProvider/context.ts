import { createContext } from 'react';
import type { ProgressContextType } from '../../types/contexts';

export const ProgressContext = createContext<ProgressContextType | null>(null);

ProgressContext.displayName = 'ProgressContext';
