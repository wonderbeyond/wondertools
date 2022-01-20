import * as emojiData from '../emoji-data';
import Fuse from 'fuse.js'

export interface EmojiChar {
  char: string;
  group: EmojiGroup;
  name: string;
  points: string[];
  status: emojiData.StatusAbbr;
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
  keys: ["char", "name", "group"]
};

export default class EmojiDB {
  chars: EmojiChar[];
  charsIndexedByChar: Map<string, EmojiChar>
  topGroups: EmojiGroup[];
  fuse: Fuse<FuseMaterial>;

  constructor() {
    this.chars = emojiData.chars;
    this.topGroups = emojiData.topGroups;
    this.charsIndexedByChar = new Map(this.chars.map(e => [e.char, e]));
    const FuseMaterials = this.chars.map(e => ({
      "char": e.char,
      "name": e.name,
      "group": e.group.name,
    }));
    this.fuse = new Fuse(FuseMaterials, fuseOptions);
  }

  async query (params: QueyParams): Promise<Set<string> | undefined> {
    let finalRes: EmojiChar[] | undefined;

    if (params.search) {
      let searched = this.fuse.search(params.search);
      console.log('Searched:', searched.length)
      finalRes = searched.map(
        e => this.charsIndexedByChar.get(e.item.char)
      );
    }

    if (params.group) {
      finalRes = (finalRes || this.chars).filter(e => e.group.abbr == params.group.abbr);
    }

    // undefined result means all!
    return finalRes ? new Set(finalRes.map(e => e.char)) : undefined;
  }
}
