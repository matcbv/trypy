import { useState } from 'react';

const contactsMap = {
	gmail: {
		title: 'Gmail',
		value: 'contato.trypy@gmail.com',
	},
	whatsapp: {
		title: 'WhatsApp',
		value: '(24) 98100-2374',
	},
};

export function Support() {
	const [isCopied, setIsCopied] = useState(false);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="relative my-20">
				<div className="mb-12">
					<h1 className="text-main-purple mb-10 text-4xl">Contate-nos</h1>
					<form className="flex gap-x-12">
						<div className="border-l-main-purple flex flex-col justify-around border-l pl-4">
							<div className="flex flex-col gap-y-1">
								<label htmlFor="subject" className="text-sm">
									Assunto:
								</label>
								<select name="subject" id="subject" className="support-fields">
									<option value="">Erro no site</option>
									<option value="">Problemas ao gerar o certificado</option>
									<option value="">Conta perdida</option>
									<option value="">Outro</option>
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
									className="support-fields"
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
									className="support-fields"
								/>
							</div>
							<input
								type="submit"
								value="Enviar"
								className="border-main-purple cursor-pointer rounded-md border bg-[#7955c2]/20 py-1 text-sm transition-all duration-300 hover:bg-[#7955c2]/70 hover:shadow-[0_0_15px_#7955c270]"
							/>
						</div>
						<div className="flex flex-col gap-y-2">
							<label htmlFor="description" className="text-sm">
								Descrição:
							</label>
							<textarea
								name="description"
								id="description"
								rows={10}
								cols={40}
								className="support-fields resize-none"
							></textarea>
						</div>
					</form>
				</div>
				<div className="flex max-w-[825px] flex-col gap-y-5">
					<div className="flex flex-col gap-y-3">
						<h2 className="text-main-green text-2xl">
							Outras formas de contato
						</h2>
						<p className="leading-6">
							Fique a vontade também para nos contatar diretamente via e-mail ou
							suporte do WhatsApp. Para um atendimento mais ágil, dê preferencia
							ao contato via formulário.
						</p>
					</div>
					<div className="flex flex-col gap-y-5">
						{Object.entries(contactsMap).map(([key, { title, value }]) => (
							<div key={key} className="flex flex-col items-start gap-y-5">
								<div>
									<p className="mb-2 flex gap-x-2">
										<img
											src={`/assets/images/icons/${key}.png`}
											alt={title}
											className="size-[24px]"
										/>
										{title}
									</p>
									<p
										className="group flex cursor-pointer items-center gap-x-2 transition-colors"
										onMouseLeave={() =>
											setTimeout(() => setIsCopied(false), 100)
										}
									>
										<span className="hover:text-main-green">{value}</span>
										<img
											src={
												isCopied
													? '/assets/images/icons/success.png'
													: '/assets/images/icons/copy.png'
											}
											alt="Copiar"
											className="w-5 origin-left scale-0 cursor-pointer transition-transform group-hover:scale-100"
											onClick={() => void copyText(value)}
										/>
									</p>
								</div>
							</div>
						))}
					</div>
					<p>Nosso prazo para respostas é de até 48 horas úteis.</p>
				</div>
			</div>
		</div>
	);
}
