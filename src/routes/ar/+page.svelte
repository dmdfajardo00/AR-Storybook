<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ARViewer, AROverlay } from '$lib/components/ar';
  import { arStore } from '$lib/stores/ar.svelte';
  import type { StoryPage } from '$lib/types';

  let detectedPage = $state<StoryPage | null>(null);

  function handlePageDetected(page: StoryPage) {
    detectedPage = page;
  }

  onDestroy(() => {
    arStore.reset();
  });
</script>

<svelte:head>
  <title>AR Mode - ClimaTales AR</title>
  <meta name="description" content="Scan storybook pages to unlock AR content about climate change" />
</svelte:head>

<div class="fixed inset-0 pb-nav">
  <ARViewer onPageDetected={handlePageDetected} />
  <AROverlay />
</div>
