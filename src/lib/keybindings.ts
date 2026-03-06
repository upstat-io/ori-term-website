/**
 * Central source of truth for all keyboard shortcuts.
 * Update here and every page reflects the change.
 */
export const keys = {
  // General
  reloadConfig: 'Ctrl+Shift+R',
  fontLarger: 'Ctrl+=',
  fontSmaller: 'Ctrl+-',
  fontReset: 'Ctrl+0',

  // Panes
  splitRight: 'Ctrl+Shift+D',
  splitDown: 'Ctrl+Shift+E',
  closePane: 'Ctrl+W',
  focusLeft: 'Alt+Left',
  focusRight: 'Alt+Right',
  focusUp: 'Alt+Up',
  focusDown: 'Alt+Down',
  focusPaneDir: 'Alt+Arrow',
  cyclePanesForward: 'Alt+]',
  cyclePanesBack: 'Alt+[',
  resizePane: 'Alt+Shift+Arrow',
  equalizePanes: 'Ctrl+Shift+=',
  zoomPane: 'Ctrl+Shift+Z',
  toggleFloating: 'Ctrl+Shift+F',
  floatTileToggle: 'Ctrl+Shift+G',
  undoSplit: 'Ctrl+Shift+U',
  redoSplit: 'Ctrl+Shift+Y',

  // Tabs
  newTab: 'Ctrl+T',
  closeTab: 'Ctrl+W',
  nextTab: 'Ctrl+Tab',
  prevTab: 'Ctrl+Shift+Tab',
  undoCloseTab: 'Ctrl+Shift+T',

  // Clipboard
  copy: 'Ctrl+Shift+C',
  paste: 'Ctrl+Shift+V',

  // Search
  openSearch: 'Ctrl+F',
  nextMatch: 'Enter',
  prevMatch: 'Shift+Enter',
  closeSearch: 'Esc',

  // Mark / Vi Mode
  enterMarkMode: 'Ctrl+Shift+M',
  toggleViMode: 'Ctrl+Shift+Space',
  halfPageUp: 'Ctrl+U',
  halfPageDown: 'Ctrl+D',
  fullPageUp: 'Ctrl+B',
  fullPageDown: 'Ctrl+F',
  blockSelection: 'Ctrl+V',

  // Hints
  activateHints: 'Ctrl+Shift+H',

  // Power Features
  commandPalette: 'Ctrl+Shift+P',
  quickTerminal: 'F12',
  terminalInspector: 'Ctrl+Shift+I',

  // URLs
  urlModifier: 'Ctrl',
  openUrl: 'Ctrl+Click',

  // TUI
  tuiPrefix: 'Ctrl+B',
} as const;

export type KeyAction = keyof typeof keys;
