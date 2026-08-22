/**
 * Client-side metadata inspection.
 *
 * Platforms such as Instagram, Facebook, TikTok and Pinterest do not look at the
 * pixels of a normal upload — they read provenance records carried *beside* the
 * pixels: C2PA content credentials, XMP `digitalSourceType`, IPTC attribution,
 * EXIF software tags and PNG text chunks. This module finds those records so the
 * UI can report exactly what a file is carrying before it is cleaned.
 */

export type MetadataKind =
  | "C2PA"
  | "XMP"
  | "EXIF"
  | "IPTC"
  | "PNG text chunk"
  | "ICC profile"
  | "GPS location"
  | "Comment"
  | "Container metadata";

export type Finding = {
  kind: MetadataKind;
  detail: string;
  /** AI provenance markers are what actually trigger a platform label. */
  aiRelated: boolean;
};

export type Report = {
  format: string;
  bytes: number;
  findings: Finding[];
  generators: string[];
};

const decoder = new TextDecoder("latin1");

function ascii(bytes: Uint8Array, start: number, len: number) {
  return decoder.decode(bytes.subarray(start, start + len));
}

function indexOfString(hay: Uint8Array, needle: string, from = 0) {
  const n = new Uint8Array(needle.length);
  for (let i = 0; i < needle.length; i++) n[i] = needle.charCodeAt(i);
  outer: for (let i = from; i <= hay.length - n.length; i++) {
    for (let j = 0; j < n.length; j++) if (hay[i + j] !== n[j]) continue outer;
    return i;
  }
  return -1;
}

/** Signatures written by the generators that most often trigger a platform label. */
const GENERATOR_SIGNATURES: Array<[string, string[]]> = [
  ["Midjourney", ["Midjourney", "midjourney"]],
  ["DALL·E / ChatGPT Image", ["DALL-E", "DALL·E", "dalle", "OpenAI", "openai.com"]],
  ["Google Gemini / Imagen", ["Gemini", "Imagen", "SynthID", "Google DeepMind", "Nano Banana"]],
  ["Adobe Firefly", ["Firefly", "Adobe Firefly"]],
  ["Photoshop Generative Fill", ["Adobe Photoshop", "Generative Fill", "generativeFill"]],
  ["Stable Diffusion", ["Stable Diffusion", "stable-diffusion", "Steps:", "CFG scale", "Sampler:"]],
  ["ComfyUI", ["ComfyUI", "comfyui", "workflow"]],
  ["Leonardo AI", ["Leonardo", "leonardo.ai"]],
  ["Ideogram", ["Ideogram", "ideogram"]],
  ["Runway ML", ["Runway", "runwayml"]],
  ["Grok / xAI", ["xAI", "Grok"]],
  ["Meta AI", ["Meta AI", "meta.ai", "Imagine with Meta"]],
  ["Canva / CapCut AI", ["CapCut", "Canva", "Magic Media"]],
  ["Generic AI provenance tag", ["trainedAlgorithmicMedia", "compositeWithTrainedAlgorithmicMedia", "GenAI", "generativeAI"]],
];

function detectGenerators(bytes: Uint8Array): string[] {
  const found = new Set<string>();
  // Provenance strings live in the first and last blocks of a file; scanning the
  // whole buffer for ~40 needles is wasteful on a 15MB image.
  const head = bytes.subarray(0, Math.min(bytes.length, 512 * 1024));
  const tail = bytes.subarray(Math.max(0, bytes.length - 256 * 1024));
  for (const [name, needles] of GENERATOR_SIGNATURES) {
    for (const needle of needles) {
      if (indexOfString(head, needle) !== -1 || indexOfString(tail, needle) !== -1) {
        found.add(name);
        break;
      }
    }
  }
  return [...found];
}

function scanJpeg(bytes: Uint8Array, findings: Finding[]) {
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break; // start of scan — pixels from here
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const payload = offset + 4;
    const header = ascii(bytes, payload, Math.min(40, length));

    if (marker === 0xe1 && header.startsWith("Exif")) {
      findings.push({ kind: "EXIF", detail: "APP1 Exif block (camera, software, timestamps)", aiRelated: false });
      const seg = bytes.subarray(payload, payload + length);
      if (indexOfString(seg, "\x25\x88") !== -1 || hasGpsIfd(seg)) {
        findings.push({ kind: "GPS location", detail: "GPS IFD present in EXIF", aiRelated: false });
      }
    } else if (marker === 0xe1 && header.includes("ns.adobe.com/xap")) {
      findings.push({ kind: "XMP", detail: "APP1 XMP packet (generator tags, prompts, edit history)", aiRelated: true });
    } else if (marker === 0xeb || (marker === 0xe2 && header.includes("JUMBF"))) {
      findings.push({ kind: "C2PA", detail: "JUMBF / C2PA content credentials", aiRelated: true });
    } else if (marker === 0xed && header.includes("Photoshop 3.0")) {
      findings.push({ kind: "IPTC", detail: "Photoshop IRB / IPTC attribution block", aiRelated: true });
    } else if (marker === 0xe2 && header.includes("ICC_PROFILE")) {
      findings.push({ kind: "ICC profile", detail: "Embedded colour profile", aiRelated: false });
    } else if (marker === 0xfe) {
      findings.push({ kind: "Comment", detail: "JPEG COM comment segment", aiRelated: false });
    }
    offset = payload + length - 2;
  }
}

function hasGpsIfd(seg: Uint8Array) {
  // Tag 0x8825 (GPS IFD pointer) in either endianness.
  for (let i = 0; i < seg.length - 1; i++) {
    if ((seg[i] === 0x88 && seg[i + 1] === 0x25) || (seg[i] === 0x25 && seg[i + 1] === 0x88)) return true;
  }
  return false;
}

