import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell, Prose } from "@/components/Prose";
import { blogPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.publishedAtISO,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAtISO,
    dateModified: post.publishedAtISO,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: site.publisher, url: site.publisherUrl },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <PageShell
      title={post.title}
      intro={`${post.publishedAt} · By ${post.author}`}
    >
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </Prose>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }} />
      
      <div className="mt-12 flex gap-4 text-[14px]">
        <Link href="/blog" className="text-[var(--link)] underline">
          All guides
        </Link>
        <span className="text-[var(--border)]">|</span>
        <Link href="/" className="text-[var(--link)] underline">
          Go to the tool
        </Link>
      </div>
    </PageShell>
  );
}
