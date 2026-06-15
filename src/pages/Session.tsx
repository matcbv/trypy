import { Link } from 'react-router-dom';
import { SessionForm } from '../components/SessionFrom';

export function Session() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="to-main-bg relative z-20 my-20 rounded-lg bg-linear-to-br from-[#00800063] via-[#40008065] shadow-[0_0_20px_#ffffff1f]">
				<div className='absolute inset-0 z-20 rounded-lg bg-[url("/assets/images/cartographer.png")] opacity-60 backdrop-blur-3xl'></div>
				<div className="relative z-30 flex h-[500px] w-[500px] flex-col justify-center p-10">
					<h1 className="mb-10 text-3xl font-bold tracking-wider">
						Iniciar sessão
					</h1>
					<SessionForm />
					<Link
						to={'/reset-password'}
						className="hover:text-main-green mb-10 w-fit cursor-pointer text-start transition-colors"
					>
						Redefinir senha
					</Link>
					<div>
						<h2 className="mb-3 text-lg font-bold tracking-wider">
							Ainda não possui conta?
						</h2>
						<Link to={'/register'} className="form-btn block w-[150px]">
							Cadastre-se
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
