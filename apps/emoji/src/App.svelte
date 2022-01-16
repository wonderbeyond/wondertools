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
        bind:selected={selectedGroup}
        style="width:100%; height:100%; justify-content:center; overflow:hidden"
      >
        <TooltipWrapper>
          <Chip {chip} on:click={handleFilterGroupChange}>
            <ChipText>
              <span class="chip-text-container">
                <span class="text">{chip.reprchar}</span>
                {#if selectedGroup == chip}<span class="tray"></span>{/if}
              </span>
            </ChipText>
          </Chip>
          <Tooltip>{chip.name}</Tooltip>
        </TooltipWrapper>
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
      <div class="emoji-cell" class:active={activeEmoji == char} title={char.name}
        use:longpress={300}
        on:shortpress={async e => {
          activeEmoji = char;
          showEmojiCard = true;
        }} on:longpress={e => (
          activeEmoji = char,
          copyActiveEmojiToClipboard()
        )}
      >{char.char}</div>
    </Cell>
  {/each}
</LayoutGrid>

<Dialog class="emoji-card" bind:open={showEmojiCard} on:SMUIDialog:closed={emojiCardClosedHook}>
  <div bind:clientWidth={emojiCardWidth}>
    <div class="head-bar"></div>
    {#if showEmojiCard}
      <DialogContent class="content">
        <div
          tabindex=0
          class="emoji-itself"
          title="Click to copy {activeEmoji.char}"
          style="font-size:{emojiCardWidth / 3 * 0.85}px; width:{emojiCardWidth / 3}px; min-height:{emojiCardWidth / 3}px"
          on:click={copyActiveEmojiToClipboard}
        >
          {activeEmoji.char}
        </div>
        <div class="emoji-properties">
          <div class="emoji-title">{activeEmoji.name}</div>
          <div class="emoji-points">Points: {#each activeEmoji.points as point}
            <span class="point">{point}</span>
            {/each}</div>
          <div class="emoji-group">Group: {activeEmoji.group.name}</div>
          <div class="emoji-status">Status: {activeEmoji.status}</div>
        </div>
      </DialogContent>
    {/if}
  </div>
</Dialog>

<Snackbar bind:this={snackbarAboutEmojiCopied} timeoutMs={4000}>
  {#if lastCopiedEmoji}
  <SnackbarLabel>Copied {lastCopiedEmoji.char} into system clipboard</SnackbarLabel>
  <SnackbarActions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </SnackbarActions>
  {/if}
</Snackbar>

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
  import IconButton from '@smui/icon-button';
  import Chip, { Set as ChipSet, Text as ChipText } from '@smui/chips';
  import Tooltip, { Wrapper as TooltipWrapper } from '@smui/tooltip';
  import LayoutGrid, { Cell } from '@smui/layout-grid';
  import LinearProgress from '@smui/linear-progress';
  import Dialog, {
    Content as DialogContent,
  } from '@smui/dialog';
  import Snackbar, {
    Label as SnackbarLabel,
    Actions as SnackbarActions,
    SnackbarComponentDev,
  } from '@smui/snackbar';

  import {copyToClipboard} from './utils';
  import { longpress } from './actions/longpress';

  import EmojiDB, {EmojiChar, QueyParams, EmojiGroup} from './emoji-db';

  let topAppBar: TopAppBarComponentDev;
  let snackbarAboutEmojiCopied: SnackbarComponentDev;

  let db = new EmojiDB();
  let groupChoices = db.topGroups

  let inQuery = false;
  let searchBoxFocused = false;
  let selectedGroup: EmojiGroup | null = null;
  let searchString: string | null = null;
  let filteredChars: EmojiChar[] = [];
  let keyDownRefilterTimout = null;
  let activeEmoji: EmojiChar = null;
  let lastCopiedEmoji: EmojiChar = null;
  let showEmojiCard = false;
  let emojiCardWidth: number;

  async function emojiCardClosedHook(e) {
    activeEmoji = null;
    snackbarAboutEmojiCopied && snackbarAboutEmojiCopied.close();
  }

  async function copyActiveEmojiToClipboard() {
    if (snackbarAboutEmojiCopied) {
      snackbarAboutEmojiCopied.close();
    }
    await copyToClipboard(activeEmoji.char);
    lastCopiedEmoji = activeEmoji;
    snackbarAboutEmojiCopied.open();
  }

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
