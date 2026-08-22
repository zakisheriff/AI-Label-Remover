<div align="center">
<img src="public/website-logo.webp" alt="AI Label Remover" width="360" />
</div>

<br />

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Side-22C55E?style=for-the-badge&logo=shield&logoColor=white)

<br />

<a href="https://ailabelremover.theatom.lk">
<img src="https://img.shields.io/badge/View%20Live%20Demo-Click%20Here-0071e3?style=for-the-badge&logo=safari&logoColor=white" height="50" alt="View the live AI Label Remover website" />
</a>

<br />
<br />

**[Visit Live Site: https://ailabelremover.theatom.lk](https://ailabelremover.theatom.lk)**

</div>

<br />

> **"Your media should stay on your device."**
>
> AI Label Remover is a free photo and video metadata cleaner for files you own.
> It strips metadata and losslessly remuxes videos entirely inside your browser—without uploading, storing or recompressing your media.

---

## 🌟 Vision

AI Label Remover's mission is to be:

- **A completely free media privacy tool** — no accounts, subscriptions, or paywalls
- **An ad-free utility** — no advertising blocks, trial counter, or login prompt before download
- **A browser-only metadata cleaner** — lossless image stripping and FFmpeg video remuxing happen locally
- **A transparent utility** — it reports what was found, what was removed, and what metadata cleaning cannot do

---

## ✨ Why AI Label Remover?

Social platforms may read provenance records embedded inside photos and videos when applying labels such as **“AI info,” “Made with AI,” “AI-generated,”** or a **GenAI badge**.
AI-assisted edits can leave markers on real media, while ordinary metadata may expose GPS coordinates, device details, timestamps, prompts, seeds, encoder names, and edit history.

AI Label Remover cleans common image formats and remuxes videos without copying source metadata or recompressing the encoded media.
It supports photos and videos in one focused workflow, re-inspects cleaned files, and names verified AI provenance removals instead of showing the same generic result for every file.

---

## 🎨 Clean, Responsive Design

- **Focused Workflow**
  A simple drag-and-drop interface keeps the tool easy to use on desktop and mobile.

- **Responsive Layout**
  The interface adapts from a split-screen desktop presentation to a compact mobile flow.

- **Light and Dark Themes**
  System-aware colors provide a comfortable experience in either appearance mode.

- **Accessible Interaction**
  Keyboard-enabled file selection, clear statuses, reduced-motion support, and readable feedback improve usability.

---

## 🧠 Metadata Intelligence

- **Container-Level Inspection**
  Parses JPEG segments, PNG chunks, WebP RIFF chunks, and AVIF/HEIC ISO-BMFF markers directly in the browser.

- **AI Provenance Detection**
  Identifies C2PA content credentials, XMP generator data, IPTC attribution, EXIF software fields, and PNG generation parameters.

- **Generator Signatures**
  Recognizes metadata associated with tools such as Midjourney, DALL·E, ChatGPT Image, Gemini, Imagen, Firefly, Stable Diffusion, ComfyUI, Leonardo AI, Ideogram, Runway, Grok, Meta AI, Canva, and CapCut.

- **Detailed Results**
  Shows the source format, file size, output format, dimensions, detected metadata, and generator signatures for each image.

- **Lossless Video Cleaning**
  Stream-copies MP4, MOV, M4V and WebM video/audio locally into a clean container without source metadata, chapters, thumbnails or extra streams.

---

## 🔐 Privacy-First Security

- **100% Client-Side Processing**
  Inspection, metadata stripping, video remuxing and downloading happen in browser memory.

- **No Upload Endpoint**
  Media files are never sent to the application server or a third party.

- **Restrictive Content Security Policy**
  Production headers restrict network connections and limit which resources the page can load.

- **No Accounts or File Tracking**
  The application requires no registration and does not store processed media.

- **No Ads or Trial Counter**
  Cleaning and downloads remain available without advertising, attempt limits, or an account prompt.

---

## 🖼️ Photo and Video Cleaning

- **Multi-Format Input**
  Accepts JPG, PNG, WebP, AVIF, HEIC, and HEIF images supported by the browser.

- **Batch Processing**
  Queues up to 30 mixed files. Images are limited to 15MB each; videos to 200MB each.

- **Video Input and Output**
  Accepts MP4, MOV, M4V and WebM; MP4-family inputs export as MP4 and WebM remains WebM, with no media recompression.

- **Automatic Lossless Output**
  Preserves JPG, PNG and WebP encoding automatically, with a lossless PNG fallback for AVIF and HEIC.

- **Individual or ZIP Downloads**
  Downloads files separately or packages completed batches into a ZIP archive.

---

## 📁 Project Structure

```text
ai-label-remover/
├── public/                         # Static images and crawler-readable content
│   ├── ai.txt                      # AI crawler usage policy
│   ├── llms.txt                    # Answer-engine summary
│   ├── hero-collage-2.webp         # Homepage artwork
│   ├── website-logo.webp           # Primary site logo
│   └── icon-192.png                # PWA and app icons
│
├── src/
│   ├── app/                        # Next.js App Router pages and metadata
│   │   ├── page.tsx                # Main tool and educational landing page
│   │   ├── layout.tsx              # Global metadata and structured data
│   │   ├── globals.css             # Tailwind theme and global styles
│   │   ├── how-it-works/page.tsx   # Technical explanation
│   │   ├── faq/page.tsx            # Frequently asked questions
│   │   ├── privacy/page.tsx        # Privacy policy
│   │   ├── disclaimer/page.tsx     # Capabilities, limits, and responsible use
│   │   ├── manifest.ts             # Web app manifest
│   │   ├── robots.ts               # Search and answer-engine crawler rules
│   │   └── sitemap.ts              # Generated sitemap
│   │
│   ├── components/
│   │   ├── Cleaner.tsx             # Upload, processing, and downloads
│   │   └── Prose.tsx               # Shared content-page layout
│   │
│   └── lib/
│       ├── clean.ts                # Lossless metadata stripping and format fallback pipeline
│       ├── video.ts                # FFmpeg WebAssembly lossless remuxing pipeline
│       ├── metadata.ts             # Metadata parser and generator detection
│       ├── zip.ts                  # Dependency-free batch ZIP writer
│       ├── content.ts              # FAQ, feature, and workflow content
│       └── site.ts                 # Site identity, limits, and SEO keywords
│
├── next.config.ts                  # Next.js and security-header configuration
├── package.json                    # Scripts and dependencies
├── postcss.config.mjs              # Tailwind CSS PostCSS configuration
└── tsconfig.json                   # TypeScript configuration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v20+ recommended)
- **npm**
- **A modern browser** with Canvas, File API and WebAssembly support

### 1. Clone the Repository

```bash
git clone https://github.com/zakisheriff/AI-Label-Remover.git
cd AI-Label-Remover
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

### 4. Create a Production Build

```bash
npm run build
npm run start
```

No environment variables, database, API keys, or external services are required.

---

## 🎯 Key Features

### For Creators

✅ **Drag-and-Drop Cleaning** — Drop files anywhere on the page<br />
✅ **Batch Support** — Queue up to 30 photos and videos in one session<br />
✅ **Metadata Report** — See which records and generator signatures were detected<br />
✅ **Automatic Output** — Preserve the source format wherever lossless cleaning is supported<br />
✅ **Lossless Defaults** — Preserve common image formats and all video/audio encoding without recompression<br />
✅ **ZIP Downloads** — Download a completed batch in one archive<br />
✅ **Lossless Video Remuxing** — Clean MP4, MOV, M4V and WebM without recompression<br />
✅ **Private Processing** — Keep every media file on your own device

### For Privacy-Conscious Users

✅ **C2PA Removal** — Strips embedded content credentials<br />
✅ **XMP Removal** — Removes prompts, seeds, generator names, and edit history<br />
✅ **EXIF and GPS Removal** — Removes camera, software, timestamp, and location data<br />
✅ **IPTC Removal** — Removes embedded attribution and source fields<br />
✅ **PNG Chunk Removal** — Removes `tEXt`, `iTXt`, and `zTXt` records<br />
✅ **No Accounts** — No email address, password, cookies, or payment details required

---

## 🔧 Tech Stack

### Application

- **Next.js 16** — App Router, metadata, image optimization, and server-rendered content
- **React 19** — Interactive cleaning workflow and file-state management
- **TypeScript 5** — Typed application and metadata parsing logic
- **Tailwind CSS 4** — Responsive styling and theme utilities
- **GSAP 3** — Modal and accordion transitions
- **FFmpeg WebAssembly** — Browser-local, lossless video and audio stream copying

### Browser APIs

- **File API** — Reads local media into browser memory
- **Canvas API** — Decodes pixels and creates clean exports
- **ImageBitmap API** — Efficient image decoding where supported
- **Blob and Object URLs** — Generates downloadable files without server storage
- **DataView and Typed Arrays** — Parses binary image containers and writes EXIF/ZIP data

---

## 📊 Cleaning Pipelines

Images follow four stages:

- **Inspect** — Parse the image container and report embedded metadata
- **Decode** — Convert the source into raw pixels using browser image APIs
- **Clean** — Strip JPG, PNG and WebP metadata losslessly, with a Canvas fallback for other formats
- **Download** — Return the cleaned copy directly from browser memory

Videos are read by FFmpeg WebAssembly, mapped to the primary video and optional audio streams, and copied into a clean MP4 or WebM without re-encoding. Source metadata, chapters, thumbnails and extra streams are not copied.

The tool removes file-level metadata. It cannot guarantee removal of content-embedded watermarks, alter classifier results, remove labels from already-published posts, or guarantee how a third-party platform will treat an upload.

---

## 🔒 Security Features

✅ **Client-Side Processing** — Photos and videos stay in local browser memory<br />
✅ **No Upload Endpoint** — The application has no server route for receiving files<br />
✅ **Content Security Policy** — Restricts scripts, connections, forms, and framing<br />
✅ **Security Headers** — Includes `nosniff`, referrer, framing, and permissions policies<br />
✅ **No Media Storage** — Object URLs are local and revoked after use<br />
✅ **No Authentication Secrets** — No accounts, tokens, API keys, or database credentials

---

## 📜 Page Documentation

### Main Pages

- `/` — Photo and video cleaner, metadata education, workflow, and common questions
- `/how-it-works` — Technical explanation of lossless image stripping and video remuxing
- `/faq` — Detailed answers about privacy, quality, formats, platforms, and limits
- `/blog` — AI metadata, privacy, and product-comparison guides
- `/blog/free-ad-free-ai-label-remover-for-photos-and-videos` — Free, ad-free photo-and-video workflow
- `/privacy` — Media-processing and data-handling policy
- `/disclaimer` — Supported use, limitations, and disclosure responsibilities

### Discovery Files

- `/manifest.webmanifest` — Installable web app metadata
- `/robots.txt` — Search and answer-engine crawler rules
- `/sitemap.xml` — Public page index
- `/llms.txt` — Concise machine-readable product summary
- `/ai.txt` — AI crawler usage and attribution guidance

---

## 🌐 Deployment

### Next.js Hosting

1. Install dependencies with `npm install`
2. Create a production build with `npm run build`
3. Start the Node.js server with `npm run start`
4. Point the production domain to the deployed application

The project can be deployed to any platform that supports a Next.js Node.js runtime. `npm install` copies the self-hosted FFmpeg core into `public/ffmpeg` before the build. No database, persistent storage or server-side media-processing service is required.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a Pull Request.

When contributing, keep media processing client-side, preserve the privacy guarantees, and verify changes with:

```bash
npm run lint
npm run build
```

---

## 📄 License

No open-source license file is currently included in this repository. All rights are reserved by the project owner unless a license is added later.

---

## ☕️ Support the Project

If AI Label Remover helped protect your media privacy or troubleshoot an incorrect metadata trigger:

- Consider buying me a coffee
- It supports continued development and future free tools

<div align="center">
<a href="https://buymeacoffee.com/theoneatom">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="60" width="217" alt="Buy me a coffee" />
</a>
</div>

---

<p align="center">
Made by <strong>Zaki Sheriff</strong> at <a href="https://theatom.lk">The Atom</a>
</p>

<p align="center">
<em>Free and private—because your media should stay yours.</em>
</p>
