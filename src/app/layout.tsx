import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import { faqs } from "@/lib/content";
import { TryNowButton } from "@/components/TryNowButton";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "AI Label Remover — Remove the “AI Info” Label From Photos, Free",
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.publisher, url: site.publisherUrl }],
  creator: site.publisher,
  publisher: site.publisher,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    locale: site.locale,
    title: "AI Label Remover — Remove the “AI Info” Label From Photos, Free",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Label Remover — Remove the “AI Info” Label From Photos, Free",
    description: site.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: {
    icon: [{ url: "/website-logo.png", type: "image/png" }],
    apple: [{ url: "/website-logo.png" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Structured data drives both classic rich results and answer engines: the
 * WebApplication node states what the tool is and that it costs nothing, the
 * FAQPage node hands over quotable answers, and HowTo describes the workflow.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.publisher,
      url: site.publisherUrl,
      logo: { "@type": "ImageObject", url: `${site.url}/website-logo.png` },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "WebApplication",
      "@id": `${site.url}/#app`,
      name: site.name,
      url: site.url,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any browser — Chrome, Safari, Firefox, Edge",
      browserRequirements: "Requires JavaScript and HTML5 Canvas",
      description: site.description,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Removes C2PA content credentials",
        "Removes XMP AI generator tags and prompts",
        "Removes EXIF, GPS and IPTC metadata",
        "Removes PNG tEXt, iTXt and zTXt chunks",
        "Optional perceptual fingerprint reset",
        "Optional placeholder camera EXIF",
        "Batch of up to 30 images, 100% in-browser",
      ],
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "HowTo",
      "@id": `${site.url}/#howto`,
      name: "How to remove the AI label from a photo before uploading",
      totalTime: "PT1M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
      tool: [{ "@type": "HowToTool", name: "A web browser" }],
      step: [
        { "@type": "HowToStep", position: 1, name: "Drop your image", text: "Drag a JPG, PNG, WebP, AVIF or HEIC file into the tool. It is read into browser memory and never uploaded." },
        { "@type": "HowToStep", position: 2, name: "Review what was found", text: "The tool lists the C2PA, XMP, EXIF, IPTC and PNG-chunk records inside the file and names the AI generator that wrote them." },
        { "@type": "HowToStep", position: 3, name: "Clean the file", text: "The image is decoded to pixels and re-encoded, which leaves every metadata record behind in one pass." },
        { "@type": "HowToStep", position: 4, name: "Download and post", text: "Download the cleaned copy and upload that file instead of the original." },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${site.url}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TryNowButton />
        {children}
        <Script id="structured-data" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(structuredData)}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
