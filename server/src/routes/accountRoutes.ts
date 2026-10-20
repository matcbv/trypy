import { Router } from 'express';
import { adminAuth, adminDb, storage } from '../firebaseAdmin.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

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
		if (process.env.NODE_ENV === 'development') {
			console.error(error);
		}

		res.status(500).json({
			error: 'Não foi possível excluir a conta.',
		});
	}
});

export default router;
