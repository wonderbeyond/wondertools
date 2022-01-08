<TopAppBar bind:this={topAppBar} variant="fixed">
  <Row>
    <Section class="respond-to-media-lg" style="flex:none">
      <!-- <IconButton class="material-icons">menu</IconButton> -->
      <Title>Find Emojis</Title>
    </Section>
    <Section class="search-box-container {searchBoxFocused ? 'focused': ''}">
      <Paper
        class="search-box"
      >
        <Icon class="material-icons mdc-theme--text-icon-on-background">search</Icon>
        <Input
          bind:value={searchString}
          on:keyup={handleFilterFactorsChange}
          on:focus={() => (searchBoxFocused = true)}
          on:blur={() => (searchBoxFocused = false)}
          placeholder="e.g. smile, love etc."
          class="search-input"
        />
      </Paper>
    </Section>
    <Section align="end" class="group-filter-container respond-to-media-md">
      <ChipSet chips={groupChoices} let:chip choice bind:selectedGroup
        style="width:100%; height:100%; justify-content:center; overflow:hidden"
      >
        <Chip {chip} on:click={(e) => {
            selectedGroup = (selectedGroup == chip ? null : chip);
            handleFilterFactorsChange(e);
          }}
          class="mdc-elevation--z{selectedGroup == chip ? 10 : 0}"
        >
          <ChipText>{chip.reprchar}</ChipText>
        </Chip>
      </ChipSet>
    </Section>
    <!-- <Section align="end" toolbar style="flex: none">
      <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
    </Section> -->
  </Row>
</TopAppBar>

<AutoAdjust {topAppBar}></AutoAdjust>

<LayoutGrid>
  {#each filteredChars as char, i}
    <Cell span={1}>
      <div class="emoji-cell" title={char.name}>{char.char}</div>
    </Cell>
  {/each}
</LayoutGrid>

<script lang="ts">
  import TopAppBar, {
    Row,
    Section,
    Title,
    AutoAdjust,
    TopAppBarComponentDev,
  } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { Input } from '@smui/textfield';
  import Paper from '@smui/paper';
  import Icon from '@smui/textfield/icon';
  import Chip, { Set as ChipSet, Text as ChipText } from '@smui/chips';
  import LayoutGrid, { Cell } from '@smui/layout-grid';

  import EmojiDB, {EmojiChar, QueyParams, EmojiGroup} from './emoji-db';

  let topAppBar: TopAppBarComponentDev;

  let db = new EmojiDB();
  let searchBoxFocused = false;
  let groupChoices = db.topGroups
  let selectedGroup: EmojiGroup | null = null;
  let searchString: string | null = null;
  let filteredChars: EmojiChar[] = [];
  let keyDownRefilterTimout = null;

  function handleFilterFactorsChange(e) {
    clearTimeout(keyDownRefilterTimout);
    keyDownRefilterTimout = setTimeout(applyFilter, 260);
  }

  function applyFilter() {
    const params: QueyParams = {search: searchString, group: selectedGroup}
    console.log('Filtering by', params);
    filteredChars = db.query(params);
  }

  applyFilter()
</script>

<style lang="scss">
  @use './theme';

  :global(.search-box-container) {
    flex: 1 1.2 20em;
    padding-left: 1.5em;
    padding-right: 1.5em;
  }

  :global(.group-filter-container) {
    flex-wrap: nowrap;
  }

  :global(.search-box) {
    display: flex;
    align-items: center;
    padding: 0;
    width: 100%;
    height: 80%;
    border-radius: 1.5em  !important;
  }

  :global(.search-box > *) {
    display: inline-block;
  }

  :global(.search-input) {
    color: var(--mdc-theme-on-surface, theme.$on-surface);
  }
  :global(.search-input::placeholder) {
    color: var(--mdc-theme-on-surface, theme.$on-secondary);
    opacity: 0.6;
  }

  .emoji-cell {
    font-size: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
