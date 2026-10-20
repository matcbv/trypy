import { Request, Response, Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { adminAuth } from '../firebaseAdmin.js';
import { resend } from '../services/email/resender.js';
import { render } from '@react-email/render';
import VerificationEmail from '../templates/verificationEmail.js';
import ResetPasswordEmail from '../templates/resetPasswordEmail.js';
import { createElement } from 'react';

type VerifyEmailBody = {
	email: string;
};

const router = Router();

router.post('/verification', authenticate, async (_req, res) => {
	try {
		const uid = res.locals.uid as string;

		const user = await adminAuth.getUser(uid);

		if (!user.email) {
			res.status(400).json({
				error:
					'Não foi possível obter o e-mail da sua conta. Verifique as configurações da sua conta ou entre em contato conosco.',
			});
			return;
		}

		if (user.emailVerified) {
			res.status(400).json({
				error: 'O e-mail já foi verificado.',
			});
			return;
		}

		const verificationUrl = await adminAuth.generateEmailVerificationLink(
			user.email,
		);

		const html = await render(
			createElement(VerificationEmail, {
				name: user.displayName || 'Aluno',
				verificationUrl,
			}),
		);

		await resend.emails.send({
			from: 'TryPy <noreply@trypy.dev>',
			to: user.email,
			subject: 'Verifique seu e-mail',
			html,
		});

		res.sendStatus(204);
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error(error);
		}

		res.status(500).json({
			error: 'Não foi possível gerar o link de verificação.',
		});
	}
});

router.post(
	'/reset-password',
	async (
		req: Request<Record<string, never>, unknown, VerifyEmailBody>,
		res: Response,
	) => {
		try {
			const { email } = req.body;

			const resetPasswordUrl = await adminAuth.generatePasswordResetLink(email);
			const firebaseUrl = new URL(resetPasswordUrl);
			const code = firebaseUrl.searchParams.get('oobCode');

			if (!code) {
				throw new Error('Código de redefinição não encontrado.');
			}

			const customResetPasswordUrl = new URL(
				'/new-password',
				process.env.FRONTEND_URL,
			);

			customResetPasswordUrl.searchParams.set('oobCode', code);

			const html = await render(
				createElement(ResetPasswordEmail, {
					customResetPasswordUrl: customResetPasswordUrl.toString(),
				}),
			);

			await resend.emails.send({
				from: 'TryPy <noreply@trypy.dev>',
				to: email,
				subject: 'Redefina sua senha',
				html,
			});

			res.sendStatus(204);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error(error);
			}

			res.status(500).json({
				error: 'Não foi possível gerar o link de redefinição.',
			});
		}
	},
);

export default router;
