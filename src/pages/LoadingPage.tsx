export function LoadingPage() {
	return (
		<div className="absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-lg bg-black/20 backdrop-blur-3xl">
			<img
				className="relative w-20"
				src="/assets/images/loading.png"
				alt="Carregando..."
			/>
		</div>
	);
}
