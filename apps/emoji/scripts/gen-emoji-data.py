"""https://unicode.org/emoji/charts/full-emoji-list.html"""
from typing import List
import re
from dataclasses import dataclass, asdict
import enum

import yaml
import requests

EMOJI_VERSION = '14.0'
GROUP_DEF_LEAD = '# group: '
SUBGROUP_DEF_LEAD = '# subgroup: '


class GroupAbbr(enum.Enum):
    SE = 'Smileys & Emotion'
    S = 'Symbols'
    PB = 'People & Body'
    TP = 'Travel & Places'
    AN = 'Animals & Nature'
    C = 'Component'
    AC = 'Activities'
    F = 'Flags'
    FD = 'Food & Drink'
    OB = 'Objects'


class SubGroupAbbr(enum.Enum):
    FH = 'face-hand'
    C = 'currency'
    FF = 'food-fruit'
    FA = 'food-asian'
    HP = 'hand-prop'
    FP = 'food-prepared'
    BP = 'book-paper'
    OS = 'other-symbol'
    T = 'time'
    PS = 'person-symbol'
    HFO = 'hand-fingers-open'
    Ma = 'math'
    Me = 'medical'
    W = 'warning'
    E = 'emotion'
    H = 'hands'
    PO = 'place-other'
    PG = 'person-gesture'
    ML = 'mail'
    FC = 'face-concerned'
    AS = 'av-symbol'
    Co = 'computer'
    FNS = 'face-neutral-skeptical'
    Mu = 'music'
    F = 'family'
    G = 'gender'
    OO = 'other-object'
    S = 'science'
    PR = 'place-religious'
    TS = 'transport-sign'
    HSF = 'hand-single-finger'
    CF = 'cat-face'
    Ar = 'arrow'
    Ho = 'household'
    L = 'lock'
    PF = 'person-fantasy'
    PlO = 'plant-other'
    P = 'person'
    AM = 'animal-marine'
    AA = 'animal-amphibian'
    AB = 'animal-bird'
    MF = 'monkey-face'
    Pu = 'punctuation'
    To = 'tool'
    AR = 'animal-reptile'
    Wr = 'writing'
    FUW = 'face-unwell'
    LV = 'light & video'
    SF = 'subdivision-flag'
    Ga = 'game'
    BoP = 'body-parts'
    PeR = 'person-resting'
    PA = 'person-activity'
    R = 'religion'
    FS = 'food-sweet'
    FN = 'face-negative'
    SW = 'sky & weather'
    Z = 'zodiac'
    FaS = 'face-smiling'
    AnB = 'animal-bug'
    FaA = 'face-affection'
    PM = 'place-map'
    HS = 'hair-style'
    PB = 'place-building'
    TA = 'transport-air'
    M = 'money'
    HFC = 'hand-fingers-closed'
    Ge = 'geometric'
    FaH = 'face-hat'
    MI = 'musical-instrument'
    Of = 'office'
    Fl = 'flag'
    PeRo = 'person-role'
    AC = 'arts & crafts'
    Ev = 'event'
    FaSl = 'face-sleepy'
    FM = 'food-marine'
    AnM = 'animal-mammal'
    Sp = 'sport'
    Hot = 'hotel'
    TW = 'transport-water'
    PlG = 'place-geographic'
    CoF = 'country-flag'
    FG = 'face-glasses'
    K = 'keycap'
    FT = 'face-tongue'
    AwM = 'award-medal'
    Cl = 'clothing'
    PeS = 'person-sport'
    D = 'drink'
    ST = 'skin-tone'
    Di = 'dishware'
    So = 'sound'
    Ph = 'phone'
    PlF = 'plant-flower'
    Al = 'alphanum'
    FV = 'food-vegetable'
    TG = 'transport-ground'
    FaCo = 'face-costume'
    HFP = 'hand-fingers-partial'


class StatusAbbr(enum.Enum):
    FQ = 'fully-qualified'
    MQ = 'minimally-qualified'
    UQ = 'unqualified'
    C = 'component'


@dataclass
class Emoji:
    group: str
    subgroup: str
    char: str
    name: str
    points: List[str]
    version: str
    status: str


if __name__ == '__main__':
    resp = requests.get('https://unicode.org/Public/emoji/14.0/emoji-test.txt')
    resp.raise_for_status()

    subgroups = {
        g.name: {"subgroups": {}}
        for g in GroupAbbr
    }
    data = {
        "chars": []
    }

    emoji_line_pattern = re.compile(
        r'^(?P<points>(\w+\s+)*\w+)\s*;\s*(?P<status>[\w\-]+)\s+'
        r'#\s+(?P<char>[^\s]+)\s+'
        r'(?P<version>E[\d\.]+)\s+'
        r'(?P<name>.+)$'
    )

    cur_group: str = None
    cur_subgroup: str = None

    for line in resp.text.split('\n'):
        if line.startswith(GROUP_DEF_LEAD):
            cur_group = GroupAbbr(line[len(GROUP_DEF_LEAD):]).name
            continue
        if line.startswith(SUBGROUP_DEF_LEAD):
            cur_subgroup_name = line[len(SUBGROUP_DEF_LEAD):]
            cur_subgroup = SubGroupAbbr(cur_subgroup_name).name
            subgroups[cur_group]['subgroups'][cur_subgroup] = {
                'name': cur_subgroup_name,
                'abbr': cur_subgroup,
            }
            continue
        if line and not line.startswith('#'):
            m = emoji_line_pattern.match(line)
            emoji = Emoji(
                group=cur_group,
                subgroup=cur_subgroup,
                char=m.group('char'),
                name=m.group('name'),
                points=m.group('points').split(' '),
                version=m.group('version'),
                status=StatusAbbr(m.group('status')).name,
            )
            data['chars'].append(asdict(emoji))

    data['groups'] = [
        *({"name": g.value, "abbr": g.name} for g in GroupAbbr),
        *({**sg, "parent": g} for g in subgroups for sg in subgroups[g]['subgroups'].values())
    ]
    print(yaml.safe_dump(data, allow_unicode=True))
