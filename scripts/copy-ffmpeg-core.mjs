import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = resolve(root, "public/ffmpeg");

await mkdir(destination, { recursive: true });
await Promise.all(
  [
    ["node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js", "ffmpeg-core.js"],
    ["node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm", "ffmpeg-core.wasm"],
    ["node_modules/@ffmpeg/ffmpeg/dist/umd/ffmpeg.js", "ffmpeg.js"],
    ["node_modules/@ffmpeg/ffmpeg/dist/umd/814.ffmpeg.js", "814.ffmpeg.js"],
    ["node_modules/@ffmpeg/ffmpeg/dist/umd/ffmpeg.js.map", "ffmpeg.js.map"],
    ["node_modules/@ffmpeg/ffmpeg/dist/umd/814.ffmpeg.js.map", "814.ffmpeg.js.map"],
  ].map(([source, file]) => copyFile(resolve(root, source), resolve(destination, file))),
);
