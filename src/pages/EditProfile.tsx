import { useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { ProfileForm } from '../components/ProfileForm';
import { Link, useNavigate } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../database/configs/firebase';
import {
	deleteUser,
	EmailAuthProvider,
	getIdTokenResult,
	ProviderId,
	reauthenticateWithCredential,
} from 'firebase/auth';
import { idGenerator } from '../utils/idGenerator';
import { logError, logSuccess, logWarning } from '../utils/logger';
import { writeBatch } from 'firebase/firestore';
import {
	userDataRef,
	userNavigationRef,
	userProgressRef,
} from '../database/refs/userRefs';
import { useLogout } from '../hooks/useLogout';
import { DisplayableError } from '../classes/DisplayableError';

type Providers = (typeof ProviderId)[keyof typeof ProviderId];

export function EditProfile() {
	const { authState } = useSafeContext(AuthContext);
	const [userPassword, setUserPassword] = useState('');
	const [isVisible, setIsVisible] = useState(false);
	const [provider, setProvider] = useState<Providers | null>(null);
	const [deleteCodeInputValue, setDeleteCodeInputValue] = useState<string>('');
	const [deleteCode] = useState(() => idGenerator().generateID());
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();
	const logout = useLogout();

	useEffect(() => {
		void (async () => {
			const { signInProvider } = await getIdTokenResult(auth.currentUser!);
			setProvider(signInProvider as Providers);
		})();
	}, []);

	const deleteAccount = async () => {
		if (isDeleting) return;

		try {
			const { currentUser } = auth;
			if (!currentUser) {
				await logout();
				void navigate('/', { replace: true });
				throw new DisplayableError(
					'Sua sessão expirou. Faça login novamente para continuar.',
				);
			}

			if (provider === ProviderId.PASSWORD) {
				if (userPassword.length <= 0) return;

				const credential = EmailAuthProvider.credential(
					authState.data!.email,
					userPassword,
				);
				await reauthenticateWithCredential(currentUser, credential);
			} else {
				if (deleteCode !== deleteCodeInputValue) {
					logWarning('Código de exclusão inválido. Tente novamente.');
					return;
				}
			}

			setIsDeleting(true);

			const batch = writeBatch(db);
			batch.delete(userDataRef(authState.uid!));
			batch.delete(userProgressRef(authState.uid!));
			batch.delete(userNavigationRef(authState.uid!));
			await batch.commit();
			await deleteUser(currentUser);

			await logout();
			void navigate('/', { replace: true });
			logSuccess('Conta deletada com sucesso!');
		} catch (error) {
			setUserPassword('');
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case 'auth/invalid-credential': {
						logWarning('Senha incorreta. Tente novamente.');
						break;
					}
					case 'auth/requires-recent-login': {
						await logout();
						void navigate('/', { replace: true });
						logWarning(
							'Por motivos de segurança, faça login novamente para poder excluir sua conta.',
						);
						break;
					}
				}
			}
			logError({ error });
		}
	};

	const deleteField =
		provider === ProviderId.PASSWORD ? (
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
		) : (
			<>
				<p className="text-sm">
					Digite o código gerado a seguir para concluir a exclusão da conta:{' '}
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
			</>
		);

	return (
		<div>
			<h1 className="mb-10 text-2xl font-bold tracking-wide">Meus dados</h1>
			<div className="flex flex-col gap-y-10">
				<ProfileForm />
				<div className="flex flex-col items-start gap-y-3">
					<h3>Esqueceu sua senha?</h3>
					<Link to="/reset-password" className="form-btn text-sm">
						Alterar senha
					</Link>
				</div>
				<div className="flex flex-col">
					<h3 className="mb-2 text-lg">Deletar conta</h3>
					<p className="mb-3 text-sm">
						Essa ação é{' '}
						<span className="font-bold text-red-300">irreversível</span>. Não é
						possível recuperar a conta após sua exclusão.
					</p>
					<div className="flex flex-col items-start gap-y-3">
						{deleteField}
						<button
							type="button"
							className="form-btn text-sm"
							onClick={() => void deleteAccount()}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<img
									src="/assets/images/loading.png"
									alt="Carregando"
									className="w-6"
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
