import { Outlet } from 'react-router-dom';
import initialState from './initialState';
import { useEffect, useRef, useState } from 'react';
import type { TerminalState } from '../../types/states';
import { TerminalContext } from './context';

interface WorkerResponse {
	type: 'stdout' | 'stderr' | 'status' | 'error';
	status?: TerminalState['status'];
	data?: string;
}

export function TerminalProvier() {
	const [terminalState, setTerminalState] =
		useState<TerminalState>(initialState);
	const workerRef = useRef<Worker | null>(null);

	useEffect(() => {
		const worker = createWorker();

		workerRef.current = worker;

		return () => {
			worker.terminate();
		};
	}, []);

	function createWorker() {
		const worker = new Worker(
			new URL('../../workers/pyodide.worker.ts', import.meta.url),
			{ type: 'module' },
		);

		worker.postMessage({ type: 'init' });

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const { type, status, data } = event.data;

			switch (type) {
				case 'status': {
					setTerminalState((prev) => ({ ...prev, status: status! }));
					break;
				}
				case 'stdout': {
					setTerminalState((prev) => ({
						...prev,
						output: prev.output ? prev.output + '\n' + data! : data!,
					}));
					break;
				}
				case 'stderr': {
					setTerminalState((prev) => ({
						...prev,
						output: prev.output ? prev.output + '\n' + data! : data!,
					}));
					break;
				}
				case 'error': {
					const errorLines = data!.trim().split('\n');
					const filteredError = errorLines[errorLines.length - 1];
					setTerminalState((prev) => ({ ...prev, error: filteredError! }));
					break;
				}
			}
		};

		return worker;
	}

	function runCode(code: string) {
		if (!workerRef.current || !code) return;
		setTerminalState((prev) => ({ ...prev, output: null, error: null }));
		setTerminalState((prev) => ({ ...prev, status: 'running' }));
		workerRef.current.postMessage({ type: 'run', code });
	}

	function stopCodeExecution() {
		if (!workerRef.current) return;

		workerRef.current.terminate();

		const worker = createWorker();
		workerRef.current = worker;

		setTerminalState((prev) => ({
			...prev,
			output: null,
			error: null,
		}));
	}

	return (
		<TerminalContext
			value={{ terminalState, setTerminalState, runCode, stopCodeExecution }}
		>
			<Outlet />
		</TerminalContext>
	);
}
