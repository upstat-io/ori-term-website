/**
 * Central source of truth for all keyboard shortcuts.
 * Update here and every page reflects the change.
 *
 * Only shortcuts that are actually implemented in the codebase belong here.
 * Roadmap features must not appear — they mislead users into expecting
 * functionality that does not exist yet.
 */
export const keys = {
  // General
  reloadConfig: 'Ctrl+Shift+R',
  openSettings: 'Ctrl+,',
  fontLarger: 'Ctrl+=',
  fontSmaller: 'Ctrl+-',
  fontReset: 'Ctrl+0',
  toggleFullscreen: 'Alt+Enter',
  selectAll: 'Ctrl+A',

  // Panes
  splitRight: 'Ctrl+Shift+O',
  splitDown: 'Ctrl+Shift+E',
  closePane: 'Ctrl+Shift+W',
  focusLeft: 'Ctrl+Alt+Left',
  focusRight: 'Ctrl+Alt+Right',
  focusUp: 'Ctrl+Alt+Up',
  focusDown: 'Ctrl+Alt+Down',
  focusPaneDir: 'Ctrl+Alt+Arrow',
  resizePane: 'Ctrl+Alt+Shift+Arrow',
  equalizePanes: 'Ctrl+Shift+=',
  zoomPane: 'Ctrl+Shift+Z',
  toggleFloating: 'Ctrl+Shift+P',
  floatTileToggle: 'Ctrl+Shift+G',
  undoSplit: 'Ctrl+Shift+U',
  redoSplit: 'Ctrl+Shift+Y',

  // Tabs
  newTab: 'Ctrl+T',
  closeTab: 'Ctrl+W',
  nextTab: 'Ctrl+Tab',
  prevTab: 'Ctrl+Shift+Tab',

  // Clipboard
  copy: 'Ctrl+Shift+C',
  paste: 'Ctrl+Shift+V',
  smartCopy: 'Ctrl+C',
  smartPaste: 'Ctrl+V',

  // Search
  openSearch: 'Ctrl+Shift+F',
  nextMatch: 'Enter',
  prevMatch: 'Shift+Enter',
  closeSearch: 'Esc',

  // Mark Mode
  enterMarkMode: 'Ctrl+Shift+M',

  // Scrollback
  scrollPageUp: 'Shift+PageUp',
  scrollPageDown: 'Shift+PageDown',
  scrollToTop: 'Shift+Home',
  scrollToBottom: 'Shift+End',

  // Prompt Navigation
  previousPrompt: 'Ctrl+Shift+Up',
  nextPrompt: 'Ctrl+Shift+Down',

  // URLs
  urlModifier: 'Ctrl',
  openUrl: 'Ctrl+Click',
} as const;

export type KeyAction = keyof typeof keys;
