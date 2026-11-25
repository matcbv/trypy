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

interface SupportEmailProps {
	protocol: string;
	openedAt: string;
	subject: string;
	fullName: string | null;
	studentId: string | null;
	description: string;
	contactEmail: string;
}

export default function SupportEmail({
	protocol,
	openedAt,
	subject,
	fullName,
	studentId,
	description,
	contactEmail,
}: SupportEmailProps) {
	return (
		<Html lang="pt-BR">
			<Head />
			<Preview>Nova solicitação de suporte — protocolo {protocol}</Preview>
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
										Nova solicitação de suporte
									</Heading>
									<Text className="m-0 text-sm">
										Uma nova mensagem foi enviada pelo formulário de suporte.
									</Text>
									<Section className="my-3 rounded-md bg-[#f4f4f5]">
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
												<Text className="mb-1 text-[10px] font-bold tracking-wider text-gray-600">
													ID DO ALUNO
												</Text>
												<Text className="m-0 text-sm">
													{studentId || 'Não informado'}
												</Text>
												<Hr className="my-3 border-gray-400" />
												<Text className="mb-1 text-[10px] font-bold tracking-wider text-gray-600">
													NOME COMPLETO
												</Text>
												<Text className="m-0 text-sm">
													{fullName || 'Não informado'}
												</Text>
											</Column>
										</Row>
									</Section>
									<Heading as="h3" className="mb-3 text-base">
										Descrição
									</Heading>
									<Text className="text-sm leading-6 whitespace-pre-wrap">
										{description}
									</Text>
									<Hr className="my-3 border-gray-400" />
									<Text className="mb-1 text-[10px] font-bold tracking-wider text-gray-600">
										E-MAIL PARA CONTATO
									</Text>
									<Text className="m-0 text-sm text-[#2563eb]">
										{contactEmail}
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
										Mensagem enviada pelo formulário de suporte.
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
