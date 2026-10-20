import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from '@react-email/components';

interface VerificationEmailProps {
	name: string;
	verificationUrl: string;
}

export default function VerificationEmail({
	name,
	verificationUrl,
}: VerificationEmailProps) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>
				Confirme seu endereço de e-mail para criar sua conta no TryPy.
			</Preview>

			<Tailwind>
				<Body className="bg-[#080014] font-sans text-gray-200">
					<Container className="mx-auto my-10 max-w-[480px] rounded-md border border-[#00a63e] bg-black/40 p-8">
						<Section>
							<Heading className="m-0 text-2xl font-bold">TryPy</Heading>
						</Section>

						<Section className="mt-8">
							<Heading className="text-xl font-semibold">Olá, {name}!</Heading>
							<Text className="text-base">
								Clique no botão abaixo para confirmar seu endereço de e-mail e
								concluir seu cadastro no TryPy.
							</Text>

							<Section className="my-8 text-center">
								<Button
									href={verificationUrl}
									className="cursor-pointer rounded-lg border border-black bg-[#00a63e] px-6 py-3 text-sm font-semibold text-black no-underline"
								>
									Confirmar e-mail
								</Button>
							</Section>

							<Text className="text-sm">
								Caso você não tenha solicitado este e-mail, por favor,
								desconsidere.
							</Text>
							<Text className="text-sm">Atenciosamente, Equipe TryPy.</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
