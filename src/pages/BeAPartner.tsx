import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

const doubtInputsContent = {
	platformVisibility: {
		value: 'Visibilidade nas plataformas',
		description:
			'Sua marca estará presente nas plataformas da TryCode, com um link direto para o site da sua empresa.',
		icon: 'chain.png',
	},
	socialMedia: {
		value: 'Divulgação nas redes sociais',
		description:
			'Sua marca será divulgada nas redes sociais dos projetos da TryCode, por meio de publicações e ações de parceria.',
		icon: 'push-notification.png',
	},
	youtubeVideos: {
		value: 'Presença nos vídeos do YouTube',
		description:
			'Sua marca terá espaço nas aberturas e nos encerramentos dos vídeos do canal da TryCode no YouTube.',
		icon: 'movies.png',
	},
	brandAssociation: {
		value: 'Associação à educação em tecnologia',
		description:
			'Associe sua marca a iniciativas que incentivam a educação em tecnologia e contribuem para a formação de novos profissionais.',
		icon: 'graduation.png',
	},
};

const partnershipEmailBody = encodeURIComponent(
	'Olá!\n\nGostaria de conversar sobre uma possível parceria com o TryPy.\n\nAgradeço desde já pela atenção!',
);

const suggestionEmailBody = encodeURIComponent(
	'Olá!\n\nGostaria de compartilhar uma ideia de parceria com o TryPy.\n\nAgradeço desde já pela atenção!',
);

