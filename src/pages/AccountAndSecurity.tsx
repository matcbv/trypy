import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	EmailAuthProvider,
	GithubAuthProvider,
	GoogleAuthProvider,
	linkWithCredential,
	linkWithPopup,
	ProviderId,
	unlink,
	type User,
} from 'firebase/auth';
import { logError, logInfo, logSuccess, logWarning } from '../utils/logger';
import { useRequireUser } from '../hooks/useRequireUser';
import { githubProvider, googleProvider } from '../database/configs/firebase';
import { validationRegex } from '../constants/validationRegex';
import { DeleteModal } from '../components/DeleteModal';
import { SnakeLoader } from '../components/SnakeLoader';

export type Providers =
	| typeof ProviderId.GOOGLE
	| typeof ProviderId.GITHUB
	| typeof ProviderId.PASSWORD;

const formMap = {
	email: 'E-mail',
	password: 'Senha',
	confirmPassword: 'Confirmar senha',
};

export function AccountAndSecurity() {
	const [linkedProviders, setLinkedProviders] = useState<Providers[]>([]);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isVisible, setIsVisible] = useState({
		password: false,
		confirmPassword: false,
	});
	const [showLinkEmailPasswordModal, setShowLinkEmailPasswordModal] =
		useState(false);
	const [providerActions, setProviderActions] = useState({
		'google.com': { linking: false, unlinking: false },
		'github.com': { linking: false, unlinking: false },
		password: { linking: false, unlinking: false },
	});
	const [credentials, setCredentials] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [placeholders, setPlaceholders] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const passwordProviderEmail = useRef<null | string>(null);
	const navigate = useNavigate();
	const requireUser = useRequireUser();

	const getProviders = (user: User): Providers[] => {
		return user.providerData
			.map((provider) => provider.providerId)
			.filter((provider): provider is Providers =>
				['google.com', 'github.com', 'password'].includes(provider),
			);
	};

	const checkData = () => {
		let isDataValid = true;

		(Object.keys(credentials) as Array<keyof typeof credentials>).forEach(
			(key) => {
				const formattedData =
					key === 'password' ? credentials[key] : credentials[key].trim();
				if (!formattedData.match(validationRegex[key].regex)) {
					setCredentials((prev) => ({ ...prev, [key]: '' }));
					setPlaceholders((prev) => ({
						...prev,
						[key]: validationRegex[key].text,
					}));
					isDataValid = false;
				}
			},
		);
		return isDataValid;
	};

	useEffect(() => {
		void (async () => {
			try {
				const user = await requireUser();

				const providers = getProviders(user);

				if (providers.includes('password')) {
					const passwordProvider = user.providerData.find(
						(provider) => provider.providerId === ProviderId.PASSWORD,
					);

					passwordProviderEmail.current = passwordProvider!.email;
				}

				setLinkedProviders(providers);
			} catch (error) {
				logError({ error });
			}
		})();
	}, [requireUser]);

	const handleLinkProvider = async (
		provider: GoogleAuthProvider | GithubAuthProvider,
	) => {
		if (
			providerActions['google.com'].linking ||
			providerActions['github.com'].linking
		) {
			return;
		}

		const providerId = provider.providerId as Providers;

		setProviderActions((prev) => ({
			...prev,
			[providerId]: {
				...prev[providerId],
				linking: true,
			},
		}));

		try {
			const user = await requireUser();

			const { user: updatedUser } = await linkWithPopup(user, provider);

			const providers = getProviders(updatedUser);

			setLinkedProviders(providers);
			logSuccess('Conta vinculada com sucesso!');
		} catch (error) {
			logError({ error });
		} finally {
			setProviderActions((prev) => ({
				...prev,
				[providerId]: {
					...prev[providerId],
					linking: false,
				},
			}));
		}
	};

	const handleUnlinkProvider = async (providerId: Providers) => {
		if (
			providerActions.password.unlinking ||
			providerActions['google.com'].unlinking ||
			providerActions['github.com'].unlinking
		) {
			return;
		}

		if (linkedProviders.length <= 1) {
			logWarning(
				'Não é possível desvincular o único método de autenticação da sua conta.',
			);
			return;
		}

		setProviderActions((prev) => ({
			...prev,
			[providerId]: {
				...prev[providerId],
				unlinking: true,
			},
		}));

		try {
			const user = await requireUser();

			const updatedUser = await unlink(user, providerId);

			const providers = getProviders(updatedUser);

			setLinkedProviders(providers);
			logSuccess('Conta desvinculada com sucesso!');
		} catch (error) {
			logError({ error });
		} finally {
			setProviderActions((prev) => ({
				...prev,
				[providerId]: {
					...prev[providerId],
					unlinking: false,
				},
			}));
		}
	};

	const handleLinkEmail = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (providerActions.password.linking) return;

		const isDataValid = checkData();
		if (!isDataValid) return;

		if (credentials.password !== credentials.confirmPassword) {
			setCredentials((prev) => ({
				...prev,
				confirmPassword: '',
			}));
			setPlaceholders((prev) => ({
				...prev,
				confirmPassword: 'As senhas não conferem',
			}));
			return;
		}

		setProviderActions((prev) => ({
			...prev,
			password: {
				...prev.password,
				linking: true,
			},
		}));

		try {
			const user = await requireUser();

			const credential = EmailAuthProvider.credential(
				credentials.email,
				credentials.password,
			);

			const { user: updatedUser } = await linkWithCredential(user, credential);

			const providers = getProviders(updatedUser);

			setLinkedProviders(providers);

			setShowLinkEmailPasswordModal(false);
			void navigate('/verify-email', {
				replace: true,
				state: { mode: 'link-email' },
			});
			logInfo('Verifique seu email para concluir o vinculo.');
		} catch (error) {
			logError({ error });
		} finally {
			setProviderActions((prev) => ({
				...prev,
				password: {
					...prev.password,
					linking: false,
				},
			}));
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
						Para vincular sua conta a outros provedores de autenticação, clique
						no botão correspondente abaixo.
					</p>
					<div className="flex flex-col items-start gap-y-5 rounded-md border border-black bg-black/40 p-5">
						<div>
							<div className="mb-3 flex items-center gap-x-2">
								<img
									src="/assets/images/icons/gmail.png"
									alt="Gmail"
									className="w-6"
								/>
								<h3 className="text-title-lg font-bold">E-mail e senha</h3>
							</div>
							{providerActions.password.linking ||
							providerActions.password.unlinking ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">
											{providerActions.password.linking
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
							) : linkedProviders.includes(ProviderId.PASSWORD) ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">
											{passwordProviderEmail.current || 'Vinculada'}
										</p>
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
							{linkedProviders.includes(ProviderId.PASSWORD) ? (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions['google.com'].unlinking}
									onClick={() => void handleUnlinkProvider(ProviderId.PASSWORD)}
								>
									Desvincular e-mail e senha
								</button>
							) : (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions['google.com'].linking}
									onClick={() => setShowLinkEmailPasswordModal(true)}
								>
									Vincular com e-mail e senha
								</button>
							)}
						</div>
						<span className="h-px w-full bg-gray-200"></span>
						<div>
							<div className="mb-3 flex items-center gap-x-2">
								<img
									src="/assets/images/icons/google.png"
									alt="Google"
									className="w-6"
								/>
								<h3 className="text-title-lg font-bold">Google</h3>
							</div>
							{providerActions['google.com'].linking ||
							providerActions['google.com'].unlinking ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">
											{providerActions['google.com'].linking
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
							) : linkedProviders.includes(ProviderId.GOOGLE) ? (
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
							{linkedProviders.includes(ProviderId.GOOGLE) ? (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions['google.com'].unlinking}
									onClick={() => void handleUnlinkProvider(ProviderId.GOOGLE)}
								>
									Desvincular Google
								</button>
							) : (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions['google.com'].linking}
									onClick={() => void handleLinkProvider(googleProvider)}
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
							{providerActions['github.com'].linking ||
							providerActions['github.com'].unlinking ? (
								<div className="flex items-center gap-x-2">
									<p>Status:</p>
									<div className="flex items-center gap-x-2">
										<p className="font-bold">
											{providerActions['github.com'].linking
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
							) : linkedProviders.includes(ProviderId.GITHUB) ? (
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
							{linkedProviders.includes(ProviderId.GITHUB) ? (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions['github.com'].unlinking}
									onClick={() => void handleUnlinkProvider(ProviderId.GITHUB)}
								>
									Desvincular GitHub
								</button>
							) : (
								<button
									className="form-btn mt-3 text-sm"
									disabled={providerActions['github.com'].linking}
									onClick={() => void handleLinkProvider(githubProvider)}
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
						onClick={() => setShowDeleteModal(true)}
					>
						Continuar
					</button>
				</div>
			</div>
			{showLinkEmailPasswordModal && (
				<div className="fixed inset-0 z-10 flex h-dvh items-center justify-center bg-black/40 backdrop-blur-lg">
					<div className="bg-dashboard-background relative mx-[10px] w-[min(600px,100%)] rounded-md border border-black p-7 shadow-[0_0_50px_#000000]/50 lg:p-10">
						{providerActions.password.linking && (
							<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/20 backdrop-blur-xl">
								<SnakeLoader />
							</div>
						)}
						<div className="relative flex items-center">
							<div className="flex flex-col gap-y-3">
								<h1 className="text-title-xl font-bold">
									Vincular e-mail e senha
								</h1>
								<p className="text-section-base">
									<span className="font-bold">Atenção:</span> a senha deve ter
									pelo menos 8 caracteres, incluindo uma letra maiúscula, uma
									minúscula e um número.
								</p>
								<div className="border-main-green bg-main-green/20 relative flex items-center gap-x-2 rounded-md border border-dashed p-3">
									<img
										src="/assets/images/icons/info-glassy.png"
										alt="Informação"
										className="w-6"
									/>
									<p className="text-section-sm">
										Após a confirmação, você será redirecionado para a página de
										verificação de e-mail.
									</p>
								</div>
								<form
									className="flex flex-col gap-y-3"
									onSubmit={(e) => void handleLinkEmail(e)}
								>
									<div className="flex flex-col gap-y-2">
										{(
											Object.keys(credentials) as Array<
												keyof typeof credentials
											>
										).map((key) => (
											<div key={key} className="flex flex-col">
												<label htmlFor={key} className="mb-px text-sm">
													{formMap[key]}
												</label>
												<div className="relative max-w-75">
													<input
														id={key}
														value={credentials[key]}
														placeholder={placeholders[key]}
														onChange={(e) =>
															setCredentials((prev) => ({
																...prev,
																[key]: e.target.value,
															}))
														}
														className="border-main-green/80 focus:border-main-green w-full rounded-md border-2 bg-white/5 py-2 pr-9 pl-3 text-sm placeholder-red-400 transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff]/10"
														type={
															key === 'email'
																? 'text'
																: isVisible[key]
																	? 'text'
																	: 'password'
														}
													/>
													{(key === 'password' ||
														key === 'confirmPassword') && (
														<img
															className="absolute top-1/2 -right-1 -translate-x-1/2 -translate-y-1/2 lg:cursor-pointer"
															onClick={() =>
																setIsVisible((prev) => ({
																	...prev,
																	[key]: !prev[key],
																}))
															}
															src={`/assets/images/icons/${isVisible[key] ? 'hide' : 'show'}.png`}
															alt={
																isVisible[key]
																	? 'Esconder senha'
																	: 'Exibir senha'
															}
															role="button"
															tabIndex={0}
														/>
													)}
												</div>
											</div>
										))}
									</div>
									<div className="flex gap-x-3">
										<button
											type="submit"
											className="form-btn text-sm font-bold"
											disabled={providerActions.password.linking}
										>
											Confirmar
										</button>
										<button
											type="button"
											className="form-btn text-sm"
											onClick={() => {
												setShowLinkEmailPasswordModal(false);
												setCredentials({
													email: '',
													password: '',
													confirmPassword: '',
												});
											}}
										>
											Voltar
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			)}
			{showDeleteModal && (
				<DeleteModal setShowDeleteModal={setShowDeleteModal} />
			)}
		</div>
	);
}
