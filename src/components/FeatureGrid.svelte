<script lang="ts">
  const features = [
    {
      label: 'RENDERER',
      value: 'wgpu',
      detail: 'GPU-accelerated rendering pipeline',
    },
    {
      label: 'LANGUAGE',
      value: 'Rust',
      detail: 'Zero-cost abstractions, no garbage collector',
    },
    {
      label: 'PLATFORM',
      value: 'Cross',
      detail: 'Windows, Linux, macOS',
    },
    {
      label: 'MULTIPLEXER',
      value: 'Built-in',
      detail: 'Splits, tabs, sessions — no tmux required',
    },
    {
      label: 'FONT',
      value: 'Variable',
      detail: 'Ligatures, color emoji, font fallback',
    },
    {
      label: 'EMULATION',
      value: 'Full VT',
      detail: 'xterm-256color compatible',
    },
  ];
</script>

<section class="features" aria-label="Features">
  <div class="grid">
    {#each features as feature, i}
      <div class="cell" style="--delay: {i * 0.08}s">
        <div class="cell-label">{feature.label}</div>
        <div class="cell-value">{feature.value}</div>
        <div class="cell-detail">{feature.detail}</div>
      </div>
    {/each}
  </div>
</section>

<style>
  .features {
    padding: 0 var(--gutter);
  }

  .grid {
    max-width: var(--max-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
  }

  .cell {
    border: var(--border-weight) solid var(--border);
    padding: 32px 24px;
    transition: background-color 0.1s steps(1);
    animation: cellReveal 0.3s steps(4) backwards;
    animation-delay: var(--delay);
  }

  .cell:hover {
    background: var(--bg-surface);
  }

  .cell:hover .cell-value {
    color: var(--accent);
  }

  .cell-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .cell-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-bright);
    text-transform: uppercase;
    transition: color 0.1s steps(1);
  }

  .cell-detail {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 8px;
    line-height: 1.4;
  }

  @keyframes cellReveal {
    0% {
      opacity: 0;
      border-color: transparent;
    }
    25% {
      opacity: 0.3;
      border-color: var(--border);
    }
    100% {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
