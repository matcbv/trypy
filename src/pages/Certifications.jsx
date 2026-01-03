export function Certifications() {
	return (
		<div>
			<h1 className="mb-10 text-3xl font-bold tracking-wide">
				Meus certificados
			</h1>
			<div className="flex flex-col items-center justify-center gap-y-5 opacity-60">
				<div className="rounded-full bg-[radial-gradient(circle,_#594486e3,_transparent_70%)]">
					<img
						src="/assets/images/certification.png"
						alt="Certificação"
						draggable="false"
						className="h-[300px] w-[300px]"
					/>
				</div>

				<p className="text-2xl select-none text-shadow-[0_0_15px_#624b93e3]">
					Nenhum certificado encontrado
				</p>
			</div>
		</div>
	);
}
