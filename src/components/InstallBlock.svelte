<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '../lib/base';

  type Platform = 'windows' | 'macos' | 'linux';

  interface Props {
    windowsUrl?: string;
    linuxUrl?: string;
    macosUrl?: string;
  }

  let { windowsUrl, linuxUrl, macosUrl }: Props = $props();

  let copied = $state(false);
  let platform = $state<Platform>('linux');

  const curlCommand = 'curl -fsSL https://oriterm.com/install.sh | sh';
  const releasesUrl = 'https://github.com/upstat-io/ori-term/releases';

  function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('win')) return 'windows';
    return 'linux';
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(curlCommand);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Clipboard API not available
    }
  }

  onMount(() => {
    platform = detectPlatform();
  });
</script>

<section class="install" id="install" aria-label="Installation">
  <div class="install-inner">
    <h2 class="section-label">// INSTALL <span class="alpha-badge">ALPHA</span></h2>

    {#if platform === 'windows'}
      <div class="install-bar">
        <a class="bar-main" href={windowsUrl ?? releasesUrl} download>
          <span class="dollar">&#8595;</span>
          <span class="cmd-text">Download for Windows (x86_64)</span>
        </a>
        <a class="bar-chip" href={releasesUrl} aria-label="GitHub Releases"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></a>
      </div>
      <p class="install-note">
        Download the <code>.zip</code>, extract, and run <code>oriterm.exe</code>. Or use the install script in WSL.
      </p>
    {:else}
      <div class="install-bar">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="bar-main" onclick={copy}>
          <span class="dollar">$</span>
          <span class="cmd-text">{curlCommand}</span>
          <span class="bar-action">{copied ? 'COPIED' : 'COPY'}</span>
        </div>
        <a class="bar-chip" href={releasesUrl} aria-label="GitHub Releases"><svg class="gh-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></a>
      </div>
      <p class="install-note">
        Detects your platform and installs to <code>~/.local/bin</code>. See <a href={`${base}/docs/installation`}>installation docs</a> for all options.
      </p>
    {/if}
  </div>
</section>

<style>
  .install {
    padding: 120px var(--gutter);
  }

  .install-inner {
    max-width: var(--max-width);
    margin: 0 auto;
  }

  .section-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    margin-bottom: 32px;
  }

  .alpha-badge {
    display: inline-block;
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    border: 1px solid var(--border-strong);
    padding: 2px 8px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .install-bar {
    display: flex;
    border: var(--border-weight) solid var(--border-strong);
  }

  .bar-main {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    padding: 24px;
    background: var(--bg-raised);
    border: none;
    border-bottom: none;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    cursor: pointer;
    text-align: left;
    color: var(--text);
    text-decoration: none;
  }

  .bar-main:hover {
    background: var(--bg-surface);
    border-bottom-color: var(--text-bright);
  }

  .dollar {
    color: var(--text-bright);
    font-weight: 700;
  }

  .cmd-text {
    flex: 1;
    color: var(--text-bright);
  }

  .bar-action {
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    color: var(--text-muted);
  }

  .bar-main:hover .bar-action {
    color: var(--text-bright);
  }

  .gh-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .bar-chip {
    display: flex;
    align-items: center;
    padding: 0 24px;
    color: var(--text-muted);
    background: var(--bg-raised);
    border: none;
    border-left: var(--border-weight) solid var(--border-strong);
    text-decoration: none;
    transition: all 0.15s;
  }

  .bar-chip:hover {
    color: var(--text-bright);
    background: var(--bg-surface);
    border-bottom-color: var(--text-bright);
    border-left: var(--border-weight) solid var(--border-strong);
  }

  .install-note {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 16px;
  }

  .install-note code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    color: var(--text-muted);
  }

  @media (max-width: 480px) {
    .bar-main {
      font-size: 0.85rem;
      padding: 16px;
    }

    .bar-chip {
      padding: 0 16px;
    }
  }
</style>
