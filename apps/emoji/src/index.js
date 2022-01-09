import "core-js/stable";
import "regenerator-runtime/runtime";

import App from './App.svelte';
import './global.scss';

export default new App({
	target: document.getElementById('root'),
	props: {}
});
