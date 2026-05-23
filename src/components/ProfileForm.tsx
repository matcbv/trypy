import { toast } from 'react-toastify';
import { ToastNotification } from './Notifications';
import { dateFormatter } from '../utils/dateFormatter';
import { PictureInput } from './PictureInput';
import { logError } from '../utils/logger';
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { updateDoc } from 'firebase/firestore';
import { formMap } from '../constants/labelMap';
import { useSafeContext } from '../hooks/useSafeContext';
import { userDataRef } from '../database/refs/userRefs';
import type { UserData } from '../types/user';
import type { ToastData } from '../types/toast';

export function ProfileForm() {
	const { authState, authDispatch } = useSafeContext(AuthContext);
	const [currentData, setCurrentData] = useState<Partial<UserData> | null>(
		authState.data,
	);

	useEffect(() => {
		setCurrentData(authState.data);
	}, [authState.data]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const finalValue =
			e.target.id === 'birthDate'
				? dateFormatter(e.target.value)
				: e.target.value;
		setCurrentData((prev) => {
			if (!prev) return prev;
			return { ...prev, [e.target.id]: finalValue };
		});
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!currentData) return;

		try {
			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { ...authState, data: currentData },
			});
			await updateDoc(userDataRef(authState.uid!), { ...currentData });
			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Dados atualizados com sucesso!',
				},
			});
		} catch (error) {
			logError(error, 'Falha ao atualizar os dados. Tente novamente.');
		}
	};

	return (
		<form
			className="flex flex-col items-start"
			onSubmit={(e) => void handleSubmit(e)}
		>
			<PictureInput />
			<div className="mb-4">
				<h2 className="mb-4 text-lg">Dados básicos</h2>
				<div className="flex flex-col gap-y-3">
					{(Object.keys(formMap) as Array<keyof typeof formMap>).map(
						(key) =>
							key !== 'password' && (
								<input
									id={key}
									key={key}
									value={currentData?.[key] || ''}
									placeholder={formMap[key]}
									onChange={handleChange}
									className="w-[300px] rounded-md border-2 border-[var(--main-green)]/60 bg-white/5 py-2 pr-9 pl-3 text-sm transition-shadow outline-none focus:border-[var(--main-green)] focus:shadow-[0_0_5px_#ffffff1f]"
									type="text"
								/>
							),
					)}
				</div>
			</div>
			<input
				type="submit"
				value="Salvar"
				className="form-btn w-[120px] text-sm"
			/>
		</form>
	);
}
