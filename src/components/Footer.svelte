<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-left">
      <span class="muted">// ori-term {year}</span>
    </div>
    <div class="footer-right">
      <a href="https://github.com/user/ori-term" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </div>
  </div>
</footer>

<style>
  .footer {
    border-top: var(--border-weight) solid var(--border);
    padding: 24px var(--gutter);
  }

  .footer-inner {
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }

  .muted {
    color: var(--text-muted);
  }

  .footer-inner a {
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    border-bottom: none;
  }

  .footer-inner a:hover {
    color: var(--accent);
  }
</style>
