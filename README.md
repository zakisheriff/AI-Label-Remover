# AI Label Remover

Free, browser-only tool that removes the metadata which makes Instagram, Facebook, TikTok and
Pinterest attach an “AI info” / “Made with AI” label to a photo.

**Live:** https://ailabelremover.theatom.lk — an [Atom](https://theatom.lk) original.

## How it works

Platforms do not classify every uploaded picture; they read provenance records carried inside the
file — C2PA content credentials, XMP generator tags (`digitalSourceType`, prompts, seeds), IPTC
attribution, EXIF software fields, and PNG `tEXt` / `iTXt` / `zTXt` chunks. AI Label Remover decodes
the image to raw pixels in the browser and re-encodes it, so none of those records survive.

- `src/lib/metadata.ts` — parses JPEG segments, PNG chunks, WebP RIFF chunks and ISO-BMFF boxes to
  report exactly what a file carries, and names the generator that wrote it.
- `src/lib/clean.ts` — the decode → canvas → re-encode pipeline, optional ±1 RGB fingerprint reset
  and optional placeholder camera EXIF (a hand-built little-endian TIFF APP1 segment).
- `src/lib/zip.ts` — store-only ZIP writer for batch downloads, no dependency.

Nothing is uploaded: there is no upload endpoint, and the CSP restricts `connect-src` to `self`.

## Limits

Pixel watermarks such as Google SynthID are not metadata and are not removed. Visual AI classifiers
are unaffected. A label already applied to a published post cannot be lifted from the file.

## Development

```bash
npm install
npm run dev
npm run build
```

## SEO / AEO / GEO

Metadata, canonicals, OpenGraph and Twitter cards live in `src/app/layout.tsx`, with `WebApplication`,
`HowTo`, `FAQPage`, `WebSite` and `Organization` JSON-LD. `robots.ts` explicitly admits answer-engine
crawlers, and `public/llms.txt` gives them a compact, quotable summary of the tool and its limits.
