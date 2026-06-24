import { toast } from 'react-toastify';
import { ToastNotification } from './Notifications';
import { dateFormatter } from '../utils/dateFormatter';
import { PictureInput } from './PictureInput';
import { logError } from '../utils/logger';
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { updateDoc } from 'firebase/firestore';
import { useSafeContext } from '../hooks/useSafeContext';
import { userDataRef } from '../database/refs/userRefs';
import type { ToastData } from '../types/toast';
import { validationRegex } from '../constants/validationRegex';

export function ProfileForm() {
	const { authState, authDispatch } = useSafeContext(AuthContext);
	const [fieldErrors, setFieldErrors] = useState<Array<keyof typeof formMap>>(
		[],
	);

	const [currentData, setCurrentData] = useState({
		email: '',
		name: '',
		lastname: '',
		birthDate: '',
	});

	const formMap = {
		email: 'E-mail',
		name: 'Nome',
		lastname: 'Sobrenome',
		birthDate: 'Data de nascimento',
	};

	const [placeholders, setPlaceholders] = useState(formMap);

	useEffect(() => {
		if (!authState.data) return;

		const safeData = authState.data;

		setCurrentData(
			(prev) =>
				Object.fromEntries(
					(Object.keys(prev) as Array<keyof typeof prev>).map((key) => [
						key,
						safeData[key] || '',
					]),
				) as typeof currentData,
		);
	}, [authState.data]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const id = e.target.id as keyof typeof formMap;

		setPlaceholders((prev) => {
			return { ...prev, [id]: formMap[id] };
		});
		setFieldErrors((prev) => prev.filter((field) => field !== id));

		const finalValue =
			e.target.id === 'birthDate'
				? dateFormatter(e.target.value)
				: e.target.value;
		setCurrentData((prev) => {
			return { ...prev, [e.target.id]: finalValue };
		});
	};

	const checkData = () => {
		let isDataValid = true;

		(Object.keys(currentData) as Array<keyof typeof currentData>).forEach(
			(key) => {
				if (!currentData[key].trim().match(validationRegex[key].regex)) {
					setFieldErrors((prev) => [...prev, key]);
					setCurrentData((prev) => ({ ...prev, [key]: '' }));
					setPlaceholders((prev) => ({
						...prev,
						[key]: validationRegex[key].text,
					}));
					isDataValid = false;
				}
			},
		);
		return isDataValid;
	};

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const isDataValid = checkData();

		if (!isDataValid) return;

		const formattedData = Object.fromEntries(
			Object.entries(currentData).map(([key, value]) => [key, value.trim()]),
		) as typeof currentData;

		try {
			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { data: formattedData },
			});
			await updateDoc(userDataRef(authState.uid!), formattedData);
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
					{(Object.keys(currentData) as Array<keyof typeof currentData>).map(
						(key) => {
							return (
								<input
									id={key}
									key={key}
									value={currentData[key]}
									placeholder={placeholders[key]}
									onChange={handleChange}
									className={`border-main-green/60 focus:border-main-green w-[300px] rounded-md border-2 bg-white/5 py-2 pr-9 pl-3 text-sm transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff1f] ${fieldErrors.includes(key) ? 'placeholder-red-400' : 'placeholder-gray-400'}`}
									type="text"
								/>
							);
						},
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
