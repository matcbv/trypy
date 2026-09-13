import { useMemo, useState } from 'react';
import { useSafeContext } from '../hooks/useSafeContext';
import { useNavigate } from 'react-router-dom';
import { NavigationContext } from '../contexts/NavigationProvider/context';
import { highlightCode } from '../lib/shiki';
import { ContentfulContentContext } from '../contexts/ContentfulContentProvider/context';

interface ResolutionCardProps {
	slug: string;
	title: string;
	code: string;
}

export function ResolutionCard({ slug, title, code }: ResolutionCardProps) {
	const { modules } = useSafeContext(ContentfulContentContext);
	const [isCopied, setIsCopied] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const navigate = useNavigate();

	const html = useMemo(() => highlightCode(code), [code]);

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	const navigateToExercise = (slug: string) => {
		const module = modules!.find((module) =>
			module.topics.some((topic) =>
				topic.subtopics.some((subtopic) => subtopic.slug === slug),
			),
		);

		const topic = module!.topics.find((topic) =>
			topic.subtopics.some((subtopic) => subtopic.slug === slug),
		);

		setNavigationState((prev) => ({
			...prev,
			[module!.order]: {
				currentTopic: topic!.slug,
				currentSubtopic: slug,
			},
		}));

		void navigate(`/learning-path/${module!.slug}`);
	};

	return (
		<div key={slug} className="bg-terminal-background rounded-md">
			<div className="border-b-main-purple flex items-center justify-between gap-x-[20px] border-b p-[10px]">
				<h1 className="font-jetbrains text-xs">{title}</h1>
				<span className="flex shrink-0 gap-x-3">
					<img
						src="/assets/images/icons/redirect.png"
						alt="Visitar exercício"
						tabIndex={0}
						role="button"
						className="lg:cursor-pointer"
						onClick={() => void navigateToExercise(slug)}
					/>
					{isVisible ? (
						<img
							src="/assets/images/icons/hide.png"
							alt="Esconder código"
							tabIndex={0}
							role="button"
							className="lg:cursor-pointer"
							onClick={() => setIsVisible(false)}
						/>
					) : (
						<img
							src="/assets/images/icons/show.png"
							alt="Ver código"
							tabIndex={0}
							role="button"
							className="lg:cursor-pointer"
							onClick={() => setIsVisible(true)}
						/>
					)}
					{isCopied ? (
						<img
							src="/assets/images/icons/success.png"
							alt="Copiado"
							className="size-[20px]"
						/>
					) : (
						<img
							src="/assets/images/icons/copy.png"
							alt="Copiar"
							tabIndex={0}
							role="button"
							className="lg:cursor-pointer"
							onClick={() => void copyText(code)}
						/>
					)}
				</span>
			</div>
			<div
				className={`transition-[height, opacity] codeScrollbar overflow-y-scroll duration-300 ${isVisible ? 'h-[200px] opacity-100' : 'h-[15px] opacity-0'}`}
			>
				{isVisible && (
					<div
						className="codeScrollbar h-full overflow-x-scroll rounded-lg"
						dangerouslySetInnerHTML={{ __html: html }}
					></div>
				)}
			</div>
		</div>
	);
}
