import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useContext, useEffect, useState } from 'react';
import { db, storage } from '../database/firebase';
import { AuthContext } from '../contexts/AuthProvider/context';
import { toast } from 'react-toastify';
import { ToastNotification } from './Notifications';
import { logError } from '../utils/logger';
import { doc, updateDoc } from 'firebase/firestore';
import authActionTypes from '../contexts/AuthProvider/actionTypes';

export function PictureInput() {
	const { authState, authDispatch } = useContext(AuthContext);
	const { picture } = authState.data;
	const [picturePreview, setPicturePreview] = useState(picture);

	useEffect(() => {
		(async () => {
			if (picture instanceof File) {
				const objectUrl = URL.createObjectURL(picture);
				setPicturePreview(objectUrl);
				return () => URL.revokeObjectURL(objectUrl);
			} else {
				picture && setPicturePreview(picture);
			}
		})();
	}, [picture]);

	const handleFile = async (e) => {
		try {
			const file = e.target.files[0];
			if (!file) return;

			const { uid } = authState;
			const storageRef = ref(storage, `pictures/${uid}`);
			await uploadBytes(storageRef, file);
			const publicUrl = await getDownloadURL(storageRef);

			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { data: { picture: publicUrl } },
			});
			await updateDoc(doc(db, 'users', uid), { picture: publicUrl });

			toast(ToastNotification, {
				type: 'success',
				data: {
					type: 'success',
					text: 'Foto atualizada com sucesso!',
				},
			});
		} catch (error) {
			logError(error, 'Falha ao atualizar a foto. Tente novamente.');
		}
	};

	return (
		<div className="mb-10">
			<h2 className="mb-5 text-lg">Foto de perfil</h2>
			<label htmlFor="picture" className="group relative">
				<img
					src={picturePreview || '/assets/images/profile_picture.png'}
					className={`h-[120px] w-[120px] cursor-pointer rounded-full object-cover`}
				/>
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
						onChange={handleFile}
						className="hidden"
					/>
				</div>
			</label>
		</div>
	);
}
