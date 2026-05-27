import { ToastContainer } from 'react-toastify';

// Routes
import { AppRoutes } from './routes';

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
				pauseOnHover={false}
				pauseOnFocusLoss={false}
				toastClassName={(context) =>
					(context?.type === 'success'
						? '!shadow-[0_0_15px_#00803e50]'
						: '!shadow-[0_0_15px_#f2485450]') +
					' relative mb-4 !w-[400px] rounded-lg !bg-[#131117eb] !p-6'
				}
				className="mt-20"
			/>
		</>
	);
}

export default App;
