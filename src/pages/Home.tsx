import { useState, type ChangeEvent, type MouseEvent } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { Link } from 'react-router-dom';
import { SvgPath } from '../components/SvgPath';

export function Home() {
	const [studentName, setStudentName] = useState('');

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setStudentName((prev) =>
			e.target.value.length > 20 ? prev : e.target.value,
		);
	};

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
		<>
			<div className="flex w-full justify-center">
				<HeroBanner />
			</div>
			<span className="block h-[1px] bg-indigo-900"></span>
			<section className="relative mx-[40px] flex items-center justify-center py-[120px]">
				<div className="flex flex-col gap-y-[60px]">
					<div className="flex max-w-[600px] flex-col gap-y-10">
						<div>
							<h2 className="text-main-purple text-title-5xl mb-5">
								Aprendizado Guiado
							</h2>
							<p className="text-section-xl">
								No TryPy, você aprende Python de verdade. Nossa trilha de
								aprendizagem permite explorar conteúdos com auxílio de
								videoaulas, praticar com exercícios, e avançar por uma jornada
								pensada para quem quer realmente aprender e não apenas replicar.
							</p>
						</div>
					</div>
					<div className="font-jetbrains flex w-fit flex-col lg:max-w-[1200px] lg:flex-row lg:gap-y-0">
						<div
							className="guide-cards"
							onMouseMove={handleMouseMove}
							onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
						>
							<h2 className="text-section-lg border-b-main-green border-b pb-[10px]">
								Organização do conteúdo
							</h2>
							<p className="text-section-base">
								Conteúdo planejado em uma sequência que respeita a progressão do
								aprendizado, facilitando a jornada de estudos.
							</p>
						</div>
						<svg className="h-[55px] w-[5px] shrink-0 self-center lg:h-[5px] lg:w-[55px]">
							<polyline
								className="fill-none stroke-white stroke-5 lg:hidden"
								points="0,0 0,55"
								strokeDasharray="5"
							/>
							<polyline
								className="hidden fill-none stroke-white stroke-5 lg:block"
								points="0,0 55,0"
								strokeDasharray="5"
							/>
						</svg>
						<div
							className="guide-cards"
							onMouseMove={handleMouseMove}
							onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
						>
							<h2 className="text-section-lg border-b-main-purple border-b pb-[10px]">
								Material didático
							</h2>
							<p className="text-section-base">
								Conteúdo criado com base na documentação oficial do Python,
								adaptado para uma abordagem mais didática e acessível.
							</p>
						</div>
						<svg className="h-[55px] w-[5px] shrink-0 self-center lg:h-[5px] lg:w-[55px]">
							<polyline
								className="fill-none stroke-white stroke-5 lg:hidden"
								points="0,0 0,55"
								strokeDasharray="5"
							/>
							<polyline
								className="hidden fill-none stroke-white stroke-5 lg:block"
								points="0,0 55,0"
								strokeDasharray="5"
							/>
						</svg>
						<div
							className="guide-cards"
							onMouseMove={handleMouseMove}
							onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
						>
							<h2 className="text-section-lg border-b-main-cyan border-b pb-[10px]">
								Exercícios com terminal integrado
							</h2>
							<p className="text-section-base">
								Exercícios autorais que permitem praticar os conceitos
								aprendidos diretamente pelo terminal integrado à plataforma.
							</p>
						</div>
					</div>
				</div>
			</section>
			<span className="block h-[1px] bg-indigo-900"></span>
			<section className="relative mx-[40px] flex items-center justify-center py-[120px]">
				<div className="flex flex-col gap-y-10 lg:flex-row-reverse lg:gap-x-[60px] lg:gap-y-0">
					<div className="flex max-w-[600px] min-w-0 flex-1 flex-col gap-y-10">
						<div>
							<h2 className="text-main-green text-title-5xl mb-5">
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
							className="border-main-green text-section-xl placeholder:text-section-xl py-section-btn-y self-start rounded-md border bg-white/5 px-[20px] transition-shadow duration-300 focus:shadow-[0_0_20px_var(--color-glow-green)]/20 focus:outline-none"
						/>
					</div>
					<div className="w-section-img relative rounded-md lg:self-center">
						<span className="text-student-name absolute top-[40%] left-[10%] max-w-[calc(var(--width-section-img)-60px)] truncate select-none">
							{studentName || 'Aluno'}
						</span>
						<img
							src="/assets/images/certificado-trypy.png"
							alt="Certificado TryPy"
							className="rounded-md"
							draggable="false"
						/>
					</div>
				</div>
			</section>
			<span className="block h-[1px] bg-indigo-900"></span>
			<section className="relative mx-[40px] flex items-center justify-center py-[120px]">
				<div className="flex flex-col gap-y-10 lg:flex-row lg:gap-x-[60px] lg:gap-y-0">
					<div className="flex max-w-[600px] flex-col gap-y-10">
						<div>
							<h2 className="text-main-purple text-title-5xl mb-5">
								Video-aulas integradas
							</h2>
							<p className="text-section-xl">
								Nossas videoaulas publicadas em nosso canal no YouTube são
								integradas à trilha de aprendizagem, complementando o conteúdo
								estudado ao longo do curso. Fique à vontade para se inscrever em
								nosso canal e tirar suas dúvidas, acompanhar novos conteúdos, e
								ficar por dentro de qualquer atualização.
							</p>
						</div>
						<a
							href="https://www.youtube.com/@trycode-dev"
							target="_blank"
							rel="noopener noreferrer"
							className="border-main-purple group px-section-btn-x py-section-btn-y text-section-xl-btn relative flex cursor-pointer items-center gap-x-[10px] self-start rounded-md border bg-white/5 font-bold lg:transition-shadow lg:hover:shadow-[0_0_20px_#ffffff24]"
						>
							<span className="absolute inset-0 -z-10 hidden rounded-md bg-linear-to-br from-[#00ff5998] to-[#8000ff88] opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:inline"></span>
							<img
								src="/assets/images/icons/minimalist-youtube.png"
								alt=""
								className="w-[30px]"
							/>
							<p>Conheça nosso canal</p>
						</a>
					</div>
					<img
						className="w-section-img rounded-md shadow-[0_0_15px_#00ff9960,0_0_30px_#7f00ff80] lg:self-center"
						src="/assets/images/video-lesson.png"
						alt="Vídeo aula"
						draggable="false"
					/>
				</div>
			</section>
			<span className="block h-[1px] bg-indigo-900"></span>
			<section className="relative mx-[40px] flex items-center justify-center py-[120px]">
				<div className="flex flex-col gap-y-5 lg:flex-row-reverse lg:gap-x-5 lg:gap-y-0">
					<div className="flex max-w-[600px] flex-col gap-y-10 py-5">
						<div>
							<h2 className="text-main-cyan text-title-5xl mb-5">
								Suporte ao aluno
							</h2>
							<p className="text-section-xl">
								Conte com nosso suporte sempre que precisar. Disponibilizamos
								diversos canais de contato para que você possa tirar dúvidas e
								receber ajuda durante sua jornada de aprendizado.
							</p>
						</div>

						<Link
							to="/support"
							className="lg:hover:bg-main-cyan/70 px-section-btn-x py-section-btn-y text-section-xl-btn border-main-cyan cursor-pointer self-start rounded-md border bg-white/5 font-bold transition-all duration-300 lg:bg-transparent lg:hover:border-black lg:hover:shadow-[0_0_25px_#FFFFFF]/25"
						>
							Fale conosco
						</Link>
					</div>
					<SvgPath />
				</div>
			</section>
		</>
	);
}
