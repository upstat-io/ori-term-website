<script lang="ts">
  import { onMount } from 'svelte';

  interface TocEntry {
    id: string;
    text: string;
    level: number;
  }

  interface Props {
    entries: TocEntry[];
  }

  let { entries }: Props = $props();
  let activeId = $state('');

  onMount(() => {
    const observer = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (item.isIntersecting) {
            activeId = item.target.id;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    for (const entry of entries) {
      const el = document.getElementById(entry.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  });
</script>

<nav class="toc" aria-label="Table of contents">
  <div class="toc-label">// CONTENTS</div>
  <ul class="toc-list">
    {#each entries as entry}
      <li
        class="toc-item"
        class:depth-3={entry.level === 3}
        class:active={activeId === entry.id}
      >
        <a href="#{entry.id}" class="toc-link">
          {entry.text}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .toc {
    position: sticky;
    top: 80px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    padding-right: 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .toc-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .toc-list {
    list-style: none;
  }

  .toc-item {
    border-left: var(--border-weight) solid var(--border);
    margin-bottom: 0;
  }

  .toc-item.active {
    border-left-color: var(--accent);
  }

  .toc-item.active .toc-link {
    color: var(--accent);
  }

  .toc-item.depth-3 {
    padding-left: 12px;
  }

  .toc-link {
    display: block;
    padding: 6px 0 6px 16px;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-decoration: none;
    border-bottom: none;
    
    letter-spacing: 0.02em;
  }

  .toc-link:hover {
    color: var(--text-bright);
    border-bottom: none;
  }
</style>
