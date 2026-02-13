import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProfileForm } from '../components/ProfileForm';
import { deleteAccount } from '../database/auth';
import { toast } from 'react-toastify';
import { ToastNotification } from '../components/Notifications';
import { Link, useNavigate } from 'react-router-dom';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import progressActionTypes from '../contexts/ProgressProvider/actionTypes';
import { storageKeys } from '../constants/storageKeys';

export function EditProfile() {
	const navigate = useNavigate();
	const { authState, authDispatch } = useContext(AuthContext);
	const { progressDispatch } = useContext(ProgressContext);
	const [userPassword, setUserPassword] = useState('');
	const [isVisible, setIsVisible] = useState(false);

	const deleteAccountWrapper = async () => {
		if (userPassword.length <= 0) return;

		const res = await deleteAccount(userPassword, authState.uid);
		if (res.success) {
			authDispatch({ type: authActionTypes.LOGOUT });
			progressDispatch({ type: progressActionTypes.RESET_PROGRESS });
			localStorage.removeItem(storageKeys.NAVIGATION_STATE);
			navigate('/');
			toast(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Conta deletada com sucesso!',
				},
			});
		} else {
			setUserPassword('');
			toast(ToastNotification, {
				type: 'error',
				data: {
					type: 'error',
					text:
						res.error.code === 'auth/invalid-credential'
							? 'Senha incorreta!'
							: 'Algo deu errado. Tente novamente.',
				},
			});
		}
	};

	return (
		<div>
			<h1 className="mb-10 text-3xl font-bold tracking-wide">Meus dados</h1>
			<div className="flex flex-col gap-y-10">
				<ProfileForm />
				<div>
					<h3 className="mb-4">Esqueceu sua senha?</h3>
					<Link
						to="/reset-password"
						className="form-btn block w-[120px] text-sm"
					>
						Alterar senha
					</Link>
				</div>
				<div>
					<h3 className="mb-3">Deletar conta</h3>
					<p className="mb-4 text-sm">
						Essa ação é <span className="font-bold">irreversível</span>. Não é
						possível recuperar a conta após sua exclusão.
					</p>
					<div className="flex flex-col items-start gap-y-3">
						<div className="relative flex items-center">
							<input
								value={userPassword}
								placeholder="Senha atual"
								onChange={(e) => setUserPassword(e.currentTarget.value)}
								className="w-[300px] rounded-md border-2 border-[var(--main-purple)]/60 bg-white/5 py-2 pr-9 pl-3 text-sm transition-shadow outline-none focus:border-[var(--main-purple)] focus:shadow-[0_0_5px_#ffffff1f]"
								type={isVisible ? 'text' : 'password'}
							/>
							<img
								src={`/assets/images/icons/${isVisible ? 'hide' : 'visible'}.png`}
								alt={isVisible ? 'Esconder senha' : 'Exibir senha'}
								className="absolute right-3 cursor-pointer"
								onClick={() => setIsVisible((prev) => !prev)}
							/>
						</div>
						<button
							type="button"
							className={`form-btn w-[120px] text-sm ${userPassword.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
							onClick={deleteAccountWrapper}
						>
							Continuar
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
