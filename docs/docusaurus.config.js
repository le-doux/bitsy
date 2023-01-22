// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const theme = require('prism-react-renderer/themes/vsLight');
const darkTheme = require('prism-react-renderer/themes/vsDark');
const fs = require('fs');
const path = require('path');

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Bitsy Docs',
	tagline: 'Documentation for the Bitsy editor!',
	// TODO: update urls with actual host
	url: 'https://your-docusaurus-test-site.com',
	baseUrl: '/docs/',
	baseUrlIssueBanner: false,
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: './img/favicon.ico',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'le-doux', // Usually your GitHub org/user name.
	projectName: 'bitsy', // Usually your repo name.

	// Even if you don't use internalization, you can use this field to set useful
	// metadata like html lang. For example, if your site is Chinese, you may want
	// to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: fs
			.readdirSync(path.resolve(__dirname, './i18n'))
			.filter(i => fs.lstatSync(path.resolve(__dirname, './i18n', i)).isDirectory())
			.concat('en'),
	},

	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					routeBasePath: '/',
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: params => {
						const base = 'https://github.com/le-doux/bitsy';
						const localized = params.locale !== 'en';
						const localPath = `docs/${localized ? `i18n/${params.locale}/docusaurus-plugin-content-docs/current` : 'docs'}/${params.docPath}`;
						const exists = fs.existsSync(path.resolve(__dirname, '../', localPath));
						return exists
							? `${base}/edit/main/${localPath}`
							: `${base}/new/main?filename=${localPath}`;
					},
				},
				blog: false,
				pages: false,
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			navbar: {
				title: 'Bitsy Docs',
				logo: {
					alt: 'Bitsy Docs Logo',
					src: 'img/logo.svg',
				},
				items: [
					// space
					// {
					//   type: 'docsVersionDropdown',
					//   position: 'right',
					// },
					{
						type: 'localeDropdown',
						position: 'right',
					},
					{
						href: 'https://github.com/le-doux/bitsy',
						label: 'GitHub',
						position: 'right',
					},
				],
			},
			footer: {
				style: 'dark',
				links: [
					{
						label: 'Editor',
						href: 'https://make.bitsy.org',
					},
					{
						label: 'Forum',
						href: 'https://ledoux.itch.io/bitsy/community',
					},
					{
						label: 'Blog',
						href: 'https://ledoux.itch.io/bitsy/devlog',
					},
					{
						label: 'Twitter',
						href: 'https://twitter.com/adamledoux',
					},
				],
				copyright: `Copyright © ${new Date().getFullYear()} Adam Le Doux`,
			},
			prism: {
				theme,
				darkTheme,
			},
		}),

	clientModules: [require.resolve('./client.js')],
};

module.exports = config;
