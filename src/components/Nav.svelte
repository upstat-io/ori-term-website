<script lang="ts">
  const links = [
    { href: '/features', label: 'FEATURES' },
    { href: '/docs', label: 'DOCS' },
    { href: '/install', label: 'INSTALL' },
    { href: 'https://github.com/user/ori-term', label: 'SOURCE', external: true },
  ];
</script>

<nav class="nav" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="logo" aria-label="ori-term home">
      <span class="logo-bracket">[</span>
      <span class="logo-name">ori-term</span>
      <span class="logo-bracket">]</span>
    </a>
    <ul class="nav-links">
      {#each links as link}
        <li>
          <a
            href={link.href}
            class="nav-link"
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-bottom: var(--border-weight) solid var(--border);
    background: var(--bg);
  }

  .nav-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--gutter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }

  .logo {
    font-weight: 700;
    font-size: 0.9rem;
    border-bottom: none;
    letter-spacing: 0.05em;
  }

  .logo:hover {
    border-bottom: none;
  }

  .logo-bracket {
    color: var(--text-muted);
  }

  .logo-name {
    color: var(--text-bright);
  }

  .logo:hover .logo-name {
    color: var(--accent);
  }

  .nav-links {
    list-style: none;
    display: flex;
    gap: 32px;
  }

  .nav-link {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    padding: 4px 0;
    border-bottom: var(--border-weight) solid transparent;
    
  }

  .nav-link:hover {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  @media (max-width: 480px) {
    .nav-links {
      gap: 16px;
    }

    .nav-link {
      font-size: 0.65rem;
      letter-spacing: 0.1em;
    }
  }
</style>
