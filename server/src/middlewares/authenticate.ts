import { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../firebaseAdmin.js';

export async function authenticate(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authorization = req.headers.authorization;
	const token = authorization?.startsWith('Bearer ')
		? authorization.slice(7)
		: undefined;

	if (!token) {
		res.status(401).json({
			error: 'Não foi possível confirmar sua sessão. Tente novamente.',
		});
		return;
	}

	try {
		const decodedToken = await adminAuth.verifyIdToken(token);
		res.locals.uid = decodedToken.uid;
		next();
	} catch {
		res.status(401).json({
			error: 'Não foi possível confirmar sua sessão. Tente novamente.',
		});
	}
}
