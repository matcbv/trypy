import { useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProfileForm } from '../components/ProfileForm';
import { deleteAccount } from '../database/auth/auth';
import { toast } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { Link, useNavigate } from 'react-router-dom';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { storageKeys } from '../constants/storageKeys';
import { useSafeContext } from '../hooks/useSafeContext';
import type { ToastData } from '../types/toast';
import { FirebaseError } from 'firebase/app';
import { auth } from '../database/configs/firebase';
import { getIdTokenResult, ProviderId } from 'firebase/auth';
import { idGenerator } from '../utils/idGenerator';
import progressInitialState from '../contexts/ProgressProvider/initialState';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import navigationInitialState from '../contexts/NavigationProvider/initialState';

type Providers = (typeof ProviderId)[keyof typeof ProviderId];

export function EditProfile() {
	const { authState, authDispatch } = useSafeContext(AuthContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const [userPassword, setUserPassword] = useState('');
	const [isVisible, setIsVisible] = useState(false);
	const [provider, setProvider] = useState<Providers | null>(null);
	const [deleteInputValue, setDeleteInputValue] = useState<string>('');
	const [deleteCode] = useState(() => idGenerator().generateID());
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		void (async () => {
			const { signInProvider } = await getIdTokenResult(auth.currentUser!);
			setProvider(signInProvider as Providers);
		})();
	}, []);

	const deleteAccountWrapper = async () => {
		if (isDeleting) return;

		try {
			if (provider === ProviderId.PASSWORD) {
				if (userPassword.length <= 0) return;

				setIsDeleting(true);

				await deleteAccount({ uid: authState.uid!, password: userPassword });
			} else {
				if (!provider) return;
				if (deleteCode !== deleteInputValue) {
					toast<ToastData>(ToastNotification, {
						type: 'warning',
						data: {
							type: 'warning',
							text: 'Código de exclusão inválido. Tente novamente.',
						},
					});
					return;
				}

				setIsDeleting(true);

				await deleteAccount({ uid: authState.uid!, provider: provider });
			}

			authDispatch({ type: authActionTypes.LOGOUT });
			setProgressState(progressInitialState);
			setNavigationState(navigationInitialState);
			localStorage.removeItem(storageKeys.NAVIGATION_STATE);

			void navigate('/', { replace: true });
			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Conta deletada com sucesso!',
				},
			});
		} catch (error) {
			setUserPassword('');

			const errorMessage =
				error instanceof FirebaseError &&
				error.code === 'auth/invalid-credential'
					? 'Senha incorreta. Tente novamente.'
					: 'Algo deu errado. Tente novamente.';

			toast<ToastData>(ToastNotification, {
				type: 'error',
				data: {
					type: 'error',
					text: errorMessage,
				},
			});
		}
	};

	const deleteField =
		provider === ProviderId.PASSWORD ? (
			<div className="relative flex w-[300px] items-center">
				<input
					value={userPassword}
					placeholder="Sua senha"
					onChange={(e) => setUserPassword(e.target.value)}
					className="border-main-purple/60 focus:border-main-purple w-[300px] rounded-md border-2 bg-white/5 py-2 pr-9 pl-3 text-sm transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff]/10"
					type={isVisible ? 'text' : 'password'}
				/>
				<img
					src={`/assets/images/icons/${isVisible ? 'hide' : 'visible'}.png`}
					alt={isVisible ? 'Esconder senha' : 'Exibir senha'}
					className="absolute right-3 cursor-pointer"
					onClick={() => setIsVisible((prev) => !prev)}
				/>
			</div>
		) : (
			<>
				<p className="text-sm">
					Digite o código gerado para concluir a exclusão da conta:{' '}
					<span
						className="font-bold text-red-300 select-none"
						onCopy={(e) => e.preventDefault()}
					>
						{deleteCode}
					</span>
				</p>
				<input
					value={deleteInputValue}
					placeholder="Código de exclusão"
					onChange={(e) => setDeleteInputValue(e.target.value.toUpperCase())}
					className="border-main-purple/70 focus:border-main-purple w-[300px] rounded-md border-2 bg-white/5 py-2 pr-9 pl-3 text-sm transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff]/10"
					type="text"
				/>
			</>
		);

	return (
		<div>
			<h1 className="mb-10 text-3xl font-bold tracking-wide">Meus dados</h1>
			<div className="flex flex-col gap-y-10">
				<ProfileForm />
				<div>
					<h3 className="mb-4">Esqueceu sua senha?</h3>
					<Link to="/reset-password" className="form-btn w-[120px] text-sm">
						Alterar senha
					</Link>
				</div>
				<div className="flex flex-col gap-y-3">
					<h3>Deletar conta</h3>
					<p className="text-sm">
						Essa ação é{' '}
						<span className="font-bold text-red-300">irreversível</span>. Não é
						possível recuperar a conta após sua exclusão.
					</p>
					<div className="flex flex-col gap-y-3">
						{deleteField}
						<button
							type="button"
							className="form-btn w-[120px] cursor-pointer text-sm"
							onClick={() => void deleteAccountWrapper()}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<img
									src="/assets/images/loading.png"
									alt="Carregando"
									className="w-[25px]"
								/>
							) : (
								'Continuar'
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
