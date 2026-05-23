import { createContext } from 'react';
import type { NavigationContextType } from '../../types/contexts';

export const NavigationContext = createContext<NavigationContextType | null>(
	null,
);

NavigationContext.displayName = 'NavigationContext';
