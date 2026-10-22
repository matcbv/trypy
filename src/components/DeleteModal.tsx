import {
	useEffect,
	useState,
	type SetStateAction,
	type SubmitEvent,
} from 'react';
import { SnakeLoader } from './SnakeLoader';
import {
	defaultErrorMessage,
	logError,
	logSuccess,
	logWarning,
} from '../utils/logger';
import { DisplayableError } from '../classes/DisplayableError';
import {
	EmailAuthProvider,
	getIdToken,
	getIdTokenResult,
	GithubAuthProvider,
	GoogleAuthProvider,
	ProviderId,
	reauthenticateWithCredential,
	reauthenticateWithPopup,
	type User,
} from 'firebase/auth';
import { useRequireUser } from '../hooks/useRequireUser';
import axios from 'axios';
import { signOutAndClear } from '../services/auth/signOutAndClear';
import { useNavigate } from 'react-router-dom';
import type { ApiError } from '../types/api';
import { githubProvider, googleProvider } from '../database/configs/firebase';
import { idGenerator } from '../utils/idGenerator';
import type { Providers } from '../pages/AccountAndSecurity';

type Steps = null | 'password' | 'code' | 'reauthenticate';

interface DeleteModalProps {
	setShowDeleteModal: React.Dispatch<SetStateAction<boolean>>;
}

