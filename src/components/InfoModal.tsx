"use client";

import { GlassButton, GlassSheet } from "@zakisheriff/liquid-glass";

type ModalType = "disclaimer" | "privacy" | null;

export function InfoModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  return (
    <GlassSheet
      open={type !== null}
      onClose={onClose}
      aria-label={type === "privacy" ? "Privacy Policy" : "Disclaimer"}
    >
      {/* The sheet sizes itself to its content, so the scroller is capped here
          to keep a long policy inside the viewport instead of past its edge. */}
      <div className="custom-scrollbar max-h-[65svh] overflow-y-auto overscroll-contain px-6 pb-6 pt-1 sm:px-8">

        {type === "disclaimer" && (
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.01em]">Disclaimer</h2>
            <p className="mt-2 text-[14px] text-[var(--muted)]">
              This is a metadata and privacy tool for files you own. Here is precisely where its limits are.
            </p>
            <div className="mt-6 space-y-4 text-[14.5px] leading-[24px]">
              <div>
                <h3 className="font-semibold text-[15px]">What it does</h3>
                <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[var(--muted)]">
                  <li>Removes C2PA content credentials, XMP packets, EXIF and GPS data, IPTC fields, PNG text chunks and JPEG comments.</li>
                  <li>Runs entirely inside your browser, with no upload and no storage.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">What it cannot do</h3>
                <ul className="mt-1.5 list-disc pl-5 space-y-1 text-[var(--muted)]">
                  <li>It cannot remove an invisible watermark encoded into the pixels — Google&rsquo;s SynthID is the common example. That is not metadata, and no metadata cleaner removes it.</li>
                  <li>It cannot change how a visual AI classifier reads your picture. Detectors that analyse the image itself may still identify it as AI-generated.</li>
                  <li>It cannot guarantee any particular outcome on Instagram, Facebook, TikTok, Pinterest or anywhere else. Those systems change without notice.</li>
                  <li>It cannot remove a label from a post that has already been published.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Use it honestly</h3>
                <p className="mt-1 text-[var(--muted)]">
                  This tool exists for upload preparation, false-positive fixes and privacy — stripping GPS coordinates, device identifiers and stray edit history from files you own. It is not a way to pass synthetic media off as real. Where platform terms, client agreements, or regulations require disclosure of AI involvement, that obligation stands.
                </p>
              </div>
            </div>
          </div>
        )}

        {type === "privacy" && (
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.01em]">Privacy Policy</h2>
            <p className="mt-2 text-[14px] text-[var(--muted)]">
              Short version: your images never leave your device, because there is nowhere for them to go.
            </p>
            <div className="mt-6 space-y-4 text-[14.5px] leading-[24px]">
              <div>
                <h3 className="font-semibold text-[15px]">Images</h3>
                <p className="mt-1 text-[var(--muted)]">
                  Every image you drop into this site is read into your browser tab, cleaned locally and offered back as a download. Default JPG, PNG and WebP cleaning does not recompress the image. No image data is transmitted to our servers or any third party, no copy is stored, and closing the tab discards everything.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Accounts</h3>
                <p className="mt-1 text-[var(--muted)]">
                  There are none. No sign-up, no email address, no password, no payment details.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Analytics and cookies</h3>
                <p className="mt-1 text-[var(--muted)]">
                  This site uses Vercel Web Analytics to measure aggregate page visits and navigation. It does not use cookies, advertising or fingerprinting scripts, and it never receives information about the files you process.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">Hosting logs</h3>
                <p className="mt-1 text-[var(--muted)]">
                  Like any website, the host serving these pages records standard request logs — IP address, timestamp, requested path and user agent — for security and abuse prevention.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end px-6 pb-6 sm:px-8">
        <GlassButton type="button" variant="clear" size="sm" onClick={onClose}>
          Close
        </GlassButton>
      </div>
    </GlassSheet>
  );
}
