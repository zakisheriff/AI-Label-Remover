/**
 * Downloads or shares a blob file depending on the platform.
 *
 * On iOS and mobile browsers, the Web Share API is used so the user is presented
 * with the native iOS/Android share sheet ("Save Image", "Save Video", "Save to Photos",
 * or "Save to Files") instead of navigating away to a raw blob URL.
 *
 * On desktop browsers, it triggers a standard anchor download directly to disk.
 */

export async function downloadFile(blob: Blob, fileName: string): Promise<void> {
  if (typeof window === "undefined") return;

  const isMobileOrIOS =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (typeof navigator.maxTouchPoints === "number" &&
      navigator.maxTouchPoints > 1 &&
      /Macintosh/i.test(navigator.userAgent));

  if (isMobileOrIOS && typeof navigator.canShare === "function" && typeof File !== "undefined") {
    try {
      const file = new File([blob], fileName, {
        type: blob.type || "application/octet-stream",
      });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
        });
        return;
      }
    } catch (error) {
      // User dismissed the native share sheet
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "NotAllowedError")
      ) {
        return;
      }
      // Otherwise fall through to anchor tag fallback
    }
  }

  // Anchor download fallback
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 40_000);
}
