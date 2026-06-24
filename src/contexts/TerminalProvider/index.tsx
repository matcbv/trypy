import { Outlet } from 'react-router-dom';
import initialState from './initialState';
import { useEffect, useRef, useState } from 'react';
import type { TerminalState } from '../../types/states';
import { TerminalContext } from './context';
import type { WorkerRequest, WorkerResponse } from '../../types/workers';
import type { RunCodeParams } from '../../types/contexts';

// * Wrapper aplicando tipagem para a mensagem de requisição do worker.
const postMessageWrapper = (worker: Worker, message: WorkerRequest) =>
	worker.postMessage(message);

export function TerminalProvier() {
	const [terminalState, setTerminalState] =
		useState<TerminalState>(initialState);
	const workerRef = useRef<Worker | null>(null);
	const expectedOutputRef = useRef<string | null>(null);
	const outputBufferRef = useRef<string>('');

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

		postMessageWrapper(worker, { type: 'init' });

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const { type, status, data, error } = event.data;

			switch (type) {
				case 'status': {
					let solved = false;

					if (status === 'success') {
						solved = expectedOutputRef.current
							? expectedOutputRef.current.trim() ===
								outputBufferRef.current.trim()
							: true;

						if (solved) {
							setTerminalState((prev) => ({ ...prev, solved }));
						}
					}

					setTerminalState((prev) => ({ ...prev, status: status! }));

					break;
				}
				case 'stdout': {
					outputBufferRef.current = outputBufferRef.current
						? outputBufferRef.current + '\n' + data!
						: data!;

					setTerminalState((prev) => ({
						...prev,
						output: prev.output ? prev.output + '\n' + data! : data!,
					}));
					break;
				}
				case 'stderr': {
					setTerminalState((prev) => ({
						...prev,
						output: prev.output ? prev.output + '\n' + error! : error!,
						solved: false,
					}));
					break;
				}
				case 'error': {
					const errorLines = error!.trim().split('\n');
					const filteredError = errorLines[errorLines.length - 1];
					setTerminalState((prev) => ({
						...prev,
						error: filteredError!,
						solved: false,
					}));
					break;
				}
			}
		};

		return worker;
	}

	// * Função responsável por rodar o código do usuário.
	function runCode({ userCode, testCode, expectedOutput }: RunCodeParams) {
		if (!workerRef.current || !userCode) return;
		setTerminalState((prev) => ({ ...prev, output: null, error: null }));
		setTerminalState((prev) => ({ ...prev, status: 'running' }));
		expectedOutputRef.current = expectedOutput;
		outputBufferRef.current = '';
		postMessageWrapper(workerRef.current, {
			type: 'run',
			userCode,
			testCode: testCode!,
		});
	}

	// * Função responsável por encerrar e recriar worker, parando a execução do código.
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
