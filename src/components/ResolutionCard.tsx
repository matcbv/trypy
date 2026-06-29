import { useState } from 'react';
import { oneDark } from '@uiw/react-codemirror';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useSafeContext } from '../hooks/useSafeContext';
import { useNavigate } from 'react-router-dom';
import { fetchContent } from '../content/services/fetchContent';
import { NavigationContext } from '../contexts/NavigationProvider/context';

interface ResolutionCardProps {
	slug: string;
	title: string;
	code: string;
}

export function ResolutionCard({ slug, title, code }: ResolutionCardProps) {
	const [isCopied, setIsCopied] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const { setNavigationState } = useSafeContext(NavigationContext);
	const navigate = useNavigate();

	const copyText = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setIsCopied((prev) => !prev);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	const navigateToExercise = async (slug: string) => {
		const content = await fetchContent({ contentType: 'module', include: 3 });

		const module = content.find((module) =>
			module.fields.topics.some((topic) =>
				topic!.fields.subtopics.some(
					(subtopic) => subtopic!.fields.slug === slug,
				),
			),
		);

		const topic = module!.fields.topics.find((topic) =>
			topic!.fields.subtopics.some(
				(subtopic) => subtopic!.fields.slug === slug,
			),
		);

		setNavigationState((prev) => ({
			...prev,
			[module!.fields.order]: {
				currentTopic: topic!.fields.slug,
				currentSubtopic: slug,
			},
		}));

		void navigate(`/learning-path/${module!.fields.slug}`);
	};

	return (
		<div key={slug} className="rounded-md bg-[#282c34]">
			<div className="border-b-main-purple flex items-center justify-between border-b px-5 py-2">
				<h1 className="font-jetbrains text-sm">{title}</h1>
				<span className="flex gap-x-3">
					<img
						src="/assets/images/icons/redirect.png"
						alt="Visitar exercício"
						className="cursor-pointer"
						onClick={() => void navigateToExercise(slug)}
					/>
					{isVisible ? (
						<img
							src="/assets/images/icons/hide.png"
							alt="Esconder código"
							className="cursor-pointer"
							onClick={() => setIsVisible(false)}
						/>
					) : (
						<img
							src="/assets/images/icons/visible.png"
							alt="Ver código"
							className="cursor-pointer"
							onClick={() => setIsVisible(true)}
						/>
					)}
					{isCopied ? (
						<img
							src="/assets/images/icons/success.png"
							alt="Copiado"
							className="size-[20px] cursor-pointer"
						/>
					) : (
						<img
							src="/assets/images/icons/copy.png"
							alt="Copiar"
							className="cursor-pointer"
							onClick={() => void copyText(code)}
						/>
					)}
				</span>
			</div>
			<div
				className={`overflow-hidden transition-all duration-300 ${isVisible ? 'h-[200px] opacity-100' : 'h-4 opacity-0'}`}
			>
				{isVisible && (
					<CodeMirror
						value={code}
						editable={false}
						readOnly={true}
						extensions={[python()]}
						theme={oneDark}
						height="200px"
						className={`overflow-hidden rounded-b-md py-1 [&_.cm-scroller]:overflow-hidden`}
					></CodeMirror>
				)}
			</div>
		</div>
	);
}
