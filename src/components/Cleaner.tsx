"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { inspect, type Report } from "@/lib/metadata";
import { cleanImage, upscaleImageBlob, DEFAULT_OPTIONS, type CleanResult } from "@/lib/clean";
import { createZip } from "@/lib/zip";
import { MAX_BATCH, MAX_FILE_MB } from "@/lib/site";
import { cleanVideo, createVideoThumbnail, MAX_VIDEO_FILE_MB, type VideoCleanResult } from "@/lib/video";

type Status = "queued" | "working" | "done" | "error";

type Item = {
  id: string;
  kind: "image" | "video";
  name: string;
  size: number;
  status: Status;
  progress?: number;
  thumbnail?: string;
  report?: Report;
  cleanedReport?: Report;
  result?: CleanResult | VideoCleanResult;
  url?: string;
  error?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,video/mp4,video/quicktime,video/webm,video/x-m4v";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function cleanName(name: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, "").slice(0, 60);
  return `${base}-clean.${extension}`;
}

function aiMarkers(report: Report) {
  return [...new Set([...report.findings.filter((finding) => finding.aiRelated).map((finding) => finding.kind), ...report.generators])];
}

function removedMetadata(report: Report) {
  return [...new Set(report.findings.filter((finding) => finding.kind !== "ICC profile").map((finding) => finding.kind))];
}

function InspectionMessage({ source, cleaned, kind }: { source: Report; cleaned: Report; kind: Item["kind"] }) {
  const sourceAi = aiMarkers(source);
  const remainingAi = aiMarkers(cleaned);
  if (sourceAi.length > 0 && remainingAi.length === 0) {
    return (
      <p className="mt-2 text-[12px] leading-[18px] text-[var(--foreground)]">
        <strong>AI metadata found and removed:</strong> {sourceAi.join(" · ")}.
      </p>
    );
  }
  if (remainingAi.length > 0) {
    return (
      <p className="mt-2 text-[12px] leading-[18px] text-[var(--danger)]">
        <strong>AI marker remains in the encoded media:</strong> {remainingAi.join(" · ")}. It was not recompressed, so quality stays unchanged.
      </p>
    );
  }
  const removed = removedMetadata(source);
  return (
    <p className="mt-2 text-[12px] leading-[18px] text-[var(--muted)]">
      <strong className="text-[var(--foreground)]">No AI metadata marker detected.</strong>{" "}
      {kind === "video"
        ? "Standard container metadata was cleaned. This does not determine whether the video itself was AI-generated."
        : `${removed.length > 0 ? `Removed other metadata: ${removed.join(" · ")}. ` : "No removable metadata was present. "}Original image quality was preserved.`}
    </p>
  );
}

