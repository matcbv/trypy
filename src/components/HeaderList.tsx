import { useRef, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';

export function HeaderList() {
	const { authState } = useSafeContext(AuthContext);
	const underlineRef = useRef<HTMLSpanElement>(null);

	const showUnderline = (e: MouseEvent<HTMLLIElement>) => {
		const underline = e.currentTarget.querySelector('span');
		if (underline) {
			underline.style.width = '100%';
			underlineRef.current = underline;
		}
	};

	const hideUnderline = () => {
		if (underlineRef.current) {
			underlineRef.current.style.width = '0';
		}
	};

	return (
		<ul className="font-jetbrains flex items-center gap-x-10 font-bold text-white">
			<li
				className="relative flex flex-col items-center"
				onMouseEnter={showUnderline}
				onMouseLeave={hideUnderline}
			>
				{authState.data ? (
					<Link to="/dashboard">Minha conta</Link>
				) : (
					<Link to="/session">Iniciar sessão</Link>
				)}
				<span className="bg-main-green absolute bottom-0 h-0.5 w-0 rounded-full transition-all"></span>
			</li>
			<li
				className="item relative flex flex-col items-center"
				onMouseEnter={showUnderline}
				onMouseLeave={hideUnderline}
			>
				<Link to="/learning-path">Trilha de aprendizagem</Link>
				<span className="bg-main-green absolute bottom-0 h-0.5 w-0 rounded-full transition-all"></span>
			</li>
			<li className="flex flex-col">
				<Link to="">
					<img
						src="/assets/images/icons/notification.png"
						alt="Notificações"
						className="w-[28px]"
					/>
				</Link>
			</li>
		</ul>
	);
}
