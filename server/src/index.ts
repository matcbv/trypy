import express from 'express';
import healthRoutes from './routes/healthRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';

export const app = express();
const PORT = 8080;

const tlsOptions = {
	key: readFileSync('./.mkcert/dev.pem'),
	cert: readFileSync('./.mkcert/cert.pem'),
};

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

createServer(tlsOptions, app).listen(PORT, () => {
	console.log(`Servidor iniciado em https://192.168.0.183:${PORT}`);
});
