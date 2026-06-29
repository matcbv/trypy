import { useState, type ChangeEvent } from 'react';
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

	return (
		<>
			<div className="flex w-full justify-center">
				<HeroBanner />
			</div>
			<span className="block h-[2px] bg-indigo-950"></span>
			<section className="relative my-[160px] flex justify-center gap-x-20">
				<div className="flex w-[600px] flex-col gap-y-12">
					<div>
						<h2 className="text-main-purple mb-5 text-5xl">
							Video-aulas integradas
						</h2>
						<p className="text-xl leading-9">
							Vídeo-aulas publicadas em nosso canal no YouTube e integradas à
							trilha de aprendizagem, complementando o conteúdo estudado ao
							longo do curso. Inscreva-se em nosso canal para tirar suas dúvidas
							e acompanhar novos conteúdos e atualizações.
						</p>
					</div>
					<button className="border-main-purple group relative h-[70px] w-[280px] cursor-pointer rounded-md border text-lg font-bold transition-shadow hover:shadow-[0_0_20px_#ffffff24]">
						<span className="absolute inset-0 rounded-md bg-linear-to-br from-[#00ff5998] to-[#8000ff88] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
						<p className="relative">Conheça nosso canal</p>
					</button>
				</div>
				<img
					className="h-[425px] w-[600px] rounded-md shadow-[0_0_15px_#00ff9960,0_0_30px_#7f00ff80]"
					src="/assets/images/video-lesson.png"
					alt="Vídeo aula"
					draggable="false"
				/>
			</section>
			<span className="block h-[2px] bg-indigo-950"></span>
			<section className="relative my-[160px] flex flex-row-reverse justify-center gap-x-20">
				<div className="flex w-[600px] flex-col gap-y-12">
					<div>
						<h2 className="text-main-green mb-5 text-5xl leading-tight">
							Certificado gratuito e personalizado
						</h2>
						<p className="text-xl leading-9">
							Ao concluir a trilha de aprendizagem, você recebe um certificado
							digital emitido em seu nome, contendo a carga horária total, os
							módulos concluídos e os principais conteúdos estudados durante o
							curso. Uma forma simples de registrar e compartilhar sua evolução.
						</p>
					</div>
					<input
						value={studentName}
						onChange={handleChange}
						placeholder="Digite seu nome..."
						className="border-main-green h-[60px] w-[320px] rounded-md border bg-white/5 px-4 text-xl placeholder-green-100/50 transition-shadow duration-300 placeholder:text-xl focus:shadow-[0_0_20px_var(--color-glow-green)]/20 focus:outline-none"
					/>
				</div>
				<div className="relative shrink-0 overflow-hidden rounded-md shadow-[0_0_10px_var(--color-glow-green)]/30">
					<span className="absolute top-[38%] left-15 text-5xl select-none">
						{studentName || 'Aluno'}
					</span>
					<img
						src="/assets/images/certificado-trypy.png"
						alt="Certificado TryPy"
						className="h-[425px] w-[600px]"
						draggable="false"
					/>
				</div>
			</section>
			<span className="block h-[2px] bg-indigo-950"></span>
			<section className="relative my-[160px] flex justify-center gap-x-20">
				<div className="w-[600px]">
					<h2 className="text-main-purple mb-5 text-5xl">Aprendizado Guiado</h2>
					<p className="text-xl leading-9">
						Nossa trilha de aprendizagem combina conteúdo teórico, videoaulas e
						exercícios práticos em uma progressão estruturada, permitindo que
						você aplique cada conceito aprendido antes de avançar para o próximo
						nível.
					</p>
				</div>
			</section>
			<span className="block h-[2px] bg-indigo-950"></span>
			<section className="relative my-[160px] flex flex-row-reverse justify-center gap-x-20">
				<div className="flex w-[600px] flex-col gap-y-12 py-5">
					<div>
						<h2 className="text-main-green mb-5 text-5xl">Suporte ao aluno</h2>
						<p className="text-xl leading-9">
							Conte com nosso suporte sempre que precisar. Disponibilizamos
							diversos canais de contato para que você possa tirar dúvidas e
							receber ajuda durante sua jornada de aprendizado. Responderemos o
							mais breve possível.
						</p>
					</div>

					<Link
						to="/support"
						className="hover:bg-main-combination flex w-[280px] cursor-pointer items-center justify-center rounded-md border border-white py-5 text-lg font-bold transition-all duration-300 hover:border-black hover:shadow-[0_0_25px_#FFFFFF]/25"
					>
						Fale conosco
					</Link>
				</div>
				<SvgPath />
			</section>
		</>
	);
}
