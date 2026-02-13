import { toast } from 'react-toastify';
import { ToastNotification } from './Notifications';
import { dateFormatter } from '../utils/dataFormatter';
import { PictureInput } from './PictureInput';
import { logError } from '../utils/logger';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import { formMap } from '../constants/labelMap';

export function ProfileForm() {
	const { authState, authDispatch } = useContext(AuthContext);
	const [currentData, setCurrentData] = useState({ ...authState.data });

	useEffect(() => {
		setCurrentData(authState.data);
	}, [authState.data]);

	const handleChange = (e) => {
		const finalValue =
			e.target.id === 'birthDate'
				? dateFormatter(e.target.value)
				: e.target.value;
		setCurrentData((prev) => ({ ...prev, [e.target.id]: finalValue }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { data: currentData },
			});
			await updateDoc(doc(db, 'users', authState.uid), currentData);
			toast(ToastNotification, {
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
		<form className="flex flex-col items-start" onSubmit={handleSubmit}>
			<PictureInput />
			<div className="mb-4">
				<h2 className="mb-4 text-lg">Dados básicos</h2>
				<div className="flex flex-col gap-y-3">
					{Object.keys(formMap).map(
						(key) =>
							key !== 'password' && (
								<input
									id={key}
									key={key}
									value={currentData[key] || ''}
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
