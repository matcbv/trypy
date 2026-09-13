export function LoadingPage() {
	return (
		<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-2xl">
			<img
				className="relative w-15"
				src="/assets/images/loading.png"
				alt="Carregando..."
			/>
		</div>
	);
}
