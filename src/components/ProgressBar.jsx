import { useContext, useEffect, useState } from 'react';
import { fetchContent } from '../content/fetchContent';
import ProgressContext from '../contexts/ProgressProvider/context';

export function ProgressBar() {
	const [progressPercentual, setProgressPercentual] = useState(0);
	const [progressState] = useContext(ProgressContext);
	const perimeter = 2 * Math.PI * 80;

	useEffect(() => {
		(async () => {
			const topics = await fetchContent('topic', 0);
			const percentual =
				(progressState.doneTopics.length * 100) / topics.length;
			setProgressPercentual(percentual.toFixed(0));
		})();
	});

	return (
		<svg className="h-[200px] w-[200px] rounded-full shadow-[0_0_15px_#ffffff1f]">
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
				className="origin-center -rotate-90 fill-none stroke-[var(--main-green)] stroke-[40px] transition-all duration-500"
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
