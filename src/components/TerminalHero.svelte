<script lang="ts">
  import { onMount } from 'svelte';

  type Platform = 'macos' | 'windows' | 'linux';
  type Phase = 'idle' | 'glitching' | 'shutdown' | 'dead';

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

  let phase = $state<Phase>('idle');
  let glitchLines = $state<string[]>([]);
  let tearBars = $state<{ id: number; y: number; h: number; color: string; opacity: number }[]>([]);
  let sparks = $state<{ id: number; x: number; y: number; dx: number; dy: number; size: number; color: string }[]>([]);
  let tabLabel = $state('zsh');

  const G = '!@#$%^&*░▒▓█▄▀■□▪▫╔╗╚╝║═╬┼├┤┬┴▲▼◄►';
  const sparkColors = ['#00ff41', '#ff5f57', '#3b8eea', '#febc2e', '#fff'];
  const errorMsgs = [
    'SEGFAULT AT 0x00000000',
    'KERNEL PANIC — NOT SYNCING',
    'FATAL: MEMORY CORRUPTION',
    'ERR: STACK OVERFLOW',
    'CRITICAL: GPU PIPE DESTROYED',
    'FAULT 0xDEADBEEF',
    'ABORT: BUFFER OVERRUN',
    'ILLEGAL INSTRUCTION',
    '*** PROCESS TERMINATED ***',
  ];

  function rc() { return G[Math.floor(Math.random() * G.length)]; }
  function rline() {
    if (Math.random() < 0.15) return errorMsgs[Math.floor(Math.random() * errorMsgs.length)];
    return Array.from({ length: 15 + Math.floor(Math.random() * 50) }, rc).join('');
  }

  function triggerDestroy() {
    if (phase !== 'idle') return;
    phase = 'glitching';

    const contentInterval = setInterval(() => {
      glitchLines = Array.from({ length: 3 + Math.floor(Math.random() * 12) }, rline);
      tabLabel = Array.from({ length: 3 }, rc).join('');
    }, 40);

    const tearInterval = setInterval(() => {
      tearBars = Array.from({ length: 2 + Math.floor(Math.random() * 6) }, (_, i) => ({
        id: Date.now() + i,
        y: Math.random() * 100,
        h: 1 + Math.random() * 6,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        opacity: 0.2 + Math.random() * 0.8,
      }));
    }, 60);

    let sparkId = 0;
    const sparkInterval = setInterval(() => {
      const batch = Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 250;
        return {
          id: sparkId++,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          size: 2 + Math.random() * 5,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        };
      });
      sparks = [...sparks.slice(-40), ...batch];
    }, 70);

    setTimeout(() => {
      clearInterval(contentInterval);
      clearInterval(tearInterval);
      clearInterval(sparkInterval);
      tearBars = [];
      sparks = [];
      phase = 'shutdown';
      setTimeout(() => { phase = 'dead'; }, 800);
    }, 2000);
  }

  function reboot() {
    phase = 'idle';
    tabLabel = 'zsh';
    glitchLines = [];
    visibleLines = 0;
    typedChars = 0;
    currentlyTyping = false;
    cursorLine = 0;
    startTyping();
  }

  function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('win')) return 'windows';
    return 'linux';
  }

  function getCurrentCmd() {
    const line = lines[visibleLines];
    if (!line) return '';
    return line.cmd.slice(0, typedChars);
  }

  let cleanupTyping: (() => void) | undefined;

  function startTyping() {
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
    cleanupTyping = () => clearTimeout(timeout);
  }

  onMount(() => {
    platform = detectPlatform();
    startTyping();
    return () => cleanupTyping?.();
  });
</script>

