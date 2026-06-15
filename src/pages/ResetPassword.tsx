import { ResetPasswordForm } from '../components/ResetPasswordForm';

export function ResetPassword() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="to-main-bg relative z-20 my-20 rounded-lg bg-gradient-to-br from-[#00800063] via-[#40008065] shadow-[0_0_20px_#ffffff1f]">
				<div className='absolute inset-0 z-20 rounded-lg bg-[url("/assets/images/cartographer.png")] opacity-60 backdrop-blur-3xl'></div>
				<div className="relative z-30 w-[500px] p-10">
					<h1 className="mb-6 text-2xl font-bold tracking-wider">
						Redefinir senha
					</h1>
					<p className="mb-8 text-sm tracking-wide">
						Para prosseguir com redefinição da senha, informe o e-mail
						cadastrado em sua conta.
					</p>
					<ResetPasswordForm />
					<div className="flex flex-col gap-y-3">
						<h2>Não se lembra do e-mail?</h2>
						<button
							type="button"
							className="hover:text-main-purple w-fit cursor-pointer text-sm transition-colors"
						>
							Tente de outra forma
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
