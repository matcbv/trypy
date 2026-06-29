export function SupportUs() {
	return (
		<div>
			<h1 className="mb-5 text-3xl font-bold tracking-wide">
				Seja um apoiador
			</h1>
			<div className="flex flex-col gap-y-10">
				<div className="flex flex-col items-center justify-center gap-y-5 opacity-60">
					<div className="rounded-full bg-[radial-gradient(circle,_#594486,_transparent_70%)]">
						<img
							src="/assets/images/grow-up.png"
							alt="Resolução"
							draggable="false"
							className="h-[300px] w-[300px]"
						/>
					</div>
					<p className="text-center text-2xl select-none text-shadow-[0_0_15px_#624b93]">
						Estamos preparando tudo para que você possa fazer parte dessa
						jornada e construir esse sonho conosco.
					</p>
				</div>
			</div>
		</div>
	);
}
