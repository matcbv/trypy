import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{ ignores: ['dist'] },
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		plugins: {
			react: pluginReact,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...js.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			// Garante que sejam usadas apenas operadores de comparação estrita.
			eqeqeq: ['error'],
			// Garante o uso de chaves em estruturas condicionais e de controle de fluxo. Com all, garantimos que a regra seja estrita para todos os casos.
			curly: ['error', 'all'],
			// Define o número máximo de linhas vazias entre códigos.
			'no-multiple-empty-lines': ['error', { max: 2 }],
			// Garante o uso de Camel Case em nosso código.
			camelcase: ['error'],
			// Regra para não uso de mensagem de alerta em geral.
			'no-alert': ['warn'],
		},
	},
	eslintConfigPrettier,
]);
