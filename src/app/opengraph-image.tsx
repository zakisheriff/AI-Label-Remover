import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "AI Label Remover logo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse cannot decode WebP data URIs, so this PNG is a lossless format
// conversion of the exact website-logo.webp artwork used by the site.
const logoData = await readFile(join(process.cwd(), "public/website-logo-og.png"), "base64");
const logoSrc = `data:image/png;base64,${logoData}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={logoSrc} alt="" width={480} height={295} />
      </div>
    ),
    size,
  );
}
