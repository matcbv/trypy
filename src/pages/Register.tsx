import { RegisterForm } from '../components/RegisterForm';

export function Register() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="to-main-bg relative z-20 my-20 rounded-lg bg-linear-to-br from-[#00800063] via-[#40008065] shadow-[0_0_20px_#ffffff1f]">
				<div className='absolute inset-0 z-20 rounded-lg bg-[url("/assets/images/cartographer.png")] opacity-60 backdrop-blur-3xl'></div>
				<div className="relative z-30 flex h-[520px] w-[720px] flex-col gap-y-5 rounded-lg p-10">
					<h1 className="text-3xl font-bold tracking-wider">Criar conta</h1>
					<RegisterForm />
				</div>
			</div>
		</div>
	);
}
