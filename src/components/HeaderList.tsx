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
		<ul className="flex gap-x-10 font-bold text-white">
			<li
				className="flex flex-col items-center p-2"
				onMouseEnter={showUnderline}
				onMouseLeave={hideUnderline}
			>
				{authState.data ? (
					<Link to="/dashboard">Minha conta</Link>
				) : (
					<Link to="/session">Iniciar sessão</Link>
				)}
				<span className="block h-0.5 w-0 rounded-full bg-[var(--main-green)] transition-all"></span>
			</li>
			<li
				className="flex flex-col items-center p-2"
				onMouseEnter={showUnderline}
				onMouseLeave={hideUnderline}
			>
				<Link to="/learning-path">Trilha de aprendizagem</Link>
				<span className="block h-0.5 w-0 rounded-full bg-[var(--main-green)] transition-all"></span>
			</li>
		</ul>
	);
}
