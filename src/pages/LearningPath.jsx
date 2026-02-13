import { useEffect, useState } from 'react';
import { fetchContent } from '../content/fetchContent';
import { ModuleCard } from '../components/ModuleCard';

export function LearningPath() {
	const [cardContent, setCardContent] = useState([]);

	useEffect(() => {
		(async () => {
			const content = await fetchContent({
				contentType: 'moduleCard',
				include: 0,
			});
			setCardContent(() => content.map((card) => card.fields));
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
								style={{
									'--cardColor': `var(${card.theme === 'green' ? '--main-green' : '--main-purple'})`,
									'--slideButtonColor': `${card.theme === 'green' ? '#20663b' : '#402d66'}`,
								}}
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
