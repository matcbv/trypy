import { useContext, useState } from 'react';
import AuthContext from '../contexts/AuthProvider/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastNotification } from './Notifications';
import { dateFormatter } from '../utils/dataFormatter';
import { PasswordInput } from './PasswordInput';
import { signUpWithCredentials } from '../database/auth';
import { validationRegex } from '../utils/validationRegex';
import ProgressContext from '../contexts/ProgressProvider/context';
import { logError } from '../utils/logger';
import { signInWithGoogle } from '../database/oAuth';
import { labelMap } from '../constants/labelMap';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import progressActionTypes from '../contexts/ProgressProvider/actionTypes';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../database/firebase';

export function RegisterForm() {
	const navigate = useNavigate();
	const [, authDispatch] = useContext(AuthContext);
	const [, progressDispatch] = useContext(ProgressContext);

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

	const handleChange = (e) => {
		setPlaceholders((prev) => ({ ...prev, [e.target.id]: '' }));
		const finalValue =
			e.target.id === 'birthDate'
				? dateFormatter(e.target.value)
				: e.target.value;
		setUserData((prev) => ({ ...prev, [e.target.id]: finalValue }));
	};

	const checkData = () => {
		let isDataValid = true;

		Object.keys(userData).forEach((key) => {
			if (!userData[key].match(validationRegex[key].regex)) {
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		const isDataValid = checkData();
		if (!isDataValid) return;

		const res = await signUpWithCredentials(userData);
		if (!res.success) {
			logError(res.error);
			return;
		}

		try {
			const { uid, initialProgress } = res;

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { uid, data: userData },
			});
			await setDoc(doc(db, 'users', uid), userData);

			progressDispatch({
				type: progressActionTypes.SET_PROGRESS,
				payload: { data: initialProgress },
			});
			await setDoc(doc(db, 'userProgress', uid), initialProgress);

			navigate('/dashboard/overview');
			toast(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Login efetuado com sucesso!',
				},
			});
		} catch (error) {
			logError(error);
		}
	};

	const handleGoogle = async () => {
		const res = await signInWithGoogle();
		if (res.success) {
			try {
				const { uid, providerData, progressData } = res.data;

				authDispatch({
					type: authActionTypes.SET_DATA,
					payload: { uid, data: providerData },
				});
				await setDoc(doc(db, 'users', uid), providerData);

				progressDispatch({
					type: progressActionTypes.SET_PROGRESS,
					payload: { data: progressData },
				});
				await setDoc(doc(db, 'userProgress', uid), progressData);

				navigate('/dashboard/overview');
				toast(ToastNotification, {
					type: 'success',
					data: {
						type: 'success',
						text: 'Login efetuado com sucesso!',
					},
				});
			} catch (error) {
				logError(error);
			}
		} else {
			logError(res.error);
		}
	};

	const inputType = (key) => {
		switch (key) {
			case 'password':
				return (
					<PasswordInput
						handleChange={handleChange}
						placeholders={placeholders}
						userData={userData}
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
						className={`w-[300px] rounded-full border-2 border-white/30 bg-white/5 py-1 pr-9 pl-3 tracking-wider outline-none focus:border-[var(--main-green)] ${!placeholders.birthDate ? 'placeholder-gray-400' : 'placeholder-red-400'}`}
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
						className="w-[300px] rounded-full border-2 border-white/30 bg-white/5 py-1 pr-9 pl-3 placeholder-red-400 outline-none focus:border-[var(--main-green)]"
					/>
				);
		}
	};

	return (
		<form
			className="flex h-full flex-col justify-between"
			onSubmit={handleSubmit}
		>
			<h1 className="text-3xl font-bold tracking-wider">Criar conta</h1>
			<div className="flex justify-between">
				<div className="flex h-full flex-col justify-center">
					<div className="flex flex-col gap-y-3">
						{Object.entries(labelMap).map(([key, value]) => (
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
				<div className="flex h-full flex-col justify-center gap-y-10">
					<p className="font-gray-200 font-space-grotesk w-[304px] text-4xl leading-normal tracking-wide text-shadow-[5px_5px_10px_rgba(0,_0,_0,_0.5)]">
						O{' '}
						<span className="underline decoration-[var(--main-green)] decoration-2 underline-offset-[10px]">
							primeiro passo
						</span>{' '}
						é sempre o mais{' '}
						<span className="text-5xl tracking-wider text-[var(--main-purple)] italic">
							importante
						</span>
					</p>
					<div className="flex flex-col gap-y-4">
						<span
							className="register-form-btn flex items-center justify-center gap-x-2 border-[var(--main-purple)]"
							onClick={() => handleGoogle()}
						>
							<p className="text-lg">Google</p>
							<img
								className="h-8 w-8"
								src="/assets/images/icons/google.png"
								alt="Conta Google"
							/>
						</span>
						<span className="register-form-btn flex items-center justify-center gap-x-2 border-[var(--main-purple)]">
							<p className="text-lg">GitHub</p>
							<img
								className="h-8 w-8"
								src="/assets/images/icons/github.png"
								alt="Conta GitHub"
							/>
						</span>
						<input
							type="submit"
							value="Continuar"
							className="register-form-btn border-[var(--main-green)]"
						/>
					</div>
				</div>
			</div>
		</form>
	);
}
