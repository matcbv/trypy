import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState, type ChangeEvent } from 'react';
import { storage } from '../database/configs/firebase';
import { AuthContext } from '../contexts/AuthProvider/context';
import { toast } from 'react-toastify';
import { ToastNotification } from './Notifications';
import { logError } from '../utils/logger';
import { updateDoc } from 'firebase/firestore';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import type { ToastData } from '../types/toast';
import { useSafeContext } from '../hooks/useSafeContext';
import { userDataRef } from '../database/refs/userRefs';

export function PictureInput() {
	const { authState, authDispatch } = useSafeContext(AuthContext);
	const [isUpdating, setIsUpdating] = useState(false);
	const picturePreview =
		authState.data?.picture || '/assets/images/profile-picture.png';

	const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
		try {
			const file = e.target.files?.[0];
			if (!file) return;

			setIsUpdating(true);

			const { uid } = authState;
			const storageRef = ref(storage, `pictures/${uid}`);
			await uploadBytes(storageRef, file);
			const publicUrl = await getDownloadURL(storageRef);

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { data: { picture: publicUrl } },
			});
			await updateDoc(userDataRef(uid!), { picture: publicUrl });

			toast<ToastData>(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Foto atualizada com sucesso!',
				},
			});
		} catch (error) {
			logError(error, 'Falha ao atualizar a foto. Tente novamente.');
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="mb-10">
			<h2 className="mb-5 text-lg">Foto de perfil</h2>
			<label htmlFor="picture" className="group relative">
				<div className="h-[120px] w-[120px] overflow-hidden rounded-full">
					{isUpdating ? (
						<div className="flex size-full items-center justify-center bg-black/50">
							<img
								src="/assets/images/loading.png"
								alt="Atualizando foto"
								className="h-[40px] w-[40px]"
							/>
						</div>
					) : (
						<img
							src={picturePreview}
							className="size-full cursor-pointer object-cover"
						/>
					)}
				</div>

				<div className="absolute -right-3 bottom-0 scale-0 transition-transform group-hover:scale-100">
					<img
						src="/assets/images/icons/edit.png"
						alt="Editar imagem"
						className="cursor-pointer opacity-80"
					/>
					<input
						type="file"
						id="picture"
						accept="image/png, image/jpg, image/jpeg"
						onChange={(e) => void handleFile(e)}
						className="hidden"
					/>
				</div>
			</label>
		</div>
	);
}
