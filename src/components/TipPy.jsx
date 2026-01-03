import { useContext, useEffect, useState } from 'react';
import { contentfulFormatter } from '../content/contentfulFormatter';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebase';
import AuthContext from '../contexts/AuthProvider/context';
import { logError } from '../utils/logger';
import authActionTypes from '../contexts/AuthProvider/actionTypes';

export function TipPy({ tipFields }) {
	const [authData, authDispatch] = useContext(AuthContext);
	const [favorited, setFavorited] = useState(false);

	useEffect(() => {
		const savedTips = authData.data.savedTips;
		savedTips && setFavorited(savedTips.includes(tipFields.slug));
	}, [authData, tipFields.slug]);

	const toggleImage = async (e, isHovering) => {
		if (!favorited && e.target) {
			e.target.src = `/assets/images/icons/${isHovering ? 'favorited' : 'favorite'}.png`;
		}
	};

	const toggleFavorite = async () => {
		try {
			let savedTips = authData.data.savedTips;
			if (savedTips.includes(tipFields.slug)) {
				savedTips = savedTips.filter((tip) => tip !== tipFields.slug);
			} else {
				savedTips = [...savedTips, tipFields.slug];
			}
			await updateDoc(doc(db, 'users', authData.uid), { savedTips });
			await authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { savedTips },
			});
		} catch (error) {
			logError(error);
		}
	};

	return (
		<div className="font-jetbrains mb-5 w-[600px] overflow-hidden rounded-lg bg-[#13121b] shadow-lg">
			<div className="flex items-center bg-[var(--main-bg-color)] px-4 py-2">
				<div className="flex gap-2">
					<span className="h-3 w-3 rounded-full bg-red-400/70"></span>
					<span className="h-3 w-3 rounded-full bg-yellow-300/70"></span>
					<span className="h-3 w-3 rounded-full bg-green-400/70"></span>
				</div>
				<span className="ml-4 text-sm">{tipFields.title}</span>
				<div className="group ml-auto flex">
					<img
						src={`/assets/images/icons/${favorited ? 'favorited' : 'favorite'}.png`}
						alt="Favoritar"
						className="cursor-pointer"
						draggable={false}
						onClick={toggleFavorite}
						onMouseEnter={(e) => toggleImage(e, true)}
						onMouseLeave={(e) => toggleImage(e, false)}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-y-4 p-4 text-[0.8rem] leading-normal">
				{contentfulFormatter(tipFields.content)}
			</div>
		</div>
	);
}