export function BeAPartner() {
	const [isChecked, setIsChecked] = useState({
		platformVisibility: false,
		socialMedia: false,
		youtubeVideos: false,
		brandAssociation: false,
	});

	const questionsEmailBody = encodeURIComponent(
		'Olá!\n\nQueria saber mais sobre os benefícios da parceira listados abaixo:\n\n' +
			(Object.keys(isChecked) as Array<keyof typeof isChecked>)
				.filter((key) => isChecked[key])
				.map((key) => `• ${doubtInputsContent[key].value}`)
				.join('\n') +
			'\n\nAgradeço desde já pela atenção!',
	);

	useEffect(() => {
		const underline = document.getElementById('underline')!;

		const underlineLoop = setInterval(() => {
			underline.innerText += '_';
			setTimeout(() => {
				underline.innerText = underline.innerText.replace('_', '');
			}, 500);
			return;
		}, 1000);

		return () => clearInterval(underlineLoop);
	}, []);

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		if (window.innerWidth < 1024) return;

		const rect = e.currentTarget.getBoundingClientRect();

		const x = e.clientX - rect.x;
		const y = e.clientY - rect.y;

		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		const rotateY = ((x - centerX) / centerX) * 10;
		const rotateX = ((centerY - y) / centerY) * 10;

		e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
	};

	return (
		<div className="w-full">
			<div className="mt-30 flex flex-col gap-y-20">
				<section className="mx-[10px] max-w-300 self-center">
					<div className="to-main-green/15 mb-6 w-full rounded-md bg-linear-to-r from-black shadow-[0_0_50px_black]/50">
						<div className="relative flex min-h-1/2 items-center overflow-hidden rounded-md bg-[url('/assets/images/brilliant.png')] p-7 lg:p-10">
							<div>
								<p className="font-jetbrains mb-3 text-sm tracking-wide text-gray-400">
									/futuro/parcerias/
									<span className="text-main-green">trypy</span>
									<span id="underline" className="text-main-green"></span>
								</p>
								<h1 className="text-title-3xl mb-3 font-bold tracking-wide">
									Torne-se um patrocinador
								</h1>
								<p className="text-section-xl mb-10">
									Apoie um projeto que nasceu de um sonho e hoje busca realizar
									muitos outros.
								</p>
								<div className="flex flex-col items-start gap-y-5">
									<a
										type="button"
										href={`mailto:support@trypy.dev?subject=${encodeURIComponent('Interesse em parceria')}&body=${partnershipEmailBody}`}
										className="border-main-green text-section-xl px-section-btn py-section-btn lg:hover:bg-main-green cursor-pointer rounded-md border-2 bg-white/5 duration-300 lg:transition-all lg:hover:border-black lg:hover:text-black"
									>
										Vamos conversar?
									</a>
									<Link
										to="/about-us"
										className="text-section-lg px-section-btn py-section-btn cursor-pointer rounded-md border-2 bg-white/5 duration-300 lg:transition-all lg:hover:bg-white/20"
									>
										Sobre nós
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="text-section-xl flex flex-col gap-y-5 p-5">
						<p>
							Ao patrocinar a TryCode, sua empresa passa a fazer parte de um
							projeto feito para mostrar que qualquer pessoa pode aprender a
							programar, não importa a origem, a idade ou a experiência. Levamos
							a sério o sonho de cada aluno e acreditamos que a educação abre os
							caminhos para realizá-lo.
						</p>
						<p>
							Como parceiro, sua marca chega a uma audiência engajada e
							diretamente ligada ao mercado de tecnologia. É também uma forma de
							mostrar que sua empresa investe em educação, não só em marketing.
						</p>
					</div>
				</section>
				<section className="mx-5 flex max-w-300 flex-col gap-y-10 self-center">
					<div>
						<h2 className="text-main-purple text-title-3xl mb-5 font-bold tracking-wide">
							Ações personalizadas
						</h2>
						<p className="text-section-xl">
							Cada iniciativa é construída em conjunto, levando em conta os
							objetivos da sua empresa e as necessidades da comunidade. Conheça
							cada uma delas:
						</p>
					</div>
					<div className="grid max-w-210 grid-cols-1 gap-10 self-center lg:grid-cols-2 lg:self-start">
						<div
							className="bg-module-background flex max-w-100 flex-col items-start gap-y-5 rounded-md p-5 shadow-[0_0_30px_black]/40 outline outline-black lg:transition-[scale] lg:duration-300 lg:hover:scale-105"
							onMouseMove={handleMouseMove}
							onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
						>
							<img
								src="/assets/images/megaphone.png"
								alt="Megafone"
								className="self-center drop-shadow-[0_0_50px_var(--color-main-purple)]/80"
							/>
							<div>
								<h2 className="text-section-lg mb-3 font-bold">
									Campanhas exclusivas
								</h2>
								<p className="text-section-base">
									Vídeos dedicados no canal, sorteios e ofertas exclusivas para
									a comunidade, tudo com a sua marca.
								</p>
							</div>
						</div>
						<div
							className="bg-module-background flex max-w-100 flex-col items-start gap-y-5 rounded-md p-5 shadow-[0_0_30px_black]/40 outline outline-black lg:transition-[scale] lg:duration-300 lg:hover:scale-105"
							onMouseMove={handleMouseMove}
							onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
						>
							<img
								src="/assets/images/hiring.png"
								alt="Divulgação"
								className="self-center drop-shadow-[0_0_50px_var(--color-main-cyan)]/60"
							/>
							<div>
								<h2 className="text-section-lg mb-3 font-bold">
									Divulgação de vagas
								</h2>
								<p className="text-section-base">
									Anuncie oportunidades de estágio e emprego para quem está
									aprendendo programação ou buscando crescer na área de
									tecnologia.
								</p>
							</div>
						</div>
						<div
							className="bg-module-background flex max-w-100 flex-col items-start gap-5 rounded-md p-7 shadow-[0_0_30px_black]/40 outline outline-black lg:col-span-2 lg:max-w-none lg:flex-row lg:transition-[scale] lg:duration-300 lg:hover:scale-105"
							onMouseMove={handleMouseMove}
							onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
						>
							<img
								src="/assets/images/business-group.png"
								alt="Parceira"
								className="self-center drop-shadow-[0_0_50px_var(--color-main-green)]/60 lg:self-start"
							/>
							<div>
								<h2 className="text-section-lg mb-3 font-bold">
									Projetos em parceria
								</h2>
								<p className="text-section-base">
									Construa com a TryCode iniciativas voltadas à tecnologia e à
									educação, como eventos, desafios de programação e projetos que
									visam estimular a criatividade e aproximar pessoas do universo
									da programação.
								</p>
							</div>
						</div>
					</div>
					<p className="text-section-xl flex gap-x-2">
						Tem outra ideia?
						<a
							href={`mailto:support@trypy.dev?subject=${encodeURIComponent('Sugestão para parceira')}&body=${suggestionEmailBody}`}
							className="group inline-flex items-center gap-1"
						>
							<span className="text-main-purple">Conte pra gente</span>
							<svg
								aria-hidden
								viewBox="0 0 24 24"
								className="group-hover:text-main-purple size-4 fill-none stroke-current stroke-2 duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							>
								<path
									d="M5.5 18.5 18.5 5.5M9.5 5.5h9v9"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</a>
					</p>
				</section>
				<section className="mx-5 max-w-300 self-center">
					<h2 className="text-main-cyan text-title-3xl mb-5 font-bold tracking-wide">
						Benefícios da parceria
					</h2>
					<div className="flex flex-col gap-y-5">
						<p className="text-section-xl">
							Conheça os benefícios que nossa parceira pode oferecer à sua
							empresa:
						</p>
						<div className="rounded-md border border-black bg-[url('/assets/images/batthern-background.png')] shadow-[0_0_30px_#000000]/50">
							<div className="bg-module-background/80 flex h-fit flex-col gap-y-5 p-5 transition-[min-height] duration-300 lg:p-7">
								<ul className="flex flex-col gap-y-5">
									{(
										Object.keys(doubtInputsContent) as Array<
											keyof typeof doubtInputsContent
										>
									).map((key) => (
										<div key={key}>
											<li className="mb-3 flex items-center gap-x-3">
												<input
													type="checkbox"
													id={key}
													className="checked:outline-main-cyan checked:bg-main-cyan/60 -mt-px size-4 shrink-0 appearance-none rounded-full bg-white/10 outline-2 outline-gray-400 transition-all duration-300 checked:shadow-[0_0_20px_#ffffff]/30 lg:cursor-pointer"
													value={doubtInputsContent[key].value}
													checked={isChecked[key]}
													onChange={(e) => {
														const checked = e.currentTarget.checked;
														setIsChecked((prev) => ({
															...prev,
															[key]: checked,
														}));
													}}
												/>
												<label
													className="text-section-base font-jetbrains lg:cursor-pointer"
													htmlFor={key}
												>
													{doubtInputsContent[key].value}
												</label>
											</li>
											<p className="text-section-base text-gray-400">
												{doubtInputsContent[key].description}
											</p>
										</div>
									))}
								</ul>
								<div className="text-section-base flex flex-col items-start">
									{Object.values(isChecked).includes(true) ? (
										<div className="mb-5 flex flex-col items-start gap-y-3">
											<div className="flex gap-x-3">
												{(
													Object.keys(isChecked) as Array<
														keyof typeof isChecked
													>
												)
													.filter((key) => isChecked[key])
													.map((key) => (
														<div
															key={key}
															className="bg-main-cyan/40 border-main-cyan rounded-md border px-2 py-1 shadow-[0_0_20px_var(--color-main-cyan)]/30"
														>
															<img
																src={`/assets/images/icons/${doubtInputsContent[key].icon}`}
																alt={doubtInputsContent[key].value}
																className="w-8"
															/>
														</div>
													))}
											</div>

											<button
												type="button"
												className="text-sm text-gray-300 underline underline-offset-3 lg:cursor-pointer"
												onClick={() =>
													setIsChecked({
														platformVisibility: false,
														socialMedia: false,
														youtubeVideos: false,
														brandAssociation: false,
													})
												}
											>
												Limpar
											</button>
										</div>
									) : (
										<p className="text-main-cyan mb-3 text-sm">
											Nenhum tópico selecionado
										</p>
									)}
									<a
										href={`mailto:support@trypy.dev?subject=${encodeURIComponent('Dúvidas sobre a parceria')}?body=${questionsEmailBody}`}
										className="text-section-base rounded-md border border-white/50 bg-white/10 px-6 py-[12px] text-center font-bold lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/10"
									>
										Quero saber mais
									</a>
								</div>
							</div>
						</div>
						<p className="text-section-xl">
							Acreditamos que uma boa parceria não se resume a exibir logotipos,
							indo muito além da divulgação.
						</p>
						<p className="text-section-xl">
							Acreditamos que uma boa parceria vai além da divulgação da marca.
							Queremos construir relações duradouras com nossos patrocinadores,
							criando oportunidades para que participem ativamente do projeto,
							se aproximem da comunidade e contribuam para seu crescimento.
						</p>
					</div>
				</section>
				<section className="animate-appear appear-animation to-main-green/15 flex justify-center bg-linear-to-b from-transparent px-5 py-15">
					<div className="flex flex-col items-start">
						<div className="mb-5 text-shadow-[0_0_20px_var(--color-main-green)]/50 lg:mb-10">
							<h2 className="text-main-green text-title-3xl mb-3">
								Vamos tornar sonhos em realidade?
							</h2>
							<p className="text-section-lg">
								Grandes ideias ganham vida quando encontramos as pessoas certas
								para construí-las.
							</p>
						</div>
						<a
							href={`mailto:support@trypy.dev?subject=${encodeURIComponent('Interesse em parceria')}&body=${partnershipEmailBody}`}
							className="lg:hover:bg-main-green px-section-btn py-section-btn text-section-btn border-main-green cursor-pointer self-start rounded-md border bg-white/5 transition-all duration-300 lg:hover:border-black lg:hover:text-black lg:hover:shadow-[0_0_15px_var(--color-main-green)]/30"
						>
							Construir juntos
						</a>
					</div>
				</section>
			</div>
		</div>
	);
}
