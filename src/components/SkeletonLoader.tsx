interface SkeletonProps {
	width: number;
	height: number;
	quantity?: number;
}

export function SkeletonLoader({ width, height, quantity = 1 }: SkeletonProps) {
	return (
		<>
			{Array.from({ length: quantity }, (_, i) => {
				<span
					key={i}
					className="block animate-pulse rounded-xs bg-white/25"
					style={{
						height: `${height}px`,
						width: `${width}px`,
					}}
				/>;
			})}
		</>
	);
}
