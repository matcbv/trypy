import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ContentfulContentContext } from './context';
import { fetchContent } from '../../content/services/fetchContent';
import { mapContent } from '../../content/mappers/mapContent';
import type { ModuleCardData, ModuleData } from '../../types/content';
import { logDev } from '../../utils/logger';
import { getCached, setCached } from '../../services/contentfulContentCache';
import type { Themes } from '../../constants/themeStyle';

const MODULES_KEY = 'modules';
const MODULE_CARDS_KEY = 'module-cards';
const TTL = 1000 * 60 * 60 * 24; // * 24h em milissegundos;

export interface ErrorContentType {
	content: 'modules' | 'moduleCards' | null;
	error: Error | null;
}

export function ContentfulContentProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [modules, setModules] = useState<ModuleData[] | null>(null);
	const [moduleCards, setModuleCards] = useState<ModuleCardData[] | null>(null);
	const [isLoading, setIsLoading] = useState({
		modules: true,
		moduleCards: true,
	});
	const [errorData, setErrorData] = useState<ErrorContentType>({
		content: null,
		error: null,
	});

	const revalidateModules = useCallback(async () => {
		try {
			const moduleContent = await fetchContent({
				contentType: 'module',
				include: 3,
			});
			const mappedContent = mapContent(moduleContent);
			setModules(mappedContent);
			setErrorData({
				content: null,
				error: null,
			});
			await setCached(MODULES_KEY, mappedContent);
		} catch (error) {
			logDev(error);
			setErrorData({
				content: 'modules',
				error: error as Error,
			});
		}
	}, []);

	const revalidateModuleCards = useCallback(async () => {
		try {
			const moduleCardsContent = await fetchContent({
				contentType: 'moduleCard',
				include: 3,
			});
			const mappedContent = moduleCardsContent.map((card) => ({
				...card.fields,
				theme: card.fields.theme as Themes,
			}));

			setModuleCards(mappedContent);
			setErrorData({
				content: null,
				error: null,
			});
			await setCached(MODULE_CARDS_KEY, mappedContent);
		} catch (error) {
			logDev(error);
			setErrorData({
				content: 'moduleCards',
				error: error as Error,
			});
		}
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function load() {
			const cachedModules = await getCached<ModuleData[]>(MODULES_KEY, TTL);
			if (cachedModules) {
				if (isMounted) {
					// Nosso componente estando montado e com cachê válido, iremos aproveitar o conteúdo em cachê enquanto buscamos o conteúdo mais recente no Contentful.
					setModules(cachedModules);
					setIsLoading((prev) => ({ ...prev, modules: false }));
				}
				// Chamando a função de revalidação para obter o conteúdo mais recente e atualizar o cachê silenciosamente em segundo plano.
				void revalidateModules();
				return;
			}

			try {
				const moduleContent = await fetchContent({
					contentType: 'module',
					include: 3,
				});
				const mappedContent = mapContent(moduleContent);
				if (isMounted) {
					setModules(mappedContent);
					setIsLoading((prev) => ({ ...prev, modules: false }));
				}
				await setCached(MODULES_KEY, mappedContent);
			} catch (error) {
				if (isMounted) {
					setErrorData({
						content: 'modules',
						error: error as Error,
					});
					setIsLoading((prev) => ({ ...prev, modules: false }));
				}
			}
		}

		void load();
		return () => {
			isMounted = false;
		};
	}, [revalidateModules]);

	useEffect(() => {
		let isMounted = true;

		async function load() {
			const cachedModuleCards = await getCached<ModuleCardData[]>(
				MODULE_CARDS_KEY,
				TTL,
			);

			if (cachedModuleCards) {
				if (isMounted) {
					setModuleCards(cachedModuleCards);
					setIsLoading((prev) => ({ ...prev, moduleCards: false }));
				}

				void revalidateModuleCards();
				return;
			}

			try {
				const moduleCardsContent = await fetchContent({
					contentType: 'moduleCard',
					include: 3,
				});
				const mappedContent = moduleCardsContent.map((card) => ({
					...card.fields,
					theme: card.fields.theme as Themes,
				}));
				console.log('mapped', mappedContent);
				if (isMounted) {
					setModuleCards(() => mappedContent);
					setIsLoading((prev) => ({ ...prev, moduleCards: false }));
				}
				await setCached(MODULE_CARDS_KEY, mappedContent);
			} catch (error) {
				if (isMounted) {
					setErrorData({
						content: 'moduleCards',
						error: error as Error,
					});
					setIsLoading((prev) => ({ ...prev, moduleCards: false }));
				}
			}
		}

		void load();
		return () => {
			isMounted = false;
		};
	}, [revalidateModuleCards]);

	return (
		<ContentfulContentContext
			value={{
				modules,
				moduleCards,
				isLoading,
				errorData,
				refreshModules: revalidateModules,
				refreshModuleCards: revalidateModuleCards,
			}}
		>
			{children}
		</ContentfulContentContext>
	);
}
