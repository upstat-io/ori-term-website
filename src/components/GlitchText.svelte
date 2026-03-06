<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    text: string;
    tag?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
    delay?: number;
    speed?: number;
  }

  let {
    text,
    tag = 'h1',
    delay = 0,
    speed = 40,
  }: Props = $props();

  const glitchChars = '!@#$%^&*_+-=[]{}|;:<>?/~░▒▓█▄▀■□▪▫';
  let displayText = $state('');

  function glitch() {
    const original = text;
    let iterations = 0;
    const maxIterations = original.length;

    const interval = setInterval(() => {
      displayText = original
        .split('')
        .map((char, index) => {
          if (index < iterations) return original[index];
          if (char === ' ') return ' ';
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        })
        .join('');

      iterations += 1;

      if (iterations > maxIterations) {
        clearInterval(interval);
        displayText = original;
      }
    }, speed);
  }

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayText = text;
      return;
    }

    if (delay > 0) {
      const t = setTimeout(glitch, delay);
      return () => clearTimeout(t);
    }
    glitch();
  });
</script>

<svelte:element this={tag} class="glitch-text" aria-label={text}>
  {displayText}
</svelte:element>

<style>
  .glitch-text {
    position: relative;
  }
</style>
