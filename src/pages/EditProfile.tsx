import { Link } from 'react-router-dom';
import { dateFormatter } from '../utils/formatter';
import { PictureInput } from '../components/PictureInput';
import { logError, logSuccess } from '../utils/logger';
import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthProvider/context';
import { updateDoc } from 'firebase/firestore';
import { useSafeContext } from '../hooks/useSafeContext';
import { userDataRef } from '../database/refs/userRefs';
import { validationRegex } from '../constants/validationRegex';
import { useRequireUser } from '../hooks/useRequireUser';
import { updateProfile } from 'firebase/auth';
import { isValidBirthDate } from '../utils/isValidBirthDate';

const formMap = {
	name: 'Nome',
	lastname: 'Sobrenome',
	birthDate: 'Data de nascimento',
};

export function EditProfile() {
	const { authState, setAuthState } = useSafeContext(AuthContext);
	const [placeholders, setPlaceholders] = useState(formMap);
	const [currentData, setCurrentData] = useState({
		name: '',
		lastname: '',
		birthDate: '',
	});
	const [fieldErrors, setFieldErrors] = useState<Array<keyof typeof formMap>>(
		[],
	);
	const requireUser = useRequireUser();

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
				const formattedData = currentData[key].trim();

				let isValid = validationRegex[key].regex.test(formattedData);

				if (key === 'birthDate' && isValid) {
					isValid = isValidBirthDate(formattedData);
				}

				if (!isValid) {
					setFieldErrors((prev) =>
						prev.includes(key) ? prev : [...prev, key],
					);

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

		const user = await requireUser();

		const isDataValid = checkData();
		if (!isDataValid) return;

		const formattedData = Object.fromEntries(
			Object.entries(currentData).map(([key, value]) => [key, value.trim()]),
		) as typeof currentData;

		try {
			await updateDoc(userDataRef(user.uid), formattedData);

			await updateProfile(user, {
				displayName: `${currentData.name} ${currentData.lastname}`,
			});

			setAuthState((prev) => {
				if (!prev.data) return prev;
				return {
					...prev,
					data: { ...prev.data, ...formattedData },
				};
			});

			logSuccess('Dados atualizados com sucesso!');
		} catch (error) {
			logError({
				error,
				text: 'Falha ao atualizar os dados. Tente novamente.',
			});
		}
	};

	return (
		<div>
			<div>
				<h1 className="mb-10 text-2xl font-bold tracking-wide">Meus dados</h1>
				<div className="flex flex-col gap-y-10">
					<form
						className="flex flex-col items-start"
						onSubmit={(e) => void handleSubmit(e)}
					>
						<PictureInput />
						<div className="mb-3 w-full">
							<h2 className="mb-3 text-lg font-bold">Dados básicos</h2>
							<div className="flex flex-col gap-y-2">
								{(
									Object.keys(currentData) as Array<keyof typeof currentData>
								).map((key) => {
									return (
										<div className="flex flex-col">
											<label htmlFor={key} className="mb-px text-sm">
												{placeholders[key]}
											</label>
											<input
												id={key}
												key={key}
												value={currentData[key]}
												onChange={handleChange}
												placeholder={key === 'birthDate' ? 'dd/mm/aaaa' : ''}
												className={`border-main-green/80 focus:border-main-green w-full max-w-75 rounded-md border-2 bg-white/5 px-3 py-2 text-sm transition-all duration-300 outline-none focus:shadow-[0_0_10px_#ffffff]/10 ${fieldErrors.includes(key) ? 'placeholder-red-400' : 'placeholder-gray-400'}`}
												type="text"
											/>
										</div>
									);
								})}
							</div>
						</div>
						<button className="form-btn text-sm">Salvar</button>
					</form>
					<div className="flex flex-col items-start gap-y-3">
						<h2 className="text-lg font-bold">Esqueceu sua senha?</h2>
						<p className="text-section-base">
							Clique no botão abaixo e siga as instruções para redefinir sua
							senha.
						</p>
						<Link to="/reset-password" className="form-btn text-sm">
							Alterar senha
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
