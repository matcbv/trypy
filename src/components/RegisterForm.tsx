import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { useNavigate } from 'react-router-dom';
import { dateFormatter } from '../utils/dateFormatter';
import { PasswordInput } from './PasswordInput';
import { signUpWithCredentials } from '../database/auth/auth';
import { validationRegex } from '../constants/validationRegex';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError, logSuccess } from '../utils/logger';
import { signInWithGoogle } from '../database/auth/oAuth';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { useSafeContext } from '../hooks/useSafeContext';
import { idGenerator } from '../utils/idGenerator';
import { LoadingPage } from '../pages/LoadingPage';
import { signOut } from 'firebase/auth';
import { auth } from '../database/configs/firebase';
import { NavigationContext } from '../contexts/NavigationProvider/context';

const formMap = {
	email: 'E-mail',
	password: 'Senha',
	name: 'Nome',
	lastname: 'Sobrenome',
	birthDate: 'Data de nascimento',
};

export function RegisterForm() {
	const navigate = useNavigate();
	const { authDispatch } = useSafeContext(AuthContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
			if (!formattedData.match(validationRegex[key].regex)) {
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
				...formattedData,
				id: 'TPY-' + idGenerator().generateID(),
				picture: null,
				createdAt: new Date(),
				supporter: false,
				savedTips: [],
				resolutions: [],
			});

			const { uid, userData, progressData, navigationData } = res;

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { uid, data: userData },
			});
			setProgressState((prev) => ({ ...prev, ...progressData }));
			setNavigationState((prev) => ({ ...prev, ...navigationData }));

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
			const res = await signInWithGoogle();
			const { uid, providerData, progressData, navigationData } = res;

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { uid, data: providerData },
			});
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

	const inputType = (key: keyof typeof formMap) => {
		switch (key) {
			case 'password':
				return (
					<PasswordInput
						handleChange={handleChange}
						placeholder={placeholders.password}
						value={userData.password}
					/>
				);
			case 'birthDate':
				return (
					<input
						type="text"
						placeholder={placeholders.birthDate || 'dd/mm/aaaa'}
						id="birthDate"
						onChange={handleChange}
						value={userData.birthDate}
						className={`focus:border-main-green w-[300px] rounded-full border-2 border-white/30 bg-white/5 py-1 pr-9 pl-3 tracking-wider transition-colors duration-300 outline-none ${!placeholders.birthDate ? 'placeholder-gray-400' : 'placeholder-red-400'}`}
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
						className="focus:border-main-green w-[300px] rounded-full border-2 border-white/30 bg-white/5 py-1 pr-9 pl-3 placeholder-red-400 transition-colors duration-300 outline-none"
					/>
				);
		}
	};

	return isSubmitting ? (
		<LoadingPage />
	) : (
		<form
			className="flex h-full flex-col justify-center"
			onSubmit={(e) => void handleSubmit(e)}
		>
			<div className="flex justify-between">
				<div className="flex h-full flex-col justify-center">
					<div className="flex flex-col gap-y-3">
						{(
							Object.entries(formMap) as Array<[keyof typeof formMap, string]>
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
				<div className="flex h-full flex-col justify-center gap-y-6">
					<p className="font-space-grotesk w-[303px] text-center text-4xl leading-14 tracking-wide text-shadow-[5px_5px_10px_#000000]/80">
						O{' '}
						<span className="decoration-main-green underline decoration-2 underline-offset-10">
							primeiro passo
						</span>{' '}
						é sempre o mais{' '}
						<span className="text-main-purple text-5xl tracking-wider italic">
							importante
						</span>
					</p>
					<div className="flex flex-col items-center gap-y-4">
						<span
							className="register-form-btn border-main-purple flex items-center justify-center gap-x-2"
							onClick={() => void handleGoogle()}
						>
							<p className="text-lg">Google</p>
							<img
								className="h-8 w-8"
								src="/assets/images/icons/google.png"
								alt="Google"
							/>
						</span>
						<span className="register-form-btn border-main-purple flex items-center justify-center gap-x-2">
							<p className="text-lg">GitHub</p>
							<img
								className="h-8 w-8"
								src="/assets/images/icons/github.png"
								alt="GitHub"
							/>
						</span>
						<input
							type="submit"
							value="Continuar"
							className="register-form-btn border-main-green"
						/>
					</div>
				</div>
			</div>
		</form>
	);
}
