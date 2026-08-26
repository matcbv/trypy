import { Link } from 'react-router-dom';
import { SessionForm } from '../components/SessionForm';

export function Session() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="to-main-bg relative mx-[10px] my-[120px] flex min-h-[500px] w-full max-w-[400px] rounded-lg bg-linear-to-br from-[#12612f] via-[#240051] shadow-[0_0_20px_#ffffff]/10 transition-[max-width] duration-500 md:max-w-[500px]">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer.png")] opacity-20'></div>
				<div className="relative flex w-full flex-col justify-center p-10">
					<h1 className="mb-10 text-2xl font-bold tracking-wide">
						Iniciar sessão
					</h1>
					<SessionForm />
					<Link
						to={'/reset-password'}
						className="hover:text-main-green mb-10 w-fit cursor-pointer text-start transition-colors"
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
