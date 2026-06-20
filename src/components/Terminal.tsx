import { useSafeContext } from '../hooks/useSafeContext';
import { TerminalContext } from '../contexts/TerminalProvider/context';
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { LoadingPage } from '../pages/LoadingPage';

export function Terminal() {
	const { terminalState, runCode, stopCodeExecution } =
		useSafeContext(TerminalContext);
	const [code, setCode] = useState('');

	const statusIcon = () => {
		if (!terminalState.output && !terminalState.error) return;

		if (terminalState.status === 'running') {
			return (
				<img
					src={`/assets/images/loading.png`}
					alt="Status"
					className="w-[20px]"
				/>
			);
		}

		return (
			<img
				src={`/assets/images/icons/${terminalState.output ? 'success' : 'warning'}.png`}
				alt="Status"
				className="w-[20px]"
			/>
		);
	};

	return (
		<div className="flex flex-col gap-y-5">
			<div className="flex w-full flex-col gap-y-1">
				<div className="relative h-[400px]">
					{terminalState.status === 'loading' ? (
						<LoadingPage />
					) : (
						<CodeMirror
							value={code}
							extensions={[python()]}
							theme={oneDark}
							height="400px"
							className="overflow-hidden rounded-t-md"
							onChange={(value) => setCode(value)}
						></CodeMirror>
					)}
				</div>

				<div className="h-[200px] scrollbar-none overflow-scroll rounded-b-md bg-[#2a313d]">
					<div className="border-main-purple font-jetbrains flex items-center gap-x-2 border-b px-5 py-2 text-sm">
						Resultado:
						{statusIcon()}
					</div>
					<code className="p-5 text-sm">
						{terminalState.output || terminalState.error}
					</code>
				</div>
			</div>
			<div className="flex gap-x-10">
				<button
					type="button"
					className="border-main-green/60 hover:bg-main-green/20 w-[150px] cursor-pointer rounded-md border bg-white/5 py-3 text-sm tracking-wide text-white transition-colors duration-300"
					onClick={() => runCode(code)}
				>
					Executar código
				</button>
				<button
					type="button"
					className="border-main-red/60 hover:bg-main-red/20 w-[150px] cursor-pointer rounded-md border bg-white/5 py-3 text-sm tracking-wide transition-colors duration-300"
					onClick={stopCodeExecution}
				>
					Interromper
				</button>
			</div>
		</div>
	);
}