<section class="hero" aria-label="Terminal hero">
  {#if phase !== 'dead'}
    <div
      class="terminal-window"
      class:glitching={phase === 'glitching'}
      class:shutdown={phase === 'shutdown'}
    >
      <div class="title-bar">
        {#if platform === 'macos'}
          <div class="traffic-lights">
            <button class="tl close" aria-label="Close" onclick={triggerDestroy}></button>
            <span class="tl minimize"></span>
            <span class="tl maximize"></span>
          </div>
        {/if}

        <div class="tabs">
          <div class="tab active">
            <span class="tab-label">{tabLabel}</span>
            <span class="tab-close">&#xd7;</span>
          </div>
          <button class="tab-new" aria-label="New tab">+</button>
        </div>

        {#if platform !== 'macos'}
          <div class="window-controls" class:gtk={platform === 'linux'}>
            <button class="wc" aria-label="Minimize">
              <svg viewBox="0 0 12 12" fill="none"><path d="M1 6h10" stroke="currentColor" stroke-width="1"/></svg>
            </button>
            <button class="wc" aria-label="Maximize">
              <svg viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" stroke-width="1"/></svg>
            </button>
            <button class="wc close" aria-label="Close" onclick={triggerDestroy}>
              <svg viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1"/></svg>
            </button>
          </div>
        {/if}
      </div>

      <div class="terminal-body">
        {#if phase === 'idle'}
          {#each lines as line, i}
            {#if i <= visibleLines}
              <div class="line" class:output={line.isOutput}>
                {#if !line.isOutput && line.prompt}
                  <span class="prompt">{line.prompt}</span>
                  <span class="separator">&#x276f;</span>
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
        {:else}
          {#each glitchLines as gline, i}
            <div class="glitch-line" class:error={gline === gline.toUpperCase() && gline.length < 40} style="--gi: {i}">
              {gline}
            </div>
          {/each}
        {/if}
      </div>

      {#each tearBars as bar (bar.id)}
        <div
          class="tear-bar"
          style="top: {bar.y}%; height: {bar.h}px; background: {bar.color}; opacity: {bar.opacity};"
        ></div>
      {/each}

      {#each sparks as spark (spark.id)}
        <div
          class="spark"
          style="
            left: {spark.x}%;
            top: {spark.y}%;
            --dx: {spark.dx}px;
            --dy: {spark.dy}px;
            width: {spark.size}px;
            height: {spark.size}px;
            background: {spark.color};
          "
        ></div>
      {/each}
    </div>
  {:else}
    <button class="dead-zone" onclick={reboot} aria-label="Reboot terminal">
      <span class="dead-text">// SIGNAL LOST</span>
      <span class="dead-sub">[ click to reboot ]</span>
    </button>
  {/if}
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
    position: relative;
    overflow: visible;
  }

  /* ── Glitching state ── */

  .terminal-window.glitching {
    animation:
      terminalShake 0.08s steps(1) infinite,
      borderGlitch 0.12s steps(1) infinite;
  }

  .terminal-window.glitching .terminal-body {
    animation: rgbSplit 0.1s steps(1) infinite;
    overflow: hidden;
  }

  .terminal-window.glitching .title-bar {
    animation: barFlicker 0.15s steps(1) infinite;
  }

  /* ── Shutdown state ── */

  .terminal-window.shutdown {
    animation: crtShutdown 0.8s ease-in forwards;
    pointer-events: none;
  }

  @keyframes terminalShake {
    0%   { transform: translate(0, 0) skew(0); }
    10%  { transform: translate(-8px, 5px) skew(-2.5deg); }
    20%  { transform: translate(10px, -3px) skew(1.8deg); }
    30%  { transform: translate(-5px, -8px) skew(-1.2deg); }
    40%  { transform: translate(12px, 4px) skew(3deg); }
    50%  { transform: translate(-10px, 6px) skew(-2deg); }
    60%  { transform: translate(6px, -10px) skew(1deg); }
    70%  { transform: translate(-12px, -3px) skew(-3deg); }
    80%  { transform: translate(8px, 8px) skew(2deg); }
    90%  { transform: translate(-4px, -6px) skew(-0.8deg); }
    100% { transform: translate(7px, -2px) skew(1.5deg); }
  }

  @keyframes borderGlitch {
    0%   { border-color: var(--border-strong); }
    20%  { border-color: #ff5f57; }
    40%  { border-color: #00ff41; }
    60%  { border-color: #3b8eea; }
    80%  { border-color: #febc2e; }
    100% { border-color: var(--border-strong); }
  }

  @keyframes rgbSplit {
    0%   { text-shadow: -2px 0 #ff0000, 2px 0 #00ffff; }
    25%  { text-shadow: -5px 0 #ff0000, 5px 0 #00ffff; }
    50%  { text-shadow: -3px 2px #ff0000, 3px -2px #00ffff; }
    75%  { text-shadow: -6px -1px #ff0000, 6px 1px #00ffff; }
    100% { text-shadow: -2px 0 #ff0000, 2px 0 #00ffff; }
  }

  @keyframes barFlicker {
    0%   { opacity: 1; background: var(--bg-raised); }
    15%  { opacity: 0.2; background: #ff5f57; }
    30%  { opacity: 1; background: var(--bg-raised); }
    45%  { opacity: 0.6; background: var(--bg-raised); }
    60%  { opacity: 0; }
    65%  { opacity: 1; background: #3b8eea; }
    75%  { opacity: 1; background: var(--bg-raised); }
    90%  { opacity: 0.3; }
    100% { opacity: 1; background: var(--bg-raised); }
  }

  @keyframes crtShutdown {
    0%   { transform: scale(1, 1); filter: brightness(1); opacity: 1; }
    10%  { filter: brightness(3); }
    40%  { transform: scale(1.02, 0.008); filter: brightness(2.5); opacity: 1; }
    70%  { transform: scale(0.15, 0.005); filter: brightness(4); opacity: 0.9; }
    90%  { transform: scale(0.02, 0.005); filter: brightness(6); opacity: 0.6; }
    100% { transform: scale(0, 0); filter: brightness(0); opacity: 0; }
  }

  /* ── Glitch content lines ── */

  .glitch-line {
    white-space: nowrap;
    overflow: hidden;
    font-size: clamp(0.75rem, 1.8vw, 0.95rem);
    line-height: 1.6;
    color: var(--accent);
  }

  .glitch-line.error {
    color: #ff5f57;
    font-weight: 700;
  }

  .glitch-line:nth-child(3n) {
    color: #3b8eea;
  }

  .glitch-line:nth-child(5n) {
    color: #febc2e;
  }

  .glitch-line:nth-child(7n+2) {
    color: var(--text-bright);
  }

  /* ── Tear bars ── */

  .tear-bar {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
    z-index: 10;
    mix-blend-mode: screen;
  }

  /* ── Sparks ── */

  .spark {
    position: absolute;
    pointer-events: none;
    z-index: 20;
    animation: sparkFly 0.5s ease-out forwards;
  }

  @keyframes sparkFly {
    from {
      transform: translate(0, 0);
      opacity: 1;
    }
    to {
      transform: translate(var(--dx), var(--dy));
      opacity: 0;
    }
  }

  /* ── Dead state ── */

  .dead-zone {
    width: 100%;
    max-width: 720px;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: none;
    border: var(--border-weight) dashed var(--border);
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }

  .dead-text {
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    animation: deadBlink 1s steps(1) infinite;
  }

  .dead-sub {
    font-size: 0.65rem;
    color: var(--border-strong);
    letter-spacing: 0.15em;
  }

  @keyframes deadBlink {
    0%   { opacity: 1; }
    50%  { opacity: 0; }
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

  button.tl {
    cursor: pointer;
    padding: 0;
    font: inherit;
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

  .wc.close {
    cursor: pointer;
  }

  .wc.close:hover {
    background: #c42b1c;
    color: #fff;
  }

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
