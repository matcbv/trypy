import { createContext } from 'react';
import type { TerminalContextType } from '../../types/contexts';

export const TerminalContext = createContext<TerminalContextType | null>(null);

TerminalContext.displayName = 'TerminalContext';
