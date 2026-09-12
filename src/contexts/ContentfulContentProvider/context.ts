import { createContext } from 'react';
import type { ContentfulContentContextType } from '../../types/contexts';

export const ContentfulContentContext =
	createContext<ContentfulContentContextType | null>(null);

ContentfulContentContext.displayName = 'ContentfulContentContext';
