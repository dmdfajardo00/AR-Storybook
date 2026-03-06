<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { NarrationButton } from '$lib/components/shared';
	import { sfx } from '$lib/utils';

	interface Props {
		isOpen: boolean;
		modelUrl: string;
		title: string;
		explanation?: string;
		audioUrls?: string[];
		pageId?: number;
		hasNext?: boolean;
		onClose: () => void;
		onNext?: () => void;
	}

	let { isOpen, modelUrl, title, explanation, audioUrls, pageId, hasNext = false, onClose, onNext }: Props = $props();
	let isLoading = $state(true);

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			sfx.modalClose();
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			sfx.modalClose();
			onClose();
		}
	}

	function handleModelLoad() {
		isLoading = false;
	}

	function handleNext() {
		sfx.pageTurn();
		onNext?.();
	}

	$effect(() => {
		if (modelUrl) {
			isLoading = true;
		}
	});

	$effect(() => {
		if (isOpen) sfx.modalOpen();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<div
			class="relative w-full max-w-lg bg-white rounded-[20px] shadow-xl overflow-hidden flex flex-col animate-slideUp"
			style="max-height: min(85dvh, calc(100dvh - 2rem));"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-4 py-3 border-b border-canopy-100 shrink-0">
				<h2
					id="modal-title"
					class="text-lg font-semibold text-canopy-900 font-display truncate pr-2"
				>
					{title}
				</h2>
				<button
					onclick={() => { sfx.modalClose(); onClose(); }}
					class="flex items-center justify-center w-10 h-10 rounded-full bg-canopy-50 hover:bg-canopy-100 transition-colors duration-200 text-canopy-700 shrink-0 touch-manipulation"
					aria-label="Close modal"
				>
					<Icon icon="solar:close-circle-linear" class="w-5 h-5" />
				</button>
			</div>

			<!-- 3D Model Viewer -->
			<div class="relative w-full shrink-0" style="height: min(280px, 40dvh);">
				{#if isLoading}
					<div class="absolute inset-0 flex flex-col items-center justify-center bg-canopy-50 z-10">
						<div class="w-12 h-12 border-4 border-canopy-100 border-t-canopy-500 rounded-full animate-spin"></div>
						<p class="mt-3 text-sm text-canopy-600 font-body">Loading 3D model...</p>
					</div>
				{/if}

				<model-viewer
					src={modelUrl}
					alt={title}
					camera-controls
					auto-rotate
					shadow-intensity="1"
					style="width: 100%; height: 100%; background-color: #F0F7F4;"
					onload={handleModelLoad}
				></model-viewer>

				</div>

			<!-- Explanation Card -->
			{#if explanation}
				<div class="flex-1 overflow-y-auto overscroll-contain min-h-0">
					<div class="px-4 py-4">
						<div class="bg-gradient-to-br from-canopy-500 to-canopy-600 rounded-2xl p-4 shadow-md">
							<p class="font-body text-white text-sm leading-relaxed">
								{@html explanation}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Bottom Action Bar -->
			<div class="px-4 py-3 border-t border-canopy-100 flex items-center gap-3 shrink-0">
				{#if audioUrls?.length}
					<NarrationButton src={audioUrls} label="Listen" />
				{/if}

				{#if pageId && pageId >= 2}
					<button
						onclick={() => { sfx.tap(); goto(`/quiz/${pageId}`); }}
						class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-coral-500 text-white font-accent font-semibold text-sm shadow-md hover:bg-coral-600 active:scale-95 transition-all touch-manipulation"
					>
						<Icon icon="solar:document-medicine-bold" class="w-4 h-4" />
						Quiz
					</button>
				{/if}

				<div class="flex-1"></div>

				{#if hasNext}
					<button
						onclick={handleNext}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-canopy-500 to-ocean-500 text-white font-accent font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all touch-manipulation"
					>
						NEXT
						<Icon icon="solar:alt-arrow-right-bold" class="w-5 h-5" />
					</button>
				{:else}
					<button
						onclick={() => { sfx.modalClose(); onClose(); }}
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-canopy-100 text-canopy-700 font-accent font-semibold text-sm hover:bg-canopy-200 active:scale-95 transition-all touch-manipulation"
					>
						Done
						<Icon icon="solar:check-circle-bold" class="w-4 h-4" />
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	model-viewer {
		--poster-color: #F0F7F4;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideUp {
		animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
</style>
