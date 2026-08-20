import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/Prose";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "AI Label & Metadata Guides — AI Label Remover Blog",
  description:
    "Read our guides on how AI labels work on social media platforms like Instagram and TikTok, why Lightroom trigger tags, and how to safely clean your metadata.",
  alternates: { canonical: "/blog" },
};

export default function BlogListingPage() {
  return (
    <PageShell
      title="Guides & Insights"
      intro="Learn more about social media AI labeling systems, image metadata, and how to keep your photography authentic."
    >
      <div className="mt-8 space-y-10">
        {blogPosts.map((post) => (
          <article key={post.slug} className="group border-b border-[var(--border)] pb-8 last:border-b-0">
            <span className="text-[12px] font-semibold text-[var(--muted)] uppercase tracking-wider">
              {post.publishedAt} · By {post.author}
            </span>
            <h2 className="mt-2 text-[20px] font-semibold leading-[28px] tracking-[-0.01em] hover:text-[var(--accent)] transition-colors">
              <Link href={`/blog/${post.slug}`} className="hover:opacity-85">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2.5 text-[14px] leading-[22px] text-[var(--muted)]">
              {post.description}
            </p>
            <div className="mt-4">
              <Link
                href={`/blog/${post.slug}`}
                className="text-[13px] font-semibold text-[var(--link)] hover:underline"
              >
                Read article
              </Link>
            </div>
          </article>
        ))}
      </div>
      
      <p className="mt-12 text-[14px]">
        <Link href="/" className="text-[var(--link)] underline">
          Back to the tool
        </Link>
      </p>
    </PageShell>
  );
}
