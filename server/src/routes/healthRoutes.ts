import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
	res.json({
		message: 'O servidor TryPy está funcionando!',
	});
});

export default router;
