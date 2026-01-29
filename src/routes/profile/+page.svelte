<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";
  import { papersStore, type Paper } from "$lib/stores/papers";
  import { Trash2, Edit, ExternalLink, FileText, Loader } from "lucide-svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import ConfirmDialog from "$lib/components/editor/ConfirmDialog.svelte";
  import moment from "moment";

  let user = $state<any>(null);
  let papers = $state<Paper[]>([]);
  let loading = $state(true);
  let filter = $state<"all" | "published" | "draft">("all");
  let showConfirmDialog = $state(false);
  let paperToDelete = $state<Paper | null>(null);

  onMount(() => {
    const unsubscribe = authStore.subscribe((state) => {
      user = state.user;
      if (!state.loading && !state.user) {
        goto("/");
      } else if (state.user) {
        papersStore.loadUserPapers(state.user.$id);
      }
    });

    const unsubscribePapers = papersStore.subscribe((state) => {
      papers = state.papers;
      loading = state.loading;
    });

    return () => {
      unsubscribe();
      unsubscribePapers();
    };
  });

  const filteredPapers = $derived(
    filter === "all" ? papers : papers.filter((p) => p.status === filter),
  );

  function handleEdit(paper: Paper) {
    papersStore.setCurrentPaper(paper);
    goto("/editor");
  }

  function confirmDelete(paper: Paper) {
    paperToDelete = paper;
    showConfirmDialog = true;
  }

  async function handleDelete() {
    if (!paperToDelete) return;
    try {
      await papersStore.deletePaper(paperToDelete.$id);
      paperToDelete = null;
    } catch (error) {
      console.error("Failed to delete paper:", error);
    }
  }
</script>

<svelte:head>
  <title>My Papers - tsbin paper</title>
</svelte:head>

<Navbar />

<div class="min-h-screen bg-bg py-12 px-4">
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-semibold text-text-primary mb-2">My Papers</h1>
      <p class="text-text-secondary">Manage your published and draft papers</p>
    </div>

    <div class="flex gap-2 mb-6 border-b border-border">
      <button
        onclick={() => (filter = "all")}
        class="px-4 py-2 text-sm transition-colors"
        class:border-b-2={filter === "all"}
        class:border-text-primary={filter === "all"}
        class:text-text-primary={filter === "all"}
        class:text-text-secondary={filter !== "all"}
      >
        All ({papers.length})
      </button>
      <button
        onclick={() => (filter = "published")}
        class="px-4 py-2 text-sm transition-colors"
        class:border-b-2={filter === "published"}
        class:border-text-primary={filter === "published"}
        class:text-text-primary={filter === "published"}
        class:text-text-secondary={filter !== "published"}
      >
        Published ({papers.filter((p) => p.status === "published").length})
      </button>
      <button
        onclick={() => (filter = "draft")}
        class="px-4 py-2 text-sm transition-colors"
        class:border-b-2={filter === "draft"}
        class:border-text-primary={filter === "draft"}
        class:text-text-primary={filter === "draft"}
        class:text-text-secondary={filter !== "draft"}
      >
        Drafts ({papers.filter((p) => p.status === "draft").length})
      </button>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-16">
        <Loader class="animate-spin text-text-secondary" size={32} />
      </div>
    {:else if filteredPapers.length === 0}
      <div class="text-center py-16">
        <FileText size={48} class="mx-auto text-text-secondary mb-4" />
        <p class="text-text-secondary mb-4">
          {filter === "all"
            ? "No papers yet"
            : filter === "published"
              ? "No published papers"
              : "No draft papers"}
        </p>
        <a
          href="/editor"
          class="inline-block px-6 py-2 bg-text-primary text-bg rounded hover:opacity-80 transition-opacity"
        >
          Create Your First Paper
        </a>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredPapers as paper (paper.$id)}
          <div
            class="border hover:border-border rounded-lg p-4 sm:p-6 bg-surface border-border-subtle transition-colors"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
              <div class="flex-1">
                <h3
                  class="text-lg sm:text-xl font-semibold text-text-primary mb-2"
                >
                  {paper.title}
                </h3>
                <div
                  class="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-text-secondary mb-3"
                >
                  <span
                    class="px-2 py-1 rounded font-medium"
                    class:bg-green-100={paper.status === "published"}
                    class:text-green-800={paper.status === "published"}
                    class:bg-yellow-100={paper.status === "draft"}
                    class:text-yellow-800={paper.status === "draft"}
                  >
                    {paper.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {moment(paper.createdAt).format("MMM D, YYYY")}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    {paper.theme}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {paper.font}
                  </span>
                  {#if paper.watermark}
                    <span class="flex items-center gap-1">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Watermark
                    </span>
                  {/if}
                </div>
                {#if paper.content}
                  <p class="text-sm text-text-secondary mb-3 line-clamp-2">
                    {paper.content.substring(0, 150)}{paper.content.length > 150
                      ? "..."
                      : ""}
                  </p>
                {/if}
                {#if paper.ipfsCid}
                  <div class="bg-bg rounded-lg p-3 mt-3 border border-border">
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2 text-xs">
                        <span class="text-text-secondary font-semibold"
                          >IPFS CID:</span
                        >
                        <code
                          class="font-mono text-text-primary bg-surface px-2 py-0.5 rounded text-[10px]"
                          >{paper.ipfsCid}</code
                        >
                      </div>
                      <a
                        href={paper.ipfsGateway}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <ExternalLink size={14} />
                        View Published Paper on IPFS
                      </a>
                    </div>
                  </div>
                {/if}
                <div
                  class="flex items-center gap-2 text-xs text-text-secondary mt-3"
                >
                  <span>Last updated: {moment(paper.updatedAt).fromNow()}</span>
                </div>
              </div>
              <div class="flex sm:flex-col items-center gap-2">
                {#if paper.status === "draft"}
                  <button
                    onclick={() => handleEdit(paper)}
                    class="p-2 text-text-secondary hover:text-text-primary hover:bg-bg rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onclick={() => confirmDelete(paper)}
                    class="p-2 text-text-secondary hover:text-red-600 hover:bg-bg rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                {:else}
                  <a
                    href={paper.ipfsGateway}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 text-text-secondary hover:text-blue-600 hover:bg-bg rounded transition-colors"
                    title="View Published"
                  >
                    <ExternalLink size={18} />
                  </a>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<ConfirmDialog
  bind:show={showConfirmDialog}
  title="Delete Paper"
  message="Are you sure you want to delete '{paperToDelete?.title}'? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={() => {
    paperToDelete = null;
  }}
/>

<Footer />
