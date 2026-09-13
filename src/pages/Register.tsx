import { RegisterForm } from '../components/RegisterForm';

export function Register() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="bg-forms relative mx-[10px] my-30 flex min-h-130 w-full max-w-95 rounded-lg shadow-[0_0_20px_#ffffff]/10 transition-[max-width] duration-500 md:max-w-180">
				<div className='absolute inset-0 rounded-lg bg-[url("/assets/images/cartographer-background.png")] opacity-20'></div>
				<div className="relative flex w-full flex-col gap-y-5 rounded-lg p-10">
					<h1 className="text-2xl font-bold tracking-wide md:text-3xl">
						Criar conta
					</h1>
					<div className="flex flex-1 items-center justify-center">
						<RegisterForm />
					</div>
				</div>
			</div>
		</div>
	);
}
