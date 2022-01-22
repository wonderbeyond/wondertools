<Drawer variant="modal" bind:open={drawerOpen}>
  <DrawerHeader>
    <DrawerTitle>Find Emojis</DrawerTitle>
  </DrawerHeader>
  <DrawerContent>
    <List>
      <ListSubheader component={H6}>Filter By Group</ListSubheader>
      <ListItem activated={!selectedGroup} on:SMUI:action={e => {
          selectedGroup = null;
          drawerOpen = false;
          handleFilterGroupChange(e);
        }}>
        <ListText>All Groups</ListText>
      </ListItem>
      {#each groupChoices as group}
        <ListItem activated={group === selectedGroup} on:SMUI:action={e => {
          selectedGroup = group;
          drawerOpen = false;
          handleFilterGroupChange(e);
        }}>
          <ListText>{group.reprchar} {group.name}</ListText>
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
        <IconButton class="material-icons" on:click={e => drawerOpen = true}>menu</IconButton>
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
  import { H6 } from '@smui/common/elements';
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
    Content as DrawerContent,
    Scrim as DrawerScrim,
  } from '@smui/drawer';
  import List, {
    Item as ListItem,
    Text as ListText,
    Subheader as  ListSubheader,
  } from '@smui/list';
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
    console.debug('Filtering by', params);
    filteredChars = await db.query(params);
  }
</script>
