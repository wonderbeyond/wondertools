default:
	true

dev:
	webpack serve

build:
	webpack --mode production
	cp CNAME dist/

install-apps: apps.yaml
	node scripts/install-apps.js

gh-pages: build install-apps
	gh-pages -d dist -b gh-pages
