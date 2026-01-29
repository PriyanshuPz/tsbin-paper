import html2canvas from "html2canvas";
import { getFontFamily } from "$lib/config/fonts";
import { getThemeStyles, type ThemeConfig } from "$lib/config/themes";

export function downloadFile(content: string, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPNG(
  elementId: string,
  backgroundColor: string,
  includeWatermark: boolean = true,
  theme?: ThemeConfig,
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const codeBlocks = element.querySelectorAll("pre");
  const originalStyles: { element: HTMLElement; overflow: string }[] = [];

  codeBlocks.forEach((pre) => {
    const htmlPre = pre as HTMLElement;
    originalStyles.push({ element: htmlPre, overflow: htmlPre.style.overflow });
    htmlPre.style.overflow = "visible";
    htmlPre.style.whiteSpace = "pre-wrap";
    htmlPre.style.wordBreak = "break-word";
  });

  // Add watermark if needed
  let watermark: HTMLElement | null = null;
  if (includeWatermark && theme) {
    const isDarkTheme = theme.backgroundColor.startsWith("#")
      ? parseInt(theme.backgroundColor.slice(1, 3), 16) < 128
      : theme.id.includes("dark") ||
        theme.id.includes("terminal") ||
        theme.id.includes("sepia") ||
        theme.id.includes("nord");
    const watermarkColor = isDarkTheme
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";

    watermark = document.createElement("div");
    watermark.style.cssText = `position: absolute; bottom: 8px; right: 12px; font-size: 10px; color: ${watermarkColor}; pointer-events: none; font-family: system-ui, -apple-system, sans-serif;`;
    watermark.innerHTML =
      'rendered by <a href="https://paper.tsbin.tech" style="color: inherit; text-decoration: none;">paper.tsbin.tech</a>';

    // Make element position relative if not already
    const originalPosition = element.style.position;
    if (!originalPosition || originalPosition === "static") {
      element.style.position = "relative";
    }
    element.appendChild(watermark);
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale: 1,
      logging: false,
      allowTaint: true,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `paper-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Export failed:", err);
    throw err;
  } finally {
    originalStyles.forEach(({ element, overflow }) => {
      element.style.overflow = overflow;
      element.style.whiteSpace = "";
      element.style.wordBreak = "";
    });

    // Remove watermark if added
    if (watermark && watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }
  }
}

export function createHTMLExport(
  content: string,
  fontId: string,
  theme: ThemeConfig,
  includeWatermark: boolean = true,
): string {
  const fontFamily = getFontFamily(fontId);
  const themeStyles = getThemeStyles(theme);

  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : "Paper Export";
  const descMatch = content.match(/<p[^>]*>([^<]+)<\/p>/);
  const description = descMatch
    ? descMatch[1].substring(0, 160)
    : "Document created with tsbin paper";

  // Determine watermark color based on theme
  const isDarkTheme = theme.backgroundColor.startsWith("#")
    ? parseInt(theme.backgroundColor.slice(1, 3), 16) < 128
    : theme.id.includes("dark") ||
      theme.id.includes("terminal") ||
      theme.id.includes("sepia") ||
      theme.id.includes("nord");
  const watermarkColor = isDarkTheme
    ? "rgba(255, 255, 255, 0.3)"
    : "rgba(0, 0, 0, 0.3)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="generator" content="paper.tsbin.tech">
	<meta name="description" content="${description.replace(/"/g, "&quot;")}">
	
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>📄</text></svg>">
	
	<meta property="og:type" content="article">
	<meta property="og:title" content="${title.replace(/"/g, "&quot;")}">
	<meta property="og:description" content="${description.replace(/"/g, "&quot;")}">
	<meta property="og:site_name" content="paper">
	
	<meta name="twitter:card" content="summary">
	<meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}">
	<meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}">
	
	<title>${title}</title>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
	<style>
		body {
			font-family: ${fontFamily};
		}
		${themeStyles}
	</style>
</head>
<body>
${content}
${includeWatermark ? `<div style="position: fixed; bottom: 8px; right: 12px; font-size: 10px; color: ${watermarkColor}; pointer-events: none; font-family: system-ui, -apple-system, sans-serif;">rendered by <a href="https://paper.tsbin.tech" style="color: inherit; text-decoration: none;">paper.tsbin.tech</a></div>` : ""}
</body>
</html>`;
}
