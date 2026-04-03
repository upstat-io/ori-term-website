<script lang="ts">
  import TermFrame from './TermFrame.svelte';

  interface Entry {
    date: string;
    type: string;
    scope?: string;
    message: string;
    hash: string;
  }

  interface Release {
    tag: string;
    date: string;
    url: string;
    body: string;
    prerelease: boolean;
  }

  interface Props {
    entries: Entry[];
    releases?: Release[];
  }

  let { entries, releases = [] }: Props = $props();

  const TYPE_COLORS: Record<string, string> = {
    feat: '#6bffb8',
    fix: '#c87878',
    refactor: '#6d9be0',
    perf: '#e0c454',
    docs: '#8c8ca0',
  };

  const TYPE_ICONS: Record<string, string> = {
    feat: '+',
    fix: '!',
    refactor: '~',
    perf: '^',
    docs: '#',
  };

  // State
  let view = $state<'releases' | 'commits'>('releases');
  let filter = $state<string>('all');
  let expandedRelease = $state<string | null>(releases.length > 0 ? releases[0].tag : null);

  // Derived
  let filtered = $derived(
    filter === 'all' ? entries : entries.filter(e => e.type === filter)
  );

  let grouped = $derived.by(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return [...map.entries()];
  });

  let stats = $derived.by(() => {
    const s: Record<string, number> = {};
    for (const e of entries) s[e.type] = (s[e.type] || 0) + 1;
    return s;
  });

  let tabs = $derived([
    { title: 'releases', active: view === 'releases' },
    { title: 'commits', active: view === 'commits' },
  ]);

  let statusLeft = $derived([
    { label: view === 'releases' ? `${releases.length} releases` : `${filtered.length} commits`, accent: false },
    ...(view === 'commits' && filter !== 'all' ? [{ label: `(${filter})`, accent: false }] : []),
  ]);

  let statusRight = $derived([
    { label: 'ori-term', accent: true },
    { label: 'changelog', accent: false },
  ]);

  function toggleRelease(tag: string) {
    expandedRelease = expandedRelease === tag ? null : tag;
  }

  function formatDate(d: string): string {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function markdownToHtml(md: string): string {
    const lines = md.split('\n').filter(l => l.trim() && l.trim() !== '---');
    return lines.map(line => {
      // Headings
      const h2 = line.match(/^##\s+(.+)/);
      if (h2) return `<div class="md-h">${applyInline(h2[1])}</div>`;
      const h3 = line.match(/^###\s+(.+)/);
      if (h3) return `<div class="md-h">${applyInline(h3[1])}</div>`;
      // Bold-only lines (section headers like **What's Next**)
      const boldLine = line.match(/^\*\*(.+?)\*\*$/);
      if (boldLine) return `<div class="md-bold-line"><strong>${applyInline(boldLine[1])}</strong></div>`;
      // List items
      const li = line.match(/^- (.+)/);
      if (li) return `<div class="md-li"><span class="md-bullet">-</span> ${applyInline(li[1])}</div>`;
      // Plain text
      return `<div class="md-text">${applyInline(line)}</div>`;
    }).join('');
  }

  function applyInline(s: string): string {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function handleTabClick(index: number) {
    view = index === 0 ? 'releases' : 'commits';
  }
</script>

<div class="changelog-shell">
  <TermFrame {tabs} {statusLeft} {statusRight} ontabclick={handleTabClick}>
    <div class="content">

      <!-- Prompt line — looks like the command that produced this output -->
      <div class="prompt-line">
        <span class="ps1">~/ori_term</span>
        <span class="sep">&#x276f;</span>
        {#if view === 'releases'}
          <span class="cmd">gh release list</span>
          <span class="flag">--limit {releases.length}</span>
        {:else}
          <span class="cmd">git log</span>
          <span class="flag">--format=conventional</span>
          {#if filter !== 'all'}
            <span class="flag">--type={filter}</span>
          {/if}
        {/if}
      </div>

      {#if view === 'releases'}
        <!-- Releases — styled as command output -->
        <div class="output">
          {#each releases as release, i}
            <button class="release-row" onclick={() => toggleRelease(release.tag)}>
              <span class="r-arrow">{expandedRelease === release.tag ? 'v' : '>'}</span>
              <span class="r-tag">{release.tag}</span>
              {#if release.prerelease}
                <span class="r-pre">pre-release</span>
              {/if}
              <span class="r-date">{formatDate(release.date)}</span>
            </button>
            {#if expandedRelease === release.tag}
              <div class="release-body">
                {@html markdownToHtml(release.body)}
              </div>
            {/if}
            {#if i < releases.length - 1}
              <div class="output-rule"></div>
            {/if}
          {/each}
          {#if releases.length === 0}
            <div class="output-empty">no releases found</div>
          {/if}
        </div>

      {:else}
        <!-- Commits — filter bar then output -->
        <div class="filter-bar">
          <button class="fbtn" class:active={filter === 'all'} onclick={() => { filter = 'all'; }}>
            all({entries.length})
          </button>
          {#each ['feat', 'fix', 'refactor', 'perf', 'docs'] as type}
            {#if stats[type]}
              <button
                class="fbtn"
                class:active={filter === type}
                style="--tc: {TYPE_COLORS[type]}"
                onclick={() => { filter = type; }}
              >{type}({stats[type]})</button>
            {/if}
          {/each}
        </div>

        <div class="output">
          {#each grouped as [date, items]}
            <div class="log-group">
              <div class="log-date">{formatDate(date)} ({items.length})</div>
              {#each items as entry}
                <div class="log-entry">
                  <span class="l-hash"><a href="https://github.com/upstat-io/ori-term/commit/{entry.hash}" target="_blank" rel="noopener">{entry.hash}</a></span>
                  <span class="l-type" style="color: {TYPE_COLORS[entry.type] ?? '#888'}">{entry.type}</span>
                  <span class="l-scope">{entry.scope ? `(${entry.scope})` : '--'}</span>
                  <span class="l-msg">{entry.message}</span>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/if}

    </div>
  </TermFrame>
</div>

<style>
  .changelog-shell { width: 100%; }

  .content {
    padding: 14px 16px 24px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 15px;
    line-height: 1.6;
  }

  /* Prompt — the "command" line */
  .prompt-line {
    display: flex;
    gap: 6px;
    padding-bottom: 14px;
    border-bottom: 1px solid #1e1e28;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .ps1 { color: #6d9be0; }
  .sep { color: #6d9be0; }
  .cmd { color: #eeeeef; font-weight: 700; }
  .flag { color: #8c8ca0; }

  /* Output area — shared by both views */
  .output { }

  .output-rule { height: 1px; background: #1a1a24; margin: 2px 0; }
  .output-empty { color: #5c5c70; padding: 8px 0; }

  /* Release rows — look like list output from `gh release list` */
  .release-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    width: 100%;
    padding: 7px 0;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    font-size: 15px;
    cursor: pointer;
    text-align: left;
  }

  .release-row:hover { background: rgba(255, 255, 255, 0.02); }

  .r-arrow { color: #6d9be0; font-weight: 700; min-width: 1ch; }
  .r-tag { color: #eeeeef; }
  .r-pre { color: #e0c454; font-size: 13px; }
  .r-date { color: #5c5c70; margin-left: auto; font-size: 14px; }

  /* Release body — indented like piped output */
  .release-body {
    padding: 6px 0 12px 20px;
    border-left: 2px solid #1e1e28;
    margin-left: 6px;
    margin-bottom: 4px;
    color: #b0b0bc;
    font-size: 14px;
    line-height: 1.5;
  }

  .release-body :global(.md-h) { color: #6d9be0; font-weight: 700; font-size: 15px; margin-top: 10px; margin-bottom: 2px; }
  .release-body :global(.md-bold-line) { color: #d4d4dc; margin-top: 10px; margin-bottom: 2px; }
  .release-body :global(.md-text) { color: #b0b0bc; margin-bottom: 3px; }
  .release-body :global(.md-li) { padding-left: 18px; text-indent: -14px; color: #c4c4d0; margin-bottom: 1px; }
  .release-body :global(.md-bullet) { color: #5c5c70; }
  .release-body :global(strong) { color: #d4d4dc; font-weight: 600; }
  .release-body :global(em) { color: #8c8ca0; }
  .release-body :global(code) { background: #14141c; padding: 1px 5px; color: #c4c4d0; font-size: 0.92em; }
  .release-body :global(a) { color: #6d9be0; text-decoration: none; border-bottom: 1px solid transparent; }
  .release-body :global(a:hover) { border-bottom-color: #6d9be0; }

  /* Commit filter bar — looks like pipeline flags */
  .filter-bar {
    display: flex;
    gap: 16px;
    padding-bottom: 12px;
    flex-wrap: wrap;
  }

  .fbtn {
    font-family: inherit;
    font-size: 14px;
    background: transparent;
    border: none;
    color: #5c5c70;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.1s;
  }

  .fbtn:hover { color: #a0a0b0; }

  .fbtn.active {
    color: var(--tc, #6d9be0);
  }

  /* Commit log — looks like `git log --oneline` output */
  .log-group { margin-bottom: 18px; }

  .log-date {
    color: #5c5c70;
    font-size: 14px;
    padding-bottom: 3px;
  }

  .log-entry {
    display: grid;
    grid-template-columns: 7ch 9ch 12ch 1fr;
    gap: 0 10px;
    padding: 3px 0;
    align-items: baseline;
  }

  .l-hash a {
    color: #e0c454;
    font-size: 14px;
    text-decoration: none;
    border: none !important;
  }

  .l-hash a:hover { color: #f0d870; }

  .l-type {
    font-size: 14px;
  }

  .l-scope { color: #5c5c70; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .l-msg { color: #d4d4dc; min-width: 0; }

  @media (max-width: 640px) {
    .content { padding: 10px 12px; font-size: 13px; }
    .log-entry { flex-wrap: wrap; }
    .r-date { display: none; }
  }
</style>
