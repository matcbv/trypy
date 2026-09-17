import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function HeroBanner() {
	const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const heading = document.querySelector('h1')!;
		const ext = '.py'.split('');

		const timerList = ext.map((letter, i) => {
			const timerId = setTimeout(
				() => (heading.innerText += letter),
				500 * (i + 1),
			);
			return timerId;
		});

		const underlineLoop = setInterval(() => {
			heading.innerText += '_';
			setTimeout(() => {
				heading.innerText = heading.innerText.replace('_', '');
			}, 1000);
			return;
		}, 2000);

		return () => {
			for (const timer of timerList) {
				clearTimeout(timer);
			}
			clearInterval(underlineLoop);
		};
	}, []);

	return (
		<div className="px-hero-x relative flex w-full items-center justify-between overflow-hidden py-45">
			<div
				className="absolute inset-0 z-10 hidden lg:block"
				onMouseMove={(e) =>
					setPointerPosition({
						x: e.nativeEvent.offsetX,
						y: e.nativeEvent.offsetY,
					})
				}
				style={{
					backgroundImage: `radial-gradient(circle 1200px at ${pointerPosition.x}px ${pointerPosition.y}px, color-mix(in srgb, var(--color-main-purple) 7%, transparent) 0%, transparent 70%)`,
				}}
			></div>
			<div className="flex flex-col items-start gap-y-7">
				<h1 className="font-jetbrains text-main-green text-hero-title">try</h1>
				<p className="font-jetbrains text-hero-subtitle">
					A melhor maneira de aprender é praticando!
				</p>
				<Link
					className="border-main-green text-hero-subtitle px-section-btn-x py-section-btn-y lg:hover:bg-main-green z-20 rounded-md border-2 bg-white/5 duration-300 lg:transition-all lg:hover:border-black lg:hover:text-black"
					to="/learning-path"
				>
					Vamos lá!
				</Link>
			</div>
		</div>
	);
}
