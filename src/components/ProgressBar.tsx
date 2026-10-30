type ProgressBarProps = {
	progressPercentual: number;
};

export function ProgressBar({ progressPercentual }: ProgressBarProps) {
	const progress = Math.min(100, Math.max(0, progressPercentual));

	return (
		<div className="w-full">
			<div className="flex items-end justify-between px-1">
				<p className="text-section-lg font-bold">Seu progresso</p>
				<span className="text-title-2xl font-bold">{progressPercentual}%</span>
			</div>
			<div
				role="progressbar"
				aria-label="Progresso da trilha"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={progress}
				className="h-5 w-full overflow-hidden rounded-full bg-[#808791] drop-shadow-[0_0_15px_#ffffff]/15"
			>
				<div
					className="bg-main-green h-full rounded-full transition-[width] duration-500 ease-in-out"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}
