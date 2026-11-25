import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ContentfulContentContext } from './context';
import { fetchContent } from '../../content/services/fetchContent';
import { mapModuleContent } from '../../content/mappers/mapModuleContent';
import type {
	FaqCategory,
	ModuleCardData,
	ModuleData,
} from '../../types/content';
import { logDev } from '../../utils/logger';
import {
	getCached,
	setCached,
} from '../../services/storage/contentfulContentCache';
import type { Themes } from '../../constants/themeStyle';
import { mapFaqCategoryContent } from '../../content/mappers/mapFaqCategoryContent';

const MODULES_KEY = 'modules';
const MODULE_CARDS_KEY = 'module-cards';
const FAQ_CATEGORIES_KEY = 'faq-categories';
const TTL = 1000 * 60 * 60 * 24; // * 24h em milissegundos;

export interface ErrorContentType {
	content: 'module' | 'moduleCard' | 'faqCategory' | null;
	error: Error | null;
}

export function ContentfulContentProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [modules, setModules] = useState<ModuleData[] | null>(null);
	const [moduleCards, setModuleCards] = useState<ModuleCardData[] | null>(null);
	const [faqCategories, setFaqCategories] = useState<FaqCategory[] | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState({
		modules: true,
		moduleCards: true,
		faqCategories: true,
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
			const mappedContent = mapModuleContent(moduleContent);
			setModules(mappedContent);
			setErrorData({
				content: null,
				error: null,
			});
			await setCached(MODULES_KEY, mappedContent);
		} catch (error) {
			logDev(error);
			setErrorData({
				content: 'module',
				error: error as Error,
			});
		}
	}, []);

	const revalidateModuleCards = useCallback(async () => {
		try {
			const moduleCardContent = await fetchContent({
				contentType: 'moduleCard',
			});
			const mappedContent = moduleCardContent.map((card) => ({
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
				content: 'moduleCard',
				error: error as Error,
			});
		}
	}, []);

	const revalidateFaqCategories = useCallback(async () => {
		try {
			const faqCategoryContent = await fetchContent({
				contentType: 'faqCategory',
				include: 1,
			});
			const mappedContent = mapFaqCategoryContent(faqCategoryContent);
			setFaqCategories(mappedContent);
			setErrorData({
				content: null,
				error: null,
			});
			await setCached(FAQ_CATEGORIES_KEY, mappedContent);
		} catch (error) {
			logDev(error);
			setErrorData({
				content: 'faqCategory',
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
				const mappedContent = mapModuleContent(moduleContent);
				if (isMounted) {
					setModules(mappedContent);
					setIsLoading((prev) => ({ ...prev, modules: false }));
				}
				await setCached(MODULES_KEY, mappedContent);
			} catch (error) {
				if (isMounted) {
					setErrorData({
						content: 'module',
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
				const moduleCardContent = await fetchContent({
					contentType: 'moduleCard',
				});
				const mappedContent = moduleCardContent.map((card) => ({
					...card.fields,
					theme: card.fields.theme as Themes,
				}));
				if (isMounted) {
					setModuleCards(mappedContent);
					setIsLoading((prev) => ({ ...prev, moduleCards: false }));
				}
				await setCached(MODULE_CARDS_KEY, mappedContent);
			} catch (error) {
				if (isMounted) {
					setErrorData({
						content: 'moduleCard',
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

	useEffect(() => {
		let isMounted = true;

		async function load() {
			const cachedFaqCategories = await getCached<FaqCategory[]>(
				FAQ_CATEGORIES_KEY,
				TTL,
			);

			if (cachedFaqCategories) {
				if (isMounted) {
					setFaqCategories(cachedFaqCategories);
					setIsLoading((prev) => ({ ...prev, faqCategories: false }));
				}

				void revalidateModuleCards();
				return;
			}

			try {
				const faqCategoryContent = await fetchContent({
					contentType: 'faqCategory',
					include: 1,
				});
				const mappedContent = mapFaqCategoryContent(faqCategoryContent);

				if (isMounted) {
					setFaqCategories(mappedContent);
					setIsLoading((prev) => ({ ...prev, faqCategories: false }));
				}
				await setCached(FAQ_CATEGORIES_KEY, mappedContent);
			} catch (error) {
				if (isMounted) {
					setErrorData({
						content: 'faqCategory',
						error: error as Error,
					});
					setIsLoading((prev) => ({ ...prev, faqCategories: false }));
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
				faqCategories,
				isLoading,
				errorData,
				refreshModules: revalidateModules,
				refreshModuleCards: revalidateModuleCards,
				refreshFaqCategories: revalidateFaqCategories,
			}}
		>
			{children}
		</ContentfulContentContext>
	);
}
