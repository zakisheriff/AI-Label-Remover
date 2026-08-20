import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { blogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
    ["", 1, "weekly"],
    ["/how-it-works", 0.9, "monthly"],
    ["/faq", 0.9, "monthly"],
    ["/blog", 0.8, "weekly"],
    ...blogPosts.map(
      (post) =>
        [`/blog/${post.slug}`, 0.8, "monthly"] as [
          string,
          number,
          MetadataRoute.Sitemap[number]["changeFrequency"]
        ]
    ),
    ["/privacy", 0.4, "yearly"],
    ["/disclaimer", 0.4, "yearly"],
  ];

  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
