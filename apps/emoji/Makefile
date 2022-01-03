default:
	true

MY_SMUI_THEMED = dist/my-smui.css

emoji-data.yaml:
	python3 scripts/gen-emoji-data.py > emoji-data.yaml

emoji-data.ts: emoji-data.yaml
	python3 scripts/gen-ts-code.py -s emoji-data.yaml -o emoji-data.ts

$(MY_SMUI_THEMED): src/theme/*.scss
	mkdir -p dist
	smui-theme compile dist/my-smui.css -i src/theme

dev: emoji-data.ts $(MY_SMUI_THEMED)
	webpack serve

build:
	webpack --mode production
