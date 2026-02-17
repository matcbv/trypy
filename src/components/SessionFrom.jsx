import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { signInWithGoogle } from '../database/oAuth';
import { ToastNotification } from './Notifications';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider/context';
import { validationRegex } from '../utils/validationRegex';
import { signInWithCredentials } from '../database/auth';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { logError } from '../utils/logger';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import progressActionTypes from '../contexts/ProgressProvider/actionTypes';

export function SessionForm() {
	const navigate = useNavigate();
	const { authDispatch } = useContext(AuthContext);
	const { progressDispatch } = useContext(ProgressContext);
	const [userCredentials, setUserCredentials] = useState({
		email: '',
		password: '',
	});
	const [isVisible, setIsVisible] = useState(false);

	const handleChange = (e) => {
		setUserCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
	};

	const checkData = () => {
		let isDataValid = true;

		Object.keys(userCredentials).forEach((key) => {
			if (!userCredentials[key].match(validationRegex[key].regex)) {
				isDataValid = false;
			}
		});
		return isDataValid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const isDataValid = checkData();
		if (isDataValid) {
			try {
				const res = await signInWithCredentials(
					userCredentials.email,
					userCredentials.password,
				);

				const { uid, userData, progressData } = res;

				authDispatch({
					type: authActionTypes.SET_DATA,
					payload: { uid, data: userData },
				});
				progressDispatch({
					type: progressActionTypes.SET_PROGRESS,
					payload: { data: progressData },
				});

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
			toast(ToastNotification, {
				type: 'error',
				data: {
					type: 'error',
					text: 'Credenciais inválidas!',
				},
			});
		}
	};

	const handleGoogle = async () => {
		try {
			const res = await signInWithGoogle();
			const { uid, providerData, progressData } = res;

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { uid, data: providerData },
			});
			progressDispatch({
				type: progressActionTypes.SET_PROGRESS,
				payload: { data: progressData },
			});

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

	const handleGitHub = async () => {};

	return (
		<form className="mb-5 flex flex-col gap-y-10" onSubmit={handleSubmit}>
			<div className="flex w-[350px] flex-col gap-y-6 text-sm">
				{Object.entries(userCredentials).map(([key, value]) => (
					<div
						className="relative flex w-full items-end border-b-2 border-b-[var(--main-green)]"
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
						onClick={handleGoogle}
					/>
					<img
						className="cursor-pointer transition-transform hover:scale-105"
						src="/assets/images/icons/github.png"
						alt="Conta GitHub"
						onClick={handleGitHub}
					/>
				</div>
			</div>
		</form>
	);
}
