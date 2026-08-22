import type { Metadata } from "next";
import Link from "next/link";
import { Cleaner } from "@/components/Cleaner";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FooterLinks } from "@/components/FooterLinks";
import { faqs, removedItems, steps } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free AI Label Remover for Photos & Videos — No Login",
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
            Why does a platform add an AI label to my photo or video?
          </h2>
          <p className="mt-3 text-[15px] leading-[26px]">
            One possible trigger is what is written <em>inside the file</em>, not only what appears on screen. When media passes through
            an AI tool — Midjourney, DALL·E, Gemini, Firefly, Stable Diffusion, or even a single Generative Fill stroke
            in Photoshop — the tool may write provenance records into the file: a signed C2PA manifest, an XMP packet
            naming the generator, IPTC attribution fields, or container metadata. Platforms may read those records on upload.
          </p>
          <p className="mt-3 text-[15px] leading-[26px]">
            That is why real photography gets labelled too. AI Denoise in Lightroom, an AI background removal, an AI sky
            replacement or a CapCut export all leave the same markers behind, and the automatic labeller cannot tell a
            one-click cleanup from fully synthetic media. Cleaning removes file-level metadata triggers, but platforms may
            also use watermarks, classifiers and their own records.
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
          <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em]">
            A free, ad-free AI label remover for photos and videos
          </h2>
          <p className="mt-3 text-[15px] leading-[26px]">
            No login, trial counter, subscription or advertising wall stands between you and the download. The focused
            interface handles images and videos in the same queue, shows which AI marker was detected, and inspects the
            cleaned result again before reporting that a marker was removed.
          </p>
          <p className="mt-3 text-[15px] leading-[26px]">
            Processing happens in your browser tab. Your media is never posted to an application upload endpoint, stored
            in an account or handed to an advertising network. You get lossless cleaning where the format permits it,
            including video stream copying that avoids quality-reducing recompression.
          </p>
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
            How to clean AI metadata, step by step
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
              It cannot remove an invisible watermark embedded in image pixels, video frames or audio, it cannot change how a
              classifier reads the content, and it cannot lift a label from a post that is already published. It also
              does not replace disclosure where a platform&rsquo;s terms or a law such as the EU AI Act require it. <FooterLinks />
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
