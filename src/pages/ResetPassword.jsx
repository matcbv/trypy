import { ResetPassowrdForm } from '../components/ResetPasswordForm';

export function ResetPassword() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="relative z-20 my-20">
				<h1>Redefinir senha</h1>
				<ResetPassowrdForm />
			</div>
		</div>
	);
}
