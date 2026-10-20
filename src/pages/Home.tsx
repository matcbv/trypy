import { useRef, useState, type ChangeEvent } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { Link } from 'react-router-dom';
import { SvgPath } from '../components/SvgPath';
import { ProgressBar } from '../components/ProgressBar';
import { logError } from '../utils/logger';

type Content = {
	title: string;
	text: string;
};

const progressSectionContent: Record<number, Content> = {
	1: {
		title: 'Acompanhe sua evolução',
		text: 'Seu progresso é atualizado conforme você conclui cada etapa do aprendizado.',
	},
	2: {
		title: 'Continue de onde parou',
		text: 'Seu progresso fica salvo para que você possa retomar os estudos sem perder sua evolução.',
	},
	3: {
		title: 'Visualize seu avanço',
		text: 'Acompanhe o quanto você já concluiu e descubra quanto falta para finalizar o módulo.',
	},
};

const videoCardsContent = [
	{
		title: 'Conteúdo didático',
		text: 'Baseado na documentação oficial do Python, nosso conteúdo é adaptado para diferentes níveis de conhecimento, desde quem está dando os primeiros passos na programação até quem já possui experiência. Tudo isso com explicações claras e exemplos práticos para facilitar o aprendizado.',
		path: '/assets/videos/educational-materials.mp4',
		theme: '--color-main-green',
	},
	{
		title: 'Organização do conteúdo',
		text: 'Explore uma trilha organizada em módulos, tópicos e subtópicos, com uma sequência pensada para facilitar seu aprendizado. Navegue pelos conteúdos de forma intuitiva e utilize a busca para encontrar assuntos específicos sempre que precisar.',
		path: '/assets/videos/terminal-demonstration.mp4',
		theme: '--color-main-purple',
	},
	{
		title: 'Terminal integrado',
		text: 'Pratique Python diretamente pelo navegador, sem precisar instalar nada. Escreva e execute seus códigos no próprio site e resolva exercícios que são corrigidos na hora, permitindo que você aprenda com seus erros e acompanhe seus resultados.',
		path: '/assets/videos/terminal-demonstration.mp4',
		theme: '--color-main-cyan',
	},
];

const supportChannelsContent = [
	{
		title: 'YouTube',
		text: 'Alguma dúvida sobre um exercício? Entre no respectivo vídeo em nosso canal e faça sua pergunta.',
		icon: 'youtube.png',
	},
	{
		title: 'Discord',
		text: 'Fique a vontade para entrar em nosso servidor no Discord e conhecer nossa comunidade.',
		icon: 'discord.png',
	},
	{
		title: 'Gmail',
		text: 'Algum problema em sua conta ou assinatura? Entre em contato conosco via e-mail.',
		icon: 'gmail.png',
	},
];

