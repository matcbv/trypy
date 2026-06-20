export function LoadingPage() {
	return (
		<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-3xl">
			<img
				className="relative w-[60px]"
				src="/assets/images/loading.png"
				alt="Carregando..."
			/>
		</div>
	);
}
