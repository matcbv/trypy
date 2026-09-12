import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
	themes: ['catppuccin-frappe'],
	langs: ['python'],
});

export function highlightCode(code: string) {
	return highlighter.codeToHtml(code, {
		lang: 'python',
		theme: 'catppuccin-frappe',
	});
}
