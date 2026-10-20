import { useEffect, useRef } from 'react';
import { startSnakeLoader, type SnakePalette } from '../lib/snakeEngine';

export interface SnakeLoaderProps {
	/** classes do <canvas>; ele precisa ser quadrado (aspect-square) */
	className?: string;
	/** texto para leitores de tela; use null se o texto já estiver em outro lugar */
	label?: string | null;
	/** segundos por volta completa (padrão 5.5) */
	lapSeconds?: number;
	/** listra clara na lateral do corpo (padrão true) */
	stripe?: boolean;
	/** troca de cores pontuais */
	palette?: Partial<SnakePalette>;
}

/** Cobra da TryPy rastejando em círculos, com a língua saindo e entrando. */
export function SnakeLoader({
	className = 'aspect-square size-snake',
	label = 'Carregando…',
	lapSeconds,
	stripe,
	palette,
}: SnakeLoaderProps) {
	const ref = useRef<HTMLCanvasElement>(null);
	const paletteKey = JSON.stringify(palette ?? {});

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const handle = startSnakeLoader(canvas, {
			lapSeconds,
			stripe,
			palette: JSON.parse(paletteKey) as Partial<SnakePalette>,
		});
		return handle.stop;
	}, [lapSeconds, stripe, paletteKey]);

	return label === null ? (
		<canvas ref={ref} aria-hidden="true" className={className} />
	) : (
		<canvas ref={ref} role="img" aria-label={label} className={className} />
	);
}
