import { useEffect, useState } from 'react';
import { fetchContent } from '../content/services/fetchContent';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import { logError } from '../utils/logger';

export function ProgressBar() {
	const [progressPercentual, setProgressPercentual] = useState(0);
	const { progressState } = useSafeContext(ProgressContext);
	const perimeter = 2 * Math.PI * 80;

	useEffect(() => {
		void (async () => {
			try {
				const subtopic = await fetchContent({
					contentType: 'subtopic',
					include: 0,
				});
				const percentual =
					(progressState.doneSubtopics.length * 100) / subtopic.length;
				setProgressPercentual(Number(percentual.toFixed(0)));
			} catch (error) {
				logError({
					error,
					text: 'Não foi possível calcular seu progresso. Tente novamente ou fale conosco.',
				});
			}
		})();
	}, [progressState.doneSubtopics]);

	return (
		<svg className="h-[200px] w-[200px] rounded-full shadow-[0_0_15px_#ffffff]/10">
			<circle
				cx={100}
				cy={100}
				r={80}
				stroke="#808791"
				className="fill-none stroke-[40px]"
			/>
			<circle
				cx={100}
				cy={100}
				r={80}
				strokeDasharray={perimeter}
				strokeDashoffset={perimeter - (perimeter * progressPercentual) / 100}
				className="stroke-main-green origin-center -rotate-90 fill-none stroke-[40px] transition-all duration-500"
			/>
			<text
				x={100}
				y={100}
				textAnchor="middle"
				dominantBaseline="middle"
				className="fill-gray-200 text-3xl"
			>
				{progressPercentual + '%'}
			</text>
		</svg>
	);
}
