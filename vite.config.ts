import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		mkcert({
			savePath: './.mkcert',
		}),
	],
	optimizeDeps: {
		exclude: ['pyodide'],
	},
	server: {
		host: true,
	},
});
