import { ResetPasswordForm } from '../components/ResetPasswordForm';

export function ResetPassword() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-100 max-w-125 rounded-lg shadow-[0_0_20px_#ffffff]/10">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative flex flex-col justify-center p-10">
					<h1 className="mb-3 text-2xl font-bold tracking-wider">
						Redefinir senha
					</h1>
					<p className="mb-[30px] text-sm tracking-wide">
						Para prosseguir com redefinição da senha, informe o e-mail
						cadastrado em sua conta.
					</p>
					<ResetPasswordForm />
					<div className="flex flex-col items-start gap-y-3">
						<h2>Não se lembra do e-mail?</h2>
						<button
							type="button"
							className="lg:hover:text-main-purple text-sm lg:cursor-pointer lg:transition-colors"
						>
							Tente de outra forma
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
