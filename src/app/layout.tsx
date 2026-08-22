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
const isVercelDeployment = process.env.VERCEL === "1";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "AI Label Remover for Photos & Videos — Free Metadata Cleaner",
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
    title: "AI Label Remover for Photos & Videos — Free Metadata Cleaner",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Label Remover for Photos & Videos — Free Metadata Cleaner",
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
      browserRequirements: "Requires JavaScript, WebAssembly and a modern browser",
      description: site.description,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Removes C2PA content credentials",
        "Removes XMP AI generator tags and prompts",
        "Removes EXIF, GPS and IPTC metadata",
        "Removes PNG tEXt, iTXt and zTXt chunks",
        "Losslessly remuxes MP4, MOV, M4V and WebM without recompressing video or audio",
        "Removes video container metadata, chapters and attached thumbnails",
        "No quality controls or technical setup required",
        "Images up to 15MB and videos up to 200MB, 100% in-browser",
      ],
      publisher: { "@id": `${site.url}/#organization` },
    },
    {
      "@type": "HowTo",
      "@id": `${site.url}/#howto`,
      name: "How to clean AI metadata from a photo or video before uploading",
      totalTime: "PT1M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
      tool: [{ "@type": "HowToTool", name: "A web browser" }],
      step: [
        { "@type": "HowToStep", position: 1, name: "Drop your media", text: "Drag a supported image, MP4, MOV, M4V or WebM file into the tool. It is read into browser memory and never uploaded." },
        { "@type": "HowToStep", position: 2, name: "Review or track processing", text: "Images show detected metadata; videos show local remuxing progress." },
        { "@type": "HowToStep", position: 3, name: "Clean the file", text: "Image metadata is stripped without recompression where supported. Video and audio streams are copied into a clean container without re-encoding." },
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
        {isVercelDeployment && <Analytics />}
      </body>
    </html>
  );
}
