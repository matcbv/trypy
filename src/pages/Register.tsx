import {
	useRef,
	useState,
	type ChangeEvent,
	type FocusEvent,
	type SubmitEvent,
} from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { useNavigate } from 'react-router-dom';
import { dateFormatter } from '../utils/formatter';
import { signUpWithCredentials } from '../database/auth/auth';
import { validationRegex } from '../constants/validationRegex';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError, logSuccess } from '../utils/logger';
import { signInWithProvider } from '../database/auth/oAuth';
import { useSafeContext } from '../hooks/useSafeContext';
import { idGenerator } from '../utils/idGenerator';
import { LoadingPage } from '../pages/LoadingPage';
import { type AuthProvider } from 'firebase/auth';
import { githubProvider } from '../database/configs/firebase';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { googleProvider } from '../database/configs/firebase';
import { isValidBirthDate } from '../utils/isValidBirthDate';

const formMap = {
	email: 'E-mail',
	password: 'Senha',
	name: 'Nome',
	lastname: 'Sobrenome',
	birthDate: 'Data de nascimento',
};

export function Register() {
	const navigate = useNavigate();
	const { setAuthState } = useSafeContext(AuthContext);
	const { modules } = useSafeContext(ContentfulContentContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [hideText, setHideText] = useState(true);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const [userData, setUserData] = useState({
		email: '',
		password: '',
		name: '',
		lastname: '',
		birthDate: '',
	});

	const [placeholders, setPlaceholders] = useState({
		email: '',
		password: '',
		name: '',
		lastname: '',
		birthDate: '',
	});

	const toggleText = (e: FocusEvent<HTMLInputElement | HTMLImageElement>) => {
		if (wrapperRef.current?.contains(e.relatedTarget)) {
			return;
		}
		setHideText(true);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setPlaceholders((prev) => ({ ...prev, [e.target.id]: '' }));
		const finalValue =
			e.target.id === 'birthDate'
				? dateFormatter(e.target.value)
				: e.target.value;
		setUserData((prev) => ({ ...prev, [e.target.id]: finalValue }));
	};

	const checkData = () => {
		let isDataValid = true;

		(Object.keys(userData) as Array<keyof typeof userData>).forEach((key) => {
			const formattedData =
				key === 'password' ? userData[key] : userData[key].trim();

			let isValid = validationRegex[key].regex.test(formattedData);

			if (key === 'birthDate' && isValid) {
				isValid = isValidBirthDate(formattedData);
			}

			if (!isValid) {
				setUserData((prev) => ({ ...prev, [key]: '' }));
				setPlaceholders((prev) => ({
					...prev,
					[key]: validationRegex[key].text,
				}));

				isDataValid = false;
			}
		});

		return isDataValid;
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isDataValid = checkData();
		if (!isDataValid) return;

		setIsSubmitting(true);

		const formattedData = Object.fromEntries(
			Object.entries(userData).map(([key, value]) => [
				key,
				key === 'password' ? value : value.trim(),
			]),
		) as typeof userData;

		try {
			const res = await signUpWithCredentials({
				userData: {
					...formattedData,
					id: 'TPY-' + idGenerator().generateId(),
					picture: null,
					createdAt: new Date(),
					supporter: false,
					resolutions: [],
				},
				modules,
			});

			const { userData, progressData, navigationData } = res;

			setAuthState((prev) => ({ ...prev, data: userData }));
			setProgressState((prev) => ({ ...prev, ...progressData }));
			setNavigationState((prev) => ({ ...prev, ...navigationData }));

			void navigate('/verify-email', { replace: true });
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

	const inputType = (key: keyof typeof formMap) => {
		switch (key) {
			case 'password':
				return (
					<div ref={wrapperRef}>
						<div className="relative flex items-center">
							<input
								type={isVisible ? 'text' : 'password'}
								id="password"
								onChange={handleChange}
								onFocus={() => setHideText(false)}
								onBlur={toggleText}
								value={userData.password}
								placeholder={placeholders.password}
								className="focus:border-main-green min-h-9 w-full rounded-full border-2 border-white/30 bg-white/5 py-1 pr-10 pl-3 text-base leading-6 placeholder-red-400 transition-colors duration-300 outline-none"
							/>
							<img
								className="absolute right-3 lg:cursor-pointer"
								onClick={() => setIsVisible((prev) => !prev)}
								onBlur={toggleText}
								onFocus={() => setHideText(false)}
								src={`/assets/images/icons/${isVisible ? 'hide' : 'show'}.png`}
								alt={isVisible ? 'Esconder senha' : 'Exibir senha'}
								role="button"
								tabIndex={0}
							/>
						</div>
						<div
							className={`grid overflow-hidden transition-all duration-300 ${
								hideText ? 'mt-0 grid-rows-[0fr]' : 'mt-2 grid-rows-[1fr]'
							}`}
						>
							<p className="w-full overflow-hidden pl-1 text-[0.7rem] leading-4">
								A senha deve ter pelo menos 8 caracteres, incluindo uma letra
								maiúscula, uma minúscula e um número.
							</p>
						</div>
					</div>
				);
			case 'birthDate':
				return (
					<input
						type="text"
						placeholder={placeholders.birthDate || 'dd/mm/aaaa'}
						id="birthDate"
						onChange={handleChange}
						value={userData.birthDate}
						className={`focus:border-main-green w-full rounded-full border-2 border-white/30 bg-white/5 px-3 py-1 tracking-wide transition-colors duration-300 outline-none ${!placeholders.birthDate ? 'placeholder-gray-400' : 'placeholder-red-400'}`}
					/>
				);
			default:
				return (
					<input
						type="text"
						id={key}
						onChange={handleChange}
						value={userData[key]}
						placeholder={placeholders[key]}
						className="focus:border-main-green w-full rounded-full border-2 border-white/30 bg-white/5 px-3 py-1 placeholder-red-400 transition-colors duration-300 outline-none"
					/>
				);
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-115 w-full max-w-100 rounded-lg shadow-[0_0_20px_#ffffff]/10 lg:max-w-180">
				{isSubmitting && <LoadingPage />}
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative w-full rounded-lg p-10">
					<form
						className="flex flex-col items-center gap-x-10 lg:flex-row"
						onSubmit={(e) => void handleSubmit(e)}
					>
						<div className="mb-4 lg:mb-0">
							<h1 className="text-title-3xl mb-5 font-bold tracking-wide">
								Criar conta
							</h1>
							<div className="flex flex-col gap-y-3">
								{(
									Object.entries(formMap) as Array<
										[keyof typeof formMap, string]
									>
								).map(([key, value]) => (
									<div className="flex flex-col" key={key}>
										<label
											htmlFor={key}
											className="font-jetbrains ml-3 text-sm font-bold"
										>
											{value}
										</label>
										{inputType(key)}
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-col gap-y-5">
							<p className="font-space-grotesk hidden w-[303px] text-center text-4xl leading-12 tracking-wide text-shadow-[5px_5px_10px_#000000]/80 lg:block">
								O{' '}
								<span className="decoration-main-green underline decoration-2 underline-offset-10">
									primeiro passo
								</span>{' '}
								é sempre o mais{' '}
								<span className="text-main-purple text-5xl tracking-wider">
									importante!
								</span>
							</p>
							<div className="flex flex-row-reverse items-center justify-end gap-5 lg:flex-col lg:justify-center">
								<button
									type="button"
									className="register-form-btn border-main-purple hidden items-center justify-center gap-x-2 lg:flex"
									onClick={() => void handleProvider(googleProvider)}
								>
									<p className="text-lg">Google</p>
									<img src="/assets/images/icons/google.png" alt="Google" />
								</button>
								<img
									className="lg:hidden"
									src="/assets/images/icons/google.png"
									alt="Google"
									role="button"
									tabIndex={0}
									onClick={() => void handleProvider(googleProvider)}
								/>
								<button
									type="button"
									className="register-form-btn border-main-purple hidden items-center justify-center gap-x-2 lg:flex"
									onClick={() => void handleProvider(githubProvider)}
								>
									<p className="block text-lg">GitHub</p>
									<img src="/assets/images/icons/github.png" alt="GitHub" />
								</button>
								<img
									className="lg:hidden"
									src="/assets/images/icons/github.png"
									alt="GitHub"
									role="button"
									tabIndex={0}
									onClick={() => void handleProvider(githubProvider)}
								/>
								<button
									type="submit"
									className="register-form-btn text-section-btn border-main-green font-bold"
								>
									Continuar
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
