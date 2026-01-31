<script lang="ts">
	interface Props {
		isOpen: boolean;
		modelUrl: string;
		title: string;
		onClose: () => void;
	}

	let { isOpen, modelUrl, title, onClose }: Props = $props();
	let isLoading = $state(true);

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function handleModelLoad() {
		isLoading = false;
	}

	// Reset loading state when model URL changes
	$effect(() => {
		if (modelUrl) {
			isLoading = true;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Content -->
		<div
			class="relative w-full max-w-lg bg-white rounded-[20px] shadow-xl overflow-hidden"
			style="max-height: 85vh;"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-5 py-4 border-b border-[#E8F0EC]">
				<h2
					id="modal-title"
					class="text-xl font-semibold text-[#1A2E1F] font-fredoka"
				>
					{title}
				</h2>
				<button
					onclick={onClose}
					class="flex items-center justify-center w-10 h-10 rounded-full bg-[#F0F7F4] hover:bg-[#E8F0EC] transition-colors duration-200 text-[#1A2E1F]"
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>

			<!-- Model Viewer Container -->
			<div class="relative w-full" style="height: 400px;">
				<!-- Loading Spinner -->
				{#if isLoading}
					<div class="absolute inset-0 flex flex-col items-center justify-center bg-[#F0F7F4] z-10">
						<div class="relative">
							<div class="w-12 h-12 border-4 border-[#E8F0EC] border-t-[#22A652] rounded-full animate-spin"></div>
						</div>
						<p class="mt-4 text-sm text-[#1A2E1F]/70 font-nunito">Loading 3D model...</p>
					</div>
				{/if}

				<!-- Model Viewer Web Component -->
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

			<!-- Footer with hint -->
			<div class="px-5 py-3 bg-[#F0F7F4] border-t border-[#E8F0EC]">
				<p class="text-sm text-[#1A2E1F]/60 font-nunito text-center">
					Drag to rotate • Pinch to zoom • Scroll to zoom
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Ensure model-viewer fills its container */
	model-viewer {
		--poster-color: #F0F7F4;
	}

	/* Animation for modal entrance */
	@keyframes modal-fade-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.fixed > div:last-child {
		animation: modal-fade-in 0.2s ease-out;
	}
</style>
