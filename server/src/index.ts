import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import cors from 'cors';

export const app = express();
const PORT = 8080;

app.use(
	cors({
		origin: 'https://192.168.0.183:5173',
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
);

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/account', accountRoutes);

app.listen(PORT, () => {
	console.log(`Servidor iniciado em http://192.168.0.183:${PORT}`);
});
