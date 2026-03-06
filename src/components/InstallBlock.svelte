<script lang="ts">
  let copied = $state(false);

  const command = 'cargo install ori-term';

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Clipboard API not available
    }
  }
</script>

<section class="install" id="install" aria-label="Installation">
  <div class="install-inner">
    <h2 class="section-label">// INSTALL</h2>
    <div class="install-box">
      <button class="install-cmd" onclick={copy} aria-label="Copy install command">
        <span class="dollar">$</span>
        <span class="cmd-text">{command}</span>
        <span class="copy-hint">{copied ? 'COPIED' : 'CLICK TO COPY'}</span>
      </button>
    </div>
    <p class="install-note">
      Requires Rust 1.80+. See <a href="https://github.com/user/ori-term">source</a> for build instructions.
    </p>
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

  .install-box {
    border: var(--border-weight) solid var(--border-strong);
  }

  .install-cmd {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 24px;
    background: var(--bg-raised);
    border: none;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    cursor: pointer;
    text-align: left;
    color: var(--text);
    transition: background-color 0.1s steps(1);
  }

  .install-cmd:hover {
    background: var(--bg-surface);
  }

  .dollar {
    color: var(--accent);
    font-weight: 700;
  }

  .cmd-text {
    flex: 1;
    color: var(--text-bright);
  }

  .copy-hint {
    font-size: 0.6rem;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    transition: color 0.1s steps(1);
  }

  .install-cmd:hover .copy-hint {
    color: var(--accent);
  }

  .install-note {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 16px;
  }

  @media (max-width: 480px) {
    .install-cmd {
      font-size: 0.85rem;
      padding: 16px;
    }
  }
</style>
