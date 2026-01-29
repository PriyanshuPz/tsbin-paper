<script lang="ts">
  import { Loader } from "lucide-svelte";
  import type { User } from "$lib/stores/auth";

  let {
    show,
    user,
    currentTitle = "",
    onClose,
    onSaveDraft,
    onPublish,
  }: {
    show: boolean;
    user: User | null;
    currentTitle?: string;
    onClose: () => void;
    onSaveDraft: (title: string) => Promise<void>;
    onPublish: (title: string) => Promise<void>;
  } = $props();

  let title = $state("");
  let saving = $state(false);
  let publishing = $state(false);
  let error = $state("");

  $effect(() => {
    if (show && currentTitle && !title) {
      title = currentTitle;
    }
  });

  function handleBackdropClick() {
    if (!saving && !publishing) {
      onClose();
    }
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && !saving && !publishing) {
      e.preventDefault();
      onClose();
    }
  }

  async function handleSaveDraft() {
    if (!title.trim()) {
      error = "Please enter a title";
      return;
    }
    error = "";
    saving = true;
    try {
      await onSaveDraft(title.trim());
      title = "";
      onClose();
    } catch (err: any) {
      error = err.message || "Failed to save draft";
    } finally {
      saving = false;
    }
  }

  async function handlePublish() {
    if (!title.trim()) {
      error = "Please enter a title";
      return;
    }
    error = "";
    publishing = true;
    try {
      await onPublish(title.trim());
      title = "";
      onClose();
    } catch (err: any) {
      error = err.message || "Failed to publish";
    } finally {
      publishing = false;
    }
  }

  function resetOnClose() {
    if (!saving && !publishing) {
      title = "";
      error = "";
      onClose();
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onclick={handleBackdropClick}
    onkeydown={handleBackdropKeydown}
    role="button"
    tabindex="0"
    aria-label="Close modal"
  >
    <div
      class="bg-bg border border-border rounded-lg p-8 max-w-md w-full mx-4"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === "Escape" && resetOnClose()}
      role="dialog"
      aria-modal="true"
      tabindex="0"
      aria-labelledby="modal-title"
    >
      <h2
        id="modal-title"
        class="text-2xl font-semibold mb-2 text-text-primary"
      >
        {#if user}
          {currentTitle ? currentTitle : "Save or Publish Paper"}
        {:else}
          Login Required
        {/if}
      </h2>

      {#if !user}
        <p class="text-text-secondary mb-6">
          Please login with Google to save and publish your papers.
        </p>
        <button
          onclick={resetOnClose}
          class="w-full px-4 py-2 bg-text-primary text-bg rounded hover:opacity-80"
        >
          Close
        </button>
      {:else}
        <p class="text-text-secondary mb-6 text-sm">
          Save as draft or publish to IPFS permanently
        </p>

        <div class="mb-6">
          <label
            for="paper-title"
            class="block text-sm font-medium text-text-primary mb-2"
          >
            Paper Title
          </label>
          <input
            id="paper-title"
            type="text"
            bind:value={title}
            placeholder="Enter a title for your paper"
            class="w-full px-3 py-2 bg-surface border border-border rounded text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-text-primary"
            disabled={saving || publishing}
          />
          {#if error}
            <p class="text-red-600 text-xs mt-1">{error}</p>
          {/if}
        </div>

        <div class="flex gap-3">
          <button
            onclick={handleSaveDraft}
            disabled={saving || publishing}
            class="flex-1 px-4 py-2 border border-border bg-bg text-text-primary rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {#if saving}
              <Loader size={16} class="animate-spin" />
              Saving...
            {:else}
              Save Draft
            {/if}
          </button>
          <button
            onclick={handlePublish}
            disabled={saving || publishing}
            class="flex-1 px-4 py-2 bg-text-primary text-bg rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {#if publishing}
              <Loader size={16} class="animate-spin" />
              Publishing...
            {:else}
              Publish to IPFS
            {/if}
          </button>
        </div>

        <button
          onclick={resetOnClose}
          disabled={saving || publishing}
          class="w-full mt-3 px-4 py-2 text-text-secondary hover:text-text-primary text-sm disabled:opacity-50"
        >
          Cancel
        </button>
      {/if}
    </div>
  </div>
{/if}
