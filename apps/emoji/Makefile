default:
	true

MY_SMUI_THEMED = dist/my-smui.css

emoji-data.yaml: scripts/gen-emoji-data.py
	python3 scripts/gen-emoji-data.py > emoji-data.yaml

emoji-data.ts: emoji-data.yaml scripts/gen-ts-code.py
	python3 scripts/gen-ts-code.py -s emoji-data.yaml -o emoji-data.ts

$(MY_SMUI_THEMED): src/theme/*.scss
	mkdir -p dist
	smui-theme compile dist/my-smui.css -i src/theme

dev: emoji-data.ts $(MY_SMUI_THEMED)
	webpack serve

build: emoji-data.ts $(MY_SMUI_THEMED)
	webpack --mode production
	cp -r public/* dist

release: build
	node scripts/mk-release.js

clean:
	rm -rf dist
	rm -rf emoji-data.yaml emoji-data.ts
