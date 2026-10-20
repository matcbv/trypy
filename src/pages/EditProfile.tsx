import { useState, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProfileForm } from '../components/ProfileForm';
import { Link, useNavigate } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import { FirebaseError } from 'firebase/app';
import {
	EmailAuthProvider,
	getIdToken,
	getIdTokenResult,
	ProviderId,
	reauthenticateWithCredential,
	reauthenticateWithPopup,
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

export function EditProfile() {
	const { authState } = useSafeContext(AuthContext);
	const [userPassword, setUserPassword] = useState('');
	const [isVisible, setIsVisible] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [step, setStep] = useState<Steps>(null);
	const [signInProvider, setSignInProvider] = useState<
		null | 'google' | 'github'
	>(null);
	const [deleteCodeInputValue, setDeleteCodeInputValue] = useState<string>('');
	const [deleteCode] = useState(() => idGenerator().generateID());
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();
	const requireUser = useRequireUser();

	const handleStep = async () => {
		const user = await requireUser();
		const { signInProvider } = await getIdTokenResult(user);
		if (signInProvider === ProviderId.PASSWORD) {
			setStep('password');
		} else {
			setStep('code');
			setSignInProvider(
				signInProvider === ProviderId.GOOGLE ? 'google' : 'github',
			);
		}
		setShowDeleteModal(true);
	};

	const handleError = (error: unknown) => {
		setUserPassword('');
		if (error instanceof FirebaseError) {
			switch (error.code) {
				case 'auth/invalid-credential': {
					logWarning('Senha incorreta. Tente novamente.');
					break;
				}
				case 'auth/popup-closed-by-user':
				case 'auth/cancelled-popup-request': {
					break;
				}
				case 'auth/popup-blocked': {
					logWarning('Permita pop-ups no site para confirmar com o Google.');
					break;
				}
				case 'auth/user-mismatch': {
					logWarning('Use a mesma conta Google com a qual você entrou.');
					break;
				}
				default: {
					logError({ error });
				}
			}
		} else {
			logError({ error });
		}
	};

	const deleteAccount = async (user: User) => {
		setIsDeleting(true);
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
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDeleteAccount = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isDeleting) return;

		try {
			if (step === 'password') {
				if (userPassword.length <= 0) return;

				const user = await requireUser();
				const credential = EmailAuthProvider.credential(
					authState.data!.email,
					userPassword,
				);

				await reauthenticateWithCredential(user, credential);
				await deleteAccount(user);
				return;
			}

			if (deleteCode !== deleteCodeInputValue) {
				setDeleteCodeInputValue('');
				logWarning('Código de exclusão inválido. Tente novamente.');
				return;
			}

			setStep('reauthenticate');
		} catch (error) {
			handleError(error);
		}
	};

	const reauthenticateWithGoogle = async () => {
		try {
			const user = await requireUser();

			if (user.email) {
				googleProvider.setCustomParameters({ login_hint: user.email }); // eslint-disable-line camelcase
			}
			await reauthenticateWithPopup(user, googleProvider);
			await deleteAccount(user);
		} catch (error) {
			handleError(error);
		}
	};

	const reauthenticateWithGithub = async () => {
		try {
			const user = await requireUser();
			await reauthenticateWithPopup(user, githubProvider);
			await deleteAccount(user);
		} catch (error) {
			handleError(error);
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
			case 'google':
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
								onClick={() => void reauthenticateWithGoogle()}
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
			case 'github':
				return (
					<div>
						<div className="mb-4 flex flex-col gap-y-2">
							<h1 className="text-section-xl font-bold">
								Confirme sua identidade
							</h1>
							<p className="text-section-base">
								Para concluir a exclusão, entre novamente com sua conta Github.
							</p>
							<p className="text-section-base">
								Uma janela do Github irá abrir. Depois da confirmação, sua conta
								e seus dados serão apagados permanentemente.
							</p>
						</div>
						<div className="flex gap-x-3">
							<button
								className="form-btn flex items-center gap-x-2 text-sm font-bold"
								onClick={() => void reauthenticateWithGithub()}
							>
								<img
									src="/assets/images/icons/github.png"
									alt="Github"
									className="w-6"
								/>{' '}
								Confirmar com o Github
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
				<h1 className="mb-10 text-2xl font-bold tracking-wide">Meus dados</h1>
				<div className="flex flex-col gap-y-10">
					<ProfileForm />
					<div>
						<h3 className="mb-3 text-lg font-bold">Esqueceu sua senha?</h3>
						<Link to="/reset-password" className="form-btn text-sm">
							Alterar senha
						</Link>
					</div>
					<div className="flex flex-col items-start">
						<h3 className="mb-2 text-lg font-bold">Deletar conta</h3>
						<p className="mb-3 text-sm">
							Essa ação é{' '}
							<span className="font-bold text-red-300">irreversível</span>. Não
							é possível recuperar a conta após sua exclusão.
						</p>
						<button
							type="button"
							className="form-btn text-sm"
							onClick={() => void handleStep()}
						>
							Continuar
						</button>
					</div>
				</div>
			</div>
			{showDeleteModal && (
				<div className="fixed inset-0 z-10 flex h-dvh items-center justify-center bg-black/20 backdrop-blur-lg">
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
												className="form-btn text-sm"
												onClick={() => setShowDeleteModal(false)}
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
