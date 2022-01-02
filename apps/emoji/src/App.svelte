<div class="margins">
  <Textfield
    label="Find Emojis"
    variant="outlined"
    bind:value={searchString}
    on:focus={() => (searchBoxFocused = true)}
    on:blur={() => (searchBoxFocused = false)}
    on:keyup={handleSearchStringChange}
  >
    <Icon slot="leadingIcon" class="material-icons" role="button">search</Icon>
    <HelperText slot="helper">E.g. smile, love etc.</HelperText>
  </Textfield>
</div>


<LayoutGrid>
  {#each filteredChars as char, i}
    <Cell span={1}>
      <div class="emoji-cell" title={char.name}>{char.char}</div>
    </Cell>
  {/each}
</LayoutGrid>

<script lang="ts">
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import Icon from '@smui/textfield/icon';
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import EmojiDB, {EmojiChar, QueyParams} from './emoji-db';

  let db = new EmojiDB();
  let searchBoxFocused = false;
  let searchString: string | null = null;
  let filteredChars: EmojiChar[] = [];
  let keyDownRefilterTimout = null;

  function handleSearchStringChange(e) {
    clearTimeout(keyDownRefilterTimout);
    keyDownRefilterTimout = setTimeout(applyFilter, 260);
  }

  function applyFilter() {
    const params: QueyParams = {search: searchString}
    console.log('Filtering by', params);
    filteredChars = db.query(params);
  }

  applyFilter()
</script>

<style>
  .emoji-cell {
    font-size: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
