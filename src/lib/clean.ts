/**
 * Client-side cleaning pipeline.
 *
 * Default Auto mode removes metadata sections directly from JPG, PNG and WebP
 * without recompressing their encoded image data. Formats or explicit options
 * that require pixel changes use the Canvas fallback. Optional controls can
 * nudge pixel values or write a clean camera EXIF block.
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
  quality: 1,
  resetFingerprint: false,
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

function stripJpegMetadata(bytes: Uint8Array): Uint8Array {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const parts: Uint8Array[] = [bytes.subarray(0, 2)];
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (marker === 0xda) {
      parts.push(bytes.subarray(offset));
      offset = bytes.length;
      break;
    }
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const end = offset + 2 + length;
    if (length < 2 || end > bytes.length) return bytes;
    const isComment = marker === 0xfe;
    const isMetadataApp = marker >= 0xe1 && marker <= 0xef && marker !== 0xe2 && marker !== 0xee;
    if (!isComment && !isMetadataApp) parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  return output;
}

function stripPngMetadata(bytes: Uint8Array): Uint8Array {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((byte, index) => bytes[index] === byte)) return bytes;
  const visualChunks = new Set([
    "IHDR", "PLTE", "IDAT", "IEND", "tRNS", "cHRM", "gAMA", "iCCP", "sBIT", "sRGB", "bKGD", "pHYs",
    "acTL", "fcTL", "fdAT",
  ]);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [bytes.subarray(0, 8)];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) return bytes;
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (visualChunks.has(type)) parts.push(bytes.subarray(offset, end));
    offset = end;
    if (type === "IEND") break;
  }
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  return output;
}

function stripWebpMetadata(bytes: Uint8Array): Uint8Array {
  const label = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (label(0, 4) !== "RIFF" || label(8, 12) !== "WEBP") return bytes;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [bytes.subarray(0, 12)];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = label(offset, offset + 4);
    const length = view.getUint32(offset + 4, true);
    const end = offset + 8 + length + (length % 2);
    if (end > bytes.length) return bytes;
    if (!new Set(["EXIF", "XMP ", "C2PA", "JUMB"]).has(type)) {
      const chunk = bytes.slice(offset, end);
      if (type === "VP8X" && chunk.length >= 9) chunk[8] &= ~0x0c;
      parts.push(chunk);
    }
    offset = end;
  }
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  new DataView(output.buffer).setUint32(4, output.length - 8, true);
  return output;
}

async function stripLosslessly(file: File): Promise<Blob | undefined> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type === "image/jpeg") return new Blob([Uint8Array.from(stripJpegMetadata(bytes)).buffer], { type: file.type });
  if (file.type === "image/png") return new Blob([Uint8Array.from(stripPngMetadata(bytes)).buffer], { type: file.type });
  if (file.type === "image/webp") return new Blob([Uint8Array.from(stripWebpMetadata(bytes)).buffer], { type: file.type });
}

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

export async function upscaleImageBlob(blob: Blob, mime: string, quality: number): Promise<{ blob: Blob; width: number; height: number }> {
  const source = await decode(blob as File);
  const originalWidth = "width" in source ? source.width : 0;
  const originalHeight = "height" in source ? source.height : 0;
  if (!originalWidth || !originalHeight) throw new Error("Could not decode image for upscaling.");

  const width = originalWidth * 2;
  const height = originalHeight * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser canvas blocked.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  if ("close" in source) source.close();

  const upscaledBlob = await toBlob(canvas, mime, quality);
  return { blob: upscaledBlob, width, height };
}

export async function cleanImage(file: File, options: CleanOptions): Promise<CleanResult> {
  const source = await decode(file);
  const width = "width" in source ? source.width : 0;
  const height = "height" in source ? source.height : 0;
  if (!width || !height) throw new Error("This file has no readable image data.");

  if (options.output === "auto" && !options.resetFingerprint && !options.injectCameraExif) {
    const blob = await stripLosslessly(file);
    if (blob) {
      if ("close" in source) source.close();
      return { blob, mime: file.type, extension: EXTENSIONS[file.type] ?? "jpg", width, height };
    }
  }

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
