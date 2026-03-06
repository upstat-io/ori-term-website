<script lang="ts">
  import { base } from '../lib/base';

  interface Props {
    features?: Feature[];
    columns?: number;
  }

  interface Feature {
    label: string;
    value: string;
    detail: string;
    href: string;
  }

  const defaultFeatures: Feature[] = [
    {
      label: 'RENDERER',
      value: 'wgpu',
      detail: 'GPU-accelerated rendering via Vulkan, DX12, and Metal',
      href: `${base}/features/gpu-rendering`,
    },
    {
      label: 'LANGUAGE',
      value: 'Rust',
      detail: 'Zero-cost abstractions, no garbage collector, no runtime',
      href: `${base}/features/platform`,
    },
    {
      label: 'MULTIPLEXER',
      value: 'Built-in',
      detail: 'Splits, tabs, floating panes, sessions — no tmux required',
      href: `${base}/features/multiplexer`,
    },
    {
      label: 'PROTOCOL',
      value: 'Full VT',
      detail: 'xterm-256color, Kitty keyboard, SGR mouse, OSC extensions',
      href: `${base}/features/terminal-emulation`,
    },
    {
      label: 'THEMES',
      value: 'Custom',
      detail: 'TOML color schemes, hot-reload, auto light/dark switching',
      href: `${base}/features/themes`,
    },
    {
      label: 'PLATFORM',
      value: 'Cross',
      detail: 'Windows, Linux, macOS — first-class on all three',
      href: `${base}/features/platform`,
    },
    {
      label: 'IMAGES',
      value: 'Native',
      detail: 'Kitty graphics, Sixel, iTerm2 inline images with GPU compositing',
      href: `${base}/features/images`,
    },
    {
      label: 'DAEMON',
      value: 'Persistent',
      detail: 'Sessions survive crashes. Multiple clients, one daemon',
      href: `${base}/features/daemon`,
    },
    {
      label: 'FONTS',
      value: 'Shaped',
      detail: 'HarfBuzz shaping, ligatures, emoji, multi-face fallback chains',
      href: `${base}/features/fonts`,
    },
  ];

  let { features = defaultFeatures, columns = 3 }: Props = $props();
</script>

<section class="features" aria-label="Features">
  <div class="grid" style="--cols: {columns}">
    {#each features as feature, i}
      <a
        class="cell"
        href={feature.href}
        style="--delay: {i * 0.08}s"
      >
        <div class="cell-label">{feature.label}</div>
        <div class="cell-value">{feature.value}</div>
        <div class="cell-detail">{feature.detail}</div>
        <svg class="cell-arrow" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>
        </svg>
      </a>
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
    grid-template-columns: repeat(var(--cols, 3), 1fr);
    gap: 0;
  }

  .cell {
    border: var(--border-weight) solid var(--border);
    padding: 32px 24px;
    animation: cellReveal 0.3s steps(4) backwards;
    animation-delay: var(--delay);
    position: relative;
    text-decoration: none;
    color: inherit;
    display: block;
    cursor: pointer;
  }

  .cell:hover {
    background: var(--bg-surface);
  }

  .cell:hover .cell-value {
    color: var(--accent);
  }

  .cell:hover .cell-arrow {
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
  }

  .cell-detail {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 8px;
    line-height: 1.4;
  }

  .cell-arrow {
    position: absolute;
    top: 14px;
    right: 16px;
    width: 14px;
    height: 14px;
    color: var(--border-strong);
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
