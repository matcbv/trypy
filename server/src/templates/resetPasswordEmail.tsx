import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Row,
	Column,
	Tailwind,
	Text,
} from '@react-email/components';

interface ResetPasswordEmailProps {
	name: string | null;
	customResetPasswordUrl: string;
}

export default function ResetPasswordEmail({
	name,
	customResetPasswordUrl,
}: ResetPasswordEmailProps) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>
				Redefina sua senha para recuperar o acesso à sua conta no TryPy.
			</Preview>
			<Tailwind>
				<Body className="m-0 bg-[#080014] py-10 font-sans text-gray-200">
					<Container className="mx-auto max-w-[480px] rounded-md border border-[#00a63e] bg-black">
						<Section>
							<Row>
								<Column className="p-10">
									<Heading className="m-0 text-2xl font-bold">TryPy</Heading>
									<Section className="mt-5">
										<Heading className="m-0 mb-3 text-xl font-semibold">
											Olá, {name ?? 'Aluno'}!
										</Heading>
										<Text className="m-0 text-base">
											Clique no botão abaixo e siga as instruções para redefinir
											a senha da sua conta no TryPy.
										</Text>
										<Section className="my-7 text-center">
											<Row>
												<Column>
													<Button
														href={customResetPasswordUrl}
														className="cursor-pointer rounded-lg border border-black bg-[#00a63e] px-6 py-3 text-sm font-semibold text-black no-underline"
													>
														Redefinir senha
													</Button>
												</Column>
											</Row>
										</Section>
										<Text className="m-0 mb-3 text-sm">
											Caso você não tenha solicitado este e-mail, por favor,
											desconsidere.
										</Text>
										<Text className="m-0 text-sm">
											Atenciosamente, Equipe TryPy.
										</Text>
									</Section>
								</Column>
							</Row>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
