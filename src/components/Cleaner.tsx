"use client";

import gsap from "gsap";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { inspect, type Report } from "@/lib/metadata";
import { cleanImage, DEFAULT_OPTIONS, type CleanOptions, type CleanResult } from "@/lib/clean";
import { createZip } from "@/lib/zip";
import { MAX_BATCH, MAX_FILE_MB } from "@/lib/site";

type Status = "queued" | "working" | "done" | "error";

type Item = {
  id: string;
  name: string;
  size: number;
  status: Status;
  report?: Report;
  result?: CleanResult;
  url?: string;
  error?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function cleanName(name: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, "").slice(0, 60);
  return `${base}-clean.${extension}`;
}

export function Cleaner() {
  const [items, setItems] = useState<Item[]>([]);
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_OPTIONS);
  const [showOptions, setShowOptions] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [optionsMounted, setOptionsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  const formId = useId();

  // GSAP drives the options panel so it grows and collapses from its real
  // height instead of popping in and vanishing on unmount. Mounting happens on
  // the click; unmounting waits for the collapse tween to finish.
  const toggleOptions = useCallback(() => {
    setShowOptions((open) => {
      if (!open) setOptionsMounted(true);
      return !open;
    });
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tween = showOptions
      ? gsap.fromTo(
          panel,
          { height: 0, opacity: 0, y: -6 },
          {
            height: "auto",
            opacity: 1,
            y: 0,
            duration: reduced ? 0 : 0.42,
            ease: "power3.out",
            onComplete: () => gsap.set(panel, { clearProps: "height" }),
          },
        )
      : gsap.to(panel, {
          height: 0,
          opacity: 0,
          y: -6,
          duration: reduced ? 0 : 0.3,
          ease: "power2.inOut",
          onComplete: () => setOptionsMounted(false),
        });

    return () => {
      tween.kill();
    };
  }, [showOptions, optionsMounted]);

  // A batch reads the options once per file, so the ref has to track the latest
  // value without re-creating the processing callback mid-run.
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const process = useCallback(async (files: File[]) => {
    setNotice(null);
    const images = files.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name));
    if (!images.length) {
      setNotice("Those files are not images. Use JPG, PNG, WebP, AVIF or HEIC.");
      return;
    }
    if (images.some((file) => /\.gif$/i.test(file.name))) {
      setNotice("Animated GIF is not supported — only the first frame would survive re-encoding.");
    }

    const accepted = images.slice(0, MAX_BATCH);
    if (images.length > MAX_BATCH) setNotice(`Only the first ${MAX_BATCH} images were added.`);

    const queued: Item[] = accepted.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      size: file.size,
      status: "queued",
    }));
    setItems((prev) => [...queued, ...prev]);

    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i];
      const id = queued[i].id;
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        update({ status: "error", error: `Larger than ${MAX_FILE_MB}MB.` });
        continue;
      }

      update({ status: "working" });
      try {
        const report = inspect(await file.arrayBuffer());
        const result = await cleanImage(file, optionsRef.current);
        update({ status: "done", report, result, url: URL.createObjectURL(result.blob) });
      } catch (error) {
        update({ status: "error", error: error instanceof Error ? error.message : "Could not process this file." });
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

  const reset = useCallback(() => {
    items.forEach((item) => item.url && URL.revokeObjectURL(item.url));
    setItems([]);
    setNotice(null);
  }, [items]);

  return (
    <div className="w-full">
      {/* Full-page drop veil, so a file can land anywhere on the site. */}
      {dragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-[2px]">
          <div className="rounded-[16px] border-2 border-dashed border-[var(--accent)] px-10 py-8 text-center">
            <p className="text-[17px] font-semibold text-[var(--accent)]">Drop to clean</p>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Release anywhere on the page</p>
          </div>
        </div>
      )}

      <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.01em]">Clean your image</h1>

      <div
        role="button"
        tabIndex={0}
        aria-label="Drop images here or press Enter to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[25px] border border-[var(--border)] bg-[var(--surface)] px-4 py-14 text-center transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_35%,transparent)]"
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
        <p className="mt-3.5 text-[15px] font-medium">Drop images here</p>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">JPG · PNG · WebP · AVIF · HEIC</p>
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
        className="mt-3.5 w-full cursor-pointer rounded-[35px] bg-[var(--accent)] px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Select images
      </button>

      <button
        type="button"
        aria-expanded={showOptions}
        aria-controls={formId}
        onClick={toggleOptions}
        className="mt-4 w-full cursor-pointer text-center text-[13px] font-semibold text-[var(--link)] hover:opacity-70"
      >
        {showOptions ? "Hide options" : "Options"}
      </button>

      {optionsMounted && (
        <div ref={panelRef} className="overflow-hidden">
          <div id={formId} className="mt-4 space-y-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px]">
          <label className="flex items-center justify-between gap-3">
            <span className="text-[var(--muted)]">Output format</span>
            <select
              value={options.output}
              onChange={(event) => setOptions({ ...options, output: event.target.value as CleanOptions["output"] })}
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[13px]"
            >
              <option value="auto">Auto (match source)</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG (lossless)</option>
              <option value="webp">WebP</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-[var(--muted)]">Quality — {Math.round(options.quality * 100)}%</span>
            <input
              type="range"
              min={60}
              max={100}
              value={Math.round(options.quality * 100)}
              onChange={(event) => setOptions({ ...options, quality: Number(event.target.value) / 100 })}
              className="w-32 accent-[var(--accent)]"
            />
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={options.resetFingerprint}
              onChange={(event) => setOptions({ ...options, resetFingerprint: event.target.checked })}
              className="mt-[3px] accent-[var(--accent)]"
            />
            <span>
              Reset perceptual fingerprint
              <span className="block text-[12px] text-[var(--muted)]">
                Invisible ±1 RGB shift so the file no longer matches earlier copies.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={options.injectCameraExif}
              onChange={(event) => setOptions({ ...options, injectCameraExif: event.target.checked })}
              className="mt-[3px] accent-[var(--accent)]"
            />
            <span>
              Add placeholder camera EXIF
              <span className="block text-[12px] text-[var(--muted)]">
                Writes a plain camera block after cleaning. JPEG output only.
              </span>
            </span>
          </label>
          </div>
        </div>
      )}

      {notice && <p className="mt-4 text-center text-[12px] text-[var(--danger)]">{notice}</p>}

      {items.length > 0 && (
        <div className="animate-fade-up mt-5 rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <p className="text-[13px] font-semibold">
              {done.length} of {items.length} cleaned
            </p>
            <button type="button" onClick={reset} className="text-[13px] font-semibold text-[var(--muted)] hover:opacity-70">
              Clear
            </button>
          </div>

          <ul className="max-h-[420px] overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 border-b border-[var(--border)] p-4 last:border-b-0">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]">
                  {item.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{item.name}</p>

                  {item.status === "working" && <p className="mt-1 text-[12px] text-[var(--muted)]">Cleaning…</p>}
                  {item.status === "queued" && <p className="mt-1 text-[12px] text-[var(--muted)]">Queued</p>}
                  {item.status === "error" && <p className="mt-1 text-[12px] text-[var(--danger)]">{item.error}</p>}

                  {item.status === "done" && item.report && item.result && (
                    <>
                      <p className="mt-1 text-[12px] text-[var(--muted)]">
                        {item.report.format} {formatBytes(item.size)} to {item.result.extension.toUpperCase()}{" "}
                        {formatBytes(item.result.blob.size)} · {item.result.width}×{item.result.height}
                      </p>

                      {item.report.findings.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {item.report.findings.map((finding) => (
                            <li
                              key={finding.kind + finding.detail}
                              title={finding.detail}
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium line-through ${
                                finding.aiRelated
                                  ? "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]"
                                  : "bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] text-[var(--muted)]"
                              }`}
                            >
                              {finding.kind}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-[12px] text-[var(--muted)]">
                          No embedded metadata found — the file was re-encoded anyway.
                        </p>
                      )}

                      {item.report.generators.length > 0 && (
                        <p className="mt-2 text-[11px] text-[var(--muted)]">
                          Signature detected: {item.report.generators.join(", ")}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {item.status === "done" && item.url && item.result && (
                  <a
                    href={item.url}
                    download={cleanName(item.name, item.result.extension)}
                    className="h-fit shrink-0 cursor-pointer rounded-[35px] bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                  >
                    Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {done.length > 1 && (
        <button
          type="button"
          onClick={downloadAll}
          className="mt-3 w-full cursor-pointer rounded-[35px] border border-[var(--accent)] px-4 py-3.5 text-[14px] font-semibold text-[var(--accent)] transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
        >
          Download all ({done.length}) as .zip
        </button>
      )}

      <p className="mt-7 text-center text-[12px] text-[var(--muted)]">
        Nothing is uploaded, cleaning happens in your browser.{" "}
        <Link href="/how-it-works" className="underline hover:opacity-70">
          How it works
        </Link>
      </p>
    </div>
  );
}
