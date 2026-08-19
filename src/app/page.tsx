import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cleaner } from "@/components/Cleaner";
import { faqs, removedItems, steps } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Label Remover — Remove the “AI Info” Label From Photos, Free",
  description: site.description,
  alternates: { canonical: "/" },
};

const platforms = [
  { name: "Instagram", label: "“AI info”" },
  { name: "Facebook", label: "“Made with AI”" },
  { name: "TikTok", label: "“AI-generated”" },
  { name: "Pinterest", label: "GenAI badge" },
];

export default function HomePage() {
  return (
    <main>
      {/* Instagram's login layout: showcase on the left, the form column on the
          right behind a full-height hairline divider. The form is the tool. */}
      <section className="relative flex min-h-[100svh] flex-col lg:flex-row">
        {/* Logo sits top-left of the split on desktop, above the tool on phones. */}
        <div className="order-1 px-6 pt-8 lg:absolute lg:left-14 lg:top-10 lg:z-10 lg:px-0 lg:pt-0">
          <Image
            src="/website-logo.webp"
            alt={site.name}
            width={800}
            height={490}
            priority
            style={{ height: "56px", width: "auto" }}
            className="dark:invert"
          />
        </div>

        <div className="order-3 flex flex-1 flex-col px-6 pb-10 pt-4 lg:order-1 lg:border-r lg:border-[var(--border)] lg:px-14 lg:pt-28">
          <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col justify-center">
            <h1 className="mt-8 text-center text-[34px] font-normal leading-[42px] tracking-[-0.02em] sm:text-[44px] sm:leading-[52px]">
              Post your photos without the{" "}
              <span className="bg-[linear-gradient(90deg,#f9704f,#f0356f,#b83bff)] bg-clip-text font-medium text-transparent">
                AI label
              </span>
              .
            </h1>

            <Image
              src="/hero-collage.webp"
              alt="Instagram posts published without an AI label"
              width={1632}
              height={1310}
              priority
              className="mt-6 h-auto w-full max-w-[520px] self-center"
            />
          </div>
        </div>

        <div className="order-2 flex w-full items-center justify-center px-6 pb-4 pt-6 lg:order-2 lg:w-[38%] lg:min-w-[420px] lg:px-10 lg:pb-0 lg:pt-0">
          <div className="w-full max-w-[400px]">
            <Cleaner />
          </div>
        </div>
      </section>

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
              <li key={platform.name} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3">
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
              <div key={item.title} className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
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
            </Link>
            .
          </p>
        </section>

        <section className="pt-14">
          <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.01em]">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {faqs.slice(0, 8).map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                  {faq.q}
                  <span className="text-[var(--muted)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2.5 text-[14px] leading-[23px] text-[var(--muted)]">{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-5 text-[14px]">
            <Link href="/faq" className="text-[var(--link)] underline">
              All {faqs.length} questions →
            </Link>
          </p>
        </section>

        <section className="pt-14">
          <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-[15px] font-semibold">What this tool cannot do</h2>
            <p className="mt-2 text-[13px] leading-[21px] text-[var(--muted)]">
              It cannot remove an invisible pixel watermark such as Google&rsquo;s SynthID, it cannot change how a visual
              AI classifier reads your picture, and it cannot lift a label from a post that is already published. It also
              does not replace disclosure where a platform&rsquo;s terms or a law such as the EU AI Act require it. Full
              detail on the{" "}
              <Link href="/disclaimer" className="text-[var(--link)] underline">
                disclaimer page
              </Link>
              , and on{" "}
              <Link href="/privacy" className="text-[var(--link)] underline">
                privacy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
