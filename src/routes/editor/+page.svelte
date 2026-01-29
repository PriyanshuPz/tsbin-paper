<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import MarkdownIt from "markdown-it";
  import hljs from "highlight.js";
  import markdownItHighlightJs from "markdown-it-highlightjs";
  import Footer from "$lib/components/Footer.svelte";
  import EditorHeader from "$lib/components/editor/EditorHeader.svelte";
  import EditorPanel from "$lib/components/editor/EditorPanel.svelte";
  import PreviewPanel from "$lib/components/editor/PreviewPanel.svelte";
  import PublishModal from "$lib/components/editor/PublishModal.svelte";
  import Alert from "$lib/components/editor/Alert.svelte";
  import ConfirmDialog from "$lib/components/editor/ConfirmDialog.svelte";
  import { getThemeById } from "$lib/config/themes";
  import { getGoogleFontsUrl } from "$lib/config/fonts";
  import {
    exportToPNG,
    createHTMLExport,
    downloadFile,
  } from "$lib/utils/exportUtils";
  import { publishToIPFS } from "$lib/utils/ipfs";
  import { authStore, type User } from "$lib/stores/auth";
  import { papersStore } from "$lib/stores/papers";

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItHighlightJs, { hljs });

  const DEFAULT_CONTENT = `# Hello

This will become paper.

## Features
- Write in **Markdown**
- See live preview
- Export as PNG, HTML, or MD

\`\`\`javascript
console.log("Beautiful code");
\`\`\`

> A simple quote to make things interesting.
`;

  const STORAGE_KEY = "paper-editor-state";

  interface EditorState {
    markdown: string;
    theme: string;
    font: string;
    watermark: boolean;
    paperId: string | null;
    paperTitle: string;
  }

  let markdown = $state(DEFAULT_CONTENT);
  let previewTheme = $state("paper");
  let previewFont = $state("serif");
  let includeWatermark = $state(true);
  let isLoaded = $state(false);
  let user = $state<User | null>(null);
  let currentPaperId = $state<string | null>(null);
  let currentPaperTitle = $state<string>("");

  let showPublishModal = $state(false);
  let showAlert = $state(false);
  let alertMessage = $state("");
  let alertType = $state<"info" | "error" | "warning" | "success">("info");
  let alertActionText = $state<string | undefined>(undefined);
  let alertActionUrl = $state<string | undefined>(undefined);
  let showConfirmDialog = $state(false);
  let confirmAction: (() => void) | null = null;
  let textarea = $state<HTMLTextAreaElement>();
  let showRestoreDialog = $state(false);
  let restorableState: EditorState | null = null;

  let previewHtml = $state(md.render(markdown));

  $effect(() => {
    previewHtml = md.render(markdown);
  });

  onMount(() => {
    authStore.init();

    const unsubscribeAuth = authStore.subscribe((state) => {
      user = state.user;
    });

    const unsubscribePapers = papersStore.subscribe((state) => {
      if (state.currentPaper && state.currentPaper.$id !== currentPaperId) {
        markdown = state.currentPaper.content;
        previewTheme = state.currentPaper.theme;
        previewFont = state.currentPaper.font;
        includeWatermark = state.currentPaper.watermark;
        currentPaperId = state.currentPaper.$id;
        currentPaperTitle = state.currentPaper.title;

        if (browser) {
          const editorState: EditorState = {
            markdown: state.currentPaper.content,
            theme: state.currentPaper.theme,
            font: state.currentPaper.font,
            watermark: state.currentPaper.watermark,
            paperId: state.currentPaper.$id,
            paperTitle: state.currentPaper.title,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(editorState));
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePapers();
    };
  });

  $effect(() => {
    if (browser && !isLoaded) {
      const storedState = localStorage.getItem(STORAGE_KEY);

      if (storedState) {
        try {
          const state: EditorState = JSON.parse(storedState);

          if (state.paperId) {
            markdown = state.markdown;
            previewTheme = state.theme;
            previewFont = state.font;
            includeWatermark = state.watermark;
            currentPaperId = state.paperId;
            currentPaperTitle = state.paperTitle;
          } else if (
            !user &&
            state.markdown !== DEFAULT_CONTENT &&
            state.markdown.trim() !== ""
          ) {
            restorableState = state;
            showRestoreDialog = true;
          } else {
            markdown = state.markdown;
            previewTheme = state.theme;
            previewFont = state.font;
            includeWatermark = state.watermark;
            currentPaperId = state.paperId;
            currentPaperTitle = state.paperTitle;
          }
        } catch (e) {
          console.error("Failed to parse stored state:", e);
        }
      }

      isLoaded = true;
    }
  });

  $effect(() => {
    if (browser && isLoaded) {
      const editorState: EditorState = {
        markdown,
        theme: previewTheme,
        font: previewFont,
        watermark: includeWatermark,
        paperId: currentPaperId,
        paperTitle: currentPaperTitle,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editorState));
    }
  });

  function insertMarkdown(before: string, after = "") {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const replacement = before + selected + after;

    markdown =
      markdown.substring(0, start) + replacement + markdown.substring(end);

    if (browser && textarea) {
      setTimeout(() => {
        textarea!.focus();
        textarea!.setSelectionRange(
          start + before.length,
          start + before.length + selected.length,
        );
      }, 0);
    }
  }

  function restorePreviousSession() {
    if (restorableState) {
      markdown = restorableState.markdown;
      previewTheme = restorableState.theme;
      previewFont = restorableState.font;
      includeWatermark = restorableState.watermark;
      currentPaperId = restorableState.paperId;
      currentPaperTitle = restorableState.paperTitle;
      restorableState = null;
    }
    showRestoreDialog = false;
  }

  function discardPreviousSession() {
    restorableState = null;
    showRestoreDialog = false;
  }

  function showAlertDialog(
    message: string,
    type: "info" | "error" | "warning" | "success" = "info",
    actionText?: string,
    actionUrl?: string,
  ) {
    alertMessage = message;
    alertType = type;
    alertActionText = actionText;
    alertActionUrl = actionUrl;
    showAlert = true;
  }

  function showConfirm(message: string, onConfirm: () => void) {
    confirmAction = onConfirm;
    showConfirmDialog = true;
  }

  function clearEditor() {
    showConfirm("Are you sure you want to clear all content?", () => {
      markdown = "";
      currentPaperId = null;
      currentPaperTitle = "";

      if (browser) {
        const editorState: EditorState = {
          markdown: "",
          theme: previewTheme,
          font: previewFont,
          watermark: includeWatermark,
          paperId: null,
          paperTitle: "",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(editorState));
      }
    });
  }

  async function handleExportPNG() {
    if (!browser) return;
    const theme = getThemeById(previewTheme);
    try {
      await exportToPNG("preview-card", theme?.backgroundColor || "#ffffff");
      showAlertDialog("Image exported successfully!", "success");
    } catch (err) {
      showAlertDialog(
        "Export failed: The content is too large. Try reducing the content or exporting to HTML instead.",
        "error",
      );
    }
  }

  function handleExportHTML() {
    const theme = getThemeById(previewTheme);
    if (!theme) return;
    const html = createHTMLExport(
      previewHtml,
      previewFont,
      theme,
      includeWatermark,
    );
    downloadFile(html, "text/html", "paper.html");
    showAlertDialog("HTML exported successfully!", "success");
  }

  function handleExportMarkdown() {
    downloadFile(markdown, "text/markdown", "paper.md");
    showAlertDialog("Markdown exported successfully!", "success");
  }

  function handleLogin() {
    authStore.loginWithGoogle();
  }

  function handleNewPaper() {
    if (currentPaperId) {
      showConfirm(
        "Start a new paper? Any unsaved changes will be lost.",
        () => {
          markdown = DEFAULT_CONTENT;
          currentPaperId = null;
          currentPaperTitle = "";
          papersStore.clearCurrentPaper();

          if (browser) {
            const editorState: EditorState = {
              markdown: DEFAULT_CONTENT,
              theme: previewTheme,
              font: previewFont,
              watermark: includeWatermark,
              paperId: null,
              paperTitle: "",
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(editorState));
          }
        },
      );
    } else {
      markdown = DEFAULT_CONTENT;
      currentPaperTitle = "";
    }
  }

  function handleProfileClick() {
    goto("/profile");
  }

  async function handleSaveDraft(title: string) {
    if (!user) return;

    try {
      if (currentPaperId) {
        await papersStore.updatePaper(currentPaperId, {
          title,
          content: markdown,
          htmlContent: previewHtml,
          theme: previewTheme,
          font: previewFont,
          watermark: includeWatermark,
          status: "draft",
          userId: user.$id,
        });
        showAlertDialog("Draft updated successfully!", "success");
      } else {
        const paper = await papersStore.createPaper({
          title,
          content: markdown,
          htmlContent: previewHtml,
          theme: previewTheme,
          font: previewFont,
          watermark: includeWatermark,
          status: "draft",
          userId: user.$id,
        });
        currentPaperId = paper.$id;
        currentPaperTitle = title;
        showAlertDialog("Draft saved successfully!", "success");
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to save draft");
    }
  }

  async function handlePublishPaper(title: string) {
    if (!user) return;

    try {
      const theme = getThemeById(previewTheme);
      if (!theme) throw new Error("Invalid theme");

      const html = createHTMLExport(
        previewHtml,
        previewFont,
        theme,
        includeWatermark,
      );

      const { cid, gateway, paperId } = await publishToIPFS(
        html,
        title,
        user.$id,
        {
          content: markdown,
          theme: previewTheme,
          font: previewFont,
          watermark: includeWatermark,
          ...(currentPaperId && { paperId: currentPaperId }),
        },
      );

      currentPaperId = paperId;
      showAlertDialog(
        "Paper published to IPFS successfully!",
        "success",
        "Visit Published Paper",
        `https://${gateway}`,
      );
    } catch (error: any) {
      throw new Error(error.message || "Failed to publish");
    }
  }
</script>

<svelte:head>
  <title>Editor - tsbin paper</title>
  {#if getGoogleFontsUrl()}
    <link rel="stylesheet" href={getGoogleFontsUrl()} />
  {/if}
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
  />
</svelte:head>

<div class="flex flex-col h-screen">
  <EditorHeader
    {previewFont}
    {previewTheme}
    {includeWatermark}
    {user}
    onFontChange={(font) => {
      previewFont = font;
    }}
    onThemeChange={(theme) => {
      previewTheme = theme;
    }}
    onWatermarkToggle={(value) => {
      includeWatermark = value;
    }}
    onExportPNG={handleExportPNG}
    onExportHTML={handleExportHTML}
    onExportMarkdown={handleExportMarkdown}
    onPublish={() => (showPublishModal = true)}
    onNewPaper={handleNewPaper}
    onProfileClick={handleProfileClick}
    onLogin={handleLogin}
  />

  <main class="flex-1 flex flex-col lg:flex-row overflow-hidden">
    <EditorPanel
      bind:markdown
      bind:textarea
      onInsert={insertMarkdown}
      onClear={clearEditor}
    />

    <PreviewPanel
      {previewHtml}
      {previewTheme}
      {previewFont}
      {includeWatermark}
    />
  </main>

  <PublishModal
    show={showPublishModal}
    {user}
    currentTitle={currentPaperTitle}
    onClose={() => (showPublishModal = false)}
    onSaveDraft={handleSaveDraft}
    onPublish={handlePublishPaper}
  />

  <Alert
    actionText={alertActionText}
    actionUrl={alertActionUrl}
    bind:show={showAlert}
    message={alertMessage}
    type={alertType}
    onClose={() => {}}
  />

  <ConfirmDialog
    bind:show={showConfirmDialog}
    title="Confirm Action"
    message="Are you sure you want to clear all content?"
    confirmText="Clear"
    cancelText="Cancel"
    onConfirm={() => {
      if (confirmAction) {
        confirmAction();
        confirmAction = null;
      }
    }}
    onCancel={() => {
      confirmAction = null;
    }}
  />

  <ConfirmDialog
    bind:show={showRestoreDialog}
    title="Restore Previous Session"
    message="You have unsaved content from your previous session. Would you like to restore it?"
    confirmText="Restore"
    cancelText="Start Fresh"
    onConfirm={restorePreviousSession}
    onCancel={discardPreviousSession}
  />
</div>

<Footer />
