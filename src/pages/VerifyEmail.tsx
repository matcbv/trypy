import { EmailAuthProvider, getIdToken, unlink } from 'firebase/auth';
import { useRequireUser } from '../hooks/useRequireUser';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { defaultErrorMessage, logError, logSuccess } from '../utils/logger';
import { useEffect, useState } from 'react';
import { auth } from '../database/configs/firebase';
import { DisplayableError } from '../classes/DisplayableError';
import { signOutAndClear } from '../services/auth/signOutAndClear';
import { logApiError } from '../utils/api';

export function VerifyEmail() {
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [isEmailSending, setIsEmailSending] = useState(false);
	const [canSendEmail, setCanSendEmail] = useState(true);
	const [isCanceling, setIsCanceling] = useState(false);
	const [timer, setTimer] = useState(60);
	const navigate = useNavigate();
	const location = useLocation();
	const requireUser = useRequireUser();

	const state = location.state as VerifyEmailState | null;

	useEffect(() => {
		const user = auth.currentUser;

		if (!user) return;

		const reloadLoop = setInterval(async () => {
			try {
				await user.reload();

				if (user.emailVerified) {
					clearInterval(reloadLoop);
					if (state?.mode === 'link-email') {
						void navigate('/dashboard/account-and-security', { replace: true });
						logSuccess('E-mail e senha vinculados com sucesso!');
						return;
					}
					void navigate('/dashboard', { replace: true });
					logSuccess('Conta criada com sucesso!');
				}
			} catch (error) {
				logError({ error });
			}
		}, 5000);

		return () => clearInterval(reloadLoop);
	}, [navigate, state?.mode]);

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

	const sendVerificationEmail = async () => {
		if (isEmailSending || !canSendEmail) return;

		setIsEmailSending(true);

		try {
			const user = await requireUser();
			const idToken = await getIdToken(user);
			await axios.post(
				`${import.meta.env.VITE_API_URL}/api/email/verification`,
				{},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
				},
			);

			setIsEmailSent(true);
			setCanSendEmail(false);
			setTimer(60);
			logSuccess('E-mail enviado com sucesso.');
		} catch (error) {
			logApiError(error);
		} finally {
			setIsEmailSending(false);
		}
	};

	const handleCancel = async () => {
		if (isCanceling) return;

		setIsCanceling(true);

		try {
			const user = await requireUser();

			if (state?.mode === 'link-email') {
				await unlink(user, EmailAuthProvider.PROVIDER_ID);
				void navigate('/dashboard/account-and-security', { replace: true });
				return;
			}

			if (!user) {
				throw new DisplayableError('Não foi possível identificar sua conta.');
			}

			const idToken = await getIdToken(user);
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/account`, {
				headers: {
					Authorization: `Bearer ${idToken}`,
				},
			});

			await signOutAndClear();
			logSuccess('Criação da conta cancelada com sucesso!');
			void navigate('/register', { replace: true });
		} catch (error) {
			logApiError(error);
		} finally {
			setIsCanceling(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-115 w-full max-w-100 rounded-lg shadow-[0_0_20px_#ffffff]/10 lg:max-w-180">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative w-full rounded-lg p-7 lg:p-10">
					<h1 className="text-title-3xl mb-5 font-bold tracking-wide">
						Confirme seu e-mail
					</h1>
					<div className="self-start">
						<div className="flex flex-col gap-y-5">
							<p className="text-section-base">
								{state?.mode === 'link-email'
									? 'Para concluir a vinculação do seu e-mail e senha, precisamos verificar seu endereço de e-mail.'
									: 'Para finalizar a criação da sua conta e se tornar aluno do TryPy, precisamos confirmar seu endereço de e-mail.'}
							</p>
							<p className="text-section-base">
								Após confirmar seu endereço de e-mail, você será redirecionado
								automaticamente para sua conta em alguns segundos.
							</p>
							<div className="border-main-green mb-5 flex flex-col gap-y-3 rounded-md border border-dashed bg-black/20 p-7 shadow-[0_0_15px_#ffffff]/10 backdrop-blur-xs">
								<div className="flex items-center gap-x-[6px]">
									{isEmailSending || isCanceling ? (
										<img
											src={`/assets/images/loading.png`}
											alt="Enviando"
											className="w-6"
										/>
									) : (
										<img
											src={`/assets/images/icons/${isEmailSent ? 'success' : 'hourglass'}.png`}
											alt={isEmailSent ? 'Sucesso' : 'Aguardando'}
											className="w-6"
										/>
									)}
									<p className="text-section-lg font-bold">
										{isCanceling
											? 'Cancelando'
											: isEmailSending
												? 'Enviando e-mail'
												: isEmailSent
													? 'E-mail enviado'
													: 'Aguardando envio'}
									</p>
								</div>
								<div className="flex gap-x-3">
									<button
										className="form-btn text-section-base relative overflow-hidden"
										onClick={() => void sendVerificationEmail()}
										disabled={isEmailSending || !canSendEmail}
									>
										{isEmailSent ? (
											<p>
												Reenviar e-mail{' '}
												{timer >= 1 && (
													<span className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-xs">
														{timer}
													</span>
												)}
											</p>
										) : (
											'Enviar e-mail'
										)}
									</button>
									<button
										className="form-btn text-section-base"
										onClick={() => void handleCancel()}
										disabled={isCanceling}
									>
										Cancelar
									</button>
								</div>
								<p className="text-section-sm">
									Não encontrou o e-mail? Confira a pasta de spam ou lixo
									eletrônico. Você também pode solicitar um novo envio em alguns
									instantes.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
