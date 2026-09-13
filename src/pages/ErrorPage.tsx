export function ErrorPage({ onRetry }: { onRetry: () => Promise<void> }) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[url('/assets/images/question-marks-background.svg')]">
			<div className="mx-[20px] my-[120px] flex flex-col items-start gap-y-[25px]">
				<h1 className="flex flex-col gap-y-[15px]">
					<span className="text-3xl font-bold">Opsss... 🐍</span>
					<span className="text-lg">
						Parece que não foi possível carregar o conteúdo.
					</span>
				</h1>
				<button
					onClick={() => void onRetry()}
					className="text-section-btn border-main-green lg:hover:bg-main-green z-20 rounded-md border-2 bg-white/5 px-[25px] py-[15px] lg:cursor-pointer lg:transition-all lg:duration-300 lg:hover:border-black lg:hover:text-black"
				>
					Tentar novamente
				</button>
			</div>
		</div>
	);
}
