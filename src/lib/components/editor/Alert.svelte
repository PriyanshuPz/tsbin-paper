<script lang="ts">
  interface Props {
    show: boolean;
    message: string;
    type?: "info" | "error" | "warning" | "success";
    actionText?: string;
    actionUrl?: string;
    onClose: () => void;
  }

  let {
    show = $bindable(false),
    message,
    type = "info",
    actionText,
    actionUrl,
    onClose,
  }: Props = $props();

  function close() {
    show = false;
    onClose();
  }

  function handleDialogKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }
</script>

{#if show}
  <div
    role="button"
    tabindex="0"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onclick={close}
    onkeydown={handleDialogKeydown}
  >
    <div
      tabindex="0"
      class="bg-bg border border-border rounded-lg shadow-2xl max-w-md w-full p-6 animate-in"
      role="alertdialog"
      aria-modal="true"
    >
      <div class="flex items-start gap-4">
        <div class="shrink-0 mt-0.5">
          {#if type === "error"}
            <svg
              class="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          {:else if type === "warning"}
            <svg
              class="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          {:else if type === "success"}
            <svg
              class="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          {:else}
            <svg
              class="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          {/if}
        </div>

        <div class="flex-1">
          <p class="text-sm text-text-primary leading-relaxed">{message}</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        {#if actionText && actionUrl}
          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            onclick={close}
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {actionText}
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        {/if}
        <button
          onclick={close}
          class="px-4 py-2 text-sm bg-text-primary text-bg rounded hover:opacity-80 transition-opacity"
        >
          OK
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .animate-in {
    animation: scale-in 0.15s ease-out;
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
