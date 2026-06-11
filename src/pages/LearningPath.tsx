import { useEffect, useState, type CSSProperties } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { ModuleCard } from '../components/ModuleCard';
import type { ModuleCardData } from '../types/content';
import { logError } from '../utils/logger';

export function LearningPath() {
	type Themes = 'green' | 'purple';

	interface CardStyleProps {
		cardColor: string;
		slideButtonColor: string;
	}

	const cardStyles: Record<Themes, CardStyleProps> = {
		green: { cardColor: '--main-green', slideButtonColor: '#20663b' },
		purple: { cardColor: '--main-purple', slideButtonColor: '#402d66' },
	};

	const [cardContent, setCardContent] = useState<ModuleCardData[]>([]);

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
					'Não foi possível carregar o conteúdo dos módulos. Tente novamente ou fale conosco.',
				);
			}
		})();
	}, []);

	return (
		<div className="font-jetbrains flex min-h-screen justify-center px-20 py-[120px]">
			<div className="flex flex-col items-center justify-center gap-y-[230px]">
				{cardContent?.map(
					(card, index) =>
						card.order === index + 1 && (
							<div
								key={card.title}
								className="relative"
								style={
									{
										'--cardColor': `var(${cardStyles[card.theme as Themes].cardColor})`,
										'--slideButtonColor': `${cardStyles[card.theme as Themes].slideButtonColor}`,
									} as CSSProperties
								}
							>
								<ModuleCard card={card} />
								<svg className="absolute right-1/2 z-20 h-[230px] w-[5px]">
									<polyline
										className="fill-none stroke-[var(--cardColor)] stroke-[5]"
										points="0,0 0,230"
										strokeDasharray="15"
									/>
								</svg>
							</div>
						),
				)}
			</div>
		</div>
	);
}
