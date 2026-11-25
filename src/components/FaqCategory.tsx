import { useState, type ReactNode } from 'react';
import type { FaqCategory, FaqQuestion } from '../types/content';
import { contentfulFormatter } from '../content/formatters/contentfulFormatter';

export function FaqCategory({ category }: { category: FaqCategory }) {
	const [showQuestions, setShowQuestions] = useState(false);
	const [showAnswer, setShowAnswer] = useState(false);
	const [currentAnswer, setCurrentAnswer] = useState<null | ReactNode>(null);

	const getAnswer = (selectedQuestion: FaqQuestion) => {
		setCurrentAnswer(contentfulFormatter(selectedQuestion.answer));
	};

	return (
		<div className="p-5">
			<div
				className="mb-5 flex cursor-pointer items-center justify-start gap-x-3"
				onClick={() => {
					setShowAnswer(false);
					setShowQuestions((prev) => !prev);
				}}
			>
				<img
					className="drop-shadow-[0_0_10px_var(--color-main-purple)]/50"
					src={category.icon.fields.file?.url}
					alt={category.icon.fields.description}
				/>
				<h2 className="text-section-lg font-bold">{category.name}</h2>
				<img
					src="/assets/images/icons/arrow-down.png"
					alt="Exibir perguntas"
					className={`${
						showQuestions ? 'rotate-180' : 'rotate-none'
					} transition-transform duration-300`}
				/>
			</div>
			<div
				className={`grid transition-[grid-template-rows] duration-300 ${
					showAnswer ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
				}`}
			>
				<div className="min-h-0 overflow-hidden">
					<div className="grid">
						<div
							className={`col-start-1 row-start-1 transition-opacity duration-300 ${
								showQuestions ? 'pointer-events-none opacity-0' : 'opacity-100'
							}`}
						>
							<p className="text-section-base">{category.description}</p>
						</div>
						<div
							className={`col-start-1 row-start-1 grid transition-[grid-template-rows] duration-300 ${
								showQuestions ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
							}`}
						>
							<div className="min-h-0 overflow-hidden">
								<div className="flex flex-col items-start gap-y-3">
									{category.questions.map((question) => {
										const words = question.question.split(' ');
										const lastWord = words.pop();

										return (
											<button
												key={question.question}
												type="button"
												className="cursor-pointer text-left"
												onClick={() => {
													getAnswer(question);
													setShowAnswer(true);
												}}
											>
												{words.join(' ')}{' '}
												<span className="whitespace-nowrap">
													{lastWord}

													<img
														src="/assets/images/icons/arrow-down.png"
														alt="Exibir resposta"
														className="ml-2 inline-block w-5 -rotate-90 align-middle"
													/>
												</span>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				className={`grid transition-[grid-template-rows] duration-300 ${
					showAnswer ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
				}`}
			>
				<div className="min-h-0 overflow-hidden">
					<div
						className={`transition-opacity duration-300 ${
							showAnswer ? 'opacity-100' : 'opacity-0'
						}`}
					>
						<button
							type="button"
							className="group mb-5 flex cursor-pointer items-center gap-x-1 rounded-md border border-gray-200 bg-white/10 p-2 text-sm font-bold"
							onClick={() => setShowAnswer(false)}
						>
							<img
								src="/assets/images/icons/left-arrow.png"
								alt="Voltar"
								className="animate-translate-x w-5 transition-transform duration-300 group-hover:-translate-x-1"
							/>
							Voltar
						</button>
						<div className="flex flex-col gap-y-3">{currentAnswer}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
