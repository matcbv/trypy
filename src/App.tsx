import { ToastContainer } from 'react-toastify';

// Routes
import { AppRoutes } from './routes/AppRoutes';

// Styles
import './assets/fonts.css';
import './assets/tailwind.css';
import './assets/styles.css';

const toastThemes = {
	success: '!shadow-[0_0_15px_var(--color-glow-green)]/30',
	error: '!shadow-[0_0_15px_#f24854]/40',
	warning: '!shadow-[0_0_15px_#f7b972]/40',
	info: '!shadow-[0_0_15px_#5c87a7]/40',
	default: '',
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
					toastThemes[context?.type || 'default'] +
					' relative mb-4 !w-[400px] rounded-lg !bg-[#131117] !p-6'
				}
				className="mt-20"
			/>
		</>
	);
}

export default App;
