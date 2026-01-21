<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { BottomNav } from '$lib/components/layout';
  import { userStore } from '$lib/stores/user.svelte';
  import { quizStore } from '$lib/stores/quiz.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Pages that should not show the bottom nav
  const noNavPages = ['/'];
  let showNav = $derived(!noNavPages.includes($page.url.pathname));

  onMount(() => {
    // Load persisted data
    userStore.load();
    quizStore.load();
  });
</script>

<svelte:head>
  <title>ClimaTales AR</title>
  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen bg-mist">
  <main class={showNav ? 'pb-nav' : ''}>
    {@render children()}
  </main>

  {#if showNav}
    <BottomNav />
  {/if}
</div>
