import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
	document.documentElement.dataset.hosted = !window.location.protocol.startsWith('file');
	document.documentElement.dataset.embedded = window.parent !== window;
}
