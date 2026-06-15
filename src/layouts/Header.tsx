import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeaderList } from '../components/HeaderList';

export function Header() {
	const headerRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;

		const changeColor = () => {
			if (window.scrollY === 0) {
				header.style.backgroundColor = 'transparent';
				header.style.zIndex = '10';
			} else {
				header.style.backgroundColor = 'var(--color-main-black)';
				header.style.zIndex = '30';
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
			className="fixed top-0 z-10 flex h-[68px] w-full items-center justify-between bg-transparent px-16 backdrop-blur-xs transition-colors"
		>
			<Link
				to="/"
				className="text-main-green font-bold transition-all duration-500"
			>
				<img
					src="/assets/images/trypy-logo.png"
					alt="Logo TryPy"
					draggable="false"
				/>
			</Link>
			<HeaderList />
		</header>
	);
}
