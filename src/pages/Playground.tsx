import { useSafeContext } from '../hooks/useSafeContext';
import { TerminalContext } from '../contexts/TerminalProvider/context';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { catppuccinFrappe } from '@catppuccin/codemirror';
import { LoadingPage } from '../pages/LoadingPage';

export function Playground() {
	const { terminalState, runCode, stopCodeExecution } =
		useSafeContext(TerminalContext);
	const [userCode, setUserCode] = useState<string>('');
	const containerRef = useRef<HTMLDivElement>(null);
	const [outputWidth, setOutputWidth] = useState(0);
	const [outputHeight, setOutputHeight] = useState(0);
	const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(min-width: 1024px)');
		const handleResize = () => {
			setOutputWidth(mediaQuery.matches ? 33.3 : 100);
			setOutputHeight(mediaQuery.matches ? 100 : 33.3);
			setIsDesktop(mediaQuery.matches);
		};

		handleResize();
		mediaQuery.addEventListener('change', handleResize);

		return () => mediaQuery.removeEventListener('change', handleResize);
	}, []);

	const handlePointerDown = (e: PointerEvent<HTMLImageElement>) => {
		e.preventDefault();

		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: PointerEvent<HTMLImageElement>) => {
		if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

		const container = containerRef.current;

		if (!container) return;

		const { right, width, bottom, height } = container.getBoundingClientRect();

		const newWidth = ((right - e.clientX) / width) * 100;
		const newHeight = ((bottom - e.clientY) / height) * 100;

		if (isDesktop) {
			setOutputWidth(Math.min(Math.max(newWidth, 20), 80));
		} else {
			setOutputHeight(Math.min(Math.max(newHeight, 20), 80));
		}
	};

	const handlePointerUp = (e: PointerEvent<HTMLImageElement>) => {
		e.currentTarget.releasePointerCapture(e.pointerId);
	};

	const statusIcon = () => {
		if (!terminalState.output && !terminalState.error) return;

		if (terminalState.status === 'running') {
			return (
				<img
					src={`/assets/images/loading.png`}
					alt="Executando"
					className="w-5"
				/>
			);
		}

		return (
			<img
				src={`/assets/images/icons/${terminalState.error ? 'warning' : 'success'}.png`}
				alt={`${terminalState.error ? 'Falha' : 'Sucesso'}`}
				className="w-5"
			/>
		);
	};

	return (
		<div className="mx-[10px] my-30 flex h-screen flex-col lg:mx-15">
			<div className="mb-3">
				<div className="flex gap-x-5">
					<button
						onClick={() =>
							runCode({
								userCode,
								testCode: null,
								expectedOutput: null,
							})
						}
						className="lg:hover:bg-glow-green/20 border-main-green/80 flex items-center gap-x-1 rounded-md border bg-white/10 px-4 py-2 lg:cursor-pointer lg:transition-colors lg:duration-300"
					>
						Executar
						<img
							src="/assets/images/icons/run.png"
							alt="Executar código"
							className="w-5"
						/>
					</button>
					<button
						onClick={stopCodeExecution}
						className="lg:hover:bg-main-red/20 border-main-red/50 flex items-center gap-x-1 rounded-md border bg-white/10 px-4 py-2 lg:cursor-pointer lg:transition-colors lg:duration-300"
					>
						Interromper
						<img
							src="/assets/images/icons/stop.png"
							alt="Interromper código"
							className="w-5"
						/>
					</button>
				</div>
			</div>
			<div
				ref={containerRef}
				className="relative flex h-full flex-col gap-y-2 lg:flex-row lg:gap-x-2"
			>
				<div className="relative flex-1 overflow-hidden">
					{terminalState.status === 'loading' ? (
						<LoadingPage />
					) : (
						<CodeMirror
							value={userCode}
							extensions={[python(), EditorView.lineWrapping]}
							theme={catppuccinFrappe}
							height="100%"
							className="h-full overflow-hidden rounded-t-md text-sm lg:rounded-t-none lg:rounded-l-md [&_.cm-scroller]:scrollbar-none"
							onChange={(value) => setUserCode(value)}
						></CodeMirror>
					)}
				</div>
				<div
					className="relative h-[2px] overflow-visible rounded-full bg-gray-500 lg:h-full lg:w-[2px]"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onDoubleClick={() =>
						isDesktop ? setOutputWidth(33.3) : setOutputHeight(33.3)
					}
				>
					<img
						src={`/assets/images/icons/resize-${isDesktop ? 'width' : 'height'}.png`}
						alt="Redimensionar"
						className="absolute top-1/2 left-1/2 w-8 max-w-none -translate-x-1/2 -translate-y-1/2 touch-none lg:cursor-pointer"
					/>
				</div>
				<div
					className="bg-terminal-background customScrollbar flex flex-col overflow-auto rounded-b-md lg:h-full lg:rounded-r-md lg:rounded-bl-none"
					style={{ width: `${outputWidth}%`, height: `${outputHeight}%` }}
				>
					<div className="border-main-purple font-jetbrains flex items-center gap-x-2 border-b px-5 py-2 text-sm">
						Saída:
						{statusIcon()}
					</div>
					<div className="flex-1 px-5 py-2">
						<code className="text-sm whitespace-pre-wrap">
							{terminalState.error || terminalState.output}
						</code>
					</div>
				</div>
			</div>
		</div>
	);
}
