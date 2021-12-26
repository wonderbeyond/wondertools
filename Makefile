default:
	true

dev:
	webpack serve

build:
	webpack --mode production
	cp CNAME dist/

gh-pages:
	npm run build
	gh-pages -d dist -b gh-pages
