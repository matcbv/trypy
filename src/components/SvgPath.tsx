export function SvgPath() {
	return (
		<svg
			viewBox="0 0 460 460"
			className="w-section-svg rounded-[60px] lg:self-center"
		>
			<path
				id="question-line"
				d="
					M 130 70
					C 10 70,
					10 210,
					130 210
				"
				strokeDasharray="8"
				className="stroke-main-green fill-none stroke-2"
			/>

			<path
				id="feedback-line"
				d="
					M 330 210
					C 450 210,
					450 390,
					300 375
				"
				className="stroke-main-purple fill-none"
			/>

			<circle
				r="6"
				className="fill-main-green drop-shadow-[0_0_10px_var(--color-main-green)]"
			>
				<animateMotion dur="5s" begin="0s" repeatCount="indefinite">
					<mpath href="#question-line" />
				</animateMotion>
			</circle>

			<circle
				r="6"
				className="fill-main-purple drop-shadow-[0_0_10px_var(--color-main-purple)]"
			>
				<animateMotion dur="5s" begin="5s" repeatCount="indefinite">
					<mpath href="#feedback-line" />
				</animateMotion>
			</circle>

			<ellipse
				cx="230"
				cy="70"
				rx="100"
				ry="50"
				strokeDasharray="8"
				className="stroke-main-green fill-white/5 stroke-2 drop-shadow-[0_0_10px_#00FF59]"
			/>

			<image
				x="190"
				y="35"
				href="/assets/images/question-mark.png"
				width={70}
				height={70}
				className="animate-swing origin-bottom"
			/>

			<rect
				x="130"
				y="160"
				width="200"
				height="100"
				rx="10"
				className="stroke-main-purple fill-white/5 stroke-2 drop-shadow-[0_0_10px_var(--color-main-purple)]"
			/>

			<image
				x="190"
				y="170"
				href="/assets/images/feedback.png"
				width={80}
				height={80}
				className="animate-pulse"
			/>

			<circle
				cx="230"
				cy="370"
				r="70"
				className="stroke-main-cyan fill-white/5 stroke-2 drop-shadow-[0_0_10px_var(--color-main-cyan)]"
			/>

			<image
				x="190"
				y="330"
				href="/assets/images/approved.png"
				width={80}
				height={80}
				className="animate-grow origin-center transform-fill"
			/>
		</svg>
	);
}
