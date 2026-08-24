import { ToastContainer } from 'react-toastify';

// Routes
import { AppRoutes } from './routes/AppRoutes';

// Styles
import './assets/fonts.css';
import './assets/tailwind.css';
import './assets/styles.css';

const toastThemes = {
	success: 'sm:shadow-[0_0_15px_var(--color-glow-green)]/40',
	error: 'sm:shadow-[0_0_15px_#f24854]/40',
	warning: 'sm:shadow-[0_0_15px_#f7b972]/40',
	info: 'sm:shadow-[0_0_15px_#5c87a7]/40',
	default: 'sm:shadow-[0_0_15px_#ffffff]/40',
};

function App() {
	return (
		<>
			<AppRoutes />
			<ToastContainer
				closeButton={false}
				icon={false}
				autoClose={3000}
				pauseOnHover={false}
				pauseOnFocusLoss={false}
				toastClassName={(context) =>
					`${toastThemes[context?.type || 'default']} relative mb-4 w-full max-w-[400px] rounded-xl bg-[#131117] p-[25px]`
				}
				className="mt-20"
			/>
		</>
	);
}

export default App;
