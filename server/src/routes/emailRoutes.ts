import { Request, Response, Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { adminAuth } from '../firebaseAdmin.js';
import { resend } from '../services/email/resender.js';
import { render } from '@react-email/render';
import VerificationEmail from '../templates/verificationEmail.js';
import ResetPasswordEmail from '../templates/resetPasswordEmail.js';
import { createElement } from 'react';
import { FirebaseAuthError } from 'firebase-admin/auth';
import { logResendError } from '../utils/logResendError.js';
import { EMAIL_REGEX } from '../constants/validationRegex.js';

type VerifyEmailBody = {
	email: string;
};

const router = Router();

router.post(
	'/verification',
	authenticate,
	// verificationLimiter, // rate limit por uid, depois do authenticate
	async (_req, res) => {
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

			const { error: resendError } = await resend.emails.send({
				from: 'TryPy <noreply@trypy.dev>',
				to: user.email,
				subject: 'Verifique seu e-mail',
				html,
			});

			if (resendError) {
				logResendError('verification', resendError);

				res.status(500).json({
					error: 'Não foi possível enviar o e-mail de verificação.',
				});
				return;
			}

			res.sendStatus(204);
		} catch (error) {
			console.error('[verification] falha ao gerar o link', error);

			res.status(500).json({
				error: 'Não foi possível gerar o link de verificação.',
			});
		}
	},
);

router.post(
	'/reset-password',
	async (
		req: Request<Record<string, never>, unknown, VerifyEmailBody>,
		res: Response,
	) => {
		try {
			const { email } = req.body;

			if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
				res.sendStatus(400);
				return;
			}

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

			const { error: resendError } = await resend.emails.send({
				from: 'TryPy <noreply@trypy.dev>',
				to: email,
				subject: 'Redefina sua senha',
				html,
			});

			if (resendError) logResendError('reset-password', resendError);
		} catch (error) {
			const isUserNotFound =
				error instanceof FirebaseAuthError &&
				error.code === 'auth/user-not-found';

			if (!isUserNotFound) {
				console.error('[reset-password] falha ao processar pedido', error);
			}
		}

		res.sendStatus(204);
	},
);

export default router;
