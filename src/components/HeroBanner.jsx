import { useEffect } from 'react';
import { idGenerator } from '../utils/idGenerator';

export function HeroBanner() {
	useEffect(() => {
		const heading = document.querySelector('h1');
		heading.innerText = 'try';
		const ext = '.py'.split('');

		const timerList = ext.map((i, index) => {
			const timerId = setTimeout(
				() => {
					heading.innerText += i;
				},
				500 * (index + 1),
			);
			return timerId;
		});

		return () => {
			for (const timer of timerList) {
				clearTimeout(timer);
			}
		};
	}, []);

	return (
		<div className="relative flex h-[650px] w-full max-w-[1600px] items-center justify-between px-10">
			<div className="z-20 flex w-fit flex-col items-start gap-y-6">
				<h1 className="font-jetbrains text-9xl text-[var(--main-green)]">
					try
				</h1>
				<p className="font-jetbrains text-xl">
					A melhor maneira de aprender é praticando!
				</p>
				<button
					className="cursor-pointer rounded-md border-2 border-[var(--main-green)] bg-transparent px-8 py-4 text-xl text-white transition-colors hover:bg-green-600/10"
					type="button"
					onClick={() => {}}
				>
					Vamos lá!
				</button>
			</div>
			<img
				className="absolute right-20 z-10 -mb-30 blur-xs"
				src="/assets/images/code.png"
				alt="Exemplo de código"
				draggable={false}
			/>
		</div>
	);
}