export function Cleaner() {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [upscalingIds, setUpscalingIds] = useState<Record<string, boolean>>({});
  const [upscalingAll, setUpscalingAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpscale = useCallback(async (item: Item) => {
    if (item.kind !== "image" || !item.result || !item.url) return;
    setUpscalingIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      const mime = item.result.mime;
      const quality = DEFAULT_OPTIONS.quality;
      const res = await upscaleImageBlob(item.result.blob, mime, quality);
      
      const url = URL.createObjectURL(res.blob);
      const link = document.createElement("a");
      link.href = url;
      
      const ext = item.result.extension;
      const originalBase = item.name.replace(/\.[^.]+$/, "");
      link.download = `${originalBase}-clean-2x.${ext}`;
      
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 15_000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upscaling failed.");
    } finally {
      setUpscalingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  }, []);

  const process = useCallback(async (files: File[]) => {
    setNotice(null);
    const media = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        /\.(jpe?g|png|webp|avif|heic|heif|mp4|mov|m4v|webm)$/i.test(file.name),
    );
    if (!media.length) {
      setNotice("Those files are not supported. Use JPG, PNG, WebP, AVIF, HEIC, MP4, MOV or WebM.");
      return;
    }
    if (media.some((file) => /\.gif$/i.test(file.name))) {
      setNotice("Animated GIF is not supported — only the first frame would survive re-encoding.");
    }

    const accepted = media.slice(0, MAX_BATCH);
    if (media.length > MAX_BATCH) setNotice(`Only the first ${MAX_BATCH} files were added.`);

    const queued: Item[] = accepted.map((file, index) => {
      const kind = file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm)$/i.test(file.name) ? "video" : "image";
      return {
        id: `${Date.now()}-${index}-${file.name}`,
        kind,
        name: file.name,
        size: file.size,
        status: "queued",
      };
    });
    setItems((prev) => [...queued, ...prev]);

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i];
      const id = queued[i].id;
      const kind = queued[i].kind;
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

      const limit = kind === "video" ? MAX_VIDEO_FILE_MB : MAX_FILE_MB;
      if (file.size > limit * 1024 * 1024) {
        update({ status: "error", error: `Larger than ${limit}MB.` });
        continue;
      }

      update({ status: "working" });
      try {
        if (kind === "video") {
          const report = inspect(await file.arrayBuffer());
          update({ report });
          const result = await cleanVideo(file, (progress) => update({ progress }));
          const cleanedReport = inspect(await result.blob.arrayBuffer());
          const [url, thumbnail] = [URL.createObjectURL(result.blob), result.thumbnail ?? (await createVideoThumbnail(result.blob))];
          update({ status: "done", progress: 1, report, cleanedReport, result, url, thumbnail });
        } else {
          const report = inspect(await file.arrayBuffer());
          const result = await cleanImage(file, DEFAULT_OPTIONS);
          const cleanedReport = inspect(await result.blob.arrayBuffer());
          update({ status: "done", report, cleanedReport, result, url: URL.createObjectURL(result.blob) });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        update({ status: "error", error: message && message !== "[object Object]" ? message : "Could not process this file." });
      }
      // Yield between files so the browser can paint progress on a large batch.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      void process(Array.from(event.dataTransfer.files));
    },
    [process],
  );

  // Dropping anywhere on the page works — the zone is a target, not a boundary.
  useEffect(() => {
    let depth = 0;
    const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files") ?? false;

    const onEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth += 1;
      setDragging(true);
    };
    const onOver = (event: DragEvent) => {
      if (carriesFiles(event)) event.preventDefault();
    };
    const onLeave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const onWindowDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setDragging(false);
      void process(Array.from(event.dataTransfer?.files ?? []));
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onWindowDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onWindowDrop);
    };
  }, [process]);

  const done = useMemo(() => items.filter((item) => item.status === "done" && item.result), [items]);
  const doneImages = useMemo(() => done.filter((item) => item.kind === "image"), [done]);

  const downloadAll = useCallback(async () => {
    const entries = await Promise.all(
      done.map(async (item) => ({
        name: cleanName(item.name, item.result!.extension),
        data: new Uint8Array(await item.result!.blob.arrayBuffer()),
      })),
    );
    const url = URL.createObjectURL(createZip(entries));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-label-remover-clean.zip";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }, [done]);

  const downloadAllUpscaled = useCallback(async () => {
    setUpscalingAll(true);
    try {
      const quality = DEFAULT_OPTIONS.quality;
      const entries = await Promise.all(
        doneImages.map(async (item) => {
          const res = await upscaleImageBlob(item.result!.blob, item.result!.mime, quality);
          const ext = item.result!.extension;
          const originalBase = item.name.replace(/\.[^.]+$/, "");
          const name = `${originalBase}-clean-2x.${ext}`;
          const data = new Uint8Array(await res.blob.arrayBuffer());
          return { name, data };
        })
      );
      const url = URL.createObjectURL(createZip(entries));
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-label-remover-clean-upscaled.zip";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upscaling all failed.");
    } finally {
      setUpscalingAll(false);
    }
  }, [doneImages]);
      const reset = useCallback(() => {
        items.forEach((item) => item.url && URL.revokeObjectURL(item.url));
        setItems([]);
        setNotice(null);
      }, [items]);

      const renderUploadZone = () => {
        return (
          <div className="relative w-full">
            {notice && (
              <div className="mt-4 rounded-[24px] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-[13px] leading-[19px] text-[var(--danger)]">
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{notice}</p>
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              aria-label="Select images or videos, or press Enter to browse"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
              className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-4 py-14 text-center transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_35%,transparent)]"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-[var(--muted)]">
                <path
                  d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-3.5 text-[15px] font-medium hidden sm:block">Select or drop images and videos</p>
              <p className="mt-3.5 text-[15px] font-medium sm:hidden">Select images or videos</p>
              <p className="mt-1 text-[12.5px] text-[var(--muted)]">Images · MP4 · MOV · WebM</p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(event) => {
                void process(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3.5 hidden sm:block w-full cursor-pointer rounded-[35px] bg-[var(--accent)] px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Select images or videos
            </button>

          </div>
        );
      };

      const renderResultsList = () => {
        return (
          <div className="w-full">
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] p-4 font-semibold text-[14px]">
                <span>
                  {done.length} of {items.length} cleaned
                </span>
                <button
                  onClick={reset}
                  className="text-[var(--link)] hover:opacity-70 cursor-pointer font-semibold text-[13px]"
                >
                  Clear
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-scroll custom-scrollbar">
                <ul className="divide-y divide-[var(--border)]">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 p-4 items-start">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
                        {item.kind === "video" && item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : item.kind === "image" && item.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--surface)] text-[var(--muted)]">
                            {item.kind === "video" && (
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
                                <rect x="3" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <path d="m17 10 4-2v8l-4-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <p className="truncate text-[13.5px] font-semibold text-[var(--foreground)]" title={item.name}>
                          {item.name}
                        </p>

                        {item.status === "queued" && (
                          <p className="mt-1 text-[12px] text-[var(--muted)]">Queued...</p>
                        )}
                        {item.status === "working" && (
                          <p className="mt-1 text-[12px] text-[var(--muted)]">
                            {item.kind === "video"
                              ? `Cleaning video locally${item.progress ? ` — ${Math.round(item.progress * 100)}%` : "…"}`
                              : "Cleaning..."}
                          </p>
                        )}
                        {item.status === "error" && (
                          <p className="mt-1 text-[12px] text-[var(--danger)] font-medium">
                            {item.error || "Failed"}
                          </p>
                        )}

                        {item.status === "done" && item.kind === "image" && item.report && item.cleanedReport && item.result && (
                          <>
                            <p className="mt-1 text-[12px] text-[var(--muted)]">
                              {item.report.format} {formatBytes(item.size)} to {item.result.extension.toUpperCase()}{" "}
                              {formatBytes(item.result.blob.size)} · {item.result.width}×{item.result.height}
                            </p>

                            <InspectionMessage source={item.report} cleaned={item.cleanedReport} kind="image" />
                          </>
                        )}
                        {item.status === "done" && item.kind === "video" && item.report && item.cleanedReport && item.result && (
                          <>
                            <p className="mt-1 text-[12px] text-[var(--muted)]">
                              Lossless {item.result.extension.toUpperCase()} · original quality preserved
                              {item.result.width > 0 ? ` · ${item.result.width}×${item.result.height}` : ""}
                              {"duration" in item.result && item.result.duration > 0
                                ? ` · ${Math.ceil(item.result.duration)}s`
                                : ""}
                            </p>
                            <InspectionMessage source={item.report} cleaned={item.cleanedReport} kind="video" />
                          </>
                        )}
                      </div>

                      {item.status === "done" && item.url && item.result && (
                        <div className="flex flex-col gap-1.5 items-stretch shrink-0 min-w-[90px]">
                          <a
                            href={item.url}
                            download={cleanName(item.name, item.result.extension)}
                            className="cursor-pointer rounded-[35px] bg-[var(--accent)] px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] text-center"
                          >
                            Download
                          </a>
                          {item.kind === "image" && (
                            <button
                              type="button"
                              onClick={() => handleUpscale(item)}
                              disabled={upscalingIds[item.id]}
                              className="cursor-pointer rounded-[35px] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed text-center"
                            >
                              {upscalingIds[item.id] ? "Upscaling..." : "Upscale 2x"}
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {done.length > 1 && (
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={downloadAll}
                  className="w-full cursor-pointer rounded-[35px] bg-[var(--accent)] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Download all ({done.length}) as .zip
                </button>
                {doneImages.length > 1 && (
                  <button
                    type="button"
                    onClick={downloadAllUpscaled}
                    disabled={upscalingAll}
                    className="w-full cursor-pointer rounded-[35px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[14px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {upscalingAll ? "Upscaling all..." : `Download all images upscaled (${doneImages.length}) as .zip`}
                  </button>
                )}
              </div>
            )}

            <p className="mt-7 hidden text-center text-[11px] whitespace-nowrap text-[var(--muted)] lg:block">
              Nothing is uploaded, cleaned in-browser.{" "}
              <Link href="/how-it-works" className="underline hover:opacity-70">
                How it works
              </Link>{" "}
              ·{" "}
              <Link href="/blog" className="underline hover:opacity-70">
                Guides
              </Link>
            </p>
          </div>
        );
      };

      const hasMedia = items.length > 0;

      return (
        <div className={`flex flex-col w-full ${hasMedia ? "pb-8 lg:min-h-[100svh] lg:pb-0" : "min-h-[100svh]"}`}>
          {/* Header Row: Contains Logo & Github Button */}
          <header className="relative flex w-full flex-col items-center gap-4 px-6 pt-8 lg:flex-row lg:justify-between lg:px-14 lg:pt-10 lg:pb-2">
            <Link href="/">
              <Image
                src="/website-logo.webp"
                alt="AI Label Remover"
                width={800}
                height={490}
                priority
                style={{ height: "56px", width: "auto" }}
                className="dark:invert"
              />
            </Link>
            <a
              href="https://github.com/zakisheriff/AI-Label-Remover"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-6 top-8 lg:static flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] sm:text-[13px] sm:px-4 sm:py-2"
            >
              <span>Star on GitHub</span>
            </a>
          </header>

          <section className={`relative flex flex-col lg:flex-1 lg:flex-row lg:items-center lg:pb-20 ${hasMedia ? "" : "flex-1"}`}>
            {/* Full-page drop veil, so a file can land anywhere on the site. */}
            {dragging && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-[2px]">
                <div className="rounded-[24px] border-2 border-dashed border-[var(--accent)] px-10 py-8 text-center">
                  <p className="text-[17px] font-semibold text-[var(--accent)]">Drop to clean</p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">Release anywhere on the page</p>
                </div>
              </div>
            )}

          {/* LEFT COLUMN */}
          <div className={`flex flex-col px-6 pb-10 pt-4 lg:order-1 lg:flex-1 lg:px-14 lg:pt-0 ${hasMedia ? "order-2" : "order-3 flex-1"}`}>
            <div className={`mx-auto flex w-full max-w-[620px] flex-col ${hasMedia ? "lg:flex-1 lg:justify-center" : "flex-1 justify-center"}`}>
              {!hasMedia ? (
                // State A: Empty State
                <>
                  <h1 className="mt-8 text-balance text-center text-[34px] font-normal leading-[42px] tracking-[-0.02em] sm:text-[44px] sm:leading-[52px]">
                    Post your photos &amp; videos without the{" "}
                    <span className="whitespace-nowrap bg-[linear-gradient(90deg,#f9704f,#f0356f,#b83bff)] bg-clip-text font-medium text-transparent">
                      AI label
                    </span>
                    .
                  </h1>

                  <Image
                    src="/hero-collage-2.webp"
                    alt="Instagram posts published without an AI label"
                    width={1536}
                    height={1024}
                    priority
                    className="mt-6 h-auto w-full max-w-[520px] self-center"
                  />

                  <p className="mt-5 text-center text-[11.5px] text-[var(--muted)] lg:hidden">
                    Nothing is uploaded, cleaned in-browser.{" "}
                    <span className="whitespace-nowrap">
                      <Link href="/how-it-works" className="underline hover:opacity-70">
                        How it works
                      </Link>{" "}
                      ·{" "}
                      <Link href="/blog" className="underline hover:opacity-70">
                        Guides
                      </Link>
                    </span>
                  </p>
                </>
              ) : (
                // State B: Active State (Input Zone moves to Left side)
                <div className="w-full max-w-[400px] self-center">
                  <h2 className="text-[19px] font-normal leading-[26px] tracking-[-0.01em] sm:text-[24px] sm:leading-[30px]">
                    Clean your images and videos
                  </h2>
                  {renderUploadZone()}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={`flex w-full items-center justify-center px-6 pb-4 pt-6 lg:order-2 lg:w-[38%] lg:min-w-[420px] lg:px-10 lg:pb-12 lg:pt-0 ${hasMedia ? "order-3" : "order-2"}`}>
            <div className="w-full max-w-[400px]">
              {!hasMedia ? (
                // State A: Empty State (Upload Zone on Right side)
                <>
                  <h2 className="text-[19px] font-normal leading-[26px] tracking-[-0.01em] sm:text-[24px] sm:leading-[30px]">
                    Clean your images and videos
                  </h2>
                  {renderUploadZone()}
                </>
              ) : (
                // State B: Active State (Cleaned Results List on Right side)
                <>
                  <h2 className="mb-4 text-[19px] font-normal leading-[26px] tracking-[-0.01em] sm:text-[24px] sm:leading-[30px]">
                    Output
                  </h2>
                  {renderResultsList()}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    );
}
