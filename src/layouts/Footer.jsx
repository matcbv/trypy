import { Link } from 'react-router-dom';
import { labelMap } from '../constants/labelMap';

export function Footer() {
	const iconsMap = {
		github: 'GitHub',
		instagram: 'Instagram',
		x: 'X',
		youtube: 'YouTube',
	};

	return (
		<footer className="relative z-20 bg-[var(--main-black)]">
			<div className="flex flex-col items-center gap-y-10 px-6 pt-14 pb-6 backdrop-blur-xl">
				<div>
					<ul className="flex gap-x-10">
						{Object.entries(labelMap).map(([key, value]) => (
							<Link to={`/${key}`} className="footer-links" key={key}>
								{value}
							</Link>
						))}
					</ul>
				</div>
				<div className="flex flex-col gap-y-4">
					<p>Conheça nossas redes sociais:</p>
					<ul className="flex justify-around">
						{Object.entries(iconsMap).map(([key, value]) => (
							<li key={key}>
								<a href="#">
									<img
										src={`/assets/images/icons/${key}.png`}
										alt={value}
										className="transition-transform hover:scale-105"
									/>
								</a>
							</li>
						))}
					</ul>
				</div>
				<p className="self-start text-sm">
					© 2025 TryPy. Todos os direitos reservados. Icons by{' '}
					<a
						href="https://icons8.com.br/"
						className="underline transition-colors hover:text-[var(--main-green)]"
						target="_blank"
					>
						Icons8
					</a>
				</p>
			</div>
		</footer>
	);
}
