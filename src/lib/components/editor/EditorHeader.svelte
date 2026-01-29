<script lang="ts">
  import { themes } from "$lib/config/themes";
  import { fonts } from "$lib/config/fonts";
  import ExportDropdown from "./ExportDropdown.svelte";
  import { ChevronDown, User, FilePlus, Settings } from "lucide-svelte";
  import { authStore, type User as AuthUser } from "$lib/stores/auth";

  interface Props {
    previewFont: string;
    previewTheme: string;
    includeWatermark: boolean;
    user: AuthUser | null;
    onFontChange: (font: string) => void;
    onThemeChange: (theme: string) => void;
    onWatermarkToggle: (value: boolean) => void;
    onExportPNG: () => void;
    onExportHTML: () => void;
    onExportMarkdown: () => void;
    onPublish: () => void;
    onNewPaper: () => void;
    onProfileClick: () => void;
    onLogin: () => void;
  }

  let {
    previewFont,
    previewTheme,
    includeWatermark,
    user,
    onFontChange,
    onThemeChange,
    onWatermarkToggle,
    onExportPNG,
    onExportHTML,
    onExportMarkdown,
    onPublish,
    onNewPaper,
    onProfileClick,
    onLogin,
  }: Props = $props();

  let showStylesDropdown = $state(false);
  let showProfileDropdown = $state(false);

  function handleLogout() {
    authStore.logout();
    showProfileDropdown = false;
  }
</script>

<header
  class="border-b border-border bg-bg flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2"
>
  <a
    href="/"
    class="text-base sm:text-lg font-semibold no-underline text-text-primary hover:opacity-70 transition-opacity"
  >
    paper
  </a>

  <div class="flex items-center gap-1 sm:gap-2">
    <div class="relative">
      <button
        onclick={() => (showStylesDropdown = !showStylesDropdown)}
        class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs border border-border rounded bg-bg text-text-primary hover:bg-surface flex items-center gap-1 transition-colors"
        title="Customize styles"
      >
        <Settings size={14} />
        <span class="hidden sm:inline">Styles</span>
        <ChevronDown size={14} />
      </button>
      {#if showStylesDropdown}
        <div
          class="absolute right-0 mt-1 bg-bg border border-border rounded shadow-lg z-10 min-w-48"
        >
          <div class="px-3 py-2 border-b border-border">
            <p class="text-xs font-semibold text-text-secondary mb-2">Theme</p>
            <div class="space-y-1">
              {#each themes as theme}
                <button
                  onclick={() => {
                    onThemeChange(theme.id);
                  }}
                  class="block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-surface transition-colors text-text-primary"
                  class:bg-surface={previewTheme === theme.id}
                  class:font-semibold={previewTheme === theme.id}
                >
                  {theme.label}
                  {#if previewTheme === theme.id}
                    <span class="float-right">✓</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <div class="px-3 py-2 border-b border-border">
            <p class="text-xs font-semibold text-text-secondary mb-2">Font</p>
            <div class="space-y-1">
              {#each fonts as font}
                <button
                  onclick={() => {
                    onFontChange(font.id);
                  }}
                  class="block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-surface transition-colors text-text-primary"
                  class:bg-surface={previewFont === font.id}
                  class:font-semibold={previewFont === font.id}
                >
                  {font.label}
                  {#if previewFont === font.id}
                    <span class="float-right">✓</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- Watermark Toggle -->
          <div class="px-3 py-2">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-xs font-semibold text-text-secondary"
                >Watermark</span
              >
              <input
                type="checkbox"
                checked={includeWatermark}
                onchange={(e) =>
                  onWatermarkToggle((e.target as HTMLInputElement).checked)}
                class="w-4 h-4 rounded border-border cursor-pointer accent-text-primary"
              />
            </label>
          </div>
        </div>
      {/if}
    </div>

    <ExportDropdown {onExportPNG} {onExportHTML} {onExportMarkdown} />

    {#if user}
      <button
        onclick={onNewPaper}
        class="px-2 sm:px-3 py-1 sm:py-1.5 text-xs border border-border rounded bg-bg text-text-primary hover:bg-surface flex items-center gap-1 sm:gap-1.5 transition-colors"
        title="New Paper"
      >
        <FilePlus size={14} />
        <span class="hidden sm:inline">New</span>
      </button>

      <button
        onclick={onPublish}
        class="px-3 sm:px-4 py-1 sm:py-1.5 text-xs bg-text-primary text-bg rounded hover:opacity-80 transition-opacity font-medium"
      >
        Publish
      </button>

      <div class="relative">
        <button
          onclick={() => (showProfileDropdown = !showProfileDropdown)}
          class="p-1.5 sm:p-2 border border-border rounded bg-bg text-text-primary hover:bg-surface transition-colors"
          title="Profile"
        >
          <User size={16} />
        </button>
        {#if showProfileDropdown}
          <div
            class="absolute right-0 mt-1 bg-bg border border-border rounded shadow-lg z-10 min-w-40"
          >
            <div class="px-4 py-2 border-b border-border">
              <p class="text-xs font-semibold text-text-primary truncate">
                {user.name}
              </p>
              <p class="text-xs text-text-secondary truncate">{user.email}</p>
            </div>
            <button
              onclick={() => {
                onProfileClick();
                showProfileDropdown = false;
              }}
              class="block w-full text-left px-4 py-2 text-xs hover:bg-surface transition-colors text-text-primary"
            >
              My Papers
            </button>
            <button
              onclick={handleLogout}
              class="block w-full text-left px-4 py-2 text-xs hover:bg-surface transition-colors text-text-primary border-t border-border"
            >
              Logout
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <button
        onclick={onLogin}
        class="px-3 sm:px-4 py-1 sm:py-1.5 text-xs bg-text-primary text-bg rounded hover:opacity-80 transition-opacity font-medium"
      >
        <span class="hidden sm:inline">Login to Publish</span>
        <span class="sm:hidden">Login</span>
      </button>
    {/if}
  </div>
</header>

<svelte:window
  onclick={(e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".relative")) {
      showStylesDropdown = false;
      showProfileDropdown = false;
    }
  }}
/>
