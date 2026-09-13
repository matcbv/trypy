import type { CSSProperties } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { LoadingPage } from './LoadingPage';
import { themeStyles } from '../constants/themeStyle';
import { useSafeContext } from '../hooks/useSafeContext';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { ErrorPage } from './ErrorPage';

export function LearningPath() {
	const { modules, moduleCards, isLoading, errorData, refreshModuleCards } =
		useSafeContext(ContentfulContentContext);

	if (errorData.error) {
		return <ErrorPage onRetry={refreshModuleCards} />;
	} else {
		return isLoading.modules || isLoading.moduleCards ? (
			<LoadingPage />
		) : (
			<div className="font-jetbrains mx-[10px] my-30 flex min-h-screen justify-center sm:mx-0">
				<div className="flex flex-col items-center justify-center gap-y-[230px]">
					{moduleCards!.map((card) => (
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
							<ModuleCard card={card} initialModuleSlug={modules![0]!.slug} />
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
}
