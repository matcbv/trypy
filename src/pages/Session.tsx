import { Link, useNavigate } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { logError, logSuccess, logWarning } from '../utils/logger';
import { signInWithProvider } from '../database/auth/oAuth';
import { validationRegex } from '../constants/validationRegex';
import { signInWithCredentials } from '../database/auth/auth';
import { LoadingPage } from './LoadingPage';
import { githubProvider, googleProvider } from '../database/configs/firebase';
import { type AuthProvider } from 'firebase/auth';

export function Session() {
	const navigate = useNavigate();
	const { setAuthState } = useSafeContext(AuthContext);
	const { modules } = useSafeContext(ContentfulContentContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const [isVisible, setIsVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userCredentials, setUserCredentials] = useState({
		email: '',
		password: '',
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setUserCredentials((prev) => ({
			...prev,
			[e.target.id]: e.target.value,
		}));
	};

	const checkData = () => {
		return (
			Object.keys(userCredentials) as Array<keyof typeof userCredentials>
		).every((key) => {
			const formattedData =
				key === 'password' ? userCredentials[key] : userCredentials[key].trim();

			return validationRegex[key].regex.test(formattedData);
		});
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isDataValid = checkData();

		if (!isDataValid) {
			logWarning('Credenciais inválidas!');
			return;
		}

		setIsSubmitting(true);

		try {
			const res = await signInWithCredentials(
				userCredentials.email.trim(),
				userCredentials.password,
			);

			const { userData, progressData, navigationData } = res;

			setAuthState((prev) => ({ ...prev, data: userData }));
			setProgressState((prev) => ({ ...prev, ...progressData }));
			setNavigationState(navigationData);

			void navigate('/dashboard', { replace: true });

			logSuccess('Login efetuado com sucesso!');
		} catch (error) {
			logError({ error });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleProvider = async (provider: AuthProvider) => {
		setIsSubmitting(true);

		try {
			const res = await signInWithProvider({
				modules,
				provider,
			});
			const { userData, progressData, navigationData } = res;

			setAuthState((prev) => ({
				...prev,
				data: prev.data && { ...prev.data, ...userData },
			}));
			setProgressState((prev) => ({ ...prev, ...progressData }));
			setNavigationState(navigationData);

			void navigate('/dashboard', { replace: true });
			logSuccess('Login efetuado com sucesso!');
		} catch (error) {
			logError({ error });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-125 w-full max-w-125 rounded-lg shadow-[0_0_20px_#ffffff]/10">
				{isSubmitting && <LoadingPage />}
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative flex w-full flex-col items-start justify-center p-10">
					<h1 className="text-title-3xl mb-10 font-bold tracking-wide">
						Iniciar sessão
					</h1>
					<form className="mb-5 w-full" onSubmit={(e) => void handleSubmit(e)}>
						<div className="mb-6 flex max-w-80 flex-col gap-y-6 text-sm">
							{Object.entries(userCredentials).map(([key, value]) => (
								<div
									className="border-b-main-green relative flex w-full items-end border-b-2"
									key={key}
								>
									<label
										className="font-jetbrains w-20 font-bold"
										htmlFor={key}
									>
										{key === 'email' ? 'E-mail' : 'Senha'}
									</label>
									<input
										className={`w-full focus:outline-none ${key === 'password' && 'pr-9'}`}
										type={
											key === 'email' ? 'text' : isVisible ? 'text' : 'password'
										}
										id={key}
										value={value}
										onChange={handleChange}
									/>
									{key === 'password' && (
										<img
											className="absolute right-1 lg:cursor-pointer"
											onClick={() => setIsVisible((prev) => !prev)}
											src={`/assets/images/icons/${isVisible ? 'hide' : 'show'}.png`}
											alt="Mostrar senha"
										/>
									)}
								</div>
							))}
						</div>
						<div>
							<div className="flex items-center gap-x-5">
								<input
									className="from-main-green/40 to-main-purple/40 border-main-green px-session-btn-x py-session-btn-y text-section-base rounded-md border bg-linear-to-br font-bold lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
									type="submit"
									value="Acessar conta"
								/>
								<img
									className="lg:cursor-pointer lg:transition-transform lg:duration-300 lg:hover:scale-110"
									src="/assets/images/icons/google.png"
									alt="Google"
									onClick={() => void handleProvider(googleProvider)}
									role="button"
									tabIndex={0}
								/>
								<img
									className="lg:cursor-pointer lg:transition-transform lg:duration-300 lg:hover:scale-110"
									src="/assets/images/icons/github.png"
									alt="GitHub"
									onClick={() => void handleProvider(githubProvider)}
									role="button"
									tabIndex={0}
								/>
							</div>
						</div>
					</form>
					<Link
						to={'/reset-password'}
						className="lg:hover:text-main-green mb-10 lg:transition-colors"
					>
						Redefinir senha
					</Link>
					<div className="flex flex-col items-start gap-y-[10px]">
						<h2 className="text-lg font-bold tracking-wider">
							Ainda não possui conta?
						</h2>
						<Link
							to={'/register'}
							className="from-main-green/40 to-main-purple/40 border-main-purple px-session-btn-x py-session-btn-y text-section-base rounded-md border bg-linear-to-br lg:cursor-pointer lg:transition-shadow lg:duration-300 lg:hover:shadow-[0_0_15px_#ffffff]/15"
						>
							Cadastre-se
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
