<script lang="ts">
  import { onMount } from 'svelte';

  const lines = [
    { prompt: '~', cmd: 'ori-term --version', delay: 0 },
    { prompt: '', cmd: 'ori-term v0.1.0 — GPU-accelerated terminal emulator', delay: 800, isOutput: true },
    { prompt: '', cmd: 'Built with Rust. Rendered with wgpu.', delay: 1400, isOutput: true },
    { prompt: '~', cmd: 'ori-term', delay: 2200 },
  ];

  let visibleLines = $state<number>(0);
  let typedChars = $state<number>(0);
  let currentlyTyping = $state<boolean>(false);
  let cursorLine = $state<number>(0);

  function getCurrentLine() {
    return lines[visibleLines];
  }

  function getCurrentCmd() {
    const line = getCurrentLine();
    if (!line) return '';
    return line.cmd.slice(0, typedChars);
  }

  onMount(() => {
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
    <div class="title-bar">
      <div class="title-buttons">
        <span class="btn close"></span>
        <span class="btn minimize"></span>
        <span class="btn maximize"></span>
      </div>
      <span class="title-text">ori-term</span>
      <span class="title-spacer"></span>
    </div>
    <div class="terminal-body">
      {#each lines as line, i}
        {#if i <= visibleLines}
          <div class="line" class:output={line.isOutput}>
            {#if !line.isOutput && line.prompt}
              <span class="prompt">{line.prompt}</span>
              <span class="separator">$</span>
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
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--gutter);
  }

  .terminal-window {
    width: 100%;
    max-width: 720px;
    border: var(--border-weight) solid var(--border-strong);
    background: var(--bg);
  }

  .title-bar {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    border-bottom: var(--border-weight) solid var(--border-strong);
    background: var(--bg-raised);
  }

  .title-buttons {
    display: flex;
    gap: 8px;
  }

  .btn {
    width: 12px;
    height: 12px;
    border: var(--border-weight) solid var(--border-strong);
  }

  .close { background: #ff5f57; }
  .minimize { background: #febc2e; }
  .maximize { background: #28c840; }

  .title-text {
    flex: 1;
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .title-spacer {
    width: 52px;
  }

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
    color: var(--accent);
    font-weight: 700;
  }

  .separator {
    color: var(--text-muted);
    margin: 0 0.5em;
  }

  .cmd {
    color: var(--text-bright);
  }

  .output .cmd {
    color: var(--text-muted);
  }
</style>
