export function ProgressBar({
	progressPercentual,
}: {
	progressPercentual: number;
}) {
	console.log(progressPercentual);
	const perimeter = 2 * Math.PI * 80;

	return (
		<svg className="h-[200px] w-[200px] shrink-0 rounded-full shadow-[0_0_15px_#ffffff]/10">
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
