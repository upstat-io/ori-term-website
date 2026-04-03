<script lang="ts">
  import { onMount } from 'svelte';

  type Platform = 'macos' | 'windows' | 'linux';

  interface Tab {
    title: string;
    active?: boolean;
    modified?: boolean;
  }

  interface StatusItem {
    label: string;
    accent?: boolean;
  }

  interface Props {
    tabs?: Tab[];
    statusLeft?: StatusItem[];
    statusRight?: StatusItem[];
    fullscreen?: boolean;
    ontabclick?: (index: number) => void;
    onclose?: () => void;
    onminimize?: () => void;
    onmaximize?: () => void;
    children?: any;
  }

  let { tabs = [{ title: 'zsh', active: true }], statusLeft = [], statusRight = [], fullscreen = false, ontabclick, onclose, onminimize, onmaximize, children }: Props = $props();

  let platform = $state<Platform>('linux');
  let maximized = $state(false);

  export function setMaximized(v: boolean) {
    maximized = v;
  }

  function handleMaximize() {
    maximized = !maximized;
    onmaximize?.();
  }

  function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('win')) return 'windows';
    return 'linux';
  }

  onMount(() => {
    platform = detectPlatform();
  });
</script>

<div class="frame" class:fullscreen class:maximized>
  <!-- Tab bar -->
  <div class="tab-bar">
    {#if platform === 'macos'}
      <div class="traffic-lights">
        <span class="tl close" role="button" tabindex="0" onclick={() => onclose?.()} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && onclose?.()}>
          <svg viewBox="0 0 8 8"><path d="M1.2 6.8L6.8 1.2" stroke="#460804" stroke-width="1.2" stroke-linecap="round"/><path d="M1.2 1.2L6.8 6.8" stroke="#460804" stroke-width="1.2" stroke-linecap="round"/></svg>
        </span>
        <span class="tl minimize" role="button" tabindex="0" onclick={() => onminimize?.()} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && onminimize?.()}>
          <svg viewBox="0 0 8 2"><rect x="0" y="0.25" width="8" height="1.5" rx="0.75" fill="#90591d"/></svg>
        </span>
        <span class="tl maximize" role="button" tabindex="0" onclick={() => handleMaximize()} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleMaximize()}>
          <svg viewBox="0 0 8 8"><path d="M3.5 1H7v3.5zM4.5 7H1V3.5z" fill="#2a6218"/></svg>
        </span>
      </div>
    {/if}

    <div class="tab-bar-tabs">
      {#each tabs as tab, i}
        <button class="tab" class:active={tab.active} onclick={() => ontabclick?.(i)}>
          <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          <span class="tab-title">{tab.title}</span>
          {#if tab.modified}
            <span class="tab-modified"></span>
          {/if}
          <span class="tab-close">&times;</span>
        </button>
      {/each}
    </div>

    <div class="tab-bar-actions">
      <div class="tab-action" title="New tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
    </div>

    {#if platform !== 'macos'}
      <div class="window-controls">
        <div class="win-btn" role="button" tabindex="0" onclick={() => onminimize?.()} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && onminimize?.()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div class="win-btn" role="button" tabindex="0" onclick={() => handleMaximize()} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleMaximize()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14"/></svg>
        </div>
        <div class="win-btn close" role="button" tabindex="0" onclick={() => onclose?.()} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && onclose?.()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </div>
      </div>
    {/if}
  </div>

  <!-- Content slot -->
  <div class="frame-body">
    {@render children()}
  </div>

  <!-- Status bar -->
  {#if statusLeft.length > 0 || statusRight.length > 0}
    <div class="status-bar">
      {#each statusLeft as item}
        <span class="status-item" class:status-accent={item.accent}>{item.label}</span>
      {/each}
      <span class="status-separator"></span>
      {#each statusRight as item}
        <span class="status-item" class:status-accent={item.accent}>{item.label}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  :root {
    --frame-bg:       #0e0e12;
    --frame-surface:  #16161c;
    --frame-raised:   #1c1c24;
    --frame-hover:    #24242e;
    --frame-border:   #2a2a36;
    --frame-border-s: #3a3a48;
    --frame-text:     #d4d4dc;
    --frame-muted:    #8c8ca0;
    --frame-bright:   #eeeeef;
    --frame-accent:   #6d9be0;
    --frame-danger:   #c87878;
  }

  .frame {
    position: relative;
    width: 100%;
    max-width: 1200px;
    height: 70vh;
    margin: 0 auto;
    background: var(--frame-bg);
    border: 1px solid var(--frame-border-s);
    border-top: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    color: var(--frame-text);
  }

  .frame.fullscreen {
    max-width: none;
    height: 100%;
    border: none;
  }

  .frame.maximized {
    position: fixed;
    inset: 0;
    max-width: none;
    height: 100vh;
    border: none;
    z-index: 100;
  }

  /* Tab bar */
  .tab-bar {
    display: flex;
    align-items: stretch;
    height: 36px;
    background: var(--frame-surface);
    border-bottom: 1px solid var(--frame-border);
    flex-shrink: 0;
    position: relative;
    z-index: 6;
    overflow: visible;
  }

  /* macOS traffic lights */
  .traffic-lights {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 14px;
    border-top: 1px solid var(--frame-border-s);
  }

  .tl {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tl.close { background: #ff5f57; cursor: pointer; }
  .tl.minimize { background: #febc2e; cursor: pointer; }
  .tl.maximize { background: #28c840; cursor: pointer; }

  .tl svg {
    width: 7px;
    height: 7px;
    opacity: 0;
  }

  .traffic-lights:hover .tl svg {
    opacity: 1;
  }

  /* Tabs */
  .tab-bar-tabs {
    display: flex;
    align-items: stretch;
    flex: 1;
    min-width: 0;
    border-top: 1px solid var(--frame-border-s);
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    min-width: 0;
    max-width: 200px;
    color: var(--frame-muted);
    font-size: 13px;
    font-family: inherit;
    background: transparent;
    border: none;
    border-top: none;
    border-right: 1px solid var(--frame-border);
    margin-top: -1px;
    position: relative;
    user-select: none;
    cursor: pointer;
  }

  .traffic-lights + .tab-bar-tabs .tab:first-child {
    border-left: 1px solid var(--frame-border);
  }

  .tab:hover { background: var(--frame-hover); color: var(--frame-text); }

  .tab.active {
    background: var(--frame-bg);
    color: var(--frame-bright);
    border-top: 2px solid var(--frame-accent);
    box-shadow: 0 1px 0 0 var(--frame-bg);
  }



  .tab-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.5;
  }

  .tab.active .tab-icon { opacity: 0.8; }

  .tab-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }

  .tab-modified {
    width: 6px;
    height: 6px;
    background: var(--frame-accent);
    flex-shrink: 0;
  }

  .tab-close {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--frame-muted);
    font-size: 14px;
    line-height: 1;
    opacity: 0;
  }

  .tab:hover .tab-close { opacity: 1; }
  .tab.active .tab-close { opacity: 0.6; }

  /* Tab bar actions */
  .tab-bar-actions {
    display: flex;
    align-items: stretch;
    border-top: 1px solid var(--frame-border-s);
  }

  .tab-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    color: var(--frame-muted);
    border-left: 1px solid var(--frame-border);
    border-right: 1px solid var(--frame-border);
  }

  .tab-action:hover { background: var(--frame-hover); color: var(--frame-text); }
  .tab-action svg { width: 14px; height: 14px; }

  /* Window controls (Windows/Linux) */
  .window-controls {
    display: flex;
    align-items: stretch;
    margin-left: auto;
    border-top: 1px solid var(--frame-border-s);
  }

  .win-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    color: var(--frame-muted);
    cursor: pointer;
  }

  .win-btn:hover { background: var(--frame-hover); color: var(--frame-text); }
  .win-btn.close:hover { background: var(--frame-danger); color: var(--frame-bright); }
  .win-btn svg { width: 12px; height: 12px; }

  /* Content */
  .frame-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    position: relative;
    z-index: 5;
    scrollbar-width: thin;
    scrollbar-color: var(--frame-border) transparent;
  }

  .frame-body::-webkit-scrollbar { width: 6px; }
  .frame-body::-webkit-scrollbar-track { background: transparent; }
  .frame-body::-webkit-scrollbar-thumb { background: var(--frame-border); }

  /* Status bar */
  .status-bar {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 10px;
    background: var(--frame-surface);
    border-top: 1px solid var(--frame-border);
    font-size: 12px;
    color: var(--frame-muted);
    gap: 16px;
    flex-shrink: 0;
    position: relative;
    z-index: 5;
  }

  .status-item { display: flex; align-items: center; gap: 4px; }
  .status-accent { color: var(--frame-accent); }
  .status-separator { flex: 1; }

  @media (max-width: 640px) {
    .frame { font-size: 12px; }
    .tab { padding: 0 10px; max-width: 140px; }
    .win-btn { width: 36px; }
  }
</style>
