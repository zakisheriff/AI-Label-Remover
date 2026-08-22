import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/Prose";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "AI Label Remover FAQ — Instagram “AI Info”, C2PA & Metadata Answers",
  description:
    "Answers about lossless photo and video AI metadata cleaning, C2PA and XMP, browser-local FFmpeg remuxing, privacy, supported formats and platform-label limitations.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <PageShell
        title="Frequently asked questions"
        intro="Everything about AI labels, provenance metadata and what this tool does with your files."
      >
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {faqs.map((faq) => (
            <article key={faq.q} className="py-5">
              <h2 className="text-[16px] font-semibold leading-[24px]">{faq.q}</h2>
              <p className="mt-2 text-[14px] leading-[23px] text-[var(--muted)]">{faq.a}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-[14px]">
          <Link href="/" className="text-[var(--link)] underline">
            Back to the tool
          </Link>
        </p>
      </PageShell>
    </>
  );
}
