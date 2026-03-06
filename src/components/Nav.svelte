<script lang="ts">
  import { base } from '../lib/base';

  const links = [
    { href: `${base}/features`, label: 'FEATURES' },
    { href: `${base}/docs`, label: 'DOCS' },
    { href: `${base}/install`, label: 'INSTALL' },
  ];

  const githubPath = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';
  const heartPath = 'M8 14.25l-1.45-1.32C2.84 9.54 0 7.07 0 4.28 0 2.04 1.74.25 3.95.25c1.24 0 2.44.58 3.24 1.51h1.62C9.61.83 10.81.25 12.05.25 14.26.25 16 2.04 16 4.28c0 2.79-2.84 5.26-6.55 8.65L8 14.25z';

  type GlitchPhase = 'glitched' | 'restoring' | 'restored';

  let ghPhase = $state<GlitchPhase>('glitched');
  let ghTimeout: ReturnType<typeof setTimeout> | null = null;
  let heartPhase = $state<GlitchPhase>('glitched');
  let heartTimeout: ReturnType<typeof setTimeout> | null = null;

  function makeHandlers(getPhase: () => GlitchPhase, setPhase: (p: GlitchPhase) => void, getTimeout: () => ReturnType<typeof setTimeout> | null, setTimeout_: (t: ReturnType<typeof setTimeout> | null) => void) {
    return {
      enter() {
        if (getPhase() === 'restored') return;
        setPhase('restoring');
        if (getTimeout()) clearTimeout(getTimeout()!);
        setTimeout_(setTimeout(() => { setPhase('restored'); }, 300));
      },
      leave() {
        if (getTimeout()) clearTimeout(getTimeout()!);
        setTimeout_(null);
        setPhase('glitched');
      },
    };
  }

  const gh = makeHandlers(() => ghPhase, p => ghPhase = p, () => ghTimeout, t => ghTimeout = t);
  const heart = makeHandlers(() => heartPhase, p => heartPhase = p, () => heartTimeout, t => heartTimeout = t);
</script>

<nav class="nav" aria-label="Main navigation">
  <div class="nav-inner">
    <a href={`${base}/`} class="logo" aria-label="ori-term home">
      <span class="logo-bracket">[</span>
      <span class="logo-name">ori-term</span>
      <span class="logo-bracket">]</span>
    </a>
    <ul class="nav-links">
      {#each links as link}
        <li>
          <a href={link.href} class="nav-link">{link.label}</a>
        </li>
      {/each}
      <li>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <a
          href="https://github.com/sponsors/upstat-io"
          class="nav-link icon-link sponsor-link"
          class:restoring={heartPhase === 'restoring'}
          class:restored={heartPhase === 'restored'}
          target="_blank"
          rel="noopener noreferrer"
          onmouseenter={heart.enter}
          onmouseleave={heart.leave}
        >
          <span class="glitch-icon">
            <svg class="gi-glitch" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g clip-path="url(#hs1)"><path d={heartPath} fill="currentColor" transform="translate(1,0)"/></g>
              <g clip-path="url(#hs2)"><path d={heartPath} fill="currentColor" transform="translate(-1.5,0)"/></g>
              <g clip-path="url(#hs3)"><path d={heartPath} fill="currentColor" transform="translate(1,0)"/></g>
              <g clip-path="url(#hs4)"><path d={heartPath} fill="currentColor" transform="translate(-0.5,0)"/></g>
              <defs>
                <clipPath id="hs1"><rect x="0" y="0" width="16" height="4"/></clipPath>
                <clipPath id="hs2"><rect x="0" y="4" width="16" height="3.5"/></clipPath>
                <clipPath id="hs3"><rect x="0" y="7.5" width="16" height="3.5"/></clipPath>
                <clipPath id="hs4"><rect x="0" y="11" width="16" height="4"/></clipPath>
              </defs>
            </svg>
            <svg class="gi-real" viewBox="0 0 16 15" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d={heartPath} fill="currentColor"/>
            </svg>
          </span>
          <span>SPONSOR</span>
        </a>
      </li>
      <li>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <a
          href="https://github.com/upstat-io/ori_term"
          class="nav-link icon-link"
          class:restoring={ghPhase === 'restoring'}
          class:restored={ghPhase === 'restored'}
          target="_blank"
          rel="noopener noreferrer"
          onmouseenter={gh.enter}
          onmouseleave={gh.leave}
        >
          <span class="glitch-icon">
            <svg class="gi-glitch" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g clip-path="url(#gs1)"><path d={githubPath} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" transform="translate(1,0)"/></g>
              <g clip-path="url(#gs2)"><path d={githubPath} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" transform="translate(-1.5,0)"/></g>
              <g clip-path="url(#gs3)"><path d={githubPath} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" transform="translate(1,0)"/></g>
              <g clip-path="url(#gs4)"><path d={githubPath} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" transform="translate(-0.5,0)"/></g>
              <g clip-path="url(#gs5)"><path d={githubPath} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" transform="translate(0.5,0)"/></g>
              <defs>
                <clipPath id="gs1"><rect x="0" y="0" width="16" height="3.5"/></clipPath>
                <clipPath id="gs2"><rect x="0" y="3.5" width="16" height="3"/></clipPath>
                <clipPath id="gs3"><rect x="0" y="6.5" width="16" height="2.5"/></clipPath>
                <clipPath id="gs4"><rect x="0" y="9" width="16" height="3.5"/></clipPath>
                <clipPath id="gs5"><rect x="0" y="12.5" width="16" height="3.5"/></clipPath>
              </defs>
            </svg>
            <svg class="gi-real" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d={githubPath} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>
          </span>
          <span>SOURCE</span>
        </a>
      </li>
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
    align-items: center;
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

  .icon-link {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .nav-links li {
    display: flex;
    align-items: center;
  }

  .glitch-icon {
    position: relative;
    width: 16px;
    height: 16px;
  }

  .gi-glitch,
  .gi-real {
    position: absolute;
    inset: 0;
    width: 16px;
    height: 16px;
  }

  .gi-real {
    opacity: 0;
  }

  .icon-link.restoring .gi-glitch {
    animation: iconGlitch 0.3s steps(1) forwards;
  }

  .icon-link.restored .gi-glitch {
    opacity: 0;
  }

  .icon-link.restored .gi-real {
    opacity: 1;
  }


  @keyframes iconGlitch {
    0%   { transform: translate(0, 0); filter: brightness(1); }
    14%  { transform: translate(-2px, 1px); filter: brightness(2); }
    28%  { transform: translate(3px, -1px); filter: brightness(0.4); }
    42%  { transform: translate(-1px, 2px); filter: brightness(3); }
    57%  { transform: translate(2px, -2px); filter: brightness(0.2); }
    71%  { transform: translate(-3px, 0); filter: brightness(2.5); }
    85%  { transform: translate(1px, 1px); filter: brightness(4); }
    100% { opacity: 0; }
  }

  @media (max-width: 480px) {
    .nav-links {
      gap: 16px;
    }

    .nav-link {
      font-size: 0.65rem;
      letter-spacing: 0.1em;
    }

    .source-link span:last-child {
      display: none;
    }
  }
</style>
