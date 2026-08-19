import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = "AI Label Remover — remove the AI info label from your photos, free and in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 84px",
          background: "#faf7f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#737373" }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#0095f6" }} />
          {site.domain}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 78,
            lineHeight: 1.05,
            letterSpacing: -2,
            fontWeight: 700,
            color: "#111111",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Remove the AI label</span>
          <span>from your photos.</span>
        </div>
        <div style={{ marginTop: 30, fontSize: 30, lineHeight: 1.35, color: "#404040", maxWidth: 900 }}>
          Strip C2PA, XMP, EXIF and IPTC metadata that triggers “AI info” on Instagram, Facebook, TikTok and Pinterest.
        </div>
        <div style={{ marginTop: 36, display: "flex", gap: 12, fontSize: 24, color: "#262626" }}>
          {["100% in-browser", "No upload", "Free"].map((chip) => (
            <div
              key={chip}
              style={{
                border: "1px solid #dbdbdb",
                borderRadius: 999,
                padding: "10px 22px",
                background: "#ffffff",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
