<script lang="ts">
  import { onMount } from 'svelte';
  import TermFrame from './TermFrame.svelte';

  type Status = 'complete' | 'in-progress' | 'not-started' | 'superseded' | 'partial';
  interface Section { num: string; name: string; status: Status; goal: string; }
  interface Tier { id: string; name: string; sections: Section[]; }

  interface Props {
    tiers: Tier[];
  }

  let { tiers }: Props = $props();

  const all = tiers.flatMap(t => t.sections);
  const total = all.length;
  const counts: Record<string, number> = {};
  for (const s of all) counts[s.status] = (counts[s.status] || 0) + 1;
  const pctDone = Math.round(((counts['complete'] || 0) / total) * 100);

  function tierDone(t: Tier) { return t.sections.filter(s => s.status === 'complete').length; }
  function tierPct(t: Tier) { return Math.round((tierDone(t) / t.sections.length) * 100); }
  function ic(s: Status) { return { complete: '*', 'in-progress': '~', 'not-started': '-', superseded: 'x', partial: '/' }[s] ?? '?'; }
  function statusLabel(s: Status) { return s === 'in-progress' ? 'IN-PROGRESS' : s === 'not-started' ? 'WAITING' : s.toUpperCase(); }
  const statusOrder: Status[] = ['complete', 'in-progress', 'not-started', 'partial', 'superseded'];

  // ── State ──
  let screen = $state<'list' | 'detail'>('list');
  let win = $state(0);
  let cur = $state(0);
  let collapsed = $state(new Set<string>());
  let detailSection = $state<Section | null>(null);
  let detailTier = $state<Tier | null>(null);
  let tick = $state(0);
  let root: HTMLDivElement | undefined = $state();

  const wins = ['roadmap', 'by-status', 'deps'];

  let frameTabs = $derived(wins.map((w, i) => ({ title: w, active: win === i })));
  let frameStatusLeft = $derived([
    { label: `${total} sections`, accent: false },
    { label: `${pctDone}% complete`, accent: false },
  ]);
  let frameStatusRight = $derived([
    { label: 'ori-term', accent: true },
    { label: 'roadmap', accent: false },
  ]);

  function handleFrameTab(i: number) { switchWin(i); }

  type NavItem =
    | { type: 'tier'; tier: Tier }
    | { type: 'section'; section: Section; tierId: string }
    | { type: 'status-header'; status: Status; count: number };

  let nav = $derived.by((): NavItem[] => {
    if (win === 0) {
      const items: NavItem[] = [];
      for (const t of tiers) {
        items.push({ type: 'tier', tier: t });
        if (!collapsed.has(t.id)) for (const s of t.sections) items.push({ type: 'section', section: s, tierId: t.id });
      }
      return items;
    }
    if (win === 1) {
      const items: NavItem[] = [];
      for (const st of statusOrder) {
        const secs = all.filter(s => s.status === st);
        if (secs.length) {
          items.push({ type: 'status-header', status: st, count: secs.length });
          if (!collapsed.has(st)) for (const s of secs) {
            const t = tiers.find(t => t.sections.includes(s))!;
            items.push({ type: 'section', section: s, tierId: t.id });
          }
        }
      }
      return items;
    }
    return [];
  });

  function switchWin(i: number) {
    win = i; cur = 0; collapsed = new Set(); screen = 'list'; tick++;
  }

  function toggleCollapse(id: string) {
    const n = new Set(collapsed);
    n.has(id) ? n.delete(id) : n.add(id);
    collapsed = n;
    if (cur >= nav.length) cur = Math.max(0, nav.length - 1);
  }

  function openDetail(section: Section, tierId: string) {
    detailSection = section;
    detailTier = tiers.find(t => t.id === tierId) || null;
    screen = 'detail';
  }

  function closeDetail() {
    screen = 'list';
    detailSection = null;
    detailTier = null;
  }

  function activate() {
    const item = nav[cur];
    if (!item) return;
    if (item.type === 'tier') toggleCollapse(item.tier.id);
    else if (item.type === 'status-header') toggleCollapse(item.status);
    else openDetail(item.section, item.tierId);
  }

  function clickRow(i: number) { cur = i; activate(); }

  function scrollToTier(id: string) {
    if (win !== 0) switchWin(0);
    const idx = nav.findIndex(n => n.type === 'tier' && n.tier.id === id);
    if (idx >= 0) { cur = idx; scrollCur(); }
  }

  function scrollCur() {
    requestAnimationFrame(() => {
      root?.querySelector(`[data-nav="${cur}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' as ScrollBehavior });
    });
  }

  function handleKey(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (screen === 'detail') {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Backspace') { e.preventDefault(); closeDetail(); }
      return;
    }

    switch (e.key) {
      case 'j': case 'ArrowDown':
        if (win === 2) return;
        e.preventDefault(); cur = Math.min(cur + 1, nav.length - 1); scrollCur(); break;
      case 'k': case 'ArrowUp':
        if (win === 2) return;
        e.preventDefault(); cur = Math.max(cur - 1, 0); scrollCur(); break;
      case 'Enter': case ' ':
        if (win === 2) return;
        e.preventDefault(); activate(); break;
      case 'h': case 'ArrowLeft': {
        if (win === 2) return;
        e.preventDefault();
        const it = nav[cur];
        if (it?.type === 'tier' && !collapsed.has(it.tier.id)) toggleCollapse(it.tier.id);
        else if (it?.type === 'status-header' && !collapsed.has(it.status)) toggleCollapse(it.status);
        break;
      }
      case 'l': case 'ArrowRight': {
        if (win === 2) return;
        e.preventDefault();
        const it = nav[cur];
        if (it?.type === 'tier' && collapsed.has(it.tier.id)) toggleCollapse(it.tier.id);
        else if (it?.type === 'status-header' && collapsed.has(it.status)) toggleCollapse(it.status);
        else if (it?.type === 'section') openDetail(it.section, it.tierId);
        break;
      }
      case 'g': e.preventDefault(); cur = 0; scrollCur(); break;
      case 'G': e.preventDefault(); cur = nav.length - 1; scrollCur(); break;
      case '1': e.preventDefault(); switchWin(0); break;
      case '2': e.preventDefault(); switchWin(1); break;
      case '3': e.preventDefault(); switchWin(2); break;
      case 'Escape': case 'q': break;
    }
  }

  onMount(() => { root?.focus(); });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="roadmap-shell">
<TermFrame tabs={frameTabs} statusLeft={frameStatusLeft} statusRight={frameStatusRight} ontabclick={handleFrameTab}>
<div class="tui" bind:this={root} tabindex="0" onkeydown={handleKey}>

  {#if screen === 'detail' && detailSection && detailTier}
    <!-- ═══ DETAIL SCREEN ═══ -->
    <div class="detail-screen">
      <div class="detail-header">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <span class="detail-back" onclick={closeDetail}>[ESC] Back</span>
        <span class="detail-title">Section {detailSection.num}</span>
      </div>

      <div class="detail-body">
        <div class="detail-card">
          <div class="dc-row">
            <span class="dc-label">NAME</span>
            <span class="dc-value bright">{detailSection.name}</span>
          </div>
          <div class="dc-divider"></div>
          <div class="dc-row">
            <span class="dc-label">STATUS</span>
            <span class="dc-value st-{detailSection.status}">{statusLabel(detailSection.status)}</span>
          </div>
          <div class="dc-divider"></div>
          <div class="dc-row">
            <span class="dc-label">TIER</span>
            <span class="dc-value">T{detailTier.id} - {detailTier.name}</span>
          </div>
          <div class="dc-divider"></div>
          <div class="dc-row">
            <span class="dc-label">GOAL</span>
            <span class="dc-value">{detailSection.goal}</span>
          </div>
          <div class="dc-divider"></div>
          <div class="dc-row">
            <span class="dc-label">TIER PROGRESS</span>
            <span class="dc-value">
              <span class="pbar pbar-wide"><span class="pbar-fill st-bg-{tierPct(detailTier) === 100 ? 'complete' : 'in-progress'}" style="width:{tierPct(detailTier)}%"></span></span>
              {tierDone(detailTier)}/{detailTier.sections.length} complete ({tierPct(detailTier)}%)
            </span>
          </div>
        </div>

        <div class="detail-siblings">
          <div class="ds-title">Other sections in TIER {detailTier.id}:</div>
          {#each detailTier.sections as s}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="ds-row st-{s.status}"
              class:ds-current={s.num === detailSection.num}
              onclick={() => { if (s.num !== detailSection!.num) openDetail(s, detailTier!.id); }}
            >
              <span class="ds-ic">{ic(s.status)}</span>
              <span class="ds-num">{s.num}</span>
              <span class="ds-name">{s.name}</span>
              <span class="ds-st">{statusLabel(s.status)}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

  {:else}
    <!-- ═══ LIST SCREENS ═══ -->
    <div class="tui-content">
      <!-- MAIN PANE (scrolls) -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="pane pane-main">
        <div class="pane-scroll" id="main-scroll">
          {#key tick}
          <div class="view-enter">

          {#if win === 0}
            {#each nav as item, i}
              {#if item.type === 'tier'}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="row tier-head" class:row-cur={cur === i} data-nav={i} onclick={() => clickRow(i)}>
                  <span class="arrow">{collapsed.has(item.tier.id) ? '>' : 'v'}</span>
                  <span class="cyan">TIER {item.tier.id}</span>
                  <span class="tier-label">{item.tier.name}</span>
                  <span class="tier-bar"><span class="pbar pbar-tier"><span class="pbar-fill st-bg-{tierPct(item.tier) === 100 ? 'complete' : 'in-progress'}" style="width:{tierPct(item.tier)}%"></span></span></span>
                  <span class="tier-frac">{tierDone(item.tier)}/{item.tier.sections.length}</span>
                </div>
              {:else if item.type === 'section'}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="row sec-row st-{item.section.status}" class:row-cur={cur === i} data-nav={i} onclick={() => clickRow(i)}>
                  <span class="s-ic">{ic(item.section.status)}</span>
                  <span class="s-num">{item.section.num}</span>
                  <span class="s-name">{item.section.name}</span>
                  <span class="s-st">{statusLabel(item.section.status)}</span>
                </div>
              {/if}
            {/each}

          {:else if win === 1}
            <div class="banner">$ oriterm roadmap --group-by=status</div>
            <div class="rule"></div>
            {#each nav as item, i}
              {#if item.type === 'status-header'}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="row status-head st-{item.status}" class:row-cur={cur === i} data-nav={i} onclick={() => clickRow(i)}>
                  <span class="arrow">{collapsed.has(item.status) ? '>' : 'v'}</span>
                  <span class="sh-label">{statusLabel(item.status)}</span>
                  <span class="sh-count">({item.count})</span>
                </div>
              {:else if item.type === 'section'}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="row sec-row st-{item.section.status}" class:row-cur={cur === i} data-nav={i} onclick={() => clickRow(i)}>
                  <span class="s-ic">{ic(item.section.status)}</span>
                  <span class="s-num">{item.section.num}</span>
                  <span class="s-name">{item.section.name}</span>
                  <span class="s-tier-tag">T{item.tierId}</span>
                </div>
              {/if}
            {/each}

          {:else}
            <div class="banner">$ oriterm roadmap --deps</div>
            <div class="rule"></div>
            <pre class="dep-graph">{
`  DEPENDENCY FLOW

  T0 Core Library
  |
  +-- T1 Process Layer
  |   |
  |   +-- T2 Rendering
  |       |
  |       +-- T3 Interaction --- T4 Chrome
  |       |                       |
  |       +-- T4M Multiplexing --+
  |            |
  |            +-- T5 Hardening
  |                |
  |                +-- T6 Polish --- T7 Advanced
  |                |
  |                +-- T7A Server + Remote`}</pre>

            <div class="dep-legend">
              {#each tiers as t}
                <div class="dep-tier">
                  <span class="dep-tid cyan">T{t.id}</span>
                  <span class="pbar pbar-wide"><span class="pbar-fill st-bg-{tierPct(t) === 100 ? 'complete' : tierPct(t) > 0 ? 'in-progress' : 'not-started'}" style="width:{tierPct(t)}%"></span></span>
                  <span class="dep-pct">{tierPct(t)}%</span>
                  <span class="dep-name dim">{t.name}</span>
                </div>
              {/each}
            </div>
          {/if}

          </div>
          {/key}
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="div-v" aria-hidden="true"></div>

      <!-- RIGHT SIDEBAR (static, no scroll) -->
      <div class="sidebar">
        <div class="side-panel">
          <div class="sp-title">STATUS</div>
          {#each statusOrder as st}
            {@const c = counts[st] || 0}
            {@const p = Math.round((c / total) * 100)}
            <div class="sp-row st-{st}">
              <span class="sp-ic">{ic(st)}</span>
              <span class="sp-label">{st}</span>
              <span class="sp-ct">{c}</span>
              <span class="pbar"><span class="pbar-fill st-bg-{st}" style="width:{p}%"></span></span>
              <span class="sp-pct">{p}%</span>
            </div>
          {/each}
        </div>

        <div class="div-h" aria-hidden="true"></div>

        <div class="side-panel">
          <div class="sp-title">TIERS</div>
          {#each tiers as t}
            {@const p = tierPct(t)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="tp-row" onclick={() => scrollToTier(t.id)}>
              <span class="tp-id cyan">T{t.id}</span>
              <span class="pbar pbar-wide"><span class="pbar-fill st-bg-{p === 100 ? 'complete' : p > 0 ? 'in-progress' : 'not-started'}" style="width:{p}%"></span></span>
              <span class="tp-pct">{p}%</span>
              <span class="tp-ratio dim">{tierDone(t)}/{t.sections.length}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

</div>
</TermFrame>
</div>

<style>
  /* ── TUI Shell ─────────────────────────────────────── */
  .roadmap-shell { width: 100%; height: 100%; }

  .tui {
    --navy-lt: rgba(255,255,255,0.02);
    --border-color: #2a2a36;
    --border-bright: #3a3a48;
    --text: #d4d4dc;
    --bright: #eeeeef;
    --dim: #5c5c70;
    --cyan: #6d9be0;
    --green: #4dba8a;
    --yellow: #e0c454;
    --red: #c87878;
    --cursor-bg: rgba(255,255,255,0.03);

    display: flex;
    flex-direction: column;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text);
    outline: none;
  }

  /* ── Layout ────────────────────────────────────────── */
  .tui-content { display: flex; }
  .pane-main { flex: 1; min-width: 0; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; }
  .pane-scroll { padding: 16px 20px; }
  .pane-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .pane-scroll::-webkit-scrollbar-thumb { background: var(--border-color); }
  .pane-scroll::-webkit-scrollbar-track { background: transparent; }

  .sidebar { flex: 0 0 300px; display: flex; flex-direction: column; }
  .side-panel { padding: 16px 18px; }
  .side-panel::-webkit-scrollbar { width: 4px; height: 4px; }
  .side-panel::-webkit-scrollbar-thumb { background: var(--border-color); }
  .side-panel::-webkit-scrollbar-track { background: transparent; }

  .div-v { width: 1px; background: var(--border-color); flex-shrink: 0; display: none; }
  .div-h { height: 1px; background: var(--border-color); flex-shrink: 0; }

  /* ── Banner ────────────────────────────────────────── */
  .banner { color: var(--dim); margin-bottom: 4px; }
  .banner-sub { margin-bottom: 8px; }
  .rule { border-bottom: 1px solid var(--border-color); margin-bottom: 12px; }
  .cyan { color: var(--cyan); }
  .green { color: var(--green); }
  .bright { color: var(--bright); }
  .dim { color: var(--dim); }

  /* ── Rows ──────────────────────────────────────────── */
  .row {
    display: flex; align-items: baseline; gap: 8px;
    padding: 3px 8px; cursor: pointer; white-space: nowrap; overflow: hidden;
  }
  .row:hover { background: var(--navy-lt); }
  .row-cur { background: var(--cursor-bg) !important; }
  .row-cur::before {
    content: '>';
    position: absolute;
    left: 4px;
    color: var(--cyan);
    font-weight: 700;
  }
  .row { position: relative; padding-left: 20px; }

  /* ── Tier Header ───────────────────────────────────── */
  .tier-head { border-bottom: 1px solid var(--border-color); margin-top: 6px; padding-bottom: 3px; }
  .arrow { width: 12px; color: var(--dim); flex-shrink: 0; }
  .tier-label { color: var(--dim); font-size: 0.85rem; letter-spacing: 0.06em; flex: 1; overflow: hidden; text-overflow: ellipsis; }
  .tier-bar { flex-shrink: 0; }
  .tier-frac { color: var(--dim); font-size: 0.85rem; min-width: 28px; text-align: right; }

  /* ── Section Row ───────────────────────────────────── */
  .s-ic { width: 14px; text-align: center; flex-shrink: 0; }
  .s-num { color: var(--dim); min-width: 24px; flex-shrink: 0; font-size: 0.9rem; }
  .s-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
  .s-st { font-size: 0.75rem; letter-spacing: 0.06em; min-width: 90px; text-align: right; flex-shrink: 0; }
  .s-tier-tag { font-size: 0.8rem; min-width: 30px; text-align: right; flex-shrink: 0; color: var(--cyan); }

  .st-complete .s-ic { color: var(--green); }
  .st-complete .s-st { color: var(--green); }
  .st-in-progress .s-ic, .st-in-progress .s-st, .st-in-progress .s-name { color: var(--yellow); }
  .st-not-started .s-ic, .st-not-started .s-name, .st-not-started .s-st { color: var(--dim); }
  .st-superseded .s-ic, .st-superseded .s-st { color: var(--red); opacity: 0.6; }
  .st-superseded .s-name { color: var(--dim); text-decoration: line-through; opacity: 0.5; }
  .st-partial .s-ic { color: var(--yellow); }

  /* ── Status Header ─────────────────────────────────── */
  .status-head { border-bottom: 1px solid var(--border-color); margin-top: 8px; padding-bottom: 3px; }
  .sh-label { font-weight: 700; font-size: 0.9rem; letter-spacing: 0.05em; }
  .sh-count { font-size: 0.85rem; color: var(--dim); }
  .status-head.st-complete .sh-label { color: var(--green); }
  .status-head.st-in-progress .sh-label { color: var(--yellow); }
  .status-head.st-not-started .sh-label { color: var(--dim); }
  .status-head.st-superseded .sh-label { color: var(--red); opacity: 0.6; }
  .status-head.st-partial .sh-label { color: var(--yellow); }

  /* ── Progress Bars ──────────────────────────────────── */
  .pbar {
    display: inline-block;
    width: 100px;
    height: 12px;
    background: #1e1e28;
    border: 1px solid var(--border-color);
    vertical-align: middle;
    overflow: hidden;
    flex-shrink: 0;
  }
  .pbar-wide { width: 120px; }
  .pbar-tier { width: 100px; }
  .pbar-fill { display: block; height: 100%; }
  .st-bg-complete { background: var(--green); }
  .st-bg-in-progress { background: var(--yellow); }
  .st-bg-not-started { background: transparent; }
  .st-bg-partial { background: var(--yellow); }
  .st-bg-superseded { background: var(--red); }

  /* ── Deps ──────────────────────────────────────────── */
  .dep-graph { color: var(--dim); font-size: 0.95rem; line-height: 1.5; margin: 0; padding: 0; background: none; border: none; white-space: pre; }
  .dep-legend { margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 12px; }
  .dep-tier { display: flex; align-items: center; gap: 10px; padding: 4px 0; font-size: 0.9rem; }
  .dep-tid { min-width: 32px; font-weight: 700; }
  .dep-pct { min-width: 36px; text-align: right; font-size: 0.85rem; }
  .dep-name { font-size: 0.8rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ── Sidebar: Status Panel ─────────────────────────── */
  .sp-title { color: var(--cyan); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; }
  .sp-row { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; padding: 3px 0; }
  .sp-ic { width: 12px; text-align: center; flex-shrink: 0; }
  .sp-label { min-width: 90px; font-size: 0.85rem; }
  .sp-ct { min-width: 18px; text-align: right; font-weight: 700; color: var(--bright); }
  .sp-pct { min-width: 32px; text-align: right; font-size: 0.8rem; color: var(--dim); }

  .sp-row.st-complete .sp-ic, .sp-row.st-complete .sp-label { color: var(--green); }
  .sp-row.st-in-progress .sp-ic, .sp-row.st-in-progress .sp-label { color: var(--yellow); }
  .sp-row.st-not-started .sp-ic, .sp-row.st-not-started .sp-label { color: var(--dim); }
  .sp-row.st-partial .sp-ic, .sp-row.st-partial .sp-label { color: var(--yellow); opacity: 0.7; }
  .sp-row.st-superseded .sp-ic, .sp-row.st-superseded .sp-label { color: var(--red); opacity: 0.5; }

  /* ── Sidebar: Tier Panel ───────────────────────────── */
  .tp-row { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; padding: 4px 6px; cursor: pointer; }
  .tp-row:hover { background: var(--navy-lt); }
  .tp-id { min-width: 32px; font-weight: 700; font-size: 0.85rem; }
  .tp-pct { min-width: 32px; text-align: right; font-size: 0.8rem; }
  .tp-ratio { font-size: 0.75rem; min-width: 28px; text-align: right; }

  /* ── View Transition ───────────────────────────────── */
  .view-enter { animation: redraw 0.1s steps(3); }
  @keyframes redraw { 0% { opacity: 0.15; } 100% { opacity: 1; } }


  /* ── Detail Screen ─────────────────────────────────── */
  .detail-screen { flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding: 0; }
  .detail-header {
    display: flex; align-items: center; gap: 16px;
    padding: 12px 20px; border-bottom: 1px solid var(--border-color);
    border-left: 2px solid var(--border-bright);
  }
  .detail-back { color: var(--cyan); cursor: pointer; font-size: 0.85rem; }
  .detail-back:hover { color: var(--bright); }
  .detail-title { color: var(--bright); font-weight: 700; font-size: 1.05rem; letter-spacing: 0.05em; }

  .detail-body { padding: 28px 32px; flex: 1; overflow-y: auto; border-left: 2px solid var(--border-bright); }

  .detail-card { margin-bottom: 28px; border: 1px solid var(--border-color); background: var(--navy-panel); }
  .dc-row { display: flex; gap: 16px; padding: 12px 20px; }
  .dc-label { min-width: 140px; color: var(--cyan); font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; flex-shrink: 0; }
  .dc-value { font-size: 0.92rem; flex: 1; }
  .dc-value.st-complete { color: var(--green); }
  .dc-value.st-in-progress { color: var(--yellow); }
  .dc-value.st-not-started { color: var(--dim); }
  .dc-value.st-superseded { color: var(--red); }
  .dc-value.st-partial { color: var(--yellow); }
  .dc-divider { border-bottom: 1px solid var(--border-color); }

  .detail-siblings { border: 1px solid var(--border-color); background: var(--navy-panel); }
  .ds-title { padding: 10px 20px; font-size: 0.82rem; font-weight: 700; color: var(--cyan); letter-spacing: 0.08em; border-bottom: 1px solid var(--border-color); }
  .ds-row { display: flex; gap: 10px; padding: 6px 20px; cursor: pointer; font-size: 0.9rem; }
  .ds-row:hover { background: var(--navy-lt); }
  .ds-current { background: var(--cursor-bg) !important; }
  .ds-ic { width: 14px; text-align: center; }
  .ds-num { min-width: 24px; color: var(--dim); font-size: 0.85rem; }
  .ds-name { flex: 1; }
  .ds-st { font-size: 0.75rem; letter-spacing: 0.06em; min-width: 90px; text-align: right; }
  .ds-row.st-complete .ds-ic { color: var(--green); }
  .ds-row.st-complete .ds-st { color: var(--green); }
  .ds-row.st-in-progress .ds-ic, .ds-row.st-in-progress .ds-name, .ds-row.st-in-progress .ds-st { color: var(--yellow); }
  .ds-row.st-not-started .ds-ic, .ds-row.st-not-started .ds-name, .ds-row.st-not-started .ds-st { color: var(--dim); }
  .ds-row.st-superseded .ds-name { text-decoration: line-through; opacity: 0.5; }

  /* ── Responsive ────────────────────────────────────── */

  /* Narrow sidebar on medium screens */
  @media (max-width: 1024px) {
    .sidebar { flex: 0 0 260px; }
    .pbar-wide { width: 90px; }
    .sp-label { min-width: 70px; font-size: 0.8rem; }
  }

  /* Stack layout on tablets */
  @media (max-width: 768px) {
    .tui { font-size: 0.88rem; }
    .tui-content { flex-direction: column; }
    .div-v { width: auto; height: 1px; }
    .sidebar { flex: 0 0 auto; max-height: 35vh; flex-direction: row; overflow: hidden; }
    .side-panel { flex: 1; min-width: 0; overflow-x: auto; overflow-y: auto; }
    .div-h { width: 1px; height: auto; }
    .pane-main { border-left: none; border-top: 2px solid var(--border-bright); }
    .bar-hints { display: none; }
    .detail-body { padding: 20px; }
    .dc-row { flex-direction: column; gap: 4px; padding: 10px 16px; }
    .dc-label { min-width: 0; }
  }

  /* Phone — hide sidebar entirely */
  @media (max-width: 580px) {
    .tui { font-size: 0.82rem; }
    .sidebar { display: none; }
    .div-v { display: none; }
    .pane-main { border-left: 2px solid var(--border-bright); }
    .s-st, .ds-st { display: none; }
    .tier-label { display: none; }
    .pane-scroll { padding: 12px 14px; }
    .detail-body { padding: 16px; }
    .detail-header { padding: 10px 14px; }
    .ds-row { padding: 5px 14px; }
    .bar { padding: 0 10px; font-size: 0.75rem; height: 28px; }
    .bar-r { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .view-enter { animation: none; }
  }
</style>
