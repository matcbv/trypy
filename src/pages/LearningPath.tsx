import { useEffect, useState, type CSSProperties } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { ModuleCard } from '../components/ModuleCard';
import type { ModuleCardData } from '../types/content';
import { logError } from '../utils/logger';
import { LoadingPage } from './LoadingPage';
import { themeStyles, type Themes } from '../constants/themeStyle';

export function LearningPath() {
	const [cardContent, setCardContent] = useState<ModuleCardData[]>([]);
	const [initialModuleSlug, setInitialModuleSlug] = useState<string | null>(
		null,
	);

	useEffect(() => {
		void (async () => {
			try {
				const content = await fetchContent({
					contentType: 'moduleCard',
					include: 0,
				});

				setCardContent(() =>
					content.map((card) => ({
						...card.fields,
						theme: card.fields.theme as Themes,
					})),
				);
			} catch (error) {
				logError({
					error,
					text: 'Não foi possível carregar o conteúdo dos cards. Tente novamente ou fale conosco.',
				});
			}
		})();
	}, []);

	useEffect(() => {
		void (async () => {
			try {
				const content = await fetchContent({
					contentType: 'module',
					include: 0,
					order: 1,
				});
				setInitialModuleSlug(content[0]!.fields.slug);
			} catch (error) {
				logError({
					error,
					text: 'Não foi possível carregar o conteúdo dos módulos. Tente novamente ou fale conosco.',
				});
			}
		})();
	}, [setInitialModuleSlug]);

	return cardContent.length <= 0 && !initialModuleSlug ? (
		<LoadingPage />
	) : (
		<div className="font-jetbrains mx-[10px] my-[120px] flex min-h-screen justify-center sm:mx-0">
			<div className="flex flex-col items-center justify-center gap-y-[230px]">
				{cardContent.map((card) => (
					<div
						key={card.moduleId}
						className="relative"
						style={
							{
								'--theme-color': `var(${themeStyles[card.theme].color})`,
								'--shadow-theme-color': `var(${themeStyles[card.theme].shadow})`,
							} as CSSProperties
						}
					>
						<ModuleCard card={card} initialModuleSlug={initialModuleSlug!} />
						<svg className="absolute right-1/2 h-[230px] w-[5px]">
							<polyline
								className="fill-none stroke-(--theme-color) stroke-5"
								points="0,0 0,230"
								strokeDasharray="15"
							/>
						</svg>
					</div>
				))}
			</div>
		</div>
	);
}
