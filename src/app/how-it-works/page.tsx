import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/Prose";
import { steps } from "@/lib/content";

export const metadata: Metadata = {
  title: "How AI Labels Work — C2PA, XMP & EXIF Explained",
  description:
    "A technical walkthrough of why platforms label photos as AI: which records live in a JPEG, PNG, WebP or AVIF file, which ones Instagram and TikTok read, and why re-encoding removes all of them.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageShell
        title="How it works"
        intro="AI labels are a file problem, not a picture problem. Here is exactly what sits inside your image and how cleaning removes it."
      >
        <Prose>
          <h2>The records inside an image file</h2>
          <p>
            An image file is a container. Alongside the compressed pixels it carries blocks of descriptive data that no
            viewer shows you:
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
          </ul>

          <h2>What the platforms actually read</h2>
          <p>
            Meta, TikTok and Pinterest all committed to labelling AI content, and the cheapest way to do that at scale is
            to read the records above at upload time rather than run a classifier over every image. That is why a photo
            can be labelled in under a second, and why an entirely real photograph gets labelled after one AI-assisted
            edit: the labeller sees the marker, not the picture. Creators hit this constantly with Photoshop Generative
            Fill, Lightroom AI Denoise, AI background removal and CapCut exports.
          </p>

          <h2>Why re-encoding removes everything</h2>
          <p>
            AI Label Remover does not try to find and delete individual records — that approach misses whatever it does
            not know about. Instead the image is decoded into raw pixels with the browser&rsquo;s own image decoder, and
            those pixels are encoded into a brand-new file. Metadata is not part of the pixel data, so nothing survives
            the round trip. One pass removes C2PA, XMP, EXIF, IPTC, PNG chunks, JPEG comments and anything else the
            container was carrying, including formats that did not exist when this page was written.
          </p>

          <h2>The four steps</h2>
          <ol>
            {steps.map((step) => (
              <li key={step.title} className="ml-5 list-decimal">
                <strong>{step.title}.</strong> {step.body}
              </li>
            ))}
          </ol>

          <h2>Fingerprint reset</h2>
          <p>
            Platforms also compute a perceptual hash of an upload so they can match it against copies of the same image
            seen elsewhere — which means a previously labelled file can be recognised even after cleaning. The optional
            fingerprint reset shifts a scattered subset of pixels by ±1 RGB. The change is invisible at any zoom level,
            but it is enough to move the hash outside the match threshold.
          </p>

          <h2>Placeholder camera EXIF</h2>
          <p>
            A file with no metadata at all is itself slightly unusual, since ordinary camera exports carry a basic EXIF
            block. The optional injection writes a plain, non-identifying block — make, model, software version,
            timestamp and orientation — after cleaning, so the export looks like a normal photo export. It contains no
            GPS, no serial number and nothing traceable to you. JPEG output only.
          </p>

          <h2>Privacy</h2>
          <p>
            There is no upload endpoint in this application. Files are read with the File API, drawn on a canvas and
            encoded with <code>canvas.toBlob</code>, all inside your browser tab. You can open your network panel and
            watch it stay empty, or disconnect from the internet after the page loads and clean images offline.{" "}
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
