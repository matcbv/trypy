import { ToastContainer } from 'react-toastify';

// Routes
import { AppRoutes } from './routes/AppRoutes';

// Styles
import './assets/fonts.css';
import './assets/tailwind.css';
import './assets/styles.css';

const toastThemes = {
	success: 'sm:shadow-[0_0_5px_var(--color-glow-green)]',
	error: 'sm:shadow-[0_0_5px_#f24854]',
	warning: 'sm:shadow-[0_0_5px_#f7b972]',
	info: 'sm:shadow-[0_0_5px_#5c87a7]',
	default: 'sm:shadow-[0_0_5px_#ffffff]',
};

function App() {
	return (
		<>
			<AppRoutes />
			<ToastContainer
				closeButton={false}
				icon={false}
				autoClose={3000}
				pauseOnHover={true}
				pauseOnFocusLoss={false}
				toastClassName={(context) =>
					`${toastThemes[context?.type || 'default']} mt-0 sm:mt-[70px] relative sm:mb-4 w-full max-w-[400px] sm:rounded-xl bg-[#131117] p-[25px] overflow-hidden`
				}
				className="[--toastify-toast-bd-radius:0] sm:[--toastify-toast-bd-radius:12px]"
			/>
		</>
	);
}

export default App;
