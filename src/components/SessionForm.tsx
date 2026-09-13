import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { signInWithGoogle } from '../database/auth/oAuth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider/context';
import { validationRegex } from '../constants/validationRegex';
import { signInWithCredentials } from '../database/auth/auth';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError, logSuccess, logWarning } from '../utils/logger';
import { useSafeContext } from '../hooks/useSafeContext';
import { LoadingPage } from '../pages/LoadingPage';
import { signOut } from 'firebase/auth';
import { auth } from '../database/configs/firebase';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';

export function SessionForm() {
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

			return formattedData.match(validationRegex[key].regex);
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

			const { uid, userData, progressData, navigationData } = res;

			setAuthState((prev) => ({ ...prev, uid: uid, data: userData }));
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

	const handleGoogle = async () => {
		setIsSubmitting(true);

		try {
			const res = await signInWithGoogle({ modules });
			const { uid, userData, progressData, navigationData } = res;

			setAuthState((prev) => ({
				...prev,
				uid: uid,
				data: prev.data && { ...prev.data, ...userData },
			}));
			setProgressState((prev) => ({ ...prev, ...progressData }));
			setNavigationState(navigationData);

			void navigate('/dashboard', { replace: true });
			logSuccess('Login efetuado com sucesso!');
		} catch (error) {
			await signOut(auth);
			logError({ error });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGitHub = async () => {};

	return isSubmitting ? (
		<LoadingPage />
	) : (
		<form className="mb-6 w-full" onSubmit={(e) => void handleSubmit(e)}>
			<div className="mb-6 flex max-w-[350px] flex-col gap-y-6 text-sm">
				{Object.entries(userCredentials).map(([key, value]) => (
					<div
						className="border-b-main-green relative flex w-full items-end border-b-2"
						key={key}
					>
						<label className="font-jetbrains w-20 font-bold" htmlFor={key}>
							{key === 'email' ? 'E-mail' : 'Senha'}
						</label>
						<input
							className={`w-full focus:outline-none ${key === 'password' && 'pr-9'}`}
							type={key === 'email' ? 'text' : isVisible ? 'text' : 'password'}
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
					<input className="form-btn" type="submit" value="Acessar conta" />
					<img
						className="lg:cursor-pointer lg:transition-transform lg:duration-300 lg:hover:scale-110"
						src="/assets/images/icons/google.png"
						alt="Google"
						onClick={() => void handleGoogle()}
						role="button"
						tabIndex={0}
					/>
					<img
						className="lg:cursor-pointer lg:transition-transform lg:duration-300 lg:hover:scale-110"
						src="/assets/images/icons/github.png"
						alt="GitHub"
						onClick={() => void handleGitHub()}
						role="button"
						tabIndex={0}
					/>
				</div>
			</div>
		</form>
	);
}
