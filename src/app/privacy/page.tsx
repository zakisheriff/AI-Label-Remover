import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Nothing Leaves Your Browser",
  description:
    "AI Label Remover processes every image locally in your browser. No uploads, no accounts, no image storage and no tracking of the files you clean.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageShell title="Privacy policy" intro="Short version: your images never leave your device, because there is nowhere for them to go.">
        <Prose>
          <h2>Images</h2>
          <p>
            Every image you drop into this site is read into the memory of your own browser tab, decoded, re-encoded and
            offered back to you as a download. No image data is transmitted to {site.domain} or to any third party, no
            copy is stored, and closing the tab discards everything. The application contains no upload endpoint at all.
          </p>

          <h2>Accounts</h2>
          <p>There are none. No sign-up, no email address, no password, no payment details.</p>

          <h2>Analytics and cookies</h2>
          <p>
            This site sets no cookies and runs no advertising or fingerprinting scripts. If privacy-preserving,
            aggregate traffic analytics are added in future, they will count page views only and will never receive
            information about the files you process.
          </p>

          <h2>Hosting logs</h2>
          <p>
            Like any website, the host serving these pages records standard request logs — IP address, timestamp,
            requested path and user agent — for security and abuse prevention. These logs concern page requests only;
            your images are never part of a request.
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
