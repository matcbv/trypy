import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useState, type SubmitEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../database/configs/firebase';
import { logError, logSuccess, logWarning } from '../utils/logger';
import { LoadingPage } from './LoadingPage';

export function NewPassword() {
	const [newPassword, setNewPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
	const [isSubmitting, setIsisSubmitting] = useState(false);
	const [passwordsMatch, setPasswordsMatch] = useState<null | boolean>(null);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const code = searchParams.get('oobCode');

	useEffect(() => {
		if (!code) {
			void navigate('/reset-password', { replace: true });
			return;
		}

		verifyPasswordResetCode(auth, code).catch(() => {
			void navigate('/reset-password', { replace: true });
		});
	}, [code, navigate]);

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (newPassword !== passwordConfirmation) {
			setPasswordConfirmation('');
			setPasswordsMatch(false);
			return;
		}

		if (!code) {
			void navigate('/reset-password', { replace: true });
			logWarning('Link para redefinição de senha expirado. Tente novamente.');
			return;
		}

		setIsisSubmitting(true);

		try {
			await confirmPasswordReset(auth, code, newPassword);

			void navigate('/session', {
				replace: true,
			});
			logSuccess('Senha alterada com sucesso');
		} catch (error) {
			logError({
				error,
				text: 'Não foi possível concluir a alteração de sua senha. Tente novamente.',
			});
		} finally {
			setIsisSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-100 w-full max-w-125 rounded-lg shadow-[0_0_20px_#ffffff]/10">
				{isSubmitting && <LoadingPage />}
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-10'></div>
				<div className="relative flex w-full flex-col justify-center p-10">
					<h1 className="text-title-2xl mb-3 font-bold tracking-wider">
						Criar nova senha
					</h1>
					<p className="text-section-base mb-5 tracking-wide">
						A nova senha deve ter pelo menos 8 caracteres, incluindo uma letra
						maiúscula, uma minúscula e um número.
					</p>
					<form
						className="mb-10 max-w-80"
						onSubmit={(e) => void handleSubmit(e)}
					>
						<div className="text-sm">
							<div className="mb-3 flex flex-col">
								<label htmlFor="password" className="font-jetbrains ml-3">
									Nova senha
								</label>
								<div className="relative flex items-center">
									<input
										type={isPasswordVisible ? 'text' : 'password'}
										id="password"
										onChange={(e) => setNewPassword(e.target.value)}
										value={newPassword}
										className="focus:border-main-green min-h-9 w-full rounded-full border-2 border-white/30 bg-white/5 py-1 pr-10 pl-3 text-base leading-6 outline-none"
									/>
									<img
										className="absolute right-3 lg:cursor-pointer"
										onClick={() => setIsPasswordVisible((prev) => !prev)}
										src={`/assets/images/icons/${isPasswordVisible ? 'hide' : 'show'}.png`}
										alt={isPasswordVisible ? 'Esconder senha' : 'Exibir senha'}
										role="button"
										tabIndex={0}
									/>
								</div>
							</div>
							<div className="mb-5 flex flex-col">
								<label
									htmlFor="confirm-password"
									className="font-jetbrains ml-3"
								>
									Confirmar nova senha
								</label>
								<div className="relative flex items-center">
									<input
										type={isConfirmationVisible ? 'text' : 'password'}
										id="confirm-password"
										onChange={(e) => {
											setPasswordConfirmation(e.target.value);
											setPasswordsMatch(null);
										}}
										value={passwordConfirmation}
										placeholder={
											passwordsMatch === null
												? ''
												: passwordsMatch
													? ''
													: 'As senhas não batem'
										}
										className="focus:border-main-green min-h-9 w-full rounded-full border-2 border-white/30 bg-white/5 py-1 pr-10 pl-3 text-base leading-6 placeholder-red-400 outline-none"
									/>
									<img
										className="absolute right-3 lg:cursor-pointer"
										onClick={() => setIsConfirmationVisible((prev) => !prev)}
										src={`/assets/images/icons/${isConfirmationVisible ? 'hide' : 'show'}.png`}
										alt={
											isConfirmationVisible ? 'Esconder senha' : 'Exibir senha'
										}
										role="button"
										tabIndex={0}
									/>
								</div>
							</div>
							<div className="flex gap-x-3">
								<button
									type="submit"
									className="form-btn text-section-base relative overflow-hidden font-bold"
								>
									Salvar
								</button>
								<button
									type="button"
									onClick={() =>
										auth.currentUser
											? void navigate('/dashboard', { replace: true })
											: void navigate('/dashboard/edit-profile', {
													replace: true,
												})
									}
									className="form-btn text-section-base"
								>
									Cancelar
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
