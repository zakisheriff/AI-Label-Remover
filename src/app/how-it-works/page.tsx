import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/Prose";
import { steps } from "@/lib/content";

export const metadata: Metadata = {
  title: "How Photo & Video AI Metadata Cleaning Works",
  description:
    "A technical walkthrough of C2PA, XMP, EXIF and video container metadata, plus how lossless image cleaning and FFmpeg remuxing remove file-level records.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageShell
        title="How it works"
        intro="AI disclosures can be triggered by file-level provenance, although platforms may use other signals too. Here is what cleaning removes from photos and videos."
      >
        <Prose>
          <h2>The records inside media files</h2>
          <p>
            An image or video is a container. Alongside pixels, video frames and audio, it can carry descriptive data that
            a normal player does not show you:
          </p>
          <ul>
            <li>
              <strong>C2PA content credentials</strong> — a cryptographically signed manifest describing how the file
              was made and edited, stored in a JPEG APP11/JUMBF segment, a PNG <code>caBX</code> chunk, a WebP{" "}
              <code>C2PA</code> chunk or an ISO-BMFF box in AVIF and HEIC.
            </li>
            <li>
              <strong>XMP</strong> — an XML packet holding the generator name, prompt, seed, sampler and edit history,
              including the <code>digitalSourceType</code> field whose value <code>trainedAlgorithmicMedia</code> is a
              direct machine-readable declaration that an image was AI-generated.
            </li>
            <li>
              <strong>EXIF</strong> — camera make and model, lens, exposure, timestamps, device serial numbers, GPS
              coordinates and a Software field that frequently names the AI tool.
            </li>
            <li>
              <strong>IPTC</strong> — credit, source and attribution fields Adobe and agencies use for AI disclosure.
            </li>
            <li>
              <strong>PNG text chunks</strong> — <code>tEXt</code>, <code>iTXt</code> and <code>zTXt</code> chunks where
              Automatic1111, Forge and ComfyUI store the entire generation workflow in plain text.
            </li>
            <li>
              <strong>Video container records</strong> — MP4/MOV boxes and WebM elements can store titles, comments,
              encoder names, creation times, chapters, attached artwork and provenance manifests alongside the streams.
            </li>
          </ul>

          <h2>What the platforms actually read</h2>
          <p>
            Platforms can inspect provenance records at upload time and may combine them with invisible watermarks,
            perceptual matching, content classifiers and platform-side history. This explains why real media can receive
            a disclosure after an AI-assisted edit: a file can carry a machine-readable marker even when only a small
            part of the workflow used AI.
          </p>

          <h2>How image cleaning works</h2>
          <p>
            With the default Auto setting, JPG, PNG and WebP metadata sections are removed directly without
            recompressing the encoded picture. Dimensions, pixels and visual quality remain unchanged. AVIF and HEIC
            use a lossless PNG fallback because browsers do not expose a safe metadata-only rewrite for every variant.
          </p>

          <h2>How video cleaning works</h2>
          <p>
            A WebAssembly build of FFmpeg runs inside the browser and remuxes only the primary video and optional audio
            stream into a clean MP4 or WebM container. Stream copy means the encoded video and audio are never
            recompressed, resized or quality-reduced. Source metadata, chapters, attached thumbnails and extra streams
            are not copied. Files up to 200MB are supported.
          </p>

          <h2>The four steps</h2>
          <ol>
            {steps.map((step) => (
              <li key={step.title} className="ml-5 list-decimal">
                <strong>{step.title}.</strong> {step.body}
              </li>
            ))}
          </ol>

          <h2>Privacy</h2>
          <p>
            There is no media upload endpoint in this application. Files are read with the File API, then processed with
            Canvas or FFmpeg WebAssembly inside your browser tab. The FFmpeg runtime is downloaded from this site when
            video processing first starts, but the selected video itself is not transmitted.{" "}
            <Link href="/privacy">Read the privacy policy</Link>.
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
