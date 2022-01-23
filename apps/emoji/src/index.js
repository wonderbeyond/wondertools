import "core-js/stable/index.js";
import "regenerator-runtime/runtime.js";

import App from './App.svelte';
import './global.scss';

export default new App({
	target: document.getElementById('root'),
	props: {}
});
