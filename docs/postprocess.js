// adapted from https://github.com/facebook/docusaurus/issues/448#issuecomment-908777029

'use strict';

const fs = require('fs-extra');
const path = require('path');
const config = require('./docusaurus.config');
const recursiveReaddir = require('recursive-readdir');

const buildDirectory = path.join(__dirname, '../editor');
const absoluteUrlRegExp = /(href|src)="(?!http[s]|ftp?:\/\/)([^"|#]+)"/g;
const absoluteUrlRegExpCss = /(url)\("?(?!http[s]|ftp?:\/\/)([^"|#]+?)"?\)/g;

const isDirectory = dirPath => path.extname(dirPath) === '';

const convertAbsolutePathsToRelative = (content, filePath) =>
	content
		.replace(absoluteUrlRegExp, (_absoluteUrl, $1, $2) => {
			if (_absoluteUrl.includes('data:')) return _absoluteUrl;
			const currentDirPath = path.dirname(filePath);
			const relativeDirPath = currentDirPath === '.' ? '.' : path.relative(currentDirPath, '');

			let relativePath = path.join(relativeDirPath, $2);
			if (isDirectory(relativePath)) {
				relativePath = path.join(relativePath, 'index.html');
			}
			relativePath = relativePath.replaceAll('\\', '/');

			return `${$1}="./${relativePath}"`;
		})
		.replace(absoluteUrlRegExpCss, (_absoluteUrl, $1, $2) => {
			if (!filePath.includes('.css') || _absoluteUrl.includes('data:')) return _absoluteUrl;
			const currentDirPath = path.dirname(filePath);
			const relativeDirPath = currentDirPath === '.' ? '.' : path.relative(currentDirPath, '');

			let relativePath = path.join(relativeDirPath, $2);
			relativePath = relativePath.replaceAll('\\', '/');

			return `${$1}("./${relativePath}")`;
		});

const websiteTextualFileExtensions = ['.css', '.js', '.html', '.xml'];
const isNotWebsiteTextualFile = (filePath, stats) => !(stats.isDirectory() || websiteTextualFileExtensions.includes(path.extname(filePath)));

const postProcess = async () => {
	const filePaths = await recursiveReaddir(buildDirectory + config.baseUrl, [isNotWebsiteTextualFile]);
	await Promise.all(
		filePaths.map(async filePath => {
			let content = await fs.readFile(filePath);
			const relativePath = path.relative(buildDirectory, filePath);
			content = convertAbsolutePathsToRelative(String(content), relativePath);
			// disable hydration on file protocol
			content = content.replace(/(if\s*\()(ExecutionEnvironment|l\.Z\.canUseDOM)/g, '$1!location.protocol.startsWith("file") && $2');
			await fs.writeFile(filePath, content);
		})
	);
};

postProcess();
