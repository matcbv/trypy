import { RegisterForm } from '../components/RegisterForm';

export function Register() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="to-main-bg relative mx-[10px] my-[120px] flex min-h-[510px] w-full max-w-[380px] rounded-lg bg-linear-to-br from-[#12612f] via-[#240051] shadow-[0_0_20px_#ffffff]/10 transition-[max-width] duration-500 md:max-w-[723px]">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer.png")] opacity-20'></div>
				<div className="relative flex w-full flex-col gap-y-5 rounded-lg p-10">
					<h1 className="text-3xl font-bold tracking-wide">Criar conta</h1>
					<RegisterForm />
				</div>
			</div>
		</div>
	);
}
