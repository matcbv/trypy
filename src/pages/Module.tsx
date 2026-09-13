import { useParams } from 'react-router-dom';
import { ModuleSideBar } from '../components/ModuleSideBar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';
import { ModuleButtons } from '../components/ModuleButtons';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { useSafeContext } from '../hooks/useSafeContext';
import { Terminal } from '../components/Terminal';
import { LoadingPage } from './LoadingPage';
import { themeStyles } from '../constants/themeStyle';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';
import { ErrorPage } from './ErrorPage';

export function Module() {
	const { modules, isLoading, errorData, refreshModules } = useSafeContext(
		ContentfulContentContext,
	);
	const { navigationState } = useSafeContext(NavigationContext);
	const [scrollY, setScrollY] = useState(0);
	const [topButtonOffset, setTopButtonOffset] = useState(0);
	const [sidebarButtonOffset, setSidebarButtonOffset] = useState(0);
	const footerRef = useRef<HTMLElement>(null);
	const moduleRef = useRef<HTMLDivElement>(null);
	const params = useParams<{ moduleId: string }>();

	// * useEffect para aparição e posicionamento do botão de scroll para o topo.
	useEffect(() => {
		footerRef.current = document.querySelector('footer');

		const handleScroll = () => {
			setScrollY(window.scrollY);

			if (!footerRef.current || !moduleRef.current) return;

			// * Calculando a distância do botão de voltar ao topo:
			const footerTop = footerRef.current.getBoundingClientRect().top;
			const footerOverlap = window.innerHeight - footerTop;
			// * Setando o maior valor entre o intervalo citado. Ao descer a tela, o footer ficará cada vez mais próximo da tela, diminuindo o valor de footerTop e aumentando o valor de overlap. Dessa forma, irá sempre acompanhar o tamanho do footer, somado de 20px.
			setTopButtonOffset(Math.max(20, footerOverlap + 20));

			// * Calculando a distância do botão de mostrar a sidebar:
			const moduleRect = moduleRef.current.getBoundingClientRect();
			const moduleBottom = moduleRect.top + moduleRect.height;

			// * Obtendo os valores mínimo e máximo para nosso botão de exibir a sidebar:
			const minOffset = moduleRect.top + 50;
			const maxOffset = moduleBottom - 50;

			// * No caso abaixo, iremos obter o valor máximo entre o offset mínimo, e o valor mínimo entre a metade da tela e o offset máximo. O segundo valor é calculado a medida que a tela se aproxima do final do módulo, o offset máximo começara a ficar menor que a metade da tela, parando nesse ponto.
			const moduleOverlap = Math.max(
				minOffset,
				Math.min(window.innerHeight / 2, maxOffset),
			);

			setSidebarButtonOffset(moduleOverlap);
		};

		handleScroll();

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const currentModule = useMemo(
		() => modules?.find((module) => module.slug === params.moduleId) ?? null,
		[modules, params.moduleId],
	);

	const currentTopic = useMemo(() => {
		if (!currentModule || !navigationState) return null;
		return (
			currentModule.topics.find(
				(topic) =>
					topic.slug === navigationState[currentModule.order]?.currentTopic,
			) ?? null
		);
	}, [currentModule, navigationState]);

	const currentSubtopic = useMemo(() => {
		if (!currentTopic || !currentModule || !navigationState) return null;
		return (
			currentTopic.subtopics.find(
				(subtopic) =>
					subtopic.slug ===
					navigationState[currentModule.order]?.currentSubtopic,
			) ?? null
		);
	}, [currentModule, currentTopic, navigationState]);

	if (errorData.error) {
		return <ErrorPage onRetry={refreshModules} />;
	} else {
		return isLoading.modules ? (
			<LoadingPage />
		) : (
			<div className="relative mx-[10px] my-[120px] flex min-h-screen justify-center lg:mx-[50px] lg:gap-x-[40px]">
				<ModuleSideBar
					currentModule={currentModule!}
					sidebarButtonOffset={sidebarButtonOffset}
				/>
				<div
					ref={moduleRef}
					className="bg-module-background max-w-[1200px] min-w-0 flex-1 rounded-lg p-[30px] shadow-[0_0_20px_#ffffff]/5 lg:p-[40px]"
					style={
						{
							'--theme-color': `var(${themeStyles[currentModule!.theme].color})`,
							'--highlight-theme-color': `var(${themeStyles[currentModule!.theme].highlight})`,
						} as React.CSSProperties
					}
				>
					<h1
						className={`text-content-h1 mb-[20px] tracking-wide text-(--theme-color)`}
					>
						{currentSubtopic?.title}
					</h1>
					<div className="mb-10 flex flex-col gap-y-5">
						{currentSubtopic?.content &&
							contentfulFormatter(currentSubtopic.content)}
						{currentSubtopic?.videoLink && (
							<div className="flex justify-center">
								<iframe
									className="aspect-video w-full max-w-[720px] rounded-md shadow-[0_0_30px_#ffffff0f]"
									src={currentSubtopic?.videoLink}
									title={currentSubtopic?.title}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									referrerPolicy="strict-origin-when-cross-origin"
									allowFullScreen
								></iframe>
							</div>
						)}
						{currentSubtopic?.subtopicType === 'exercise' && (
							<Terminal subtopicData={currentSubtopic} />
						)}
					</div>
					<ModuleButtons
						moduleData={currentModule!}
						topicData={currentTopic!}
						subtopicData={currentSubtopic!}
					/>
				</div>
				{scrollY > 0 && (
					<span
						className="bg-main-green lg:transition-[transform, shadow] fixed right-[5px] z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full shadow-[0_0_10px_#000000b0] lg:right-[10px] lg:cursor-pointer lg:duration-300 lg:hover:-translate-y-1 lg:hover:shadow-[0_0_10px_var(--color-glow-green)]/50"
						onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
						style={{ bottom: `${topButtonOffset}px` }}
					>
						<img src="/assets/images/icons/arrow-up.png" alt="Ir ao topo" />
					</span>
				)}
			</div>
		);
	}
}
