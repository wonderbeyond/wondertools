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
          on:keyup={handleSearchWordChange}
          on:focus={() => (searchBoxFocused = true)}
          on:blur={() => (searchBoxFocused = false)}
          placeholder="e.g. smile, love etc."
          class="search-input"
        />
      </Paper>
    </Section>
    <Section align="end" class="group-filter-container respond-to-media-md">
      <ChipSet
        color="secondary"
        chips={groupChoices}
        let:chip
        choice
        bind:selectedGroup
        style="width:100%; height:100%; justify-content:center; overflow:hidden"
      >
        <Chip {chip} on:click={async (e) => {
            selectedGroup = (selectedGroup == chip ? null : chip);
            await handleFilterGroupChange(e);
          }}
          class="mdc-elevation--z{selectedGroup == chip ? 0 : 0}"
        >
          <ChipText>
            <span class="chip-text-container">
              <span class="text">{chip.reprchar}</span>
              {#if selectedGroup == chip}<span class="tray"></span>{/if}
            </span>
          </ChipText>
        </Chip>
      </ChipSet>
    </Section>
    <!-- <Section align="end" toolbar style="flex: none">
      <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton>
    </Section> -->
  </Row>

  {#if inQuery}
    <LinearProgress class="top-linear-progress" indeterminate />
  {/if}
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
  import { Input } from '@smui/textfield';
  import Paper from '@smui/paper';
  import Icon from '@smui/textfield/icon';
  import Chip, { Set as ChipSet, Text as ChipText } from '@smui/chips';
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import LinearProgress from '@smui/linear-progress';

  import EmojiDB, {EmojiChar, QueyParams, EmojiGroup} from './emoji-db';

  let topAppBar: TopAppBarComponentDev;

  let db = new EmojiDB();
  let groupChoices = db.topGroups

  let inQuery = false;
  let searchBoxFocused = false;
  let selectedGroup: EmojiGroup | null = null;
  let searchString: string | null = null;
  let filteredChars: EmojiChar[] = [];
  let keyDownRefilterTimout = null;

  async function handleSearchWordChange(e) {
    inQuery = true;
    clearTimeout(keyDownRefilterTimout);
    keyDownRefilterTimout = setTimeout(async () => {
      await applyFilter();
      inQuery = false;
    }, 200);
  }
  async function handleFilterGroupChange(e) {
    inQuery = true;
    clearTimeout(keyDownRefilterTimout);
    setTimeout(async () => {
      await applyFilter()
      inQuery = false;
    }, 0);
  }

  async function applyFilter() {
    const params: QueyParams = {search: searchString, group: selectedGroup}
    console.log('Filtering by', params);
    filteredChars = await db.query(params);
  }

  applyFilter()
</script>
