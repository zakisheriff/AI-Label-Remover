import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Nothing Leaves Your Browser",
  description:
    "AI Label Remover processes every photo and video locally in your browser. No media uploads, no accounts, no file storage and no tracking of the files you clean.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageShell title="Privacy policy" intro="Short version: your photos and videos never leave your device, because there is no media upload endpoint.">
        <Prose>
          <h2>Photos and videos</h2>
          <p>
            Every media file you drop into this site is read into the memory of your own browser tab, cleaned locally
            and offered back as a download. Default cleaning preserves encoded media quality without recompression. No
            photo or video data is transmitted to {site.domain} or to a third party,
            no copy is stored, and closing the tab discards the browser-memory copy.
          </p>
          <p>
            Video cleaning uses an FFmpeg WebAssembly engine served by this website. Your browser downloads that program
            when it is needed; the selected video is processed locally and is not included in that request.
          </p>

          <h2>Accounts</h2>
          <p>There are none. No sign-up, no email address, no password, no payment details.</p>

          <h2>Analytics and cookies</h2>
          <p>
            This site uses Vercel Web Analytics to measure aggregate page visits and navigation. It does not use cookies,
            advertising or fingerprinting scripts, and it never receives information about the files you process.
          </p>

          <h2>Hosting logs</h2>
          <p>
            Like any website, the host serving these pages records standard request logs — IP address, timestamp,
            requested path and user agent — for security and abuse prevention. These logs concern page requests only;
            your media files are never part of a request.
          </p>

          <h2>Your rights</h2>
          <p>
            Because no personal data about you is collected or stored, there is nothing to export, correct or delete.
            For any question, contact <a href={`mailto:${site.email}`}>{site.email}</a>.
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
