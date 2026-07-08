import { useState } from 'react';

const socialMediaMap = {
	Github: {
		src: '/assets/images/icons/github.png',
		link: {
			matheus: 'https://github.com/matcbv',
			daniel: 'https://github.com/Daniel16Bit',
		},
	},
	LinkedIn: {
		src: '/assets/images/icons/linkedin.png',
		link: {
			matheus: 'https://www.linkedin.com/in/matheus-cerqueira-baiao-victor',
			daniel: 'https://www.linkedin.com/in/mdaniel-main',
		},
	},
	Gmail: {
		src: '/assets/images/icons/gmail.png',
		link: {
			matheus: 'mailto:matheuscbv23@gmail.com?subject=Assunto%20a%20tratar...',
			daniel: 'mailto:mdaniel.main@gmail.com?subject=Assunto%20a%20tratar...',
		},
	},
	Instagram: {
		src: '/assets/images/icons/instagram.png',
		link: {
			matheus: 'https://www.instagram.com/matheus.cbv',
			daniel: 'https://www.instagram.com/daniel8bit/',
		},
	},
};

export function AboutUs() {
	const [iconHovered, setIconHovered] = useState('');

	return (
		<main>
			<section className="group my-[160px] flex items-center justify-center gap-x-20">
				<img
					src="/assets/images/trycode-logo.png"
					alt="TryCode"
					className="w-[350px]"
				/>
				<div className="w-[600px]">
					<h1 className="mb-5 text-4xl font-bold tracking-wide">
						Conheça a{' '}
						<span className="bg-trycode bg-size-[200%_100%] bg-clip-text bg-left text-transparent transition-[background-position] duration-500 ease-in-out group-hover:bg-right">
							TryCode
						</span>
					</h1>
					<div className="flex flex-col gap-y-5 text-lg leading-relaxed">
						<p>
							A TryCode Technologies Ltda. é uma startup focada na educação em
							tecnologia. Criamos cursos e plataformas destinadas a quem quer
							entrar na área tech ou avançar em uma habilidade específica. Isso
							inclui desde quem nunca escreveu uma linha de código até quem já
							trabalha na área mas quer ir além.
						</p>
						<p>
							A ideia veio de um problema concreto: o conteúdo técnico
							disponível é muito, mas encontrar um caminho com aplicação prática
							ainda é difícil para a maioria das pessoas. A TryCode existe para
							facilitar isso.
						</p>
						<p>
							Queremos chegar a cada vez mais pessoas, mas sem perder a alma do
							negócio. Entregar conteúdo de qualidade, junto de formas de
							aplicar o aprendizado, sempre foi e sempre será nosso objetivo,
							seja em um emprego, em uma mudança de carreira ou em um projeto
							próprio.
						</p>
					</div>
				</div>
			</section>
			<span className="block h-[2px] bg-white/50 bg-linear-to-r"></span>
			<section className="flex justify-center">
				<div className="my-[160px] flex flex-col">
					<h1 className="mb-[100px] text-4xl font-bold">
						Conheça nossa equipe
					</h1>
					<div className="flex h-[250px] items-center justify-center gap-x-12">
						<div className="flex h-full w-[150px] flex-col justify-between">
							<div>
								<img
									src="/assets/images/matheus.png"
									alt="Foto Matheus"
									className="mb-2 size-[150px] rounded-full object-cover shadow-[0_0_20px_var(--color-glow-green)]/30"
								/>
								<h3 className="text-center text-sm font-bold">
									Criador e Professor da plataforma TryPy
								</h3>
							</div>

							<div className="flex w-full justify-around">
								{Object.entries(socialMediaMap).map(([key, { src, link }]) => (
									<a
										href={link['matheus']}
										rel="noopener noreferrer"
										target="_blank"
									>
										<img src={src} alt={key} />
									</a>
								))}
							</div>
						</div>
						<div className="flex h-full w-[600px] flex-col justify-between">
							<div>
								<h2 className="text-main-green mb-4 text-3xl font-bold">
									Matheus Cerqueira
								</h2>
								<p className="text-lg leading-7">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Non
									consequuntur maiores quidem facilis blanditiis pariatur eos!
									Aliquid ratione repudiandae iure, amet, eligendi commodi atque
									corporis, vel doloribus voluptatum facere natus!
								</p>
							</div>
							<a
								href=""
								rel="noopener noreferrer"
								target="_blank"
								className="border-main-green hover:bg-main-green flex h-[50px] w-[150px] cursor-pointer items-center justify-center gap-x-2 rounded-md border-2 font-bold transition-all hover:border-black hover:text-black"
								onMouseEnter={() => setIconHovered('lt-matheus')}
								onMouseLeave={() => setIconHovered('')}
							>
								Linktree
								<img
									src={`/assets/images/icons/linktree-${iconHovered === 'lt-matheus' ? 'black' : 'white'}.png`}
									alt="Linktree"
									className="size-[24px] opacity-100"
								/>
							</a>
						</div>
					</div>
					<span className="from-main-green to-main-purple my-[80px] block h-[2px] w-[1000px] bg-linear-to-r"></span>
					<div className="flex h-[250px] flex-row-reverse items-center justify-center gap-x-12">
						<div className="flex h-full w-[150px] flex-col justify-between">
							<div>
								<img
									src="/assets/images/daniel.png"
									alt="Foto Daniel"
									className="mb-2 size-[150px] rounded-full shadow-[0_0_20px_var(--color-main-purple)]/30"
								/>
								<h3 className="text-center text-sm font-bold">
									Professor da plataforma TryPy
								</h3>
							</div>

							<div className="flex w-full justify-around">
								{Object.entries(socialMediaMap).map(([key, { src, link }]) => (
									<a
										href={link['daniel']}
										rel="noopener noreferrer"
										target="_blank"
									>
										<img src={src} alt={key} />
									</a>
								))}
							</div>
						</div>
						<div className="flex h-full w-[600px] flex-col justify-between">
							<div>
								<h2 className="text-main-purple mb-4 text-3xl font-bold">
									Daniel Ferrari
								</h2>
								<p className="text-lg leading-7">
									Lorem ipsum dolor sit amet consectetur adipisicing elit.
									Obcaecati eius ipsum adipisci rem distinctio perferendis
									quaerat a, nesciunt aperiam quas delectus facere voluptatum
									rerum magnam maiores odit iure hic corporis.
								</p>
							</div>
							<a
								href=""
								rel="noopener noreferrer"
								target="_blank"
								className="border-main-purple hover:bg-main-purple flex h-[50px] w-[150px] cursor-pointer items-center justify-center gap-x-2 rounded-md border-2 font-bold transition-all hover:border-black hover:text-black"
								onMouseEnter={() => setIconHovered('lt-daniel')}
								onMouseLeave={() => setIconHovered('')}
							>
								Linktree
								<img
									src={`/assets/images/icons/linktree-${iconHovered === 'lt-daniel' ? 'black' : 'white'}.png`}
									alt="Linktree"
									className="size-[24px] opacity-100"
								/>
							</a>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
