import axios from 'axios';
import { useState, type SubmitEvent } from 'react';
import { validationRegex } from '../constants/validationRegex';
import { logApiError } from '../utils/api';
import { logSuccess, logWarning } from '../utils/logger';

const optionsMap = [
	'Problemas com minha conta ou assinatura',
	'Erros ou problemas na plataforma',
	'Problemas na emissão de certificados',
	'Dúvidas ou outros assuntos',
];

interface EmailBodyProps {
	description: string;
	contactEmail: string;
	studentId: string;
	fullName: string;
}

export function Support() {
	const [emailSubject, setEmailSubject] = useState<string>('');
	const [emailBody, setEmailBody] = useState<EmailBodyProps>({
		description: '',
		contactEmail: '',
		studentId: '',
		fullName: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isCopied, setIsCopied] = useState(false);

	const copyText = async () => {
		await navigator.clipboard.writeText('support@trypy.dev');
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	const checkData = (emailBody: EmailBodyProps) => {
		return (Object.keys(emailBody) as Array<keyof typeof emailBody>).every(
			(key) => {
				const formattedData = emailBody[key]?.trim();

				switch (key) {
					case 'contactEmail':
						if (!formattedData) return false;
						return validationRegex.email.regex.test(formattedData);
					case 'description':
						return !!emailBody[key];
					case 'studentId':
					case 'fullName':
						return true;
				}
			},
		);
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isDataValid = checkData(emailBody);

		if (isSubmitting) return;

		if (!emailSubject) {
			logWarning('Selecione um assunto para enviar sua solicitação.');
			return;
		}

		if (!isDataValid) {
			logWarning(
				'Preencha todos os campos obrigatórios para enviar sua solicitação.',
			);
			return;
		}

		try {
			setIsSubmitting(true);
			await axios.post(`${import.meta.env.VITE_API_URL}/api/email/support`, {
				emailSubject,
				emailBody: {
					fullName: emailBody.fullName || null,
					studentId: emailBody.studentId || null,
					description: emailBody.description,
					contactEmail: emailBody.contactEmail,
				},
			});
			setEmailSubject('');
			setEmailBody({
				contactEmail: '',
				description: '',
				fullName: '',
				studentId: '',
			});
			logSuccess('Solicitação enviada com sucesso!');
		} catch (error) {
			logApiError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="relative mx-5 my-30 flex flex-col items-center">
				<div className="mb-10 max-w-100 lg:max-w-200">
					<div className="mb-7">
						<h1 className="text-main-green text-title-4xl mb-3">Contate-nos</h1>
						<p className="text-section-base mb-3">
							Entre em contato conosco pelo formulário ou por um de nossos
							canais de atendimento. Nossa equipe responderá à sua mensagem em
							até <span className="font-bold">48 horas úteis</span>.
						</p>
						<p>
							Após o envio, você receberá um{' '}
							<span className="font-bold">e-mail de confirmação</span> com os
							detalhes do seu chamado.
						</p>
					</div>
					<form
						className="border-l-main-green grid grid-cols-1 gap-x-10 gap-y-5 border-l pl-4 lg:grid-cols-2"
						onSubmit={(e) => void handleSubmit(e)}
					>
						<div className="flex flex-col justify-around gap-y-3">
							<div className="flex flex-col gap-y-1">
								<label htmlFor="subject" className="ml-px text-sm">
									Assunto: <span className="text-main-green">*</span>
								</label>
								<select
									name="subject"
									id="subject"
									className="rounded-md bg-black/50 px-2 py-[10px] focus:outline-none"
									value={emailSubject}
									onChange={(e) => setEmailSubject(e.target.value)}
								>
									<option
										value=""
										className="bg-black text-sm text-gray-200"
										disabled
									>
										Selecione um assunto
									</option>
									{optionsMap.map((option) => (
										<option
											key={option}
											value={option}
											className="bg-black text-sm text-gray-200"
										>
											{option}
										</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-y-1">
								<label htmlFor="name" className="ml-px text-sm">
									Nome completo:
								</label>
								<input
									type="text"
									id="name"
									value={emailBody.fullName}
									className="rounded-md bg-black/50 p-2 focus:outline-none"
									onChange={(e) =>
										setEmailBody((prev) => ({
											...prev,
											fullName: e.target.value,
										}))
									}
								/>
							</div>
							<div className="flex flex-col gap-y-1">
								<label htmlFor="id" className="ml-px text-sm">
									ID do aluno:
								</label>
								<input
									type="text"
									id="id"
									value={emailBody.studentId}
									placeholder="TPY-XXXXXX"
									className="rounded-md bg-black/50 p-2 focus:outline-none"
									onChange={(e) =>
										setEmailBody((prev) => ({
											...prev,
											studentId: e.target.value,
										}))
									}
								/>
							</div>
							<div className="flex flex-col gap-y-1">
								<label htmlFor="email" className="ml-px text-sm">
									E-mail para contato:{' '}
									<span className="text-main-green">*</span>
								</label>
								<input
									type="text"
									id="email"
									value={emailBody.contactEmail}
									className="rounded-md bg-black/50 p-2 focus:outline-none"
									onChange={(e) =>
										setEmailBody((prev) => ({
											...prev,
											contactEmail: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<div className="flex flex-col gap-y-3 lg:justify-between">
							<div className="flex h-full flex-col gap-y-2">
								<label htmlFor="description" className="ml-px text-sm">
									Descrição: <span className="text-main-green">*</span>
								</label>
								<textarea
									name="description"
									id="description"
									value={emailBody.description}
									rows={5}
									className="customScrollbar h-full resize-none rounded-md bg-black/50 p-2 focus:outline-none"
									onChange={(e) =>
										setEmailBody((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
								/>
							</div>
							<div className="flex items-end justify-start gap-3">
								<button
									type="submit"
									className="border-main-green bg-main-green/20 lg:hover:bg-main-green/60 flex w-[150px] justify-center rounded-md border py-2 text-sm transition-all duration-300 lg:cursor-pointer lg:hover:shadow-[0_0_10px_#ffffff]/20"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<img
											src="assets/images/loading.png"
											alt="Enviando"
											className="w-5"
										/>
									) : (
										'Enviar'
									)}
								</button>
								<p className="text-sm text-gray-300">
									<span className="text-main-green">*</span> Campos obrigatórios
								</p>
							</div>
						</div>
					</form>
				</div>
				<div className="flex max-w-200 flex-col gap-y-5 rounded-md bg-black/30 p-5 outline outline-black backdrop-blur-xl lg:p-10">
					<h2 className="text-2xl">Canais de suporte</h2>
					<div className="flex flex-col gap-y-5">
						<div className="flex flex-col items-start gap-y-10">
							<div className="flex flex-col items-start">
								<div className="mb-2 flex items-center gap-x-2">
									<img
										src="/assets/images/icons/youtube.png"
										alt="YouTube"
										className="w-8"
									/>
									<h3 className="text-lg font-bold">YouTube</h3>
								</div>
								<p className="text-section-base mb-3">
									Para dúvidas em uma matéria ou exercício, pergunte diretamente
									na videoaulas de nosso canal.
								</p>
								<a
									target="_blank"
									rel="noopener noreferrer"
									href="https://www.youtube.com/@trypydev"
									className="border-main-red/50 text-section-base rounded-md border bg-white/20 px-5 py-[10px] text-center lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
								>
									Conheça nosso canal
								</a>
							</div>
							<div className="flex flex-col items-start">
								<div className="mb-2 flex items-center gap-x-2">
									<img
										src="/assets/images/icons/discord.png"
										alt="Discord"
										className="w-8"
									/>
									<h3 className="text-lg font-bold">Discord</h3>
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
									className="border-main-purple/50 text-section-base rounded-md border bg-white/20 px-5 py-[10px] text-center lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
								>
									Enviar um convite
								</a>
							</div>
							<div className="flex flex-col items-start">
								<div className="mb-2 flex items-center gap-x-2">
									<img
										src="/assets/images/icons/gmail.png"
										alt="Gmail"
										className="w-8"
									/>
									<h3 className="text-lg font-bold">E-mail</h3>
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
									className="text-section-base rounded-md border border-white/50 bg-white/20 px-5 py-[10px] text-center lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
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
