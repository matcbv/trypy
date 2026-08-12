export type Themes = 'green' | 'purple' | 'cyan';

interface CardStyleProps {
	color: string;
	highlight: string;
	shadow: string;
}

export const themeStyles: Record<Themes, CardStyleProps> = {
	green: {
		color: '--color-main-green',
		highlight: '--color-highlight-green',
		shadow: '--color-shadow-green',
	},
	purple: {
		color: '--color-main-purple',
		highlight: '--color-highlight-purple',
		shadow: '--color-shadow-purple',
	},
	cyan: {
		color: '--color-main-cyan',
		highlight: '--color-highlight-cyan',
		shadow: '--color-shadow-cyan',
	},
};
