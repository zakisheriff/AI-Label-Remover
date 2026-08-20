import type { Metadata } from "next";
import Link from "next/link";
import { Cleaner } from "@/components/Cleaner";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FooterLinks } from "@/components/FooterLinks";
import { faqs, removedItems, steps } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Label Remover — Remove the “AI Info” Label From Photos, Free",
  description: site.description,
  alternates: { canonical: "/" },
};

const platforms = [
  { name: "Instagram", label: "“AI info” or “AI content”" },
  { name: "Facebook", label: "“AI info” or “Made with AI”" },
  { name: "TikTok", label: "“AI-generated”" },
  { name: "Pinterest", label: "GenAI badge" },
];

export default function HomePage() {
  return (
    <main>
      <Cleaner />

      {/* ---------------- SEO / AEO content ---------------- */}
      <div className="mx-auto w-full max-w-[720px] px-6 pb-16">
        <section className="border-t border-[var(--border)] pt-12">
          <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em]">
            Why does Instagram say “AI info” on my photo?
          </h2>
          <p className="mt-3 text-[15px] leading-[26px]">
            Because of what is written <em>inside the file</em>, not what is in the picture. When an image passes through
            an AI tool — Midjourney, DALL·E, Gemini, Firefly, Stable Diffusion, or even a single Generative Fill stroke
            in Photoshop — that tool writes provenance records into the file: a signed C2PA manifest, an XMP packet
            naming the generator, IPTC attribution fields, and on PNG a text chunk holding your full prompt and seed.
            Meta, TikTok and Pinterest read those records on upload and attach a label automatically.
          </p>
          <p className="mt-3 text-[15px] leading-[26px]">
            That is why real photography gets labelled too. AI Denoise in Lightroom, an AI background removal, an AI sky
            replacement or a CapCut export all leave the same markers behind, and the automatic labeller cannot tell a
            one-click cleanup from a fully synthetic image. Removing the metadata removes the trigger.
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {platforms.map((platform) => (
              <li key={platform.name} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-[13px] font-semibold">{platform.name}</p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">{platform.label}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-14">
          <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em]">What gets removed</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {removedItems.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
                <h3 className="text-[14px] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-[13px] leading-[20px] text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-14">
          <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em]">
            How to remove an AI label, step by step
          </h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[13px] font-semibold">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-1 text-[14px] leading-[22px] text-[var(--muted)]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px] leading-[24px] text-[var(--muted)]">
            Want the technical detail — segment by segment, chunk by chunk?{" "}
            <Link href="/how-it-works" className="text-[var(--link)] underline">
              Read how it works
            </Link>{" "}
            or browse our{" "}
            <Link href="/blog" className="text-[var(--link)] underline">
              metadata guides
            </Link>
            .
          </p>
        </section>

        <section className="pt-14">
          <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em]">Frequently asked questions</h2>
          <FaqAccordion items={faqs.slice(0, 8)} />
          <p className="mt-5 text-[14px]">
            <Link href="/faq" className="text-[var(--link)] underline">
              All {faqs.length} questions
            </Link>
          </p>
        </section>

        <section className="pt-14">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-[15px] font-semibold">What this tool cannot do</h2>
            <p className="mt-2 text-[13px] leading-[21px] text-[var(--muted)]">
              It cannot remove an invisible pixel watermark such as Google&rsquo;s SynthID, it cannot change how a visual
              AI classifier reads your picture, and it cannot lift a label from a post that is already published. It also
              does not replace disclosure where a platform&rsquo;s terms or a law such as the EU AI Act require it. <FooterLinks />
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
