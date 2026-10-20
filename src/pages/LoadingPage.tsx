import { SnakeLoader } from '../components/SnakeLoader';

export function LoadingPage() {
	return (
		<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-xl">
			<SnakeLoader />
		</div>
	);
}
