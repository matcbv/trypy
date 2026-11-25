import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
	Hr,
	Row,
	Column,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface UserSupportEmailProps {
	protocol: string;
	openedAt: string;
	subject: string;
	fullName: string | null;
	studentId: string | null;
	description: string;
}

export default function UserSupportEmail({
	protocol,
	openedAt,
	subject,
	fullName,
	studentId,
	description,
}: UserSupportEmailProps) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>
				Recebemos sua solicitação de suporte — protocolo {protocol}
			</Preview>
			<Tailwind>
				<Body className="m-0 bg-gray-200 py-10 font-sans">
					<Container className="mx-auto max-w-[600px] overflow-hidden rounded-lg bg-white">
						<Section className="bg-[#080014]">
							<Row>
								<Column className="p-5 text-center">
									<Heading className="m-0 text-3xl text-[#00a63e]">
										TryPy
									</Heading>
									<Text className="m-0 mt-3 text-xs font-bold tracking-[2px] text-gray-200">
										CENTRAL DE SUPORTE
									</Text>
								</Column>
							</Row>
						</Section>
						<Section>
							<Row>
								<Column className="p-5">
									<Heading className="my-1 text-xl">
										Recebemos sua solicitação
									</Heading>
									<Text className="m-0 text-sm">
										Olá, {fullName || 'estudante'}! Sua mensagem foi recebida
										pela nossa equipe de suporte. Guarde o número do protocolo
										para consultar este atendimento.
									</Text>
									<Section className="my-4 rounded-md bg-[#f4f4f5]">
										<Row>
											<Column className="p-5">
												<Text className="m-0 mb-1 text-[10px] font-bold tracking-wider text-gray-600">
													PROTOCOLO
												</Text>
												<Text className="m-0 text-sm font-bold">
													{protocol}
												</Text>
												<Hr className="my-3 border-gray-400" />
												<Text className="m-0 mb-1 text-[10px] font-bold tracking-wider text-gray-600">
													DATA DE ABERTURA
												</Text>
												<Text className="m-0 text-sm">{openedAt}</Text>
												<Hr className="my-3 border-gray-400" />
												<Text className="m-0 mb-1 text-[10px] font-bold tracking-wider text-gray-600">
													ASSUNTO
												</Text>
												<Text className="m-0 text-sm">{subject}</Text>
												<Hr className="my-3 border-gray-400" />
												<Text className="m-0 mb-1 text-[10px] font-bold tracking-wider text-gray-600">
													ID DO ALUNO
												</Text>
												<Text className="m-0 text-sm">
													{studentId || 'Não informado'}
												</Text>
											</Column>
										</Row>
									</Section>
									<Heading as="h3" className="mb-2 text-base">
										Descrição enviada
									</Heading>
									<Text className="text-sm leading-6 whitespace-pre-wrap">
										{description}
									</Text>
									<Hr className="my-3 border-gray-400" />
									<Text className="m-0 text-sm">
										Enviaremos uma resposta para este mesmo endereço quando
										nossa equipe analisar sua solicitação.
									</Text>
								</Column>
							</Row>
						</Section>
						<Section className="bg-[#080014]">
							<Row>
								<Column className="p-5 text-center">
									<Text className="m-0 text-xs text-gray-400">
										TryPy — Aprenda Python na prática!
									</Text>
									<Text className="m-0 mt-1 text-sm text-gray-400">
										Guarde este e-mail para consultar os dados da sua
										solicitação.
									</Text>
								</Column>
							</Row>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}
