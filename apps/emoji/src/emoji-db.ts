import emojiData from '../emoji-data';
import Fuse from 'fuse.js'

export interface EmojiChar {
  char: string;
  group: string;
  name: string;
  points: string[];
  status: string;
  subgroup: string;
  version: string;
}

export interface EmojiGroup {
  name: string;
  abbr: string;
  reprchar?: string;
  parent?: string;
}

export interface QueyParams {
  search: string;
  group: EmojiGroup;
}

interface FuseMaterial {
  char: string;
  name: string;
}

const fuseOptions = {
  useExtendedSearch: true,
  includeScore: false,
  threshold: 0.3,
  keys: ["char", "name"]
};

export default class EmojiDB {
  chars: EmojiChar[];
  charsIndexedByChar: Map<string, EmojiChar>
  groups: EmojiGroup[];
  fuse: Fuse<FuseMaterial>;

  constructor() {
    this.chars = emojiData.chars;
    this.groups = emojiData.groups;
    this.charsIndexedByChar = new Map(this.chars.map(e => [e.char, e]));
    const FuseMaterials = this.chars.map(e => {return {"char": e.char, "name": e.name}});
    this.fuse = new Fuse(FuseMaterials, fuseOptions);
  }

  get topGroups() {
    return this.groups.filter(e => !e.parent);
  }

  query (params: QueyParams): EmojiChar[] {
    let finalRes = emojiData.chars;

    if (params.search) {
      let searched = this.fuse.search(params.search);
      console.log('Searched:', searched.length)
      finalRes = searched.map(
        e => this.charsIndexedByChar.get(e.item.char)
      );
    }

    if (params.group) {
      finalRes = finalRes.filter(e => e.group == params.group.abbr);
    }

    return finalRes;
  }
}
