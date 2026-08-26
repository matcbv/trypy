import type { ReactNode } from 'react';

export function Main({ children }: { children: ReactNode }) {
	return (
		<main className="min-h-screen max-w-screen">
			<span className="h-blob-1 w-blob-1 fixed top-20 left-0 -z-10 -rotate-30 bg-[radial-gradient(ellipse_at_center,#00800070,#3f0080b0)] blur-3xl"></span>
			{children}
			<span className="h-blob-2 w-blob-2 fixed right-0 bottom-0 -z-10 rotate-30 bg-[radial-gradient(ellipse_at_center,#00803e5e,#54008075)] blur-3xl"></span>
		</main>
	);
}
