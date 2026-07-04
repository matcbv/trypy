import { useEffect, useState, type CSSProperties } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { ModuleCard } from '../components/ModuleCard';
import type { ModuleCardData } from '../types/content';
import { logError } from '../utils/logger';
import { LoadingPage } from './LoadingPage';

type Themes = 'green' | 'purple';

interface CardStyleProps {
	cardColor: string;
	slideButtonColor: string;
}

const cardStyles: Record<Themes, CardStyleProps> = {
	green: { cardColor: '--color-main-green', slideButtonColor: '#20663b' },
	purple: { cardColor: '--color-main-purple', slideButtonColor: '#402d66' },
};

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

				setCardContent(() => content.map((card) => card.fields));
			} catch (error) {
				logError(
					error,
					'Não foi possível carregar o conteúdo dos cards. Tente novamente ou fale conosco.',
				);
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
				logError(
					error,
					'Não foi possível carregar o conteúdo dos módulos. Tente novamente ou fale conosco.',
				);
			}
		})();
	}, [setInitialModuleSlug]);

	return cardContent.length <= 0 && !initialModuleSlug ? (
		<LoadingPage />
	) : (
		<div className="font-jetbrains flex min-h-screen justify-center px-20 py-[120px]">
			<div className="flex flex-col items-center justify-center gap-y-[230px]">
				{cardContent.map((card) => (
					<div
						key={card.moduleId}
						className="relative"
						style={
							{
								'--card-color': `var(${cardStyles[card.theme as Themes].cardColor})`,
								'--slide-button-color': `${cardStyles[card.theme as Themes].slideButtonColor}`,
							} as CSSProperties
						}
					>
						<ModuleCard card={card} initialModuleSlug={initialModuleSlug!} />
						<svg className="absolute right-1/2 h-[230px] w-[5px]">
							<polyline
								className="fill-none stroke-(--card-color) stroke-5"
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
