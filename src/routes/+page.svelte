<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { userStore } from '$lib/stores/user.svelte';
  import { cn, sfx } from '$lib/utils';

  let nameInput = $state('');
  let isReturningUser = $derived(userStore.hasUser);
  let showNameInput = $state(false);

  function handleSubmit() {
    if (nameInput.trim()) {
      userStore.setName(nameInput.trim());
      sfx.complete();
      goto('/ar');
    }
  }

  function handleContinue() {
    sfx.tap();
    goto('/ar');
  }

  function handleChangeName() {
    showNameInput = true;
    nameInput = userStore.user?.name ?? '';
  }
</script>

<svelte:head>
  <title>Welcome - ClimaTales AR</title>
</svelte:head>

<div class="min-h-screen min-h-dvh flex flex-col bg-gradient-to-b from-canopy-50 via-mist to-ocean-50 overflow-hidden relative">
  <!-- Decorative background elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-20 -right-20 w-64 h-64 bg-canopy-200 rounded-full opacity-40 blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-ocean-200 rounded-full opacity-30 blur-3xl"></div>
    <div class="absolute top-1/3 right-0 w-48 h-48 bg-coral-200 rounded-full opacity-20 blur-2xl"></div>
  </div>

  <!-- Main content -->
  <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
    <!-- Logo/Mascot area -->
    <div class="mb-8 animate-float">
      <div class="w-32 h-32 rounded-full bg-gradient-to-br from-canopy-400 to-ocean-500 flex items-center justify-center shadow-xl">
        <Icon icon="solar:earth-bold-duotone" class="w-20 h-20 text-white" />
      </div>
    </div>

    <!-- Title -->
    <h1 class="font-display text-4xl md:text-5xl font-bold text-canopy-900 text-center mb-3">
      ClimaTales AR
    </h1>
    <p class="font-body text-lg text-canopy-700 text-center mb-8 max-w-xs">
      Where Stories Come Alive to Save Our Planet
    </p>

    <!-- Content based on user state -->
    {#if isReturningUser && !showNameInput}
      <!-- Returning user -->
      <div class="w-full max-w-sm space-y-4 animate-fade-in">
        <div class="bg-white rounded-card p-6 shadow-lg text-center">
          <p class="font-body text-canopy-700 mb-2">Welcome back,</p>
          <p class="font-display text-2xl font-semibold text-canopy-900 mb-4">
            {userStore.displayName}!
          </p>
          <div class="flex flex-col gap-3">
            <Button onclick={handleContinue} class="w-full">
              <Icon icon="solar:play-bold" class="w-5 h-5" />
              Continue Learning
            </Button>
            <Button variant="ghost" onclick={handleChangeName} class="w-full">
              <Icon icon="solar:pen-linear" class="w-4 h-4" />
              Change Name
            </Button>
          </div>
        </div>
      </div>
    {:else}
      <!-- New user or changing name -->
      <div class="w-full max-w-sm space-y-4 animate-fade-in">
        <div class="bg-white rounded-card p-6 shadow-lg">
          <label for="name-input" class="block font-accent font-semibold text-canopy-800 mb-3 text-center">
            {showNameInput ? 'Update your name' : "What's your name, explorer?"}
          </label>
          <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
            <Input
              id="name-input"
              type="text"
              placeholder="Enter your name..."
              bind:value={nameInput}
              class="text-center"
              autofocus
            />
            <Button
              type="submit"
              class="w-full"
              disabled={!nameInput.trim()}
            >
              <Icon icon="solar:rocket-bold" class="w-5 h-5" />
              {showNameInput ? 'Update & Continue' : 'Start Adventure'}
            </Button>
          </form>
        </div>

        {#if showNameInput}
          <button
            onclick={() => { showNameInput = false; }}
            class="w-full text-center text-canopy-600 font-body text-sm hover:text-canopy-800 transition-colors touch-manipulation"
          >
            Cancel
          </button>
        {/if}
      </div>
    {/if}

    <!-- Features preview -->
    <div class="mt-12 w-full max-w-sm">
      <div class="flex justify-center gap-6">
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="w-12 h-12 rounded-full bg-canopy-100 flex items-center justify-center">
            <Icon icon="solar:camera-bold" class="w-6 h-6 text-canopy-600" />
          </div>
          <span class="font-accent text-xs text-canopy-700">AR Mode</span>
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="w-12 h-12 rounded-full bg-ocean-100 flex items-center justify-center">
            <Icon icon="solar:clipboard-list-bold" class="w-6 h-6 text-ocean-600" />
          </div>
          <span class="font-accent text-xs text-canopy-700">Quizzes</span>
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center">
            <Icon icon="solar:play-circle-bold" class="w-6 h-6 text-coral-600" />
          </div>
          <span class="font-accent text-xs text-canopy-700">Videos</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="py-4 text-center relative z-10">
    <p class="font-body text-xs text-canopy-600/60">
      An educational AR experience
    </p>
  </footer>
</div>
