default:
	true

official.yaml:
	python3 scripts/gen-emoji-data.py > official.yaml

emoji-data.ts: official.yaml
	python3 scripts/gen-ts-code.py -s official.yaml -o emoji-data.ts

dev: emoji-data.ts
	webpack serve

build:
	webpack --mode production
