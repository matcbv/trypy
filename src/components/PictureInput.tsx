import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState, type ChangeEvent } from 'react';
import { storage } from '../database/configs/firebase';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logError, logSuccess } from '../utils/logger';
import { updateDoc } from 'firebase/firestore';
import { useSafeContext } from '../hooks/useSafeContext';
import { userDataRef } from '../database/refs/userRefs';

export function PictureInput() {
	const { authState, setAuthState } = useSafeContext(AuthContext);
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
			setAuthState((prev) => {
				if (!prev.data) return prev;
				return {
					...prev,
					data: { ...prev.data, picture: publicUrl },
				};
			});
			await updateDoc(userDataRef(uid!), { picture: publicUrl });

			logSuccess('Foto atualizada com sucesso!');
		} catch (error) {
			logError({ error, text: 'Falha ao atualizar a foto. Tente novamente.' });
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="mb-10">
			<h2 className="mb-3 text-lg">Foto de perfil</h2>
			<label htmlFor="picture" className="group relative block w-fit">
				<div className="size-30 overflow-hidden rounded-full">
					{isUpdating ? (
						<div className="flex size-full items-center justify-center bg-black/50">
							<img
								src="/assets/images/loading.png"
								alt="Atualizando foto"
								className="h-10 w-10"
							/>
						</div>
					) : (
						<img
							src={picturePreview}
							className="size-full object-cover lg:cursor-pointer"
							referrerPolicy="no-referrer"
						/>
					)}
				</div>

				<div className="absolute -right-4 bottom-0 transition-transform lg:scale-0 lg:group-hover:scale-100">
					<img
						src="/assets/images/icons/edit-image.png"
						alt="Editar imagem"
						tabIndex={0}
						role="button"
						className="lg:cursor-pointer"
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
