import { HeroBanner } from '../components/HeroBanner';

export function Home() {
	return (
		<>
			<div className="flex w-full justify-center border-b border-b-indigo-950">
				<HeroBanner />
			</div>
			<section className="relative z-10 flex justify-center gap-x-20 py-40">
				<div className="flex flex-col gap-y-12">
					<div>
						<h2 className="mb-6 text-5xl text-[var(--main-purple)]">
							Video-aulas integradas
						</h2>
						<p className="w-[600px] text-xl leading-relaxed">
							Vídeo-aulas postadas em nosso canal no YouTube e integradas à
							plataforma, servindo como conteúdo complementar para nosso
							material didático.
						</p>
					</div>
					<button className="w-[280px] cursor-pointer rounded-md border border-[var(--main-purple)] bg-gradient-to-br from-[#00ff595c] to-[#7f00ff4d] py-5 text-lg transition-shadow hover:shadow-[0_0_15px_#ffffff24]">
						Conheça nosso canal
					</button>
				</div>
				<img
					className="w-[600px] rounded-md shadow-[0_0_15px_#00ff9980,_0_0_30px_#7f00ff88]"
					src="/assets/images/video_lesson.png"
					alt="Vídeo aula"
				/>
			</section>
		</>
	);
}
