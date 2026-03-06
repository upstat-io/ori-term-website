<script lang="ts">
  import { onMount } from 'svelte';

  type Platform = 'macos' | 'windows' | 'linux';

  const lines = [
    { prompt: '~/projects', cmd: 'ori-term --version', delay: 0 },
    { prompt: '', cmd: 'ori-term v0.1.0', delay: 800, isOutput: true },
    { prompt: '~/projects', cmd: 'ori-term', delay: 1400 },
  ];

  let visibleLines = $state<number>(0);
  let typedChars = $state<number>(0);
  let currentlyTyping = $state<boolean>(false);
  let cursorLine = $state<number>(0);
  let platform = $state<Platform>('linux');

  function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('win')) return 'windows';
    return 'linux';
  }

  function getCurrentLine() {
    return lines[visibleLines];
  }

  function getCurrentCmd() {
    const line = getCurrentLine();
    if (!line) return '';
    return line.cmd.slice(0, typedChars);
  }

  onMount(() => {
    platform = detectPlatform();
    let timeout: ReturnType<typeof setTimeout>;

    function typeLine(lineIndex: number) {
      if (lineIndex >= lines.length) {
        cursorLine = lineIndex - 1;
        currentlyTyping = false;
        return;
      }

      const line = lines[lineIndex];

      timeout = setTimeout(() => {
        visibleLines = lineIndex;
        cursorLine = lineIndex;
        typedChars = 0;

        if (line.isOutput) {
          typedChars = line.cmd.length;
          currentlyTyping = false;
          typeLine(lineIndex + 1);
          return;
        }

        currentlyTyping = true;
        let charIndex = 0;

        function typeChar() {
          if (charIndex < line.cmd.length) {
            charIndex++;
            typedChars = charIndex;
            const jitter = 30 + Math.random() * 80;
            timeout = setTimeout(typeChar, jitter);
          } else {
            currentlyTyping = false;
            typeLine(lineIndex + 1);
          }
        }

        typeChar();
      }, line.delay > 0 && lineIndex > 0 ? 600 : line.delay);
    }

    typeLine(0);

    return () => clearTimeout(timeout);
  });
</script>

<section class="hero" aria-label="Terminal hero">
  <div class="terminal-window">
    <div class="title-bar" class:macos={platform === 'macos'} class:windows={platform === 'windows'} class:linux={platform === 'linux'}>
      {#if platform === 'macos'}
        <div class="traffic-lights">
          <span class="tl close"></span>
          <span class="tl minimize"></span>
          <span class="tl maximize"></span>
        </div>
      {/if}

      <div class="tabs">
        <div class="tab active">
          <span class="tab-label">zsh</span>
          <span class="tab-close">×</span>
        </div>
        <button class="tab-new" aria-label="New tab">+</button>
      </div>

      {#if platform !== 'macos'}
        <div class="window-controls" class:gtk={platform === 'linux'}>
          <button class="wc minimize" aria-label="Minimize">
            <svg viewBox="0 0 12 12" fill="none"><path d="M1 6h10" stroke="currentColor" stroke-width="1"/></svg>
          </button>
          <button class="wc maximize" aria-label="Maximize">
            <svg viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" stroke-width="1"/></svg>
          </button>
          <button class="wc close" aria-label="Close">
            <svg viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg>
          </button>
        </div>
      {/if}
    </div>
    <div class="terminal-body">
      {#each lines as line, i}
        {#if i <= visibleLines}
          <div class="line" class:output={line.isOutput}>
            {#if !line.isOutput && line.prompt}
              <span class="prompt">{line.prompt}</span>
              <span class="separator">❯</span>
            {/if}
            <span class="cmd">
              {#if i === visibleLines}
                {getCurrentCmd()}
              {:else}
                {line.cmd}
              {/if}
            </span>
            {#if i === cursorLine && (currentlyTyping || i === lines.length - 1)}
              <span class="cursor"></span>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  </div>
</section>

<style>
  .hero {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px var(--gutter) 64px;
  }

  .terminal-window {
    width: 100%;
    max-width: 720px;
    border: var(--border-weight) solid var(--border-strong);
    background: var(--bg);
  }

  /* ── Title bar ── */

  .title-bar {
    display: flex;
    align-items: flex-end;
    border-bottom: var(--border-weight) solid var(--border-strong);
    background: var(--bg-raised);
    height: 44px;
    padding: 0 0 0 8px;
  }

  /* ── macOS traffic lights ── */

  .traffic-lights {
    display: flex;
    gap: 8px;
    padding: 0 16px 0 8px;
    flex-shrink: 0;
    align-self: center;
  }

  .tl {
    width: 12px;
    height: 12px;
    border: var(--border-weight) solid var(--border-strong);
  }

  .tl.close { background: #ff5f57; }
  .tl.minimize { background: #febc2e; }
  .tl.maximize { background: #28c840; }

  /* ── Tabs ── */

  .tabs {
    display: flex;
    align-items: flex-end;
    height: 100%;
    flex: 1;
    min-width: 0;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    border-top: var(--border-weight) solid var(--border);
    border-right: var(--border-weight) solid var(--border);
    border-left: var(--border-weight) solid var(--border);
    margin-left: calc(-1 * var(--border-weight));
    cursor: default;
    white-space: nowrap;
  }

  .tab:first-child {
    margin-left: 0;
  }

  .tab.active {
    color: var(--text-bright);
    background: var(--bg);
    margin-bottom: calc(-1 * var(--border-weight));
    padding-bottom: calc(8px + var(--border-weight));
  }

  .tab-close {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1;
  }

  .tab-new {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    padding-bottom: 8px;
    font-size: 1rem;
    color: var(--text-muted);
    background: none;
    border: none;
    cursor: default;
    font-family: inherit;
    align-self: flex-end;
  }

  /* ── Window controls (Windows / Linux) ── */

  .window-controls {
    display: flex;
    align-items: stretch;
    align-self: stretch;
    margin-left: auto;
    flex-shrink: 0;
  }

  .wc {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: default;
    padding: 0;
  }

  .wc svg {
    width: 10px;
    height: 10px;
  }

  .wc.close:hover {
    background: #c42b1c;
    color: #fff;
  }

  /* GTK style — smaller, closer together */
  .window-controls.gtk .wc {
    width: 36px;
  }

  /* ── Terminal body ── */

  .terminal-body {
    padding: 24px;
    min-height: 200px;
    font-size: clamp(0.85rem, 2vw, 1rem);
    line-height: 1.8;
  }

  .line {
    white-space: pre-wrap;
    word-break: break-all;
  }

  .output {
    color: var(--text-muted);
  }

  .prompt {
    color: #3b8eea;
    font-weight: 700;
  }

  .separator {
    color: var(--accent);
    margin: 0 0.5em;
  }

  .cmd {
    color: var(--text-bright);
  }

  .output .cmd {
    color: var(--text-muted);
  }

  @media (max-width: 480px) {
    .tab:not(.active) {
      display: none;
    }

    .wc {
      width: 36px;
    }
  }
</style>
