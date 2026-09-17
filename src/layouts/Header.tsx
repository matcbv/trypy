import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logError, logSuccess } from '../utils/logger';
import { useLogout } from '../hooks/useLogout';

const userAccountMap = [
	{ slug: '', title: 'Dashboard' },
	{ slug: 'profile', title: 'Editar conta' },
	{ slug: 'resolutions', title: 'Resoluções' },
	{ slug: 'certifications', title: 'Certificações' },
	{ slug: 'support-us', title: 'Apoie-nos' },
];

const pagesMap = [
	{ slug: 'learning-path', title: 'Trilha de aprendizagem' },
	{ slug: 'playground', title: 'Playground' },
	{ slug: 'extra-content', title: 'Conteúdo extra' },
];

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isAtTop, setIsAtTop] = useState(true);
	const headerRef = useRef<HTMLDivElement>(null);
	const navIconRef = useRef<HTMLImageElement>(null);
	const navRef = useRef<HTMLElement>(null);
	const { authState } = useSafeContext(AuthContext);
	const underlineRef = useRef<HTMLSpanElement>(null);
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const logout = useLogout();

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

	const logoutWrapper = async () => {
		try {
			await logout();
			void navigate('/', { replace: true });
			logSuccess('Você foi deslogado com sucesso!');
		} catch (error) {
			logError({ error, text: 'Falha ao deslogar. Tente novamente.' });
		}
	};

	useEffect(() => {
		setIsMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 1024) {
				setIsMenuOpen(false);
			}
		};
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;

		const changeColor = () => {
			let color: string;

			if (window.scrollY === 0) {
				color = 'transparent';
				setIsAtTop(true);
			} else {
				color = '#000000f0';
				setIsAtTop(false);
			}
			header.style.setProperty('--header-bg', color);
		};
		window.addEventListener('scroll', changeColor);

		return () => {
			window.removeEventListener('scroll', changeColor);
		};
	}, []);

	useEffect(() => {
		if (!isMenuOpen) return;

		const handleClick = (event: globalThis.MouseEvent) => {
			const nav = navRef.current;
			const navIcon = navIconRef.current;

			if (!nav || !navIcon) return;

			if (event.target !== navIcon && !nav.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('click', handleClick);

		return () => document.removeEventListener('click', handleClick);
	}, [isMenuOpen]);

	return (
		<>
			<div
				ref={headerRef}
				className="font-jetbrains fixed top-0 z-30 w-full"
				style={{ '--header-bg': 'transparent' } as React.CSSProperties}
			>
				<header className="flex h-[70px] items-center justify-between bg-(--header-bg) px-5 transition-[background-color] duration-500 lg:px-15">
					<Link to="/">
						<img
							src="/assets/images/trypy-logo.png"
							alt="Logo TryPy"
							draggable="false"
							className="w-[50px] transition-[width] duration-300 lg:w-15"
						/>
					</Link>
					<nav className="hidden lg:block" ref={navRef}>
						<ul className="flex items-center gap-x-10">
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
								<span className="bg-main-green absolute -bottom-1 h-0.5 w-0 rounded-full transition-[width] duration-300"></span>
							</li>
							{pagesMap.map(({ slug, title }) => (
								<li
									key={slug}
									className="item relative flex flex-col items-center"
									onMouseEnter={showUnderline}
									onMouseLeave={hideUnderline}
								>
									<Link to={`/${slug}`}>{title}</Link>
									<span className="bg-main-green absolute -bottom-1 h-0.5 w-0 rounded-full transition-[width] duration-300"></span>
								</li>
							))}
						</ul>
					</nav>
					<div className="flex gap-x-5 lg:hidden">
						<img
							ref={navIconRef}
							src="/assets/images/icons/menu.png"
							alt="Menu"
							className="w-8"
							onClick={() => setIsMenuOpen((prev) => !prev)}
							role="button"
							tabIndex={0}
						/>
						{authState.data && (
							<img
								src="/assets/images/icons/logout.png"
								alt="Deslogar"
								className="w-8"
								onClick={() => void logoutWrapper()}
								role="button"
								tabIndex={0}
							/>
						)}
					</div>
				</header>
				<nav
					className={`bg-(--header-bg) ${isAtTop && 'backdrop-blur-xl'} transition-[background-color, height] duration-500 ${isMenuOpen ? 'visible h-fit opacity-100' : 'invisible h-0 opacity-0'}`}
				>
					<ul className="flex flex-col text-sm">
						{authState.data ? (
							userAccountMap.map(({ slug, title }) => (
								<li key={slug} className="border-b border-b-gray-400">
									<Link className="block p-5" to={`/dashboard/${slug}`}>
										{title}
									</Link>
								</li>
							))
						) : (
							<li className="border-b border-b-gray-400">
								<Link className="block p-5" to="/session">
									Iniciar sessão
								</Link>
							</li>
						)}
						{pagesMap.map(({ title, slug }, i) => (
							<li
								key={slug}
								className={`${i < pagesMap.length - 1 && 'border-b border-b-gray-400'}`}
							>
								<Link className="block p-5" to={`/${slug}`}>
									{title}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>
		</>
	);
}
