import { ResetPasswordForm } from '../components/ResetPasswordForm';

export function ResetPassword() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="to-main-bg relative mx-[10px] my-[120px] rounded-lg bg-linear-to-br from-[#12612f] via-[#240051] shadow-[0_0_20px_#ffffff]/10">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer.png")] opacity-20'></div>
				<div className="relative max-w-[500px] p-10">
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
