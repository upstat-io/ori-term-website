<script lang="ts">
  import Praetorian from './Praetorian.svelte';
  import { base } from '../lib/base';

  const year = new Date().getFullYear();
  let praet: ReturnType<typeof Praetorian>;

  const links = [
    { href: `${base}/features`, label: 'FEATURES' },
    { href: `${base}/docs`, label: 'DOCS' },
    { href: `${base}/install`, label: 'INSTALL' },
    { href: `${base}/screenshots`, label: 'SCREENSHOTS' },
    { href: 'https://github.com/sponsors/upstat-io', label: 'SPONSOR', external: true },
    { href: 'https://github.com/user/ori-term', label: 'SOURCE', external: true },
  ];
</script>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-top">
      <nav class="footer-links" aria-label="Footer navigation">
        {#each links as link}
          <a
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >{link.label}</a>
        {/each}
      </nav>
    </div>
    <div class="footer-bottom">
      <span class="muted">// ori-term {year}</span>
      <span class="muted">A project by <a href="https://upstat.io" target="_blank" rel="noopener noreferrer">upstat.io</a></span>
      <button class="praet-trigger" onclick={() => praet.trigger()} aria-label="Praetorian">π</button>
    </div>
  </div>
</footer>

<Praetorian bind:this={praet} />

<style>
  .footer {
    border-top: var(--border-weight) solid var(--border);
    padding: 40px var(--gutter) 32px;
  }

  .footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }

  .footer-links {
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
  }

  .footer-links a {
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    border-bottom: var(--border-weight) solid transparent;
    padding-bottom: 2px;
  }

  .footer-links a:hover {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 32px;
    padding-top: 24px;
    border-top: var(--border-weight) solid var(--border);
  }

  .footer-bottom > * {
    flex: 1;
  }

  .footer-bottom > :nth-child(2) {
    text-align: center;
  }

  .footer-bottom > :last-child {
    text-align: right;
  }

  .muted {
    color: var(--text-muted);
  }

  .muted a {
    color: var(--text-muted);
    border-bottom: var(--border-weight) solid var(--border);
    padding-bottom: 1px;
  }

  .muted a:hover {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .praet-trigger {
    background: none;
    border: none;
    color: var(--text-muted);
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 1.3rem;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }

  .praet-trigger:hover {
    color: var(--accent);
  }

  @media (max-width: 480px) {
    .footer-links {
      gap: 16px;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  }
</style>
