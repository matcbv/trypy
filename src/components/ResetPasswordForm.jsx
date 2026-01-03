export function ResetPassowrdForm() {
	return (
		<form className="w-[500px]">
			<div className="flex flex-col">
				<p className="">
					Para prosseguir com redefinição de sua senha, informe o e-mail
					cadastrado em sua conta.
				</p>
				<input type="text" placeholder="E-mail cadastrado" />
				<button type="button">Continuar</button>
			</div>
		</form>
	);
}
