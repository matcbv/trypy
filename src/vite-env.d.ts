/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_FIREBASE_CONFIG: string;
	readonly VITE_CONTENTFUL_API_TOKEN: string;
	readonly VITE_CONTENTFUL_SPACE_ID: string;
}
