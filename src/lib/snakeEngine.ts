/**
 * Snake loader
 *
 * Sem dependências. Desenha num <canvas> 2D com requestAnimationFrame.
 * Uso:
 *   const loader = startSnakeLoader(canvas);
 *   loader.stop(); // ao desmontar
 */

export interface SnakePalette {
	/** sombra projetada embaixo do corpo */
	shadow: string;
	/** borda escura do corpo */
	edge: string;
	/** cor principal do corpo */
	body: string;
	/** miolo mais claro do corpo (dá volume) */
	core: string;
	/** listra clara na lateral interna */
	stripe: string;
	/** língua */
	tongue: string;
	/** branco do olho */
	eye: string;
	/** contorno do olho */
	eyeRim: string;
}

export interface SnakeLoaderOptions {
	/** segundos para dar uma volta completa. Padrão: 5.5 */
	lapSeconds?: number | undefined;
	/** mostra a listra clara da lateral do corpo. Padrão: true */
	stripe?: boolean | undefined;
	/** movimento reduzido: mais lento e sem ondulação extra. Padrão: lê prefers-reduced-motion */
	reducedMotion?: boolean | undefined;
	/** limite do devicePixelRatio, para poupar GPU em telas muito densas. Padrão: 2 */
	maxDpr?: number | undefined;
	palette?: Partial<SnakePalette> | undefined;
}

export interface SnakeLoaderHandle {
	stop: () => void;
}

export const DEFAULT_PALETTE: SnakePalette = {
	shadow: '#001810',
	edge: '#00301c',
	body: '#003820',
	core: '#00402a',
	stripe: '#4dab7c',
	tongue: '#ff0a14',
	eye: '#f6fff9',
	eyeRim: '#000000',
};

const TAU = Math.PI * 2;
const SEGMENTS = 150; // pontos ao longo da espinha
const SPAN = 5.15; // comprimento do corpo em radianos (~295°), deixa uma folga entre cabeça e cauda

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const smooth = (a: number, b: number, v: number): number => {
	const t = clamp01((v - a) / (b - a));
	return t * t * (3 - 2 * t);
};

