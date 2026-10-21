import { useEffect, useState, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { useNavigate } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import {
	EmailAuthProvider,
	getIdToken,
	getIdTokenResult,
	GithubAuthProvider,
	GoogleAuthProvider,
	linkWithPopup,
	ProviderId,
	reauthenticateWithCredential,
	reauthenticateWithPopup,
	unlink,
	type User,
} from 'firebase/auth';
import { idGenerator } from '../utils/idGenerator';
import {
	defaultErrorMessage,
	logError,
	logSuccess,
	logWarning,
} from '../utils/logger';
import { signOutAndClear } from '../services/auth/signOutAndClear';
import { useRequireUser } from '../hooks/useRequireUser';
import axios from 'axios';
import { DisplayableError } from '../classes/DisplayableError';
import type { ApiError } from '../types/api';
import { SnakeLoader } from '../components/SnakeLoader';
import { githubProvider, googleProvider } from '../database/configs/firebase';

type Steps = null | 'password' | 'code' | 'reauthenticate';
type Providers = 'google.com' | 'github.com' | 'password';

export function AccountAndSecurity() {
	const { authState } = useSafeContext(AuthContext);
	const [userPassword, setUserPassword] = useState('');
	const [providerActions, setProviderActions] = useState({
		google: { linking: false, unlinking: false },
		github: { linking: false, unlinking: false },
	});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [step, setStep] = useState<Steps>(null);
	const [linkedProviders, setLinkedProviders] = useState<Providers[]>([]);
	const [signInProvider, setSignInProvider] = useState<null | Providers>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [deleteCodeInputValue, setDeleteCodeInputValue] = useState<string>('');
	const [deleteCode, setDeleteCode] = useState(() =>
		idGenerator().generateId(),
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();
	const requireUser = useRequireUser();

	useEffect(() => {
		void (async () => {
			try {
				const user = await requireUser();

				const providers = user.providerData
					.map((provider) => provider.providerId)
					.filter(
						(providerId): providerId is Providers =>
							providerId === ProviderId.GOOGLE ||
							providerId === ProviderId.GITHUB ||
							providerId === ProviderId.PASSWORD,
					);

				setLinkedProviders(providers);

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
	}, [requireUser]);

	const handleLink = async (
		provider: GoogleAuthProvider | GithubAuthProvider,
	) => {
		if (providerActions.google.linking || providerActions.github.linking) {
			return;
		}

		const toLinkProvider =
			provider.providerId === GoogleAuthProvider.PROVIDER_ID
				? 'google'
				: 'github';

		setProviderActions((prev) => ({
			...prev,
			[toLinkProvider]: {
				...prev[toLinkProvider],
				linking: true,
			},
		}));

		try {
			const user = await requireUser();

			await linkWithPopup(user, provider);

			const providerId = provider.providerId as Providers;

			setLinkedProviders((prev) =>
				prev.includes(providerId) ? prev : [...prev, providerId],
			);
			logSuccess('Contas vinculadas com sucesso!');
		} catch (error) {
			logError({ error });
		} finally {
			setProviderActions((prev) => ({
				...prev,
				[toLinkProvider]: {
					...prev[toLinkProvider],
					linking: false,
				},
			}));
		}
	};

	const handleUnlink = async (
		providerId: typeof ProviderId.GOOGLE | typeof ProviderId.GITHUB,
	) => {
		if (providerActions.google.unlinking || providerActions.github.unlinking) {
			return;
		}

		const hasPassword = linkedProviders.includes(ProviderId.PASSWORD);

		if (linkedProviders.length <= 1 && !hasPassword) {
			logWarning(
				'Não é possível desvincular o único método de autenticação da sua conta.',
			);
			return;
		}

		const actionKey = providerId === ProviderId.GOOGLE ? 'google' : 'github';
		setProviderActions((prev) => ({
			...prev,
			[actionKey]: {
				...prev[actionKey],
				unlinking: true,
			},
		}));

		try {
			const user = await requireUser();

			await unlink(user, providerId);

			setLinkedProviders((prev) =>
				prev.filter((provider) => provider !== providerId),
			);
			logSuccess('Conta desvinculada com sucesso!');
		} catch (error) {
			logError({ error });
		} finally {
			setProviderActions((prev) => ({
				...prev,
				[actionKey]: {
					...prev[actionKey],
					unlinking: false,
				},
			}));
		}
	};

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

			const email = authState.data?.email;

			if (!email) {
				throw new DisplayableError(
					'Não foi possível identificar o e-mail da sua conta. Tente entrar novamente.',
				);
			}

			const credential = EmailAuthProvider.credential(email, userPassword);

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

	const modalField =
		step === 'password' ? (
			<div className="mb-3">
				<h2 className="text-title-lg mb-2 font-bold">Confirme sua senha</h2>
				<p className="text-section-base mb-3">
					Para concluir a exclusão de sua conta, informe sua senha abaixo:
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
					Para concluir a exclusão de sua conta, informe abaixo o código gerado
					a seguir:{' '}
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
		);

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
		<div>
			<div>
				<h1 className="mb-10 text-2xl font-bold tracking-wide">
					Conta e segurança
				</h1>
				<div className="mb-10 flex flex-col gap-y-3">
					<h2 className="text-lg font-bold">Vincular contas</h2>
					<p className="text-section-base">
						Para vincular sua conta a outro provedor de autenticação, como
						Google ou GitHub, clique no botão correspondente abaixo.
					</p>
					<div className="flex flex-col items-start gap-y-5 rounded-md border border-black bg-black/40 p-5">
						<div>
							<div className="mb-3 flex items-center gap-x-2">
								<img
									src="/assets/images/icons/google.png"
									alt="Google"
									className="w-6"
								/>
								<h3 className="text-title-lg font-bold">Google</h3>
							</div>
							{providerActions.google.linking ||
							providerActions.google.unlinking ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">
											{providerActions.google.linking
												? 'Vinculando'
												: 'Desvinculando'}
										</p>
										<img
											src="/assets/images/loading.png"
											alt="Carregando"
											className="w-6"
										/>
									</div>
								</div>
							) : linkedProviders.includes('google.com') ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">Vinculada</p>
										<img
											src="/assets/images/icons/success.png"
											alt="Sucesso"
											className="w-6"
										/>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">Não vinculada</p>
										<img
											src="/assets/images/icons/error.png"
											alt="Erro"
											className="w-6"
										/>
									</div>
								</div>
							)}

							{linkedProviders.includes('google.com') ? (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions.google.unlinking}
									onClick={() => void handleUnlink(ProviderId.GOOGLE)}
								>
									Desvincular Google
								</button>
							) : (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions.google.linking}
									onClick={() => void handleLink(googleProvider)}
								>
									Vincular com Google
								</button>
							)}
						</div>
						<span className="h-px w-full bg-gray-200"></span>
						<div>
							<div className="mb-3 flex items-center gap-x-2">
								<img
									src="/assets/images/icons/github.png"
									alt="GitHub"
									className="w-6"
								/>
								<h3 className="text-title-lg font-bold">GitHub</h3>
							</div>
							{providerActions.github.linking ||
							providerActions.github.unlinking ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">
											{providerActions.github.linking
												? 'Vinculando'
												: 'Desvinculando'}
										</p>
										<img
											src="/assets/images/loading.png"
											alt="Carregando"
											className="w-6"
										/>
									</div>
								</div>
							) : linkedProviders.includes('github.com') ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">Vinculada</p>
										<img
											src="/assets/images/icons/success.png"
											alt="Sucesso"
											className="w-6"
										/>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">Não vinculada</p>
										<img
											src="/assets/images/icons/error.png"
											alt="Erro"
											className="w-6"
										/>
									</div>
								</div>
							)}
							{linkedProviders.includes('github.com') ? (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions.github.unlinking}
									onClick={() => void handleUnlink(ProviderId.GITHUB)}
								>
									Desvincular GitHub
								</button>
							) : (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions.github.linking}
									onClick={() => void handleLink(githubProvider)}
								>
									Vincular com GitHub
								</button>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-col items-start">
					<h2 className="mb-2 text-lg font-bold">Deletar conta</h2>
					<p className="mb-3 text-sm">
						Essa ação é{' '}
						<span className="font-bold text-red-300">irreversível</span>. Não é
						possível recuperar a conta após sua exclusão.
					</p>
					<button
						type="button"
						className="form-btn text-sm"
						onClick={() => {
							setShowDeleteModal(true);
							setDeleteCode(idGenerator().generateId());
						}}
					>
						Continuar
					</button>
				</div>
			</div>
			{showDeleteModal && (
				<div className="fixed inset-0 z-10 flex h-dvh items-center justify-center bg-black/40 backdrop-blur-lg">
					<div className="bg-dashboard-background relative mx-[10px] w-[min(600px,100%)] rounded-md border border-black p-7 shadow-[0_0_50px_#000000]/50 lg:w-[min(790px,100%)] lg:p-10">
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
										{modalField}
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
													setDeleteCodeInputValue('');
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
			)}
		</div>
	);
}
