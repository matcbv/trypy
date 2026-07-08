import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { logError, logWarning } from '../utils/logger';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../database/configs/firebase';

export function ResetPasswordForm() {
	const [email, setEmail] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email) {
			logWarning('Preencha o campo de e-mail!');
			return;
		}

		try {
			const actionCodeSettings = {
				url: 'http://localhost:5173/',
				handleCodeInApp: true,
			};
			await sendPasswordResetEmail(auth, email, actionCodeSettings);
		} catch (error) {
			logError({ error });
		}
	};

	return (
		<form className="mb-8 w-[350px]" onSubmit={(e) => void handleSubmit(e)}>
			<div className="flex flex-col gap-y-8 text-sm">
				<div className="border-b-main-green relative flex w-full items-end border-b-2">
					<label htmlFor="" className="font-jetbrains w-20">
						E-mail
					</label>
					<input
						type="text"
						className="w-full focus:outline-none"
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<div className="flex gap-x-8">
					<button type="submit" className="form-btn w-[150px]">
						Continuar
					</button>
					<button
						type="button"
						onClick={() => void navigate(-1)}
						className="form-btn w-[120px]"
					>
						Voltar
					</button>
				</div>
			</div>
		</form>
	);
}
