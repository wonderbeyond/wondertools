<Drawer variant="modal" bind:open={drawerOpen}>
  <DrawerHeader>
    <DrawerTitle>Find Emojis</DrawerTitle>
    <DrawerSubtitle>From a total number of {Intl.NumberFormat().format(db.chars.length)}.</DrawerSubtitle>
  </DrawerHeader>
  <DrawerContent>
    <List class="group-list-filter">
      <ListItem activated={!selectedGroup}
        on:SMUI:action={async _ => await selectGroup(null)}
      >
        <ListGraphic class="material-icons">select_all</ListGraphic>
        <ListText>All Groups</ListText>
      </ListItem>
      {#each groupChoices as group}
      <ListItem activated={group === selectedGroup}
        on:SMUI:action={async _ => await selectGroup(group)}
      >
        <ListText class="list-text-looks-like-list-graphic">{group.reprchar}</ListText>
        <ListText>{group.name}</ListText>
      </ListItem>
      {/each}
      </List>
  </DrawerContent>
</Drawer>

<DrawerScrim />

<DrawerAppContent>
  <TopAppBar bind:this={topAppBar} variant="fixed">
    <Row>
      <Section class="respond-above-media-lg" style="flex:none">
        <Title>Find Emojis</Title>
      </Section>
      <Section class="search-box-container">
        <Paper
          class="search-box"
        >
          <TextfieldIcon class="material-icons mdc-theme--text-icon-on-background">search</TextfieldIcon>
          <Input class="search-input"
            bind:value={searchString}
            on:keyup={handleSearchWordChange}
            on:focus={() => (searchBoxFocused = true)}
            on:blur={() => (searchBoxFocused = false)}
            placeholder="e.g. smile, love etc."
          />
          {#if searchString}
          <Icon class="material-icons clear-icon"
            role="button" on:click={clearSearchInput}>clear</Icon>
          {/if}
        </Paper>
      </Section>
      <Section align="end" class="group-filter-container respond-above-media-md">
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
      <Section align="end" toolbar class="respond-under-media-md">
        <IconButton class="material-icons material-icons-filled" on:click={e => drawerOpen = true}>auto_awesome_motion</IconButton>
      </Section>
    </Row>

    {#if inQuery}
      <LinearProgress class="top-linear-progress" indeterminate />
    {/if}
  </TopAppBar>

  <AutoAdjust {topAppBar}></AutoAdjust>

  <LayoutGrid>
    {#each db.chars as emoji, i}
      <Cell span={1}
        class="mdc-emoji-cell {(filteredChars === undefined || filteredChars.has(emoji.char)) ? 'emoji-matched': 'emoji-not-matched'}">
        <div class="emoji-cell" class:active={activeEmoji == emoji} title={emoji.name}
          use:longpress={300}
          on:shortpress={async e => {
            activeEmoji = emoji;
            showEmojiCard = true;
          }} on:longpress={e => (
            activeEmoji = emoji,
            copyActiveEmojiToClipboard()
          )}
        >{emoji.char}</div>
      </Cell>
    {/each}
  </LayoutGrid>
</DrawerAppContent>

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

<Snackbar bind:this={snackbarAboutEmojiCopied}>
  {#if lastCopiedEmoji}
  <SnackbarLabel>Copied {lastCopiedEmoji.char} into system clipboard</SnackbarLabel>
  <SnackbarActions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </SnackbarActions>
  {/if}
</Snackbar>

<script lang="ts">
  import { Icon } from '@smui/common';
  import TopAppBar, {
    Row,
    Section,
    Title,
    AutoAdjust,
    TopAppBarComponentDev,
  } from '@smui/top-app-bar';
  import Drawer, {
    AppContent as DrawerAppContent,
    Header as DrawerHeader,
    Title as DrawerTitle,
    Subtitle as DrawerSubtitle,
    Content as DrawerContent,
    Scrim as DrawerScrim,
  } from '@smui/drawer';
  import List, {
    Item as ListItem,
    Graphic as ListGraphic,
    Text as ListText,
  } from '@smui/list';
  import { Input } from '@smui/textfield';
  import TextfieldIcon from '@smui/textfield/icon';
  import Paper from '@smui/paper';
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

  let drawerOpen = false;
  let inQuery = false;
  let searchBoxFocused = false;
  let selectedGroup: EmojiGroup | null = null;
  let searchString: string | null = null;
  let filteredChars: Set<string> | undefined;
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

  async function clearSearchInput(e) {
    searchString = null;
    await handleFilterGroupChange(e);
  }

  async function selectGroup (group: EmojiGroup | null) {
    selectedGroup = group;
    drawerOpen = false;
    await handleFilterGroupChange();
  }

  async function handleFilterGroupChange(e?) {
    inQuery = true;
    clearTimeout(keyDownRefilterTimout);
    setTimeout(async () => {
      await applyFilter()
      inQuery = false;
    }, 0);
  }

  async function applyFilter() {
    const params: QueyParams = {search: searchString, group: selectedGroup}
    // console.debug('Filtering by', params);
    filteredChars = await db.query(params);
  }
</script>
