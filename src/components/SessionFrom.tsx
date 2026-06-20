import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { toast } from 'react-toastify';
import { signInWithGoogle } from '../database/auth/oAuth';
import { ToastNotification } from './Notifications';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider/context';
import { validationRegex } from '../constants/validationRegex';
import { signInWithCredentials } from '../database/auth/auth';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError } from '../utils/logger';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ToastData } from '../types/toast';
import { LoadingPage } from '../pages/LoadingPage';
import { signOut } from 'firebase/auth';
import { auth } from '../database/configs/firebase';

export function SessionForm() {
	const navigate = useNavigate();
	const { authDispatch } = useSafeContext(AuthContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const [userCredentials, setUserCredentials] = useState({
		email: '',
		password: '',
	});
	const [isVisible, setIsVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			toast<ToastData>(ToastNotification, {
				type: 'error',
				data: {
					type: 'error',
					text: 'Credenciais inválidas!',
				},
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const res = await signInWithCredentials(
				userCredentials.email.trim(),
				userCredentials.password,
			);

			const { uid, userData, progressData } = res;

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { uid, data: userData },
			});

			setProgressState((prev) => ({ ...prev, ...progressData }));

			void navigate('/dashboard', { replace: true });

			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Login efetuado com sucesso!',
				},
			});
		} catch (error) {
			logError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogle = async () => {
		setIsSubmitting(true);

		try {
			const res = await signInWithGoogle();
			const { uid, providerData, progressData } = res;

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { uid, data: providerData },
			});

			setProgressState((prev) => ({ ...prev, ...progressData }));

			void navigate('/dashboard', { replace: true });
			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Login efetuado com sucesso!',
				},
			});
		} catch (error) {
			await signOut(auth);
			logError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGitHub = async () => {};

	return isSubmitting ? (
		<LoadingPage />
	) : (
		<form
			className="mb-5 flex flex-col gap-y-10"
			onSubmit={(e) => void handleSubmit(e)}
		>
			<div className="flex w-[350px] flex-col gap-y-6 text-sm">
				{Object.entries(userCredentials).map(([key, value]) => (
					<div
						className="border-b-main-green relative flex w-full items-end border-b-2"
						key={key}
					>
						<label className="font-jetbrains w-20 font-bold" htmlFor={key}>
							{key === 'email' ? 'E-mail' : 'Senha'}
						</label>
						<input
							className="w-full focus:outline-none"
							type={key === 'email' ? 'text' : isVisible ? 'text' : 'password'}
							id={key}
							value={value}
							onChange={handleChange}
						/>
						{key === 'password' && (
							<img
								className="absolute right-1 cursor-pointer"
								onClick={() => setIsVisible((prev) => !prev)}
								src={`/assets/images/icons/${isVisible ? 'hide' : 'visible'}.png`}
								alt="Mostrar senha"
							/>
						)}
					</div>
				))}
			</div>
			<div>
				<div className="flex items-center gap-x-5">
					<input
						className="form-btn w-[180px]"
						type="submit"
						value="Acessar conta"
					/>
					<img
						className="cursor-pointer transition-transform hover:scale-105"
						src="/assets/images/icons/google.png"
						alt="Conta Google"
						onClick={() => void handleGoogle()}
					/>
					<img
						className="cursor-pointer transition-transform hover:scale-105"
						src="/assets/images/icons/github.png"
						alt="Conta GitHub"
						onClick={() => void handleGitHub()}
					/>
				</div>
			</div>
		</form>
	);
}
