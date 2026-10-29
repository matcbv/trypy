import { Router } from 'express';
import { adminAuth, adminDb, storage } from '../firebaseAdmin.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.patch('/restore-email-verification', authenticate, async (_req, res) => {
	const uid = res.locals.uid as string;

	try {
		const user = await adminAuth.getUser(uid);

		const hasPassword = user.providerData.some(
			(provider) => provider.providerId === 'password',
		);

		if (hasPassword) {
			res.status(409).json({
				error: 'A vinculação de e-mail e senha ainda está ativa.',
			});
			return;
		}

		await adminAuth.updateUser(uid, {
			emailVerified: true,
		});

		res.sendStatus(204);
	} catch (error) {
		console.error(
			'[restore-email-verification] falha ao restaurar estado de verificação do e-mail',
			error,
		);

		res.sendStatus(500);
	}
});

router.delete('/', authenticate, async (_req, res) => {
	const uid = res.locals.uid as string;

	try {
		const batch = adminDb.batch();
		batch.delete(adminDb.doc(`users/${uid}`));
		batch.delete(adminDb.doc(`userProgress/${uid}`));
		batch.delete(adminDb.doc(`userNavigation/${uid}`));
		await batch.commit();

		const fileRef = storage.bucket().file(`pictures/${uid}`);
		const [exists] = await fileRef.exists();
		if (exists) await fileRef.delete();

		await adminAuth.deleteUser(uid);

		res.sendStatus(204);
	} catch (error) {
		console.error('[delete] falha excluir conta', error);

		res.status(500).json({
			error: 'Não foi possível excluir a conta. Tente novamente.',
		});
	}
});

export default router;
