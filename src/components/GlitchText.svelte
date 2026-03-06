<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    text: string;
    tag?: 'h1' | 'h2' | 'h3' | 'span';
    glitchOnHover?: boolean;
  }

  let { text, tag = 'h1', glitchOnHover = false }: Props = $props();

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▄▀■□▪▫';
  let displayText = $state(text);
  let isGlitching = $state(false);

  function glitch() {
    if (isGlitching) return;
    isGlitching = true;

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
        isGlitching = false;
      }
    }, 40);
  }

  onMount(() => {
    if (!glitchOnHover) {
      glitch();
    }
  });

  function handleMouseEnter() {
    if (glitchOnHover) {
      glitch();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
  this={tag}
  class="glitch-text"
  onmouseenter={handleMouseEnter}
  aria-label={text}
>
  {displayText}
</svelte:element>

<style>
  .glitch-text {
    position: relative;
    display: inline-block;
  }
</style>
