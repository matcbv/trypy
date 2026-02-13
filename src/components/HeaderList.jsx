import { useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider/context';

export function HeaderList() {
	const { authState } = useContext(AuthContext);
	const underlineRef = useRef(null);

	const showUnderline = (e) => {
		const underline = e.target.querySelector('span');
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
				{Object.keys(authState.data || {}).length > 0 ? (
					<Link to="/dashboard/overview">Minha conta</Link>
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
