import { base } from './base';

export interface DocPage {
  title: string;
  href: string;
  desc: string;
}

export interface DocSection {
  label: string;
  pages: DocPage[];
}

export const docSections: DocSection[] = [
  {
    label: 'GETTING STARTED',
    pages: [
      { title: 'Installation', href: `${base}/docs/installation`, desc: 'Install ori-term on Windows, Linux, or macOS' },
      { title: 'Quick Start', href: `${base}/docs/quick-start`, desc: 'First launch, basic navigation, essential shortcuts' },
      { title: 'Configuration', href: `${base}/docs/configuration`, desc: 'Config file location, format, and hot-reload' },
    ],
  },
  {
    label: 'USAGE',
    pages: [
      { title: 'Keybindings', href: `${base}/docs/keybindings`, desc: 'Complete keybinding reference with defaults' },
      { title: 'Panes & Splits', href: `${base}/docs/panes`, desc: 'Splitting, resizing, navigating, and managing panes' },
      { title: 'Tabs & Windows', href: `${base}/docs/tabs`, desc: 'Tab management, multi-window, drag and drop' },
      { title: 'Theming', href: `${base}/docs/theming`, desc: 'Built-in themes, custom themes, light/dark switching' },
      { title: 'Search & Mark Mode', href: `${base}/docs/search`, desc: 'Finding text, vi-style navigation, selection' },
      { title: 'Shell Integration', href: `${base}/docs/shell-integration`, desc: 'CWD tracking, semantic zones, notifications' },
    ],
  },
  {
    label: 'ADVANCED',
    pages: [
      { title: 'Daemon & Sessions', href: `${base}/docs/daemon`, desc: 'Session persistence, crash recovery, multi-client' },
      { title: 'Images', href: `${base}/docs/images`, desc: 'Displaying images with Kitty, Sixel, and iTerm2 protocols' },
      { title: 'URL Patterns', href: `${base}/docs/url-patterns`, desc: 'Custom regex patterns for clickable URLs' },
      { title: 'Font Configuration', href: `${base}/docs/font-config`, desc: 'Fallback chains, ligatures, OpenType features' },
    ],
  },
];
