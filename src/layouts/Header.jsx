import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeaderList } from '../components/HeaderList';

export function Header() {
	const headerRef = useRef(null);

	useEffect(() => {
		if (!headerRef) return;

		const changeColor = () => {
			if (window.scrollY === 0) {
				headerRef.current.style.backgroundColor = 'transparent';
				headerRef.current.style.zIndex = '10';
			} else {
				headerRef.current.style.backgroundColor = 'var(--main-black)';
				headerRef.current.style.zIndex = '30';
			}
		};
		window.addEventListener('scroll', changeColor);

		return () => {
			window.removeEventListener('scroll', changeColor);
		};
	}, []);

	return (
		<header
			ref={headerRef}
			className="fixed top-0 z-10 flex h-[68px] w-full items-center justify-between bg-transparent px-10 backdrop-blur-xs transition-colors"
		>
			<Link
				to="/"
				className="text-[28px] font-bold text-[var(--main-green)] transition-all duration-500 hover:text-shadow-[0_0_15px_#00a63e75]"
			>
				&lt;TryPy&gt;
			</Link>
			<HeaderList />
		</header>
	);
}
