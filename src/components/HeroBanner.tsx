import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function HeroBanner() {
	const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

	const code = `
		class Student:
			def __init__(self, name):
				self.name = name
				self.knowledge = []

			def study(self, topic):
				for lesson in topic:
					self.learn(lesson)

			def learn(self, lesson):
				self.knowledge.append(lesson)

			@property
			def progress(self):
				return "One step closer..."
	`;

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
		<div className="relative flex h-[650px] w-full items-center justify-between overflow-hidden px-50">
			<div
				className="absolute inset-0 z-10"
				onMouseMove={(e) =>
					setPointerPosition({
						x: e.nativeEvent.offsetX,
						y: e.nativeEvent.offsetY,
					})
				}
				style={{
					backgroundImage: `radial-gradient(circle 1200px at ${pointerPosition.x}px ${pointerPosition.y}px, color-mix(in srgb, var(--color-main-purple) 5%, transparent) 0%, transparent 70%)`,
				}}
			/>
			<div className="flex w-fit flex-col items-start gap-y-7">
				<h1 className="font-jetbrains text-main-green text-9xl">try</h1>
				<p className="font-jetbrains text-xl">
					A melhor maneira de aprender é praticando!
				</p>
				<Link
					className="border-main-green hover:bg-main-green z-20 flex h-[70px] w-[200px] cursor-pointer items-center justify-center rounded-md border-2 text-xl text-white transition-colors duration-300 hover:border-black hover:text-black"
					to="/learning-path"
				>
					Vamos lá!
				</Link>
			</div>
			<pre className="font-jetbrains text-main-green/4 absolute top-0 right-0 text-5xl blur-[2px] select-none">
				{code}
			</pre>
		</div>
	);
}
