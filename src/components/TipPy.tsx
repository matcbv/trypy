import { useEffect, useState, type MouseEvent } from 'react';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import { updateDoc } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logError } from '../utils/logger';
import authActionTypes from '../contexts/AuthProvider/actionTypes';
import { useSafeContext } from '../hooks/useSafeContext';
import { userDataRef } from '../database/refs/userRefs';
import type { TipData } from '../types/content';

export function TipPy({ tipFields }: { tipFields: TipData }) {
	const { authState, authDispatch } = useSafeContext(AuthContext);
	const [favorited, setFavorited] = useState(false);

	useEffect(() => {
		const savedTips = authState.data?.savedTips;
		if (savedTips) setFavorited(savedTips.includes(tipFields.slug));
	}, [authState.data?.savedTips, tipFields.slug]);

	const toggleImage = (
		e: MouseEvent<HTMLImageElement>,
		isHovering: boolean,
	) => {
		if (!favorited) {
			e.currentTarget.src = `/assets/images/icons/${isHovering ? 'favorited' : 'favorite'}.png`;
		}
	};

	const toggleFavorite = async () => {
		if (!authState.data || !authState.uid) return;

		try {
			let savedTips = authState.data.savedTips || [];
			if (savedTips.includes(tipFields.slug)) {
				savedTips = savedTips.filter((tip) => tip !== tipFields.slug);
			} else {
				savedTips = [...savedTips, tipFields.slug];
			}
			await updateDoc(userDataRef(authState.uid), { savedTips });
			authDispatch({
				type: authActionTypes.SET_DATA,
				payload: { data: { savedTips } },
			});
			setFavorited((prev) => !prev);
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
						onClick={() => void toggleFavorite()}
						onMouseEnter={(e) => toggleImage(e, true)}
						onMouseLeave={(e) => toggleImage(e, false)}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-y-4 p-4 text-[0.8rem]">
				{contentfulFormatter(tipFields.content)}
			</div>
		</div>
	);
}
