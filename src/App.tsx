import { ToastContainer } from 'react-toastify';

// Routes
import { AppRoutes } from './routes/AppRoutes';

// Styles
import './assets/fonts.css';
import './assets/tailwind.css';
import './assets/styles.css';

function App() {
	return (
		<>
			<AppRoutes />
			<ToastContainer
				closeButton={false}
				icon={false}
				autoClose={3000}
				pauseOnHover={true}
				pauseOnFocusLoss={true}
				toastClassName={() =>
					'bg-toast-background relative w-full overflow-hidden p-6 sm:mb-4 sm:rounded-xl'
				}
				className="mt-0 [--toastify-container-width:100%] [--toastify-toast-bd-radius:0] [--toastify-toast-right:0px] [--toastify-toast-top:0px] [--toastify-toast-width:100%] sm:mt-[70px] sm:[--toastify-container-width:400px] sm:[--toastify-toast-bd-radius:12px] sm:[--toastify-toast-right:20px]"
			/>
		</>
	);
}

export default App;