export function DeleteModal({ setShowDeleteModal }: DeleteModalProps) {
	const [signInProvider, setSignInProvider] = useState<null | Providers>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [step, setStep] = useState<Steps>(null);
	const [deleteCodeInputValue, setDeleteCodeInputValue] = useState<string>('');
	const [userPassword, setUserPassword] = useState('');
	const [isVisible, setIsVisible] = useState(false);
	const [deleteCode, setDeleteCode] = useState(() =>
		idGenerator().generateId(),
	);
	const requireUser = useRequireUser();
	const navigate = useNavigate();

	useEffect(() => {
		void (async () => {
			try {
				const user = await requireUser();
				const { signInProvider } = await getIdTokenResult(user);

				switch (signInProvider) {
					case ProviderId.PASSWORD:
						setStep('password');
						break;

					case ProviderId.GOOGLE:
						setStep('code');
						setSignInProvider(ProviderId.GOOGLE);
						break;

					case ProviderId.GITHUB:
						setStep('code');
						setSignInProvider(ProviderId.GITHUB);
						break;

					default:
						logError({
							error: new DisplayableError(
								'Não foi possível identificar seu método de autenticação.',
							),
						});
						setShowDeleteModal(false);
						break;
				}
			} catch (error) {
				logError({ error });
			}
		})();
	}, [requireUser, setShowDeleteModal]);

	const deleteAccount = async (user: User) => {
		try {
			const idToken = await getIdToken(user);
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/account`, {
				headers: {
					Authorization: `Bearer ${idToken}`,
				},
			});

			await signOutAndClear();

			void navigate('/', { replace: true });
			logSuccess('Conta deletada com sucesso!');
		} catch (error) {
			if (axios.isAxiosError<ApiError>(error)) {
				if (error.response?.status === 401) {
					logError({
						error: new DisplayableError(
							'Não foi possível confirmar sua sessão. Tente novamente.',
						),
					});
					return;
				}

				if (error.response) {
					logError({
						error,
						text: error.response.data?.error || defaultErrorMessage,
					});
					return;
				}
			}
			logError({ error });
		}
	};

	const handleDeleteAccount = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isDeleting) return;

		if (step === 'code') {
			if (deleteCode !== deleteCodeInputValue) {
				setDeleteCodeInputValue('');
				logWarning('Código de exclusão inválido. Tente novamente.');
				return;
			}

			setStep('reauthenticate');
		}

		try {
			if (userPassword.length <= 0) return;

			setIsDeleting(true);

			const user = await requireUser();

			const passwordProvider = user.providerData.find(
				(provider) => provider.providerId === ProviderId.PASSWORD,
			);

			if (!passwordProvider?.email) {
				throw new DisplayableError(
					'Não foi possível identificar o e-mail da sua conta. Tente entrar novamente.',
				);
			}

			const credential = EmailAuthProvider.credential(
				passwordProvider.email,
				userPassword,
			);

			await reauthenticateWithCredential(user, credential);
			await deleteAccount(user);
			return;
		} catch (error) {
			setUserPassword('');
			logError({ error });
		} finally {
			setIsDeleting(false);
		}
	};

	const reauthenticateWithProvider = async (
		provider: GoogleAuthProvider | GithubAuthProvider,
	) => {
		try {
			setIsDeleting(true);

			const user = await requireUser();

			if (user.email) {
				provider.setCustomParameters(
					provider.providerId === GoogleAuthProvider.PROVIDER_ID
						? { login_hint: user.email } // eslint-disable-line camelcase
						: { login: user.email },
				);
			}
			await reauthenticateWithPopup(user, provider);
			await deleteAccount(user);
		} catch (error) {
			setUserPassword('');
			logError({ error });
		} finally {
			setIsDeleting(false);
		}
	};

	const reauthenticateModal = () => {
		if (!signInProvider) {
			setShowDeleteModal(false);
			setStep('code');
			logError({
				error: new DisplayableError(
					'Ocorreu um erro ao obter o provedor de autenticação.',
				),
				text: 'Não foi possível obter sua plataforma de autenticação. Tente novamente.',
			});
			return;
		}

		switch (signInProvider) {
			case ProviderId.GOOGLE:
				return (
					<div>
						<div className="mb-4 flex flex-col gap-y-2">
							<h1 className="text-section-xl font-bold">
								Confirme sua identidade
							</h1>
							<p className="text-section-base">
								Para concluir a exclusão, entre novamente com sua conta Google.
							</p>
							<p className="text-section-base">
								Uma janela do Google irá abrir. Depois da confirmação, sua conta
								e seus dados serão apagados permanentemente.
							</p>
						</div>
						<div className="flex gap-x-3">
							<button
								className="form-btn flex items-center gap-x-2 text-sm font-bold"
								onClick={() => void reauthenticateWithProvider(googleProvider)}
							>
								<img
									src="/assets/images/icons/google.png"
									alt="Google"
									className="w-6"
								/>{' '}
								Confirmar com o Google
							</button>
							<button
								className="form-btn text-sm"
								onClick={() => setShowDeleteModal(false)}
							>
								Cancelar
							</button>
						</div>
					</div>
				);
			case ProviderId.GITHUB:
				return (
					<div>
						<div className="mb-4 flex flex-col gap-y-2">
							<h1 className="text-section-xl font-bold">
								Confirme sua identidade
							</h1>
							<p className="text-section-base">
								Para concluir a exclusão, entre novamente com sua conta GitHub.
							</p>
							<p className="text-section-base">
								Uma janela do GitHub irá abrir. Depois da confirmação, sua conta
								e seus dados serão apagados permanentemente.
							</p>
						</div>
						<div className="flex gap-x-3">
							<button
								className="form-btn flex items-center gap-x-2 text-sm font-bold"
								onClick={() => void reauthenticateWithProvider(githubProvider)}
							>
								<img
									src="/assets/images/icons/github.png"
									alt="GitHub"
									className="w-6"
								/>{' '}
								Confirmar com o GitHub
							</button>
							<button
								className="form-btn text-sm"
								onClick={() => setShowDeleteModal(false)}
							>
								Cancelar
							</button>
						</div>
					</div>
				);
		}
	};

	return (
		<div className="fixed inset-0 z-10 flex h-dvh items-center justify-center bg-black/40 backdrop-blur-lg">
			<div className="bg-dashboard-background relative mx-[10px] w-[min(600px,100%)] rounded-md border border-black p-7 shadow-[0_0_50px_#000000]/50 lg:w-[min(800px,100%)] lg:p-10">
				{isDeleting && (
					<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-xl">
						<SnakeLoader />
					</div>
				)}
				<div className="relative flex items-center">
					{step === 'reauthenticate' ? (
						reauthenticateModal()
					) : (
						<div>
							<h1 className="text-section-xl mb-2 font-bold">
								É uma pena ver você partir!
							</h1>
							<p className="text-section-base mb-6">
								Espero que tenha aprendido algo conosco.
							</p>
							<form onSubmit={(e) => void handleDeleteAccount(e)}>
								{step === 'password' ? (
									<div className="mb-3">
										<h2 className="text-title-lg mb-2 font-bold">
											Confirme sua senha
										</h2>
										<p className="text-section-base mb-3">
											Para concluir a exclusão de sua conta, informe sua senha
											abaixo:
										</p>
										<div className="relative flex w-full max-w-75 items-center">
											<input
												value={userPassword}
												placeholder="Sua senha"
												onChange={(e) => setUserPassword(e.target.value)}
												className="border-main-purple/60 focus:border-main-purple w-full max-w-75 rounded-md border-2 bg-white/5 py-2 pr-9 pl-3 text-sm transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff]/10"
												type={isVisible ? 'text' : 'password'}
											/>
											<img
												src={`/assets/images/icons/${isVisible ? 'hide' : 'show'}.png`}
												alt={isVisible ? 'Esconder senha' : 'Exibir senha'}
												tabIndex={0}
												role="button"
												className="absolute right-3 lg:cursor-pointer"
												onClick={() => setIsVisible((prev) => !prev)}
											/>
										</div>
									</div>
								) : (
									<div className="mb-3">
										<h2 className="text-title-lg mb-2 font-bold">
											Confirme o código de exclusão
										</h2>
										<p className="text-section-base mb-3">
											Para concluir a exclusão de sua conta, informe abaixo o
											código gerado a seguir:{' '}
											<span
												className="font-bold tracking-wide text-red-300 select-none"
												onCopy={(e) => e.preventDefault()}
											>
												{deleteCode}
											</span>
										</p>
										<input
											value={deleteCodeInputValue}
											placeholder="Código de exclusão"
											onChange={(e) =>
												setDeleteCodeInputValue(e.target.value.toUpperCase())
											}
											className="border-main-purple/70 focus:border-main-purple w-full max-w-75 rounded-md border-2 bg-white/5 px-3 py-2 text-sm transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff]/10"
											type="text"
										/>
									</div>
								)}
								<div className="flex gap-x-3">
									<button
										type="submit"
										className="form-btn text-sm font-bold"
										disabled={isDeleting}
									>
										Confirmar
									</button>
									<button
										type="button"
										className="form-btn text-sm"
										onClick={() => {
											setShowDeleteModal(false);
											setUserPassword('');
											setDeleteCodeInputValue('');
											setDeleteCode(idGenerator().generateId());
										}}
									>
										Voltar
									</button>
								</div>
							</form>
						</div>
					)}
					<img
						src="/assets/images/sad-snake.png"
						alt="Cobra triste"
						className="top-0 right-0 hidden w-60 drop-shadow-[0_0_50px_var(--color-main-green)]/40 lg:inline"
					/>
				</div>
			</div>
		</div>
	);
}
