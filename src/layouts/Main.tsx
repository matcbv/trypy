import type { ReactNode } from 'react';

export function Main({ children }: { children: ReactNode }) {
	return (
		<main className="bg-main-bg mx-10 min-h-screen max-w-screen">
			<span className="fixed top-20 left-40 h-[400px] w-[800px] rotate-[-30deg] bg-[radial-gradient(ellipse_at_center,#00800075,#3f0080b0)] blur-3xl"></span>
			{children}
			<span className="fixed right-0 bottom-0 h-[300px] w-[600px] rotate-[30deg] bg-[radial-gradient(ellipse_at_center,#00803e70,#540080a1)] blur-3xl"></span>
		</main>
	);
}
