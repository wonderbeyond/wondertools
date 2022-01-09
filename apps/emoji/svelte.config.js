const autoPreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: autoPreprocess({
    scss: { includePaths: ['src', 'node_modules'] },
  }),
}