export function Home() {
	const [studentName, setStudentName] = useState('');
	const [currentContentIndex, setCurrentContentIndex] = useState(1);
	const [isProgressSectionDone, setIsProgressSectionDone] = useState(false);
	const [doneProgressSubtopics, setDoneProgressSubtopics] = useState<number[]>(
		[],
	);
	const videoRef = useRef<HTMLVideoElement>(null);

	const percentual =
		(doneProgressSubtopics.length * 100) /
		Object.keys(progressSectionContent).length;
	const roundedPercentual = Math.round(Number(percentual.toFixed(2)));

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setStudentName((prev) =>
			e.target.value.length > 20 ? prev : e.target.value,
		);
	};

	const handlePrevious = () => {
		setCurrentContentIndex((prev) => (prev > 1 ? prev - 1 : prev));
	};

	const handleNext = () => {
		setCurrentContentIndex((prev) => prev + 1);
		setDoneProgressSubtopics((prev) =>
			prev.includes(currentContentIndex)
				? prev
				: [...prev, currentContentIndex],
		);
	};

	const handleFinish = () => {
		if (isProgressSectionDone) return;

		const key = Object.keys(progressSectionContent).length;

		setDoneProgressSubtopics((prev) =>
			prev.includes(key) ? prev : [...prev, key],
		);
		setIsProgressSectionDone(true);
	};

	const handleFullscreen = async () => {
		const video = videoRef.current;
		if (!video) return;

		try {
			if (video.requestFullscreen) {
				await video.requestFullscreen();
			} else if ('webkitEnterFullscreen' in video) {
				const safariVideo = video as HTMLVideoElement & {
					webkitEnterFullscreen: () => void;
				};
				safariVideo.webkitEnterFullscreen();
			}
		} catch (error) {
			logError({
				error,
				text: 'Não foi possível exibir o vídeo em tela cheia. Tente novamente.',
			});
		}
	};

	return (
		<>
			<div className="flex w-full justify-center">
				<HeroBanner />
			</div>
			<span className="block h-px bg-indigo-900"></span>
			<section className="relative mx-5 flex items-center justify-center py-30 lg:mx-10">
				<div className="flex flex-col gap-y-10">
					<div className="max-w-300">
						<h2 className="text-main-purple text-title-4xl mb-5">
							Aprendizado Guiado
						</h2>
						<p className="text-section-xl">
							Aprenda Python passo a passo, com conteúdos didáticos e exercícios
							práticos. Aqui, você aprende a criar seu código, não só a copiar e
							colar.
						</p>
					</div>
					<div className="flex max-w-300 flex-col gap-y-10">
						{videoCardsContent.map(({ title, text, path, theme }, i) => (
							<div
								key={i}
								className={`flex flex-col ${i === 1 ? 'lg:flex-row' : 'flex-col lg:flex-row-reverse'} gap-5 rounded-md bg-white/5 p-5 backdrop-blur-xl`}
							>
								<div className="flex-1">
									<h2 className="text-title-xl mb-3 font-bold">{title}</h2>
									<p className="text-section-lg">{text}</p>
								</div>
								<div
									style={{
										boxShadow: `0 0 150px color-mix(in srgb, var(${theme}) 30%, transparent)`,
									}}
									className="relative flex-1 overflow-hidden rounded-md"
								>
									<video
										src={path}
										loop
										muted
										autoPlay
										playsInline
										disablePictureInPicture
										controlsList="nodownload"
										ref={videoRef}
									></video>
									<img
										src="/assets/images/icons/fullscreen.png"
										alt="Tela cheia"
										className="absolute right-2 bottom-2 lg:hidden"
										tabIndex={0}
										role="button"
										onClick={() => void handleFullscreen()}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
			<span className="block h-px bg-indigo-900"></span>
			<section className="relative mx-5 flex items-center justify-center py-30 lg:mx-10">
				<div className="flex max-w-300 flex-col gap-y-10">
					<div>
						<div className="mb-5 flex items-center gap-x-3">
							<h2 className="text-main-green text-title-4xl">
								Acompanhe seu progresso
							</h2>
							<img
								src="/assets/images/icons/done.png"
								alt="Concluído"
								className={`${isProgressSectionDone ? 'inline' : 'hidden'} w-8`}
							/>
						</div>
						<p className="text-section-xl">
							Acompanhe sua evolução ao longo da trilha de aprendizagem, veja o
							que já concluiu e saiba exatamente onde continuar. Cada etapa
							concluída aproxima você do seu objetivo.
						</p>
					</div>
					<div className="flex max-w-300 flex-col gap-y-10 rounded-md bg-black/10 p-5 outline outline-black backdrop-blur-xl lg:flex-row lg:gap-x-5 lg:p-10">
						<div className="flex flex-1 flex-col items-center gap-y-6 sm:flex-row sm:gap-x-6">
							<ProgressBar progressPercentual={roundedPercentual} />
							<div className="flex flex-col gap-y-5">
								<p className="flex flex-col">
									Módulo atual:{' '}
									<span className="text-progress-titles font-bold">
										Acompanhe seu progresso
									</span>
								</p>
								<p className="flex flex-col">
									Tópico atual:{' '}
									<span className="text-progress-titles font-bold">
										Saiba como funciona
									</span>
								</p>
								<p className="flex flex-col">
									Subtópico atual:{' '}
									<span className="text-progress-titles font-bold">
										{progressSectionContent[currentContentIndex]!.title}
									</span>
								</p>
							</div>
						</div>
						<span className="block h-px bg-white lg:h-auto lg:w-px"></span>
						<div className="flex max-h-60 min-h-50 flex-1 flex-col justify-between">
							<div>
								<h3 className="text-section-xl mb-3 font-bold">
									{progressSectionContent[currentContentIndex]!.title}
								</h3>
								<p className="text-section-lg">
									{progressSectionContent[currentContentIndex]!.text}
								</p>
							</div>
							<div className="flex justify-end gap-x-6">
								<button
									type="button"
									className="module-btn bg-main-green/10 border-main-green group"
									onClick={handlePrevious}
								>
									<img
										src={`/assets/images/icons/left-arrow.png`}
										alt="Voltar"
										className="lg:transition-transform lg:duration-300 lg:group-hover:-translate-x-2"
									/>
									Voltar
								</button>
								{currentContentIndex ===
								Object.keys(progressSectionContent).length ? (
									<button
										type="button"
										className="module-btn bg-main-green/10 border-main-green group"
										onClick={handleFinish}
										disabled={isProgressSectionDone}
									>
										Concluir
										<img
											src={`/assets/images/icons/done.png`}
											alt="Concluir"
											className="w-6 lg:transition-transform lg:duration-300 lg:group-hover:scale-105"
										/>
									</button>
								) : (
									<button
										type="button"
										className="module-btn bg-main-green/10 border-main-green group"
										onClick={handleNext}
									>
										Avançar
										<img
											src={`/assets/images/icons/right-arrow.png`}
											alt="Avançar"
											className="lg:transition-transform lg:duration-300 lg:group-hover:translate-x-2"
										/>
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
			<span className="block h-px bg-indigo-900"></span>
			<section className="relative mx-5 flex items-center justify-center py-30 lg:mx-10">
				<div className="flex flex-col items-center gap-x-5 gap-y-10 p-5 lg:flex-row-reverse lg:p-10">
					<div className="flex max-w-150 flex-col gap-y-5">
						<div>
							<h2 className="text-main-cyan text-title-4xl mb-5">
								Suporte ao aluno
							</h2>
							<p className="text-section-xl">
								Travou em um exercício ou teve algum problema com sua conta?
								Escolha o canal que preferir e receba ajuda durante sua jornada
								de aprendizado.
							</p>
						</div>
						<div className="flex flex-col gap-y-5 rounded-md bg-black/15 p-5 backdrop-blur-xl">
							{supportChannelsContent.map(({ title, text, icon }, i) => (
								<div key={i}>
									<div className="mb-2 flex items-center gap-x-2">
										<img src={`/assets/images/icons/${icon}`} alt={title} />
										<h2 className="text-section-lg">{title}</h2>
									</div>
									<p className="text-section-base">{text}</p>
								</div>
							))}
						</div>
						<Link
							to="/support"
							className="lg:hover:bg-main-cyan/70 px-section-btn-x py-section-btn-y text-section-btn border-main-cyan self-start rounded-md border bg-white/5 transition-all duration-300 lg:bg-transparent lg:hover:border-black lg:hover:shadow-[0_0_20px_#FFFFFF]/25"
						>
							Ver canais de suporte
						</Link>
					</div>
					<SvgPath />
				</div>
			</section>
			<span className="block h-px bg-indigo-900"></span>
			<section className="relative mx-5 flex items-center justify-center py-30 lg:mx-10">
				<div className="flex flex-col items-center gap-x-10 gap-y-10 lg:flex-row-reverse lg:items-start">
					<div className="flex max-w-150 min-w-0 flex-1 flex-col gap-y-5 lg:gap-y-10">
						<div>
							<h2 className="text-main-green text-title-4xl mb-5">
								Certificado gratuito e personalizado
							</h2>
							<p className="text-section-xl">
								Ao concluir a trilha de aprendizagem, você recebe um certificado
								digital emitido em seu nome, contendo a carga horária total, os
								módulos concluídos e os principais conteúdos estudados durante o
								curso. Uma forma simples e importante de registrar e
								compartilhar sua evolução.
							</p>
						</div>
						<input
							value={studentName}
							onChange={handleChange}
							placeholder="Digite seu nome..."
							className="border-main-green text-section-xl placeholder:text-section-xl py-section-btn-y w-full max-w-2/3 rounded-md border bg-white/5 px-5 transition-shadow duration-300 focus:shadow-[0_0_20px_var(--color-glow-green)]/20 focus:outline-none"
						/>
					</div>
					<div className="w-section-img relative rounded-md">
						<span className="text-student-name absolute top-[40%] left-[10%] max-w-[calc(var(--width-section-img)-20%)] truncate select-none">
							{studentName || 'Aluno'}
						</span>
						<img
							src="/assets/images/trypy-certificate.png"
							alt="Certificado TryPy"
							className="rounded-md"
							draggable="false"
						/>
					</div>
				</div>
			</section>
			<section className="animate-appear appear-animation relative flex items-center justify-center p-20 px-5 backdrop-blur-sm lg:px-10">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(133_88_214/0.35)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)] bg-size-[24px_24px]"
				/>
				<div className="flex flex-col items-center gap-y-5 lg:items-start lg:gap-y-10">
					<div className="flex flex-col items-center gap-y-5 drop-shadow-[0_0_10px_var(--color-main-purple)]/50 lg:items-start">
						<h1 className="text-title-4xl">Pronto para começar?</h1>
						<p className="text-section-base text-center lg:text-start">
							Sua jornada rumo ao domínio do Python começa aqui.
						</p>
					</div>
					<div className="flex flex-col gap-y-2">
						<Link
							to="/learning-path"
							className="lg:hover:bg-main-purple/60 px-section-btn-x py-section-btn-y text-section-btn border-main-purple cursor-pointer self-start rounded-md border bg-white/5 transition-all duration-300 lg:hover:border-black lg:hover:shadow-[0_0_20px_#FFFFFF]/25"
						>
							Começar a aprender
						</Link>
						<p className="text-sm text-gray-400">
							Gratuito · Sem instalar nada
						</p>
					</div>
				</div>
			</section>
		</>
	);
}
