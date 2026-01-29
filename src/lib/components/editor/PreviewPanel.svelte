<script lang="ts">
  import { getThemeById } from "$lib/config/themes";
  import { getFontFamily } from "$lib/config/fonts";

  interface Props {
    previewHtml: string;
    previewTheme: string;
    previewFont: string;
    includeWatermark: boolean;
  }

  let { previewHtml, previewTheme, previewFont, includeWatermark }: Props =
    $props();
</script>

<div class="flex-1 flex flex-col bg-surface overflow-auto">
  <div class="flex-1 flex items-center justify-center p-4">
    <div
      id="preview-card"
      class="w-full max-w-2xl p-12 transition-all theme-{previewTheme}"
      style="background-color: {getThemeById(previewTheme)
        ?.backgroundColor}; color: {getThemeById(previewTheme)
        ?.textColor}; font-family: {getFontFamily(previewFont)};"
    >
      <article class="prose max-w-none">
        {@html previewHtml}
      </article>
    </div>
  </div>
</div>

<style>
  .prose :global(h1) {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .prose :global(h2) {
    font-size: 2rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  .prose :global(h3) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .prose :global(p) {
    margin-bottom: 1rem;
    line-height: 1.7;
  }

  .prose :global(ul),
  .prose :global(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .prose :global(li) {
    margin-bottom: 0.5rem;
  }

  .prose :global(code) {
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
    font-family: "Courier New", monospace;
  }

  .prose :global(pre) {
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .prose :global(pre code) {
    background-color: transparent;
    padding: 0;
    font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
    font-size: 0.875em;
  }

  .prose :global(pre code.hljs) {
    background: transparent;
    padding: 0;
  }

  .prose :global(blockquote) {
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
  }

  .prose :global(a) {
    text-decoration: underline;
  }

  .theme-paper .prose :global(code) {
    background-color: rgba(0, 0, 0, 0.05);
  }
  .theme-paper .prose :global(pre) {
    background-color: #1e1e1e;
  }
  .theme-paper .prose :global(pre code) {
    color: #d4d4d4;
  }
  .theme-paper .prose :global(blockquote) {
    border-left: 4px solid rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.7);
  }

  .theme-dark .prose :global(code) {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .theme-dark .prose :global(pre) {
    background-color: #0d1117;
  }
  .theme-dark .prose :global(pre code) {
    color: #c9d1d9;
  }
  .theme-dark .prose :global(blockquote) {
    border-left: 4px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
  }

  .theme-terminal .prose :global(code) {
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }
  .theme-terminal .prose :global(pre) {
    background-color: #0a0a0a;
  }
  .theme-terminal .prose :global(pre code) {
    color: #22c55e;
  }
  .theme-terminal .prose :global(pre .hljs) {
    filter: hue-rotate(90deg) saturate(0.8);
  }
  .theme-terminal .prose :global(blockquote) {
    border-left: 4px solid rgba(34, 197, 94, 0.5);
    color: rgba(34, 197, 94, 0.8);
  }
  .theme-terminal .prose :global(a) {
    color: #22c55e;
  }

  .theme-sepia .prose :global(code) {
    background-color: rgba(92, 74, 58, 0.1);
  }
  .theme-sepia .prose :global(pre) {
    background-color: #2b2416;
  }
  .theme-sepia .prose :global(pre code) {
    color: #f4ecd8;
  }
  .theme-sepia .prose :global(blockquote) {
    border-left: 4px solid rgba(92, 74, 58, 0.3);
    color: rgba(92, 74, 58, 0.8);
  }

  .theme-nord .prose :global(code) {
    background-color: rgba(136, 192, 208, 0.15);
    color: #88c0d0;
  }
  .theme-nord .prose :global(pre) {
    background-color: #2e3440;
  }
  .theme-nord .prose :global(pre code) {
    color: #d8dee9;
  }
  .theme-nord .prose :global(blockquote) {
    border-left: 4px solid #88c0d0;
    color: #d8dee9;
  }
  .theme-nord .prose :global(a) {
    color: #88c0d0;
  }
</style>
