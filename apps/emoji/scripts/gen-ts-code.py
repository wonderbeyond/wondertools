import json
from textwrap import dedent

import yaml
import click


@click.command()
@click.option('-s', '--source', required=True)
@click.option('-o', '--output', required=True)
def cli(source, output):
    with open(source) as f:
        data = yaml.safe_load(f)

    with open(output, 'w') as f:
        f.write(dedent(f"""
        const emojiData = {json.dumps(data, ensure_ascii=False)};
        export default emojiData;
        """))


if __name__ == '__main__':
    cli()
