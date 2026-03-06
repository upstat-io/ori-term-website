<script lang="ts">
  import { onMount } from 'svelte';

  interface TocEntry {
    id: string;
    text: string;
    level: number;
  }

  interface DocPage {
    title: string;
    href: string;
  }

  interface DocSection {
    label: string;
    pages: DocPage[];
  }

  interface Props {
    sections: DocSection[];
    currentPath: string;
    toc: TocEntry[];
  }

  let { sections, currentPath, toc }: Props = $props();
  let activeId = $state('');

  function isActive(href: string): boolean {
    return currentPath === href || currentPath === href + '/';
  }

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

    for (const entry of toc) {
      const el = document.getElementById(entry.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  });
</script>

<nav class="docs-nav" aria-label="Documentation navigation">
  {#each sections as section}
    <div class="nav-section">
      <div class="nav-section-label">// {section.label}</div>
      <ul class="nav-list">
        {#each section.pages as page}
          <li>
            <a
              href={page.href}
              class="nav-link"
              class:current={isActive(page.href)}
              aria-current={isActive(page.href) ? 'page' : undefined}
            >{page.title}</a>
            {#if isActive(page.href) && toc.length > 0}
              <ul class="toc-list">
                {#each toc as entry}
                  <li
                    class="toc-item"
                    class:depth-3={entry.level === 3}
                    class:active={activeId === entry.id}
                  >
                    <a href="#{entry.id}" class="toc-link">{entry.text}</a>
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</nav>

<style>
  .docs-nav {
    position: sticky;
    top: 80px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    padding-right: 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .nav-section {
    margin-bottom: 24px;
  }

  .nav-section-label {
    font-size: 0.6rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .nav-list {
    list-style: none;
  }

  .nav-link {
    display: block;
    padding: 4px 0 4px 12px;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-decoration: none;
    border-left: var(--border-weight) solid var(--border);
    letter-spacing: 0.02em;
  }

  .nav-link:hover {
    color: var(--text-bright);
  }

  .nav-link.current {
    color: var(--accent);
    border-left-color: var(--accent);
  }

  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .toc-item {
    border-left: var(--border-weight) solid var(--border);
    margin-left: 12px;
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
    padding: 3px 0 3px 12px;
    font-size: 0.7rem;
    color: var(--text-muted);
    text-decoration: none;
    letter-spacing: 0.02em;
  }

  .toc-link:hover {
    color: var(--text-bright);
  }
</style>