const easeOutBack = (x: number): number => {
	const c1 = 1.5;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const easeInOut = (x: number): number => x * x * (3 - 2 * x);

/** Largura total do corpo (em frações do lado do canvas) para u = 0 (pescoço) .. 1 (ponta da cauda). */
function bodyWidth(u: number): number {
	const neck = 0.057;
	const belly = 0.078;
	const rise = neck + (belly - neck) * smooth(0.02, 0.3, u);
	const taper = Math.pow(1 - smooth(0.56, 1.0, u), 0.92);
	return Math.max(0.0006, rise * taper);
}

/** Quanto a língua está para fora (0..~1.1) e o quanto balança. Ciclo de 1.7 s com duas lambidas. */
function tongueState(t: number): { ext: number; sway: number } {
	const period = 1.7;
	const ph = t % period;
	let ext = 0;
	if (ph < 0.12) {
		ext = Math.max(0, easeOutBack(ph / 0.12));
	} else if (ph < 0.62) {
		// o tremor entra e sai suavemente, para o comprimento nunca dar salto
		ext =
			1 +
			0.045 *
				Math.sin(ph * 46) *
				smooth(0.12, 0.22, ph) *
				(1 - smooth(0.52, 0.62, ph));
	} else if (ph < 0.76) {
		ext = 1 - easeInOut((ph - 0.62) / 0.14);
	} else if (ph >= 0.9 && ph < 0.98) {
		ext = 0.85 * easeInOut((ph - 0.9) / 0.08);
	} else if (ph >= 0.98 && ph < 1.14) {
		ext = 0.85 * (1 - easeInOut((ph - 0.98) / 0.16));
	}
	const sway = Math.sin(t * 27) * 0.55 + Math.sin(t * 11.3) * 0.3;
	return { ext, sway };
}

export function startSnakeLoader(
	canvas: HTMLCanvasElement,
	options: SnakeLoaderOptions = {},
): SnakeLoaderHandle {
	const ctx = canvas.getContext('2d');
	if (!ctx) return { stop: () => undefined };

	const palette: SnakePalette = { ...DEFAULT_PALETTE, ...options.palette };
	const lapSeconds = options.lapSeconds ?? 5.5;
	const showStripe = options.stripe ?? true;
	const maxDpr = options.maxDpr ?? 2;
	const reduced =
		options.reducedMotion ??
		(typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches);
	const speed = reduced ? 0.45 : 1;
	const morph = reduced ? 0.4 : 1;

	// ---- geometria reutilizada a cada frame (sem alocar) -------------------
	const n = SEGMENTS + 1;
	const sx = new Float64Array(n); // espinha
	const sy = new Float64Array(n);
	const nx = new Float64Array(n); // normal (lado direito de quem anda)
	const ny = new Float64Array(n);
	const hw = new Float64Array(n); // meia-largura em px
	const stripeProfile = new Float64Array(n);
	for (let i = 0; i < n; i++) {
		const u = i / SEGMENTS;
		stripeProfile[i] = smooth(0.05, 0.24, u) * (1 - smooth(0.55, 0.96, u));
	}
	const qx = new Float64Array(n * 2);
	const qy = new Float64Array(n * 2);

	// cabeça, em coordenadas locais (+x = frente, +y = direita), unidade = escala da cabeça
	const headPath = new Path2D();
	headPath.moveTo(-0.62, -0.26);
	headPath.bezierCurveTo(-0.45, -0.3, -0.3, -0.52, 0.02, -0.56);
	headPath.bezierCurveTo(0.4, -0.58, 0.82, -0.36, 1.0, -0.1);
	headPath.bezierCurveTo(1.06, -0.04, 1.06, 0.04, 1.0, 0.1);
	headPath.bezierCurveTo(0.82, 0.36, 0.4, 0.58, 0.02, 0.56);
	headPath.bezierCurveTo(-0.3, 0.52, -0.45, 0.3, -0.62, 0.26);
	headPath.closePath();

	// olho no estilo da logo: losango preto de pontas finas + brilho em gota (coordenadas do olho direito)
	const eyePath = new Path2D();
	eyePath.moveTo(-0.15, 0);
	eyePath.quadraticCurveTo(0, -0.12, 0.15, 0);
	eyePath.quadraticCurveTo(0, 0.12, -0.15, 0);
	eyePath.closePath();
	const glintPath = new Path2D();
	glintPath.moveTo(-0.01, -0.047);
	glintPath.bezierCurveTo(-0.045, -0.02, -0.03, 0.03, 0.005, 0.04);
	glintPath.bezierCurveTo(0.035, 0.045, 0.05, 0.01, 0.03, -0.012);
	glintPath.bezierCurveTo(0.02, -0.03, 0.005, -0.04, -0.01, -0.047);
	glintPath.closePath();

	let width = 0;
	let height = 0;

	function resize(): void {
		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
		const w = Math.max(1, Math.round(rect.width * dpr));
		const h = Math.max(1, Math.round(rect.height * dpr));
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
		}
		width = w;
		height = h;
	}

	/** Preenche qx/qy com o contorno de uma faixa ao longo da espinha e traça uma curva fechada suave. */
	function ribbon(
		extentScale: number,
		lateral: number,
		offX: number,
		offY: number,
		stripeMode: boolean,
	): void {
		let m = 0;
		for (let i = 0; i < n; i++) {
			const h = hw[i] as number;
			const ext = stripeMode
				? h * 0.14 * (stripeProfile[i] as number)
				: h * extentScale;
			const lat = h * lateral;
			qx[m] = (sx[i] as number) + (nx[i] as number) * (lat - ext) + offX;
			qy[m] = (sy[i] as number) + (ny[i] as number) * (lat - ext) + offY;
			m++;
		}
		for (let i = n - 1; i >= 0; i--) {
			const h = hw[i] as number;
			const ext = stripeMode
				? h * 0.14 * (stripeProfile[i] as number)
				: h * extentScale;
			const lat = h * lateral;
			qx[m] = (sx[i] as number) + (nx[i] as number) * (lat + ext) + offX;
			qy[m] = (sy[i] as number) + (ny[i] as number) * (lat + ext) + offY;
			m++;
		}
		ctx!.beginPath();
		ctx!.moveTo(
			((qx[m - 1] as number) + (qx[0] as number)) / 2,
			((qy[m - 1] as number) + (qy[0] as number)) / 2,
		);
		for (let k = 0; k < m; k++) {
			const next = (k + 1) % m;
			ctx!.quadraticCurveTo(
				qx[k] as number,
				qy[k] as number,
				((qx[k] as number) + (qx[next] as number)) / 2,
				((qy[k] as number) + (qy[next] as number)) / 2,
			);
		}
		ctx!.closePath();
	}

	function draw(t: number): void {
		const c = ctx!;
		c.clearRect(0, 0, width, height);

		const S = Math.min(width, height);
		const cx = width / 2;
		const cy = height / 2;
		const R = 0.295 * S;
		const omega = TAU / lapSeconds;
		const thetaHead = -1.05 + omega * t;

		// ondulação da trilha: muda devagar, então o corpo "escorrega" por ondas que nunca param no mesmo lugar
		const a1 = (0.058 + 0.014 * Math.sin(t * 0.7)) * morph;
		const a2 = (0.022 + 0.007 * Math.sin(t * 1.1 + 1)) * morph;
		const a3 = (0.025 + 0.009 * Math.sin(t * 0.45 + 2)) * morph;
		const ph1 = omega * t * 0.25;
		const ph2 = -omega * t * 0.2 + 1.3;
		const ph3 = omega * t * 0.12 + 0.7;
		const whipAmp = 0.019 * S * morph;

		for (let i = 0; i < n; i++) {
			const u = i / SEGMENTS;
			const theta = thetaHead - u * SPAN;
			const r =
				R *
					(1 +
						a1 * Math.sin(3 * (theta - ph1) + 0.4) +
						a2 * Math.sin(5 * (theta - ph2) + 2.0) +
						a3 * Math.sin(2 * (theta - ph3) + 4.1)) +
				whipAmp *
					Math.pow(smooth(0.1, 0.9, u), 1.4) *
					Math.sin(u * TAU * 1.4 - t * (TAU / 1.6));
			sx[i] = cx + r * Math.cos(theta);
			sy[i] = cy + r * Math.sin(theta);
			hw[i] = 0.5 * bodyWidth(u) * S;
		}
		for (let i = 0; i < n; i++) {
			// tangente apontando para a frente (da cauda para a cabeça)
			const a = Math.max(0, i - 1);
			const b = Math.min(n - 1, i + 1);
			let tx = (sx[a] as number) - (sx[b] as number);
			let ty = (sy[a] as number) - (sy[b] as number);
			const len = Math.hypot(tx, ty) || 1;
			tx /= len;
			ty /= len;
			nx[i] = -ty;
			ny[i] = tx;
		}

		// ---- cabeça: posição e direção ---------------------------------------
		const hx = sx[0] as number;
		const hy = sy[0] as number;
		const headAngle =
			Math.atan2(
				(sy[0] as number) - (sy[2] as number),
				(sx[0] as number) - (sx[2] as number),
			) +
			Math.sin(t * 2.3) * 0.05 * morph;
		const H = 0.1 * S;

		const place = (dx: number, dy: number): void => {
			c.setTransform(1, 0, 0, 1, 0, 0);
			c.translate(hx + dx, hy + dy);
			c.rotate(headAngle);
			c.scale(H, H);
		};
		const headLayer = (k: number, color: string): void => {
			c.save();
			place(0, 0);
			c.translate(0.15, 0);
			c.scale(k, k);
			c.translate(-0.15, 0);
			c.fillStyle = color;
			c.fill(headPath);
			c.restore();
		};

		// 1) sombras (corpo + cabeça)
		c.fillStyle = palette.shadow;
		ribbon(1, 0, 0.005 * S, 0.011 * S, false);
		c.fill();
		c.save();
		place(0.005 * S, 0.011 * S);
		c.fillStyle = palette.shadow;
		c.fill(headPath);
		c.restore();

		// 2) língua, por baixo da cabeça
		const tg = tongueState(t);
		if (tg.ext > 0.01) {
			c.save();
			place(0, 0);
			const e = tg.ext;
			const sway = tg.sway * e;
			const baseX = 0.96;
			const stemLen = 0.56 * e;
			const forkLen = 0.4 * e;
			const endX = baseX + stemLen;
			const endY = sway * 0.07;
			const spread = 0.18 + 0.32 * Math.min(1, e);
			c.strokeStyle = palette.tongue;
			c.lineCap = 'round';
			c.lineJoin = 'round';
			c.lineWidth = 0.05;
			c.beginPath();
			c.moveTo(baseX, 0);
			c.quadraticCurveTo(baseX + stemLen * 0.5, sway * 0.025, endX, endY);
			c.stroke();
			c.lineWidth = 0.04;
			for (const side of [-1, 1]) {
				const ang = side * spread + sway * 0.28;
				c.beginPath();
				c.moveTo(endX, endY);
				c.lineTo(
					endX + Math.cos(ang) * forkLen,
					endY + Math.sin(ang) * forkLen,
				);
				c.stroke();
			}
			c.restore();
		}

		// 3) camadas de cor, sempre corpo + cabeça juntos para não aparecer emenda no pescoço
		c.fillStyle = palette.edge;
		ribbon(1, 0, 0, 0, false);
		c.fill();
		headLayer(1, palette.edge);

		c.fillStyle = palette.body;
		ribbon(0.86, 0, 0, 0, false);
		c.fill();
		headLayer(0.9, palette.body);

		c.fillStyle = palette.core;
		ribbon(0.52, -0.1, 0, 0, false);
		c.fill();
		headLayer(0.52, palette.core);

		if (showStripe) {
			c.fillStyle = palette.stripe;
			ribbon(1, 0.6, 0, 0, true);
			c.fill();
		}

		// 4) narinas e olhos
		c.save();
		place(0, 0);
		c.fillStyle = palette.eyeRim;
		for (const side of [-1, 1]) {
			c.beginPath();
			c.arc(0.88, side * 0.075, 0.016, 0, TAU);
			c.fill();
		}
		// olhos como na logo (preto, pontas finas, brilho em gota), vistos de cima:
		// um de cada lado da cabeça, com a ponta da frente apontando para o centro
		for (const side of [-1, 1]) {
			c.save();
			c.translate(0.42, side * 0.3);
			c.scale(1, side);
			c.rotate(-0.38);
			c.scale(0.98, 0.98);
			c.fillStyle = palette.eyeRim;
			c.fill(eyePath);
			c.translate(0.026, -0.012);
			c.fillStyle = palette.eye;
			c.fill(glintPath);
			c.restore();
		}
		c.restore();
	}

	// ---- loop ---------------------------------------------------------------
	resize();
	const ro =
		typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
	ro?.observe(canvas);

	let raf = 0;
	let running = true;
	let t = 0;
	let last = performance.now();

	const frame = (now: number): void => {
		if (!running) return;
		// limita o salto de tempo (aba em segundo plano, travadas) para a cobra nunca "teleportar"
		const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
		last = now;
		t += dt * speed;
		draw(t);
		raf = requestAnimationFrame(frame);
	};
	draw(0);
	raf = requestAnimationFrame(frame);

	return {
		stop: () => {
			running = false;
			cancelAnimationFrame(raf);
			ro?.disconnect();
		},
	};
}
