/**
 * Client-side cleaning pipeline.
 *
 * Decoding an image to pixels and re-encoding it produces a brand new file that
 * carries nothing but the picture: every APP segment, PNG chunk, XMP packet and
 * C2PA manifest is left behind because none of it survives a decode. Optionally
 * we also nudge pixel values (which changes the perceptual hash a platform can
 * use to match the file against an earlier copy) and write a clean camera EXIF
 * block so the export looks like an ordinary photo export.
 */

export type OutputFormat = "auto" | "jpeg" | "png" | "webp";

export type CleanOptions = {
  output: OutputFormat;
  quality: number;
  /** Apply ±1 RGB dither so the file's perceptual fingerprint no longer matches the original. */
  resetFingerprint: boolean;
  /** Write placeholder camera EXIF after cleaning (JPEG output only). */
  injectCameraExif: boolean;
};

export const DEFAULT_OPTIONS: CleanOptions = {
  output: "auto",
  quality: 0.92,
  resetFingerprint: true,
  injectCameraExif: false,
};

export type CleanResult = {
  blob: Blob;
  mime: string;
  extension: string;
  width: number;
  height: number;
};

function resolveMime(sourceType: string, output: OutputFormat): string {
  if (output === "jpeg") return "image/jpeg";
  if (output === "png") return "image/png";
  if (output === "webp") return "image/webp";
  // Auto: keep the format where it round-trips cleanly, and fall back to a
  // format the browser can definitely encode for everything else.
  if (sourceType === "image/png") return "image/png";
  if (sourceType === "image/webp") return "image/webp";
  if (sourceType === "image/avif") return "image/png";
  return "image/jpeg";
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Safari refuses some HEIC/AVIF sources here — fall through to <img>.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("This file could not be decoded by your browser."));
      img.src = url;
    });
  } finally {
    // The bitmap is already painted to the canvas by the time this runs.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

function ditherPixels(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  // Every 7th pixel keeps the change invisible while still moving the hash.
  for (let i = 0; i < data.length; i += 28) {
    const delta = (i % 56 === 0 ? 1 : -1);
    data[i] = Math.min(255, Math.max(0, data[i] + delta));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] - delta));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + delta));
  }
  ctx.putImageData(image, 0, 0);
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed in this browser."))),
      mime,
      mime === "image/png" ? undefined : quality,
    );
  });
}

export async function cleanImage(file: File, options: CleanOptions): Promise<CleanResult> {
  const source = await decode(file);
  const width = "width" in source ? source.width : 0;
  const height = "height" in source ? source.height : 0;
  if (!width || !height) throw new Error("This file has no readable image data.");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: options.resetFingerprint });
  if (!ctx) throw new Error("Your browser blocked canvas rendering.");

  const mime = resolveMime(file.type, options.output);
  if (mime === "image/jpeg") {
    // JPEG has no alpha channel — paint white first so transparency does not go black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  if ("close" in source) source.close();

  if (options.resetFingerprint) ditherPixels(ctx, width, height);

  let blob = await toBlob(canvas, mime, options.quality);

  if (options.injectCameraExif && mime === "image/jpeg") {
    blob = new Blob([await injectExif(await blob.arrayBuffer(), file.lastModified)], { type: mime });
  }

  return { blob, mime, extension: EXTENSIONS[mime] ?? "jpg", width, height };
}

/* ------------------------------------------------------------------ *
 * Placeholder camera EXIF
 * ------------------------------------------------------------------ */

const CAMERA = { make: "Apple", model: "iPhone 15 Pro", software: "17.5.1" };

function exifDate(timestamp: number) {
  const d = new Date(Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`;
}

/** Build a minimal little-endian TIFF/Exif APP1 segment and splice it after SOI. */
async function injectExif(jpeg: ArrayBuffer, lastModified: number): Promise<ArrayBuffer> {
  const strings: Array<[number, string]> = [
    [0x010f, CAMERA.make],
    [0x0110, CAMERA.model],
    [0x0131, CAMERA.software],
    [0x0132, exifDate(lastModified)],
  ];
  const entryCount = strings.length + 1; // + orientation
  const ifdSize = 2 + entryCount * 12 + 4;
  const dataChunks = strings.map(([, value]) => new TextEncoder().encode(value + "\0"));
  const dataSize = dataChunks.reduce((sum, c) => sum + c.length, 0);

  const tiff = new Uint8Array(8 + ifdSize + dataSize);
  const view = new DataView(tiff.buffer);
  tiff[0] = 0x49;
  tiff[1] = 0x49; // "II" little-endian
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, entryCount, true);

  let entry = 10;
  let dataOffset = 8 + ifdSize;
  strings.forEach(([tag], index) => {
    const chunk = dataChunks[index];
    view.setUint16(entry, tag, true);
    view.setUint16(entry + 2, 2, true); // ASCII
    view.setUint32(entry + 4, chunk.length, true);
    if (chunk.length <= 4) {
      tiff.set(chunk, entry + 8);
    } else {
      view.setUint32(entry + 8, dataOffset, true);
      tiff.set(chunk, dataOffset);
      dataOffset += chunk.length;
    }
    entry += 12;
  });

  // Orientation = 1 (normal), stored inline.
  view.setUint16(entry, 0x0112, true);
  view.setUint16(entry + 2, 3, true); // SHORT
  view.setUint32(entry + 4, 1, true);
  view.setUint16(entry + 8, 1, true);
  entry += 12;
  view.setUint32(entry, 0, true); // no IFD1

  const prefix = new TextEncoder().encode("Exif\0\0");
  const segmentLength = 2 + prefix.length + tiff.length;
  const segment = new Uint8Array(2 + segmentLength);
  segment[0] = 0xff;
  segment[1] = 0xe1;
  new DataView(segment.buffer).setUint16(2, segmentLength);
  segment.set(prefix, 4);
  segment.set(tiff, 4 + prefix.length);

  const original = new Uint8Array(jpeg);
  const out = new Uint8Array(original.length + segment.length);
  out.set(original.subarray(0, 2), 0); // SOI
  out.set(segment, 2);
  out.set(original.subarray(2), 2 + segment.length);
  return out.buffer as ArrayBuffer;
}
