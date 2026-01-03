export function Main({ children }) {
	return (
		<main className="mx-10 min-h-screen max-w-screen bg-[var(--main-bg-color)]">
			<span className="fixed top-20 left-40 h-[400px] w-[800px] rotate-[-30deg] bg-[radial-gradient(ellipse_at_center,_#00800075,_#3f0080b0)] blur-3xl"></span>
			{children}
			<span className="fixed right-0 bottom-0 h-[300px] w-[600px] rotate-[30deg] bg-[radial-gradient(ellipse_at_center,_#00803e70,_#540080a1)] blur-3xl"></span>
		</main>
	);
}
