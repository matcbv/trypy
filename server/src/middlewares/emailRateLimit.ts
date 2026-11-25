import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

interface emailRateLimitProps {
	timer: number;
	rateLimitAction: string;
}

export function emailRateLimit({
	timer,
	rateLimitAction,
}: emailRateLimitProps) {
	return rateLimit({
		windowMs: timer,
		limit: 1,
		keyGenerator: (req, res) => {
			const identity = res.locals.uid
				? `user:${res.locals.uid}`
				: `ip:${ipKeyGenerator(req.ip!)}`;

			return `${rateLimitAction}:${identity}`;
		},
		message: {
			error: 'Limite de envio de e-mails atingido. Tente novamente mais tarde.',
		},
	});
}
