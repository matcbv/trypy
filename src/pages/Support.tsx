import { useState } from 'react';

const optionsMap = [
	'Problemas na conta ou assinatura',
	'Erros ou problemas na plataforma',
	'Problemas com a emissão de certificados',
	'Outros assuntos',
];

export function Support() {
	const [isCopied, setIsCopied] = useState(false);

	const copyText = async () => {
		await navigator.clipboard.writeText('support@trypy.dev');
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="relative mx-5 my-30 w-full max-w-100 lg:max-w-200">
				<div className="mb-10">
					<div className="mb-5">
						<h1 className="text-main-green text-title-4xl mb-3">Contate-nos</h1>
						<p className="text-section-base">
							Entre em contato conosco pelo formulário ou por um de nossos
							canais de atendimento. Nossa equipe responderá à sua mensagem em
							até <span className="font-bold">48 horas úteis</span>.
						</p>
					</div>
					<form className="border-l-main-green grid grid-cols-1 gap-x-10 gap-y-5 border-l pl-4 lg:max-h-70 lg:grid-cols-2 lg:grid-rows-2">
						<div className="col-start-1 row-start-1 flex flex-col justify-around gap-y-4">
							<div className="flex flex-col gap-y-1">
								<label htmlFor="subject" className="text-sm">
									Assunto:
								</label>
								<select name="subject" id="subject" className="support-field">
									{optionsMap.map((option, i) => (
										<option key={i} value={option} className="bg-black text-sm">
											{option}
										</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-y-1">
								<label htmlFor="id" className="text-sm">
									ID do aluno:
								</label>
								<input
									type="text"
									name="id"
									id="id"
									placeholder="TPY-XXXXXX"
									className="support-field"
								/>
							</div>
							<div className="flex flex-col gap-y-1">
								<label htmlFor="email" className="text-sm">
									E-mail para contato:
								</label>
								<input
									type="text"
									name="email"
									id="email"
									className="support-field"
								/>
							</div>
						</div>
						<input
							type="submit"
							value="Enviar"
							className="border-main-green lg:hover:bg-main-green/60 bg-main-green/20 order-2 w-[150px] self-end rounded-md border py-2 text-sm transition-all duration-300 lg:order-1 lg:col-start-1 lg:row-start-2 lg:cursor-pointer lg:hover:shadow-[0_0_10px_#ffffff]/20"
						/>
						<div className="order-1 flex flex-col gap-y-2 lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
							<label htmlFor="description" className="text-sm">
								Descrição:
							</label>
							<textarea
								name="description"
								id="description"
								rows={5}
								className="support-field h-full resize-none"
							></textarea>
						</div>
					</form>
				</div>
				<div className="flex flex-col gap-y-5 rounded-md bg-black/30 p-5 outline outline-black backdrop-blur-xl lg:p-10">
					<h2 className="text-2xl">Canais de suporte</h2>
					<div className="flex flex-col gap-y-5">
						<div className="flex flex-col items-start gap-y-10">
							<div className="flex flex-col items-start">
								<div className="mb-2 flex items-center gap-x-2">
									<img
										src="/assets/images/icons/youtube.png"
										alt="YouTube"
										className="w-9"
									/>
									<h3 className="text-lg">YouTube</h3>
								</div>
								<p className="text-section-base mb-3">
									Para dúvidas em uma matéria ou exercício, pergunte diretamente
									na videoaulas de nosso canal.
								</p>
								<a
									target="_blank"
									rel="noopener noreferrer"
									href="https://www.youtube.com/@trypydev"
									className="border-main-red/50 text-section-base rounded-md border bg-white/15 px-5 py-[10px] text-center lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
								>
									Conheça nosso canal
								</a>
							</div>
							<div className="flex flex-col items-start">
								<div className="mb-2 flex items-center gap-x-2">
									<img
										src="/assets/images/icons/discord.png"
										alt="Discord"
										className="w-9"
									/>
									<h3 className="text-lg">Discord</h3>
								</div>
								<p className="text-section-base mb-3">
									Aprenda junto com a comunidade! Entre no nosso Discord para
									compartilhar conhecimentos, trocar experiências e evoluir ao
									lado de outros estudantes.
								</p>
								<a
									target="_blank"
									rel="noopener noreferrer"
									href=""
									className="border-main-purple/50 text-section-base rounded-md border bg-white/15 px-5 py-[10px] text-center lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
								>
									Enviar um convite
								</a>
							</div>
							<div className="flex flex-col items-start">
								<div className="mb-2 flex items-center gap-x-2">
									<img
										src="/assets/images/icons/gmail.png"
										alt="Gmail"
										className="w-9"
									/>
									<h3 className="text-lg">Gmail</h3>
								</div>
								<p className="text-section-base mb-3">
									Para dúvidas ou problemas relacionados à plataforma, à sua
									conta ou à sua assinatura, entre em contato conosco pelo
									e-mail:{' '}
									<span className="relative inline">
										<button
											className="cursor-pointer text-red-200"
											onClick={() => void copyText()}
										>
											support@trypy.dev
										</button>
										{isCopied ? (
											<img
												src="/assets/images/icons/success.png"
												alt="Copiado"
												className="absolute top-0 -right-6 w-5"
											/>
										) : (
											<img
												src="/assets/images/icons/copy.png"
												alt="Copiar"
												tabIndex={0}
												role="button"
												className="absolute top-0 -right-6 w-5 lg:cursor-pointer"
												onClick={() => void copyText()}
											/>
										)}
									</span>
								</p>
								<a
									href="mailto:support@trypy.dev?subject=Assunto%20a%20tratar..."
									className="text-section-base rounded-md border border-white/50 bg-white/15 px-5 py-[10px] text-center lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
								>
									Enviar um e-mail
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
