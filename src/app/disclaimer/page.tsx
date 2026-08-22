import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Disclaimer — What a Metadata Cleaner Can and Cannot Do",
  description:
    "AI Label Remover cleans image and video metadata from files you own. It cannot remove content-embedded watermarks or guarantee a platform outcome.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <>
      <PageShell
        title="Disclaimer"
        intro="This is a metadata and privacy tool for files you own. Here is precisely where its limits are."
      >
        <Prose>
          <h2>What it does</h2>
          <ul>
            <li>Removes C2PA content credentials, XMP packets, EXIF and GPS data, IPTC fields, PNG text chunks and JPEG comments.</li>
            <li>Losslessly copies primary video and audio streams into a clean container without source metadata, chapters, thumbnails or extra streams.</li>
            <li>Runs entirely inside your browser, with no upload and no storage.</li>
          </ul>

          <h2>What it cannot do</h2>
          <ul>
            <li>
              It cannot reliably remove an invisible watermark encoded into image pixels, video frames or audio. That is
              not container metadata, and a metadata cleaner cannot promise to remove it.
            </li>
            <li>
              It cannot change how a visual or audio classifier reads the content. Detectors that analyse the media itself
              may still identify it as AI-generated.
            </li>
            <li>
              It cannot guarantee any particular outcome on Instagram, Facebook, TikTok, Pinterest or anywhere else.
              Those systems change without notice.
            </li>
            <li>It cannot remove a label from a post that has already been published.</li>
            <li>An unusual codec that cannot be copied safely into MP4 or WebM is rejected rather than recompressed.</li>
          </ul>

          <h2>Use it honestly</h2>
          <p>
            This tool exists for upload preparation, false-positive fixes and privacy — stripping GPS coordinates,
            device identifiers and stray edit history from files you own. It is not a way to pass synthetic media off as
            real. Where a platform&rsquo;s terms, a client agreement, a competition rule or a regulation such as the EU
            AI Act requires you to disclose AI involvement, that obligation stands regardless of what your file
            contains. Nothing here is legal advice.
          </p>
        </Prose>

        <p className="mt-8 text-[14px]">
          <Link href="/" className="text-[var(--link)] underline">
            Back to the tool
          </Link>
        </p>
      </PageShell>
    </>
  );
}
