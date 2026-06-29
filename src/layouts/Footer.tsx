import { Link } from 'react-router-dom';

const footerMap = {
	support: 'Suporte',
	'be-a-partner': 'Seja um parceiro',
	'about-us': 'Sobre nós',
};

const iconsMap = {
	github: 'GitHub',
	instagram: 'Instagram',
	x: 'X',
	youtube: 'YouTube',
};

export function Footer() {
	return (
		<footer className="bg-main-black/90 relative flex flex-col gap-y-[10px] px-[30px] pt-[60px] pb-[20px]">
			<div className="flex flex-col items-center gap-y-10">
				<div>
					<ul className="flex gap-x-10">
						{Object.entries(footerMap).map(([key, value]) => (
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
								<a href="#" rel="noopener noreferrer" target="_blank">
									<img
										src={`/assets/images/icons/${key}.png`}
										alt={value}
										className="transition-transform duration-300 hover:scale-110"
									/>
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex items-end justify-between text-sm">
				<p>© 2026 TryCode Technologies Ltda. Todos os direitos reservados.</p>
				<div>
					<p className="mb-2">Atribuições</p>
					<ul className="ml-0.5 flex flex-col gap-0.5">
						<li>
							Ícones fornecidos por{' '}
							<a
								href="https://icons8.com.br"
								rel="noopener noreferrer"
								target="_blank"
								className="hover:text-main-green underline transition-colors duration-300"
							>
								Icons8
							</a>
							.
						</li>
						<li>
							Algumas ilustrações foram fornecidos pela{' '}
							<a
								href="https://www.magnific.com"
								rel="noopener noreferrer"
								target="_blank"
								className="hover:text-main-purple underline transition-colors duration-300"
							>
								Magnific
							</a>
							.
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
}
