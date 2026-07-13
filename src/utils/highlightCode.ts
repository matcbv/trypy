import { highlighter } from '../lib/shiki';

export function highlightCode(code: string) {
	return highlighter.codeToHtml(code, {
		lang: 'python',
		theme: 'catppuccin-frappe',
	});
}
