import { useEffect, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { logError, logSuccess, logWarning } from '../utils/logger';
import axios from 'axios';

export function ResetPassword() {
	const [email, setEmail] = useState<string | null>(null);
	const [isEmailSending, setIsEmailSending] = useState(false);
	const [canSendEmail, setCanSendEmail] = useState(true);
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [timer, setTimer] = useState(60);
	const navigate = useNavigate();

	useEffect(() => {
		if (!setIsEmailSending) return;

		const timerId = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					setCanSendEmail(true);
					clearInterval(timerId);
					return 0;
				}

				return prev - 1;
			});
		}, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, [isEmailSending]);

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isEmailSending || !canSendEmail) return;

		if (!email) {
			logWarning('Preencha o campo de e-mail!');
			return;
		}

		setIsEmailSending(true);

		try {
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/email/reset-password`,
				{ email },
			);

			setIsEmailSent(true);
			setCanSendEmail(false);
			setTimer(60);
			logSuccess('E-mail enviado com sucesso.');
		} catch (error) {
			logError({ error });
		} finally {
			setIsEmailSending(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-100 max-w-125 rounded-lg shadow-[0_0_20px_#ffffff]/10">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative flex flex-col justify-center p-10">
					<h1 className="text-title-2xl mb-3 font-bold tracking-wider">
						Redefinir senha
					</h1>
					<p className="text-section-base mb-5 tracking-wide">
						Para redefinir sua senha, informe o e-mail cadastrado em sua conta.
						Você receberá uma mensagem com as instruções para criar uma nova
						senha.
					</p>
					<form
						className="mb-10 max-w-[350px]"
						onSubmit={(e) => void handleSubmit(e)}
					>
						<div className="text-sm">
							<div className="border-b-main-green relative mb-5 flex w-full items-end border-b-2">
								<label htmlFor="email" className="font-jetbrains w-20">
									E-mail
								</label>
								<input
									type="text"
									id="email"
									className="w-full focus:outline-none"
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="flex gap-x-3">
								<button
									type="submit"
									className="form-btn text-section-base relative overflow-hidden font-bold"
									disabled={isEmailSending || !canSendEmail}
								>
									{isEmailSent ? (
										<p>
											Reenviar e-mail{' '}
											{timer >= 1 && (
												<span className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs">
													{timer}
												</span>
											)}
										</p>
									) : (
										'Enviar e-mail'
									)}
								</button>
								<button
									type="button"
									onClick={() => void navigate(-1)}
									className="form-btn text-section-base"
								>
									Voltar
								</button>
							</div>
						</div>
					</form>
					<div>
						<h2 className="text-title-lg mb-2">Não se lembra do e-mail?</h2>
						<button
							type="button"
							className="lg:hover:text-main-purple text-sm lg:cursor-pointer lg:transition-colors"
						>
							Entre em contato conosco
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
