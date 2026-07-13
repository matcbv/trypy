import { createHighlighter } from 'shiki';

export const highlighter = await createHighlighter({
	themes: ['catppuccin-frappe'],
	langs: ['python'],
});
