import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSafeContext } from '../hooks/useSafeContext';
import { AuthContext } from '../contexts/AuthProvider/context';
import { logout } from '../database/auth/auth';
import { logError, logSuccess } from '../utils/logger';
import { ProgressContext } from '../contexts/ProgressProvider/context';
import { NavigationContext } from '../contexts/NavigationProvider/context';

const objectsMap = [
	{ slug: '', title: 'Dashboard' },
	{ slug: 'profile', title: 'Editar conta' },
	{ slug: 'support-us', title: 'Assinatura' },
	{ slug: 'certifications', title: 'Certificações' },
	{ slug: 'resolutions', title: 'Resoluções' },
];

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isAtTop, setIsAtTop] = useState(true);
	const headerRef = useRef<HTMLDivElement>(null);
	const navIconRef = useRef<HTMLImageElement>(null);
	const navRef = useRef<HTMLElement>(null);
	const { authState, authDispatch } = useSafeContext(AuthContext);
	const { setProgressState } = useSafeContext(ProgressContext);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const underlineRef = useRef<HTMLSpanElement>(null);
	const navigate = useNavigate();
	const { pathname } = useLocation();

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
			await logout({ authDispatch, setProgressState, setNavigationState });
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
				<header className="flex h-[65px] items-center justify-between bg-(--header-bg) px-[20px] transition-[background-color] duration-500 lg:px-[60px]">
					<Link to="/">
						<img
							src="/assets/images/trypy-logo.png"
							alt="Logo TryPy"
							draggable="false"
							className="w-[40px] transition-[width] lg:w-[50px]"
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
							<li
								className="item relative flex flex-col items-center"
								onMouseEnter={showUnderline}
								onMouseLeave={hideUnderline}
							>
								<Link to="/learning-path">Trilha de aprendizagem</Link>
								<span className="bg-main-green absolute -bottom-1 h-0.5 w-0 rounded-full transition-[width] duration-300"></span>
							</li>
							<li
								className="item relative flex flex-col items-center"
								onMouseEnter={showUnderline}
								onMouseLeave={hideUnderline}
							>
								<Link to="/">Conteúdo extra</Link>
								<span className="bg-main-green absolute -bottom-1 h-0.5 w-0 rounded-full transition-[width] duration-300"></span>
							</li>
						</ul>
					</nav>
					<div className="flex gap-x-[20px] lg:hidden">
						<img
							ref={navIconRef}
							src="/assets/images/icons/menu.png"
							alt="Menu"
							className="w-[28px] cursor-pointer"
							onClick={() => setIsMenuOpen((prev) => !prev)}
							role="button"
							tabIndex={0}
						/>
						{authState.data && (
							<img
								src="/assets/images/icons/logout.png"
								alt="Deslogar"
								className="w-[28px] cursor-pointer"
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
							objectsMap.map(({ slug, title }) => (
								<li
									key={slug}
									className="cursor-pointer border-b border-b-gray-200"
								>
									<Link className="block p-[20px]" to={`/dashboard/${slug}`}>
										{title}
									</Link>
								</li>
							))
						) : (
							<li className="border-b border-b-gray-200">
								<Link className="block p-[20px]" to="/session">
									Iniciar sessão
								</Link>
							</li>
						)}
						<li className="border-b border-b-gray-200">
							<Link className="block p-[20px]" to="/learning-path">
								Trilha de aprendizagem
							</Link>
						</li>
						<li>
							<Link className="block p-[20px]" to="/">
								Conteúdo extra
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</>
	);
}
