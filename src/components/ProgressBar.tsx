export function ProgressBar({
	progressPercentual,
}: {
	progressPercentual: number;
}) {
	const radius = 100;
	const perimeter = 2 * Math.PI * radius;

	return (
		<svg
			className="h-56 w-56 shrink-0 rounded-full drop-shadow-[0_0_15px_#ffffff]/15"
			viewBox="0 0 240 240"
		>
			<circle
				cx={120}
				cy={120}
				r={100}
				stroke="#808791"
				className="fill-none stroke-[55px]"
			/>
			<circle
				cx={120}
				cy={120}
				r={100}
				strokeDasharray={perimeter}
				strokeDashoffset={perimeter - (perimeter * progressPercentual) / 100}
				className="stroke-main-green origin-center -rotate-90 fill-none stroke-[55px] transition-all duration-500"
			/>
			<text
				x={120}
				y={120}
				textAnchor="middle"
				dominantBaseline="middle"
				className="fill-gray-200 text-4xl"
			>
				{progressPercentual + '%'}
			</text>
		</svg>
	);
}
