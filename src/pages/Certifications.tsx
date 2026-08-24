export function Certifications() {
	return (
		<div>
			<h1 className="mb-[40px] text-2xl font-bold tracking-wide">
				Meus certificados
			</h1>
			<div className="flex flex-col items-center justify-center gap-y-5 opacity-60">
				<div className="rounded-full bg-[radial-gradient(circle,#594486,transparent_70%)]">
					<img
						src="/assets/images/certification.png"
						alt="Certificação"
						draggable="false"
						className="w-account-img"
					/>
				</div>

				<p className="text-section-xl select-none text-shadow-[0_0_15px_#624b93]">
					Nenhum certificado encontrado
				</p>
			</div>
		</div>
	);
}
