from textwrap import dedent

import jinja2
import yaml
import click


@click.command()
@click.option('-s', '--source', required=True)
@click.option('-o', '--output', required=True)
def cli(source, output):
    with open(source) as f:
        data = yaml.safe_load(f)

    top_groups = [g for g in data['groups'] if not g.get('parent')]
    top_group_idx_by_abbr = {
        g['abbr']: i for i, g in enumerate(top_groups)
    }

    with open(output, 'w') as f:
        tmpl = jinja2.Template(dedent("""

        export enum StatusAbbr {
            FQ = 'fully-qualified',
            MQ = 'minimally-qualified',
            UQ = 'unqualified',
            C = 'component',
        }

        export let topGroups = [
            {%- for g in top_groups %}
            {{g | tojson()}},
            {%- endfor %}
        ];
        export let chars = [
            {%- for c in data.chars %}
            {
                char: "{{c.char}}",
                name: "{{c.name}}",
                points: {{c.points|tojson()}},
                version: "{{c.version}}",
                group: topGroups[{{top_group_idx_by_abbr[c.group]}}],
                subgroup: "{{c.subgroup}}",
                status: StatusAbbr.{{c.status}},
            },
            {%- endfor %}
        ];
        """), undefined=jinja2.StrictUndefined)
        f.write(tmpl.render(locals()))


if __name__ == '__main__':
    cli()
