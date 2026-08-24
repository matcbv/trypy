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
} as const;

const optionsMap = [
	'Erro no site',
	'Problemas ao gerar o certificado',
	'Outro',
];

export function Support() {
	const [isCopied, setIsCopied] = useState({
		gmail: false,
		whatsapp: false,
	});

	const copyText = async (key: keyof typeof contactsMap, text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => ({ ...prev, [key]: true }));
		setTimeout(() => {
			setIsCopied((prev) => ({ ...prev, [key]: false }));
		}, 2000);
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="relative mx-[20px] my-[120px] max-w-[400px] lg:max-w-[800px]">
				<div className="mb-10">
					<h1 className="text-main-purple text-title-5xl mb-10">Contate-nos</h1>
					<form className="border-l-main-purple grid grid-cols-1 gap-x-10 gap-y-5 border-l pl-4 lg:max-h-[280px] lg:grid-cols-2 lg:grid-rows-2">
						<div className="col-start-1 row-start-1 flex flex-col justify-around gap-y-4">
							<div className="flex flex-col gap-y-1">
								<label htmlFor="subject" className="text-sm">
									Assunto:
								</label>
								<select name="subject" id="subject" className="support-fields">
									{optionsMap.map((option) => (
										<option value={option} className="bg-black text-sm">
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
						</div>
						<input
							type="submit"
							value="Enviar"
							className="border-main-purple order-2 w-[150px] cursor-pointer self-end rounded-md border bg-[#7955c2]/20 py-2 text-sm transition-all duration-300 hover:shadow-[0_0_15px_#7955c270] lg:order-1 lg:col-start-1 lg:row-start-2 lg:hover:bg-[#7955c2]/70"
						/>
						<div className="order-1 flex flex-col gap-y-2 lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
							<label htmlFor="description" className="text-sm">
								Descrição:
							</label>
							<textarea
								name="description"
								id="description"
								rows={5}
								className="support-fields h-full resize-none"
							></textarea>
						</div>
					</form>
				</div>
				<div className="flex flex-col gap-y-5">
					<div className="flex flex-col gap-y-3">
						<h2 className="text-main-green text-2xl">
							Outras formas de contato
						</h2>
						<p>
							Fique a vontade também para nos contatar diretamente via e-mail ou
							suporte do WhatsApp. Para um atendimento mais ágil, dê preferencia
							ao contato via formulário.
						</p>
					</div>
					<div className="flex flex-col gap-y-5">
						{(
							Object.entries(contactsMap) as [
								keyof typeof contactsMap,
								{ title: string; value: string },
							][]
						).map(([key, { title, value }]) => (
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
											setTimeout(
												() => setIsCopied((prev) => ({ ...prev, key: false })),
												100,
											)
										}
									>
										<span className="lg:hover:text-main-green">{value}</span>
										<img
											src={
												isCopied[key]
													? '/assets/images/icons/success.png'
													: '/assets/images/icons/copy.png'
											}
											alt="Copiar"
											className="w-5 origin-left cursor-pointer transition-transform lg:scale-0 lg:group-hover:scale-100"
											onClick={() => void copyText(key, value)}
											role="button"
											tabIndex={0}
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