function scanPng(bytes: Uint8Array, findings: Finding[]) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    if (type === "IEND") break;
    const data = offset + 8;

    if (type === "tEXt" || type === "iTXt" || type === "zTXt") {
      const keyword = ascii(bytes, data, Math.min(79, length)).split("\0")[0];
      if (keyword === "XML:com.adobe.xmp") {
        findings.push({ kind: "XMP", detail: "iTXt XMP packet (generator tags, prompts)", aiRelated: true });
      } else {
        findings.push({
          kind: "PNG text chunk",
          detail: `${type} chunk “${keyword || "untitled"}” (generation parameters)`,
          aiRelated: true,
        });
      }
    } else if (type === "eXIf") {
      findings.push({ kind: "EXIF", detail: "eXIf chunk", aiRelated: false });
    } else if (type === "caBX") {
      findings.push({ kind: "C2PA", detail: "caBX chunk — C2PA content credentials", aiRelated: true });
    } else if (type === "iCCP") {
      findings.push({ kind: "ICC profile", detail: "Embedded colour profile", aiRelated: false });
    }
    offset = data + length + 4;
  }
}

function scanWebp(bytes: Uint8Array, findings: Finding[]) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    if (type === "EXIF") findings.push({ kind: "EXIF", detail: "EXIF chunk", aiRelated: false });
    if (type === "XMP ") findings.push({ kind: "XMP", detail: "XMP chunk (generator tags)", aiRelated: true });
    if (type === "ICCP") findings.push({ kind: "ICC profile", detail: "Embedded colour profile", aiRelated: false });
    if (type === "C2PA") findings.push({ kind: "C2PA", detail: "C2PA content credentials", aiRelated: true });
    offset += 8 + length + (length % 2);
  }
}

/** ISO-BMFF containers (AVIF/HEIC) — box walking is overkill, look for the boxes by name. */
function scanIsobmff(bytes: Uint8Array, findings: Finding[]) {
  if (indexOfString(bytes, "jumb") !== -1 || indexOfString(bytes, "c2pa") !== -1) {
    findings.push({ kind: "C2PA", detail: "JUMBF / C2PA box", aiRelated: true });
  }
  if (indexOfString(bytes, "ns.adobe.com/xap") !== -1) {
    findings.push({ kind: "XMP", detail: "XMP box (generator tags)", aiRelated: true });
  }
  if (indexOfString(bytes, "Exif") !== -1) {
    findings.push({ kind: "EXIF", detail: "Exif box", aiRelated: false });
  }
}

function scanVideoContainer(bytes: Uint8Array, format: string, findings: Finding[]) {
  const head = bytes.subarray(0, Math.min(bytes.length, 1024 * 1024));
  const tail = bytes.subarray(Math.max(0, bytes.length - 2 * 1024 * 1024));
  const has = (tag: string) => indexOfString(head, tag) !== -1 || indexOfString(tail, tag) !== -1;
  if (format === "MP4" || format === "MOV") {
    if (has("jumb") || has("c2pa")) {
      findings.push({ kind: "C2PA", detail: "JUMBF / C2PA provenance box", aiRelated: true });
    }
    if (has("ns.adobe.com/xap")) {
      findings.push({ kind: "XMP", detail: "XMP provenance box", aiRelated: true });
    }
    if (["meta", "udta", "ilst", "mdta", "©too"].some(has)) {
      findings.push({
        kind: "Container metadata",
        detail: "MP4/MOV metadata boxes (such as encoder, creation or descriptive tags)",
        aiRelated: false,
      });
    }
  } else if (format === "WEBM") {
    if (["ENCODER", "TITLE", "COMMENT", "DATE_", "TagName"].some(has)) {
      findings.push({
        kind: "Container metadata",
        detail: "WebM tags (such as encoder, title, comment or date)",
        aiRelated: false,
      });
    }
    if (has("c2pa") || has("jumb")) {
      findings.push({ kind: "C2PA", detail: "C2PA provenance record", aiRelated: true });
    }
    if (has("ns.adobe.com/xap")) {
      findings.push({ kind: "XMP", detail: "XMP provenance packet", aiRelated: true });
    }
  }
}

export function detectFormat(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "JPEG";
  if (ascii(bytes, 1, 3) === "PNG") return "PNG";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return "WEBP";
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "WEBM";
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand.startsWith("avi")) return "AVIF";
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) return "HEIC";
    return brand === "qt  " ? "MOV" : "MP4";
  }
  if (ascii(bytes, 0, 3) === "GIF") return "GIF";
  return "UNKNOWN";
}

export function inspect(buffer: ArrayBuffer): Report {
  const bytes = new Uint8Array(buffer);
  const format = detectFormat(bytes);
  const findings: Finding[] = [];

  try {
    if (format === "JPEG") scanJpeg(bytes, findings);
    else if (format === "PNG") scanPng(bytes, findings);
    else if (format === "WEBP") scanWebp(bytes, findings);
    else if (format === "AVIF" || format === "HEIC") scanIsobmff(bytes, findings);
    else if (format === "MP4" || format === "MOV" || format === "WEBM") scanVideoContainer(bytes, format, findings);
  } catch {
    // A malformed container should never block cleaning — re-encoding drops
    // everything regardless of what the scanner managed to parse.
  }

  const seen = new Set<string>();
  const unique = findings.filter((f) => {
    const key = `${f.kind}|${f.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { format, bytes: bytes.length, findings: unique, generators: detectGenerators(bytes) };
}
