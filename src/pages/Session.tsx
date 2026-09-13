import { Link } from 'react-router-dom';
import { SessionForm } from '../components/SessionForm';

export function Session() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-[120px] flex min-h-[500px] w-full max-w-[500px] rounded-lg shadow-[0_0_20px_#ffffff]/10">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative flex w-full flex-col items-start justify-center p-[40px]">
					<h1 className="mb-10 text-2xl font-bold tracking-wide">
						Iniciar sessão
					</h1>
					<SessionForm />
					<Link
						to={'/reset-password'}
						className="lg:hover:text-main-green mb-10 lg:transition-colors"
					>
						Redefinir senha
					</Link>
					<div className="flex flex-col items-start gap-y-[10px]">
						<h2 className="text-lg font-bold tracking-wider">
							Ainda não possui conta?
						</h2>
						<Link to={'/register'} className="form-btn">
							Cadastre-se
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
