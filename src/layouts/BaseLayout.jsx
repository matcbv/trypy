import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Main } from './Main';

export function BaseLayout() {
	return (
		<>
			<Header />
			<Main>
				<Outlet />
			</Main>
			<Footer />
		</>
	);
}
